const express = require('express')
const router = express.Router()
const { db, dbFindOne, dbUpdate, dbInsert } = require('../db/database')

// POST /webhook/order-created
router.post('/order-created', async (req, res) => {
  try {
    const { orderId, orderNumber, customerEmail, total } = req.body
    console.log(`[Webhook] Order created: ${orderNumber} - ₹${total}`)

    await dbInsert(db.workflow_logs, {
      workflow_id: 'wf-2', workflow_name: 'Send Order Confirmation Email',
      trigger: 'Order Placed', status: 'success',
      details: { orderId, orderNumber, customerEmail, total },
      created_at: new Date()
    })

    await dbInsert(db.notifications, {
      type: 'order_created', title: 'New Order',
      message: `Order ${orderNumber} placed by ${customerEmail}`,
      data: { orderId, orderNumber }, read: false, created_at: new Date()
    })

    res.json({ success: true, message: 'Order webhook processed' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /webhook/payment-success
router.post('/payment-success', async (req, res) => {
  try {
    const { orderId, paymentId, amount } = req.body
    console.log(`[Webhook] Payment success: Order ${orderId}`)

    if (orderId) {
      await dbUpdate(db.orders, { id: parseInt(orderId) }, {
        $set: { payment_status: 'paid', payment_id: paymentId, status: 'processing', updated_at: new Date() }
      })
    }

    await dbInsert(db.workflow_logs, {
      workflow_id: 'wf-1', workflow_name: 'Auto-Assign Order to Vendor',
      trigger: 'Order Placed', status: 'success',
      details: { orderId, paymentId, amount }, created_at: new Date()
    })

    res.json({ success: true, message: 'Payment webhook processed' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /webhook/vendor-delivered
router.post('/vendor-delivered', async (req, res) => {
  try {
    const { orderId } = req.body
    if (orderId) {
      await dbUpdate(db.orders, { id: parseInt(orderId) }, {
        $set: { status: 'completed', updated_at: new Date() }
      })
    }
    res.json({ success: true, message: 'Delivery webhook processed' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /webhook/product-upload
router.post('/product-upload', async (req, res) => {
  try {
    const { products } = req.body
    console.log(`[Webhook] Product sync: ${products?.length || 0} products`)
    await dbInsert(db.workflow_logs, {
      workflow_id: 'wf-6', workflow_name: 'Auto-Publish Strapi Products',
      trigger: 'n8n Webhook', status: 'success',
      details: { count: products?.length || 0 }, created_at: new Date()
    })
    res.json({ success: true, message: 'Product upload webhook processed' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /webhook/strapi-sync
router.post('/strapi-sync', async (req, res) => {
  try {
    const fetch = require('node-fetch')
    const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337'
    const token = process.env.STRAPI_API_TOKEN

    const response = await fetch(`${strapiUrl}/api/products?populate=*`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })

    if (!response.ok) throw new Error('Strapi not available')

    const result = await response.json()
    const products = result.data || []
    let synced = 0

    const { getNextId } = require('../db/database')
    for (const p of products) {
      const attrs = p.attributes || p
      const slug = attrs.slug || (attrs.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')
      const existing = await dbFindOne(db.products, { slug })
      if (!existing) {
        const id = await getNextId(db.products)
        await dbInsert(db.products, {
          id, title: attrs.title || attrs.name, slug,
          description: attrs.description || '',
          price: parseFloat(attrs.price) || 0,
          sale_price: attrs.salePrice ? parseFloat(attrs.salePrice) : null,
          image: attrs.image?.data?.attributes?.url ? `${strapiUrl}${attrs.image.data.attributes.url}` : '',
          images: [], tags: [], featured: false, show_on_main: true,
          status: 'published', category_ids: [], downloads: 0, rating: 4.5,
          created_at: new Date(), updated_at: new Date()
        })
        synced++
      }
    }

    await dbInsert(db.workflow_logs, {
      workflow_id: 'wf-6', workflow_name: 'Auto-Publish Strapi Products',
      trigger: 'Manual Sync', status: 'success',
      details: { total: products.length, synced }, created_at: new Date()
    })

    res.json({ success: true, message: `Synced ${synced} new products from Strapi`, synced, total: products.length })
  } catch (err) {
    res.status(500).json({ success: false, error: `Strapi sync failed: ${err.message}` })
  }
})

module.exports = router
