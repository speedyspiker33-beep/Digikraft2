const express = require('express')
const router = express.Router()
const { db, dbFind, dbFindOne, dbInsert, dbUpdate, dbRemove, getNextId } = require('../db/database')
const { adminMiddleware } = require('../middleware/auth')

// GET /api/v1/vendors
router.get('/', adminMiddleware, async (req, res) => {
  try {
    const { status, search } = req.query
    let vendors = await dbFind(db.vendors, {}, { created_at: -1 })

    if (status) vendors = vendors.filter(v => v.status === status)
    if (search) {
      const re = new RegExp(search, 'i')
      vendors = vendors.filter(v => re.test(v.name) || re.test(v.email) || re.test(v.phone))
    }

    res.json({ success: true, data: vendors })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/v1/vendors/:id
router.get('/:id', adminMiddleware, async (req, res) => {
  try {
    const vendor = await dbFindOne(db.vendors, { _id: req.params.id })
    if (!vendor) return res.status(404).json({ success: false, error: 'Vendor not found' })
    res.json({ success: true, data: vendor })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/v1/vendors
router.post('/', adminMiddleware, async (req, res) => {
  try {
    const { name, email, phone, whatsapp, categories, commission_rate, panel_url, notes, status } = req.body
    if (!name) return res.status(400).json({ success: false, error: 'Vendor name required' })

    const vendor = await dbInsert(db.vendors, {
      name,
      email: email || '',
      phone: phone || '',
      whatsapp: whatsapp || phone || '',
      categories: categories || [],
      commission_rate: parseFloat(commission_rate) || 0,
      panel_url: panel_url || '',
      notes: notes || '',
      status: status || 'active',
      total_orders: 0,
      total_revenue: 0,
      created_at: new Date()
    })

    res.status(201).json({ success: true, data: vendor })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// PUT /api/v1/vendors/:id
router.put('/:id', adminMiddleware, async (req, res) => {
  try {
    const updates = { ...req.body, updated_at: new Date() }
    await dbUpdate(db.vendors, { _id: req.params.id }, { $set: updates })
    const vendor = await dbFindOne(db.vendors, { _id: req.params.id })
    res.json({ success: true, data: vendor })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// DELETE /api/v1/vendors/:id
router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    await dbRemove(db.vendors, { _id: req.params.id })
    res.json({ success: true, message: 'Vendor deleted' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router
