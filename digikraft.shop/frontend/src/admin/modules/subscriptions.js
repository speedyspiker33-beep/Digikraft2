// ===== SUBSCRIPTIONS & LICENSE MANAGEMENT MODULE =====
// Connected to Backend API (port 8080) with localStorage fallback
window.renderSubscriptions = async function() {
  let subs = []
  let meta = {}

  try {
    const res = await AdminAPI.getSubscriptions({ limit: 200 })
    subs = res.data || []
    meta = res.meta || {}
  } catch (e) {
    subs = JSON.parse(localStorage.getItem('dk_subs') || '[]')
  }

  const tab = window._subTab || 'all'
  const search = document.getElementById('sub-search')?.value || ''
  const now = Date.now()

  let filtered = subs;
  if (search) filtered = filtered.filter(s =>
    (s.customerName||'').toLowerCase().includes(search.toLowerCase()) ||
    (s.productName||'').toLowerCase().includes(search.toLowerCase()) ||
    (s.licenseKey||'').toLowerCase().includes(search.toLowerCase())
  );
  if (tab === 'active') filtered = filtered.filter(s => s.status === 'active' && new Date(s.expiresAt) > now);
  if (tab === 'expiring') filtered = filtered.filter(s => {
    const diff = new Date(s.expiresAt) - now;
    return diff > 0 && diff < 7 * 86400000;
  });
  if (tab === 'expired') filtered = filtered.filter(s => new Date(s.expiresAt) <= now || s.status === 'expired');
  if (tab === 'lifetime') filtered = filtered.filter(s => s.duration === 'lifetime');

  const expiring7 = subs.filter(s => { const d = new Date(s.expiresAt)-now; return d>0&&d<7*86400000; }).length;
  const expired = subs.filter(s => new Date(s.expiresAt)<=now && s.duration!=='lifetime').length;
  const active = subs.filter(s => s.status==='active' && (s.duration==='lifetime'||new Date(s.expiresAt)>now)).length;

  return `
  <div class="ph">
    <div><div class="ph-title">Subscriptions & Licenses</div><div class="ph-sub">${subs.length} total · ${active} active · ${expiring7} expiring soon</div></div>
    <div class="ph-actions">
      <button class="btn btn-secondary" onclick="exportCSV(JSON.parse(localStorage.getItem('dk_subs')||'[]'),'subscriptions.csv')"><i class="fas fa-download"></i>Export</button>
      <button class="btn btn-primary" onclick="openSubModal()"><i class="fas fa-plus"></i>Add Subscription</button>
    </div>
  </div>

  <div class="stats-grid" style="margin-bottom:16px">
    <div class="stat-card"><div class="si si-green"><i class="fas fa-check-circle"></i></div><div><div class="sv">${active}</div><div class="sl">Active</div></div></div>
    <div class="stat-card"><div class="si si-yellow"><i class="fas fa-clock"></i></div><div><div class="sv">${expiring7}</div><div class="sl">Expiring (7d)</div><div class="sc" style="color:var(--yellow)">Needs attention</div></div></div>
    <div class="stat-card"><div class="si si-red"><i class="fas fa-times-circle"></i></div><div><div class="sv">${expired}</div><div class="sl">Expired</div></div></div>
    <div class="stat-card"><div class="si si-purple"><i class="fas fa-infinity"></i></div><div><div class="sv">${subs.filter(s=>s.duration==='lifetime').length}</div><div class="sl">Lifetime</div></div></div>
  </div>

  ${expiring7 > 0 ? `
  <div style="background:rgba(245,158,11,.1);border:1px solid var(--yellow);border-radius:11px;padding:14px 16px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between">
    <div style="display:flex;align-items:center;gap:10px">
      <i class="fas fa-exclamation-triangle" style="color:var(--yellow);font-size:18px"></i>
      <div><strong style="font-size:14px">${expiring7} subscriptions expiring within 7 days</strong><div style="font-size:12px;color:var(--text2)">Send renewal reminders now</div></div>
    </div>
    <button class="btn btn-warning" onclick="sendExpiryReminders()"><i class="fab fa-whatsapp"></i>Send Reminders</button>
  </div>` : ''}

  <div class="tabs" style="margin-bottom:16px">
    ${[['all','All'],['active','Active'],['expiring','Expiring Soon'],['expired','Expired'],['lifetime','Lifetime']].map(([id,lb])=>
      `<button class="tab ${tab===id?'on':''}" onclick="window._subTab='${id}';navigate('subscriptions')">${lb}${id==='expiring'&&expiring7?` <span style="background:var(--yellow);color:#000;border-radius:99px;padding:1px 6px;font-size:10px">${expiring7}</span>`:''}</button>`
    ).join('')}
  </div>

  <div class="card">
    <div class="ttb">
      <div class="ts"><i class="fas fa-search"></i><input type="text" id="sub-search" placeholder="Search by customer, product, license key..." oninput="navigate('subscriptions')" value="${search}"></div>
      <select class="fc" style="width:auto" onchange="navigate('subscriptions')">
        <option>Sort: Latest</option><option>Sort: Expiry</option><option>Sort: Customer</option>
      </select>
    </div>
    ${filtered.length ? `
    <div class="tw"><table>
      <thead><tr><th>Customer</th><th>Product</th><th>License Key</th><th>Vendor</th><th>Duration</th><th>Started</th><th>Expires</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>${filtered.map(s => {
        const daysLeft = s.duration === 'lifetime' ? Infinity : Math.ceil((new Date(s.expiresAt) - now) / 86400000);
        const statusColor = s.duration==='lifetime'?'tp':daysLeft<=0?'tr':daysLeft<=7?'ty':'tg';
        const statusLabel = s.duration==='lifetime'?'Lifetime':daysLeft<=0?'Expired':daysLeft<=7?`${daysLeft}d left`:'Active';
        return `<tr>
          <td><div class="pi"><strong>${s.customerName||'—'}</strong><span>${s.customerPhone||s.customerEmail||'—'}</span></div></td>
          <td><div class="pi"><strong>${s.productName||'—'}</strong><span>${s.productType||'—'}</span></div></td>
          <td>
            <code style="background:var(--bg3);padding:3px 8px;border-radius:6px;font-size:11px;cursor:pointer" onclick="copyLicense('${s.licenseKey}')" title="Click to copy">${s.licenseKey||'—'}</code>
          </td>
          <td style="font-size:12px">${s.vendorName||'Self'}</td>
          <td><span class="tag tb">${s.duration||'1 month'}</span></td>
          <td style="font-size:11px;color:var(--text2)">${s.startedAt?new Date(s.startedAt).toLocaleDateString('en-IN'):'—'}</td>
          <td style="font-size:11px;${daysLeft<=7&&daysLeft>0?'color:var(--yellow);font-weight:700':daysLeft<=0?'color:var(--red);font-weight:700':''}">${s.duration==='lifetime'?'Never':s.expiresAt?new Date(s.expiresAt).toLocaleDateString('en-IN'):'—'}</td>
          <td><span class="tag ${statusColor}">${statusLabel}</span></td>
          <td><div style="display:flex;gap:4px;flex-wrap:wrap">
            <button class="btn btn-sm btn-secondary btn-icon" onclick="editSub('${s.id}')" title="Edit"><i class="fas fa-edit"></i></button>
            <button class="btn btn-sm btn-secondary btn-icon" onclick="renewSub('${s.id}')" title="Renew"><i class="fas fa-redo"></i></button>
            <button class="btn btn-sm btn-secondary btn-icon" onclick="sendSubWA('${s.id}')" title="Send WhatsApp"><i class="fab fa-whatsapp" style="color:#25d366"></i></button>
            <button class="btn btn-sm btn-danger btn-icon" onclick="deleteSub('${s.id}')" title="Delete"><i class="fas fa-trash"></i></button>
          </div></td>
        </tr>`;
      }).join('')}</tbody>
    </table></div>` : '<div class="es"><i class="fas fa-key"></i><p>No subscriptions found</p></div>'}
  </div>

  <!-- ADD/EDIT MODAL -->
  <div class="mo" id="sub-modal">
    <div class="md" style="max-width:640px">
      <div class="mh"><div class="mt" id="sub-modal-title">Add Subscription</div><button class="mc" onclick="closeModal('sub-modal')"><i class="fas fa-times"></i></button></div>
      <div class="mb">
        <form id="sub-form" onsubmit="saveSub(event)">
          <input type="hidden" name="id" id="sub-id">
          <div class="fgrid">
            <div class="fg"><label class="fl">Customer Name *</label><input class="fc" name="customerName" required placeholder="Full name"></div>
            <div class="fg"><label class="fl">Customer Phone</label><input class="fc" name="customerPhone" placeholder="+91 9999999999"></div>
            <div class="fg"><label class="fl">Customer Email</label><input class="fc" name="customerEmail" type="email" placeholder="customer@email.com"></div>
            <div class="fg"><label class="fl">Order ID</label><input class="fc" name="orderId" placeholder="Order reference"></div>
            <div class="fg cs2"><label class="fl">Product Name *</label><input class="fc" name="productName" required placeholder="e.g. CorelDRAW X9 License"></div>
            <div class="fg"><label class="fl">Product Type</label>
              <select class="fc" name="productType">
                <option>Software License</option><option>Subscription</option><option>Digital Asset</option><option>Service</option><option>API Access</option>
              </select>
            </div>
            <div class="fg"><label class="fl">Vendor</label>
              <select class="fc" name="vendorId" onchange="updateVendorName(this)">
                <option value="">Self (DigiKraft)</option>
                ${JSON.parse(localStorage.getItem('dk_vendors')||'[]').map(v=>`<option value="${v.id}">${v.name}</option>`).join('')}
              </select>
            </div>
            <input type="hidden" name="vendorName" id="sub-vendor-name" value="Self">
            <div class="fg"><label class="fl">License Key</label>
              <div style="display:flex;gap:6px">
                <input class="fc" name="licenseKey" id="sub-license-key" placeholder="Auto-generate or enter manually" style="flex:1">
                <button type="button" class="btn btn-secondary btn-sm" onclick="generateLicenseKey()"><i class="fas fa-magic"></i></button>
              </div>
            </div>
            <div class="fg"><label class="fl">Panel URL (if applicable)</label><input class="fc" name="panelUrl" placeholder="https://panel.vendor.com/login"></div>
            <div class="fg"><label class="fl">Panel Username</label><input class="fc" name="panelUser" placeholder="Username for vendor panel"></div>
            <div class="fg"><label class="fl">Panel Password</label><input class="fc" name="panelPass" type="password" placeholder="Password"></div>
            <div class="fg"><label class="fl">Duration *</label>
              <select class="fc" name="duration" onchange="updateExpiryDate(this.value)">
                <option value="1 month">1 Month</option><option value="3 months">3 Months</option>
                <option value="6 months">6 Months</option><option value="1 year">1 Year</option>
                <option value="2 years">2 Years</option><option value="lifetime">Lifetime</option><option value="custom">Custom</option>
              </select>
            </div>
            <div class="fg"><label class="fl">Start Date</label><input class="fc" name="startedAt" type="date" value="${new Date().toISOString().slice(0,10)}" onchange="updateExpiryDate()"></div>
            <div class="fg"><label class="fl">Expiry Date</label><input class="fc" name="expiresAt" type="date" id="sub-expiry"></div>
            <div class="fg"><label class="fl">Amount Paid (₹)</label><input class="fc" name="amountPaid" type="number" placeholder="0"></div>
            <div class="fg"><label class="fl">Vendor Cost (₹)</label><input class="fc" name="vendorCost" type="number" placeholder="0"></div>
            <div class="fg cs2"><label class="fl">Notes</label><textarea class="fc" name="notes" rows="2" placeholder="Any special notes..."></textarea></div>
            <div class="fg cs2" style="display:flex;align-items:center;gap:10px;background:var(--bg3);padding:12px;border-radius:9px">
              <input type="checkbox" name="sendWA" id="sub-send-wa" style="width:16px;height:16px" checked>
              <label for="sub-send-wa" style="cursor:pointer;font-size:13px;font-weight:600"><i class="fab fa-whatsapp" style="color:#25d366;margin-right:6px"></i>Send license details via WhatsApp</label>
            </div>
          </div>
        </form>
      </div>
      <div class="mf">
        <button class="btn btn-secondary" onclick="closeModal('sub-modal')">Cancel</button>
        <button class="btn btn-primary" onclick="document.getElementById('sub-form').requestSubmit()"><i class="fas fa-save"></i>Save Subscription</button>
      </div>
    </div>
  </div>`;
};

window.openSubModal = function(id) {
  document.getElementById('sub-modal-title').textContent = id ? 'Edit Subscription' : 'Add Subscription';
  if (!id) {
    document.getElementById('sub-form').reset();
    document.getElementById('sub-id').value = '';
    document.getElementById('sub-expiry').value = new Date(Date.now() + 30*86400000).toISOString().slice(0,10);
  } else {
    const s = JSON.parse(localStorage.getItem('dk_subs')||'[]').find(x=>x.id===id);
    if (!s) return;
    const f = document.getElementById('sub-form');
    Object.keys(s).forEach(k => { if (f[k]) f[k].value = s[k]; });
    if (f.startedAt) f.startedAt.value = s.startedAt?.slice(0,10) || '';
    if (f.expiresAt) f.expiresAt.value = s.expiresAt?.slice(0,10) || '';
    document.getElementById('sub-id').value = s.id;
  }
  openModal('sub-modal');
};

window.editSub = id => window.openSubModal(id);

window.saveSub = async function(e) {
  e.preventDefault();
  const f = new FormData(e.target);
  const id = f.get('id');
  const payload = {
    customer_name: f.get('customerName'), customer_phone: f.get('customerPhone'),
    customer_email: f.get('customerEmail'), order_id: f.get('orderId'),
    product_name: f.get('productName'), product_type: f.get('productType'),
    vendor_id: f.get('vendorId'), vendor_name: f.get('vendorName') || 'Self',
    license_key: f.get('licenseKey'), panel_url: f.get('panelUrl'),
    panel_user: f.get('panelUser'), panel_pass: f.get('panelPass'),
    duration: f.get('duration'), started_at: f.get('startedAt'),
    expires_at: f.get('expiresAt'), amount_paid: parseFloat(f.get('amountPaid')||0),
    vendor_cost: parseFloat(f.get('vendorCost')||0), notes: f.get('notes'),
    status: 'active'
  };

  try {
    if (id) {
      await AdminAPI.updateSubscription(id, payload);
      window.toast('Subscription updated!', 's');
    } else {
      await AdminAPI.createSubscription(payload);
      window.toast('Subscription added!', 's');
    }
  } catch (err) {
    // Fallback to localStorage
    const sub = { id: id || Date.now().toString(), ...payload, createdAt: new Date().toISOString() };
    const subs = JSON.parse(localStorage.getItem('dk_subs')||'[]');
    if (id) { const i = subs.findIndex(x=>x.id===id); if(i>-1) subs[i]=sub; }
    else subs.unshift(sub);
    localStorage.setItem('dk_subs', JSON.stringify(subs));
    window.toast('Subscription saved (offline)', 'w');
  }

  // Send WhatsApp if checked
  if (f.get('sendWA') === 'on' && window.WA) {
    const msg = WA.buildMessage('order_delivered', {
      customer_name: payload.customer_name, order_id: payload.order_id || payload.id,
      product_name: payload.product_name, license_key: payload.license_key || 'N/A'
    });
    if (payload.customer_phone) WA.send(payload.customer_phone, msg, payload.order_id);
  }

  closeModal('sub-modal');
  navigate('subscriptions');
};

window.renewSub = function(id) {
  const subs = JSON.parse(localStorage.getItem('dk_subs')||'[]');
  const s = subs.find(x=>x.id===id);
  if (!s) return;
  const dur = prompt('Renewal duration:', s.duration || '1 month');
  if (!dur) return;
  const months = { '1 month':1,'3 months':3,'6 months':6,'1 year':12,'2 years':24 };
  const m = months[dur] || 1;
  const base = new Date(s.expiresAt) > new Date() ? new Date(s.expiresAt) : new Date();
  base.setMonth(base.getMonth() + m);
  s.expiresAt = base.toISOString().slice(0,10);
  s.duration = dur;
  s.status = 'active';
  localStorage.setItem('dk_subs', JSON.stringify(subs));
  window.toast(`Subscription renewed until ${base.toLocaleDateString('en-IN')}!`, 's');
  if (window.WA && s.customerPhone) {
    const msg = WA.buildMessage('subscription_renewed', {
      customer_name: s.customerName, product_name: s.productName,
      expiry_date: base.toLocaleDateString('en-IN'), license_key: s.licenseKey
    });
    WA.send(s.customerPhone, msg, s.orderId);
  }
  navigate('subscriptions');
};

window.deleteSub = async function(id) {
  if (!confirm('Delete this subscription?')) return;
  try {
    await AdminAPI.deleteSubscription(id);
  } catch (e) {
    localStorage.setItem('dk_subs', JSON.stringify(JSON.parse(localStorage.getItem('dk_subs')||'[]').filter(s=>s.id!==id)));
  }
  window.toast('Deleted', 'e'); navigate('subscriptions');
};

window.sendSubWA = function(id) {
  const s = JSON.parse(localStorage.getItem('dk_subs')||'[]').find(x=>x.id===id);
  if (!s) return;
  const daysLeft = Math.ceil((new Date(s.expiresAt) - Date.now()) / 86400000);
  if (window.WA) WA.sendLicenseExpiry(s, daysLeft);
  window.toast('WhatsApp message queued!', 's');
};

window.sendExpiryReminders = function() {
  const subs = JSON.parse(localStorage.getItem('dk_subs')||'[]');
  const now = Date.now();
  const expiring = subs.filter(s => { const d = new Date(s.expiresAt)-now; return d>0&&d<7*86400000; });
  expiring.forEach(s => {
    const daysLeft = Math.ceil((new Date(s.expiresAt)-now)/86400000);
    if (window.WA && s.customerPhone) WA.sendLicenseExpiry(s, daysLeft);
  });
  window.toast(`Reminders sent to ${expiring.length} customers!`, 's');
};

window.generateLicenseKey = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const seg = () => Array.from({length:5}, ()=>chars[Math.floor(Math.random()*chars.length)]).join('');
  const key = `DK-${seg()}-${seg()}-${seg()}-${seg()}`;
  document.getElementById('sub-license-key').value = key;
};

window.copyLicense = function(key) {
  navigator.clipboard.writeText(key).then(() => window.toast('License key copied!', 's'));
};

window.updateExpiryDate = function(duration) {
  const dur = duration || document.querySelector('[name="duration"]')?.value;
  const start = document.querySelector('[name="startedAt"]')?.value;
  if (!start || dur === 'lifetime' || dur === 'custom') return;
  const months = { '1 month':1,'3 months':3,'6 months':6,'1 year':12,'2 years':24 };
  const m = months[dur];
  if (!m) return;
  const d = new Date(start); d.setMonth(d.getMonth() + m);
  const el = document.getElementById('sub-expiry');
  if (el) el.value = d.toISOString().slice(0,10);
};

window.updateVendorName = function(sel) {
  const vendors = JSON.parse(localStorage.getItem('dk_vendors')||'[]');
  const v = vendors.find(x=>x.id===sel.value);
  document.getElementById('sub-vendor-name').value = v ? v.name : 'Self';
};

// Auto-check expiring subscriptions on load
window.checkExpiringSubscriptions = function() {
  const subs = JSON.parse(localStorage.getItem('dk_subs')||'[]');
  const now = Date.now();
  const expiring7 = subs.filter(s => { const d=new Date(s.expiresAt)-now; return d>0&&d<7*86400000; }).length;
  const expired = subs.filter(s => new Date(s.expiresAt)<=now && s.duration!=='lifetime' && s.status==='active').length;
  if (expiring7 && window.Notifications) Notifications.add(`${expiring7} subscriptions expiring within 7 days`, 'warn');
  if (expired && window.Notifications) Notifications.add(`${expired} subscriptions have expired`, 'error');
  // Mark expired
  let changed = false;
  subs.forEach(s => { if (s.duration!=='lifetime' && new Date(s.expiresAt)<=now && s.status==='active') { s.status='expired'; changed=true; } });
  if (changed) localStorage.setItem('dk_subs', JSON.stringify(subs));
};

// Seed sample data
if (!localStorage.getItem('dk_subs')) {
  const samples = [
    { id:'s1', customerName:'Rahul Sharma', customerPhone:'+919876543210', customerEmail:'rahul@email.com', orderId:'ORD-001', productName:'CorelDRAW X9 License', productType:'Software License', vendorName:'TechVendor Pro', licenseKey:'DK-ABCDE-FGHIJ-KLMNO-PQRST', duration:'1 year', startedAt:'2025-04-06', expiresAt:'2026-04-06', amountPaid:2999, vendorCost:1800, status:'active', createdAt:new Date().toISOString() },
    { id:'s2', customerName:'Priya Singh', customerPhone:'+919876543211', customerEmail:'priya@email.com', orderId:'ORD-002', productName:'Adobe CC Subscription', productType:'Subscription', vendorName:'Self', licenseKey:'DK-UVWXY-Z1234-56789-ABCDE', duration:'6 months', startedAt:'2026-01-01', expiresAt:'2026-04-10', amountPaid:1499, vendorCost:0, status:'active', createdAt:new Date().toISOString() },
    { id:'s3', customerName:'Amit Kumar', customerPhone:'+919876543212', customerEmail:'amit@email.com', orderId:'ORD-003', productName:'UI Kit Bundle', productType:'Digital Asset', vendorName:'Self', licenseKey:'DK-FGHIJ-KLMNO-PQRST-UVWXY', duration:'lifetime', startedAt:'2025-12-01', expiresAt:'', amountPaid:4999, vendorCost:0, status:'active', createdAt:new Date().toISOString() },
  ];
  localStorage.setItem('dk_subs', JSON.stringify(samples));
}

setTimeout(window.checkExpiringSubscriptions, 1000);
