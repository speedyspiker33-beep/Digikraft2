const express = require('express')
const router = express.Router()
const { db, dbFind, dbFindOne, dbInsert, dbUpdate, dbRemove, dbCount, getNextId } = require('../db/database')
const { adminMiddleware, optionalAuth } = require('../middleware/auth')

function slugify(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// GET /api/v1/products
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, search, featured, status, page = 1, limit = 50, sort = 'trending' } = req.query
    let query = {}

    // status=all → no filter; status=draft/published → filter; no status → published only
    if (status === 'all') {
      // no status filter
    } else if (status) {
      query.status = status
    } else {
      query.status = 'published'
    }

    if (featured === 'true') query.featured = true
    if (search) {
      const re = new RegExp(search, 'i')
      query.$or = [{ title: re }, { description: re }, { tags: { $elemMatch: re } }]
    }

    let products = await dbFind(db.products, query)

    // Filter by category
    if (category) {
      const cat = await dbFindOne(db.categories, { $or: [{ slug: category }, { id: parseInt(category) || 0 }] })
      if (cat) {
        products = products.filter(p => p.category_ids && p.category_ids.includes(cat.id))
      }
    }

    // Sort
    const sortFns = {
      trending: (a, b) => (b.downloads || 0) - (a.downloads || 0),
      latest: (a, b) => new Date(b.created_at) - new Date(a.created_at),
      'price-low': (a, b) => a.price - b.price,
      'price-high': (a, b) => b.price - a.price,
      rating: (a, b) => (b.rating || 0) - (a.rating || 0)
    }
    products.sort(sortFns[sort] || sortFns.trending)

    const total = products.length
    const offset = (parseInt(page) - 1) * parseInt(limit)
    const paginated = products.slice(offset, offset + parseInt(limit))

    // Attach category info
    const allCats = await dbFind(db.categories)
    const catMap = {}
    allCats.forEach(c => { catMap[c.id] = c })

    const enriched = paginated.map(p => ({
      ...p,
      categories: (p.category_ids || []).map(id => catMap[id]).filter(Boolean)
    }))

    res.json({
      success: true,
      data: {
        products: enriched,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
      }
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/v1/products/:id
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params
    const product = await dbFindOne(db.products, { $or: [{ id: parseInt(id) || 0 }, { slug: id }] })
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' })

    const allCats = await dbFind(db.categories)
    const catMap = {}
    allCats.forEach(c => { catMap[c.id] = c })

    const files = await dbFind(db.product_files, { product_id: product.id })
    const reviews = await dbFind(db.reviews, { product_id: product.id, status: 'approved' })

    // Fetch linked blog posts
    let linkedBlogPosts = []
    if (Array.isArray(product.linked_blog_slugs) && product.linked_blog_slugs.length) {
      const allPosts = await dbFind(db.blog_posts, { status: 'published' })
      linkedBlogPosts = product.linked_blog_slugs
        .map(slug => allPosts.find(p => p.slug === slug))
        .filter(Boolean)
        .map(({ content, ...p }) => p) // strip full content for performance
    }

    res.json({
      success: true,
      data: {
        ...product,
        categories: (product.category_ids || []).map(id => catMap[id]).filter(Boolean),
        files,
        reviews,
        linked_blog_posts: linkedBlogPosts
      }
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/v1/products — admin
router.post('/', adminMiddleware, async (req, res) => {
  try {
    const {
      title, slug, description, short_description, price, sale_price,
      image, images, file_format, file_size, compatibility, version,
      license, tags, featured, show_on_main, satellite_page, status,
      seo_title, seo_desc, categories
    } = req.body

    if (!title || price === undefined) return res.status(400).json({ success: false, error: 'Title and price required' })

    const baseSlug = slug || slugify(title)
    // Auto-increment slug if duplicate exists
    let productSlug = baseSlug
    let counter = 2
    while (await dbFindOne(db.products, { slug: productSlug })) {
      productSlug = `${baseSlug}-${counter++}`
    }

    const id = await getNextId(db.products)
    const product = {
      id,
      title, slug: productSlug,
      description: description || '',
      short_description: short_description || '',
      price: parseFloat(price),
      sale_price: sale_price ? parseFloat(sale_price) : null,
      image: image || '',
      images: images || [],
      file_format: file_format || '',
      file_size: file_size || '',
      compatibility: compatibility || '',
      version: version || '1.0.0',
      license: license || 'Personal Use',
      tags: tags || [],
      featured: !!featured,
      show_on_main: show_on_main !== false,
      satellite_page: satellite_page || null,
      status: status || 'published',
      seo_title: seo_title || '',
      seo_desc: seo_desc || '',
      category_ids: categories || [],
      downloads: 0,
      rating: 4.5,
      review_count: 0,
      created_at: new Date(),
      updated_at: new Date()
    }

    const created = await dbInsert(db.products, product)

    // Notification
    await dbInsert(db.notifications, {
      type: 'product_created',
      title: 'New Product Added',
      message: `"${title}" has been added`,
      data: { productId: id },
      read: false,
      created_at: new Date()
    })

    res.status(201).json({ success: true, data: created })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// PUT /api/v1/products/:id — admin
router.put('/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const product = await dbFindOne(db.products, { id: parseInt(id) })
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' })

    const updates = { ...req.body, updated_at: new Date() }
    if (updates.price) updates.price = parseFloat(updates.price)
    if (updates.sale_price) updates.sale_price = parseFloat(updates.sale_price)
    if (updates.categories) { updates.category_ids = updates.categories; delete updates.categories }

    await dbUpdate(db.products, { id: parseInt(id) }, { $set: updates })
    const updated = await dbFindOne(db.products, { id: parseInt(id) })

    const allCats = await dbFind(db.categories)
    const catMap = {}
    allCats.forEach(c => { catMap[c.id] = c })

    res.json({
      success: true,
      data: { ...updated, categories: (updated.category_ids || []).map(cid => catMap[cid]).filter(Boolean) }
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// DELETE /api/v1/products/:id — admin
router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const n = await dbRemove(db.products, { id: parseInt(id) })
    if (!n) return res.status(404).json({ success: false, error: 'Product not found' })
    res.json({ success: true, message: 'Product deleted' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/v1/products/bulk-import — admin
router.post('/bulk-import', adminMiddleware, async (req, res) => {
  try {
    const { products } = req.body
    if (!products || !Array.isArray(products)) return res.status(400).json({ success: false, error: 'products array required' })

    let imported = 0
    for (const p of products) {
      const productSlug = p.slug || slugify(p.name || p.title || '')
      const existing = await dbFindOne(db.products, { slug: productSlug })
      if (!existing) {
        const id = await getNextId(db.products)
        await dbInsert(db.products, {
          id,
          title: p.name || p.title,
          slug: productSlug,
          description: p.description || '',
          short_description: p.shortDescription || '',
          price: parseFloat(p.price) || 0,
          sale_price: p.originalPrice ? parseFloat(p.originalPrice) : null,
          image: p.image || '',
          images: p.images || [],
          tags: p.tags || [],
          featured: !!p.featured,
          show_on_main: true,
          status: 'published',
          category_ids: p.categoryId ? [p.categoryId] : [],
          downloads: p.sales || 0,
          rating: p.rating || 4.5,
          review_count: p.reviewCount || 0,
          created_at: new Date(),
          updated_at: new Date()
        })
        imported++
      }
    }

    res.json({ success: true, message: `Imported ${imported} products`, imported })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router
