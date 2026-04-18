const express = require('express')
const router = express.Router()
const { db, dbFind, dbFindOne, dbInsert, dbUpdate, dbRemove, getNextId } = require('../db/database')
const { adminMiddleware, authMiddleware } = require('../middleware/auth')

// GET /api/v1/coupons — admin
router.get('/', adminMiddleware, async (req, res) => {
  try {
    const coupons = await dbFind(db.coupons, {}, { created_at: -1 })
    res.json({ success: true, data: coupons })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/v1/coupons/validate
router.post('/validate', authMiddleware, async (req, res) => {
  try {
    const { code, subtotal } = req.body
    if (!code) return res.status(400).json({ success: false, error: 'Coupon code required' })

    const coupon = await dbFindOne(db.coupons, { code: code.toUpperCase(), status: 'active' })
    if (!coupon) return res.status(404).json({ success: false, error: 'Invalid or expired coupon' })

    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
      return res.status(400).json({ success: false, error: 'Coupon has expired' })
    }
    if (coupon.max_uses > 0 && coupon.used_count >= coupon.max_uses) {
      return res.status(400).json({ success: false, error: 'Coupon usage limit reached' })
    }
    if (subtotal && subtotal < (coupon.min_purchase || 0)) {
      return res.status(400).json({ success: false, error: `Minimum purchase of ₹${coupon.min_purchase} required` })
    }

    const discount = coupon.discount_type === 'percentage'
      ? (subtotal || 0) * (coupon.discount_value / 100)
      : coupon.discount_value

    res.json({ success: true, data: { coupon, discount } })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/v1/coupons — admin
router.post('/', adminMiddleware, async (req, res) => {
  try {
    const { code, description, discount_type, discount_value, min_purchase, max_uses, expiry_date, status } = req.body
    if (!code || !discount_value) return res.status(400).json({ success: false, error: 'Code and discount value required' })

    const existing = await dbFindOne(db.coupons, { code: code.toUpperCase() })
    if (existing) return res.status(400).json({ success: false, error: 'Coupon code already exists' })

    const id = await getNextId(db.coupons)
    const coupon = await dbInsert(db.coupons, {
      id, code: code.toUpperCase(), description: description || '',
      discount_type: discount_type || 'percentage',
      discount_value: parseFloat(discount_value),
      min_purchase: parseFloat(min_purchase) || 0,
      max_uses: parseInt(max_uses) || 0,
      used_count: 0,
      expiry_date: expiry_date || null,
      status: status || 'active',
      created_at: new Date()
    })
    res.status(201).json({ success: true, data: coupon })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// PUT /api/v1/coupons/:id — admin
router.put('/:id', adminMiddleware, async (req, res) => {
  try {
    await dbUpdate(db.coupons, { id: parseInt(req.params.id) }, { $set: req.body })
    const coupon = await dbFindOne(db.coupons, { id: parseInt(req.params.id) })
    res.json({ success: true, data: coupon })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// DELETE /api/v1/coupons/:id — admin
router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    await dbRemove(db.coupons, { id: parseInt(req.params.id) })
    res.json({ success: true, message: 'Coupon deleted' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router
