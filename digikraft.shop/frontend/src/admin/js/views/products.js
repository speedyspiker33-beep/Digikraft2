
// ===== PRODUCTS VIEW — Full CRUD + AI + Showcase =====

window.ProductsView = {
  _products: [],
  _categories: [],
  _editId: null,
  _pendingFiles: [],
  _uploadedFiles: [],
  _viewMode: 'grid',   // 'grid' | 'table'
  _filterStatus: '',
  _filterCat: '',
  _searchQ: '',

  async render() {
    try {
      // Fetch ALL products (published + draft)
      const [prodRes, catRes] = await Promise.all([
        AdminAPI.getProducts({ limit: 500 }),
        AdminAPI.getCategories()
      ])
      // Backend returns published only by default — also fetch drafts
      const published = prodRes.data?.products || []
      let drafts = []
      try {
        const draftRes = await AdminAPI.getProducts({ status: 'draft', limit: 500 })
        drafts = draftRes.data?.products || []
      } catch {}
      // Merge, deduplicate by id
      const seen = new Set()
      this._products = [...published, ...drafts].filter(p => {
        if (seen.has(p.id)) return false
        seen.add(p.id); return true
      })
      this._categories = catRes.data || []
    } catch (e) {
      this._products = []
      this._categories = []
    }

    const badge = document.getElementById('cnt-p')
    if (badge) badge.textContent = this._products.length

    return this._renderHTML()
  },

  _filtered() {
    let list = this._products
    if (this._filterStatus) list = list.filter(p => p.status === this._filterStatus)
    if (this._filterCat) list = list.filter(p => p.category_ids?.includes(parseInt(this._filterCat)) || p.categories?.some(c => String(c.id) === this._filterCat))
    if (this._searchQ) {
      const q = this._searchQ.toLowerCase()
      list = list.filter(p =>
        p.title?.toLowerCase().includes(q) ||
        p.slug?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        JSON.stringify(p.tags || []).toLowerCase().includes(q)
      )
    }
    return list
  },

  _counts() {
    const all = this._products.length
    const pub = this._products.filter(p => p.status === 'published').length
    const draft = this._products.filter(p => p.status === 'draft').length
    return { all, pub, draft }
  },

  _renderHTML() {
    const counts = this._counts()
    const filtered = this._filtered()
    return `
    <div class="ph">
      <div>
        <div class="ph-title">Products</div>
        <div class="ph-sub">${this._products.length} total · ${counts.pub} published · ${counts.draft} drafts</div>
      </div>
      <div class="ph-actions">
        <button class="btn btn-secondary" onclick="ProductsView.importSampleData()"><i class="fas fa-download"></i>Import Sample</button>
        <button class="btn btn-primary" onclick="ProductsView.openModal()"><i class="fas fa-plus"></i>Add Product</button>
      </div>
    </div>

    <!-- STATUS FILTER TABS -->
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;flex-wrap:wrap">
      ${[['','All',counts.all],['published','Published',counts.pub],['draft','Draft',counts.draft]].map(([val,label,cnt]) => `
      <button onclick="ProductsView.setFilter('status','${val}')"
        style="padding:6px 14px;border-radius:99px;border:1px solid ${this._filterStatus===val?'var(--accent)':'var(--border)'};background:${this._filterStatus===val?'var(--accent)':'var(--bg2)'};color:${this._filterStatus===val?'#fff':'var(--text2)'};font-size:12px;font-weight:600;cursor:pointer;transition:.15s">
        ${label} <span style="background:${this._filterStatus===val?'rgba(255,255,255,.25)':'var(--bg3)'};padding:1px 7px;border-radius:99px;margin-left:4px">${cnt}</span>
      </button>`).join('')}
      <div style="margin-left:auto;display:flex;gap:6px">
        <button onclick="ProductsView.setView('grid')" style="padding:6px 10px;border-radius:8px;border:1px solid var(--border);background:${this._viewMode==='grid'?'var(--accent)':'var(--bg2)'};color:${this._viewMode==='grid'?'#fff':'var(--text2)'};cursor:pointer" title="Grid view"><i class="fas fa-th-large"></i></button>
        <button onclick="ProductsView.setView('table')" style="padding:6px 10px;border-radius:8px;border:1px solid var(--border);background:${this._viewMode==='table'?'var(--accent)':'var(--bg2)'};color:${this._viewMode==='table'?'#fff':'var(--text2)'};cursor:pointer" title="Table view"><i class="fas fa-list"></i></button>
      </div>
    </div>

    <!-- SEARCH + CATEGORY FILTER -->
    <div class="ttb" style="margin-bottom:14px">
      <div class="ts"><i class="fas fa-search"></i><input type="text" placeholder="Search products, SKU..." oninput="ProductsView.setFilter('search',this.value)" id="prod-search" value="${this._searchQ}"></div>
      <select class="fc" style="width:auto" onchange="ProductsView.setFilter('cat',this.value)">
        <option value="">All Categories</option>
        ${this._categories.map(c => `<option value="${c.id}" ${this._filterCat===String(c.id)?'selected':''}>${c.name}</option>`).join('')}
      </select>
    </div>

    <!-- PRODUCT LIST -->
    <div id="products-list">
      ${this._viewMode === 'grid' ? this._renderGrid(filtered) : this._renderTable(filtered)}
    </div>`
  },

  setView(mode) {
    this._viewMode = mode
    const el = document.getElementById('products-list')
    if (el) el.innerHTML = this._viewMode === 'grid' ? this._renderGrid(this._filtered()) : this._renderTable(this._filtered())
    // Re-render to update button states
    navigate('products')
  },

  setFilter(type, val) {
    if (type === 'status') this._filterStatus = val
    else if (type === 'cat') this._filterCat = val
    else if (type === 'search') this._searchQ = val
    const el = document.getElementById('products-list')
    if (el) el.innerHTML = this._viewMode === 'grid' ? this._renderGrid(this._filtered()) : this._renderTable(this._filtered())
    if (type !== 'search') navigate('products')
  },

  // ── GRID VIEW ──────────────────────────────────────────────────────────────
  _renderGrid(products) {
    if (!products.length) return `<div class="es"><i class="fas fa-box-open"></i><p>No products found. Add your first product!</p></div>`
    return `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px">
      ${products.map(p => this._renderCard(p)).join('')}
    </div>`
  },

  _renderCard(p) {
    const catName = p.categories?.[0]?.name || p.category || 'Uncategorized'
    const price = p.sale_price
      ? `<span style="text-decoration:line-through;color:var(--text3);font-size:11px">₹${p.price}</span> <strong style="color:var(--red)">₹${p.sale_price}</strong>`
      : `<strong>₹${p.price}</strong>`
    const statusColor = p.status === 'published' ? 'var(--green)' : 'var(--yellow)'
    const statusLabel = p.status === 'published' ? 'Live' : 'Draft'
    return `
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:12px;overflow:hidden;transition:.2s;cursor:pointer" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'">
      <div style="position:relative">
        <img src="${p.image || 'https://via.placeholder.com/220x140/1e1e2e/6366f1?text=No+Image'}"
          style="width:100%;height:140px;object-fit:cover;display:block;background:var(--bg3)"
          onerror="this.src='https://via.placeholder.com/220x140/1e1e2e/6366f1?text=${encodeURIComponent(p.title||'Product')}'">
        <div style="position:absolute;top:8px;left:8px;background:${statusColor};color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px">${statusLabel}</div>
        ${p.featured ? `<div style="position:absolute;top:8px;right:8px;background:var(--yellow);color:#000;font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px">⭐ Featured</div>` : ''}
        ${p.ai_generated ? `<div style="position:absolute;bottom:8px;right:8px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-size:9px;font-weight:700;padding:2px 7px;border-radius:99px">✦ AI</div>` : ''}
      </div>
      <div style="padding:12px">
        <div style="font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px" title="${p.title}">${p.title}</div>
        ${p.sku ? `<div style="font-size:10px;font-family:monospace;color:var(--accent);background:var(--bg3);padding:1px 6px;border-radius:4px;display:inline-block;margin-bottom:4px">${p.sku}</div>` : ''}
        <div style="font-size:11px;color:var(--text3);margin-bottom:8px">${catName} · ${p.downloads || 0} downloads</div>
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div style="font-size:13px">${price}</div>
          <div style="display:flex;gap:4px">
            <button class="btn btn-sm btn-secondary btn-icon" onclick="ProductsView.editProduct(${p.id})" title="Edit"><i class="fas fa-edit"></i></button>
            <button class="btn btn-sm btn-secondary btn-icon" onclick="ProductsView.manageFiles(${p.id},'${(p.title||'').replace(/'/g,"\\'")}')" title="Files"><i class="fas fa-file-archive"></i></button>
            <button class="btn btn-sm btn-danger btn-icon" onclick="ProductsView.deleteProduct(${p.id},'${(p.title||'').replace(/'/g,"\\'")}')" title="Delete"><i class="fas fa-trash"></i></button>
          </div>
        </div>
        ${Array.isArray(p.tags) && p.tags.length ? `<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:4px">${p.tags.slice(0,3).map(t=>`<span style="background:var(--bg3);color:var(--text3);font-size:10px;padding:2px 7px;border-radius:99px">${t}</span>`).join('')}</div>` : ''}
      </div>
    </div>`
  },

  // ── TABLE VIEW ─────────────────────────────────────────────────────────────
  _renderTable(products) {
    if (!products.length) return `<div class="es"><i class="fas fa-box-open"></i><p>No products found.</p></div>`
    return `<div class="card"><div class="tw"><table>
      <thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>Price</th><th>Downloads</th><th>Status</th><th>Featured</th><th>Actions</th></tr></thead>
      <tbody>${products.map(p => {
        const catName = p.categories?.[0]?.name || p.category || 'Uncategorized'
        const price = p.sale_price
          ? `<span style="text-decoration:line-through;color:var(--text3);font-size:11px">₹${p.price}</span> <strong>₹${p.sale_price}</strong>`
          : `₹${p.price}`
        return `<tr>
          <td><div style="display:flex;align-items:center;gap:10px">
            <img src="${p.image||'https://via.placeholder.com/40'}" style="width:40px;height:40px;border-radius:8px;object-fit:cover" onerror="this.src='https://via.placeholder.com/40'">
            <div class="pi"><strong>${p.title}</strong><span>${p.slug}</span>${p.ai_generated?'<span style="font-size:9px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:1px 6px;border-radius:99px;margin-left:4px">✦ AI</span>':''}</div>
          </div></td>
          <td><code style="font-size:10px;background:var(--bg3);padding:2px 6px;border-radius:4px;color:var(--accent)">${p.sku || '—'}</code></td>
          <td><span class="tag tp">${catName}</span></td>
          <td>${price}</td>
          <td>${p.downloads||0}</td>
          <td><span class="tag ${p.status==='published'?'tg':'ty'}">${p.status}</span></td>
          <td>${p.featured?'<i class="fas fa-star" style="color:var(--yellow)"></i>':'<i class="far fa-star" style="color:var(--text3)"></i>'}</td>
          <td><div style="display:flex;gap:5px">
            <button class="btn btn-sm btn-secondary" onclick="ProductsView.editProduct(${p.id})" title="Edit"><i class="fas fa-edit"></i></button>
            <button class="btn btn-sm btn-secondary" onclick="ProductsView.manageFiles(${p.id},'${(p.title||'').replace(/'/g,"\\'")}')" title="Files"><i class="fas fa-file-archive"></i></button>
            <button class="btn btn-sm btn-danger" onclick="ProductsView.deleteProduct(${p.id},'${(p.title||'').replace(/'/g,"\\'")}')" title="Delete"><i class="fas fa-trash"></i></button>
          </div></td>
        </tr>`
      }).join('')}</tbody>
    </table></div></div>`
  },

  // ── MODAL ──────────────────────────────────────────────────────────────────
  openModal(product = null) {
    this._editId = product?.id || null
    this._pendingFiles = []
    this._uploadedFiles = []

    const modal = document.getElementById('prod-modal')
    if (!modal) return

    // Populate category select
    const catSelect = document.getElementById('prod-cat-select')
    if (catSelect) {
      catSelect.innerHTML = '<option value="">Select category...</option>' +
        this._categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')
    }

    const form = document.getElementById('prod-form')
    if (product && form) {
      form.title.value = product.title || ''
      form.shortDesc.value = product.short_description || ''
      form.description.value = product.description || ''
      form.price.value = product.price || ''
      form.salePrice.value = product.sale_price || ''
      form.status.value = product.status || 'published'
      form.tags.value = Array.isArray(product.tags) ? product.tags.join(', ') : (product.tags || '')
      form.image.value = product.image || ''
      // Populate additional images textarea (join array back to newline-separated)
      if (form.images) {
        form.images.value = Array.isArray(product.images) ? product.images.join('\n') : (product.images || '')
      }
      // Populate product URL if set
      const urlInput = document.getElementById('product-url-input')
      if (urlInput) urlInput.value = product.product_url || ''
      // Set delivery mode based on what's set
      if (product.product_url) {
        setTimeout(() => ProductsView._setDeliveryMode('link'), 50)
      } else {
        setTimeout(() => ProductsView._setDeliveryMode('file'), 50)
      }
      form.fileFormat.value = product.file_format || ''
      form.fileSize.value = product.file_size || ''
      form.version.value = product.version || '1.0.0'
      form.license.value = product.license || 'Personal Use'
      form.featured.checked = !!product.featured
      form.showOnMain.checked = product.show_on_main !== false
      if (product.seo_title) form.seoTitle.value = product.seo_title
      if (product.seo_desc) form.seoDesc.value = product.seo_desc
      if (product.categories?.[0]) {
        setTimeout(() => { if (catSelect) catSelect.value = product.categories[0].id }, 50)
      }
      document.getElementById('prod-modal-title').textContent = 'Edit Product'
      // Show SKU badge in modal header
      const skuBadge = document.getElementById('prod-sku-badge')
      if (skuBadge) {
        skuBadge.textContent = product.sku || 'No SKU'
        skuBadge.style.display = product.sku ? 'inline-block' : 'none'
      }
      prevImg(product.image || '')
      this._loadExistingFiles(product.id)
    } else if (form) {
      form.reset()
      form.showOnMain.checked = true
      form.status.value = 'published'
      document.getElementById('prod-modal-title').textContent = 'Add New Product'
      const imgPrev = document.getElementById('img-prev')
      if (imgPrev) imgPrev.style.display = 'none'
    }

    // Switch to basic tab
    prodTab('basic', document.querySelector('#prod-tabs .tab'))

    this._wireFileInput()
    this._linkedArticleSlugs = product?.linked_blog_slugs ? [...product.linked_blog_slugs] : []
    modal.classList.add('open')
  },

  async _loadExistingFiles(productId) {
    try {
      const res = await AdminAPI.getProductFiles(productId)
      this._uploadedFiles = res.data || []
      this._renderFileList()
    } catch {}
  },

  _wireFileInput() {
    const inp = document.getElementById('file-inp')
    if (!inp) return
    const newInp = inp.cloneNode(true)
    inp.parentNode.replaceChild(newInp, inp)
    newInp.addEventListener('change', (e) => {
      Array.from(e.target.files).forEach(f => {
        if (!this._pendingFiles.find(x => x.name === f.name && x.size === f.size)) this._pendingFiles.push(f)
      })
      this._renderFileList()
      newInp.value = ''
    })
  },

  _renderFileList() {
    const container = document.getElementById('file-list')
    if (!container) return
    const allFiles = [
      ...this._uploadedFiles.map(f => ({ ...f, _uploaded: true })),
      ...this._pendingFiles.map(f => ({ name: f.name, file_format: f.name.split('.').pop().toUpperCase(), file_size: this._fmtSize(f.size), _pending: true, _file: f }))
    ]
    if (!allFiles.length) { container.innerHTML = ''; return }
    container.innerHTML = `<div style="margin-top:12px">
      <div style="font-size:12px;font-weight:700;color:var(--text3);margin-bottom:8px">FILES (${allFiles.length})</div>
      ${allFiles.map((f, i) => `
      <div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:var(--bg3);border-radius:9px;margin-bottom:6px">
        <i class="fas fa-file-archive" style="color:var(--accent);font-size:16px;flex-shrink:0"></i>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${f.name}</div>
          <div style="font-size:11px;color:var(--text2)">${f.file_format||'?'} · ${f.file_size||'?'}</div>
        </div>
        ${f._pending ? `<span class="tag ty" style="font-size:10px;flex-shrink:0">Pending</span>` : `<span class="tag tg" style="font-size:10px;flex-shrink:0">Uploaded</span>`}
        <button onclick="ProductsView._removeFile(${i},${!!f._uploaded},'${f.id||''}')" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:14px;flex-shrink:0"><i class="fas fa-times"></i></button>
      </div>`).join('')}
    </div>`
  },

  async _removeFile(idx, isUploaded, fileId) {
    if (isUploaded && fileId && this._editId) {
      try { await AdminAPI.deleteProductFile(this._editId, fileId); this._uploadedFiles = this._uploadedFiles.filter(f => f.id !== fileId) }
      catch { toast('Could not delete file', 'e'); return }
    } else {
      this._pendingFiles.splice(idx - this._uploadedFiles.length, 1)
    }
    this._renderFileList()
  },

  _fmtSize(bytes) {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1048576).toFixed(1) + ' MB'
  },

  editProduct(id) {
    const product = this._products.find(p => p.id === id)
    if (product) this.openModal(product)
  },

  async deleteProduct(id, name) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await AdminAPI.deleteProduct(id)
      this._products = this._products.filter(p => p.id !== id)
      const el = document.getElementById('products-list')
      if (el) el.innerHTML = this._viewMode === 'grid' ? this._renderGrid(this._filtered()) : this._renderTable(this._filtered())
      const badge = document.getElementById('cnt-p')
      if (badge) badge.textContent = this._products.length
      toast(`"${name}" deleted`, 's')
    } catch (e) { toast('Delete failed: ' + e.message, 'e') }
  },

  async manageFiles(productId, productName) {
    try {
      const res = await AdminAPI.getProductFiles(productId)
      const files = res.data || []
      const html = files.length
        ? files.map(f => `<div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border)">
            <i class="fas fa-file-archive" style="color:var(--accent)"></i>
            <div style="flex:1"><div style="font-size:13px;font-weight:600">${f.name}</div><div style="font-size:11px;color:var(--text2)">${f.file_format} · ${f.file_size}</div></div>
            <a href="http://localhost:8080${f.url}" target="_blank" class="btn btn-sm btn-secondary"><i class="fas fa-download"></i></a>
            <button class="btn btn-sm btn-danger" onclick="ProductsView._deleteFileFromManager(${productId},'${f.id}',this)"><i class="fas fa-trash"></i></button>
          </div>`).join('')
        : '<div class="es" style="padding:20px"><i class="fas fa-folder-open"></i><p>No files uploaded yet</p></div>'
      const overlay = document.createElement('div')
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:400;display:flex;align-items:center;justify-content:center;padding:16px'
      overlay.innerHTML = `<div style="background:var(--bg2);border:1px solid var(--border);border-radius:14px;width:100%;max-width:560px;max-height:80vh;overflow-y:auto">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border)">
          <strong style="font-size:15px">Files — ${productName}</strong>
          <button onclick="this.closest('[style*=fixed]').remove()" style="background:var(--bg3);border:none;border-radius:7px;width:28px;height:28px;cursor:pointer;color:var(--text2);font-size:14px">×</button>
        </div>
        <div style="padding:16px 20px">${html}</div>
        <div style="padding:12px 20px;border-top:1px solid var(--border)">
          <label style="display:flex;align-items:center;gap:10px;background:var(--bg3);border:2px dashed var(--border);border-radius:10px;padding:16px;cursor:pointer">
            <i class="fas fa-cloud-upload-alt" style="font-size:24px;color:var(--text3)"></i>
            <div><div style="font-size:13px;font-weight:600">Upload new file</div><div style="font-size:11px;color:var(--text2)">ZIP, RAR, PDF, PSD, AI, FIG · Max 500MB</div></div>
            <input type="file" multiple style="display:none" onchange="ProductsView._uploadFilesDirectly(${productId},this,this.closest('[style*=fixed]'))">
          </label>
        </div>
      </div>`
      document.body.appendChild(overlay)
    } catch (e) { toast('Could not load files: ' + e.message, 'e') }
  },

  async _deleteFileFromManager(productId, fileId, btn) {
    if (!confirm('Delete this file?')) return
    try { await AdminAPI.deleteProductFile(productId, fileId); btn.closest('div[style*="border-bottom"]').remove(); toast('File deleted', 's') }
    catch (e) { toast('Delete failed: ' + e.message, 'e') }
  },

  async _uploadFilesDirectly(productId, input, overlay) {
    const files = Array.from(input.files)
    if (!files.length) return
    for (const file of files) {
      const label = input.closest('label')
      if (label) label.innerHTML = `<i class="fas fa-spinner fa-spin" style="font-size:20px;color:var(--accent)"></i> <span style="font-size:13px">Uploading ${file.name}...</span>`
      try { await this._uploadFile(productId, file); toast(`${file.name} uploaded!`, 's') }
      catch (e) { toast(`Upload failed: ${e.message}`, 'e') }
    }
    overlay.remove()
    this.manageFiles(productId, '')
  },

  async _uploadFile(productId, file) {
    const formData = new FormData()
    formData.append('files', file)
    formData.append('version', '1.0.0')
    const token = AdminAPI.getToken()
    const res = await fetch(`http://localhost:8080/api/v1/product-files/${productId}/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
    return data
  },

  _handleDrop(event) {
    Array.from(event.dataTransfer.files).forEach(f => {
      if (!this._pendingFiles.find(x => x.name === f.name && x.size === f.size)) this._pendingFiles.push(f)
    })
    this._renderFileList()
    const zone = document.getElementById('file-drop-zone')
    if (zone) { zone.style.borderColor = 'var(--green)'; setTimeout(() => zone.style.borderColor = 'var(--border)', 1000) }
  },

  // ── ARTICLE PICKER ────────────────────────────────────────────────────────
  _allBlogPosts: [],
  _linkedArticleSlugs: [],

  async _loadArticlePicker() {
    const listEl = document.getElementById('article-picker-list')
    if (!listEl) return
    try {
      const res = await AdminAPI.get('/v1/blog?status=all&limit=200')
      this._allBlogPosts = res.data || []
    } catch {
      this._allBlogPosts = []
    }
    this._renderArticlePicker(this._allBlogPosts)
  },

  _renderArticlePicker(posts) {
    const listEl = document.getElementById('article-picker-list')
    if (!listEl) return
    if (!posts.length) {
      listEl.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text3);font-size:12px"><i class="fas fa-newspaper" style="display:block;font-size:24px;margin-bottom:8px"></i>No blog posts found. Create some articles first.</div>`
      this._renderSelectedArticles()
      return
    }
    listEl.innerHTML = posts.map(p => {
      const linked = (this._linkedArticleSlugs || []).includes(p.slug)
      return `
      <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:9px;border:1px solid ${linked ? 'var(--accent)' : 'var(--border)'};background:${linked ? 'rgba(99,102,241,.08)' : 'var(--bg3)'};cursor:pointer;transition:.15s"
        onclick="ProductsView._toggleArticleLink('${p.slug}', this)">
        ${p.image ? `<img src="${p.image}" style="width:40px;height:40px;border-radius:7px;object-fit:cover;flex-shrink:0">` : `<div style="width:40px;height:40px;border-radius:7px;background:var(--bg2);display:flex;align-items:center;justify-content:center;flex-shrink:0"><i class="fas fa-newspaper" style="color:var(--text3)"></i></div>`}
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.title}</div>
          <div style="font-size:11px;color:var(--text3);display:flex;gap:8px;align-items:center">
            <span>${p.category || 'Uncategorized'}</span>
            <span>·</span>
            <span>${p.read_time || '?'} min read</span>
            <span class="tag ${p.status === 'published' ? 'tg' : 'ty'}" style="font-size:9px">${p.status}</span>
          </div>
        </div>
        <div style="width:22px;height:22px;border-radius:50%;border:2px solid ${linked ? 'var(--accent)' : 'var(--border)'};background:${linked ? 'var(--accent)' : 'transparent'};display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:.15s">
          ${linked ? '<i class="fas fa-check" style="color:#fff;font-size:10px"></i>' : ''}
        </div>
      </div>`
    }).join('')
    this._renderSelectedArticles()
  },

  _toggleArticleLink(slug, rowEl) {
    if (!this._linkedArticleSlugs) this._linkedArticleSlugs = []
    const idx = this._linkedArticleSlugs.indexOf(slug)
    if (idx > -1) {
      this._linkedArticleSlugs.splice(idx, 1)
    } else {
      this._linkedArticleSlugs.push(slug)
    }
    // Re-render the picker to update checkmarks
    this._renderArticlePicker(
      document.getElementById('article-search')?.value
        ? this._allBlogPosts.filter(p => p.title.toLowerCase().includes(document.getElementById('article-search').value.toLowerCase()))
        : this._allBlogPosts
    )
  },

  _filterArticlePicker(query) {
    const filtered = query
      ? this._allBlogPosts.filter(p => p.title.toLowerCase().includes(query.toLowerCase()) || (p.category || '').toLowerCase().includes(query.toLowerCase()))
      : this._allBlogPosts
    this._renderArticlePicker(filtered)
  },

  _renderSelectedArticles() {
    const el = document.getElementById('article-selected-preview')
    if (!el) return
    const linked = this._linkedArticleSlugs || []
    if (!linked.length) { el.innerHTML = ''; return }
    const posts = linked.map(slug => this._allBlogPosts.find(p => p.slug === slug)).filter(Boolean)
    el.innerHTML = `
    <div style="background:rgba(99,102,241,.08);border:1px solid var(--accent);border-radius:10px;padding:12px 14px">
      <div style="font-size:11px;font-weight:700;color:var(--accent);margin-bottom:8px">LINKED (${posts.length})</div>
      <div style="display:flex;flex-direction:column;gap:6px">
        ${posts.map(p => `
        <div style="display:flex;align-items:center;gap:8px;font-size:12px">
          <i class="fas fa-newspaper" style="color:var(--accent);font-size:11px"></i>
          <span style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.title}</span>
          <button onclick="ProductsView._toggleArticleLink('${p.slug}')" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:12px;padding:0" title="Remove"><i class="fas fa-times"></i></button>
        </div>`).join('')}
      </div>
    </div>`
  },

  // ── DELIVERY MODE TOGGLE ──────────────────────────────────────────────────
  _setDeliveryMode(mode, btn) {
    const linkSection = document.getElementById('delivery-link-section')
    const fileSection = document.getElementById('delivery-file-section')
    const linkBtn = document.getElementById('delivery-link-btn')
    const fileBtn = document.getElementById('delivery-file-btn')
    if (mode === 'link') {
      if (linkSection) linkSection.style.display = 'block'
      if (fileSection) fileSection.style.display = 'none'
      if (linkBtn) { linkBtn.style.background = 'var(--accent)'; linkBtn.style.color = '#fff'; linkBtn.style.borderColor = 'var(--accent)' }
      if (fileBtn) { fileBtn.style.background = 'var(--bg2)'; fileBtn.style.color = 'var(--text2)'; fileBtn.style.borderColor = 'var(--border)' }
    } else {
      if (linkSection) linkSection.style.display = 'none'
      if (fileSection) fileSection.style.display = 'block'
      if (fileBtn) { fileBtn.style.background = 'var(--accent)'; fileBtn.style.color = '#fff'; fileBtn.style.borderColor = 'var(--accent)' }
      if (linkBtn) { linkBtn.style.background = 'var(--bg2)'; linkBtn.style.color = 'var(--text2)'; linkBtn.style.borderColor = 'var(--border)' }
    }
  },

  async generatePDF() {
    const form = document.getElementById('prod-form')
    const productName = form?.title?.value?.trim() || 'Your Digital Product'
    const productImage = form?.image?.value?.trim() || ''
    const downloadLink = form?.product_url?.value?.trim() || ''
    const customerName = document.getElementById('pdf-cust-name')?.value?.trim() || 'Valued Customer'
    const orderId = document.getElementById('pdf-order-id-prod')?.value?.trim() || ''
    const includeShowcase = document.getElementById('pdf-include-showcase')?.checked ?? true

    const statusDiv = document.getElementById('pdf-gen-status')

    const setStatus = (type, html) => {
      if (!statusDiv) return
      const colors = { warn: ['rgba(245,158,11,.12)', 'var(--yellow)'], loading: ['rgba(99,102,241,.12)', 'var(--accent)'], success: ['rgba(34,197,94,.12)', 'var(--green)'], error: ['rgba(239,68,68,.12)', 'var(--red)'] }
      const [bg, color] = colors[type] || colors.loading
      statusDiv.style.display = 'block'
      statusDiv.style.background = bg
      statusDiv.style.color = color
      statusDiv.innerHTML = html
    }

    if (statusDiv) statusDiv.style.display = 'none'

    // Warn if no download link — but still allow generation
    if (!downloadLink) {
      setStatus('warn', '<i class="fas fa-exclamation-triangle"></i> No download link set. Go to Media tab → paste your Google Drive / product link first, then come back here. Generating anyway with empty link...')
      await new Promise(r => setTimeout(r, 2000)) // give user 2s to read
    }

    // Step 1: Generate PDF + upload
    setStatus('loading', '<i class="fas fa-spinner fa-spin"></i> Generating PDF and uploading…')

    try {
      const token = AdminAPI.getToken()
      const res = await fetch(`${API_BASE}/v1/pdf-delivery/generate-and-upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          productUrl: downloadLink || '',
          productName,
          productImage,
          downloadLink: downloadLink || '',
          customerName,
          orderId,
          includeRelated: includeShowcase
        })
      })

      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || `HTTP ${res.status}`)

      const { directLink, webViewLink, filename } = data.data

      // Step 2: Auto-fill the Product URL field in the Media tab
      const productUrlInput = document.getElementById('product-url-input') || document.querySelector('[name="product_url"]')
      if (productUrlInput) {
        productUrlInput.value = directLink
        productUrlInput.dispatchEvent(new Event('input'))
      }

      // Step 3: Update the read-only link field in this tab
      const linkEl = document.getElementById('pdf-prod-link')
      if (linkEl) linkEl.value = directLink

      setStatus('success', `
        <i class="fas fa-check-circle"></i> PDF uploaded to Google Drive!
        <div style="margin-top:8px;display:flex;flex-direction:column;gap:6px">
          <div style="font-size:11px;color:var(--text2)">
            <strong>File:</strong> ${filename}
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px">
            <a href="${webViewLink}" target="_blank" class="btn btn-sm btn-secondary" style="font-size:11px;text-decoration:none">
              <i class="fas fa-external-link-alt"></i> View on Drive
            </a>
          </div>
          <div style="font-size:10px;color:var(--green);margin-top:4px">
            ✓ Download URL auto-filled in Media tab — just save the product!
          </div>
        </div>`)

      toast('PDF uploaded to Drive & URL auto-filled!', 's')
    } catch (e) {
      setStatus('error', `<i class="fas fa-times-circle"></i> Failed: ${e.message}`)
      toast('PDF upload failed: ' + e.message, 'e')
    }
  },

  async importSampleData() {
    if (!confirm('Import sample products into the database?')) return
    const mockProducts = [
      { title: 'Premium Logo Bundle', price: 2499, sale_price: 1499, image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400', categories: [1], featured: true, tags: ['logo','branding','vector'], description: 'Professional logo templates for modern brands', status: 'published' },
      { title: '3D Icon Mega Pack', price: 3999, sale_price: 1999, image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400', categories: [1], featured: true, tags: ['3d','icons','ui'], description: '1000+ stunning 3D icons for modern interfaces', status: 'published' },
      { title: 'Modern Sans Font Bundle', price: 2499, image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400', categories: [2], featured: true, tags: ['font','sans-serif','typography'], description: 'Contemporary sans serif fonts for digital projects', status: 'published' },
      { title: 'Landing Page Template Kit', price: 4999, sale_price: 2999, image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400', categories: [3], featured: true, tags: ['template','web','landing'], description: '20 responsive landing page templates', status: 'published' },
    ]
    try {
      let created = 0
      for (const p of mockProducts) {
        try { await AdminAPI.createProduct(p); created++ } catch {}
      }
      toast(`Imported ${created} sample products!`, 's')
      navigate('products')
    } catch (e) { toast('Import failed: ' + e.message, 'e') }
  }
}

// ===== SAVE PRODUCT =====
window.saveProd = async function(e) {
  e.preventDefault()
  const form = document.getElementById('prod-form')
  const fd = new FormData(form)
  const catSelect = document.getElementById('prod-cat-select')
  const catId = catSelect?.value ? parseInt(catSelect.value) : null

  const payload = {
    title: fd.get('title')?.trim(),
    short_description: fd.get('shortDesc')?.trim() || '',
    description: fd.get('description')?.trim() || '',
    price: parseFloat(fd.get('price')) || 0,
    sale_price: fd.get('salePrice') ? parseFloat(fd.get('salePrice')) : null,
    image: fd.get('image')?.trim() || '',
    images: fd.get('images') ? fd.get('images').split('\n').map(s => s.trim()).filter(Boolean) : [],
    file_format: fd.get('fileFormat')?.trim() || '',
    file_size: fd.get('fileSize')?.trim() || '',
    compatibility: fd.get('compatibility')?.trim() || '',
    version: fd.get('version')?.trim() || '1.0.0',
    license: fd.get('license') || 'Personal Use',
    tags: fd.get('tags') ? fd.get('tags').split(',').map(t => t.trim()).filter(Boolean) : [],
    featured: fd.get('featured') === 'on',
    show_on_main: fd.get('showOnMain') === 'on',
    status: fd.get('status') || 'published',
    seo_title: fd.get('seoTitle')?.trim() || '',
    seo_desc: fd.get('seoDesc')?.trim() || '',
    categories: catId ? [catId] : [],
    linked_blog_slugs: ProductsView._linkedArticleSlugs || [],
    product_url: document.getElementById('product-url-input')?.value?.trim() || ''
  }

  if (!payload.title) { toast('Product name is required', 'e'); return }
  if (!payload.price) { toast('Price is required', 'e'); return }

  const saveBtn = document.querySelector('#prod-modal .btn-primary[onclick*="requestSubmit"]')
  if (saveBtn) { saveBtn.disabled = true; saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...' }

  try {
    const editId = ProductsView._editId
    let productId, res

    if (editId) {
      res = await AdminAPI.updateProduct(editId, payload)
      productId = editId
      const idx = ProductsView._products.findIndex(p => p.id === editId)
      if (idx >= 0) ProductsView._products[idx] = { ...ProductsView._products[idx], ...res.data }
      toast('Product updated!', 's')
    } else {
      res = await AdminAPI.createProduct(payload)
      productId = res.data.id
      ProductsView._products.unshift(res.data)
      toast('Product created!', 's')
    }

    // Upload pending files
    const pending = ProductsView._pendingFiles
    if (pending.length > 0) {
      if (saveBtn) saveBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Uploading ${pending.length} file(s)...`
      for (const file of pending) {
        try { await ProductsView._uploadFile(productId, file) }
        catch (uploadErr) { toast(`File "${file.name}" upload failed: ${uploadErr.message}`, 'e') }
      }
      ProductsView._pendingFiles = []
      toast(`${pending.length} file(s) uploaded!`, 's')
    }

    closeModal('prod-modal')
    const el = document.getElementById('products-list')
    if (el) el.innerHTML = ProductsView._viewMode === 'grid' ? ProductsView._renderGrid(ProductsView._filtered()) : ProductsView._renderTable(ProductsView._filtered())
    const badge = document.getElementById('cnt-p')
    if (badge) badge.textContent = ProductsView._products.length

  } catch (err) {
    toast('Save failed: ' + (err.message || 'Unknown error'), 'e')
    console.error('[saveProd]', err)
  } finally {
    if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = '<i class="fas fa-save"></i>Save Product' }
  }
}

// ===== AI TOOLS (URL Analyzer + Thumbnail Creator) =====
window.AITools = {
  _lastAnalysis: null,

  _setStatus(elId, type, html) {
    const el = document.getElementById(elId)
    if (!el) return
    const colors = {
      loading: ['rgba(99,102,241,.12)', 'var(--accent)'],
      success: ['rgba(34,197,94,.12)', 'var(--green)'],
      error:   ['rgba(239,68,68,.12)', 'var(--red)'],
      warn:    ['rgba(245,158,11,.12)', 'var(--yellow)']
    }
    const [bg, color] = colors[type] || colors.loading
    el.style.display = 'block'
    el.style.background = bg
    el.style.color = color
    el.innerHTML = html
  },

  async analyzeUrl() {
    const url = document.getElementById('ait-url')?.value?.trim()
    if (!url) { toast('Paste a product URL first', 'w'); return }

    this._setStatus('ait-analyze-status', 'loading', '<i class="fas fa-spinner fa-spin"></i> Analyzing product URL...')
    document.getElementById('ait-prompt-result').style.display = 'none'

    try {
      const data = await AdminAPI.post('/v1/ai/analyze-url', { url })
      if (!data.success) throw new Error(data.error)

      this._lastAnalysis = data.data

      // Build a rich image generation prompt from the analysis
      const p = data.data
      const imagePrompt = p.thumbnail_prompt ||
        `Professional product thumbnail for "${p.name}", ${p.category} digital product, ${(p.tags || []).slice(0,4).join(', ')}, modern design, clean background, high quality e-commerce image`

      document.getElementById('ait-prompt-text').value = imagePrompt
      document.getElementById('ait-thumb-prompt').value = imagePrompt
      document.getElementById('ait-prompt-result').style.display = 'block'

      this._setStatus('ait-analyze-status', 'success',
        `<i class="fas fa-check-circle"></i> Analyzed: <strong>${p.name}</strong> — ${p.category} · ₹${p.price}`)

    } catch (e) {
      this._setStatus('ait-analyze-status', 'error', `<i class="fas fa-times-circle"></i> ${e.message}`)
    }
  },

  copyPrompt() {
    const text = document.getElementById('ait-prompt-text')?.value
    if (!text) return
    navigator.clipboard.writeText(text).then(() => toast('Prompt copied!', 's'))
  },

  fillFromAnalysis() {
    const p = this._lastAnalysis
    if (!p) { toast('Analyze a URL first', 'w'); return }

    const form = document.getElementById('prod-form')
    if (!form) return

    if (p.name && !form.title.value) form.title.value = p.name
    if (p.short_description) form.shortDesc.value = p.short_description
    if (p.description) form.description.value = p.description
    if (p.price && !form.price.value) form.price.value = p.price
    if (p.sale_price && !form.salePrice.value) form.salePrice.value = p.sale_price
    if (p.tags?.length) form.tags.value = p.tags.join(', ')
    if (p.file_format) form.fileFormat.value = p.file_format
    if (p.seo_title) form.seoTitle.value = p.seo_title
    if (p.seo_desc) form.seoDesc.value = p.seo_description

    // Set category
    if (p.category) {
      const catSelect = document.getElementById('prod-cat-select')
      if (catSelect) {
        const opt = Array.from(catSelect.options).find(o =>
          o.text.toLowerCase().includes(p.category.toLowerCase()))
        if (opt) catSelect.value = opt.value
      }
    }

    // Set thumbnail if available
    if (p.thumbnail_url) {
      form.image.value = p.thumbnail_url
      prevImg(p.thumbnail_url)
    }

    toast('Product form filled from analysis!', 's')
    // Switch to basic tab to show the filled data
    prodTab('basic', document.querySelector('#prod-tabs .tab'))
  },

  async generateThumbnail() {
    const prompt = document.getElementById('ait-thumb-prompt')?.value?.trim()
    const style = document.getElementById('ait-thumb-style')?.value || 'modern'

    if (!prompt) { toast('Enter an image prompt first', 'w'); return }

    this._setStatus('ait-thumb-status', 'loading', '<i class="fas fa-spinner fa-spin"></i> Generating thumbnail with AI... (this takes ~15 seconds)')
    document.getElementById('ait-thumb-preview').style.display = 'none'

    try {
      const data = await AdminAPI.post('/v1/ai/generate-thumbnail', { prompt, style })
      if (!data.success) throw new Error(data.error)

      const imgUrl = data.data.image_url
      document.getElementById('ait-thumb-img').src = imgUrl
      document.getElementById('ait-thumb-preview').style.display = 'block'
      this._setStatus('ait-thumb-status', 'success', '<i class="fas fa-check-circle"></i> Thumbnail generated! Click "Use as Product Thumbnail" to apply it.')
      this._generatedImageUrl = imgUrl

    } catch (e) {
      this._setStatus('ait-thumb-status', 'error', `<i class="fas fa-times-circle"></i> ${e.message}`)
    }
  },

  useThumbnail() {
    const url = this._generatedImageUrl
    if (!url) return
    const form = document.getElementById('prod-form')
    if (form) form.image.value = url
    prevImg(url)
    toast('Thumbnail applied!', 's')
    prodTab('basic', document.querySelector('#prod-tabs .tab'))
  }
}

// ===== IMAGE PREVIEW =====
window.prevImg = function(url) {
  const img = document.getElementById('img-prev')
  if (!img) return
  if (url) { img.src = url; img.style.display = 'block' }
  else img.style.display = 'none'
}

// ===== PRODUCT TAB SWITCHER =====
window.prodTab = function(tab, btn) {
  ['basic','media','details','seo','articles','pdf','aitools'].forEach(t => {
    const el = document.getElementById('pt-' + t)
    if (el) el.style.display = t === tab ? 'block' : 'none'
  })
  document.querySelectorAll('#prod-tabs .tab').forEach(b => b.classList.remove('on'))
  if (btn) btn.classList.add('on')
  if (tab === 'media') setTimeout(() => ProductsView._renderFileList(), 50)
  if (tab === 'articles') setTimeout(() => ProductsView._loadArticlePicker(), 50)
  if (tab === 'pdf') {
    // Auto-fill PDF tab from product form data
    const form = document.getElementById('prod-form')
    if (form) {
      const nameEl = document.getElementById('pdf-prod-name')
      const linkEl = document.getElementById('pdf-prod-link')
      if (nameEl) nameEl.value = form.title?.value || ''
      // Read from the actual product URL input (id=product-url-input)
      const productUrlInput = document.getElementById('product-url-input')
      if (linkEl) {
        const currentLink = productUrlInput?.value?.trim() || ''
        linkEl.value = currentLink
        linkEl.style.borderColor = currentLink ? 'var(--green)' : 'var(--red)'
        linkEl.title = currentLink ? 'This link will be embedded in the PDF' : 'No link set — go to Media tab first'
      }
    }
    const status = document.getElementById('pdf-gen-status')
    if (status) status.style.display = 'none'
  }
}

// ===== AI GENERATE for product modal =====
window.aiGenerateForProduct = async function() {
  const form = document.getElementById('prod-form')
  const title = form?.title?.value?.trim()
  const url = document.getElementById('ai-source-url')?.value?.trim()

  if (!url && !title) {
    toast('Enter a product URL or name first', 'w')
    return
  }

  const btn = document.getElementById('ai-gen-btn')
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...' }

  try {
    let data
    if (url && url.startsWith('http')) {
      // Analyze URL with AI
      const res = await AdminAPI.post('/v1/ai/analyze-url', { url })
      data = res.data
    } else {
      // Generate from title only using AI
      const res = await AdminAPI.post('/v1/ai/analyze-url', { url: `https://www.google.com/search?q=${encodeURIComponent(title + ' digital product')}` })
      data = res.data
      if (data.name === 'Digital Product') data.name = title // keep user's title
    }

    if (!data) throw new Error('No data returned')

    // Fill form fields
    if (data.name && !form.title.value) form.title.value = data.name
    if (data.short_description) form.shortDesc.value = data.short_description
    if (data.description) form.description.value = data.description
    if (data.price && !form.price.value) form.price.value = data.price
    if (data.original_price && !form.salePrice.value) {
      // original_price is the higher price, sale_price is the discounted one
      form.price.value = data.original_price
      form.salePrice.value = data.price
    }
    if (data.tags?.length) form.tags.value = data.tags.join(', ')
    if (data.seo_title) form.seoTitle.value = data.seo_title
    if (data.seo_description) form.seoDesc.value = data.seo_description
    if (data.file_format) form.fileFormat.value = data.file_format
    if (data.license_type) form.license.value = data.license_type === 'Commercial' ? 'Commercial Use' : 'Personal Use'
    if (data.thumbnail_url) {
      form.image.value = data.thumbnail_url
      prevImg(data.thumbnail_url)
    }

    // Auto-select category
    if (data.category) {
      const catSelect = document.getElementById('prod-cat-select')
      if (catSelect) {
        const opt = Array.from(catSelect.options).find(o => o.text.toLowerCase().includes(data.category.toLowerCase()))
        if (opt) catSelect.value = opt.value
      }
    }

    toast('AI generated product details! Review and save.', 's')
  } catch (e) {
    toast('AI generation failed: ' + e.message, 'e')
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-robot"></i> AI Generate' }
  }
}
