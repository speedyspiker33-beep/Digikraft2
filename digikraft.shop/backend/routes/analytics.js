const express = require('express')
const router = express.Router()
const { db, dbFind, dbCount } = require('../db/database')
const { adminMiddleware } = require('../middleware/auth')

// GET /api/v1/analytics — full analytics dashboard data
router.get('/', adminMiddleware, async (req, res) => {
  try {
    const { range = '30' } = req.query
    const days = parseInt(range) || 30
    const since = new Date(Date.now() - days * 86400000)

    const [allOrders, allProducts, allCustomers, allReviews] = await Promise.all([
      dbFind(db.orders, {}, { created_at: -1 }),
      dbFind(db.products, { status: 'published' }),
      dbFind(db.customers, { role: 'customer' }),
      dbFind(db.reviews, { status: 'approved' })
    ])

    const recentOrders = allOrders.filter(o => new Date(o.created_at) >= since)
    const paidOrders = allOrders.filter(o => o.payment_status === 'paid')
    const recentPaid = recentOrders.filter(o => o.payment_status === 'paid')

    // Revenue by day
    const revenueByDay = {}
    recentPaid.forEach(o => {
      const day = new Date(o.created_at).toISOString().slice(0, 10)
      revenueByDay[day] = (revenueByDay[day] || 0) + (o.total || 0)
    })

    // Orders by day
    const ordersByDay = {}
    recentOrders.forEach(o => {
      const day = new Date(o.created_at).toISOString().slice(0, 10)
      ordersByDay[day] = (ordersByDay[day] || 0) + 1
    })

    // Top products by downloads
    const topProducts = [...allProducts]
      .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
      .slice(0, 10)
      .map(p => ({ id: p.id, title: p.title, slug: p.slug, image: p.image, downloads: p.downloads || 0, rating: p.rating || 0 }))

    // Category breakdown
    const allCats = await dbFind(db.categories)
    const categoryBreakdown = allCats.map(c => ({
      name: c.name,
      slug: c.slug,
      count: allProducts.filter(p => p.category_ids && p.category_ids.includes(c.id)).length,
      downloads: allProducts.filter(p => p.category_ids && p.category_ids.includes(c.id)).reduce((s, p) => s + (p.downloads || 0), 0)
    })).sort((a, b) => b.downloads - a.downloads)

    // Customer growth by month
    const customersByMonth = {}
    allCustomers.forEach(c => {
      const month = new Date(c.created_at).toISOString().slice(0, 7)
      customersByMonth[month] = (customersByMonth[month] || 0) + 1
    })

    // Order status breakdown
    const statusBreakdown = {}
    allOrders.forEach(o => {
      statusBreakdown[o.status || 'pending'] = (statusBreakdown[o.status || 'pending'] || 0) + 1
    })

    // Revenue stats
    const totalRevenue = paidOrders.reduce((s, o) => s + (o.total || 0), 0)
    const periodRevenue = recentPaid.reduce((s, o) => s + (o.total || 0), 0)
    const avgOrderValue = paidOrders.length ? totalRevenue / paidOrders.length : 0

    res.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          periodRevenue,
          totalOrders: allOrders.length,
          periodOrders: recentOrders.length,
          totalCustomers: allCustomers.length,
          totalProducts: allProducts.length,
          avgOrderValue: Math.round(avgOrderValue),
          avgRating: allReviews.length ? (allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length).toFixed(1) : 0
        },
        revenueByDay,
        ordersByDay,
        topProducts,
        categoryBreakdown,
        customersByMonth,
        statusBreakdown
      }
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router
