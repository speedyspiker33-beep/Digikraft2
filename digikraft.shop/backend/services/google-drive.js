// ===== GOOGLE DRIVE SERVICE =====
// Uploads a Buffer to Google Drive using a Service Account
// Returns: { id, name, webViewLink, directLink }

const { google } = require('googleapis')
const path = require('path')
const { Readable } = require('stream')

let _auth = null

function getAuth() {
  if (_auth) return _auth
  const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_PATH
  if (!keyPath) throw new Error('GOOGLE_SERVICE_ACCOUNT_PATH not set in .env')
  const keyFile = path.resolve(__dirname, '..', keyPath)
  _auth = new google.auth.GoogleAuth({
    keyFile,
    scopes: ['https://www.googleapis.com/auth/drive'],
  })
  return _auth
}

/**
 * Upload a Buffer to Google Drive
 * @param {Buffer} buffer - file content
 * @param {string} filename - e.g. "my-product-delivery.pdf"
 * @param {string} mimeType - e.g. "application/pdf"
 * @returns {{ id, name, webViewLink, directLink }}
 */
async function uploadToDrive(buffer, filename, mimeType = 'application/pdf') {
  const auth = getAuth()
  const drive = google.drive({ version: 'v3', auth })

  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || null

  // Upload file
  const res = await drive.files.create({
    requestBody: {
      name: filename,
      mimeType,
      ...(folderId ? { parents: [folderId] } : {}),
    },
    media: {
      mimeType,
      body: Readable.from(buffer),
    },
    fields: 'id,name,webViewLink',
  })

  const fileId = res.data.id

  // Make it publicly readable (anyone with link)
  await drive.permissions.create({
    fileId,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  })

  // Direct download link
  const directLink = `https://drive.google.com/uc?export=download&id=${fileId}`
  const webViewLink = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`

  return { id: fileId, name: res.data.name, webViewLink, directLink }
}

module.exports = { uploadToDrive }
