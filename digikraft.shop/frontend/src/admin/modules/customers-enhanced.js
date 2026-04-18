
// ===== FULL CRM CUSTOMERS MODULE =====
window._custTab = window._custTab || 'all';
window._customers = [];
window._custSearch = '';

window.renderCustomersEnhanced = async function() {
  try {
    const [custRes, ordRes] = await Promise.all([
      AdminAPI.getCustomers({ limit: 500 }),
      AdminAPI.getOrders({ limit: 500 })
    ]);
    window._customers = custRes.data?.customers || [];
    const orders = ordRes.data?.orders || [];

    const tab = window._custTab;
    const search = document.getElementById('cust-s')?.value || '';

    let filtered = [...window._customers].filter(c => c.role !== 'admin');
    if (search) filtered = filtered.filter(c =>
      (c.name||'').toLowerCase().includes(search.toLowerCase()) ||
      (c.email||'').toLowerCase().includes(search.toLowerCase()) ||
      (c.phone||'').toLowerCase().includes(search.toLowerCase()) ||
      (c.tags||[]).some(t => t.toLowerCase().includes(search.toLowerCase()))
    );
    if (tab === 'active') filtered = filtered.filter(c => (c.total_orders||0) > 0);
    if (tab === 'new') filtered = filtered.filter(c => !(c.total_orders||0));
    if (tab === 'vip') filtered = filtered.filter(c => (c.total_spent||0) > 5000);
    if (tab === 'affiliates') filtered = filtered.filter(c => c.affiliate);

    const customers = window._customers.filter(c => c.role !== 'admin');
    const totalSpent = customers.reduce((s, c) => s + (c.total_spent||0), 0);
    const affiliateCount = customers.filter(c => c.affiliate).length;
    const vipCount = customers.filter(c => (c.total_spent||0) > 5000).length;

    return `
    <div class="ph">
      <div>
        <div class="ph-title">Customers <span style="font-size:14px;font-weight:400;color:var(--text3)">(CRM)</span></div>
        <div class="ph-sub">${customers.length} customers · ₹${totalSpent.toLocaleString('en-IN')} total revenue · ${affiliateCount} affiliates</div>
      </div>
      <div class="ph-actions">
        <button class="btn btn-secondary" onclick="exportCustomersCSV()"><i class="fas fa-download"></i>Export CSV</button>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-grid" style="margin-bottom:16px">
      <div class="stat-card"><div class="si si-blue"><i class="fas fa-users"></i></div><div><div class="sv">${customers.length}</div><div class="sl">Total</div></div></div>
      <div class="stat-card"><div class="si si-green"><i class="fas fa-user-check"></i></div><div><div class="sv">${customers.filter(c=>(c.total_orders||0)>0).length}</div><div class="sl">Buyers</div></div></div>
      <div class="stat-card"><div class="si si-yellow"><i class="fas fa-crown"></i></div><div><div class="sv">${vipCount}</div><div class="sl">VIP (₹5k+)</div></div></div>
      <div class="stat-card"><div class="si si-purple"><i class="fas fa-handshake"></i></div><div><div class="sv">${affiliateCount}</div><div class="sl">Affiliates</div></div></div>
    </div>

    <!-- Tabs -->
    <div class="tabs" style="margin-bottom:16px">
      ${[
        ['all', `All (${customers.length})`],
        ['active', `Buyers (${customers.filter(c=>(c.total_orders||0)>0).length})`],
        ['new', `New (${customers.filter(c=>!(c.total_orders||0)).length})`],
        ['vip', `VIP (${vipCount})`],
        ['affiliates', `Affiliates (${affiliateCount})`]
      ].map(([id,lb]) => `<button class="tab ${tab===id?'on':''}" onclick="window._custTab='${id}';navigate('customers')">${lb}</button>`).join('')}
    </div>

    <!-- Search + Filter -->
    <div class="card">
      <div class="ttb">
        <div class="ts"><i class="fas fa-search"></i><input type="text" id="cust-s" placeholder="Search name, email, phone, tag..." oninput="navigate('customers')" value="${search}"></div>
        <span style="margin-left:auto;font-size:12px;color:var(--text2)">${filtered.length} result(s)</span>
      </div>

      ${filtered.length ? `
      <div class="tw"><table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Contact</th>
            <th>Orders</th>
            <th>Spent</th>
            <th>Tags</th>
            <th>Status</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(c => {
            const tags = c.tags || [];
            const isVip = (c.total_spent||0) > 5000;
            const isLoyal = (c.total_orders||0) > 5;
            return `<tr>
              <td>
                <div style="display:flex;align-items:center;gap:10px">
                  <div style="width:38px;height:38px;border-radius:10px;background:linear-gradient(135deg,var(--accent),var(--purple));display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px;color:#fff;flex-shrink:0">${(c.name||'?')[0].toUpperCase()}</div>
                  <div>
                    <div style="font-size:13px;font-weight:700">${c.name||'Unknown'}</div>
                    <div style="font-size:11px;color:var(--text3)">${c.email||'—'}</div>
                  </div>
                </div>
              </td>
              <td style="font-size:12px">${c.phone||'—'}</td>
              <td><strong>${c.total_orders||0}</strong></td>
              <td><strong style="color:var(--green)">₹${(c.total_spent||0).toLocaleString('en-IN')}</strong></td>
              <td>
                <div style="display:flex;gap:3px;flex-wrap:wrap;max-width:160px">
                  ${isVip?'<span class="tag ty" style="font-size:10px">👑 VIP</span>':''}
                  ${isLoyal?'<span class="tag tp" style="font-size:10px">💎 Loyal</span>':''}
                  ${c.affiliate?`<span class="tag" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-size:10px">🤝 Affiliate</span>`:''}
                  ${tags.slice(0,2).map(t=>`<span style="background:var(--bg3);color:var(--text2);font-size:10px;padding:1px 6px;border-radius:99px">${t}</span>`).join('')}
                </div>
              </td>
              <td><span class="tag ${c.status==='active'||!c.status?'tg':'tr'}" style="font-size:10px">${c.status||'active'}</span></td>
              <td style="font-size:11px;color:var(--text2)">${c.created_at?new Date(c.created_at).toLocaleDateString('en-IN'):'—'}</td>
              <td>
                <div style="display:flex;gap:4px">
                  <button class="btn btn-sm btn-primary btn-icon" onclick="openCustomerCRM(${c.id})" title="Full Profile"><i class="fas fa-id-card"></i></button>
                  <button class="btn btn-sm btn-secondary btn-icon" onclick="quickIssueCoupon(${c.id},'${(c.name||'').replace(/'/g,"\\'")}','${c.email||''}')" title="Issue Coupon"><i class="fas fa-ticket-alt"></i></button>
                  ${c.phone ? `<a href="https://wa.me/${(c.phone||'').replace(/[^0-9]/g,'')}" target="_blank" class="btn btn-sm btn-icon" style="background:#25D366;color:#fff;border:none" title="WhatsApp ${c.phone}"><i class="fab fa-whatsapp"></i></a>` : `<button class="btn btn-sm btn-icon" style="background:var(--bg3);color:var(--text3);border:1px solid var(--border);cursor:not-allowed" title="No phone number" disabled><i class="fab fa-whatsapp"></i></button>`}
                </div>
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table></div>` : '<div class="es"><i class="fas fa-users"></i><p>No customers found</p></div>'}
    </div>`;
  } catch (e) {
    return `<div class="es"><i class="fas fa-exclamation-triangle" style="color:var(--red)"></i><p>Failed to load: ${e.message}</p></div>`;
  }
};

// ── FULL CRM PROFILE MODAL ────────────────────────────────────────────────────
window.openCustomerCRM = async function(id) {
  // Show loading overlay
  const overlay = document.createElement('div');
  overlay.id = 'crm-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:600;display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto';
  overlay.innerHTML = `<div style="background:var(--bg2);border-radius:16px;padding:40px;text-align:center"><div class="spinner" style="width:32px;height:32px;border:3px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 12px"></div><div style="color:var(--text2)">Loading customer profile...</div></div>`;
  document.body.appendChild(overlay);

  try {
    const res = await AdminAPI.getCustomer(id);
    const c = res.data;
    const aff = c.affiliate;
    const stats = c.stats || {};

    overlay.innerHTML = `
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:16px;width:100%;max-width:900px;max-height:92vh;overflow-y:auto">

      <!-- HEADER -->
      <div style="padding:20px 24px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:var(--bg2);z-index:10">
        <div style="display:flex;align-items:center;gap:14px">
          <div style="width:52px;height:52px;border-radius:14px;background:linear-gradient(135deg,var(--accent),var(--purple));display:flex;align-items:center;justify-content:center;font-weight:900;font-size:22px;color:#fff">${(c.name||'?')[0].toUpperCase()}</div>
          <div>
            <div style="font-size:20px;font-weight:800">${c.name||'Unknown'}</div>
            <div style="font-size:12px;color:var(--text3);display:flex;align-items:center;gap:8px">
              <span>${c.email||'—'}</span>
              ${c.phone?`<span>· ${c.phone}</span>`:''}
              <span class="tag ${c.status==='active'||!c.status?'tg':'tr'}" style="font-size:10px">${c.status||'active'}</span>
              ${aff?`<span class="tag" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-size:10px">🤝 Affiliate</span>`:''}
            </div>
          </div>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          ${c.phone ? `<a href="https://wa.me/${(c.phone||'').replace(/[^0-9]/g,'')}" target="_blank" class="btn btn-sm" style="background:#25D366;color:#fff;border:none;display:flex;align-items:center;gap:6px"><i class="fab fa-whatsapp"></i>WhatsApp</a>` : ''}
          <button class="btn btn-secondary btn-sm" onclick="quickIssueCoupon(${c.id},'${(c.name||'').replace(/'/g,"\\'")}','${c.email||''}')"><i class="fas fa-ticket-alt"></i>Issue Coupon</button>
          <button class="btn btn-primary btn-sm" onclick="openEditCustomerModal(${c.id})"><i class="fas fa-edit"></i>Edit</button>
          <button onclick="document.getElementById('crm-overlay').remove()" style="background:var(--bg3);border:none;border-radius:8px;width:32px;height:32px;cursor:pointer;color:var(--text2);font-size:16px">×</button>
        </div>
      </div>

      <div style="padding:20px 24px;display:grid;grid-template-columns:1fr 1fr;gap:16px">

        <!-- CONTACT & PROFILE -->
        <div class="card">
          <div class="card-hd"><div class="card-title"><i class="fas fa-address-card" style="color:var(--blue)"></i>Contact Details</div>
          </div>
          <div id="customer-contact-${c.id}">
            ${[
              ['fa-envelope','Email', c.email||'—'],
              ['fa-phone','Phone', c.phone ? `<span>${c.phone}</span> <a href="https://wa.me/${(c.phone||'').replace(/[^0-9]/g,'')}" target="_blank" style="display:inline-flex;align-items:center;gap:3px;background:#25D366;color:#fff;font-size:10px;padding:2px 7px;border-radius:99px;text-decoration:none;margin-left:6px"><i class="fab fa-whatsapp" style="font-size:10px"></i>Chat</a>` : '<span style="color:var(--red);font-size:11px">⚠ Not provided</span>'],
              ['fa-map-marker-alt','City', c.city||'—'],
              ['fa-calendar-alt','Joined', c.created_at?new Date(c.created_at).toLocaleDateString('en-IN'):'—'],
              ['fa-shield-alt','Role', c.role||'customer'],
              ['fa-sticky-note','Notes', c.notes||'No notes']
            ].map(([icon,label,val]) => `
            <div style="display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
              <i class="fas ${icon}" style="color:var(--text3);width:16px;margin-top:2px;flex-shrink:0"></i>
              <div style="flex:1">
                <div style="font-size:10px;color:var(--text3);font-weight:700;text-transform:uppercase">${label}</div>
                <div style="font-size:13px">${val}</div>
              </div>
            </div>`).join('')}
          </div>
          <!-- Tags -->
          <div style="margin-top:10px">
            <div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:6px">TAGS</div>
            <div id="customer-tags-${c.id}" style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px">
              ${(c.tags||[]).map(t=>`<span style="background:var(--bg3);border:1px solid var(--border);color:var(--text2);font-size:11px;padding:2px 8px;border-radius:99px;display:flex;align-items:center;gap:4px">${t}<button onclick="removeCustomerTag(${c.id},'${t}')" style="background:none;border:none;cursor:pointer;color:var(--text3);font-size:10px;padding:0;line-height:1">×</button></span>`).join('')}
            </div>
            <div style="display:flex;gap:6px">
              <input class="fc" id="new-tag-${c.id}" placeholder="Add tag..." style="flex:1;font-size:12px;padding:5px 10px" onkeydown="if(event.key==='Enter')addCustomerTag(${c.id})">
              <button class="btn btn-secondary btn-sm" onclick="addCustomerTag(${c.id})"><i class="fas fa-plus"></i></button>
            </div>
          </div>
        </div>

        <!-- PURCHASE STATS -->
        <div class="card">
          <div class="card-hd"><div class="card-title"><i class="fas fa-chart-bar" style="color:var(--green)"></i>Purchase Overview</div></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
            ${[
              ['Total Orders', stats.total_orders||0, 'var(--accent)'],
              ['Total Spent', '₹'+(stats.total_spent||0).toLocaleString('en-IN'), 'var(--green)'],
              ['Avg Order', '₹'+(stats.avg_order_value||0).toLocaleString('en-IN'), 'var(--blue)'],
              ['Downloads', stats.total_downloads||0, 'var(--purple)'],
              ['Reviews', stats.total_reviews||0, 'var(--yellow)'],
              ['Coupons', (c.personal_coupons||[]).length, 'var(--red)']
            ].map(([label,val,color]) => `
            <div style="text-align:center;padding:12px;background:var(--bg3);border-radius:9px">
              <div style="font-size:20px;font-weight:800;color:${color}">${val}</div>
              <div style="font-size:10px;color:var(--text3)">${label}</div>
            </div>`).join('')}
          </div>
          ${(stats.total_spent||0)>5000?'<div style="padding:8px 12px;background:rgba(245,158,11,.1);border:1px solid var(--yellow);border-radius:8px;text-align:center;font-size:12px;font-weight:700;color:var(--yellow)">👑 VIP Customer — ₹5,000+ spent</div>':''}
          ${(stats.total_orders||0)>5?'<div style="padding:8px 12px;background:rgba(99,102,241,.1);border:1px solid var(--accent);border-radius:8px;text-align:center;font-size:12px;font-weight:700;color:var(--accent);margin-top:6px">💎 Loyal Customer — 5+ orders</div>':''}
        </div>

        <!-- PURCHASE HISTORY -->
        <div class="card" style="grid-column:span 2">
          <div class="card-hd"><div class="card-title"><i class="fas fa-shopping-bag" style="color:var(--accent)"></i>Purchase History (${(c.orders||[]).length} orders)</div></div>
          ${(c.orders||[]).length ? `
          <div class="tw"><table>
            <thead><tr><th>Order #</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              ${(c.orders||[]).map(o=>`<tr>
                <td style="font-size:12px;font-family:monospace">${o.order_number||'ORD-'+o.id}</td>
                <td style="font-size:12px">${(o.items||[]).map(i=>`<div style="font-size:11px">${i.productName||'Product'} × ${i.quantity||1}</div>`).join('')||'—'}</td>
                <td><strong style="color:var(--green)">₹${(o.total||0).toLocaleString('en-IN')}</strong></td>
                <td><span class="tag ${o.payment_status==='paid'?'tg':'ty'}" style="font-size:10px">${o.payment_status||'pending'}</span></td>
                <td><span class="tag ${o.status==='completed'?'tg':o.status==='processing'?'tb':'ty'}" style="font-size:10px">${o.status||'pending'}</span></td>
                <td style="font-size:11px;color:var(--text2)">${o.created_at?new Date(o.created_at).toLocaleDateString('en-IN'):'—'}</td>
              </tr>`).join('')}
            </tbody>
          </table></div>` : '<div style="text-align:center;padding:20px;color:var(--text3)"><i class="fas fa-shopping-bag" style="font-size:24px;display:block;margin-bottom:8px"></i>No orders yet</div>'}
        </div>

        <!-- PERSONAL COUPONS -->
        <div class="card">
          <div class="card-hd">
            <div class="card-title"><i class="fas fa-ticket-alt" style="color:var(--red)"></i>Personal Coupons</div>
            <button class="btn btn-primary btn-sm" onclick="quickIssueCoupon(${c.id},'${(c.name||'').replace(/'/g,"\\'")}','${c.email||''}')"><i class="fas fa-plus"></i>Issue</button>
          </div>
          ${(c.personal_coupons||[]).length ? `
          <div style="display:flex;flex-direction:column;gap:6px">
            ${(c.personal_coupons||[]).map(cp=>`
            <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--bg3);border-radius:9px">
              <div>
                <div style="font-size:13px;font-weight:700;font-family:monospace;color:var(--accent)">${cp.code}</div>
                <div style="font-size:11px;color:var(--text3)">${cp.discount_type==='percent'?cp.discount_value+'% off':'₹'+cp.discount_value+' off'} · ${cp.note||''}</div>
              </div>
              <span class="tag ${cp.status==='active'?'tg':'tr'}" style="font-size:10px">${cp.status}</span>
            </div>`).join('')}
          </div>` : '<div style="text-align:center;padding:16px;color:var(--text3);font-size:12px">No personal coupons yet</div>'}
        </div>

        <!-- CART ITEMS -->
        <div class="card">
          <div class="card-hd"><div class="card-title"><i class="fas fa-shopping-cart" style="color:var(--blue)"></i>Cart Items (${(c.cart_items||[]).length})</div></div>
          ${(c.cart_items||[]).length ? `
          <div style="display:flex;flex-direction:column;gap:6px">
            ${(c.cart_items||[]).map(item=>`
            <div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:var(--bg3);border-radius:9px">
              ${item.image?`<img src="${item.image}" style="width:36px;height:36px;border-radius:6px;object-fit:cover;flex-shrink:0" onerror="this.style.display='none'">`:'<div style="width:36px;height:36px;border-radius:6px;background:var(--bg2);display:flex;align-items:center;justify-content:center;flex-shrink:0"><i class="fas fa-box" style="color:var(--text3);font-size:14px"></i></div>'}
              <div style="flex:1;min-width:0">
                <div style="font-size:12px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${item.name||'Product'}</div>
                <div style="font-size:11px;color:var(--text3)">Qty: ${item.quantity||1}</div>
              </div>
              <div style="font-size:13px;font-weight:800;color:var(--accent);flex-shrink:0">₹${((item.price||0)*(item.quantity||1)).toLocaleString('en-IN')}</div>
            </div>`).join('')}
          </div>
          <div style="margin-top:8px;padding:8px 10px;background:rgba(99,102,241,.08);border-radius:8px;text-align:right;font-size:13px;font-weight:700;color:var(--accent)">
            Cart Total: ₹${(c.cart_items||[]).reduce((s,i)=>s+(i.price||0)*(i.quantity||1),0).toLocaleString('en-IN')}
          </div>` : '<div style="text-align:center;padding:16px;color:var(--text3);font-size:12px"><i class="fas fa-shopping-cart" style="display:block;font-size:20px;margin-bottom:6px"></i>Empty cart</div>'}
        </div>

        <!-- WISHLIST -->
        <div class="card">
          <div class="card-hd"><div class="card-title"><i class="fas fa-heart" style="color:var(--red)"></i>Wishlist (${(c.wishlist||[]).length})</div></div>
          ${(c.wishlist||[]).length ? `
          <div style="display:flex;flex-direction:column;gap:6px">
            ${(c.wishlist||[]).map(item=>`
            <div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:var(--bg3);border-radius:9px">
              ${item.image?`<img src="${item.image}" style="width:36px;height:36px;border-radius:6px;object-fit:cover;flex-shrink:0" onerror="this.style.display='none'">`:'<div style="width:36px;height:36px;border-radius:6px;background:var(--bg2);display:flex;align-items:center;justify-content:center;flex-shrink:0"><i class="fas fa-heart" style="color:var(--red);font-size:14px"></i></div>'}
              <div style="flex:1;min-width:0">
                <div style="font-size:12px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${item.name||'Product'}</div>
                <div style="font-size:11px;color:var(--text3)">${item.category||''}</div>
              </div>
              <div style="font-size:13px;font-weight:800;color:var(--green);flex-shrink:0">₹${(item.price||0).toLocaleString('en-IN')}</div>
            </div>`).join('')}
          </div>` : '<div style="text-align:center;padding:16px;color:var(--text3);font-size:12px"><i class="fas fa-heart" style="display:block;font-size:20px;margin-bottom:6px"></i>No wishlist items</div>'}
        </div>

        <!-- AFFILIATE SECTION -->
        ${aff ? `
        <div class="card" style="border:2px solid var(--accent)">
          <div class="card-hd"><div class="card-title"><i class="fas fa-handshake" style="color:var(--accent)"></i>Affiliate Dashboard</div>
            <span class="tag ${aff.status==='approved'?'tg':aff.status==='pending'?'ty':'tr'}">${aff.status}</span>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
            ${[
              ['Referral Code', aff.code, 'var(--accent)'],
              ['Commission', aff.commission_rate+'%', 'var(--green)'],
              ['Total Clicks', aff.total_clicks||0, 'var(--blue)'],
              ['Total Sales', aff.total_sales||0, 'var(--purple)'],
              ['Total Earned', '₹'+(aff.total_earned||0).toLocaleString('en-IN'), 'var(--green)'],
              ['Pending Payout', '₹'+(aff.pending_payout||0).toLocaleString('en-IN'), 'var(--yellow)']
            ].map(([label,val,color]) => `
            <div style="padding:8px 10px;background:var(--bg3);border-radius:8px">
              <div style="font-size:10px;color:var(--text3)">${label}</div>
              <div style="font-size:14px;font-weight:800;color:${color}">${val}</div>
            </div>`).join('')}
          </div>
          ${aff.status==='pending'?`<button class="btn btn-success btn-sm" style="width:100%" onclick="approveAffiliate(${aff.id})"><i class="fas fa-check"></i>Approve Affiliate</button>`:''}
          ${aff.status==='approved'?`
          <div style="display:flex;gap:6px">
            <button class="btn btn-secondary btn-sm" style="flex:1" onclick="setAffiliateRate(${aff.id})"><i class="fas fa-percent"></i>Set Rate</button>
            <button class="btn btn-danger btn-sm" style="flex:1" onclick="rejectAffiliate(${aff.id})"><i class="fas fa-ban"></i>Suspend</button>
          </div>`:''}
        </div>` : `
        <div class="card" style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:120px;border:2px dashed var(--border)">
          <i class="fas fa-handshake" style="font-size:28px;color:var(--text3);margin-bottom:8px"></i>
          <div style="font-size:13px;color:var(--text3)">Not an affiliate</div>
        </div>`}

        <!-- RECENT REVIEWS -->
        ${(c.reviews||[]).length ? `
        <div class="card" style="grid-column:span 2">
          <div class="card-hd"><div class="card-title"><i class="fas fa-star" style="color:var(--yellow)"></i>Reviews (${(c.reviews||[]).length})</div></div>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${(c.reviews||[]).map(r=>`
            <div style="padding:10px 12px;background:var(--bg3);border-radius:9px">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
                <div>${'★'.repeat(r.rating||5)}${'☆'.repeat(5-(r.rating||5))}</div>
                <span style="font-size:11px;color:var(--text3)">${r.created_at?new Date(r.created_at).toLocaleDateString('en-IN'):'—'}</span>
              </div>
              <div style="font-size:12px;color:var(--text2)">${r.comment||'No comment'}</div>
            </div>`).join('')}
          </div>
        </div>` : ''}

      </div>
    </div>`;
  } catch (e) {
    overlay.innerHTML = `<div style="background:var(--bg2);border-radius:16px;padding:40px;text-align:center;color:var(--red)"><i class="fas fa-exclamation-triangle" style="font-size:32px;display:block;margin-bottom:12px"></i>Failed to load: ${e.message}<br><button class="btn btn-secondary" style="margin-top:16px" onclick="document.getElementById('crm-overlay').remove()">Close</button></div>`;
  }
};

// ── QUICK ISSUE COUPON ────────────────────────────────────────────────────────
window.quickIssueCoupon = function(customerId, customerName, customerEmail) {
  const overlay = document.createElement('div');
  overlay.id = 'coupon-issue-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:700;display:flex;align-items:center;justify-content:center;padding:16px';
  overlay.innerHTML = `
  <div style="background:var(--bg2);border:1px solid var(--border);border-radius:14px;width:100%;max-width:420px;padding:24px">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
      <div>
        <div style="font-size:16px;font-weight:800">Issue Personal Coupon</div>
        <div style="font-size:12px;color:var(--text3)">For: ${customerName} (${customerEmail})</div>
      </div>
      <button onclick="document.getElementById('coupon-issue-overlay').remove()" style="background:var(--bg3);border:none;border-radius:7px;width:28px;height:28px;cursor:pointer;color:var(--text2)">×</button>
    </div>
    <div class="fg">
      <label class="fl">Discount Type</label>
      <select class="fc" id="ci-type">
        <option value="percent">Percentage (e.g. 20%)</option>
        <option value="fixed">Fixed Amount (e.g. ₹200)</option>
      </select>
    </div>
    <div class="fg">
      <label class="fl">Discount Value</label>
      <input class="fc" id="ci-value" type="number" placeholder="e.g. 20 for 20% or 200 for ₹200" min="1">
    </div>
    <div class="fg">
      <label class="fl">Expiry Date (optional)</label>
      <input class="fc" id="ci-expiry" type="date" min="${new Date().toISOString().slice(0,10)}">
    </div>
    <div class="fg">
      <label class="fl">Note (internal)</label>
      <input class="fc" id="ci-note" placeholder="e.g. Loyalty reward, Win-back offer..." value="Personal offer for ${customerName}">
    </div>
    <div id="ci-result" style="display:none;margin-bottom:12px;padding:10px 12px;background:rgba(16,185,129,.1);border:1px solid var(--green);border-radius:8px;font-size:13px"></div>
    <button class="btn btn-primary" style="width:100%" onclick="issueCouponToCustomer(${customerId})">
      <i class="fas fa-ticket-alt"></i>Generate & Issue Coupon
    </button>
  </div>`;
  document.body.appendChild(overlay);
};

window.issueCouponToCustomer = async function(customerId) {
  const type = document.getElementById('ci-type')?.value;
  const value = document.getElementById('ci-value')?.value;
  const expiry = document.getElementById('ci-expiry')?.value;
  const note = document.getElementById('ci-note')?.value;

  if (!value) { window.toast('Enter a discount value', 'w'); return; }

  try {
    const token = AdminAPI.getToken();
    const res = await fetch(`http://localhost:8080/api/v1/customers/${customerId}/coupon`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ discount_type: type, discount_value: parseFloat(value), expires_at: expiry||null, note })
    });
    const data = await res.json();
    if (data.success) {
      const resultEl = document.getElementById('ci-result');
      if (resultEl) {
        resultEl.style.display = 'block';
        resultEl.innerHTML = `✓ Coupon created: <strong style="font-family:monospace;color:var(--accent)">${data.data.code}</strong><br><small>${type==='percent'?value+'% off':'₹'+value+' off'}</small>`;
      }
      window.toast(`Coupon ${data.data.code} issued!`, 's');
    } else {
      window.toast('Failed: ' + data.error, 'e');
    }
  } catch (e) {
    window.toast('Error: ' + e.message, 'e');
  }
};

// ── TAG MANAGEMENT ────────────────────────────────────────────────────────────
window.addCustomerTag = async function(customerId) {
  const input = document.getElementById(`new-tag-${customerId}`);
  const tag = input?.value?.trim();
  if (!tag) return;

  try {
    const res = await AdminAPI.getCustomer(customerId);
    const tags = [...(res.data.tags || [])];
    if (!tags.includes(tag)) tags.push(tag);
    await AdminAPI.updateCustomer(customerId, { tags });
    input.value = '';
    // Refresh tag display
    const tagContainer = document.getElementById(`customer-tags-${customerId}`);
    if (tagContainer) {
      tagContainer.innerHTML = tags.map(t=>`<span style="background:var(--bg3);border:1px solid var(--border);color:var(--text2);font-size:11px;padding:2px 8px;border-radius:99px;display:flex;align-items:center;gap:4px">${t}<button onclick="removeCustomerTag(${customerId},'${t}')" style="background:none;border:none;cursor:pointer;color:var(--text3);font-size:10px;padding:0;line-height:1">×</button></span>`).join('');
    }
    window.toast(`Tag "${tag}" added`, 's');
  } catch (e) { window.toast('Failed: ' + e.message, 'e'); }
};

window.removeCustomerTag = async function(customerId, tag) {
  try {
    const res = await AdminAPI.getCustomer(customerId);
    const tags = (res.data.tags || []).filter(t => t !== tag);
    await AdminAPI.updateCustomer(customerId, { tags });
    const tagContainer = document.getElementById(`customer-tags-${customerId}`);
    if (tagContainer) {
      tagContainer.innerHTML = tags.map(t=>`<span style="background:var(--bg3);border:1px solid var(--border);color:var(--text2);font-size:11px;padding:2px 8px;border-radius:99px;display:flex;align-items:center;gap:4px">${t}<button onclick="removeCustomerTag(${customerId},'${t}')" style="background:none;border:none;cursor:pointer;color:var(--text3);font-size:10px;padding:0;line-height:1">×</button></span>`).join('');
    }
    window.toast(`Tag "${tag}" removed`, 's');
  } catch (e) { window.toast('Failed: ' + e.message, 'e'); }
};

// ── AFFILIATE ACTIONS ─────────────────────────────────────────────────────────
window.approveAffiliate = async function(affiliateId) {
  if (!confirm('Approve this affiliate at 10% commission?')) return;
  try {
    const token = AdminAPI.getToken();
    const res = await fetch(`http://localhost:8080/api/v1/affiliate/${affiliateId}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved', commission_rate: 10 })
    });
    const data = await res.json();
    if (data.success) { window.toast('Affiliate approved!', 's'); document.getElementById('crm-overlay')?.remove(); navigate('customers'); }
    else window.toast('Failed: ' + data.error, 'e');
  } catch (e) { window.toast('Error: ' + e.message, 'e'); }
};

window.rejectAffiliate = async function(affiliateId) {
  if (!confirm('Suspend this affiliate?')) return;
  try {
    const token = AdminAPI.getToken();
    const res = await fetch(`http://localhost:8080/api/v1/affiliate/${affiliateId}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'rejected' })
    });
    const data = await res.json();
    if (data.success) { window.toast('Affiliate suspended', 'w'); document.getElementById('crm-overlay')?.remove(); navigate('customers'); }
    else window.toast('Failed: ' + data.error, 'e');
  } catch (e) { window.toast('Error: ' + e.message, 'e'); }
};

window.setAffiliateRate = async function(affiliateId) {
  const rate = prompt('Enter new commission rate (%):', '10');
  if (!rate || isNaN(rate)) return;
  try {
    const token = AdminAPI.getToken();
    const res = await fetch(`http://localhost:8080/api/v1/affiliate/${affiliateId}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved', commission_rate: parseFloat(rate) })
    });
    const data = await res.json();
    if (data.success) { window.toast(`Commission rate set to ${rate}%`, 's'); document.getElementById('crm-overlay')?.remove(); }
    else window.toast('Failed: ' + data.error, 'e');
  } catch (e) { window.toast('Error: ' + e.message, 'e'); }
};

// ── EXPORT ────────────────────────────────────────────────────────────────────
window.exportCustomersCSV = async function() {
  try {
    const res = await AdminAPI.getCustomers({ limit: 1000 });
    const customers = res.data?.customers || [];
    const csv = ['Name,Email,Phone,Orders,Spent,Tags,Affiliate,Joined'].concat(
      customers.filter(c => c.role !== 'admin').map(c =>
        `"${c.name}","${c.email}","${c.phone||''}","${c.total_orders||0}","${c.total_spent||0}","${(c.tags||[]).join(';')}","${c.affiliate?c.affiliate.status:'No'}","${c.created_at||''}"`
      )
    ).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = `customers-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    window.toast('Exported!', 's');
  } catch (e) { window.toast('Export failed: ' + e.message, 'e'); }
};

// Backward compat
window.viewCustomerDetail = window.openCustomerCRM;
window.viewCustomer = window.openCustomerCRM;

// ── EDIT CUSTOMER MODAL ───────────────────────────────────────────────────────
window.openEditCustomerModal = async function(id) {
  // Fetch latest customer data
  let c;
  try {
    const res = await AdminAPI.getCustomer(id);
    c = res.data;
  } catch (e) {
    window.toast('Failed to load customer: ' + e.message, 'e');
    return;
  }

  const overlay = document.createElement('div');
  overlay.id = 'edit-customer-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:800;display:flex;align-items:center;justify-content:center;padding:16px';
  overlay.innerHTML = `
  <div style="background:var(--bg2);border:1px solid var(--border);border-radius:16px;width:100%;max-width:520px;max-height:90vh;overflow-y:auto">
    <div style="padding:20px 24px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:var(--bg2);z-index:10">
      <div>
        <div style="font-size:17px;font-weight:800">Edit Customer</div>
        <div style="font-size:12px;color:var(--text3)">${c.name} · #${c.id}</div>
      </div>
      <button onclick="document.getElementById('edit-customer-overlay').remove()" style="background:var(--bg3);border:none;border-radius:8px;width:32px;height:32px;cursor:pointer;color:var(--text2);font-size:16px">×</button>
    </div>
    <div style="padding:20px 24px;display:flex;flex-direction:column;gap:14px">

      <div class="fg">
        <label class="fl">Full Name</label>
        <input class="fc" id="ec-name" value="${(c.name||'').replace(/"/g,'&quot;')}" placeholder="Customer name">
      </div>

      <div class="fg">
        <label class="fl">Email</label>
        <input class="fc" id="ec-email" value="${c.email||''}" placeholder="Email address" type="email" disabled style="opacity:.6;cursor:not-allowed" title="Email cannot be changed">
        <div style="font-size:11px;color:var(--text3);margin-top:3px"><i class="fas fa-lock" style="font-size:10px"></i> Email is locked for security</div>
      </div>

      <div class="fg">
        <label class="fl">Phone / WhatsApp <span style="color:var(--red)">*</span></label>
        <input class="fc" id="ec-phone" value="${c.phone||''}" placeholder="+91 9999999999" type="tel">
        <div style="font-size:11px;color:var(--text3);margin-top:3px">Used for WhatsApp direct contact</div>
      </div>

      <div class="fg">
        <label class="fl">City</label>
        <input class="fc" id="ec-city" value="${(c.city||'').replace(/"/g,'&quot;')}" placeholder="City">
      </div>

      <div class="fg">
        <label class="fl">Role</label>
        <select class="fc" id="ec-role">
          <option value="customer" ${c.role==='customer'?'selected':''}>Customer</option>
          <option value="admin" ${c.role==='admin'?'selected':''}>Admin</option>
        </select>
      </div>

      <div class="fg">
        <label class="fl">Status</label>
        <select class="fc" id="ec-status">
          <option value="active" ${(c.status||'active')==='active'?'selected':''}>Active</option>
          <option value="suspended" ${c.status==='suspended'?'selected':''}>Suspended</option>
          <option value="deleted" ${c.status==='deleted'?'selected':''}>Deleted</option>
        </select>
      </div>

      <div class="fg">
        <label class="fl">Internal Notes</label>
        <textarea class="fc" id="ec-notes" rows="3" placeholder="Admin notes about this customer...">${c.notes||''}</textarea>
      </div>

      <div id="ec-error" style="display:none;padding:10px 12px;background:rgba(239,68,68,.1);border:1px solid var(--red);border-radius:8px;font-size:13px;color:var(--red)"></div>

      <div style="display:flex;gap:8px;margin-top:4px">
        <button class="btn btn-secondary" style="flex:1" onclick="document.getElementById('edit-customer-overlay').remove()">Cancel</button>
        <button class="btn btn-primary" style="flex:1" onclick="saveCustomerEdits(${c.id})"><i class="fas fa-save"></i>Save Changes</button>
      </div>
    </div>
  </div>`;
  document.body.appendChild(overlay);
};

window.saveCustomerEdits = async function(id) {
  const name = document.getElementById('ec-name')?.value?.trim();
  const phone = document.getElementById('ec-phone')?.value?.trim();
  const city = document.getElementById('ec-city')?.value?.trim();
  const role = document.getElementById('ec-role')?.value;
  const status = document.getElementById('ec-status')?.value;
  const notes = document.getElementById('ec-notes')?.value?.trim();
  const errEl = document.getElementById('ec-error');

  if (!name) { errEl.style.display='block'; errEl.textContent='Name is required.'; return; }

  errEl.style.display = 'none';

  try {
    const updates = { name, phone, city, role, status, notes };
    await AdminAPI.updateCustomer(id, updates);
    window.toast('Customer updated!', 's');
    document.getElementById('edit-customer-overlay')?.remove();
    // Refresh the CRM overlay if open
    document.getElementById('crm-overlay')?.remove();
    openCustomerCRM(id);
  } catch (e) {
    errEl.style.display = 'block';
    errEl.textContent = 'Failed: ' + e.message;
  }
};
