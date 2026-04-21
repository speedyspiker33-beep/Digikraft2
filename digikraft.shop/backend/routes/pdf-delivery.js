// ===== PDF DELIVERY ROUTE =====
// POST /api/v1/pdf-delivery/generate
//   Body: { productUrl, productName, productImage, downloadLink, orderId?, customerName? }
// GET  /api/v1/pdf-delivery/preview/:productId
//   Generates a PDF for a product by its DB id (admin preview)

const express = require('express')
const router = express.Router()
const PDFDocument = require('pdfkit')
const axios = require('axios')
const path = require('path')
const fs = require('fs')
const { db, dbFind, dbFindOne } = require('../db/database')
const { uploadToDrive } = require('../services/google-drive')

// ── helpers ──────────────────────────────────────────────────────────────────

// Download a remote image into a Buffer (for embedding in PDF)
async function fetchImageBuffer(url) {
  if (!url) return null
  try {
    const res = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 8000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })
    return Buffer.from(res.data)
  } catch {
    return null
  }
}

// Brand colours
const BRAND = {
  primary:   '#6366f1',   // indigo
  dark:      '#1e1b4b',   // deep navy
  accent:    '#f59e0b',   // amber
  text:      '#1f2937',
  muted:     '#6b7280',
  white:     '#ffffff',
  lightBg:   '#f8f7ff',
  border:    '#e5e7eb',
}

// Convert hex to RGB array for pdfkit
function hex(h) {
  const r = parseInt(h.slice(1,3),16)
  const g = parseInt(h.slice(3,5),16)
  const b = parseInt(h.slice(5,7),16)
  return [r,g,b]
}

// ── PDF builder ───────────────────────────────────────────────────────────────

async function buildPDF(opts, res) {
  const doc = new PDFDocument({ size: 'A4', margin: 0, info: {
    Title: `Thank You — ${opts.productName || 'Your Digital Product'}`,
    Author: 'DigiKraft.shop',
    Subject: 'Order Confirmation & Download',
  }})
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="digikraft-order${opts.orderId ? '-' + opts.orderId : ''}.pdf"`)
  doc.pipe(res)
  await _drawPDF(doc, opts)
  doc.end()
}

// ── Core drawing logic (shared by streaming + buffer) ─────────────────────────
async function _drawPDF(doc, opts) {
  const {
    productName   = 'Your Digital Product',
    productUrl    = '',
    productImage  = '',
    downloadLink  = '',
    orderId       = '',
    customerName  = 'Valued Customer',
    relatedProducts = [],
  } = opts

  const W = doc.page.width   // 595
  const H = doc.page.height  // 842

  // ── PAGE 1: Thank You + Download ─────────────────────────────────────────

  // Full-page gradient background (simulate with rect)
  doc.rect(0, 0, W, H).fill(BRAND.lightBg)

  // Top header band
  doc.rect(0, 0, W, 180).fill(BRAND.dark)

  // Decorative circles (brand feel)
  doc.circle(W - 60, 30, 80).fillOpacity(0.08).fill(BRAND.primary)
  doc.circle(40, 160, 60).fillOpacity(0.06).fill(BRAND.accent)
  doc.fillOpacity(1)

  // Logo / brand name
  doc.fontSize(22).font('Helvetica-Bold')
     .fillColor(BRAND.white)
     .text('DigiKraft', 40, 28, { continued: true })
     .fontSize(22).font('Helvetica')
     .fillColor(BRAND.accent)
     .text('.shop')

  // Tagline
  doc.fontSize(9).font('Helvetica')
     .fillColor('#a5b4fc')
     .text('Premium Digital Products', 40, 56)

  // Big thank-you headline
  doc.fontSize(30).font('Helvetica-Bold')
     .fillColor(BRAND.white)
     .text('Thank You!', 40, 90)

  doc.fontSize(13).font('Helvetica')
     .fillColor('#c7d2fe')
     .text(`Hi ${customerName}, your purchase is confirmed.`, 40, 130)

  // Order badge (top-right)
  if (orderId) {
    doc.roundedRect(W - 180, 20, 140, 36, 8)
       .fill('rgba(255,255,255,0.12)')
    doc.fontSize(9).font('Helvetica')
       .fillColor('#a5b4fc')
       .text('ORDER', W - 170, 28)
    doc.fontSize(11).font('Helvetica-Bold')
       .fillColor(BRAND.white)
       .text(`#${orderId}`, W - 170, 40)
  }

  // ── Product card ──────────────────────────────────────────────────────────
  const cardY = 200
  const cardH = 200
  doc.roundedRect(30, cardY, W - 60, cardH, 14)
     .fillAndStroke(BRAND.white, BRAND.border)

  // Product image (left side of card)
  const imgBuf = await fetchImageBuffer(productImage)
  const imgX = 50, imgY = cardY + 20, imgW = 140, imgH = 160
  if (imgBuf) {
    try {
      doc.save()
         .roundedRect(imgX, imgY, imgW, imgH, 10)
         .clip()
         .image(imgBuf, imgX, imgY, { width: imgW, height: imgH, cover: [imgW, imgH] })
         .restore()
    } catch {
      // fallback placeholder
      doc.roundedRect(imgX, imgY, imgW, imgH, 10).fill('#e0e7ff')
      doc.fontSize(10).fillColor(BRAND.muted).text('No Image', imgX + 40, imgY + 70)
    }
  } else {
    doc.roundedRect(imgX, imgY, imgW, imgH, 10).fill('#e0e7ff')
    doc.fontSize(10).fillColor(BRAND.muted).text('No Image', imgX + 40, imgY + 70)
  }

  // Product info (right side of card)
  const infoX = imgX + imgW + 20
  const infoW = W - 60 - imgW - 60

  // "Your Purchase" label
  doc.fontSize(9).font('Helvetica-Bold')
     .fillColor(BRAND.primary)
     .text('YOUR PURCHASE', infoX, cardY + 24)

  // Product name
  doc.fontSize(17).font('Helvetica-Bold')
     .fillColor(BRAND.text)
     .text(productName, infoX, cardY + 40, { width: infoW, lineGap: 2 })

  // Source URL (small)
  if (productUrl) {
    doc.fontSize(9).font('Helvetica')
       .fillColor(BRAND.muted)
       .text(productUrl.length > 55 ? productUrl.substring(0, 55) + '…' : productUrl,
             infoX, cardY + 80, { width: infoW })
  }

  // Download button (styled rect + text)
  const btnY = cardY + 110
  const btnW = Math.min(infoW, 200)
  doc.roundedRect(infoX, btnY, btnW, 42, 10).fill(BRAND.primary)
  doc.fontSize(13).font('Helvetica-Bold')
     .fillColor(BRAND.white)
     .text('⬇  Download Now', infoX + 12, btnY + 13, { width: btnW - 24, align: 'center' })

  // Clickable link overlay
  if (downloadLink) {
    doc.link(infoX, btnY, btnW, 42, downloadLink)
  }

  // Small link text below button
  if (downloadLink) {
    doc.fontSize(8).font('Helvetica')
       .fillColor(BRAND.muted)
       .text(downloadLink.length > 60 ? downloadLink.substring(0, 60) + '…' : downloadLink,
             infoX, btnY + 50, { width: infoW })
  }

  // ── Info boxes row ────────────────────────────────────────────────────────
  const boxY = cardY + cardH + 20
  const boxes = [
    { icon: '📧', title: 'Email Sent', body: 'Confirmation & download link sent to your inbox.' },
    { icon: '♾️', title: 'Lifetime Access', body: 'Re-download anytime from your account dashboard.' },
    { icon: '🔒', title: 'Secure Purchase', body: 'Your payment and data are fully protected.' },
  ]
  const boxW = (W - 60 - 20) / 3
  boxes.forEach((b, i) => {
    const bx = 30 + i * (boxW + 10)
    doc.roundedRect(bx, boxY, boxW, 90, 10).fillAndStroke(BRAND.white, BRAND.border)
    doc.fontSize(18).text(b.icon, bx + 12, boxY + 12)
    doc.fontSize(10).font('Helvetica-Bold').fillColor(BRAND.text).text(b.title, bx + 12, boxY + 38)
    doc.fontSize(8.5).font('Helvetica').fillColor(BRAND.muted)
       .text(b.body, bx + 12, boxY + 54, { width: boxW - 24 })
  })

  // ── Divider + "More Products" teaser ─────────────────────────────────────
  const divY = boxY + 110
  doc.moveTo(30, divY).lineTo(W - 30, divY).strokeColor(BRAND.border).lineWidth(1).stroke()

  doc.fontSize(14).font('Helvetica-Bold')
     .fillColor(BRAND.dark)
     .text('You might also love…', 30, divY + 16)

  doc.fontSize(9).font('Helvetica')
     .fillColor(BRAND.muted)
     .text('Explore more premium digital products at DigiKraft.shop', 30, divY + 36)

  // ── Related products grid (up to 4) ──────────────────────────────────────
  const related = relatedProducts.slice(0, 4)
  if (related.length > 0) {
    const rpY = divY + 60
    const rpW = (W - 60 - 15) / Math.min(related.length, 4)
    const rpH = 130

    for (let i = 0; i < related.length; i++) {
      const rp = related[i]
      const rx = 30 + i * (rpW + 5)

      doc.roundedRect(rx, rpY, rpW - 5, rpH, 10).fillAndStroke(BRAND.white, BRAND.border)

      // Product thumbnail
      const rpImgBuf = await fetchImageBuffer(rp.image)
      if (rpImgBuf) {
        try {
          doc.save()
             .roundedRect(rx + 6, rpY + 6, rpW - 17, 70, 7)
             .clip()
             .image(rpImgBuf, rx + 6, rpY + 6, { width: rpW - 17, height: 70, cover: [rpW - 17, 70] })
             .restore()
        } catch {
          doc.roundedRect(rx + 6, rpY + 6, rpW - 17, 70, 7).fill('#e0e7ff')
        }
      } else {
        doc.roundedRect(rx + 6, rpY + 6, rpW - 17, 70, 7).fill('#e0e7ff')
      }

      // Name
      doc.fontSize(8.5).font('Helvetica-Bold')
         .fillColor(BRAND.text)
         .text(rp.name || 'Product', rx + 8, rpY + 82, { width: rpW - 21, lineBreak: false, ellipsis: true })

      // Price
      if (rp.price) {
        doc.fontSize(9).font('Helvetica-Bold')
           .fillColor(BRAND.primary)
           .text(`₹${rp.price}`, rx + 8, rpY + 96)
      }

      // "View" link
      if (rp.url) {
        doc.fontSize(7.5).font('Helvetica')
           .fillColor(BRAND.primary)
           .text('View →', rx + 8, rpY + 112)
        doc.link(rx, rpY, rpW - 5, rpH, rp.url)
      }
    }
  }

  // ── Footer ────────────────────────────────────────────────────────────────
  const footY = H - 60
  doc.rect(0, footY, W, 60).fill(BRAND.dark)

  doc.fontSize(9).font('Helvetica-Bold')
     .fillColor(BRAND.white)
     .text('DigiKraft.shop', 40, footY + 14)

  doc.fontSize(8).font('Helvetica')
     .fillColor('#a5b4fc')
     .text('Premium Digital Products · support@digikraft.shop', 40, footY + 30)

  doc.fontSize(8).font('Helvetica')
     .fillColor('#6366f1')
     .text('digikraft.shop', W - 120, footY + 22)
  doc.link(W - 120, footY + 22, 80, 14, 'https://digikraft.shop')
}

// ── ROUTES ────────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/pdf-delivery/generate
 * Body: {
 *   productUrl, productName, productImage, downloadLink,
 *   orderId?, customerName?,
 *   includeRelated? (bool, default true)
 * }
 */
router.post('/generate', async (req, res) => {
  try {
    const {
      productUrl    = '',
      productName   = 'Your Digital Product',
      productImage  = '',
      downloadLink  = '',
      orderId       = '',
      customerName  = 'Valued Customer',
      includeRelated = true,
    } = req.body

    // Fetch related/featured products for marketing section
    let relatedProducts = []
    if (includeRelated) {
      try {
        const featured = await dbFind(db.products, { status: 'published', featured: true }, { downloads: -1 })
        const all      = await dbFind(db.products, { status: 'published' }, { downloads: -1 })
        const pool = [...featured, ...all]
        const seen = new Set()
        const unique = pool.filter(p => {
          if (seen.has(p.id)) return false
          seen.add(p.id); return true
        })
        relatedProducts = unique.slice(0, 4).map(p => ({
          name:  p.title,
          image: p.image || '',
          price: p.sale_price || p.price,
          url:   `https://digikraft.shop/product/${p.slug}`,
        }))
      } catch {}
    }

    await buildPDF({ productUrl, productName, productImage, downloadLink, orderId, customerName, relatedProducts }, res)
  } catch (err) {
    console.error('[PDF Delivery Error]', err)
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: err.message })
    }
  }
})

/**
 * GET /api/v1/pdf-delivery/preview/:productId
 * Admin preview — generates a PDF for a product already in the DB
 */
router.get('/preview/:productId', async (req, res) => {
  try {
    const { productId } = req.params
    const product = await dbFindOne(db.products, {
      $or: [{ id: parseInt(productId) || 0 }, { slug: productId }]
    })

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' })
    }

    // Fetch related products (exclude this one)
    const all = await dbFind(db.products, { status: 'published' }, { downloads: -1 })
    const relatedProducts = all
      .filter(p => p.id !== product.id)
      .slice(0, 4)
      .map(p => ({
        name:  p.title,
        image: p.image || '',
        price: p.sale_price || p.price,
        url:   `https://digikraft.shop/product/${p.slug}`,
      }))

    await buildPDF({
      productName:   product.title,
      productUrl:    product.product_url || `https://digikraft.shop/product/${product.slug}`,
      productImage:  product.image || '',
      downloadLink:  product.product_url || `https://digikraft.shop/product/${product.slug}`,
      orderId:       'PREVIEW',
      customerName:  'Preview User',
      relatedProducts,
    }, res)
  } catch (err) {
    console.error('[PDF Preview Error]', err)
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: err.message })
    }
  }
})

/**
 * POST /api/v1/pdf-delivery/from-url
 * Scrape a product URL and generate a PDF on the fly (no DB needed)
 * Body: { url, customerName?, orderId? }
 */
router.post('/from-url', async (req, res) => {
  try {
    const { url, customerName = 'Valued Customer', orderId = '' } = req.body
    if (!url) return res.status(400).json({ success: false, error: 'url is required' })

    // Scrape the URL for product info
    const aiService = require('../services/ai-service')
    const scraped = await aiService.scrapeUrl(url)

    // Fetch related products for marketing
    let relatedProducts = []
    try {
      const all = await dbFind(db.products, { status: 'published' }, { downloads: -1 })
      relatedProducts = all.slice(0, 4).map(p => ({
        name:  p.title,
        image: p.image || '',
        price: p.sale_price || p.price,
        url:   `https://digikraft.shop/product/${p.slug}`,
      }))
    } catch {}

    await buildPDF({
      productName:   scraped.title || 'Your Digital Product',
      productUrl:    url,
      productImage:  scraped.image || '',
      downloadLink:  url,
      orderId,
      customerName,
      relatedProducts,
    }, res)
  } catch (err) {
    console.error('[PDF from-url Error]', err)
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: err.message })
    }
  }
})

// ── Build PDF into a Buffer (for Drive upload) ────────────────────────────────
function buildPDFBuffer(opts) {
  return new Promise((resolve, reject) => {
    const chunks = []
    const doc = new PDFDocument({ size: 'A4', margin: 0, info: {
      Title: `Thank You — ${opts.productName || 'Your Digital Product'}`,
      Author: 'DigiKraft.shop',
    }})
    doc.on('data', chunk => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    // Use a fake res-like object to reuse buildPDF drawing logic
    const fakeRes = {
      setHeader: () => {},
      headersSent: false,
    }
    // We pipe doc to chunks above, so just call the draw logic directly
    _drawPDF(doc, opts).then(() => doc.end()).catch(reject)
  })
}

/**
 * POST /api/v1/pdf-delivery/generate-and-upload
 * Generates PDF, uploads to Google Drive, returns the shareable link.
 * Body: same as /generate
 */
router.post('/generate-and-upload', async (req, res) => {
  try {
    const {
      productUrl    = '',
      productName   = 'Your Digital Product',
      productImage  = '',
      downloadLink  = '',
      orderId       = '',
      customerName  = 'Valued Customer',
      includeRelated = true,
    } = req.body

    // Fetch related products
    let relatedProducts = []
    if (includeRelated) {
      try {
        const featured = await dbFind(db.products, { status: 'published', featured: true }, { downloads: -1 })
        const all      = await dbFind(db.products, { status: 'published' }, { downloads: -1 })
        const pool = [...featured, ...all]
        const seen = new Set()
        const unique = pool.filter(p => { if (seen.has(p.id)) return false; seen.add(p.id); return true })
        relatedProducts = unique.slice(0, 4).map(p => ({
          name: p.title, image: p.image || '', price: p.sale_price || p.price,
          url: `https://digikraft.shop/product/${p.slug}`,
        }))
      } catch {}
    }

    // Build PDF into a Buffer
    const pdfBuffer = await buildPDFBuffer({
      productUrl, productName, productImage, downloadLink,
      orderId, customerName, relatedProducts,
    })

    // Upload to Google Drive
    const safeName = productName.replace(/[^a-z0-9]/gi, '-').toLowerCase()
    const filename = `${safeName}-delivery${orderId ? '-' + orderId : ''}.pdf`
    const driveFile = await uploadToDrive(pdfBuffer, filename, 'application/pdf')

    res.json({
      success: true,
      data: {
        fileId:      driveFile.id,
        filename:    driveFile.name,
        webViewLink: driveFile.webViewLink,
        directLink:  driveFile.directLink,
      }
    })
  } catch (err) {
    console.error('[PDF generate-and-upload Error]', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router
