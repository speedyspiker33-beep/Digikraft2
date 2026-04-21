# Product PDF Generator Integration Guide

## Overview
This guide explains how to integrate the PDF generator directly into the "Add Product" workflow, so after generating a PDF, it automatically uploads to Google Drive and adds the link to the product.

## Current State
- **PDF Generator**: Standalone module at `/admin#pdf-delivery`
- **Product Form**: Has tabs for Basic, Media, Details, SEO, Articles
- **File Upload**: Products support both direct file upload and external URLs (Google Drive)

## Proposed Flow

### 1. Add "PDF Generator" Tab to Product Modal
Add a new tab after "Articles" in the product form:
```html
<button class="tab" onclick="prodTab('pdf',this)">
  <i class="fas fa-file-pdf"></i> Generate PDF
</button>
```

### 2. PDF Tab Content
The tab should contain:
- **Auto-fill from product data** (title, image, price pulled from Basic tab)
- **Customer name** input (optional, defaults to "Valued Customer")
- **Order ID** input (optional)
- **Include product showcase** checkbox
- **Generate PDF** button
- **Upload to Google Drive** checkbox (if Drive API configured)

### 3. Workflow After PDF Generation

#### Option A: Manual Upload (Current - No API needed)
1. User generates PDF → downloads to their computer
2. User manually uploads PDF to Google Drive
3. User copies the Drive link
4. User pastes link into "Product Download URL" field in Media tab

#### Option B: Auto Upload (Requires Google Drive API)
1. User generates PDF
2. PDF auto-uploads to configured Google Drive folder
3. Drive link auto-fills into "Product Download URL" field
4. User saves product → link is stored

## Implementation Steps

### Step 1: Add PDF Tab to Product Modal

**File**: `digikraft.shop/frontend/src/admin/index.html`

Find the product modal tabs section and add:
```html
<button class="tab" onclick="prodTab('pdf',this)">
  <i class="fas fa-file-pdf"></i> PDF Generator
</button>
```

Add the tab content after the articles tab:
```html
<div id="pt-pdf" style="display:none">
  <div style="background:linear-gradient(135deg,rgba(239,68,68,.12),rgba(245,158,11,.08));border:1px solid rgba(239,68,68,.3);border-radius:10px;padding:14px;margin-bottom:14px">
    <div style="font-size:13px;font-weight:700;margin-bottom:6px">
      <i class="fas fa-magic" style="color:var(--red);margin-right:6px"></i>Generate Branded PDF
    </div>
    <div style="font-size:11px;color:var(--text3)">
      Create a professional thank-you PDF with product details and download link. Perfect for email delivery.
    </div>
  </div>

  <!-- Auto-filled from product data -->
  <div class="fg">
    <label class="fl">Product Name (auto-filled)</label>
    <input class="fc" id="pdf-prod-name" readonly style="background:var(--bg4)">
  </div>

  <div class="fg">
    <label class="fl">Product Image (auto-filled)</label>
    <input class="fc" id="pdf-prod-img" readonly style="background:var(--bg4)">
  </div>

  <div class="fg">
    <label class="fl">Download Link (auto-filled from Media tab)</label>
    <input class="fc" id="pdf-prod-link" readonly style="background:var(--bg4)">
  </div>

  <div class="fgrid">
    <div class="fg">
      <label class="fl">Customer Name (optional)</label>
      <input class="fc" id="pdf-cust-name" placeholder="e.g. John Doe">
    </div>
    <div class="fg">
      <label class="fl">Order ID (optional)</label>
      <input class="fc" id="pdf-order-id" placeholder="e.g. ORD-001">
    </div>
  </div>

  <div style="display:flex;align-items:center;gap:10px;padding:12px;background:var(--bg3);border-radius:9px;margin-bottom:14px">
    <input type="checkbox" id="pdf-include-showcase" checked style="width:16px;height:16px">
    <div>
      <div style="font-size:12px;font-weight:600">Include product showcase</div>
      <div style="font-size:10px;color:var(--text3)">Add 4 featured products as marketing</div>
    </div>
  </div>

  <button type="button" class="btn btn-primary" onclick="ProductsView.generatePDF()" style="width:100%">
    <i class="fas fa-file-pdf"></i> Generate PDF
  </button>

  <div id="pdf-status" style="margin-top:12px;padding:10px;border-radius:8px;display:none"></div>
</div>
```

### Step 2: Add PDF Generation Logic

**File**: `digikraft.shop/frontend/src/admin/js/views/products.js`

Add this method to `ProductsView`:

```javascript
async generatePDF() {
  const form = document.getElementById('prod-form')
  const productName = form.title.value || 'Your Digital Product'
  const productImage = form.image.value || ''
  const downloadLink = form.product_url.value || ''
  const customerName = document.getElementById('pdf-cust-name')?.value || 'Valued Customer'
  const orderId = document.getElementById('pdf-order-id')?.value || ''
  const includeShowcase = document.getElementById('pdf-include-showcase')?.checked ?? true

  if (!downloadLink) {
    toast('Please fill in the Product Download URL in the Media tab first', 'w')
    return
  }

  const statusDiv = document.getElementById('pdf-status')
  statusDiv.style.display = 'block'
  statusDiv.style.background = 'rgba(99,102,241,.12)'
  statusDiv.style.color = 'var(--accent)'
  statusDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...'

  try {
    const res = await fetch('http://localhost:8080/api/v1/pdf-delivery/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productUrl: downloadLink,
        productName,
        productImage,
        downloadLink,
        customerName,
        orderId,
        includeRelated: includeShowcase
      })
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const blob = await res.blob()
    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = `${productName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-delivery.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(blobUrl)

    statusDiv.style.background = 'rgba(34,197,94,.12)'
    statusDiv.style.color = 'var(--green)'
    statusDiv.innerHTML = `
      <i class="fas fa-check-circle"></i> PDF generated and downloaded!
      <div style="font-size:10px;margin-top:6px">
        Next: Upload to Google Drive and paste the link in the Media tab's "Product Download URL" field
      </div>
    `
    toast('PDF downloaded successfully!', 's')
  } catch (e) {
    statusDiv.style.background = 'rgba(239,68,68,.12)'
    statusDiv.style.color = 'var(--red)'
    statusDiv.innerHTML = `<i class="fas fa-times-circle"></i> Failed: ${e.message}`
    toast('PDF generation failed', 'e')
  }
},
```

### Step 3: Auto-fill PDF Tab When Switching

Add this to the `prodTab()` function:

```javascript
function prodTab(id, btn) {
  // Hide all tabs
  document.querySelectorAll('[id^="pt-"]').forEach(el => el.style.display = 'none')
  // Show selected
  document.getElementById('pt-' + id).style.display = 'block'
  // Update button states
  document.querySelectorAll('#prod-tabs .tab').forEach(t => t.classList.remove('on'))
  btn.classList.add('on')

  // Auto-fill PDF tab when opened
  if (id === 'pdf') {
    const form = document.getElementById('prod-form')
    document.getElementById('pdf-prod-name').value = form.title.value || ''
    document.getElementById('pdf-prod-img').value = form.image.value || ''
    document.getElementById('pdf-prod-link').value = form.product_url.value || ''
  }
}
```

## Google Drive Integration (Optional - Advanced)

To auto-upload PDFs to Google Drive, you need:

### 1. Get Google Drive API Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google Drive API"
4. Create credentials → Service Account
5. Download JSON key file
6. Share your Drive folder with the service account email

### 2. Add to Backend `.env`
```env
GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here
GOOGLE_SERVICE_ACCOUNT_KEY=path/to/service-account-key.json
```

### 3. Install Google Drive SDK
```bash
cd digikraft.shop/backend
npm install googleapis
```

### 4. Create Drive Upload Service
**File**: `digikraft.shop/backend/services/drive-service.js`

```javascript
const { google } = require('googleapis')
const fs = require('fs')
const path = require('path')

const SCOPES = ['https://www.googleapis.com/auth/drive.file']
const KEY_FILE = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID

async function uploadPDF(pdfBuffer, filename) {
  if (!KEY_FILE || !FOLDER_ID) {
    throw new Error('Google Drive not configured')
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: SCOPES
  })

  const drive = google.drive({ version: 'v3', auth })

  const fileMetadata = {
    name: filename,
    parents: [FOLDER_ID]
  }

  const media = {
    mimeType: 'application/pdf',
    body: require('stream').Readable.from(pdfBuffer)
  }

  const file = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id, webViewLink, webContentLink'
  })

  // Make file publicly accessible
  await drive.permissions.create({
    fileId: file.data.id,
    requestBody: {
      role: 'reader',
      type: 'anyone'
    }
  })

  // Return direct download link
  return `https://drive.google.com/uc?export=download&id=${file.data.id}`
}

module.exports = { uploadPDF }
```

### 5. Update PDF Generation Endpoint
**File**: `digikraft.shop/backend/routes/pdf-delivery.js`

Add after PDF generation:

```javascript
const { uploadPDF } = require('../services/drive-service')

// After generating pdfBuffer...
if (process.env.GOOGLE_DRIVE_FOLDER_ID) {
  try {
    const driveLink = await uploadPDF(pdfBuffer, `${productName}-delivery.pdf`)
    // Return drive link in response
    res.json({ success: true, driveLink })
  } catch (e) {
    console.error('Drive upload failed:', e)
    // Fall back to direct download
    res.setHeader('Content-Type', 'application/pdf')
    res.send(pdfBuffer)
  }
} else {
  // No Drive configured, send PDF directly
  res.setHeader('Content-Type', 'application/pdf')
  res.send(pdfBuffer)
}
```

## Summary

**Without Google Drive API** (simpler, current approach):
1. User fills product form
2. User switches to PDF tab
3. User generates PDF → downloads to computer
4. User manually uploads to Google Drive
5. User copies Drive link and pastes into "Product Download URL"
6. User saves product

**With Google Drive API** (automated):
1. User fills product form
2. User switches to PDF tab
3. User generates PDF → auto-uploads to Drive
4. Drive link auto-fills into "Product Download URL"
5. User saves product

The manual approach requires no API setup and works immediately. The automated approach requires Google Cloud setup but provides a smoother workflow.
