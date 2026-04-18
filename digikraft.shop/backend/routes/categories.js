const express = require('express')
const router = express.Router()
const { db, dbFind, dbFindOne, dbInsert, dbUpdate, dbRemove, getNextId } = require('../db/database')
const { adminMiddleware } = require('../middleware/auth')

// GET /api/v1/categories
router.get('/', async (req, res) => {
  try {
    const categories = await dbFind(db.categories, { status: 'active' }, { sort_order: 1 })

    // Count products per category
    const allProducts = await dbFind(db.products, { status: 'published' })
    const enriched = categories.map(c => {
      const count = allProducts.filter(p => p.category_ids && p.category_ids.includes(c.id)).length
      return { ...c, product_count: count }
    })

    res.json({ success: true, data: enriched })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/v1/categories/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const cat = await dbFindOne(db.categories, { $or: [{ id: parseInt(id) || 0 }, { slug: id }] })
    if (!cat) return res.status(404).json({ success: false, error: 'Category not found' })
    res.json({ success: true, data: cat })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/v1/categories — admin
router.post('/', adminMiddleware, async (req, res) => {
  try {
    const { name, slug, description, icon, color, parent_id, seo_title, seo_desc, featured, status, sort_order } = req.body
    if (!name) return res.status(400).json({ success: false, error: 'Name required' })

    const catSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const existing = await dbFindOne(db.categories, { slug: catSlug })
    if (existing) return res.status(400).json({ success: false, error: 'Slug already exists' })

    const id = await getNextId(db.categories)
    const cat = await dbInsert(db.categories, {
      id, name, slug: catSlug,
      description: description || '',
      icon: icon || '🎨',
      color: color || '#6366f1',
      parent_id: parent_id || null,
      seo_title: seo_title || '',
      seo_desc: seo_desc || '',
      featured: !!featured,
      status: status || 'active',
      sort_order: sort_order || 0,
      created_at: new Date()
    })

    res.status(201).json({ success: true, data: cat })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// PUT /api/v1/categories/:id — admin
router.put('/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    await dbUpdate(db.categories, { id: parseInt(id) }, { $set: { ...req.body, updated_at: new Date() } })
    const cat = await dbFindOne(db.categories, { id: parseInt(id) })
    res.json({ success: true, data: cat })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// DELETE /api/v1/categories/:id — admin
router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    await dbRemove(db.categories, { id: parseInt(req.params.id) })
    res.json({ success: true, message: 'Category deleted' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router
