// ===== AI SERVICE =====
// Handles AI-powered product data generation
// Supports: OpenRouter (Claude, GPT-4, Gemini via one API), OpenAI direct, Gemini direct, rule-based fallback

const axios = require('axios')

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'
const OPENROUTER_MODEL = 'anthropic/claude-3.5-haiku' // Fast + cheap, great for product analysis

class AIService {
  constructor() {
    this.openrouterKey = process.env.OPENROUTER_API_KEY || ''
    this.openaiKey = process.env.OPENAI_API_KEY || ''
    this.geminiKey = process.env.GEMINI_API_KEY || ''
  }

  // Main entry: analyze a URL and generate product listing data
  async analyzeUrl(url) {
    const scraped = await this.scrapeUrl(url)
    const productData = await this.generateProductData(scraped, url)
    return productData
  }

  // Scrape a URL for content
  async scrapeUrl(url) {
    try {
      const cheerio = require('cheerio')
      const res = await axios.get(url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        maxRedirects: 5
      })

      const $ = cheerio.load(res.data)

      // Extract metadata
      const title = $('title').text().trim() ||
        $('meta[property="og:title"]').attr('content') ||
        $('h1').first().text().trim() || ''

      const description = $('meta[name="description"]').attr('content') ||
        $('meta[property="og:description"]').attr('content') ||
        $('p').first().text().trim().substring(0, 500) || ''

      const image = $('meta[property="og:image"]').attr('content') ||
        $('meta[name="twitter:image"]').attr('content') ||
        $('img').first().attr('src') || ''

      const price = this.extractPrice($)
      const keywords = $('meta[name="keywords"]').attr('content') || ''

      // Get main body text (limited)
      $('script, style, nav, footer, header').remove()
      const bodyText = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 3000)

      // Resolve relative image URL
      let resolvedImage = image
      if (image && !image.startsWith('http')) {
        try {
          resolvedImage = new URL(image, url).href
        } catch {}
      }

      return { title, description, image: resolvedImage, price, keywords, bodyText, url }
    } catch (err) {
      console.error('[AI Scrape Error]', err.message)
      return { title: '', description: '', image: '', price: null, keywords: '', bodyText: '', url }
    }
  }

  // Extract price from page
  extractPrice($) {
    const priceSelectors = [
      '[class*="price"]', '[id*="price"]', '[class*="cost"]',
      '[class*="amount"]', '[data-price]', '.price', '#price'
    ]
    for (const sel of priceSelectors) {
      const text = $(sel).first().text().trim()
      const match = text.match(/[\$₹€£]?\s*(\d+(?:[,\.]\d+)*)/i)
      if (match) {
        const num = parseFloat(match[1].replace(',', ''))
        if (num > 0 && num < 100000) return num
      }
    }
    return null
  }

  // Generate product data using AI or fallback
  async generateProductData(scraped, url) {
    const prompt = this.buildPrompt(scraped, url)

    // Try OpenRouter first (supports Claude, GPT-4, Gemini via one key)
    if (this.openrouterKey) {
      try {
        return await this.callOpenRouter(prompt, scraped)
      } catch (e) {
        console.error('[OpenRouter Error]', e.message)
      }
    }

    // Try OpenAI direct
    if (this.openaiKey) {
      try {
        return await this.callOpenAI(prompt, scraped)
      } catch (e) {
        console.error('[OpenAI Error]', e.message)
      }
    }

    // Try Gemini
    if (this.geminiKey) {
      try {
        return await this.callGemini(prompt, scraped)
      } catch (e) {
        console.error('[Gemini Error]', e.message)
      }
    }

    // Fallback: rule-based extraction
    return this.ruleBasedExtraction(scraped, url)
  }

  buildPrompt(scraped, url) {
    return `You are a digital product listing expert for DigiKraft.shop, an Indian digital marketplace.
Analyze this product page and generate a complete product listing in JSON format.

URL: ${url}
Page Title: ${scraped.title}
Meta Description: ${scraped.description}
Keywords: ${scraped.keywords}
Page Content (excerpt): ${scraped.bodyText.substring(0, 1500)}

CRITICAL RULES:
- description must be PLAIN TEXT only — no HTML tags, no <p>, no <strong>, no <ul>, no symbols
- Write description as clean readable paragraphs separated by newlines
- short_description must be one clean sentence, no HTML
- All text fields must be clean, professional, and symbol-free

Generate a JSON object with these exact fields:
{
  "name": "Product name (clear, marketable, max 80 chars)",
  "slug": "url-friendly-slug",
  "short_description": "One clean sentence description (max 120 chars, no HTML)",
  "description": "Full plain text description (3-4 short paragraphs separated by \\n\\n, highlight features and benefits, NO HTML tags, NO symbols like <> or &)",
  "price": number (in INR, suggest based on content type and market),
  "original_price": number (original price before discount, 20-40% higher than price),
  "category": "one of: Graphics, Fonts, Templates, UI Kits, Plugins, 3D Assets, Courses, Tools",
  "tags": ["array", "of", "5-8", "relevant", "tags"],
  "seo_title": "SEO optimized title (max 60 chars)",
  "seo_description": "SEO meta description (max 160 chars)",
  "seo_keywords": "comma separated keywords",
  "features": ["feature 1", "feature 2", "feature 3", "feature 4", "feature 5"],
  "file_format": "e.g. PDF, AI, PSD, TTF, ZIP",
  "license_type": "one of: Personal, Commercial, Extended",
  "thumbnail_prompt": "Detailed prompt to generate a thumbnail image for this product"
}

Return ONLY valid JSON, no markdown, no explanation.`
  }

  async callOpenRouter(prompt, scraped) {
    const res = await axios.post(
      `${OPENROUTER_BASE}/chat/completions`,
      {
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a digital product listing expert for DigiKraft.shop, an Indian digital marketplace. Always respond with valid JSON only, no markdown, no explanation.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      },
      {
        headers: {
          'Authorization': `Bearer ${this.openrouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'DigiKraft Admin'
        },
        timeout: 30000
      }
    )

    const content = res.data.choices[0].message.content.trim()
    // Strip markdown code blocks if present
    const jsonStr = content.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()
    const parsed = JSON.parse(jsonStr)
    console.log('[OpenRouter] Model used:', res.data.model)
    return this.normalizeProductData(parsed, scraped)
  }

  async callOpenAI(prompt, scraped) {
    const { OpenAI } = require('openai')
    const client = new OpenAI({ apiKey: this.openaiKey })

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: 'json_object' }
    })

    const content = response.choices[0].message.content
    const parsed = JSON.parse(content)
    return this.normalizeProductData(parsed, scraped)
  }

  async callGemini(prompt, scraped) {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1500 }
      },
      { timeout: 30000 }
    )

    const text = res.data.candidates[0].content.parts[0].text
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in Gemini response')
    const parsed = JSON.parse(jsonMatch[0])
    return this.normalizeProductData(parsed, scraped)
  }

  // Rule-based fallback when no AI key is configured
  ruleBasedExtraction(scraped, url) {
    const title = scraped.title || 'Digital Product'
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 60)

    // Detect category from content
    const content = (scraped.title + ' ' + scraped.description + ' ' + scraped.bodyText).toLowerCase()
    let category = 'Templates'
    if (content.match(/font|typeface|typography/)) category = 'Fonts'
    else if (content.match(/icon|illustration|vector|svg|graphic/)) category = 'Graphics'
    else if (content.match(/ui kit|design system|component/)) category = 'UI Kits'
    else if (content.match(/plugin|extension|addon|script/)) category = 'Plugins'
    else if (content.match(/3d|model|mockup|render/)) category = '3D Assets'
    else if (content.match(/course|tutorial|learn|training/)) category = 'Courses'
    else if (content.match(/tool|software|app|generator/)) category = 'Tools'

    // Suggest price in INR
    let price = scraped.price || 499
    if (scraped.price && scraped.price < 100) price = scraped.price * 83 // USD to INR
    price = Math.round(price / 10) * 10 // Round to nearest 10

    // Extract tags from keywords and title
    const tagSource = (scraped.keywords + ' ' + scraped.title).toLowerCase()
    const commonTags = ['design', 'digital', 'download', 'premium', 'professional', 'creative', 'modern', 'minimal']
    const tags = tagSource.split(/[,\s]+/).filter(t => t.length > 3).slice(0, 5)
    if (tags.length < 3) tags.push(...commonTags.slice(0, 5 - tags.length))

    return {
      name: title.substring(0, 80),
      slug,
      short_description: scraped.description.substring(0, 120) || `Premium ${category.toLowerCase()} for creative professionals`,
      description: this.generateDescription(title, category, scraped.description),
      price,
      original_price: Math.round(price * 1.3 / 10) * 10,
      category,
      tags: [...new Set(tags)].slice(0, 8),
      seo_title: title.substring(0, 60),
      seo_description: scraped.description.substring(0, 160) || `Download ${title} — premium ${category.toLowerCase()} for designers`,
      seo_keywords: tags.join(', '),
      features: [
        'Instant digital download',
        'High quality files included',
        'Commercial license available',
        'Regular updates',
        'Email support'
      ],
      file_format: this.detectFileFormat(content),
      license_type: 'Commercial',
      thumbnail_url: scraped.image || '',
      source_url: url,
      ai_generated: false
    }
  }

  generateDescription(title, category, excerpt) {
    const catLower = category.toLowerCase()
    const intro = excerpt && excerpt.length > 20
      ? excerpt.substring(0, 200)
      : `A premium ${catLower} designed for creative professionals and designers.`

    return `${title} is a high-quality ${catLower} built for professional use.\n\n${intro}\n\nThis product includes high-resolution files ready for immediate use, multiple formats for maximum compatibility, and a commercial license for client projects.\n\nPerfect for graphic designers, web developers, and creative agencies looking for professional-grade digital assets.`
  }

  detectFileFormat(content) {
    if (content.match(/\.psd|photoshop/)) return 'PSD'
    if (content.match(/\.ai|illustrator/)) return 'AI'
    if (content.match(/\.ttf|\.otf|\.woff/)) return 'TTF/OTF'
    if (content.match(/\.figma/)) return 'Figma'
    if (content.match(/\.sketch/)) return 'Sketch'
    if (content.match(/\.pdf/)) return 'PDF'
    if (content.match(/\.svg/)) return 'SVG'
    if (content.match(/\.zip|bundle/)) return 'ZIP'
    return 'ZIP'
  }

  normalizeProductData(parsed, scraped) {
    return {
      name: parsed.name || scraped.title || 'Digital Product',
      slug: parsed.slug || parsed.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'product',
      short_description: parsed.short_description || scraped.description?.substring(0, 120) || '',
      description: parsed.description || '',
      price: parsed.price || 499,
      original_price: parsed.original_price || Math.round((parsed.price || 499) * 1.3),
      category: parsed.category || 'Templates',
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      seo_title: parsed.seo_title || parsed.name || '',
      seo_description: parsed.seo_description || scraped.description?.substring(0, 160) || '',
      seo_keywords: parsed.seo_keywords || '',
      features: Array.isArray(parsed.features) ? parsed.features : [],
      file_format: parsed.file_format || 'ZIP',
      license_type: parsed.license_type || 'Commercial',
      thumbnail_prompt: parsed.thumbnail_prompt || '',
      thumbnail_url: scraped.image || '',
      source_url: scraped.url,
      ai_generated: true
    }
  }

  // Extract all URLs from text
  extractUrlsFromText(text) {
    const urlRegex = /https?:\/\/[^\s\)\]\>"']+/gi
    const matches = text.match(urlRegex) || []
    // Filter out common non-product URLs
    return [...new Set(matches)].filter(url => {
      const lower = url.toLowerCase()
      return !lower.includes('google.com/search') &&
        !lower.includes('facebook.com') &&
        !lower.includes('twitter.com') &&
        !lower.includes('instagram.com') &&
        !lower.includes('youtube.com/watch') &&
        !lower.includes('mailto:') &&
        url.length < 500
    })
  }
}

module.exports = new AIService()
