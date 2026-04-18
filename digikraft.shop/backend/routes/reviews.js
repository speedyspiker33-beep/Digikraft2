const express = require('express')
const router = express.Router()
const { db, dbFind, dbFindOne, dbInsert, dbUpdate, dbRemove, getNextId } = require('../db/database')
const { adminMiddleware, authMiddleware, optionalAuth } = require('../middleware/auth')

// GET /api/v1/reviews — admin gets all, public gets approved only
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { product_id, status, page = 1, limit = 20 } = req.query
    const isAdmin = req.user?.role === 'admin'

    let query = {}
    if (product_id) query.product_id = parseInt(product_id)
    if (status) query.status = status
    else if (!isAdmin) query.status = 'approved'

    let reviews = await dbFind(db.reviews, query, { created_at: -1 })
    const total = reviews.length
    const offset = (parseInt(page) - 1) * parseInt(limit)
    reviews = reviews.slice(offset, offset + parseInt(limit))

    res.json({ success: true, data: { reviews, pagination: { page: parseInt(page), limit: parseInt(limit), total } } })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/v1/reviews — authenticated customer
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { product_id, rating, title, body } = req.body
    if (!product_id || !rating) return res.status(400).json({ success: false, error: 'Product ID and rating required' })

    // Check if customer purchased this product
    const download = await dbFindOne(db.downloads, { customer_id: req.user.id, product_id: parseInt(product_id) })
    if (!download) return res.status(403).json({ success: false, error: 'You must purchase this product to review it' })

    // Check for existing review
    const existing = await dbFindOne(db.reviews, { product_id: parseInt(product_id), customer_id: req.user.id })
    if (existing) return res.status(400).json({ success: false, error: 'You have already reviewed this product' })

    const id = await getNextId(db.reviews)
    const review = await dbInsert(db.reviews, {
      id,
      product_id: parseInt(product_id),
      customer_id: req.user.id,
      customer_name: req.user.name || req.user.email,
      rating: Math.min(5, Math.max(1, parseInt(rating))),
      title: title || '',
      body: body || '',
      status: 'pending',
      created_at: new Date()
    })

    // Notify admin
    await dbInsert(db.notifications, {
      type: 'new_review',
      title: 'New Review Pending',
      message: `${req.user.email} left a ${rating}-star review`,
      data: { reviewId: id, productId: product_id },
      read: false,
      created_at: new Date()
    })

    res.status(201).json({ success: true, data: review })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// PUT /api/v1/reviews/:id — admin approve/reject
router.put('/:id', adminMiddleware, async (req, res) => {
  try {
    const { status, admin_reply } = req.body
    const updates = { updated_at: new Date() }
    if (status) updates.status = status
    if (admin_reply) updates.admin_reply = admin_reply

    await dbUpdate(db.reviews, { id: parseInt(req.params.id) }, { $set: updates })

    // Update product rating if approved
    if (status === 'approved') {
      const review = await dbFindOne(db.reviews, { id: parseInt(req.params.id) })
      if (review) {
        const allReviews = await dbFind(db.reviews, { product_id: review.product_id, status: 'approved' })
        const avgRating = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length
        await dbUpdate(db.products, { id: review.product_id }, {
          $set: { rating: Math.round(avgRating * 10) / 10, review_count: allReviews.length }
        })
      }
    }

    const updated = await dbFindOne(db.reviews, { id: parseInt(req.params.id) })
    res.json({ success: true, data: updated })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// DELETE /api/v1/reviews/:id — admin
router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    await dbRemove(db.reviews, { id: parseInt(req.params.id) })
    res.json({ success: true, message: 'Review deleted' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router
