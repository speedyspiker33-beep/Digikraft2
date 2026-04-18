require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const path = require('path')
const fs = require('fs')

const { initDB, db, dbFind, dbFindOne, dbCount } = require('./db/database')

const app = express()
const PORT = process.env.PORT || 8080

// ===== UPLOADS DIR =====
const uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

// ===== MIDDLEWARE =====
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))

app.use(cors({
  origin: [
    'http://localhost:3000',  // Admin Panel
    'http://localhost:3001',  // Main Website
    'http://localhost:1337',  // Strapi
    'http://localhost:5678',  // n8n
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Token']
}))

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
app.use(morgan('dev'))

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500, standardHeaders: true, legacyHeaders: false })
app.use('/api/', limiter)

// Serve uploads
app.use('/uploads', express.static(uploadDir))

// ===== ROUTES =====
// Store
app.use('/api/v1/products', require('./routes/products'))
app.use('/api/v1/categories', require('./routes/categories'))
app.use('/api/v1/orders', require('./routes/orders'))
app.use('/api/v1/customers', require('./routes/customers'))
app.use('/api/v1/coupons', require('./routes/coupons'))
app.use('/api/v1/reviews', require('./routes/reviews'))
// Content
app.use('/api/v1/blog', require('./routes/blog'))
app.use('/api/v1/blog-ai', require('./routes/blog-ai'))
app.use('/api/v1/digiprofile', require('./routes/digiprofile'))
app.use('/api/v1/satellite-pages', require('./routes/satellite-pages'))
app.use('/api/v1/product-files', require('./routes/product-files'))
// Business
app.use('/api/v1/subscriptions', require('./routes/subscriptions'))
app.use('/api/v1/licenses', require('./routes/licenses'))
app.use('/api/v1/vendors', require('./routes/vendors'))
app.use('/api/v1/affiliate', require('./routes/affiliate'))
// System
app.use('/api/v1/dashboard', require('./routes/dashboard'))
app.use('/api/v1/analytics', require('./routes/analytics'))
app.use('/api/v1/settings', require('./routes/settings'))
app.use('/api/v1/notifications', require('./routes/notifications'))
// AI Automation
app.use('/api/v1/ai', require('./routes/ai-automation'))
app.use('/api/v1/ai-hub', require('./routes/ai-hub'))
app.use('/api/v1/email-templates', require('./routes/email-templates'))
// Downloads & Auth
app.use('/api/downloads', require('./routes/downloads'))
app.use('/api/customer', require('./routes/auth'))
app.use('/api/admin', require('./routes/auth'))
app.use('/webhook', require('./routes/webhooks'))

// ===== PUBLIC ENDPOINTS (no auth) =====
app.get('/api/public/products', async (req, res) => {
  try {
    const products = await dbFind(db.products, { status: 'published' }, { downloads: -1 })
    res.json({ success: true, data: products })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

app.get('/api/public/products/:id', async (req, res) => {
  try {
    const { id } = req.params
    const p = await dbFindOne(db.products, { $or: [{ id: parseInt(id) || 0 }, { slug: id }] })
    if (!p) return res.status(404).json({ success: false, error: 'Not found' })
    res.json({ success: true, data: p })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

app.get('/api/public/categories', async (req, res) => {
  try {
    const categories = await dbFind(db.categories, { status: 'active' }, { sort_order: 1 })
    const allProducts = await dbFind(db.products, { status: 'published' })
    const enriched = categories.map(c => ({
      ...c,
      product_count: allProducts.filter(p => p.category_ids && p.category_ids.includes(c.id)).length
    }))
    res.json({ success: true, data: enriched })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ===== ADMIN QUICK ENDPOINTS =====
app.get('/api/admin/products', async (req, res) => {
  try {
    const products = await dbFind(db.products, {}, { created_at: -1 })
    const allCats = await dbFind(db.categories)
    const catMap = {}
    allCats.forEach(c => { catMap[c.id] = c })
    const enriched = products.map(p => ({
      ...p,
      categories: (p.category_ids || []).map(id => catMap[id]).filter(Boolean)
    }))
    res.json({ success: true, data: enriched })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

app.get('/api/admin/stats', async (req, res) => {
  try {
    const [products, orders, customers, notifications] = await Promise.all([
      dbCount(db.products, { status: 'published' }),
      dbCount(db.orders),
      dbCount(db.customers, { role: 'customer' }),
      dbCount(db.notifications, { read: false })
    ])
    const allOrders = await dbFind(db.orders, { payment_status: 'paid' })
    const revenue = allOrders.reduce((s, o) => s + (o.total || 0), 0)
    const pendingOrders = await dbCount(db.orders, { status: 'pending' })

    res.json({ success: true, data: { products, orders, customers, revenue, pendingOrders, notifications } })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ===== HEALTH CHECK =====
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'DigiKraft Backend API',
    port: PORT,
    timestamp: new Date().toISOString(),
    database: 'NeDB (connected)'
  })
})

app.get('/', (req, res) => {
  res.json({
    name: 'DigiKraft Backend API',
    version: '2.0.0',
    port: PORT,
    routes: {
      // Store
      'GET /api/v1/products': 'List products (public)',
      'POST /api/v1/products': 'Create product (admin)',
      'GET /api/v1/categories': 'List categories (public)',
      'GET /api/v1/orders': 'List orders (auth)',
      'POST /api/v1/orders': 'Create order (auth)',
      'GET /api/v1/customers': 'List customers (admin)',
      'GET /api/v1/coupons': 'List coupons (admin)',
      'POST /api/v1/coupons/validate': 'Validate coupon (auth)',
      'GET /api/v1/reviews': 'List reviews',
      'POST /api/v1/reviews': 'Submit review (auth)',
      // Content
      'GET /api/v1/blog': 'List blog posts',
      'GET /api/v1/blog/:slug': 'Get blog post',
      'POST /api/v1/blog': 'Create blog post (admin)',
      'GET /api/v1/satellite-pages': 'List satellite pages',
      'GET /api/v1/product-files/:productId': 'Get product files',
      'POST /api/v1/product-files/:productId/upload': 'Upload product file (admin)',
      // Business
      'GET /api/v1/subscriptions': 'List subscriptions (admin)',
      'POST /api/v1/subscriptions': 'Create subscription (admin)',
      'GET /api/v1/licenses': 'List license pool (admin)',
      'POST /api/v1/licenses': 'Add to license pool (admin)',
      'POST /api/v1/licenses/issue': 'Issue license (admin)',
      'GET /api/v1/vendors': 'List vendors (admin)',
      // System
      'GET /api/v1/dashboard': 'Dashboard stats (admin)',
      'GET /api/v1/analytics': 'Analytics data (admin)',
      'GET /api/v1/settings': 'Settings (admin)',
      'GET /api/v1/settings/public': 'Public settings',
      'GET /api/v1/notifications': 'Notifications (admin)',
      // Auth
      'POST /api/customer/login': 'Customer login',
      'POST /api/customer/register': 'Customer register',
      'GET /api/customer/profile': 'Customer profile (auth)',
      'POST /api/admin/login': 'Admin login',
      // Downloads
      'GET /api/downloads': 'Customer downloads (auth)',
      // Public
      'GET /api/public/products': 'Public products',
      'GET /api/public/categories': 'Public categories',
      // Webhooks
      'POST /webhook/strapi-sync': 'Sync from Strapi',
      'POST /webhook/order-created': 'Order created webhook',
      'POST /webhook/payment-success': 'Payment success webhook'
    }
  })
})

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error('[Error]', err.message)
  res.status(err.status || 500).json({ success: false, error: err.message || 'Internal server error' })
})

app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` })
})

// ===== START =====
async function start() {
  await initDB()

  // Load AI keys from DB into service at startup
  try {
    const aiService = require('./services/ai-service')
    const rows = await dbFind(db.settings)
    const s = {}
    rows.forEach(r => { s[(r.key || '').trim()] = r.value })
    if (s.openrouter_api_key) { aiService.openrouterKey = s.openrouter_api_key; console.log('✅ OpenRouter key loaded') }
    if (s.openai_api_key) { aiService.openaiKey = s.openai_api_key; console.log('✅ OpenAI key loaded') }
    if (s.gemini_api_key) { aiService.geminiKey = s.gemini_api_key; console.log('✅ Gemini key loaded') }
  } catch (e) {
    console.log('ℹ️  AI key load error:', e.message)
  }

  app.listen(PORT, () => {
    console.log(`\n🚀 DigiKraft Backend API running on http://localhost:${PORT}`)
    console.log(`📊 Dashboard: http://localhost:${PORT}/api/v1/dashboard`)
    console.log(`🛍️  Products:  http://localhost:${PORT}/api/v1/products`)
    console.log(`🔑 Auth:      http://localhost:${PORT}/api/customer/login`)
    console.log(`❤️  Health:    http://localhost:${PORT}/health`)
    console.log(`\n👤 Admin:     admin@digikraft.shop / admin123\n`)
  })
}

start().catch(console.error)

module.exports = app
