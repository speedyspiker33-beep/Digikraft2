const express = require('express')
const router = express.Router()
const { db, dbFind, dbFindOne, dbInsert, dbUpdate, dbRemove, getNextId } = require('../db/database')
const { adminMiddleware, optionalAuth } = require('../middleware/auth')

function slugify(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// GET /api/v1/satellite-pages
router.get('/', optionalAuth, async (req, res) => {
  try {
    const isAdmin = req.user?.role === 'admin'
    const query = isAdmin ? {} : { status: 'published' }
    const pages = await dbFind(db.satellite_pages, query, { sort_order: 1 })

    // Attach product count per page
    const allProducts = await dbFind(db.products, { status: 'published' })
    const enriched = pages.map(p => ({
      ...p,
      product_count: allProducts.filter(prod => prod.satellite_page === p.slug || prod.satellite_page === p.name).length
    }))

    res.json({ success: true, data: enriched })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/v1/satellite-pages/:slug
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const page = await dbFindOne(db.satellite_pages, { slug: req.params.slug })
    if (!page) return res.status(404).json({ success: false, error: 'Page not found' })

    // Get products for this page
    const products = await dbFind(db.products, {
      status: 'published',
      $or: [{ satellite_page: page.slug }, { satellite_page: page.name }]
    })

    res.json({ success: true, data: { ...page, products } })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/v1/satellite-pages — admin
router.post('/', adminMiddleware, async (req, res) => {
  try {
    const { name, slug, description, emoji, status, sort_order, seo_title, seo_desc, hero_title, hero_subtitle } = req.body
    if (!name) return res.status(400).json({ success: false, error: 'Name required' })

    const pageSlug = slug || slugify(name)
    const existing = await dbFindOne(db.satellite_pages, { slug: pageSlug })
    if (existing) return res.status(400).json({ success: false, error: 'Slug already exists' })

    const id = await getNextId(db.satellite_pages)
    const page = await dbInsert(db.satellite_pages, {
      id,
      name,
      slug: pageSlug,
      description: description || '',
      emoji: emoji || '🎨',
      status: status || 'draft',
      sort_order: sort_order || 0,
      seo_title: seo_title || name,
      seo_desc: seo_desc || description || '',
      hero_title: hero_title || name,
      hero_subtitle: hero_subtitle || '',
      created_at: new Date(),
      updated_at: new Date()
    })

    res.status(201).json({ success: true, data: page })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// PUT /api/v1/satellite-pages/:slug — admin
router.put('/:slug', adminMiddleware, async (req, res) => {
  try {
    const updates = { ...req.body, updated_at: new Date() }
    await dbUpdate(db.satellite_pages, { slug: req.params.slug }, { $set: updates })
    const page = await dbFindOne(db.satellite_pages, { slug: req.params.slug })
    res.json({ success: true, data: page })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// DELETE /api/v1/satellite-pages/:slug — admin
router.delete('/:slug', adminMiddleware, async (req, res) => {
  try {
    await dbRemove(db.satellite_pages, { slug: req.params.slug })
    res.json({ success: true, message: 'Page deleted' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router
