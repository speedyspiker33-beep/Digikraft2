# SKU System + PDF Generator + Google Drive Integration

## SKU System

**Format:** `DK-[CAT]-[TYPE]-[YY]-[SEQ]`

**Examples:**
- `DK-GFX-LOGO-25-001` — Graphics, Logo, 2025, #1
- `DK-FNT-SANS-25-014` — Fonts, Sans-serif, 2025, #14
- `DK-PLG-CDR-25-001` — Plugins, CorelDRAW, 2025, #1

**Implementation:**
1. Add `sku` field to product schema
2. Generate SKU automatically on product creation (POST /products)
3. Show SKU in admin product list and modal
4. Make SKU searchable in admin
5. Display SKU on product page (optional)

**Category codes:**
- GFX = Graphics
- FNT = Fonts
- TPL = Templates
- 3DA = 3D Assets
- UIK = UI Kits
- PLG = Plugins
- CRS = Courses
- TOL = Tools

**Type codes** (AI-detected from title):
- LOGO, ICON, FONT, TMPL, MOCK, ILLU, PATN, PLUG, BNDL, SOCL, PRES, UIUX, 3DAS, SCPT, etc.

---

## PDF Generator + Google Drive

**Flow:**
1. Admin adds product → pastes product URL (Google Drive, Dropbox, etc.)
2. Clicks **"Generate PDF & Upload to Drive"** button
3. Backend:
   - Generates branded PDF with:
     - DigiKraft header
     - Thank you message
     - Product info (title, SKU, license, version, date)
     - Download link (the URL admin pasted)
     - Marketing showcase (3-4 featured products)
   - Uploads PDF to Google Drive with filename = `{SKU}.pdf`
   - Returns shareable Drive link
4. Admin panel auto-fills the product URL field with the Drive link
5. Customer purchases → gets the PDF → opens it → sees the download link inside

**Google Drive Setup:**
1. Create service account in Google Cloud Console
2. Download JSON credentials
3. Paste in Admin → Settings → Integrations → Google Drive Service Account
4. Backend stores in `settings.db` as `google_drive_credentials`
5. Optionally set a folder ID to organize PDFs

**Backend route:**
`POST /api/v1/products/generate-pdf-and-upload`
- Body: `{ productId, downloadLink }`
- Returns: `{ success, driveLink, filename }`

**Dependencies:**
- `pdfkit` — PDF generation
- `googleapis` — Google Drive API

---

## Status

- [x] pdfkit installed
- [x] googleapis installed
- [x] pdf-generator.js service created
- [ ] SKU generation added to products route
- [ ] Generate PDF button in admin modal
- [ ] Google Drive credentials UI in Settings
- [ ] Backend route for PDF generation + upload
- [ ] Auto-fill product URL after Drive upload
