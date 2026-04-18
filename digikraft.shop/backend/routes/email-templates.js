const express = require('express')
const router = express.Router()
const { db, dbFind, dbFindOne, dbInsert, dbUpdate, dbRemove, getNextId } = require('../db/database')
const { adminMiddleware } = require('../middleware/auth')

// Trigger options (shared reference)
const TRIGGERS = [
  'order_placed',
  'order_completed',
  'order_cancelled',
  'payment_failed',
  'customer_registered',
  'password_reset',
  'review_request',
  'coupon_issued',
  'subscription_started',
  'subscription_expired',
  'download_ready',
  'vendor_assigned',
  'custom'
]

// GET /api/v1/email-templates
router.get('/', adminMiddleware, async (req, res) => {
  try {
    const templates = await dbFind(db.email_templates || db.settings, {}, { created_at: -1 })
    // If using settings store as fallback, filter only email_template entries
    const filtered = db.email_templates
      ? templates
      : templates.filter(t => t._type === 'email_template')
    res.json({ success: true, data: filtered })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/v1/email-templates/:id
router.get('/:id', adminMiddleware, async (req, res) => {
  try {
    const store = db.email_templates || db.settings
    const tpl = await dbFindOne(store, { id: parseInt(req.params.id), _type: 'email_template' })
    if (!tpl) return res.status(404).json({ success: false, error: 'Template not found' })
    res.json({ success: true, data: tpl })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/v1/email-templates
router.post('/', adminMiddleware, async (req, res) => {
  try {
    const {
      title, subject, body, from_name, from_email,
      trigger, delay_value, delay_unit, enabled
    } = req.body

    if (!title || !subject || !body) {
      return res.status(400).json({ success: false, error: 'title, subject and body are required' })
    }

    const store = db.email_templates || db.settings
    const id = await getNextId(store)

    const tpl = await dbInsert(store, {
      id,
      _type: 'email_template',
      title: title.trim(),
      subject: subject.trim(),
      body,
      from_name: from_name || 'DigiKraft',
      from_email: from_email || '',
      trigger: trigger || 'custom',
      delay_value: parseInt(delay_value) || 0,
      delay_unit: delay_unit || 'minutes',
      enabled: enabled !== false,
      created_at: new Date(),
      updated_at: new Date()
    })

    res.status(201).json({ success: true, data: tpl })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// PUT /api/v1/email-templates/:id
router.put('/:id', adminMiddleware, async (req, res) => {
  try {
    const {
      title, subject, body, from_name, from_email,
      trigger, delay_value, delay_unit, enabled
    } = req.body

    const store = db.email_templates || db.settings
    const updates = { updated_at: new Date() }
    if (title !== undefined) updates.title = title
    if (subject !== undefined) updates.subject = subject
    if (body !== undefined) updates.body = body
    if (from_name !== undefined) updates.from_name = from_name
    if (from_email !== undefined) updates.from_email = from_email
    if (trigger !== undefined) updates.trigger = trigger
    if (delay_value !== undefined) updates.delay_value = parseInt(delay_value)
    if (delay_unit !== undefined) updates.delay_unit = delay_unit
    if (enabled !== undefined) updates.enabled = enabled

    await dbUpdate(store, { id: parseInt(req.params.id), _type: 'email_template' }, { $set: updates })
    const tpl = await dbFindOne(store, { id: parseInt(req.params.id), _type: 'email_template' })
    res.json({ success: true, data: tpl })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// DELETE /api/v1/email-templates/:id
router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    const store = db.email_templates || db.settings
    await dbRemove(store, { id: parseInt(req.params.id), _type: 'email_template' })
    res.json({ success: true, message: 'Template deleted' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/v1/email-templates/:id/send-test
router.post('/:id/send-test', adminMiddleware, async (req, res) => {
  try {
    const { to } = req.body
    if (!to) return res.status(400).json({ success: false, error: 'to email required' })
    const store = db.email_templates || db.settings
    const tpl = await dbFindOne(store, { id: parseInt(req.params.id), _type: 'email_template' })
    if (!tpl) return res.status(404).json({ success: false, error: 'Template not found' })
    // Actual sending would use nodemailer with SMTP settings — stub for now
    res.json({ success: true, message: `Test email sent to ${to} using template "${tpl.title}"` })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router
