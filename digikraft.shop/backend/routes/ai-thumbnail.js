// ===== AI THUMBNAIL GENERATOR =====
// POST /api/v1/ai/generate-thumbnail
// Body: { prompt, style? }
// Returns: { image_url }

const express = require('express')
const router = express.Router()
const axios = require('axios')
const { adminMiddleware } = require('../middleware/auth')

router.post('/generate-thumbnail', adminMiddleware, async (req, res) => {
  try {
    const { prompt, style = 'modern' } = req.body
    if (!prompt) return res.status(400).json({ success: false, error: 'prompt is required' })

    const openrouterKey = process.env.OPENROUTER_API_KEY
    if (!openrouterKey) {
      return res.status(503).json({ success: false, error: 'OPENROUTER_API_KEY not configured' })
    }

    // Use DALL-E 3 via OpenRouter for high-quality product thumbnails
    const fullPrompt = `Create a professional product thumbnail image: ${prompt}. Style: ${style}, clean background, centered composition, high quality, suitable for e-commerce listing.`

    const response = await axios.post(
      'https://openrouter.ai/api/v1/images/generations',
      {
        model: 'openai/dall-e-3',
        prompt: fullPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      },
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
    if (!imageUrl) throw new Error('No image URL in response')

    res.json({ success: true, data: { image_url: imageUrl, prompt: fullPrompt } })
  } catch (err) {
    console.error('[AI Thumbnail Error]', err.message)
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router
