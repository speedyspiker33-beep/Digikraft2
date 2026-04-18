// ===== AI AUTOMATION ROUTES =====
// Handles AI-powered product listing automation
// POST /api/v1/ai/analyze-url     — analyze a single URL
// POST /api/v1/ai/analyze-pdf     — extract URLs from PDF and analyze each
// POST /api/v1/ai/create-product  — create product from AI-generated data
// POST /api/v1/ai/batch-create    — create multiple products at once
// GET  /api/v1/ai/jobs            — list automation jobs
// GET  /api/v1/ai/config          — get AI config (keys masked)
// PUT  /api/v1/ai/config          — save AI config

const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { db, dbFind, dbFindOne, dbInsert, dbUpdate, dbCount, getNextId } = require('../db/database')
const { adminMiddleware } = require('../middleware/auth')
const aiService = require('../services/ai-service')

// Multer setup for PDF uploads
const uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads')
const pdfDir = path.join(uploadDir, 'ai-pdfs')
if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true })

const upload = multer({
  dest: pdfDir,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.txt']
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowed.includes(ext)) cb(null, true)
    else cb(new Error('Only PDF and TXT files allowed'))
  }
})

// In-memory job queue (persisted to NeDB)
const activeJobs = new Map()

// ── ANALYZE SINGLE URL ────────────────────────────────────────────────────────
router.post('/analyze-url', adminMiddleware, async (req, res) => {
  const { url } = req.body
  if (!url || !url.startsWith('http')) {
    return res.status(400).json({ success: false, error: 'Valid URL required' })
  }

  // Lazy-load AI keys from DB if not set
  if (!aiService.openrouterKey && !aiService.openaiKey && !aiService.geminiKey) {
    try {
      const rows = await dbFind(db.settings)
      rows.forEach(r => {
        const key = (r.key || '').trim()
        if (key === 'openrouter_api_key' && r.value) aiService.openrouterKey = r.value
        if (key === 'openai_api_key' && r.value) aiService.openaiKey = r.value
        if (key === 'gemini_api_key' && r.value) aiService.geminiKey = r.value
      })
    } catch {}
  }

  try {
    console.log('[AI] Analyzing URL:', url)
    const productData = await aiService.analyzeUrl(url)
    res.json({ success: true, data: productData })
  } catch (err) {
    console.error('[AI URL Error]', err.message)
    res.status(500).json({ success: false, error: err.message })
  }
})

// ── ANALYZE PDF ───────────────────────────────────────────────────────────────
router.post('/analyze-pdf', adminMiddleware, upload.single('pdf'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'PDF file required' })
  }

  const jobId = `job_${Date.now()}`
  const filePath = req.file.path
  const ext = path.extname(req.file.originalname).toLowerCase()

  // Start async job
  res.json({ success: true, jobId, message: 'PDF processing started' })

  // Process in background
  ;(async () => {
    try {
      activeJobs.set(jobId, { status: 'processing', progress: 0, total: 0, results: [], errors: [] })

      let text = ''
      if (ext === '.pdf') {
        const pdfParse = require('pdf-parse')
        const buffer = fs.readFileSync(filePath)
        const data = await pdfParse(buffer)
        text = data.text
      } else {
        text = fs.readFileSync(filePath, 'utf8')
      }

      // Extract URLs from text
      const urls = aiService.extractUrlsFromText(text)
      console.log(`[AI PDF] Found ${urls.length} URLs in document`)

      activeJobs.set(jobId, { ...activeJobs.get(jobId), total: urls.length, urls })

      if (urls.length === 0) {
        activeJobs.set(jobId, { ...activeJobs.get(jobId), status: 'done', message: 'No URLs found in document' })
        return
      }

      const results = []
      for (let i = 0; i < urls.length; i++) {
        const url = urls[i]
        try {
          console.log(`[AI PDF] Processing ${i + 1}/${urls.length}: ${url}`)
          const productData = await aiService.analyzeUrl(url)
          results.push({ url, status: 'success', data: productData })
        } catch (e) {
          results.push({ url, status: 'error', error: e.message })
        }
        activeJobs.set(jobId, {
          ...activeJobs.get(jobId),
          progress: i + 1,
          results: [...results]
        })
        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 500))
      }

      activeJobs.set(jobId, { ...activeJobs.get(jobId), status: 'done', results })
      console.log(`[AI PDF] Job ${jobId} complete: ${results.filter(r => r.status === 'success').length} products analyzed`)
    } catch (err) {
      activeJobs.set(jobId, { ...activeJobs.get(jobId), status: 'error', error: err.message })
    } finally {
      // Clean up uploaded file
      try { fs.unlinkSync(filePath) } catch {}
    }
  })()
})

// ── JOB STATUS ────────────────────────────────────────────────────────────────
router.get('/job/:jobId', adminMiddleware, (req, res) => {
  const job = activeJobs.get(req.params.jobId)
  if (!job) return res.status(404).json({ success: false, error: 'Job not found' })
  res.json({ success: true, data: job })
})

// ── CREATE SINGLE PRODUCT FROM AI DATA ───────────────────────────────────────
router.post('/create-product', adminMiddleware, async (req, res) => {
  try {
    const data = req.body
    const id = await getNextId(db.products)

    // Map category name to category_ids
    const categories = await dbFind(db.categories)
    const matchedCat = categories.find(c =>
      c.name.toLowerCase() === (data.category || '').toLowerCase() ||
      c.slug === (data.category || '').toLowerCase()
    )
    const category_ids = matchedCat ? [matchedCat.id] : []

    const product = {
      id,
      name: data.name || 'Untitled Product',
      slug: data.slug || `product-${id}`,
      short_description: data.short_description || '',
      description: data.description || '',
      price: parseFloat(data.price) || 499,
      original_price: parseFloat(data.original_price) || null,
      category_ids,
      category: data.category || 'Templates',
      tags: Array.isArray(data.tags) ? data.tags : [],
      status: data.status || 'draft', // draft by default — admin reviews before publishing
      featured: false,
      downloads: 0,
      rating: 0,
      review_count: 0,
      thumbnail: data.thumbnail_url || data.thumbnail || '',
      images: data.thumbnail_url ? [data.thumbnail_url] : [],
      seo_title: data.seo_title || data.name || '',
      seo_description: data.seo_description || '',
      seo_keywords: data.seo_keywords || '',
      features: Array.isArray(data.features) ? data.features : [],
      file_format: data.file_format || 'ZIP',
      license_type: data.license_type || 'Commercial',
      source_url: data.source_url || '',
      ai_generated: true,
      ai_generated_at: new Date().toISOString(),
      created_at: new Date(),
      updated_at: new Date()
    }

    await dbInsert(db.products, product)
    console.log(`[AI] Created product: ${product.name} (id: ${id})`)
    res.json({ success: true, data: product, message: `Product "${product.name}" created as draft` })
  } catch (err) {
    console.error('[AI Create Error]', err.message)
    res.status(500).json({ success: false, error: err.message })
  }
})

// ── BATCH CREATE PRODUCTS ─────────────────────────────────────────────────────
router.post('/batch-create', adminMiddleware, async (req, res) => {
  const { products } = req.body
  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ success: false, error: 'Products array required' })
  }

  const results = []
  for (const data of products) {
    try {
      const id = await getNextId(db.products)
      const categories = await dbFind(db.categories)
      const matchedCat = categories.find(c => c.name.toLowerCase() === (data.category || '').toLowerCase())
      const category_ids = matchedCat ? [matchedCat.id] : []

      const product = {
        id,
        name: data.name || 'Untitled Product',
        slug: (data.slug || `product-${id}`),
        short_description: data.short_description || '',
        description: data.description || '',
        price: parseFloat(data.price) || 499,
        original_price: parseFloat(data.original_price) || null,
        category_ids,
        category: data.category || 'Templates',
        tags: Array.isArray(data.tags) ? data.tags : [],
        status: 'draft',
        featured: false,
        downloads: 0,
        rating: 0,
        review_count: 0,
        thumbnail: data.thumbnail_url || data.thumbnail || '',
        images: data.thumbnail_url ? [data.thumbnail_url] : [],
        seo_title: data.seo_title || data.name || '',
        seo_description: data.seo_description || '',
        seo_keywords: data.seo_keywords || '',
        features: Array.isArray(data.features) ? data.features : [],
        file_format: data.file_format || 'ZIP',
        license_type: data.license_type || 'Commercial',
        source_url: data.source_url || '',
        ai_generated: true,
        ai_generated_at: new Date().toISOString(),
        created_at: new Date(),
        updated_at: new Date()
      }

      await dbInsert(db.products, product)
      results.push({ success: true, id, name: product.name })
    } catch (e) {
      results.push({ success: false, name: data.name, error: e.message })
    }
  }

  const created = results.filter(r => r.success).length
  res.json({ success: true, data: results, message: `${created}/${products.length} products created as drafts` })
})

// ── AI CONFIG ─────────────────────────────────────────────────────────────────
router.get('/config', adminMiddleware, async (req, res) => {
  try {
    const rows = await dbFind(db.settings)
    const s = {}
    rows.forEach(r => { s[r.key] = r.value })
    res.json({
      success: true,
      data: {
        openrouter_key_set: !!(s.openrouter_api_key || process.env.OPENROUTER_API_KEY),
        openai_key_set: !!(s.openai_api_key || process.env.OPENAI_API_KEY),
        gemini_key_set: !!(s.gemini_api_key || process.env.GEMINI_API_KEY),
        openrouter_key_preview: s.openrouter_api_key ? s.openrouter_api_key.substring(0, 12) + '...' : '',
        openai_key_preview: s.openai_api_key ? s.openai_api_key.substring(0, 8) + '...' : '',
        gemini_key_preview: s.gemini_api_key ? s.gemini_api_key.substring(0, 8) + '...' : '',
        ai_provider: s.ai_provider || 'auto',
        auto_publish: s.ai_auto_publish === 'true',
        default_status: s.ai_default_status || 'draft',
        default_license: s.ai_default_license || 'Commercial',
        price_currency: 'INR'
      }
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.put('/config', adminMiddleware, async (req, res) => {
  try {
    const { openrouter_key, openai_key, gemini_key, ai_provider, auto_publish, default_status, default_license } = req.body
    const updates = {}
    if (openrouter_key !== undefined) updates.openrouter_api_key = openrouter_key
    if (openai_key !== undefined) updates.openai_api_key = openai_key
    if (gemini_key !== undefined) updates.gemini_api_key = gemini_key
    if (ai_provider) updates.ai_provider = ai_provider
    if (auto_publish !== undefined) updates.ai_auto_publish = String(auto_publish)
    if (default_status) updates.ai_default_status = default_status
    if (default_license) updates.ai_default_license = default_license

    for (const [key, value] of Object.entries(updates)) {
      const existing = await dbFindOne(db.settings, { key })
      if (existing) {
        await dbUpdate(db.settings, { key }, { $set: { value: String(value), updated_at: new Date() } })
      } else {
        await dbInsert(db.settings, { key, value: String(value), updated_at: new Date() })
      }
    }

    // Update runtime service keys immediately
    if (openrouter_key) aiService.openrouterKey = openrouter_key
    if (openai_key) aiService.openaiKey = openai_key
    if (gemini_key) aiService.geminiKey = gemini_key

    res.json({ success: true, message: 'AI config saved' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ── GENERATE THUMBNAIL ────────────────────────────────────────────────────────
router.post('/generate-thumbnail', adminMiddleware, async (req, res) => {
  const { url, title, category } = req.body

  // Try to fetch OG image from URL
  if (url) {
    try {
      const scraped = await aiService.scrapeUrl(url)
      if (scraped.image) {
        return res.json({ success: true, thumbnail_url: scraped.image, source: 'og_image' })
      }
    } catch {}
  }

  // Return a placeholder with category-based gradient
  const categoryColors = {
    'Graphics': '6366f1,8b5cf6',
    'Fonts': '3b82f6,06b6d4',
    'Templates': '10b981,059669',
    'UI Kits': 'f59e0b,ef4444',
    'Plugins': 'ec4899,f43f5e',
    '3D Assets': '14b8a6,0ea5e9',
    'Courses': '8b5cf6,6366f1',
    'Tools': '64748b,475569'
  }
  const colors = categoryColors[category] || '6366f1,8b5cf6'
  const encodedTitle = encodeURIComponent((title || 'Product').substring(0, 30))
  const thumbnailUrl = `https://via.placeholder.com/800x600/${colors.split(',')[0]}/ffffff?text=${encodedTitle}`

  res.json({ success: true, thumbnail_url: thumbnailUrl, source: 'placeholder' })
})

module.exports = router
