// ===== PDF DELIVERY MODULE =====
// Paste a product URL → AI scrapes it → generates a branded PDF
// with thank-you message, download link, and product showcase

window.PDFDelivery = {
  _generating: false,

  // ── Main render ────────────────────────────────────────────────────────────
  render() {
    return `
    <div class="ph">
      <div>
        <div class="ph-title">PDF Delivery Generator</div>
        <div class="ph-sub">Paste a product URL — get a branded thank-you PDF with download link + product showcase</div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;max-width:1100px">

      <!-- LEFT: Input form -->
      <div class="card" style="padding:24px">
        <h3 style="font-size:15px;font-weight:700;margin-bottom:18px;color:var(--text1)">
          <i class="fas fa-link" style="color:var(--accent);margin-right:8px"></i>Product Details
        </h3>

        <!-- URL input -->
        <div class="fg" style="margin-bottom:14px">
          <label class="fl">Product URL <span style="color:var(--red)">*</span></label>
          <div style="display:flex;gap:8px">
            <input type="url" id="pdf-product-url" class="fi" placeholder="https://example.com/product-page"
              style="flex:1" oninput="PDFDelivery._onUrlInput(this.value)">
            <button class="btn btn-secondary" onclick="PDFDelivery.scrapeAndFill()" id="pdf-scrape-btn"
              title="Auto-fill from URL" style="white-space:nowrap">
              <i class="fas fa-magic"></i> Auto-fill
            </button>
          </div>
          <div style="font-size:11px;color:var(--text3);margin-top:4px">
            Paste any product page URL — we'll extract the name and image automatically
          </div>
        </div>

        <!-- Product name -->
        <div class="fg" style="margin-bottom:14px">
          <label class="fl">Product Name</label>
          <input type="text" id="pdf-product-name" class="fi" placeholder="e.g. Premium Logo Bundle">
        </div>

        <!-- Product image URL -->
        <div class="fg" style="margin-bottom:14px">
          <label class="fl">Product Image URL</label>
          <input type="url" id="pdf-product-image" class="fi" placeholder="https://..." oninput="PDFDelivery._previewImage(this.value)">
          <div id="pdf-img-preview" style="margin-top:8px;display:none">
            <img id="pdf-img-thumb" src="" style="width:80px;height:60px;object-fit:cover;border-radius:8px;border:1px solid var(--border)">
          </div>
        </div>

        <!-- Download link -->
        <div class="fg" style="margin-bottom:14px">
          <label class="fl">Download / Access Link <span style="color:var(--red)">*</span></label>
          <input type="url" id="pdf-download-link" class="fi" placeholder="https://... (the link customer clicks to download)">
          <div style="font-size:11px;color:var(--text3);margin-top:4px">
            This is the big "Download Now" button link in the PDF
          </div>
        </div>

        <!-- Customer name -->
        <div class="fg" style="margin-bottom:14px">
          <label class="fl">Customer Name</label>
          <input type="text" id="pdf-customer-name" class="fi" placeholder="e.g. John Doe (or leave blank for 'Valued Customer')">
        </div>

        <!-- Order ID -->
        <div class="fg" style="margin-bottom:20px">
          <label class="fl">Order ID <span style="color:var(--text3);font-weight:400">(optional)</span></label>
          <input type="text" id="pdf-order-id" class="fi" placeholder="e.g. ORD-20240120-001">
        </div>

        <!-- Include related products toggle -->
        <div style="display:flex;align-items:center;gap:10px;padding:12px 14px;background:var(--bg3);border-radius:10px;margin-bottom:20px">
          <input type="checkbox" id="pdf-include-related" checked style="width:16px;height:16px;accent-color:var(--accent)">
          <div>
            <div style="font-size:13px;font-weight:600;color:var(--text1)">Include product showcase</div>
            <div style="font-size:11px;color:var(--text3)">Add 4 featured products from your store as marketing</div>
          </div>
        </div>

        <!-- Action buttons -->
        <div style="display:flex;gap:10px">
          <button class="btn btn-primary" onclick="PDFDelivery.generateFromForm()" id="pdf-gen-btn" style="flex:1">
            <i class="fas fa-file-pdf"></i> Generate PDF
          </button>
          <button class="btn btn-secondary" onclick="PDFDelivery.generateFromUrl()" id="pdf-url-btn" title="Scrape URL and generate in one step">
            <i class="fas fa-bolt"></i> Quick PDF from URL
          </button>
        </div>
      </div>

      <!-- RIGHT: Preview + instructions -->
      <div style="display:flex;flex-direction:column;gap:16px">

        <!-- Preview card -->
        <div class="card" style="padding:24px">
          <h3 style="font-size:15px;font-weight:700;margin-bottom:16px;color:var(--text1)">
            <i class="fas fa-eye" style="color:var(--accent);margin-right:8px"></i>PDF Preview
          </h3>
          <div id="pdf-preview-area" style="background:var(--bg3);border-radius:12px;padding:20px;min-height:200px;display:flex;align-items:center;justify-content:center">
            <div style="text-align:center;color:var(--text3)">
              <i class="fas fa-file-pdf" style="font-size:48px;margin-bottom:12px;display:block;color:var(--border)"></i>
              <div style="font-size:13px;font-weight:600">Fill in the form and click Generate PDF</div>
              <div style="font-size:11px;margin-top:6px">The PDF will download automatically</div>
            </div>
          </div>
        </div>

        <!-- What's in the PDF -->
        <div class="card" style="padding:20px">
          <h3 style="font-size:13px;font-weight:700;margin-bottom:14px;color:var(--text1)">
            <i class="fas fa-info-circle" style="color:var(--accent);margin-right:8px"></i>What's in the PDF
          </h3>
          <div style="display:flex;flex-direction:column;gap:10px">
            ${[
              ['🎉', 'Thank You Header', 'Branded header with customer name and order ID'],
              ['📦', 'Product Card', 'Product image, name, and big Download Now button'],
              ['📧', 'Info Boxes', 'Email confirmation, lifetime access, secure purchase'],
              ['🛍️', 'Product Showcase', 'Up to 4 featured products from your store'],
              ['🔗', 'Clickable Links', 'All links are clickable in the PDF'],
            ].map(([icon, title, desc]) => `
            <div style="display:flex;align-items:flex-start;gap:10px">
              <span style="font-size:18px;flex-shrink:0">${icon}</span>
              <div>
                <div style="font-size:12px;font-weight:700;color:var(--text1)">${title}</div>
                <div style="font-size:11px;color:var(--text3)">${desc}</div>
              </div>
            </div>`).join('')}
          </div>
        </div>

        <!-- Quick actions: preview existing products -->
        <div class="card" style="padding:20px">
          <h3 style="font-size:13px;font-weight:700;margin-bottom:12px;color:var(--text1)">
            <i class="fas fa-boxes" style="color:var(--accent);margin-right:8px"></i>Preview for Existing Product
          </h3>
          <div style="font-size:11px;color:var(--text3);margin-bottom:12px">
            Generate a preview PDF for any product already in your store
          </div>
          <div style="display:flex;gap:8px">
            <input type="text" id="pdf-preview-product-id" class="fi" placeholder="Product ID or slug" style="flex:1">
            <button class="btn btn-secondary" onclick="PDFDelivery.previewProduct()">
              <i class="fas fa-download"></i> Preview
            </button>
          </div>
        </div>
      </div>
    </div>`
  },

  // ── Helpers ────────────────────────────────────────────────────────────────

  _onUrlInput(val) {
    // Auto-copy URL to download link if download link is empty
    const dlInput = document.getElementById('pdf-download-link')
    if (dlInput && !dlInput.value) dlInput.value = val
  },

  _previewImage(url) {
    const preview = document.getElementById('pdf-img-preview')
    const thumb   = document.getElementById('pdf-img-thumb')
    if (!url || !preview || !thumb) return
    thumb.src = url
    preview.style.display = 'block'
    thumb.onerror = () => { preview.style.display = 'none' }
  },

  _setLoading(loading) {
    this._generating = loading
    const genBtn = document.getElementById('pdf-gen-btn')
    const urlBtn = document.getElementById('pdf-url-btn')
    const scrapeBtn = document.getElementById('pdf-scrape-btn')
    if (genBtn) genBtn.disabled = loading
    if (urlBtn) urlBtn.disabled = loading
    if (scrapeBtn) scrapeBtn.disabled = loading

    const previewArea = document.getElementById('pdf-preview-area')
    if (previewArea && loading) {
      previewArea.innerHTML = `
        <div style="text-align:center;color:var(--text3)">
          <i class="fas fa-spinner fa-spin" style="font-size:36px;margin-bottom:12px;display:block;color:var(--accent)"></i>
          <div style="font-size:13px;font-weight:600">Generating PDF…</div>
          <div style="font-size:11px;margin-top:6px">Fetching images and building layout</div>
        </div>`
    }
  },

  _setSuccess() {
    const previewArea = document.getElementById('pdf-preview-area')
    if (previewArea) {
      previewArea.innerHTML = `
        <div style="text-align:center">
          <i class="fas fa-check-circle" style="font-size:48px;margin-bottom:12px;display:block;color:var(--green)"></i>
          <div style="font-size:14px;font-weight:700;color:var(--text1)">PDF Downloaded!</div>
          <div style="font-size:11px;color:var(--text3);margin-top:6px">Check your downloads folder</div>
          <button class="btn btn-secondary" style="margin-top:14px;font-size:12px" onclick="PDFDelivery.generateFromForm()">
            <i class="fas fa-redo"></i> Generate Again
          </button>
        </div>`
    }
  },

  // ── Auto-fill from URL ─────────────────────────────────────────────────────
  async scrapeAndFill() {
    const url = document.getElementById('pdf-product-url')?.value?.trim()
    if (!url) { toast('Enter a product URL first', 'w'); return }

    this._setLoading(true)
    try {
      const res = await fetch('http://localhost:8080/api/v1/ai/analyze-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })
      const data = await res.json()
      if (data.success && data.data) {
        const p = data.data
        const nameInput  = document.getElementById('pdf-product-name')
        const imgInput   = document.getElementById('pdf-product-image')
        const dlInput    = document.getElementById('pdf-download-link')
        if (nameInput && p.name)           nameInput.value = p.name
        if (imgInput  && p.thumbnail_url)  { imgInput.value = p.thumbnail_url; this._previewImage(p.thumbnail_url) }
        if (dlInput   && !dlInput.value)   dlInput.value = url
        toast('Auto-filled from URL!', 's')
      } else {
        toast('Could not extract product info — fill manually', 'w')
      }
    } catch (e) {
      toast('Scrape failed: ' + e.message, 'e')
    } finally {
      this._setLoading(false)
    }
  },

  // ── Generate PDF from filled form ─────────────────────────────────────────
  async generateFromForm() {
    const productUrl   = document.getElementById('pdf-product-url')?.value?.trim()
    const productName  = document.getElementById('pdf-product-name')?.value?.trim()
    const productImage = document.getElementById('pdf-product-image')?.value?.trim()
    const downloadLink = document.getElementById('pdf-download-link')?.value?.trim()
    const customerName = document.getElementById('pdf-customer-name')?.value?.trim()
    const orderId      = document.getElementById('pdf-order-id')?.value?.trim()
    const includeRelated = document.getElementById('pdf-include-related')?.checked ?? true

    if (!downloadLink && !productUrl) {
      toast('Enter at least a product URL or download link', 'w'); return
    }

    this._setLoading(true)
    try {
      const res = await fetch('http://localhost:8080/api/v1/pdf-delivery/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productUrl:    productUrl || downloadLink,
          productName:   productName || 'Your Digital Product',
          productImage:  productImage || '',
          downloadLink:  downloadLink || productUrl,
          customerName:  customerName || 'Valued Customer',
          orderId:       orderId || '',
          includeRelated,
        })
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        throw new Error(err.error || `HTTP ${res.status}`)
      }

      // Trigger browser download
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `digikraft-delivery${orderId ? '-' + orderId : ''}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)

      this._setSuccess()
      toast('PDF generated and downloaded!', 's')
    } catch (e) {
      toast('PDF generation failed: ' + e.message, 'e')
      this._setLoading(false)
    }
  },

  // ── Quick PDF: scrape URL + generate in one step ──────────────────────────
  async generateFromUrl() {
    const url = document.getElementById('pdf-product-url')?.value?.trim()
    if (!url) { toast('Enter a product URL first', 'w'); return }

    const customerName = document.getElementById('pdf-customer-name')?.value?.trim()
    const orderId      = document.getElementById('pdf-order-id')?.value?.trim()

    this._setLoading(true)
    try {
      const res = await fetch('http://localhost:8080/api/v1/pdf-delivery/from-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, customerName: customerName || 'Valued Customer', orderId: orderId || '' })
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        throw new Error(err.error || `HTTP ${res.status}`)
      }

      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `digikraft-delivery${orderId ? '-' + orderId : ''}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)

      this._setSuccess()
      toast('PDF generated from URL!', 's')
    } catch (e) {
      toast('Quick PDF failed: ' + e.message, 'e')
      this._setLoading(false)
    }
  },

  // ── Preview for existing DB product ───────────────────────────────────────
  async previewProduct() {
    const idOrSlug = document.getElementById('pdf-preview-product-id')?.value?.trim()
    if (!idOrSlug) { toast('Enter a product ID or slug', 'w'); return }

    this._setLoading(true)
    try {
      const res = await fetch(`http://localhost:8080/api/v1/pdf-delivery/preview/${encodeURIComponent(idOrSlug)}`)
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        throw new Error(err.error || `HTTP ${res.status}`)
      }

      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `digikraft-preview-${idOrSlug}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)

      this._setSuccess()
      toast('Preview PDF downloaded!', 's')
    } catch (e) {
      toast('Preview failed: ' + e.message, 'e')
      this._setLoading(false)
    }
  },
}
