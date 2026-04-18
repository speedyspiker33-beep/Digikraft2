const express = require('express')
const router = express.Router()
const { db, dbFind, dbFindOne, dbUpdate } = require('../db/database')
const { authMiddleware } = require('../middleware/auth')

// GET /api/downloads
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query
    let downloads = await dbFind(db.downloads, { customer_id: req.user.id }, { created_at: -1 })
    const total = downloads.length
    const offset = (parseInt(page) - 1) * parseInt(limit)
    downloads = downloads.slice(offset, offset + parseInt(limit))

    const result = []
    for (const d of downloads) {
      const product = await dbFindOne(db.products, { id: d.product_id })
      const order = await dbFindOne(db.orders, { id: d.order_id })
      const files = await dbFind(db.product_files, { product_id: d.product_id })

      result.push({
        id: d.id,
        productId: String(d.product_id),
        productName: product?.title || 'Unknown Product',
        productImage: product?.image || '',
        productSlug: product?.slug || '',
        purchaseDate: new Date(order?.created_at || d.created_at),
        orderId: String(d.order_id),
        orderNumber: order?.order_number || `ORD-${d.order_id}`,
        downloadCount: d.download_count || 0,
        lastDownloadDate: d.last_download_at ? new Date(d.last_download_at) : null,
        files: files.length > 0 ? files.map(f => ({
          id: f.id,
          name: f.name,
          format: f.file_format,
          size: f.file_size,
          version: f.version,
          uploadDate: new Date(f.created_at)
        })) : [{
          id: 'default',
          name: `${product?.title || 'product'}.zip`,
          format: 'ZIP',
          size: product?.file_size || 'N/A',
          version: product?.version || '1.0.0',
          uploadDate: new Date(d.created_at)
        }],
        license: {
          type: (product?.license || '').toLowerCase().includes('commercial') ? 'commercial' : 'personal',
          allowsCommercialUse: (product?.license || '').toLowerCase().includes('commercial'),
          allowsRedistribution: (product?.license || '').toLowerCase().includes('extended'),
          allowsResale: false,
          description: product?.license || 'Personal Use License'
        }
      })
    }

    res.json({
      success: true,
      data: result,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, hasMore: offset + result.length < total }
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/downloads/:id/files/:fileId/url
router.get('/:id/files/:fileId/url', authMiddleware, async (req, res) => {
  try {
    const { id, fileId } = req.params
    const download = await dbFindOne(db.downloads, { id, customer_id: req.user.id })
    if (!download) return res.status(404).json({ success: false, error: 'Download not found' })

    // Update download count
    await dbUpdate(db.downloads, { id }, { $inc: { download_count: 1 }, $set: { last_download_at: new Date() } })
    await dbUpdate(db.products, { id: download.product_id }, { $inc: { downloads: 1 } })

    const downloadUrl = `http://localhost:8080/api/downloads/serve/${id}/${fileId}`
    res.json({ success: true, data: { url: downloadUrl, expiresIn: 3600 } })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/downloads/serve/:id/:fileId
router.get('/serve/:id/:fileId', authMiddleware, async (req, res) => {
  try {
    const { id, fileId } = req.params
    const download = await dbFindOne(db.downloads, { id, customer_id: req.user.id })
    if (!download) return res.status(403).json({ success: false, error: 'Access denied' })

    const product = await dbFindOne(db.products, { id: download.product_id })
    res.setHeader('Content-Type', 'application/zip')
    res.setHeader('Content-Disposition', `attachment; filename="${product?.title || 'product'}.zip"`)
    res.send(Buffer.from('PK\x03\x04', 'binary'))
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router
