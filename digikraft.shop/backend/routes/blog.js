const express = require('express')
const router = express.Router()
const { db, dbFind, dbFindOne, dbInsert, dbUpdate, dbRemove, getNextId } = require('../db/database')
const { adminMiddleware, optionalAuth } = require('../middleware/auth')

function slugify(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// GET /api/v1/blog — public (published only) or admin (all)
router.get('/', async (req, res) => {
  try {
    const { category, search, status, page = 1, limit = 20 } = req.query

    // Check if admin token (try both secrets)
    let isAdmin = false
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      const jwt = require('jsonwebtoken')
      const secrets = [process.env.JWT_SECRET, process.env.ADMIN_JWT_SECRET].filter(Boolean)
      for (const secret of secrets) {
        try {
          const decoded = jwt.verify(token, secret)
          if (decoded.role === 'admin') { isAdmin = true; break }
        } catch {}
      }
    }

    let query = {}
    if (!isAdmin) query.status = 'published'
    else if (status && status !== 'all') query.status = status
    // status=all or admin with no status filter → no status constraint

    if (category) query.category = category

    let posts = await dbFind(db.blog_posts, query, { created_at: -1 })

    if (search) {
      const re = new RegExp(search, 'i')
      posts = posts.filter(p => re.test(p.title) || re.test(p.excerpt) || re.test(p.content))
    }

    const total = posts.length
    const offset = (parseInt(page) - 1) * parseInt(limit)
    posts = posts.slice(offset, offset + parseInt(limit))

    res.json({
      success: true,
      data: posts,
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/v1/blog/:slug
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const post = await dbFindOne(db.blog_posts, { slug: req.params.slug })
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' })
    if (post.status !== 'published' && req.user?.role !== 'admin') {
      return res.status(404).json({ success: false, error: 'Post not found' })
    }

    // Increment views
    await dbUpdate(db.blog_posts, { slug: req.params.slug }, { $inc: { views: 1 } })

    res.json({ success: true, data: post })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/v1/blog — admin
router.post('/', adminMiddleware, async (req, res) => {
  try {
    const { title, slug, excerpt, content, category, tags, image, status, seo_title, seo_desc } = req.body
    if (!title || !content) return res.status(400).json({ success: false, error: 'Title and content required' })

    const baseSlug = slug || slugify(title)
    let postSlug = baseSlug
    let counter = 2
    while (await dbFindOne(db.blog_posts, { slug: postSlug })) {
      postSlug = `${baseSlug}-${counter++}`
    }

    const id = await getNextId(db.blog_posts)
    const post = await dbInsert(db.blog_posts, {
      id,
      title,
      slug: postSlug,
      excerpt: excerpt || '',
      content,
      category: category || 'General',
      tags: tags || [],
      image: image || '',
      status: status || 'draft',
      seo_title: seo_title || title,
      seo_desc: seo_desc || excerpt || '',
      views: 0,
      author: req.admin?.email || 'admin@digikraft.shop',
      created_at: new Date(),
      updated_at: new Date()
    })

    res.status(201).json({ success: true, data: post })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// PUT /api/v1/blog/:slug — admin
router.put('/:slug', adminMiddleware, async (req, res) => {
  try {
    const updates = { ...req.body, updated_at: new Date() }
    delete updates.slug // don't allow slug change via PUT
    await dbUpdate(db.blog_posts, { slug: req.params.slug }, { $set: updates })
    const post = await dbFindOne(db.blog_posts, { slug: req.params.slug })
    res.json({ success: true, data: post })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// DELETE /api/v1/blog/:slug — admin
router.delete('/:slug', adminMiddleware, async (req, res) => {
  try {
    await dbRemove(db.blog_posts, { slug: req.params.slug })
    res.json({ success: true, message: 'Post deleted' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router
