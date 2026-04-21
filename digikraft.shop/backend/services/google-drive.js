// ===== GOOGLE DRIVE SERVICE =====
// NOTE: Standard service accounts cannot upload to regular My Drive.
// This module now falls back to local backend storage.
// Files are served from /uploads/pdfs/ via the backend server.

const path = require('path')
const fs = require('fs')

const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || './uploads', 'pdfs')

/**
 * "Upload" a Buffer — saves to local /uploads/pdfs/ and returns a public URL
 * @param {Buffer} buffer
 * @param {string} filename
 * @returns {{ id, name, webViewLink, directLink }}
 */
async function uploadToDrive(buffer, filename) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })

  const safeName = filename.replace(/[^a-z0-9.\-_]/gi, '-')
  const filePath = path.join(UPLOAD_DIR, safeName)
  fs.writeFileSync(filePath, buffer)

  const baseUrl = process.env.BACKEND_URL || process.env.RAILWAY_PUBLIC_DOMAIN 
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` 
    : 'https://digikraft2-production.up.railway.app'
  const directLink = `${baseUrl}/uploads/pdfs/${safeName}`

  return {
    id: safeName,
    name: safeName,
    webViewLink: directLink,
    directLink,
  }
}

module.exports = { uploadToDrive }
