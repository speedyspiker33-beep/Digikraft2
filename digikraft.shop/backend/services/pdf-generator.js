// ===== PDF GENERATOR + GOOGLE DRIVE SERVICE =====
const PDFDocument = require('pdfkit')
const { google } = require('googleapis')
const { Readable } = require('stream')

class PDFGenerator {
  constructor() {
    this.driveClient = null
  }

  // Initialize Google Drive client with service account JSON
  async initDrive(credentialsJson) {
    try {
      const credentials = typeof credentialsJson === 'string'
        ? JSON.parse(credentialsJson)
        : credentialsJson

      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/drive.file']
      })
      this.driveClient = google.drive({ version: 'v3', auth })
      return true
    } catch (e) {
      console.error('[Drive Init Error]', e.message)
      return false
    }
  }

  // Generate branded PDF with product link + marketing showcase
  async generateProductPDF(product, downloadLink, featuredProducts = []) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 })
      const chunks = []

      doc.on('data', chunk => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      const W = 495 // usable width

      // ── HEADER ──────────────────────────────────────────────────────────────
      doc.rect(0, 0, 595, 100).fill('#6366f1')
      doc.fontSize(30).fillColor('#fff').text('DigiKraft', 50, 28, { continued: true })
      doc.fillColor('#c7d2fe').text('.shop')
      doc.fontSize(11).fillColor('#e0e7ff').text('Premium Digital Marketplace', 50, 68)

      doc.moveDown(4)

      // ── THANK YOU ───────────────────────────────────────────────────────────
      doc.fontSize(22).fillColor('#111').text('Thank You for Your Purchase!', { align: 'center' })
      doc.moveDown(0.5)
      doc.fontSize(11).fillColor('#555').text(
        `Your purchase of "${product.title}" is confirmed and ready to download.`,
        { align: 'center', width: W }
      )
      doc.moveDown(1.5)

      // ── PRODUCT INFO BOX ────────────────────────────────────────────────────
      const boxTop = doc.y
      doc.roundedRect(50, boxTop, W, 110, 8).fillAndStroke('#f8fafc', '#e2e8f0')
      doc.fontSize(13).fillColor('#1e293b').text(product.title, 70, boxTop + 14, { width: W - 40 })
      doc.fontSize(9).fillColor('#64748b')
        .text(`SKU: ${product.sku || 'N/A'}`, 70, boxTop + 36)
        .text(`License: ${product.license || 'Commercial Use'}`, 70, boxTop + 50)
        .text(`Version: ${product.version || '1.0.0'}`, 70, boxTop + 64)
        .text(`Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, 70, boxTop + 78)
      doc.moveDown(8)

      // ── DOWNLOAD LINK ───────────────────────────────────────────────────────
      doc.moveDown(0.5)
      doc.fontSize(13).fillColor('#111').text('Your Download Link', { underline: false })
      doc.moveDown(0.4)
      doc.rect(50, doc.y, W, 36).fillAndStroke('#eff6ff', '#bfdbfe')
      doc.fontSize(10).fillColor('#1d4ed8').text(downloadLink, 60, doc.y + 12, {
        link: downloadLink,
        underline: true,
        width: W - 20,
        ellipsis: true
      })
      doc.moveDown(3.5)

      // ── INSTRUCTIONS ────────────────────────────────────────────────────────
      doc.fontSize(10).fillColor('#555').text(
        'Click the link above or copy-paste it into your browser. The link is valid indefinitely. Keep this PDF safe as your proof of purchase.',
        { width: W }
      )
      doc.moveDown(2)

      // ── MARKETING SHOWCASE ──────────────────────────────────────────────────
      if (featuredProducts.length > 0) {
        doc.addPage()

        // Section header
        doc.rect(0, 0, 595, 60).fill('#f8fafc')
        doc.fontSize(18).fillColor('#6366f1').text('You Might Also Like', 50, 18)
        doc.fontSize(10).fillColor('#888').text('Explore more premium digital assets from DigiKraft.shop', 50, 42)
        doc.moveDown(4)

        featuredProducts.slice(0, 4).forEach((p, i) => {
          if (doc.y > 700) doc.addPage()
          const cardTop = doc.y
          doc.roundedRect(50, cardTop, W, 80, 6).fillAndStroke('#fff', '#e2e8f0')

          // Price badge
          doc.rect(W - 10, cardTop + 10, 70, 24).fill('#6366f1')
          doc.fontSize(11).fillColor('#fff').text(`₹${p.price}`, W - 5, cardTop + 16, { width: 60, align: 'center' })

          doc.fontSize(12).fillColor('#1e293b').text(p.title, 65, cardTop + 12, { width: W - 100 })
          doc.fontSize(9).fillColor('#64748b').text(
            (p.short_description || p.description || '').substring(0, 100),
            65, cardTop + 30, { width: W - 110 }
          )
          doc.fontSize(9).fillColor('#6366f1').text(
            `digikraft.shop/product/${p.slug}`,
            65, cardTop + 55,
            { link: `https://digikraft.shop/product/${p.slug}`, underline: true }
          )
          doc.moveDown(6.5)
        })
      }

      // ── FOOTER ──────────────────────────────────────────────────────────────
      const pageHeight = doc.page.height
      doc.fontSize(8).fillColor('#aaa')
        .text('Need help? support@digikraft.shop  |  digikraft.shop', 50, pageHeight - 40, { align: 'center', width: W })
        .text('© DigiKraft.shop — All rights reserved', 50, pageHeight - 28, { align: 'center', width: W })

      doc.end()
    })
  }

  // Upload PDF buffer to Google Drive, return shareable link
  async uploadToDrive(pdfBuffer, filename, folderId = null) {
    if (!this.driveClient) throw new Error('Google Drive not initialized. Add service account credentials in Settings.')

    const fileMetadata = {
      name: filename,
      mimeType: 'application/pdf',
      ...(folderId ? { parents: [folderId] } : {})
    }

    const readable = new Readable()
    readable.push(pdfBuffer)
    readable.push(null)

    const file = await this.driveClient.files.create({
      requestBody: fileMetadata,
      media: { mimeType: 'application/pdf', body: readable },
      fields: 'id, webViewLink, webContentLink, name'
    })

    // Make publicly readable
    await this.driveClient.permissions.create({
      fileId: file.data.id,
      requestBody: { role: 'reader', type: 'anyone' }
    })

    return {
      fileId: file.data.id,
      viewLink: file.data.webViewLink,
      downloadLink: `https://drive.google.com/uc?export=download&id=${file.data.id}`,
      filename: file.data.name
    }
  }
}

module.exports = new PDFGenerator()
