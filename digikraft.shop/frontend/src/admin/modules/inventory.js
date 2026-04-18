// ===== INVENTORY & STOCK MODULE =====
// Connected to Backend API (port 8080)
window.renderInventory = async function() {
  let products = []

  try {
    const res = await AdminAPI.getProducts({ status: 'all', limit: 500 })
    products = res.data?.products || []
  } catch (e) {
    products = JSON.parse(localStorage.getItem('dk_p') || localStorage.getItem('dk_products') || '[]')
  }

  const lowStock = products.filter(p => (p.stock || 0) <= (p.low_stock_alert || 5) && p.stock !== undefined)
  const outOfStock = products.filter(p => p.stock === 0)

  return `
  <div class="ph">
    <div><div class="ph-title">Inventory</div><div class="ph-sub">Stock levels and digital asset management</div></div>
    <div class="ph-actions">
      <button class="btn btn-primary" onclick="window.toast('Bulk stock update coming soon','i')"><i class="fas fa-sync"></i>Sync Stock</button>
    </div>
  </div>
  <div class="stats-grid" style="margin-bottom:16px">
    <div class="stat-card"><div class="si si-blue"><i class="fas fa-boxes"></i></div><div><div class="sv">${products.length}</div><div class="sl">Total Products</div></div></div>
    <div class="stat-card"><div class="si si-yellow"><i class="fas fa-exclamation-triangle"></i></div><div><div class="sv">${lowStock.length}</div><div class="sl">Low Stock</div></div></div>
    <div class="stat-card"><div class="si si-red"><i class="fas fa-times-circle"></i></div><div><div class="sv">${outOfStock.length}</div><div class="sl">Out of Stock</div></div></div>
    <div class="stat-card"><div class="si si-green"><i class="fas fa-download"></i></div><div><div class="sv">${products.reduce((s,p)=>s+(p.downloads||0),0)}</div><div class="sl">Total Downloads</div></div></div>
  </div>

  ${lowStock.length ? `
  <div class="card" style="margin-bottom:16px;border-color:var(--yellow)">
    <div class="card-hd"><div class="card-title" style="color:var(--yellow)"><i class="fas fa-exclamation-triangle"></i>Low Stock Alerts</div></div>
    <div class="tw"><table>
      <thead><tr><th>Product</th><th>Stock</th><th>Alert Level</th><th>Action</th></tr></thead>
      <tbody>${lowStock.map(p=>`<tr>
        <td><div style="display:flex;align-items:center;gap:9px"><img class="pt" src="${p.image||''}" onerror="this.src='https://via.placeholder.com/40'"><strong>${p.title}</strong></div></td>
        <td><span class="tag ${p.stock===0?'tr':'ty'}">${p.stock||0} left</span></td>
        <td>${p.lowStockAlert||5}</td>
        <td><button class="btn btn-sm btn-primary" onclick="updateStock('${p.id}')"><i class="fas fa-plus"></i>Update Stock</button></td>
      </tr>`).join('')}</tbody>
    </table></div>
  </div>` : ''}

  <div class="card">
    <div class="card-hd"><div class="card-title">All Products — Stock Overview</div>
      <div style="display:flex;gap:8px">
        <select class="fc" style="width:auto" id="inv-filter" onchange="navigate('inventory')">
          <option value="">All</option><option value="low">Low Stock</option><option value="out">Out of Stock</option>
        </select>
      </div>
    </div>
    <div class="tw"><table>
      <thead><tr><th>Product</th><th>Category</th><th>Downloads</th><th>Stock</th><th>Low Alert</th><th>License</th><th>Actions</th></tr></thead>
      <tbody>${products.map(p=>`<tr>
        <td><div style="display:flex;align-items:center;gap:9px"><img class="pt" src="${p.image||''}" onerror="this.src='https://via.placeholder.com/40'"><div class="pi"><strong>${p.title}</strong><span>${p.slug}</span></div></div></td>
        <td><span class="tag tp">${p.category||'—'}</span></td>
        <td>${p.downloads||0}</td>
        <td>
          <input type="number" value="${p.stock||0}" min="0" style="width:70px;background:var(--bg3);border:1px solid var(--border);border-radius:7px;padding:4px 8px;color:var(--text);font-size:12px;font-family:inherit" onchange="setStock('${p.id}',this.value)">
        </td>
        <td>
          <input type="number" value="${p.lowStockAlert||5}" min="0" style="width:60px;background:var(--bg3);border:1px solid var(--border);border-radius:7px;padding:4px 8px;color:var(--text);font-size:12px;font-family:inherit" onchange="setLowAlert('${p.id}',this.value)">
        </td>
        <td style="font-size:12px">${p.license||'Personal'}</td>
        <td><button class="btn btn-sm btn-secondary btn-icon" onclick="editProd('${p.id}')"><i class="fas fa-edit"></i></button></td>
      </tr>`).join('')}
      </tbody>
    </table></div>
  </div>`;
};

window.setStock = async function(id, val) {
  try {
    await AdminAPI.updateProduct(parseInt(id), { stock: parseInt(val) });
  } catch (e) {
    const prods = JSON.parse(localStorage.getItem('dk_p') || '[]');
    const p = prods.find(x => x.id === id);
    if (p) { p.stock = parseInt(val); localStorage.setItem('dk_p', JSON.stringify(prods)); }
  }
};

window.setLowAlert = async function(id, val) {
  try {
    await AdminAPI.updateProduct(parseInt(id), { low_stock_alert: parseInt(val) });
  } catch (e) {
    const prods = JSON.parse(localStorage.getItem('dk_p') || '[]');
    const p = prods.find(x => x.id === id);
    if (p) { p.lowStockAlert = parseInt(val); localStorage.setItem('dk_p', JSON.stringify(prods)); }
  }
};

window.updateStock = function(id) {
  const val = prompt('Enter new stock quantity:');
  if (val !== null) { window.setStock(id, val); window.toast('Stock updated!'); navigate('inventory'); }
};
