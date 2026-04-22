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
const axios = require('axios')
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

// ── GENERATE IMAGE PROMPT FROM URL ───────────────────────────────────────────
router.post('/generate-prompt', adminMiddleware, async (req, res) => {
  try {
    const { url, title, category, description } = req.body

    let productInfo = { title: title || '', category: category || 'Digital Product', description: description || '' }

    // Scrape URL if provided
    if (url) {
      try {
        const scraped = await aiService.scrapeUrl(url)
        productInfo.title = productInfo.title || scraped.title
        productInfo.description = productInfo.description || scraped.description
        productInfo.image = scraped.image
      } catch {}
    }

    const name = productInfo.title || 'Digital Product'
    const cat = productInfo.category
    const desc = productInfo.description?.substring(0, 200) || ''

    // Build a rich, specific image generation prompt
    const styleMap = {
      'Graphics': 'vector illustration, colorful icons, design elements floating',
      'Fonts': 'typography showcase, letters arranged artistically, font specimen',
      'Templates': 'clean document layout, organized sections, professional template preview',
      'UI Kits': 'UI components floating, cards, buttons, dark/light theme, app mockup',
      'Plugins': 'software interface, code editor, plugin panel, tech aesthetic',
      '3D Assets': '3D rendered objects, isometric view, studio lighting, shadows',
      'Courses': 'learning materials, books, laptop, knowledge concept, education',
      'Tools': 'software dashboard, charts, productivity tools, clean interface'
    }
    const catStyle = styleMap[cat] || 'digital product, modern design, clean layout'

    const prompt = `Professional e-commerce product thumbnail for "${name}". ${catStyle}. ${desc ? 'Product features: ' + desc.substring(0, 100) + '.' : ''} High quality, centered composition, gradient background, modern aesthetic, suitable for digital marketplace listing. No text overlays.`

    res.json({ success: true, data: { prompt, title: name, category: cat, source_image: productInfo.image || null } })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ── GENERATE THUMBNAIL ────────────────────────────────────────────────────────
router.post('/generate-thumbnail', adminMiddleware, async (req, res) => {
  const { prompt, style = 'modern', url, title, category } = req.body

  // Build the image prompt
  let imagePrompt = prompt

  // If no prompt given but URL provided, analyze it first
  if (!imagePrompt && url) {
    try {
      const scraped = await aiService.scrapeUrl(url)
      // If OG image exists, return it directly
      if (scraped.image) {
        return res.json({
          success: true,
          data: { image_url: scraped.image, prompt: '', source: 'og_image' }
        })
      }
      // Build prompt from scraped data
      imagePrompt = `Professional product thumbnail for "${scraped.title || title || 'Digital Product'}", digital product, ${category || 'software'}, modern design, clean background`
    } catch {}
  }

  if (!imagePrompt && title) {
    imagePrompt = `Professional product thumbnail for "${title}", digital product, ${category || 'software'}, modern design`
  }

  if (!imagePrompt) {
    return res.status(400).json({ success: false, error: 'prompt or url/title is required' })
  }

  // Style modifiers
  const styleMap = {
    modern: 'modern clean design, white background, professional',
    dark: 'dark theme, dark background, neon accents, futuristic',
    gradient: 'colorful gradient background, vibrant colors, eye-catching',
    minimal: 'minimal flat design, simple, clean, lots of whitespace',
    '3d': '3D isometric illustration, depth, shadows, professional render',
    professional: 'corporate professional, business style, clean layout'
  }
  const styleHint = styleMap[style] || styleMap.modern
  const fullPrompt = `${imagePrompt}, ${styleHint}, high quality, e-commerce product image, 1:1 ratio`

  // Try Pollinations.ai first (free, no key needed, always works)
  try {
    const encoded = encodeURIComponent(fullPrompt)
    const seed = Math.floor(Math.random() * 999999)
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encoded}?width=800&height=800&seed=${seed}&nologo=true&enhance=true`
    return res.json({
      success: true,
      data: { image_url: pollinationsUrl, prompt: fullPrompt, source: 'pollinations' }
    })
  } catch {}

  // Fallback: DALL-E via OpenRouter
  const openrouterKey = process.env.OPENROUTER_API_KEY
  if (openrouterKey) {
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/images/generations',
        { model: 'openai/dall-e-3', prompt: fullPrompt, n: 1, size: '1024x1024' },
        {
          headers: {
            'Authorization': `Bearer ${openrouterKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'DigiKraft Admin'
          },
          timeout: 60000
        }
      )
      const imageUrl = response.data.data[0]?.url
      if (imageUrl) {
        return res.json({ success: true, data: { image_url: imageUrl, prompt: fullPrompt, source: 'dalle3' } })
      }
    } catch (e) {
      console.error('[DALL-E Error]', e.message)
    }
  }

  // Last fallback: styled placeholder
  const categoryColors = {
    'Graphics': '6366f1', 'Fonts': '3b82f6', 'Templates': '10b981',
    'UI Kits': 'f59e0b', 'Plugins': 'ec4899', '3D Assets': '14b8a6',
    'Courses': '8b5cf6', 'Tools': '64748b'
  }
  const color = categoryColors[category] || '6366f1'
  const encodedTitle = encodeURIComponent((title || prompt || 'Product').substring(0, 30))
  const placeholderUrl = `https://via.placeholder.com/800x800/${color}/ffffff?text=${encodedTitle}`

  res.json({ success: true, data: { image_url: placeholderUrl, prompt: fullPrompt, source: 'placeholder' } })
})

module.exports = router
