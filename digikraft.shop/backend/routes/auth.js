const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { db, dbFind, dbFindOne, dbInsert, dbUpdate, getNextId } = require('../db/database')
const { authMiddleware } = require('../middleware/auth')

// POST /api/customer/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body
    if (!name || !email || !password) return res.status(400).json({ success: false, error: 'Name, email and password required' })

    const existing = await dbFindOne(db.customers, { email: email.toLowerCase() })
    if (existing) return res.status(400).json({ success: false, error: 'Email already registered' })

    const hash = await bcrypt.hash(password, 10)
    const id = await getNextId(db.customers)
    const userData = {
      id, name, email: email.toLowerCase(),
      password_hash: hash, role: 'customer', status: 'active',
      tags: [], total_orders: 0, total_spent: 0,
      created_at: new Date()
    }
    if (phone) userData.phone = phone
    const user = await dbInsert(db.customers, userData)

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })
    const { password_hash, ...safeUser } = user
    res.status(201).json({ success: true, token, user: safeUser })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/customer/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ success: false, error: 'Email and password required' })

    const customer = await dbFindOne(db.customers, { email: email.toLowerCase() })
    if (!customer) return res.status(401).json({ success: false, error: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, customer.password_hash)
    if (!valid) return res.status(401).json({ success: false, error: 'Invalid credentials' })
    if (customer.status !== 'active') return res.status(403).json({ success: false, error: 'Account suspended' })

    await dbUpdate(db.customers, { id: customer.id }, { $set: { last_login: new Date() } })

    const user = { id: customer.id, name: customer.name, email: customer.email, role: customer.role, avatar: customer.avatar }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })
    res.json({ success: true, token, user })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/customer/profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await dbFindOne(db.customers, { id: req.user.id })
    if (!user) return res.status(404).json({ success: false, error: 'User not found' })
    const { password_hash, ...safeUser } = user
    res.json({ success: true, data: safeUser })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// PUT /api/customer/profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, phone, avatar, password, cart_items, wishlist } = req.body
    const updates = {}
    if (name) updates.name = name
    if (phone) updates.phone = phone
    if (avatar) updates.avatar = avatar
    if (password) updates.password_hash = await bcrypt.hash(password, 10)
    if (cart_items !== undefined) updates.cart_items = cart_items
    if (wishlist !== undefined) updates.wishlist = wishlist

    if (!Object.keys(updates).length) return res.status(400).json({ success: false, error: 'Nothing to update' })

    await dbUpdate(db.customers, { id: req.user.id }, { $set: updates })
    const user = await dbFindOne(db.customers, { id: req.user.id })
    const { password_hash, ...safeUser } = user
    res.json({ success: true, data: safeUser })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/admin/login  (mounted at /api/admin in server.js → this route is just /login)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const admin = await dbFindOne(db.customers, { email: email?.toLowerCase(), role: 'admin' })
    if (!admin) return res.status(401).json({ success: false, error: 'Invalid admin credentials' })

    const valid = await bcrypt.compare(password, admin.password_hash)
    if (!valid) return res.status(401).json({ success: false, error: 'Invalid admin credentials' })

    await dbUpdate(db.customers, { id: admin.id }, { $set: { last_login: new Date() } })

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'admin' },
      process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )
    res.json({ success: true, token, admin: { id: admin.id, name: admin.name, email: admin.email } })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router
