const express = require('express')
const router = express.Router()
const { db, dbFind, dbFindOne, dbCount } = require('../db/database')
const { adminMiddleware } = require('../middleware/auth')

// GET /api/v1/dashboard
router.get('/', adminMiddleware, async (req, res) => {
  try {
    const [totalProducts, totalOrders, totalCustomers, allOrders, notifications, reviews] = await Promise.all([
      dbCount(db.products, { status: 'published' }),
      dbCount(db.orders),
      dbCount(db.customers, { role: 'customer' }),
      dbFind(db.orders, {}, { created_at: -1 }),
      dbCount(db.notifications, { read: false }),
      dbCount(db.reviews, { status: 'pending' })
    ])

    const paidOrders = allOrders.filter(o => o.payment_status === 'paid')
    const totalRevenue = paidOrders.reduce((s, o) => s + (o.total || 0), 0)
    const pendingOrders = allOrders.filter(o => o.status === 'pending').length

    const recentOrders = allOrders.slice(0, 10)

    // Top products
    const topProducts = await dbFind(db.products, {}, { downloads: -1 })
    const topProductsSlice = topProducts.slice(0, 5)

    // Category stats
    const allCats = await dbFind(db.categories)
    const allProds = await dbFind(db.products)
    const categoryStats = allCats.map(c => ({
      name: c.name,
      count: allProds.filter(p => p.category_ids && p.category_ids.includes(c.id)).length
    })).sort((a, b) => b.count - a.count)

    res.json({
      success: true,
      data: {
        stats: { totalProducts, totalOrders, totalCustomers, totalRevenue, pendingOrders, unreadNotifs: notifications, pendingReviews: reviews },
        recentOrders,
        topProducts: topProductsSlice,
        categoryStats
      }
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router
