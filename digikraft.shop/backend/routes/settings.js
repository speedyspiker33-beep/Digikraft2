const express = require('express')
const router = express.Router()
const { db, dbFind, dbFindOne, dbInsert, dbUpdate } = require('../db/database')
const { adminMiddleware } = require('../middleware/auth')

// GET /api/v1/settings — admin
router.get('/', adminMiddleware, async (req, res) => {
  try {
    const rows = await dbFind(db.settings)
    const settings = {}
    rows.forEach(r => { settings[r.key] = r.value })
    res.json({ success: true, data: settings })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/v1/settings/public
router.get('/public', async (req, res) => {
  try {
    const publicKeys = new Set([
      'site_name', 'site_tagline', 'currency', 'currency_symbol', 'contact_email', 'whatsapp_number',
      'payment_razorpay_enabled', 'payment_stripe_enabled', 'payment_paypal_enabled',
      'payment_upi_enabled', 'payment_phonepe_enabled', 'payment_paytm_enabled', 'payment_cashfree_enabled',
      'payment_test_mode', 'tax_rate', 'min_order',
      'site_config' // Full appearance config JSON — synced from admin panel
    ])
    const rows = await dbFind(db.settings)
    const settings = {}
    rows.forEach(r => {
      const key = (r.key || '').trim()
      if (publicKeys.has(key)) settings[key] = r.value
    })
    res.json({ success: true, data: settings })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// PUT /api/v1/settings — admin
router.put('/', adminMiddleware, async (req, res) => {
  try {
    for (const [key, value] of Object.entries(req.body)) {
      const existing = await dbFindOne(db.settings, { key })
      if (existing) {
        await dbUpdate(db.settings, { key }, { $set: { value: String(value), updated_at: new Date() } })
      } else {
        await dbInsert(db.settings, { key, value: String(value), updated_at: new Date() })
      }
    }
    res.json({ success: true, message: 'Settings updated' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router
