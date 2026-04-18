const express = require('express')
const router = express.Router()
const { db, dbFind, dbUpdate, dbCount } = require('../db/database')
const { adminMiddleware } = require('../middleware/auth')

// GET /api/v1/notifications
router.get('/', adminMiddleware, async (req, res) => {
  try {
    const { limit = 20, unread } = req.query
    let query = {}
    if (unread === 'true') query.read = false

    let notifications = await dbFind(db.notifications, query, { created_at: -1 })
    notifications = notifications.slice(0, parseInt(limit))

    const unreadCount = await dbCount(db.notifications, { read: false })
    res.json({ success: true, data: notifications, unreadCount })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// PUT /api/v1/notifications/read-all
router.put('/read-all', adminMiddleware, async (req, res) => {
  try {
    await dbUpdate(db.notifications, {}, { $set: { read: true } }, { multi: true })
    res.json({ success: true, message: 'All notifications marked as read' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// PUT /api/v1/notifications/:id/read
router.put('/:id/read', adminMiddleware, async (req, res) => {
  try {
    await dbUpdate(db.notifications, { _id: req.params.id }, { $set: { read: true } })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router
