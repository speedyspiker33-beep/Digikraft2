const express = require('express')
const router = express.Router()
const { db, dbFind, dbFindOne, dbInsert, dbUpdate, dbRemove, dbCount } = require('../db/database')
const { adminMiddleware } = require('../middleware/auth')

// GET /api/v1/licenses
router.get('/', adminMiddleware, async (req, res) => {
  try {
    const { status, program, page = 1, limit = 100 } = req.query
    let query = {}
    if (status) query.status = status
    if (program) query.program = program

    let licenses = await dbFind(db.licenses, query, { created_at: -1 })
    const total = licenses.length
    const offset = (parseInt(page) - 1) * parseInt(limit)
    licenses = licenses.slice(offset, offset + parseInt(limit))

    const poolCount = await dbCount(db.licenses, { status: 'available' })
    const issuedCount = await dbCount(db.licenses, { status: 'issued' })

    res.json({ success: true, data: licenses, meta: { total, poolCount, issuedCount } })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/v1/licenses — add to pool
router.post('/', adminMiddleware, async (req, res) => {
  try {
    const { keys, program } = req.body
    if (!keys || !Array.isArray(keys) || !keys.length) {
      return res.status(400).json({ success: false, error: 'keys array required' })
    }

    const inserted = []
    for (const key of keys) {
      const existing = await dbFindOne(db.licenses, { key })
      if (!existing) {
        const doc = await dbInsert(db.licenses, {
          key,
          program: program || 'standard',
          status: 'available',
          created_at: new Date()
        })
        inserted.push(doc)
      }
    }

    res.status(201).json({ success: true, data: inserted, added: inserted.length })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/v1/licenses/issue — issue a key to a customer
router.post('/issue', adminMiddleware, async (req, res) => {
  try {
    const { key, customer_id, customer_name, product_name, program } = req.body
    if (!key) return res.status(400).json({ success: false, error: 'key required' })

    const existing = await dbFindOne(db.licenses, { key })
    if (existing) {
      await dbUpdate(db.licenses, { key }, {
        $set: {
          status: 'issued',
          customer_id: customer_id || null,
          customer_name: customer_name || '',
          product_name: product_name || '',
          issued_at: new Date(),
          updated_at: new Date()
        }
      })
    } else {
      await dbInsert(db.licenses, {
        key,
        program: program || 'standard',
        status: 'issued',
        customer_id: customer_id || null,
        customer_name: customer_name || '',
        product_name: product_name || '',
        issued_at: new Date(),
        created_at: new Date()
      })
    }

    const updated = await dbFindOne(db.licenses, { key })
    res.json({ success: true, data: updated })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// DELETE /api/v1/licenses/:id
router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    await dbRemove(db.licenses, { _id: req.params.id })
    res.json({ success: true, message: 'License deleted' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router
