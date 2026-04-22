// ===== AI THUMBNAIL GENERATOR =====
// POST /api/v1/ai/generate-thumbnail
// Body: { prompt, style?, template? }
// Returns: { image_url }

const express = require('express')
const router = express.Router()
const axios = require('axios')
const { adminMiddleware } = require('../middleware/auth')
const aiService = require('../services/ai-service')

// Template definitions for different product categories
const THUMBNAIL_TEMPLATES = {
  'ui-kit': {
    name: 'UI Kit / Components',
    background: 'Clean modern workspace with UI elements, glass morphism effect, professional screen mockup',
    header: 'UI Kit Pro',
    footer: 'Components | Figma • Sketch • Adobe XD',
    aspect_ratio: '16:9',
    style: 'modern'
  },
  'font-pack': {
    name: 'Font / Typography',
    background: 'Elegant typographic texture with subtle letterforms, serif and sans-serif letter samples',
    header: 'Premium Font Family',
    footer: 'Multiple Weights • Commercial License',
    aspect_ratio: '1:1',
    style: 'minimal'
  },
  'logo-bundle': {
    name: 'Logo / Branding',
    background: 'Professional logo mockups on business cards, signage, and digital screens',
    header: 'Logo Bundle',
    footer: 'Vector • Editable • Print Ready',
    aspect_ratio: '1:1',
    style: 'professional'
  },
  '3d-asset': {
    name: '3D Asset / Mockup',
    background: 'Studio photography setup with dramatic lighting, product showcase pedestal',
    header: '3D Asset Pack',
    footer: 'High Poly • Textured • Game Ready',
    aspect_ratio: '1:1',
    style: '3d'
  },
  'template': {
    name: 'Template / Layout',
    background: 'Clean presentation on modern devices, multiple layout previews',
    header: 'Template Collection',
    footer: 'Fully Editable • Layered • Organized',
    aspect_ratio: '16:9',
    style: 'modern'
  },
  'course': {
    name: 'Course / Tutorial',
    background: 'Online learning environment with video player interface, course progress indicators',
    header: 'Complete Course',
    footer: 'HD Videos • Resources • Certificate',
    aspect_ratio: '16:9',
    style: 'professional'
  },
  'custom': {
    name: 'Custom / Generic',
    background: 'Abstract geometric patterns with gradient overlays, subtle textures',
    header: 'Digital Product',
    footer: 'High Quality • Instant Download',
    aspect_ratio: '1:1',
    style: 'modern'
  }
}

// POST /api/v1/ai/analyze-url - Analyze a product URL and extract product data
router.post('/analyze-url', adminMiddleware, async (req, res) => {
  try {
    const { url } = req.body
    if (!url) return res.status(400).json({ success: false, error: 'url is required' })

    const productData = await aiService.analyzeUrl(url)
    res.json({ success: true, data: productData })
  } catch (err) {
    console.error('[AI URL Analysis Error]', err.message)
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/v1/ai/generate-prompt - Generate a thumbnail prompt from product data
router.post('/generate-prompt', adminMiddleware, async (req, res) => {
  try {
    const { url, title, category } = req.body
    
    if (!url && !title) {
      return res.status(400).json({ success: false, error: 'url or title is required' })
    }

    let productData
    if (url) {
      productData = await aiService.analyzeUrl(url)
    } else {
      productData = {
        name: title,
        thumbnail_prompt: `Professional product thumbnail: ${title}, ${category || 'digital design'} product, modern style, clean background, high quality e-commerce image`,
        thumbnail_url: '',
        ai_generated: true
      }
    }

    res.json({
      success: true,
      data: {
        prompt: productData.thumbnail_prompt || 
                `Professional product thumbnail for "${title}", ${category || 'digital design'} product, modern style, clean background, high quality e-commerce image`,
        source_image: productData.thumbnail_url
      }
    })
  } catch (err) {
    console.error('[AI Prompt Generation Error]', err.message)
    res.status(500).json({ success: false, error: err.message })
  }
})

router.post('/generate-thumbnail', adminMiddleware, async (req, res) => {
  try {
    const { prompt, style, template } = req.body
    if (!prompt) return res.status(400).json({ success: false, error: 'prompt is required' })

    const replicateToken = process.env.REPLICATE_API_TOKEN
    if (!replicateToken) {
      return res.status(503).json({ success: false, error: 'REPLICATE_API_TOKEN not configured in .env' })
    }

    // Apply template if specified
    const selectedTemplate = template && THUMBNAIL_TEMPLATES[template] ? THUMBNAIL_TEMPLATES[template] : THUMBNAIL_TEMPLATES.custom
    const templateStyle = style || selectedTemplate.style
    
    // Compose full prompt with template
    const fullPrompt = `Professional product thumbnail: ${prompt}. Template: ${selectedTemplate.name}. Style: ${templateStyle}, ${selectedTemplate.background}, ${selectedTemplate.header}, ${selectedTemplate.footer}, centered composition, e-commerce quality, sharp focus, studio lighting, clean background`

    const response = await axios.post(
      'https://api.replicate.com/v1/predictions',
      {
        version: 'black-forest-labs/flux-schnell',
        input: {
          prompt: fullPrompt,
          aspect_ratio: selectedTemplate.aspect_ratio,
          steps: 4,
          guidance: 3.5,
          output_format: 'webp',
          output_quality: 90
        }
      },
      {
        headers: {
          'Authorization': `Token ${replicateToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 45000
      }
    )

    // Replicate returns a prediction ID - we need to poll for result
    const { id: predictionId, status } = response.data
    
    if (status === 'failed') {
      throw new Error('Replicate prediction failed to start')
    }

    // Poll for completion (max 30 seconds)
    const pollInterval = 500
    const maxPolls = 60
    let polls = 0
    
    while (polls < maxPolls) {
      await new Promise(resolve => setTimeout(resolve, pollInterval))
      
      const pollResponse = await axios.get(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          headers: {
            'Authorization': `Token ${replicateToken}`,
          },
        }
      )

      const { status: pollStatus, output, error } = pollResponse.data
      
      if (pollStatus === 'succeeded' && output) {
        const imageUrl = Array.isArray(output) ? output[0] : output
        return res.json({ 
          success: true, 
          data: { 
            image_url: imageUrl, 
            prompt: fullPrompt,
            provider: 'replicate-flux-schnell',
            template: template || 'custom'
          } 
        })
      }
      
      if (pollStatus === 'failed' || error) {
        throw new Error(`Replicate generation failed: ${error || 'Unknown error'}`)
      }

      polls++
    }

    throw new Error('Image generation timed out after 30 seconds')
    
  } catch (err) {
    console.error('[Replicate Thumbnail Error]', err.response?.data || err.message)
    res.status(500).json({ 
      success: false, 
      error: err.message || 'Failed to generate image'
    })
  }
})

module.exports = router
