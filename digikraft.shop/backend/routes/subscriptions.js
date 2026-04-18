const express = require('express')
const router = express.Router()
const { db, dbFind, dbFindOne, dbInsert, dbUpdate, dbRemove, dbCount, getNextId } = require('../db/database')
const { adminMiddleware } = require('../middleware/auth')

// GET /api/v1/subscriptions
router.get('/', adminMiddleware, async (req, res) => {
  try {
    const { status, page = 1, limit = 50, search } = req.query
    let subs = await dbFind(db.subscriptions, {}, { created_at: -1 })

    const now = Date.now()

    // Auto-mark expired
    for (const s of subs) {
      if (s.duration !== 'lifetime' && s.expires_at && new Date(s.expires_at) <= now && s.status === 'active') {
        await dbUpdate(db.subscriptions, { _id: s._id }, { $set: { status: 'expired' } })
        s.status = 'expired'
      }
    }

    if (status === 'active') subs = subs.filter(s => s.status === 'active' && (s.duration === 'lifetime' || new Date(s.expires_at) > now))
    else if (status === 'expired') subs = subs.filter(s => s.status === 'expired' || (s.duration !== 'lifetime' && new Date(s.expires_at) <= now))
    else if (status === 'expiring') subs = subs.filter(s => { const d = new Date(s.expires_at) - now; return d > 0 && d < 7 * 86400000 })
    else if (status === 'lifetime') subs = subs.filter(s => s.duration === 'lifetime')
    else if (status) subs = subs.filter(s => s.status === status)

    if (search) {
      const re = new RegExp(search, 'i')
      subs = subs.filter(s => re.test(s.customer_name) || re.test(s.customer_email) || re.test(s.license_key) || re.test(s.product_name))
    }

    const total = subs.length
    const offset = (parseInt(page) - 1) * parseInt(limit)
    subs = subs.slice(offset, offset + parseInt(limit))

    const allSubs = await dbFind(db.subscriptions)
    const activeCount = allSubs.filter(s => s.status === 'active' && (s.duration === 'lifetime' || new Date(s.expires_at) > now)).length
    const expiringCount = allSubs.filter(s => { const d = new Date(s.expires_at) - now; return d > 0 && d < 7 * 86400000 }).length

    res.json({
      success: true,
      data: subs,
      meta: { total, activeCount, expiringCount },
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/v1/subscriptions/:id
router.get('/:id', adminMiddleware, async (req, res) => {
  try {
    const sub = await dbFindOne(db.subscriptions, { _id: req.params.id })
    if (!sub) return res.status(404).json({ success: false, error: 'Subscription not found' })
    res.json({ success: true, data: sub })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/v1/subscriptions
router.post('/', adminMiddleware, async (req, res) => {
  try {
    const {
      customer_name, customer_phone, customer_email, order_id,
      product_name, product_type, vendor_id, vendor_name,
      license_key, panel_url, panel_user, panel_pass,
      duration, started_at, expires_at, amount_paid, vendor_cost, notes
    } = req.body

    if (!customer_name || !product_name) {
      return res.status(400).json({ success: false, error: 'customer_name and product_name required' })
    }

    const sub = await dbInsert(db.subscriptions, {
      customer_name, customer_phone: customer_phone || '',
      customer_email: customer_email || '', order_id: order_id || '',
      product_name, product_type: product_type || 'Software License',
      vendor_id: vendor_id || null, vendor_name: vendor_name || 'Self',
      license_key: license_key || '', panel_url: panel_url || '',
      panel_user: panel_user || '', panel_pass: panel_pass || '',
      duration: duration || '1 month',
      started_at: started_at || new Date().toISOString().slice(0, 10),
      expires_at: expires_at || null,
      amount_paid: parseFloat(amount_paid) || 0,
      vendor_cost: parseFloat(vendor_cost) || 0,
      notes: notes || '',
      status: 'active',
      created_at: new Date()
    })

    res.status(201).json({ success: true, data: sub })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// PUT /api/v1/subscriptions/:id
router.put('/:id', adminMiddleware, async (req, res) => {
  try {
    const updates = { ...req.body, updated_at: new Date() }
    await dbUpdate(db.subscriptions, { _id: req.params.id }, { $set: updates })
    const sub = await dbFindOne(db.subscriptions, { _id: req.params.id })
    res.json({ success: true, data: sub })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// DELETE /api/v1/subscriptions/:id
router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    await dbRemove(db.subscriptions, { _id: req.params.id })
    res.json({ success: true, message: 'Subscription deleted' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router
