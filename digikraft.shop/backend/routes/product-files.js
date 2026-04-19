const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { db, dbFind, dbFindOne, dbInsert, dbUpdate, dbRemove } = require('../db/database')
const { adminMiddleware, authMiddleware } = require('../middleware/auth')

const uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(uploadDir, 'products', String(req.params.productId || 'misc'))
    fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const name = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, '-').toLowerCase()
    cb(null, `${name}-${Date.now()}${ext}`)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.zip', '.rar', '.7z', '.pdf', '.psd', '.ai', '.fig', '.cdr', '.eps', '.svg', '.png', '.jpg', '.mp4', '.mov']
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, allowed.includes(ext))
  }
})

// GET /api/v1/product-files/:productId
router.get('/:productId', async (req, res) => {
  try {
    const files = await dbFind(db.product_files, { product_id: parseInt(req.params.productId) })
    res.json({ success: true, data: files })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/v1/product-files/:productId/upload — admin
router.post('/:productId/upload', adminMiddleware, upload.array('files', 10), async (req, res) => {
  try {
    const productId = parseInt(req.params.productId)
    const product = await dbFindOne(db.products, { id: productId })
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' })

    const inserted = []
    for (const file of req.files || []) {
      const fileUrl = `/uploads/products/${productId}/${file.filename}`
      const doc = await dbInsert(db.product_files, {
        id: `${productId}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        product_id: productId,
        name: file.originalname,
        filename: file.filename,
        file_format: path.extname(file.originalname).slice(1).toUpperCase(),
        file_size: formatFileSize(file.size),
        file_size_bytes: file.size,
        path: file.path,
        url: fileUrl,
        version: req.body.version || '1.0.0',
        created_at: new Date()
      })
      inserted.push(doc)

      // If it's an image file, also add to product's images array
      const imageExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
      const ext = path.extname(file.originalname).toLowerCase()
      if (imageExts.includes(ext)) {
        const fullImageUrl = `https://digikraft2-production.up.railway.app${fileUrl}`
        const currentImages = product.images || []
        if (!currentImages.includes(fullImageUrl)) {
          const { dbUpdate } = require('../db/database')
          await dbUpdate(db.products, { id: productId }, {
            $set: { images: [...currentImages, fullImageUrl], updated_at: new Date() }
          })
          // Refresh product reference for next iteration
          product.images = [...currentImages, fullImageUrl]
        }
      }
    }

    res.status(201).json({ success: true, data: inserted, uploaded: inserted.length })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/v1/product-files/:productId — add URL-based file (no upload)
router.post('/:productId', adminMiddleware, async (req, res) => {
  try {
    const productId = parseInt(req.params.productId)
    const { name, url, file_format, file_size, version } = req.body
    if (!name || !url) return res.status(400).json({ success: false, error: 'name and url required' })

    const doc = await dbInsert(db.product_files, {
      id: `${productId}-${Date.now()}`,
      product_id: productId,
      name,
      url,
      file_format: file_format || 'ZIP',
      file_size: file_size || 'N/A',
      version: version || '1.0.0',
      created_at: new Date()
    })

    res.status(201).json({ success: true, data: doc })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// DELETE /api/v1/product-files/:productId/:fileId — admin
router.delete('/:productId/:fileId', adminMiddleware, async (req, res) => {
  try {
    const file = await dbFindOne(db.product_files, { id: req.params.fileId })
    if (file?.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path)
    }

    // If it was an image, remove from product's images array
    if (file) {
      const imageExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
      const ext = path.extname(file.name || file.filename || '').toLowerCase()
      if (imageExts.includes(ext)) {
        const productId = parseInt(req.params.productId)
        const product = await dbFindOne(db.products, { id: productId })
        if (product) {
          const fullUrl = `https://digikraft2-production.up.railway.app${file.url}`
          const updatedImages = (product.images || []).filter(img => img !== fullUrl && img !== file.url)
          await dbUpdate(db.products, { id: productId }, { $set: { images: updatedImages, updated_at: new Date() } })
        }
      }
    }

    await dbRemove(db.product_files, { id: req.params.fileId })
    res.json({ success: true, message: 'File deleted' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

module.exports = router
