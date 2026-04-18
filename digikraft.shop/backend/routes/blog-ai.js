// ===== AI BLOG GENERATION ROUTES =====
// POST /api/v1/blog-ai/generate        — generate full article from topic/prompt
// POST /api/v1/blog-ai/from-pdf        — extract content from PDF/MD and generate article
// POST /api/v1/blog-ai/expand          — expand a section or excerpt
// POST /api/v1/blog-ai/seo             — generate SEO fields for existing content
// GET  /api/v1/blog-ai/categories      — list blog categories
// POST /api/v1/blog-ai/categories      — add blog category
// DELETE /api/v1/blog-ai/categories/:id — delete blog category

const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const axios = require('axios')
const { db, dbFind, dbFindOne, dbInsert, dbUpdate, dbRemove } = require('../db/database')
const { adminMiddleware } = require('../middleware/auth')

// Upload dir for reference files
const uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads')
const refDir = path.join(uploadDir, 'blog-refs')
if (!fs.existsSync(refDir)) fs.mkdirSync(refDir, { recursive: true })

const upload = multer({
  dest: refDir,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.md', '.txt', '.docx']
    const ext = path.extname(file.originalname).toLowerCase()
    allowed.includes(ext) ? cb(null, true) : cb(new Error('Only PDF, MD, TXT, DOCX allowed'))
  }
})

// ── GET AI SERVICE WITH KEYS ──────────────────────────────────────────────────
async function getAIService() {
  const aiService = require('../services/ai-service')
  if (!aiService.openrouterKey && !aiService.openaiKey) {
    const rows = await dbFind(db.settings)
    rows.forEach(r => {
      const key = (r.key || '').trim()
      if (key === 'openrouter_api_key' && r.value) aiService.openrouterKey = r.value
      if (key === 'openai_api_key' && r.value) aiService.openaiKey = r.value
      if (key === 'gemini_api_key' && r.value) aiService.geminiKey = r.value
    })
  }
  return aiService
}

// ── CALL AI WITH CUSTOM MODEL ─────────────────────────────────────────────────
async function callAI(prompt, modelOverride = null) {
  const aiService = await getAIService()

  // Check if a specific model is requested
  if (modelOverride) {
    const rows = await dbFind(db.settings)
    const s = {}
    rows.forEach(r => { s[(r.key || '').trim()] = r.value })
    const models = s.ai_models ? JSON.parse(s.ai_models) : []
    const model = models.find(m => m.id === modelOverride || m.model_id === modelOverride)
    if (model) {
      const key = model.api_key || aiService.openrouterKey
      const baseUrl = model.base_url || 'https://openrouter.ai/api/v1'
      const res = await axios.post(`${baseUrl}/chat/completions`, {
        model: model.model_id,
        messages: [
          { role: 'system', content: 'You are an expert content writer for DigiKraft.shop, a premium digital marketplace. Write engaging, SEO-optimized content.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 4000
      }, {
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'HTTP-Referer': 'http://localhost:3000', 'X-Title': 'DigiKraft Blog' },
        timeout: 60000
      })
      return res.data.choices[0].message.content.trim()
    }
  }

  // Use default OpenRouter
  if (aiService.openrouterKey) {
    const res = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'anthropic/claude-3-5-haiku',
      messages: [
        { role: 'system', content: 'You are an expert content writer for DigiKraft.shop, a premium digital marketplace for designers. Write engaging, SEO-optimized content in HTML format.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 4000
    }, {
      headers: { Authorization: `Bearer ${aiService.openrouterKey}`, 'Content-Type': 'application/json', 'HTTP-Referer': 'http://localhost:3000', 'X-Title': 'DigiKraft Blog' },
      timeout: 60000
    })
    return res.data.choices[0].message.content.trim()
  }

  throw new Error('No AI key configured. Add an OpenRouter key in AI Hub settings.')
}

// ── GENERATE FULL ARTICLE ─────────────────────────────────────────────────────
router.post('/generate', adminMiddleware, async (req, res) => {
  const { topic, category, tone, length, product_links, reference_text, model_id, keywords, target_audience } = req.body
  if (!topic) return res.status(400).json({ success: false, error: 'Topic required' })

  const wordCount = length === 'short' ? 600 : length === 'long' ? 2000 : 1200
  const toneDesc = tone === 'technical' ? 'technical and detailed' : tone === 'casual' ? 'casual and friendly' : 'professional and informative'

  const productLinksSection = product_links?.length
    ? `\n\nInclude natural mentions and links to these products where relevant:\n${product_links.map(p => `- ${p.name}: /products/${p.slug}`).join('\n')}`
    : ''

  const referenceSection = reference_text
    ? `\n\nUse this reference material for accuracy and depth:\n---\n${reference_text.substring(0, 3000)}\n---`
    : ''

  const prompt = `Write a complete, SEO-optimized blog article for DigiKraft.shop (a premium digital marketplace for designers).

Topic: ${topic}
Category: ${category || 'Design'}
Tone: ${toneDesc}
Target audience: ${target_audience || 'graphic designers, freelancers, and creative professionals'}
Target length: ~${wordCount} words
Keywords to include: ${keywords || topic}
${productLinksSection}
${referenceSection}

Return a JSON object with these exact fields:
{
  "title": "Compelling article title (50-70 chars)",
  "slug": "url-friendly-slug",
  "excerpt": "Engaging 2-3 sentence summary (150-200 chars)",
  "content": "Full article in HTML format with proper h2/h3 headings, paragraphs, lists, and a conclusion. Include a table of contents for long articles.",
  "tags": ["array", "of", "6-10", "relevant", "tags"],
  "seo_title": "SEO title (50-60 chars)",
  "seo_desc": "Meta description (120-160 chars)",
  "seo_keywords": "comma separated keywords",
  "read_time": number (estimated minutes),
  "image_prompt": "Detailed prompt to generate a featured image for this article",
  "image_suggestions": ["url1", "url2"] 
}

Return ONLY valid JSON, no markdown code blocks.`

  try {
    const raw = await callAI(prompt, model_id)
    // Strip markdown if present
    const jsonStr = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()
    const data = JSON.parse(jsonStr)
    res.json({ success: true, data })
  } catch (err) {
    console.error('[Blog AI Generate]', err.message)
    res.status(500).json({ success: false, error: err.message })
  }
})

// ── GENERATE FROM PDF/MD ──────────────────────────────────────────────────────
router.post('/from-pdf', adminMiddleware, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'File required' })

  const { topic, mode, model_id } = req.body
  // mode: 'extract' = convert file to blog post, 'reference' = use as reference for new article
  const filePath = req.file.path
  const ext = path.extname(req.file.originalname).toLowerCase()

  try {
    let text = ''

    if (ext === '.pdf') {
      const pdfParse = require('pdf-parse')
      const buffer = fs.readFileSync(filePath)
      const data = await pdfParse(buffer)
      text = data.text
    } else {
      // .md, .txt, .docx (basic text extraction)
      text = fs.readFileSync(filePath, 'utf8')
    }

    // Clean up file
    try { fs.unlinkSync(filePath) } catch {}

    if (mode === 'extract') {
      // Convert the document directly to a blog post
      const prompt = `Convert this document into a well-structured blog article for DigiKraft.shop.

Document content:
---
${text.substring(0, 5000)}
---

Return a JSON object:
{
  "title": "Article title",
  "slug": "url-slug",
  "excerpt": "2-3 sentence summary",
  "content": "Full article in HTML with proper headings and structure",
  "tags": ["tag1", "tag2"],
  "seo_title": "SEO title",
  "seo_desc": "Meta description",
  "seo_keywords": "keywords",
  "read_time": 5,
  "image_prompt": "Image generation prompt"
}

Return ONLY valid JSON.`

      const raw = await callAI(prompt, model_id)
      const jsonStr = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()
      const data = JSON.parse(jsonStr)
      res.json({ success: true, data, source_text: text.substring(0, 500) + '...' })
    } else {
      // Return extracted text for use as reference
      res.json({ success: true, data: { reference_text: text.substring(0, 8000), word_count: text.split(/\s+/).length, file_name: req.file.originalname } })
    }
  } catch (err) {
    try { fs.unlinkSync(filePath) } catch {}
    res.status(500).json({ success: false, error: err.message })
  }
})

// ── EXPAND / REWRITE SECTION ──────────────────────────────────────────────────
router.post('/expand', adminMiddleware, async (req, res) => {
  const { text, instruction, model_id } = req.body
  if (!text) return res.status(400).json({ success: false, error: 'Text required' })

  const prompt = `${instruction || 'Expand and improve this content for a design blog'}:

${text}

Return only the improved HTML content, no JSON wrapper, no explanation.`

  try {
    const result = await callAI(prompt, model_id)
    res.json({ success: true, data: result })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ── GENERATE SEO ──────────────────────────────────────────────────────────────
router.post('/seo', adminMiddleware, async (req, res) => {
  const { title, content, model_id } = req.body
  if (!title) return res.status(400).json({ success: false, error: 'Title required' })

  const prompt = `Generate SEO metadata for this blog article:

Title: ${title}
Content excerpt: ${(content || '').substring(0, 500)}

Return JSON:
{
  "seo_title": "SEO title (50-60 chars)",
  "seo_desc": "Meta description (120-160 chars)",
  "seo_keywords": "comma separated keywords",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

Return ONLY valid JSON.`

  try {
    const raw = await callAI(prompt, model_id)
    const jsonStr = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()
    res.json({ success: true, data: JSON.parse(jsonStr) })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ── BLOG CATEGORIES ───────────────────────────────────────────────────────────
router.get('/categories', adminMiddleware, async (req, res) => {
  try {
    const rows = await dbFind(db.settings)
    const s = {}
    rows.forEach(r => { s[(r.key || '').trim()] = r.value })
    const cats = s.blog_categories ? JSON.parse(s.blog_categories) : getDefaultBlogCategories()
    res.json({ success: true, data: cats })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.post('/categories', adminMiddleware, async (req, res) => {
  try {
    const rows = await dbFind(db.settings)
    const s = {}
    rows.forEach(r => { s[(r.key || '').trim()] = r.value })
    const cats = s.blog_categories ? JSON.parse(s.blog_categories) : getDefaultBlogCategories()
    const { name, slug, icon, color } = req.body
    if (!name) return res.status(400).json({ success: false, error: 'Name required' })
    const id = `bcat_${Date.now()}`
    cats.push({ id, name, slug: slug || name.toLowerCase().replace(/\s+/g, '-'), icon: icon || '📝', color: color || '#6366f1' })
    const existing = await dbFindOne(db.settings, { key: 'blog_categories' })
    if (existing) await dbUpdate(db.settings, { key: 'blog_categories' }, { $set: { value: JSON.stringify(cats) } })
    else await dbInsert(db.settings, { key: 'blog_categories', value: JSON.stringify(cats) })
    res.json({ success: true, data: cats })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.delete('/categories/:id', adminMiddleware, async (req, res) => {
  try {
    const rows = await dbFind(db.settings)
    const s = {}
    rows.forEach(r => { s[(r.key || '').trim()] = r.value })
    const cats = (s.blog_categories ? JSON.parse(s.blog_categories) : []).filter(c => c.id !== req.params.id)
    const existing = await dbFindOne(db.settings, { key: 'blog_categories' })
    if (existing) await dbUpdate(db.settings, { key: 'blog_categories' }, { $set: { value: JSON.stringify(cats) } })
    res.json({ success: true, data: cats })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

function getDefaultBlogCategories() {
  return [
    { id: 'bcat_1', name: 'Guides', slug: 'guides', icon: '📖', color: '#6366f1' },
    { id: 'bcat_2', name: 'Tutorials', slug: 'tutorials', icon: '🎓', color: '#8b5cf6' },
    { id: 'bcat_3', name: 'Tips & Tricks', slug: 'tips', icon: '💡', color: '#f59e0b' },
    { id: 'bcat_4', name: 'AI & Automation', slug: 'ai', icon: '🤖', color: '#10b981' },
    { id: 'bcat_5', name: 'Design', slug: 'design', icon: '🎨', color: '#ec4899' },
    { id: 'bcat_6', name: 'News', slug: 'news', icon: '📰', color: '#3b82f6' },
    { id: 'bcat_7', name: 'CorelDRAW', slug: 'coreldraw', icon: '✏️', color: '#ef4444' },
    { id: 'bcat_8', name: 'Fonts', slug: 'fonts', icon: '🔤', color: '#14b8a6' },
    { id: 'bcat_9', name: 'Software Reviews', slug: 'reviews', icon: '⭐', color: '#f97316' },
    { id: 'bcat_10', name: 'Workflow', slug: 'workflow', icon: '⚙️', color: '#64748b' },
  ]
}

module.exports = router
