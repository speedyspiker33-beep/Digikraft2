// ===== AI HUB ROUTES =====
// Manages AI models, purpose assignments, agents, and email config
// GET  /api/v1/ai-hub/models          — list all configured models
// POST /api/v1/ai-hub/models          — add a model
// PUT  /api/v1/ai-hub/models/:id      — update a model
// DELETE /api/v1/ai-hub/models/:id    — remove a model
// POST /api/v1/ai-hub/models/:id/test — test a model connection
// GET  /api/v1/ai-hub/purposes        — get purpose→model assignments
// PUT  /api/v1/ai-hub/purposes        — save purpose→model assignments
// GET  /api/v1/ai-hub/agents          — list agents
// POST /api/v1/ai-hub/agents          — add/update agent
// DELETE /api/v1/ai-hub/agents/:id    — remove agent
// GET  /api/v1/ai-hub/email           — get email config (masked)
// PUT  /api/v1/ai-hub/email           — save email config
// POST /api/v1/ai-hub/email/test      — send test email

const express = require('express')
const router = express.Router()
const axios = require('axios')
const { db, dbFind, dbFindOne, dbInsert, dbUpdate, dbRemove } = require('../db/database')
const { adminMiddleware } = require('../middleware/auth')

// ── MODELS ────────────────────────────────────────────────────────────────────
router.get('/models', adminMiddleware, async (req, res) => {
  try {
    const rows = await dbFind(db.settings)
    const s = {}
    rows.forEach(r => { s[(r.key || '').trim()] = r.value })
    const models = s.ai_models ? JSON.parse(s.ai_models) : getDefaultModels()
    res.json({ success: true, data: models })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.post('/models', adminMiddleware, async (req, res) => {
  try {
    const { name, provider, model_id, api_key, base_url, description, icon } = req.body
    if (!name || !model_id) return res.status(400).json({ success: false, error: 'name and model_id required' })

    const rows = await dbFind(db.settings)
    const s = {}
    rows.forEach(r => { s[(r.key || '').trim()] = r.value })
    const models = s.ai_models ? JSON.parse(s.ai_models) : getDefaultModels()

    const id = `model_${Date.now()}`
    models.push({ id, name, provider: provider || 'openrouter', model_id, api_key: api_key || '', base_url: base_url || '', description: description || '', icon: icon || '🤖', enabled: true, added_at: new Date().toISOString() })

    await saveSettings(db, { ai_models: JSON.stringify(models) })
    res.json({ success: true, data: { id, name, model_id } })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.put('/models/:id', adminMiddleware, async (req, res) => {
  try {
    const rows = await dbFind(db.settings)
    const s = {}
    rows.forEach(r => { s[(r.key || '').trim()] = r.value })
    const models = s.ai_models ? JSON.parse(s.ai_models) : []
    const idx = models.findIndex(m => m.id === req.params.id)
    if (idx < 0) return res.status(404).json({ success: false, error: 'Model not found' })

    models[idx] = { ...models[idx], ...req.body, id: req.params.id }
    await saveSettings(db, { ai_models: JSON.stringify(models) })
    res.json({ success: true, data: models[idx] })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.delete('/models/:id', adminMiddleware, async (req, res) => {
  try {
    const rows = await dbFind(db.settings)
    const s = {}
    rows.forEach(r => { s[(r.key || '').trim()] = r.value })
    const models = (s.ai_models ? JSON.parse(s.ai_models) : []).filter(m => m.id !== req.params.id)
    await saveSettings(db, { ai_models: JSON.stringify(models) })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// Test a model connection
router.post('/models/:id/test', adminMiddleware, async (req, res) => {
  try {
    const rows = await dbFind(db.settings)
    const s = {}
    rows.forEach(r => { s[(r.key || '').trim()] = r.value })
    const models = s.ai_models ? JSON.parse(s.ai_models) : []
    const model = models.find(m => m.id === req.params.id)
    if (!model) return res.status(404).json({ success: false, error: 'Model not found' })

    const key = model.api_key || s.openrouter_api_key || ''
    if (!key) return res.status(400).json({ success: false, error: 'No API key configured for this model' })

    const baseUrl = model.base_url || 'https://openrouter.ai/api/v1'
    const start = Date.now()

    const testRes = await axios.post(`${baseUrl}/chat/completions`, {
      model: model.model_id,
      messages: [{ role: 'user', content: 'Reply with exactly: {"status":"ok"}' }],
      max_tokens: 20,
      temperature: 0
    }, {
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'DigiKraft Test'
      },
      timeout: 15000
    })

    const latency = Date.now() - start
    const content = testRes.data.choices?.[0]?.message?.content || ''
    res.json({ success: true, latency, model_used: testRes.data.model || model.model_id, response: content.substring(0, 100) })
  } catch (err) {
    const msg = err.response?.data?.error?.message || err.message
    res.status(200).json({ success: false, error: msg })
  }
})

// ── PURPOSES ──────────────────────────────────────────────────────────────────
router.get('/purposes', adminMiddleware, async (req, res) => {
  try {
    const rows = await dbFind(db.settings)
    const s = {}
    rows.forEach(r => { s[(r.key || '').trim()] = r.value })
    const purposes = s.ai_purposes ? JSON.parse(s.ai_purposes) : getDefaultPurposes()
    res.json({ success: true, data: purposes })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.put('/purposes', adminMiddleware, async (req, res) => {
  try {
    await saveSettings(db, { ai_purposes: JSON.stringify(req.body) })
    // Update ai-service with new purpose assignments
    try {
      const aiService = require('../services/ai-service')
      aiService.purposes = req.body
    } catch {}
    res.json({ success: true, message: 'Purpose assignments saved' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ── AGENTS ────────────────────────────────────────────────────────────────────
router.get('/agents', adminMiddleware, async (req, res) => {
  try {
    const rows = await dbFind(db.settings)
    const s = {}
    rows.forEach(r => { s[(r.key || '').trim()] = r.value })
    const agents = s.ai_agents ? JSON.parse(s.ai_agents) : getDefaultAgents()
    res.json({ success: true, data: agents })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.post('/agents', adminMiddleware, async (req, res) => {
  try {
    const rows = await dbFind(db.settings)
    const s = {}
    rows.forEach(r => { s[(r.key || '').trim()] = r.value })
    const agents = s.ai_agents ? JSON.parse(s.ai_agents) : []

    const { id } = req.body
    if (id) {
      // Update existing
      const idx = agents.findIndex(a => a.id === id)
      if (idx >= 0) agents[idx] = { ...agents[idx], ...req.body }
      else agents.push(req.body)
    } else {
      agents.push({ ...req.body, id: `agent_${Date.now()}`, added_at: new Date().toISOString() })
    }

    await saveSettings(db, { ai_agents: JSON.stringify(agents) })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.delete('/agents/:id', adminMiddleware, async (req, res) => {
  try {
    const rows = await dbFind(db.settings)
    const s = {}
    rows.forEach(r => { s[(r.key || '').trim()] = r.value })
    const agents = (s.ai_agents ? JSON.parse(s.ai_agents) : []).filter(a => a.id !== req.params.id)
    await saveSettings(db, { ai_agents: JSON.stringify(agents) })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ── EMAIL CONFIG ──────────────────────────────────────────────────────────────
router.get('/email', adminMiddleware, async (req, res) => {
  try {
    const rows = await dbFind(db.settings)
    const s = {}
    rows.forEach(r => { s[(r.key || '').trim()] = r.value })
    res.json({
      success: true,
      data: {
        smtp_host: s.smtp_host || '',
        smtp_port: s.smtp_port || '587',
        smtp_user: s.smtp_user || '',
        smtp_pass_set: !!(s.smtp_pass),
        smtp_from_name: s.smtp_from_name || 'DigiKraft',
        smtp_from_email: s.smtp_from_email || '',
        smtp_secure: s.smtp_secure || 'tls',
        google_client_id: s.google_client_id || '',
        google_client_secret_set: !!(s.google_client_secret),
        google_redirect_uri: s.google_redirect_uri || 'http://localhost:8080/auth/google/callback',
        email_order_confirm: s.email_order_confirm !== 'false',
        email_welcome: s.email_welcome !== 'false',
        email_vendor_notify: s.email_vendor_notify !== 'false',
        email_review_request: s.email_review_request !== 'false',
      }
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.put('/email', adminMiddleware, async (req, res) => {
  try {
    const allowed = ['smtp_host','smtp_port','smtp_user','smtp_pass','smtp_from_name','smtp_from_email','smtp_secure',
      'google_client_id','google_client_secret','google_redirect_uri',
      'email_order_confirm','email_welcome','email_vendor_notify','email_review_request']
    const updates = {}
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = String(req.body[key])
    }
    await saveSettings(db, updates)
    res.json({ success: true, message: 'Email config saved' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.post('/email/test', adminMiddleware, async (req, res) => {
  try {
    const rows = await dbFind(db.settings)
    const s = {}
    rows.forEach(r => { s[(r.key || '').trim()] = r.value })

    if (!s.smtp_host || !s.smtp_user || !s.smtp_pass) {
      return res.status(400).json({ success: false, error: 'SMTP not configured. Set host, user, and password first.' })
    }

    // Try to send test email using nodemailer if available
    try {
      const nodemailer = require('nodemailer')
      const transporter = nodemailer.createTransport({
        host: s.smtp_host,
        port: parseInt(s.smtp_port || 587),
        secure: s.smtp_secure === 'ssl',
        auth: { user: s.smtp_user, pass: s.smtp_pass }
      })
      await transporter.verify()
      const { to } = req.body
      if (to) {
        await transporter.sendMail({
          from: `"${s.smtp_from_name || 'DigiKraft'}" <${s.smtp_from_email || s.smtp_user}>`,
          to,
          subject: 'DigiKraft — Email Test',
          html: '<h2>✅ Email is working!</h2><p>Your SMTP configuration is correct. DigiKraft can send emails.</p>'
        })
      }
      res.json({ success: true, message: `SMTP connected! Test email sent to ${to || 'verified only'}` })
    } catch (mailErr) {
      res.status(200).json({ success: false, error: mailErr.message })
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ── HELPERS ───────────────────────────────────────────────────────────────────
async function saveSettings(db, updates) {
  const { dbFindOne, dbUpdate, dbInsert } = require('../db/database')
  for (const [key, value] of Object.entries(updates)) {
    const existing = await dbFindOne(db.settings, { key })
    if (existing) await dbUpdate(db.settings, { key }, { $set: { value: String(value), updated_at: new Date() } })
    else await dbInsert(db.settings, { key, value: String(value), updated_at: new Date() })
  }
}

function getDefaultModels() {
  return [
    { id: 'model_openrouter_claude', name: 'Claude 3.5 Haiku', provider: 'openrouter', model_id: 'anthropic/claude-3-5-haiku', api_key: '', base_url: 'https://openrouter.ai/api/v1', description: 'Fast & cheap. Great for product listings.', icon: '🟣', enabled: true },
    { id: 'model_openrouter_claude_sonnet', name: 'Claude 3.5 Sonnet', provider: 'openrouter', model_id: 'anthropic/claude-3-5-sonnet', api_key: '', base_url: 'https://openrouter.ai/api/v1', description: 'Smarter, better quality. Higher cost.', icon: '🟣', enabled: false },
    { id: 'model_openrouter_gpt4o', name: 'GPT-4o Mini', provider: 'openrouter', model_id: 'openai/gpt-4o-mini', api_key: '', base_url: 'https://openrouter.ai/api/v1', description: 'OpenAI via OpenRouter. Fast and capable.', icon: '🟢', enabled: false },
    { id: 'model_openrouter_gemini', name: 'Gemini 1.5 Flash', provider: 'openrouter', model_id: 'google/gemini-flash-1.5', api_key: '', base_url: 'https://openrouter.ai/api/v1', description: 'Google Gemini. Very fast, free tier available.', icon: '🔵', enabled: false },
    { id: 'model_openrouter_kimi', name: 'Kimi (Moonshot)', provider: 'openrouter', model_id: 'moonshot/moonshot-v1-8k', api_key: '', base_url: 'https://openrouter.ai/api/v1', description: 'Moonshot AI Kimi. Good for Asian market content.', icon: '🌙', enabled: false },
    { id: 'model_openrouter_llama_free', name: 'Llama 3.1 8B (Free)', provider: 'openrouter', model_id: 'meta-llama/llama-3.1-8b-instruct:free', api_key: '', base_url: 'https://openrouter.ai/api/v1', description: 'Free tier. Good for testing.', icon: '🦙', enabled: false },
  ]
}

function getDefaultPurposes() {
  return {
    product_listing: { model_id: 'model_openrouter_claude', label: 'Product Listing & Description', description: 'Generates product names, descriptions, tags, SEO', icon: '📦' },
    customer_support: { model_id: '', label: 'Customer Support', description: 'Handles customer queries, order questions', icon: '💬' },
    order_management: { model_id: '', label: 'Order Management', description: 'Analyzes orders, suggests vendor assignments', icon: '📋' },
    vendor_assign: { model_id: '', label: 'Vendor Assignment', description: 'Matches orders to best vendor automatically', icon: '🚚' },
    whatsapp_msg: { model_id: '', label: 'WhatsApp Messages', description: 'Generates WhatsApp notifications and replies', icon: '💚' },
    email_content: { model_id: '', label: 'Email Content', description: 'Writes order confirmations, newsletters', icon: '📧' },
    seo_content: { model_id: '', label: 'SEO & Blog Content', description: 'Generates blog posts, meta descriptions', icon: '🔍' },
    review_response: { model_id: '', label: 'Review Responses', description: 'Auto-replies to customer reviews', icon: '⭐' },
  }
}

function getDefaultAgents() {
  return [
    { id: 'agent_email', name: 'Email Agent', type: 'email', description: 'Sends automated emails for orders, welcome, reviews', icon: '📧', enabled: false, config: {} },
    { id: 'agent_whatsapp', name: 'WhatsApp Agent', type: 'whatsapp', description: 'Sends WhatsApp notifications via API', icon: '💬', enabled: false, config: {} },
    { id: 'agent_support', name: 'Customer Support Agent', type: 'support', description: 'Handles customer queries automatically', icon: '🤖', enabled: false, config: {} },
    { id: 'agent_vendor', name: 'Vendor Assignment Agent', type: 'vendor', description: 'Auto-assigns orders to vendors based on rules', icon: '🚚', enabled: false, config: {} },
    { id: 'agent_seo', name: 'SEO Content Agent', type: 'seo', description: 'Auto-generates blog posts and SEO content', icon: '🔍', enabled: false, config: {} },
  ]
}

module.exports = router
