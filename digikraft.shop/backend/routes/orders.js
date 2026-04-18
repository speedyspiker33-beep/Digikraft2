const express = require('express')
const router = express.Router()
const { db, dbFind, dbFindOne, dbInsert, dbUpdate, dbCount, getNextId } = require('../db/database')
const { authMiddleware, adminMiddleware } = require('../middleware/auth')
const { v4: uuidv4 } = require('uuid')

function generateOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase()
  return `ORD-${date}-${rand}`
}

// GET /api/v1/orders
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query
    const isAdmin = req.user.role === 'admin'

    let query = {}
    if (!isAdmin) query.customer_id = req.user.id
    if (status) query.status = status

    let orders = await dbFind(db.orders, query, { created_at: -1 })
    const total = orders.length
    const offset = (parseInt(page) - 1) * parseInt(limit)
    orders = orders.slice(offset, offset + parseInt(limit))

    res.json({ success: true, data: { orders, pagination: { page: parseInt(page), limit: parseInt(limit), total } } })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/v1/orders/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const order = await dbFindOne(db.orders, { $or: [{ id: parseInt(id) || 0 }, { order_number: id }] })
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' })
    if (req.user.role !== 'admin' && order.customer_id !== req.user.id) return res.status(403).json({ success: false, error: 'Access denied' })
    res.json({ success: true, data: order })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/v1/orders
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { items, billing_address, payment_method, coupon_code } = req.body
    if (!items || !items.length) return res.status(400).json({ success: false, error: 'No items in order' })

    let subtotal = 0
    const orderItems = []

    for (const item of items) {
      const product = await dbFindOne(db.products, { id: parseInt(item.productId || item.product_id) })
      if (!product) throw new Error(`Product ${item.productId} not found`)
      const price = product.sale_price || product.price
      subtotal += price * (item.quantity || 1)
      orderItems.push({
        productId: product.id,
        productName: product.title,
        productSlug: product.slug,
        productImage: product.image,
        quantity: item.quantity || 1,
        price,
        license: product.license
      })
    }

    // Apply coupon
    let discount = 0
    if (coupon_code) {
      const coupon = await dbFindOne(db.coupons, { code: coupon_code.toUpperCase(), status: 'active' })
      if (coupon && subtotal >= (coupon.min_purchase || 0)) {
        discount = coupon.discount_type === 'percentage'
          ? subtotal * (coupon.discount_value / 100)
          : coupon.discount_value
        await dbUpdate(db.coupons, { _id: coupon._id }, { $inc: { used_count: 1 } })
      }
    }

    const tax = (subtotal - discount) * 0.1
    const total = subtotal - discount + tax
    const orderNumber = generateOrderNumber()
    const customer = await dbFindOne(db.customers, { id: req.user.id })

    const id = await getNextId(db.orders)
    const order = await dbInsert(db.orders, {
      id,
      order_number: orderNumber,
      customer_id: req.user.id,
      customer_email: req.user.email,
      customer_name: customer?.name || '',
      items: orderItems,
      subtotal, tax, discount, total,
      coupon_code: coupon_code || null,
      status: 'pending',
      payment_status: 'pending',
      payment_method: payment_method || 'stripe',
      billing_address: billing_address || {},
      created_at: new Date(),
      updated_at: new Date()
    })

    // Update customer stats
    await dbUpdate(db.customers, { id: req.user.id }, { $inc: { total_orders: 1, total_spent: total } })

    // Create download entries
    for (const item of orderItems) {
      await dbInsert(db.downloads, {
        id: uuidv4(),
        customer_id: req.user.id,
        product_id: item.productId,
        order_id: id,
        download_count: 0,
        created_at: new Date()
      })
    }

    // Notification
    await dbInsert(db.notifications, {
      type: 'new_order',
      title: 'New Order Received',
      message: `Order ${orderNumber} - ₹${total.toFixed(2)}`,
      data: { orderId: id, orderNumber },
      read: false,
      created_at: new Date()
    })

    res.status(201).json({ success: true, data: order })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// PUT /api/v1/orders/:id — admin
router.put('/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { status, payment_status, notes } = req.body
    const updates = { updated_at: new Date() }
    if (status) updates.status = status
    if (payment_status) updates.payment_status = payment_status
    if (notes) updates.notes = notes

    await dbUpdate(db.orders, { id: parseInt(id) }, { $set: updates })
    const order = await dbFindOne(db.orders, { id: parseInt(id) })
    res.json({ success: true, data: order })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router
