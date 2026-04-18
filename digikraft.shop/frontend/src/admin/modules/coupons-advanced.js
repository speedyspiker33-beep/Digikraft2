// ===== ADVANCED COUPONS MODULE =====
window._couponTab = window._couponTab || 'list';
window._couponEditing = window._couponEditing || null;

// ── HELPERS ───────────────────────────────────────────────────────────────────
function getCoupons() { return JSON.parse(localStorage.getItem('dk_coup') || '[]'); }
function saveCoupons(v) { localStorage.setItem('dk_coup', JSON.stringify(v)); }
function getProducts() { return JSON.parse(localStorage.getItem('dk_p') || '[]'); }
function getCats() { return JSON.parse(localStorage.getItem('dk_cats_v2') || JSON.parse(localStorage.getItem('dk_categories') || '[]').map((n,i)=>({id:'cat-'+i,name:n}))); }

function couponScopeLabel(c) {
  if (c.scope === 'all') return 'All Products';
  if (c.scope === 'category') return 'Category: ' + (c.categories||[]).join(', ');
  if (c.scope === 'product') return (c.products||[]).length + ' specific product(s)';
  if (c.scope === 'bundle') return 'Bundle: ' + (c.bundleName||'Custom Bundle');
  return '—';
}

function couponStatus(c) {
  if (!c.active) return { label:'Inactive', cls:'tr' };
  if (c.expires && new Date(c.expires) < new Date()) return { label:'Expired', cls:'tr' };
  if (c.maxUses && (c.uses||0) >= c.maxUses) return { label:'Used Up', cls:'tr' };
  return { label:'Active', cls:'tg' };
}

function autoCode(prefix='DK') {
  const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const seg=()=>Array.from({length:5},()=>chars[Math.floor(Math.random()*chars.length)]).join('');
  return `${prefix}-${seg()}-${seg()}`;
}

// ── MAIN RENDER ───────────────────────────────────────────────────────────────
window.renderCoupons = function() {
  if (window._couponEditing) return renderCouponEditor(window._couponEditing);

  const coupons = getCoupons();
  const tab = window._couponTab;
  const search = document.getElementById('coup-search')?.value || '';

  let filtered = coupons;
  if (search) filtered = filtered.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    (c.bundleName||'').toLowerCase().includes(search.toLowerCase()) ||
    (c.description||'').toLowerCase().includes(search.toLowerCase())
  );
  if (tab === 'active') filtered = filtered.filter(c => couponStatus(c).label === 'Active');
  if (tab === 'expired') filtered = filtered.filter(c => ['Expired','Used Up'].includes(couponStatus(c).label));
  if (tab === 'product') filtered = filtered.filter(c => c.scope === 'product');
  if (tab === 'category') filtered = filtered.filter(c => c.scope === 'category');
  if (tab === 'bundle') filtered = filtered.filter(c => c.scope === 'bundle');

  const totalUses = coupons.reduce((s,c)=>s+(c.uses||0),0);
  const activeCnt = coupons.filter(c=>couponStatus(c).label==='Active').length;

  return `
  <div class="ph">
    <div><div class="ph-title">Coupons</div><div class="ph-sub">${coupons.length} coupons · ${activeCnt} active · ${totalUses} total uses</div></div>
    <div class="ph-actions">
      <button class="btn btn-secondary" onclick="exportCSV(getCoupons(),'coupons.csv')"><i class="fas fa-download"></i>Export</button>
      <button class="btn btn-secondary" onclick="openCouponEditor('bulk')"><i class="fas fa-layer-group"></i>Bulk Generate</button>
      <button class="btn btn-primary" onclick="openCouponEditor('new')"><i class="fas fa-plus"></i>Create Coupon</button>
    </div>
  </div>

  <!-- STATS -->
  <div class="stats-grid" style="margin-bottom:16px">
    <div class="stat-card"><div class="si si-green"><i class="fas fa-ticket-alt"></i></div><div><div class="sv">${activeCnt}</div><div class="sl">Active Coupons</div></div></div>
    <div class="stat-card"><div class="si si-blue"><i class="fas fa-mouse-pointer"></i></div><div><div class="sv">${totalUses}</div><div class="sl">Total Uses</div></div></div>
    <div class="stat-card"><div class="si si-purple"><i class="fas fa-box"></i></div><div><div class="sv">${coupons.filter(c=>c.scope==='product').length}</div><div class="sl">Product-Specific</div></div></div>
    <div class="stat-card"><div class="si si-yellow"><i class="fas fa-tags"></i></div><div><div class="sv">${coupons.filter(c=>c.scope==='category').length}</div><div class="sl">Category-Specific</div></div></div>
    <div class="stat-card"><div class="si si-pink"><i class="fas fa-layer-group"></i></div><div><div class="sv">${coupons.filter(c=>c.scope==='bundle').length}</div><div class="sl">Bundle Coupons</div></div></div>
  </div>

  <!-- TABS -->
  <div class="tabs" style="margin-bottom:16px">
    ${[['list','All'],['active','Active'],['expired','Expired'],['product','Product'],['category','Category'],['bundle','Bundle']].map(([id,lb])=>
      `<button class="tab ${tab===id?'on':''}" onclick="window._couponTab='${id}';navigate('coupons')">${lb}</button>`
    ).join('')}
  </div>

  <div class="card">
    <div class="ttb">
      <div class="ts"><i class="fas fa-search"></i><input type="text" id="coup-search" placeholder="Search code, bundle name, description..." oninput="navigate('coupons')" value="${search}"></div>
      <span style="margin-left:auto;font-size:12px;color:var(--text2)">${filtered.length} result(s)</span>
    </div>

    ${filtered.length ? `
    <div class="tw"><table>
      <thead><tr><th>Code</th><th>Type</th><th>Discount</th><th>Applies To</th><th>Min Order</th><th>Uses</th><th>Expires</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>${filtered.map(c => {
        const st = couponStatus(c);
        const pct = c.maxUses ? Math.round((c.uses||0)/c.maxUses*100) : 0;
        return `<tr>
          <td>
            <div style="display:flex;align-items:center;gap:8px">
              <code style="background:var(--bg3);padding:4px 10px;border-radius:7px;font-size:13px;font-weight:700;cursor:pointer;letter-spacing:.5px" onclick="navigator.clipboard.writeText('${c.code}');window.toast('Copied!','s')" title="Click to copy">${c.code}</code>
              <i class="fas fa-copy" style="color:var(--text3);font-size:11px;cursor:pointer" onclick="navigator.clipboard.writeText('${c.code}');window.toast('Copied!','s')"></i>
            </div>
            ${c.description?`<div style="font-size:11px;color:var(--text3);margin-top:2px">${c.description}</div>`:''}
          </td>
          <td><span class="tag ${c.type==='percent'?'tp':'tg'}">${c.type==='percent'?'%':'₹'} ${c.type==='percent'?'Percent':'Fixed'}</span></td>
          <td><strong style="font-size:15px">${c.discount}${c.type==='percent'?'%':'₹'}</strong></td>
          <td>
            <div style="font-size:12px">
              ${c.scope==='all'?'<span class="tag tb" style="font-size:10px">All Products</span>':''}
              ${c.scope==='category'?`<span class="tag tp" style="font-size:10px">📁 ${(c.categories||[]).join(', ')}</span>`:''}
              ${c.scope==='product'?`<span class="tag tpk" style="font-size:10px">📦 ${(c.products||[]).length} product(s)</span>`:''}
              ${c.scope==='bundle'?`<span class="tag ty" style="font-size:10px">🎁 ${c.bundleName||'Bundle'}</span>`:''}
            </div>
          </td>
          <td style="font-size:12px">${c.minOrder?'₹'+c.minOrder:'—'}</td>
          <td>
            <div style="font-size:13px;font-weight:600">${c.uses||0}${c.maxUses?'/'+c.maxUses:''}</div>
            ${c.maxUses?`<div style="background:var(--bg3);border-radius:99px;height:4px;width:60px;overflow:hidden;margin-top:3px"><div style="width:${pct}%;height:100%;background:${pct>80?'var(--red)':'var(--accent)'};border-radius:99px"></div></div>`:''}
          </td>
          <td style="font-size:11px;color:${c.expires&&new Date(c.expires)<new Date()?'var(--red)':'var(--text2)'}">${c.expires?new Date(c.expires).toLocaleDateString('en-IN'):'No expiry'}</td>
          <td>
            <span class="tag ${st.cls}">${st.label}</span>
            <label class="tgl" style="margin-top:4px;display:block"><input type="checkbox" ${c.active!==false?'checked':''} onchange="toggleCoupon('${c.id}',this.checked)"><span class="tgs"></span></label>
          </td>
          <td><div style="display:flex;gap:4px">
            <button class="btn btn-sm btn-secondary btn-icon" onclick="openCouponEditor('${c.id}')" title="Edit"><i class="fas fa-edit"></i></button>
            <button class="btn btn-sm btn-secondary btn-icon" onclick="duplicateCoupon('${c.id}')" title="Duplicate"><i class="fas fa-copy"></i></button>
            <button class="btn btn-sm btn-secondary btn-icon" onclick="shareCoupon('${c.code}')" title="Share"><i class="fas fa-share-alt"></i></button>
            <button class="btn btn-sm btn-danger btn-icon" onclick="deleteCoupon('${c.id}')" title="Delete"><i class="fas fa-trash"></i></button>
          </div></td>
        </tr>`;
      }).join('')}</tbody>
    </table></div>` : `<div class="es"><i class="fas fa-ticket-alt"></i><p>No coupons found. <a href="#" onclick="openCouponEditor('new')" style="color:var(--accent)">Create your first coupon</a></p></div>`}
  </div>`;
};

// ── EDITOR ────────────────────────────────────────────────────────────────────
function renderCouponEditor(id) {
  if (id === 'bulk') return renderBulkGenerator();
  const coupons = getCoupons();
  const isNew = id === 'new';
  const c = isNew ? { id:'new', scope:'all', type:'percent', active:true, products:[], categories:[], bundleProducts:[] } : coupons.find(x=>x.id===id);
  if (!c) return `<div class="es"><i class="fas fa-ticket-alt"></i><p>Coupon not found</p><button class="btn btn-secondary" onclick="window._couponEditing=null;navigate('coupons')">Back</button></div>`;

  const products = getProducts();
  const cats = getCats();
  const scope = document.getElementById('ce-scope')?.value || c.scope || 'all';

  return `
  <div class="ph">
    <div style="display:flex;align-items:center;gap:10px">
      <button class="btn btn-secondary btn-sm" onclick="window._couponEditing=null;navigate('coupons')"><i class="fas fa-arrow-left"></i>Back</button>
      <div><div class="ph-title">${isNew?'Create Coupon':c.code}</div><div class="ph-sub">Configure discount scope, conditions and limits</div></div>
    </div>
    <div class="ph-actions">
      <button class="btn btn-primary" onclick="saveCouponEditor()"><i class="fas fa-save"></i>Save Coupon</button>
    </div>
  </div>

  <div class="g2" style="align-items:start">
    <!-- LEFT -->
    <div style="display:flex;flex-direction:column;gap:14px">

      <!-- CODE + BASIC -->
      <div class="card">
        <div class="card-hd"><div class="card-title"><i class="fas fa-ticket-alt" style="color:var(--accent)"></i>Coupon Code</div></div>
        <div class="fgrid">
          <div class="fg cs2">
            <label class="fl">Coupon Code *</label>
            <div style="display:flex;gap:8px">
              <input class="fc" id="ce-code" value="${c.code||''}" placeholder="SAVE20" style="text-transform:uppercase;font-family:monospace;font-size:15px;font-weight:700;flex:1" oninput="this.value=this.value.toUpperCase()">
              <button class="btn btn-secondary" onclick="document.getElementById('ce-code').value=autoCode(document.getElementById('ce-prefix')?.value||'DK')"><i class="fas fa-magic"></i>Auto</button>
            </div>
          </div>
          <div class="fg"><label class="fl">Code Prefix (for auto-gen)</label><input class="fc" id="ce-prefix" value="${c.prefix||'DK'}" placeholder="DK" maxlength="6"></div>
          <div class="fg"><label class="fl">Description (internal)</label><input class="fc" id="ce-desc" value="${c.description||''}" placeholder="Summer sale 20% off"></div>
        </div>
      </div>

      <!-- DISCOUNT -->
      <div class="card">
        <div class="card-hd"><div class="card-title"><i class="fas fa-percent" style="color:var(--green)"></i>Discount</div></div>
        <div class="fgrid">
          <div class="fg"><label class="fl">Discount Type</label>
            <select class="fc" id="ce-type">
              <option value="percent" ${c.type==='percent'?'selected':''}>Percentage (%)</option>
              <option value="fixed" ${c.type==='fixed'?'selected':''}>Fixed Amount (₹)</option>
              <option value="free_shipping" ${c.type==='free_shipping'?'selected':''}>Free Shipping</option>
              <option value="buy_x_get_y" ${c.type==='buy_x_get_y'?'selected':''}>Buy X Get Y Free</option>
            </select>
          </div>
          <div class="fg"><label class="fl">Discount Value</label>
            <input class="fc" id="ce-discount" type="number" value="${c.discount||''}" placeholder="20" min="0" step="0.01">
          </div>
          <div class="fg"><label class="fl">Max Discount Cap (₹)</label>
            <input class="fc" id="ce-max-discount" type="number" value="${c.maxDiscount||''}" placeholder="500 (optional)">
          </div>
          <div class="fg"><label class="fl">Min Order Amount (₹)</label>
            <input class="fc" id="ce-min-order" type="number" value="${c.minOrder||''}" placeholder="0">
          </div>
        </div>
      </div>

      <!-- SCOPE — APPLIES TO -->
      <div class="card">
        <div class="card-hd"><div class="card-title"><i class="fas fa-crosshairs" style="color:var(--blue)"></i>Applies To</div></div>
        <div class="fg">
          <label class="fl">Coupon Scope</label>
          <select class="fc" id="ce-scope" onchange="window._couponEditing=window._couponEditing;navigate('coupons')" value="${c.scope||'all'}">
            <option value="all" ${c.scope==='all'?'selected':''}>🌐 All Products (site-wide)</option>
            <option value="category" ${c.scope==='category'?'selected':''}>📁 Specific Categories</option>
            <option value="product" ${c.scope==='product'?'selected':''}>📦 Specific Products</option>
            <option value="bundle" ${c.scope==='bundle'?'selected':''}>🎁 Product Bundle (buy set, get discount)</option>
          </select>
        </div>

        <!-- CATEGORY SCOPE -->
        ${c.scope==='category'?`
        <div class="fg">
          <label class="fl">Select Categories</label>
          <div style="display:flex;flex-direction:column;gap:4px;max-height:200px;overflow-y:auto;background:var(--bg3);border-radius:9px;padding:10px">
            ${cats.map(cat=>`
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:4px 0">
              <input type="checkbox" name="coup-cats" value="${cat.name||cat.id}" ${(c.categories||[]).includes(cat.name||cat.id)?'checked':''} style="width:14px;height:14px">
              <span style="font-size:13px">${cat.icon||'📁'} ${cat.name}</span>
            </label>`).join('')}
          </div>
        </div>`:''}

        <!-- PRODUCT SCOPE -->
        ${c.scope==='product'?`
        <div class="fg">
          <label class="fl">Select Products</label>
          <div class="ts" style="margin-bottom:8px"><i class="fas fa-search"></i><input type="text" id="coup-prod-search" placeholder="Search products..." oninput="filterCoupProdList(this.value)"></div>
          <div id="coup-prod-list" style="display:flex;flex-direction:column;gap:3px;max-height:280px;overflow-y:auto;background:var(--bg3);border-radius:9px;padding:10px">
            ${products.map(p=>`
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:5px 0;border-bottom:1px solid var(--border)" class="coup-prod-item">
              <input type="checkbox" name="coup-prods" value="${p.id}" ${(c.products||[]).includes(p.id)?'checked':''} style="width:14px;height:14px">
              <img src="${p.image||''}" onerror="this.src='https://via.placeholder.com/28'" style="width:28px;height:28px;border-radius:5px;object-fit:cover;flex-shrink:0">
              <div style="flex:1;min-width:0">
                <div style="font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.title||p.name}</div>
                <div style="font-size:10px;color:var(--text3)">₹${p.price} · ${p.category||'—'}</div>
              </div>
            </label>`).join('')}
          </div>
          <div style="font-size:11px;color:var(--text3);margin-top:4px" id="coup-prod-count">${(c.products||[]).length} selected</div>
        </div>`:''}

        <!-- BUNDLE SCOPE -->
        ${c.scope==='bundle'?`
        <div class="fgrid">
          <div class="fg cs2"><label class="fl">Bundle Name</label><input class="fc" id="ce-bundle-name" value="${c.bundleName||''}" placeholder="e.g. Design Starter Pack"></div>
          <div class="fg cs2"><label class="fl">Bundle Description</label><input class="fc" id="ce-bundle-desc" value="${c.bundleDesc||''}" placeholder="Get 3 products at a discount"></div>
          <div class="fg cs2">
            <label class="fl">Products in Bundle (customer must buy ALL of these)</label>
            <div style="display:flex;flex-direction:column;gap:3px;max-height:240px;overflow-y:auto;background:var(--bg3);border-radius:9px;padding:10px">
              ${products.map(p=>`
              <label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:4px 0;border-bottom:1px solid var(--border)">
                <input type="checkbox" name="coup-bundle-prods" value="${p.id}" ${(c.bundleProducts||[]).includes(p.id)?'checked':''} style="width:14px;height:14px">
                <img src="${p.image||''}" onerror="this.src='https://via.placeholder.com/28'" style="width:28px;height:28px;border-radius:5px;object-fit:cover;flex-shrink:0">
                <div style="flex:1;min-width:0">
                  <div style="font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.title||p.name}</div>
                  <div style="font-size:10px;color:var(--text3)">₹${p.price}</div>
                </div>
              </label>`).join('')}
            </div>
          </div>
        </div>`:''}
      </div>

      <!-- LIMITS & VALIDITY -->
      <div class="card">
        <div class="card-hd"><div class="card-title"><i class="fas fa-sliders-h" style="color:var(--yellow)"></i>Limits & Validity</div></div>
        <div class="fgrid">
          <div class="fg"><label class="fl">Max Total Uses</label><input class="fc" id="ce-max-uses" type="number" value="${c.maxUses||''}" placeholder="Unlimited"></div>
          <div class="fg"><label class="fl">Max Uses Per Customer</label><input class="fc" id="ce-per-user" type="number" value="${c.perUser||''}" placeholder="Unlimited"></div>
          <div class="fg"><label class="fl">Start Date</label><input class="fc" id="ce-start" type="date" value="${c.startDate||''}"></div>
          <div class="fg"><label class="fl">Expiry Date</label><input class="fc" id="ce-expires" type="date" value="${c.expires||''}"></div>
          <div class="fg cs2" style="display:flex;flex-wrap:wrap;gap:12px;background:var(--bg3);padding:12px;border-radius:9px">
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px"><input type="checkbox" id="ce-active" ${c.active!==false?'checked':''} style="width:15px;height:15px"> Active</label>
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px"><input type="checkbox" id="ce-first-order" ${c.firstOrderOnly?'checked':''} style="width:15px;height:15px"> First Order Only</label>
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px"><input type="checkbox" id="ce-new-user" ${c.newUsersOnly?'checked':''} style="width:15px;height:15px"> New Users Only</label>
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px"><input type="checkbox" id="ce-stackable" ${c.stackable?'checked':''} style="width:15px;height:15px"> Stackable (combine with other coupons)</label>
          </div>
        </div>
      </div>

    </div>

    <!-- RIGHT: PREVIEW + USAGE -->
    <div style="display:flex;flex-direction:column;gap:14px">
      <!-- LIVE PREVIEW -->
      <div class="card">
        <div class="card-hd"><div class="card-title"><i class="fas fa-eye" style="color:var(--accent)"></i>Coupon Preview</div></div>
        <div style="background:linear-gradient(135deg,var(--accent),var(--purple));border-radius:12px;padding:20px;text-align:center;margin-bottom:12px">
          <div style="font-size:11px;color:rgba(255,255,255,.7);margin-bottom:6px">COUPON CODE</div>
          <div style="font-size:24px;font-weight:900;letter-spacing:2px;font-family:monospace;color:#fff">${c.code||'YOUR-CODE'}</div>
          <div style="font-size:14px;color:rgba(255,255,255,.9);margin-top:8px">${c.discount||'0'}${c.type==='percent'?'% OFF':'₹ OFF'}</div>
          ${c.minOrder?`<div style="font-size:11px;color:rgba(255,255,255,.7);margin-top:4px">Min order: ₹${c.minOrder}</div>`:''}
          ${c.expires?`<div style="font-size:11px;color:rgba(255,255,255,.7);margin-top:4px">Expires: ${new Date(c.expires).toLocaleDateString('en-IN')}</div>`:''}
        </div>
        <div style="font-size:12px;color:var(--text2)">
          <div style="padding:6px 0;border-bottom:1px solid var(--border)"><strong>Scope:</strong> ${couponScopeLabel(c)}</div>
          <div style="padding:6px 0;border-bottom:1px solid var(--border)"><strong>Uses:</strong> ${c.uses||0}${c.maxUses?'/'+c.maxUses:' (unlimited)'}</div>
          <div style="padding:6px 0"><strong>Status:</strong> <span class="tag ${couponStatus(c).cls}">${couponStatus(c).label}</span></div>
        </div>
        <div style="display:flex;gap:6px;margin-top:10px">
          <button class="btn btn-secondary btn-sm" onclick="navigator.clipboard.writeText(document.getElementById('ce-code')?.value||'');window.toast('Code copied!','s')"><i class="fas fa-copy"></i>Copy Code</button>
          <button class="btn btn-secondary btn-sm" onclick="shareCoupon(document.getElementById('ce-code')?.value||'')"><i class="fas fa-share-alt"></i>Share</button>
        </div>
      </div>

      <!-- USAGE HISTORY -->
      ${!isNew && (c.usageHistory||[]).length ? `
      <div class="card">
        <div class="card-hd"><div class="card-title"><i class="fas fa-history" style="color:var(--blue)"></i>Usage History</div></div>
        <div class="tw"><table>
          <thead><tr><th>Customer</th><th>Order</th><th>Saved</th><th>Date</th></tr></thead>
          <tbody>${(c.usageHistory||[]).slice(0,10).map(u=>`<tr>
            <td style="font-size:12px">${u.customer||'Guest'}</td>
            <td style="font-size:12px">#${u.orderId||'—'}</td>
            <td style="color:var(--green);font-size:12px">₹${u.saved||0}</td>
            <td style="font-size:11px;color:var(--text2)">${u.date||'—'}</td>
          </tr>`).join('')}</tbody>
        </table></div>
      </div>` : ''}
    </div>
  </div>
  <input type="hidden" id="ce-coup-id" value="${c.id}">
  <input type="hidden" id="ce-coup-uses" value="${c.uses||0}">`;
}

function renderBulkGenerator() {
  return `
  <div class="ph">
    <div style="display:flex;align-items:center;gap:10px">
      <button class="btn btn-secondary btn-sm" onclick="window._couponEditing=null;navigate('coupons')"><i class="fas fa-arrow-left"></i>Back</button>
      <div><div class="ph-title">Bulk Coupon Generator</div><div class="ph-sub">Generate multiple unique coupon codes at once</div></div>
    </div>
  </div>
  <div class="g2">
    <div class="card">
      <div class="card-hd"><div class="card-title"><i class="fas fa-layer-group" style="color:var(--accent)"></i>Bulk Settings</div></div>
      <div class="fgrid">
        <div class="fg"><label class="fl">Quantity</label><input class="fc" id="bulk-qty" type="number" value="10" min="1" max="500"></div>
        <div class="fg"><label class="fl">Code Prefix</label><input class="fc" id="bulk-prefix" value="DK" placeholder="DK" maxlength="6"></div>
        <div class="fg"><label class="fl">Discount Type</label>
          <select class="fc" id="bulk-type">
            <option value="percent">Percentage (%)</option>
            <option value="fixed">Fixed Amount (₹)</option>
          </select>
        </div>
        <div class="fg"><label class="fl">Discount Value</label><input class="fc" id="bulk-discount" type="number" value="20" placeholder="20"></div>
        <div class="fg"><label class="fl">Min Order (₹)</label><input class="fc" id="bulk-min" type="number" value="0" placeholder="0"></div>
        <div class="fg"><label class="fl">Max Uses Each</label><input class="fc" id="bulk-max-uses" type="number" value="1" placeholder="1"></div>
        <div class="fg"><label class="fl">Expiry Date</label><input class="fc" id="bulk-expires" type="date"></div>
        <div class="fg"><label class="fl">Scope</label>
          <select class="fc" id="bulk-scope">
            <option value="all">All Products</option>
            <option value="category">Category</option>
            <option value="product">Specific Products</option>
          </select>
        </div>
      </div>
      <button class="btn btn-primary" onclick="runBulkGenerate()"><i class="fas fa-magic"></i>Generate Coupons</button>
    </div>
    <div class="card">
      <div class="card-hd"><div class="card-title"><i class="fas fa-list" style="color:var(--green)"></i>Generated Codes</div></div>
      <div id="bulk-output" class="es" style="padding:20px"><i class="fas fa-layer-group"></i><p>Configure and click Generate</p></div>
    </div>
  </div>`;
}

// ── ACTIONS ───────────────────────────────────────────────────────────────────
window.openCouponEditor = function(id) {
  window._couponEditing = id;
  navigate('coupons');
};

window.saveCouponEditor = function() {
  const coupons = getCoupons();
  const id = document.getElementById('ce-coup-id')?.value;
  const isNew = id === 'new';
  const scope = document.getElementById('ce-scope')?.value || 'all';

  const categories = [...document.querySelectorAll('[name="coup-cats"]:checked')].map(c=>c.value);
  const products = [...document.querySelectorAll('[name="coup-prods"]:checked')].map(c=>c.value);
  const bundleProducts = [...document.querySelectorAll('[name="coup-bundle-prods"]:checked')].map(c=>c.value);

  const code = document.getElementById('ce-code')?.value?.toUpperCase()?.trim();
  if (!code) return window.toast('Coupon code is required','w');

  const coupon = {
    id: isNew ? Date.now().toString() : id,
    code, prefix: document.getElementById('ce-prefix')?.value||'DK',
    description: document.getElementById('ce-desc')?.value||'',
    type: document.getElementById('ce-type')?.value||'percent',
    discount: parseFloat(document.getElementById('ce-discount')?.value||0),
    maxDiscount: parseFloat(document.getElementById('ce-max-discount')?.value||0)||null,
    minOrder: parseFloat(document.getElementById('ce-min-order')?.value||0)||0,
    scope, categories, products, bundleProducts,
    bundleName: document.getElementById('ce-bundle-name')?.value||'',
    bundleDesc: document.getElementById('ce-bundle-desc')?.value||'',
    maxUses: parseInt(document.getElementById('ce-max-uses')?.value||0)||null,
    perUser: parseInt(document.getElementById('ce-per-user')?.value||0)||null,
    startDate: document.getElementById('ce-start')?.value||'',
    expires: document.getElementById('ce-expires')?.value||'',
    active: document.getElementById('ce-active')?.checked!==false,
    firstOrderOnly: document.getElementById('ce-first-order')?.checked||false,
    newUsersOnly: document.getElementById('ce-new-user')?.checked||false,
    stackable: document.getElementById('ce-stackable')?.checked||false,
    uses: parseInt(document.getElementById('ce-coup-uses')?.value||0),
    usageHistory: isNew ? [] : (coupons.find(x=>x.id===id)?.usageHistory||[]),
    createdAt: isNew ? new Date().toISOString() : (coupons.find(x=>x.id===id)?.createdAt||new Date().toISOString()),
    updatedAt: new Date().toISOString()
  };

  if (isNew) coupons.unshift(coupon);
  else { const i=coupons.findIndex(x=>x.id===id); if(i>-1) coupons[i]=coupon; }
  saveCoupons(coupons);
  window.toast(isNew?'Coupon created!':'Coupon updated!');
  if (window.ActivityLog) ActivityLog.log(isNew?'create':'update','Coupon',coupon.code);
  window._couponEditing = null;
  navigate('coupons');
};

window.toggleCoupon = function(id, active) {
  const coupons = getCoupons();
  const c = coupons.find(x=>x.id===id);
  if (c) { c.active = active; saveCoupons(coupons); window.toast(active?'Coupon enabled':'Coupon disabled'); navigate('coupons'); }
};

window.deleteCoupon = function(id) {
  if (!confirm('Delete this coupon?')) return;
  saveCoupons(getCoupons().filter(c=>c.id!==id));
  window.toast('Coupon deleted','e'); navigate('coupons');
};

window.duplicateCoupon = function(id) {
  const coupons = getCoupons();
  const c = coupons.find(x=>x.id===id);
  if (!c) return;
  const copy = { ...c, id: Date.now().toString(), code: autoCode(c.prefix||'DK'), uses: 0, usageHistory: [], createdAt: new Date().toISOString() };
  coupons.unshift(copy);
  saveCoupons(coupons);
  window.toast('Coupon duplicated!');
  navigate('coupons');
};

window.shareCoupon = function(code) {
  const url = `http://localhost:3001/?coupon=${code}`;
  const msg = `🎁 Use coupon code *${code}* at DigiKraft.shop for a special discount!\n\n${url}`;
  navigator.clipboard.writeText(msg).then(()=>window.toast('Share message copied!','s'));
};

window.filterCoupProdList = function(q) {
  document.querySelectorAll('.coup-prod-item').forEach(el => {
    el.style.display = el.textContent.toLowerCase().includes(q.toLowerCase()) ? '' : 'none';
  });
};

window.runBulkGenerate = function() {
  const qty = parseInt(document.getElementById('bulk-qty')?.value||10);
  const prefix = document.getElementById('bulk-prefix')?.value||'DK';
  const type = document.getElementById('bulk-type')?.value||'percent';
  const discount = parseFloat(document.getElementById('bulk-discount')?.value||20);
  const minOrder = parseFloat(document.getElementById('bulk-min')?.value||0);
  const maxUses = parseInt(document.getElementById('bulk-max-uses')?.value||1);
  const expires = document.getElementById('bulk-expires')?.value||'';
  const scope = document.getElementById('bulk-scope')?.value||'all';

  const coupons = getCoupons();
  const newCodes = [];
  for (let i=0; i<Math.min(qty,500); i++) {
    const code = autoCode(prefix);
    const coupon = { id: Date.now().toString()+i, code, prefix, type, discount, minOrder, maxUses, expires, scope, active:true, uses:0, usageHistory:[], createdAt:new Date().toISOString() };
    coupons.unshift(coupon);
    newCodes.push(code);
  }
  saveCoupons(coupons);

  const out = document.getElementById('bulk-output');
  if (out) out.innerHTML = `
    <div class="card-hd"><div class="card-title">${newCodes.length} Codes Generated</div>
      <div style="display:flex;gap:6px">
        <button class="btn btn-secondary btn-sm" onclick="navigator.clipboard.writeText(document.getElementById('bulk-codes').textContent);window.toast('All codes copied!','s')"><i class="fas fa-copy"></i>Copy All</button>
        <button class="btn btn-success btn-sm" onclick="window._couponEditing=null;navigate('coupons')"><i class="fas fa-check"></i>Done</button>
      </div>
    </div>
    <div id="bulk-codes" style="font-family:monospace;font-size:12px;background:var(--bg3);border-radius:9px;padding:12px;max-height:300px;overflow-y:auto;line-height:2;white-space:pre">${newCodes.join('\n')}</div>`;
  window.toast(`${newCodes.length} coupons generated!`,'s');
};

// Validate coupon on checkout (utility function for main website integration)
window.validateCoupon = function(code, cartItems, cartTotal, userId) {
  const coupons = getCoupons();
  const c = coupons.find(x=>x.code===code.toUpperCase());
  if (!c) return { valid:false, error:'Coupon not found' };
  if (!c.active) return { valid:false, error:'Coupon is inactive' };
  if (c.expires && new Date(c.expires)<new Date()) return { valid:false, error:'Coupon has expired' };
  if (c.startDate && new Date(c.startDate)>new Date()) return { valid:false, error:'Coupon not yet active' };
  if (c.maxUses && (c.uses||0)>=c.maxUses) return { valid:false, error:'Coupon usage limit reached' };
  if (c.minOrder && cartTotal<c.minOrder) return { valid:false, error:`Minimum order ₹${c.minOrder} required` };

  // Scope check
  if (c.scope==='category') {
    const cartCats = cartItems.map(i=>i.category);
    if (!c.categories.some(cat=>cartCats.includes(cat))) return { valid:false, error:'Coupon not valid for items in cart' };
  }
  if (c.scope==='product') {
    const cartIds = cartItems.map(i=>String(i.id));
    if (!c.products.some(pid=>cartIds.includes(String(pid)))) return { valid:false, error:'Coupon not valid for items in cart' };
  }
  if (c.scope==='bundle') {
    const cartIds = cartItems.map(i=>String(i.id));
    if (!c.bundleProducts.every(pid=>cartIds.includes(String(pid)))) return { valid:false, error:`Add all bundle products to use this coupon` };
  }

  // Calculate discount
  let discountAmount = 0;
  if (c.type==='percent') discountAmount = Math.round(cartTotal*(c.discount/100));
  if (c.type==='fixed') discountAmount = c.discount;
  if (c.maxDiscount) discountAmount = Math.min(discountAmount, c.maxDiscount);
  discountAmount = Math.min(discountAmount, cartTotal);

  return { valid:true, discountAmount, coupon:c, message:`${c.discount}${c.type==='percent'?'%':'₹'} off applied!` };
};
