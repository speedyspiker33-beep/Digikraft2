const express = require('express')
const router = express.Router()
const { db, dbFind, dbFindOne, dbUpdate, dbRemove } = require('../db/database')
const { adminMiddleware } = require('../middleware/auth')

// GET /api/v1/customers — admin
router.get('/', adminMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 200, search, status, role, is_affiliate } = req.query
    let query = {}
    if (status) query.status = status
    if (role) query.role = role
    if (search) {
      const re = new RegExp(search, 'i')
      query.$or = [{ name: re }, { email: re }, { phone: re }]
    }

    let customers = await dbFind(db.customers, query, { created_at: -1 })
    
    // Enrich with affiliate data
    const affiliates = await dbFind(db.affiliates)
    const affiliateMap = {}
    affiliates.forEach(a => { affiliateMap[a.user_id] = a })
    
    let enriched = customers.map(({ password_hash, ...c }) => ({
      ...c,
      affiliate: affiliateMap[c.id] || null
    }))
    
    // Filter by affiliate status if requested
    if (is_affiliate === 'true') enriched = enriched.filter(c => c.affiliate)
    if (is_affiliate === 'false') enriched = enriched.filter(c => !c.affiliate)

    const total = enriched.length
    const offset = (parseInt(page) - 1) * parseInt(limit)
    const paginated = enriched.slice(offset, offset + parseInt(limit))

    res.json({ success: true, data: { customers: paginated, pagination: { page: parseInt(page), limit: parseInt(limit), total } } })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/v1/customers/:id — admin (full CRM profile)
router.get('/:id', adminMiddleware, async (req, res) => {
  try {
    const customer = await dbFindOne(db.customers, { id: parseInt(req.params.id) })
    if (!customer) return res.status(404).json({ success: false, error: 'Customer not found' })

    // Fetch all related data in parallel
    const [orders, affiliate, reviews, downloads, coupons] = await Promise.all([
      dbFind(db.orders, { customer_id: customer.id }, { created_at: -1 }),
      dbFindOne(db.affiliates, { user_id: customer.id }),
      dbFind(db.reviews, { customer_id: customer.id }, { created_at: -1 }).catch(() => []),
      dbFind(db.downloads, { customer_id: customer.id }, { created_at: -1 }).catch(() => []),
      dbFind(db.coupons, {}).catch(() => [])
    ])

    // Get affiliate conversions if affiliate exists
    let affConversions = []
    if (affiliate) {
      affConversions = await dbFind(db.affiliate_conversions, { affiliate_id: affiliate.id }, { created_at: -1 }).catch(() => [])
    }

    // Calculate stats
    const paidOrders = orders.filter(o => o.payment_status === 'paid')
    const totalSpent = paidOrders.reduce((s, o) => s + (o.total || 0), 0)
    const avgOrderValue = paidOrders.length ? Math.round(totalSpent / paidOrders.length) : 0

    // Find coupons assigned to this customer
    const personalCoupons = coupons.filter(c =>
      c.customer_id === customer.id ||
      (Array.isArray(c.customer_ids) && c.customer_ids.includes(customer.id))
    )

    // Cart items stored on customer record (synced from frontend)
    const cartItems = customer.cart_items || []

    // Wishlist stored on customer record (synced from frontend)
    const wishlist = customer.wishlist || []

    const { password_hash, ...safe } = customer
    res.json({
      success: true,
      data: {
        ...safe,
        // Purchase history
        orders: orders.slice(0, 20),
        // Stats
        stats: {
          total_orders: orders.length,
          paid_orders: paidOrders.length,
          total_spent: totalSpent,
          avg_order_value: avgOrderValue,
          total_downloads: downloads.length,
          total_reviews: reviews.length
        },
        // Affiliate
        affiliate: affiliate || null,
        affiliate_conversions: affConversions.slice(0, 10),
        // Reviews
        reviews: reviews.slice(0, 5),
        // Downloads
        downloads: downloads.slice(0, 10),
        // Personal coupons
        personal_coupons: personalCoupons,
        // Cart & Wishlist (synced from frontend localStorage)
        cart_items: cartItems,
        wishlist: wishlist
      }
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// PUT /api/v1/customers/:id — admin
router.put('/:id', adminMiddleware, async (req, res) => {
  try {
    const { name, phone, city, role, status, tags, notes, cart_items, wishlist } = req.body
    const updates = {}
    if (name !== undefined) updates.name = name
    if (phone !== undefined) updates.phone = phone
    if (city !== undefined) updates.city = city
    if (role !== undefined) updates.role = role
    if (status !== undefined) updates.status = status
    if (tags !== undefined) updates.tags = tags
    if (notes !== undefined) updates.notes = notes
    if (cart_items !== undefined) updates.cart_items = cart_items
    if (wishlist !== undefined) updates.wishlist = wishlist
    updates.updated_at = new Date()

    await dbUpdate(db.customers, { id: parseInt(req.params.id) }, { $set: updates })
    const customer = await dbFindOne(db.customers, { id: parseInt(req.params.id) })
    const { password_hash, ...safe } = customer
    res.json({ success: true, data: safe })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/v1/customers/:id/coupon — issue personal coupon to customer
router.post('/:id/coupon', adminMiddleware, async (req, res) => {
  try {
    const { dbInsert, getNextId } = require('../db/database')
    const customerId = parseInt(req.params.id)
    const customer = await dbFindOne(db.customers, { id: customerId })
    if (!customer) return res.status(404).json({ success: false, error: 'Customer not found' })

    const { discount_type = 'percent', discount_value, expires_at, note } = req.body
    if (!discount_value) return res.status(400).json({ success: false, error: 'discount_value required' })

    // Generate unique coupon code
    const code = `PERSONAL${customerId}${Math.random().toString(36).substring(2,6).toUpperCase()}`
    const id = await getNextId(db.coupons)

    const coupon = await dbInsert(db.coupons, {
      id,
      code,
      discount_type,
      discount_value: parseFloat(discount_value),
      min_order: 0,
      max_uses: 1,
      used_count: 0,
      customer_id: customerId,
      customer_email: customer.email,
      note: note || `Personal coupon for ${customer.name}`,
      status: 'active',
      expires_at: expires_at || null,
      created_at: new Date()
    })

    res.status(201).json({ success: true, data: coupon, message: `Coupon ${code} created for ${customer.name}` })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// DELETE /api/v1/customers/:id — admin (soft delete)
router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    await dbUpdate(db.customers, { id: parseInt(req.params.id) }, { $set: { status: 'deleted' } })
    res.json({ success: true, message: 'Customer deactivated' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router
