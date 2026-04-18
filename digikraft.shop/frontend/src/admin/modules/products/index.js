// ============================================================
// MODULE: PRODUCTS
// ============================================================
let _tab = 'all';

export function render() {
  const { State, UI } = window.AdminCore;
  let products = State.products;

  const search = document.getElementById('prod-search')?.value || '';
  const catF = document.getElementById('prod-cat')?.value || '';
  const statusF = document.getElementById('prod-status')?.value || '';

  if (search) products = products.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()))
  );
  if (catF) products = products.filter(p => p.category === catF);
  if (statusF) products = products.filter(p => p.status === statusF);
  if (_tab === 'featured') products = products.filter(p => p.featured);
  if (_tab === 'draft') products = products.filter(p => p.status === 'draft');
  if (_tab === 'published') products = products.filter(p => p.status === 'published');

  const allCount = State.products.length;
  const pubCount = State.products.filter(p => p.status === 'published').length;
  const draftCount = State.products.filter(p => p.status === 'draft').length;
  const featCount = State.products.filter(p => p.featured).length;

  return `
  <div class="page-header">
    <div>
      <div class="page-title">Products</div>
      <div class="page-subtitle">${allCount} total · ${pubCount} published · ${draftCount} drafts</div>
    </div>
    <div class="header-actions">
      <button class="btn btn-secondary" onclick="window.AdminModules.products.exportCSV()">
        <i class="fas fa-download"></i> Export CSV
      </button>
      <button class="btn btn-primary" onclick="window.AdminModules.products.openAdd()">
        <i class="fas fa-plus"></i> Add Product
      </button>
    </div>
  </div>

  <!-- SEGMENT TABS -->
  <div class="tab-bar" style="margin-bottom:16px">
    ${segTab('all', `All (${allCount})`)}
    ${segTab('published', `Published (${pubCount})`)}
    ${segTab('draft', `Drafts (${draftCount})`)}
    ${segTab('featured', `Featured (${featCount})`)}
  </div>

  <div class="card">
    <!-- TOOLBAR -->
    <div class="table-toolbar">
      <div class="table-search">
        <i class="fas fa-search"></i>
        <input type="text" id="prod-search" placeholder="Search by name or tag..." oninput="window.AdminApp.render()" value="${search}">
      </div>
      <select class="form-control" id="prod-cat" style="width:auto" onchange="window.AdminApp.render()">
        <option value="">All Categories</option>
        ${State.categories.map(c => `<option ${catF === c ? 'selected' : ''}>${c}</option>`).join('')}
      </select>
      <select class="form-control" id="prod-status" style="width:auto" onchange="window.AdminApp.render()">
        <option value="">All Status</option>
        <option value="published" ${statusF === 'published' ? 'selected' : ''}>Published</option>
        <option value="draft" ${statusF === 'draft' ? 'selected' : ''}>Draft</option>
      </select>
      <span style="margin-left:auto;font-size:13px;color:var(--text2)">${products.length} result(s)</span>
    </div>

    <!-- TABLE -->
    ${products.length ? `
    <div class="table-wrap"><table>
      <thead>
        <tr>
          <th><input type="checkbox" onchange="toggleSelectAll(this)"></th>
          <th>Product</th><th>Category</th><th>Price</th><th>Tags</th>
          <th>Featured</th><th>Status</th><th>Created</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${products.map(p => `
        <tr>
          <td><input type="checkbox" class="row-check" value="${p.id}"></td>
          <td>
            <div style="display:flex;align-items:center;gap:12px">
              <img class="product-thumb" src="${p.image || ''}" onerror="this.src='https://via.placeholder.com/44'">
              <div class="product-info">
                <strong>${p.title}</strong>
                <span>${p.slug}</span>
              </div>
            </div>
          </td>
          <td>${UI.badge(p.category || '—', 'purple')}</td>
          <td>
            <strong>${UI.formatCurrency(p.price)}</strong>
            ${p.salePrice ? `<br><small style="color:var(--green)">Sale: ${UI.formatCurrency(p.salePrice)}</small>` : ''}
          </td>
          <td>${(p.tags || []).slice(0, 2).map(t => UI.badge(t, 'blue')).join(' ')}</td>
          <td>
            <button onclick="window.AdminModules.products.toggleFeatured('${p.id}')"
              style="background:none;border:none;font-size:18px;cursor:pointer;color:${p.featured ? 'var(--yellow)' : 'var(--text3)'}">
              <i class="fas fa-star"></i>
            </button>
          </td>
          <td>${UI.badge(p.status, p.status === 'published' ? 'green' : 'yellow')}</td>
          <td style="font-size:12px;color:var(--text2)">${UI.formatDate(p.createdAt)}</td>
          <td>
            <div style="display:flex;gap:6px">
              <button class="btn btn-sm btn-secondary btn-icon" onclick="window.AdminModules.products.openEdit('${p.id}')" title="Edit"><i class="fas fa-edit"></i></button>
              <button class="btn btn-sm btn-secondary btn-icon" onclick="window.AdminModules.products.duplicate('${p.id}')" title="Duplicate"><i class="fas fa-copy"></i></button>
              <button class="btn btn-sm btn-danger btn-icon" onclick="window.AdminModules.products.remove('${p.id}')" title="Delete"><i class="fas fa-trash"></i></button>
            </div>
          </td>
        </tr>`).join('')}
      </tbody>
    </table></div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:12px;padding-top:12px;border-top:1px solid var(--border)">
      <div id="bulk-actions" style="display:flex;gap:8px">
        <button class="btn btn-sm btn-secondary" onclick="bulkPublish()"><i class="fas fa-check"></i> Publish Selected</button>
        <button class="btn btn-sm btn-danger" onclick="bulkDelete()"><i class="fas fa-trash"></i> Delete Selected</button>
      </div>
      <span style="font-size:13px;color:var(--text2)">${products.length} of ${allCount} products</span>
    </div>` :
    `<div class="empty-state"><i class="fas fa-box-open"></i><p>No products found. <a href="#" onclick="window.AdminModules.products.openAdd()" style="color:var(--accent)">Add your first product</a></p></div>`}
  </div>`;
}

function segTab(id, label) {
  return `<button class="tab-btn ${_tab === id ? 'active' : ''}" onclick="window.AdminModules.products.setTab('${id}')">${label}</button>`;
}

export function setTab(id) { _tab = id; window.AdminApp.render(); }

export function openAdd() {
  document.getElementById('prod-modal-title').textContent = 'Add New Product';
  document.getElementById('product-form').reset();
  document.getElementById('edit-product-id').value = '';
  document.getElementById('img-preview').style.display = 'none';
  window.AdminCore.UI.openModal('product-modal');
}

export function openEdit(id) {
  const { State, UI } = window.AdminCore;
  const p = State.products.find(x => x.id === id);
  if (!p) return;
  document.getElementById('prod-modal-title').textContent = 'Edit Product';
  const f = document.getElementById('product-form');
  f.title.value = p.title;
  f.description.value = p.description || '';
  f.shortDesc.value = p.shortDesc || '';
  f.price.value = p.price;
  f.salePrice.value = p.salePrice || '';
  f.category.value = p.category || '';
  f.status.value = p.status || 'draft';
  f.tags.value = (p.tags || []).join(', ');
  f.image.value = p.image || '';
  f.fileFormat.value = p.fileFormat || '';
  f.fileSize.value = p.fileSize || '';
  f.compatibility.value = p.compatibility || '';
  f.seoTitle.value = p.seoTitle || '';
  f.seoDesc.value = p.seoDesc || '';
  f.featured.checked = p.featured || false;
  document.getElementById('edit-product-id').value = p.id;
  previewImage(p.image);
  UI.openModal('product-modal');
}

export function save(e) {
  e.preventDefault();
  const { State, UI } = window.AdminCore;
  const f = new FormData(e.target);
  const id = f.get('id');
  const product = {
    id: id || Date.now().toString(),
    title: f.get('title'),
    description: f.get('description'),
    shortDesc: f.get('shortDesc'),
    price: parseFloat(f.get('price')),
    salePrice: f.get('salePrice') ? parseFloat(f.get('salePrice')) : null,
    category: f.get('category'),
    status: f.get('status'),
    tags: f.get('tags').split(',').map(t => t.trim()).filter(Boolean),
    image: f.get('image') || '',
    fileFormat: f.get('fileFormat'),
    fileSize: f.get('fileSize'),
    compatibility: f.get('compatibility'),
    seoTitle: f.get('seoTitle'),
    seoDesc: f.get('seoDesc'),
    featured: f.get('featured') === 'on',
    slug: UI.slugify(f.get('title')),
    createdAt: id ? (State.products.find(p => p.id === id)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    downloads: 0, rating: 4.5, views: 0
  };
  const products = State.products;
  if (id) {
    const idx = products.findIndex(p => p.id === id);
    if (idx > -1) products[idx] = product;
    UI.toast('Product updated!');
  } else {
    products.unshift(product);
    UI.toast('Product created!');
  }
  State.products = products;
  UI.closeModal('product-modal');
  e.target.reset();
  document.getElementById('img-preview').style.display = 'none';
  window.AdminApp.render();
  window.AdminCore.UI.updateSidebarCounts();
}

export function remove(id) {
  const { State, UI } = window.AdminCore;
  if (!confirm('Delete this product?')) return;
  State.products = State.products.filter(p => p.id !== id);
  UI.toast('Product deleted', 'error');
  window.AdminApp.render();
  UI.updateSidebarCounts();
}

export function duplicate(id) {
  const { State, UI } = window.AdminCore;
  const p = State.products.find(x => x.id === id);
  if (!p) return;
  const copy = { ...p, id: Date.now().toString(), title: p.title + ' (Copy)', status: 'draft', createdAt: new Date().toISOString() };
  const products = State.products;
  products.unshift(copy);
  State.products = products;
  UI.toast('Product duplicated!');
  window.AdminApp.render();
}

export function toggleFeatured(id) {
  const { State, UI } = window.AdminCore;
  const products = State.products;
  const p = products.find(x => x.id === id);
  if (p) { p.featured = !p.featured; State.products = products; window.AdminApp.render(); }
}

export function exportCSV() {
  const { State } = window.AdminCore;
  const rows = [['ID', 'Title', 'Category', 'Price', 'Status', 'Tags', 'Created']];
  State.products.forEach(p => rows.push([p.id, p.title, p.category, p.price, p.status, (p.tags || []).join(';'), p.createdAt]));
  const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = 'products.csv';
  a.click();
}

export function previewImage(url) {
  const img = document.getElementById('img-preview');
  if (url && img) { img.src = url; img.style.display = 'block'; }
  else if (img) img.style.display = 'none';
}

function toggleSelectAll(cb) {
  document.querySelectorAll('.row-check').forEach(c => c.checked = cb.checked);
}

function bulkPublish() {
  const { State, UI } = window.AdminCore;
  const ids = [...document.querySelectorAll('.row-check:checked')].map(c => c.value);
  if (!ids.length) return UI.toast('Select products first', 'warn');
  const products = State.products;
  products.forEach(p => { if (ids.includes(p.id)) p.status = 'published'; });
  State.products = products;
  UI.toast(`${ids.length} products published!`);
  window.AdminApp.render();
}

function bulkDelete() {
  const { State, UI } = window.AdminCore;
  const ids = [...document.querySelectorAll('.row-check:checked')].map(c => c.value);
  if (!ids.length) return UI.toast('Select products first', 'warn');
  if (!confirm(`Delete ${ids.length} products?`)) return;
  State.products = State.products.filter(p => !ids.includes(p.id));
  UI.toast(`${ids.length} products deleted`, 'error');
  window.AdminApp.render();
  UI.updateSidebarCounts();
}
