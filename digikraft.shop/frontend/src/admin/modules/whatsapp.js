// ===== WHATSAPP INTEGRATION MODULE =====
window.WA = (() => {
  const cfg = () => JSON.parse(localStorage.getItem('dk_wa_cfg') || '{}');
  const saveCfg = v => localStorage.setItem('dk_wa_cfg', JSON.stringify(v));
  const logs = () => JSON.parse(localStorage.getItem('dk_wa_logs') || '[]');
  const saveLogs = v => localStorage.setItem('dk_wa_logs', JSON.stringify(v));
  const templates = () => JSON.parse(localStorage.getItem('dk_wa_tpl') || JSON.stringify(defaultTemplates()));

  function defaultTemplates() {
    return [
      { id: 'order_confirm', name: 'Order Confirmation', trigger: 'order_placed', active: true,
        body: 'Hi {customer_name}! 🎉\n\nYour order #{order_id} has been confirmed.\n\nProduct: {product_name}\nAmount: ₹{amount}\n\nWe will deliver within {delivery_time}.\n\nThank you for shopping with DigiKraft! 🚀' },
      { id: 'order_assigned', name: 'Order Processing', trigger: 'order_assigned', active: true,
        body: 'Hi {customer_name}! ⚙️\n\nYour order #{order_id} is now being processed.\n\nExpected delivery: {deadline}\n\nWe\'ll notify you once it\'s ready!' },
      { id: 'order_delivered', name: 'Order Delivered', trigger: 'order_delivered', active: true,
        body: 'Hi {customer_name}! ✅\n\nYour order #{order_id} has been delivered!\n\nProduct: {product_name}\nLicense Key: {license_key}\n\nEnjoy your purchase! 🎨\n\nNeed help? Reply to this message.' },
      { id: 'license_expiry_7', name: 'License Expiry (7 days)', trigger: 'license_expiry_7d', active: true,
        body: 'Hi {customer_name}! ⚠️\n\nYour {product_name} license expires in *7 days* ({expiry_date}).\n\nRenew now to avoid interruption:\n{renewal_link}\n\nSpecial renewal discount: *20% OFF* 🎁' },
      { id: 'license_expiry_1', name: 'License Expiry (1 day)', trigger: 'license_expiry_1d', active: true,
        body: 'Hi {customer_name}! 🚨\n\nYour {product_name} license expires *TOMORROW* ({expiry_date})!\n\nRenew immediately:\n{renewal_link}' },
      { id: 'license_expired', name: 'License Expired', trigger: 'license_expired', active: true,
        body: 'Hi {customer_name}! 😔\n\nYour {product_name} license has expired.\n\nRenew now to restore access:\n{renewal_link}\n\nUse code *RENEW15* for 15% off!' },
      { id: 'subscription_renewed', name: 'Subscription Renewed', trigger: 'subscription_renewed', active: true,
        body: 'Hi {customer_name}! 🎉\n\nYour {product_name} subscription has been renewed!\n\nNew expiry: {expiry_date}\nLicense: {license_key}\n\nThank you! 🙏' },
      { id: 'vendor_assigned', name: 'Vendor: New Assignment', trigger: 'vendor_assigned', active: true,
        body: 'Hi {vendor_name}! 📦\n\nNew order assigned to you:\n\nOrder: #{order_id}\nCustomer: {customer_name}\nProduct: {product_name}\nDeadline: {deadline}\n\nNotes: {notes}\n\nPlease confirm receipt.' },
    ];
  }

  async function send(phone, message, orderId = '') {
    const c = cfg();
    if (!c.apiUrl || !c.apiKey) {
      console.warn('WhatsApp not configured');
      return { success: false, error: 'Not configured' };
    }
    const clean = phone.replace(/\D/g, '');
    const payload = { phone: clean, message, ...(c.provider === 'wati' ? { template: false } : {}) };
    try {
      const r = await fetch(c.apiUrl + '/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${c.apiKey}`, ...(c.provider === 'interakt' ? { 'x-api-key': c.apiKey } : {}) },
        body: JSON.stringify(payload)
      });
      const result = { success: r.ok, status: r.status, phone: clean, message: message.slice(0, 60) + '...', orderId, at: new Date().toISOString() };
      const l = logs(); l.unshift(result); if (l.length > 200) l.pop(); saveLogs(l);
      return result;
    } catch (e) {
      const result = { success: false, error: e.message, phone: clean, at: new Date().toISOString() };
      const l = logs(); l.unshift(result); saveLogs(l);
      return result;
    }
  }

  function buildMessage(templateId, vars = {}) {
    const tpls = templates();
    const tpl = tpls.find(t => t.id === templateId);
    if (!tpl) return '';
    return tpl.body.replace(/\{(\w+)\}/g, (_, k) => vars[k] || `{${k}}`);
  }

  function sendOrderConfirm(order) {
    const msg = buildMessage('order_confirm', {
      customer_name: order.customer || 'Customer',
      order_id: order.id,
      product_name: (order.items || []).map(i => i.title || i.productId).join(', ') || 'Your Product',
      amount: order.total,
      delivery_time: '24-48 hours'
    });
    return send(order.phone || order.customerPhone || '', msg, order.id);
  }

  function sendVendorAssignment(vendor, order, deadline, notes) {
    const msg = buildMessage('vendor_assigned', {
      vendor_name: vendor.contact || vendor.name,
      order_id: order.id,
      customer_name: order.customer || 'Customer',
      product_name: (order.items || []).map(i => i.title).join(', ') || 'Product',
      deadline: deadline ? new Date(deadline).toLocaleString('en-IN') : 'ASAP',
      notes: notes || 'None'
    });
    return send(vendor.whatsapp || vendor.phone || '', msg, order.id);
  }

  function sendLicenseExpiry(sub, daysLeft) {
    const tplId = daysLeft <= 0 ? 'license_expired' : daysLeft <= 1 ? 'license_expiry_1' : 'license_expiry_7';
    const msg = buildMessage(tplId, {
      customer_name: sub.customerName,
      product_name: sub.productName,
      expiry_date: new Date(sub.expiresAt).toLocaleDateString('en-IN'),
      license_key: sub.licenseKey,
      renewal_link: `http://localhost:3001/renew/${sub.id}`
    });
    return send(sub.customerPhone || '', msg, sub.orderId);
  }

  return { send, buildMessage, sendOrderConfirm, sendVendorAssignment, sendLicenseExpiry, cfg, saveCfg, logs, templates, defaultTemplates };
})();

window.renderWhatsApp = function() {
  const c = WA.cfg();
  const logs = WA.logs();
  const tpls = WA.templates();
  const tab = window._waTab || 'config';

  return `
  <div class="ph">
    <div><div class="ph-title">WhatsApp Integration</div><div class="ph-sub">Connect your WhatsApp API portal · ${logs.filter(l=>l.success).length} messages sent</div></div>
    <div class="ph-actions">
      <button class="btn btn-success" onclick="testWAConnection()"><i class="fas fa-plug"></i>Test Connection</button>
    </div>
  </div>

  <div style="display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:11px;background:${c.apiUrl?'rgba(34,197,94,.1)':'rgba(245,158,11,.1)'};border:1px solid ${c.apiUrl?'var(--green)':'var(--yellow)'};margin-bottom:16px">
    <i class="fas ${c.apiUrl?'fa-check-circle':'fa-exclamation-triangle'}" style="color:${c.apiUrl?'var(--green)':'var(--yellow)'}"></i>
    <span style="font-size:13px;font-weight:600">${c.apiUrl?'WhatsApp API Connected — '+c.provider:'WhatsApp API not configured. Set up below.'}</span>
    ${c.apiUrl?`<span style="margin-left:auto;font-size:12px;color:var(--text2)">${c.apiUrl}</span>`:''}
  </div>

  <div class="tabs" style="margin-bottom:16px">
    ${[['config','Configuration'],['templates','Message Templates'],['send','Send Message'],['logs','Message Logs']].map(([id,lb])=>
      `<button class="tab ${tab===id?'on':''}" onclick="window._waTab='${id}';navigate('whatsapp')">${lb}</button>`
    ).join('')}
  </div>

  ${tab==='config'?`
  <div class="g2">
    <div class="card">
      <div class="card-hd"><div class="card-title"><i class="fab fa-whatsapp" style="color:#25d366"></i>API Configuration</div></div>
      <div class="fg"><label class="fl">Provider</label>
        <select class="fc" id="wa-provider" onchange="updateWAProvider(this.value)">
          ${['Custom API','WATI','Interakt','AiSensy','Gupshup','Twilio','360dialog','Meta Cloud API'].map(p=>`<option value="${p.toLowerCase().replace(/\s/g,'_')}" ${c.provider===p.toLowerCase().replace(/\s/g,'_')?'selected':''}>${p}</option>`).join('')}
        </select>
      </div>
      <div class="fg"><label class="fl">API Base URL</label><input class="fc" id="wa-url" value="${c.apiUrl||''}" placeholder="https://api.yourprovider.com/v1"></div>
      <div class="fg"><label class="fl">API Key / Token</label><input class="fc" id="wa-key" type="password" value="${c.apiKey||''}" placeholder="Your API key or Bearer token"></div>
      <div class="fg"><label class="fl">Phone Number ID (Meta/360dialog)</label><input class="fc" id="wa-phone-id" value="${c.phoneId||''}" placeholder="Phone number ID"></div>
      <div class="fg"><label class="fl">Business Account ID</label><input class="fc" id="wa-biz-id" value="${c.bizId||''}" placeholder="WhatsApp Business Account ID"></div>
      <div class="fg"><label class="fl">Webhook Secret (for incoming)</label><input class="fc" id="wa-webhook-secret" value="${c.webhookSecret||''}" placeholder="Verify token for webhook"></div>
      <button class="btn btn-primary" onclick="saveWAConfig()"><i class="fas fa-save"></i>Save Configuration</button>
    </div>
    <div class="card">
      <div class="card-hd"><div class="card-title"><i class="fas fa-cog" style="color:var(--blue)"></i>Automation Settings</div></div>
      ${[
        ['Send on Order Placed','wa-auto-order',c.autoOrder],
        ['Send on Order Assigned to Vendor','wa-auto-assign',c.autoAssign],
        ['Send on Order Delivered','wa-auto-deliver',c.autoDeliver],
        ['Send License Key on Delivery','wa-auto-license',c.autoLicense],
        ['Send 7-day Expiry Reminder','wa-auto-7d',c.auto7d],
        ['Send 1-day Expiry Reminder','wa-auto-1d',c.auto1d],
        ['Send Expiry Notice','wa-auto-expired',c.autoExpired],
        ['Send Renewal Confirmation','wa-auto-renew',c.autoRenew],
        ['Notify Vendor on Assignment','wa-auto-vendor',c.autoVendor],
      ].map(([lb,id,ch])=>`
      <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
        <span style="font-size:13px">${lb}</span>
        <label class="tgl"><input type="checkbox" id="${id}" ${ch?'checked':''}><span class="tgs"></span></label>
      </div>`).join('')}
      <button class="btn btn-primary" style="margin-top:12px" onclick="saveWAConfig()"><i class="fas fa-save"></i>Save</button>
    </div>
  </div>`:''}

  ${tab==='templates'?`
  <div style="display:flex;flex-direction:column;gap:14px">
    ${tpls.map((t,i)=>`
    <div class="card">
      <div class="card-hd">
        <div style="display:flex;align-items:center;gap:10px">
          <label class="tgl"><input type="checkbox" ${t.active?'checked':''} onchange="toggleWATpl(${i},this.checked)"><span class="tgs"></span></label>
          <div class="card-title">${t.name}</div>
          <span class="tag tb" style="font-size:10px">${t.trigger}</span>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="editWATpl(${i})"><i class="fas fa-edit"></i>Edit</button>
      </div>
      <div style="background:var(--bg3);border-radius:9px;padding:12px;font-size:12px;color:var(--text2);white-space:pre-wrap;font-family:monospace;line-height:1.6">${t.body}</div>
      <div style="margin-top:8px;font-size:11px;color:var(--text3)">Variables: ${[...t.body.matchAll(/\{(\w+)\}/g)].map(m=>`{${m[1]}}`).join(', ')}</div>
    </div>`).join('')}
  </div>`:''}

  ${tab==='send'?`
  <div class="g2">
    <div class="card">
      <div class="card-hd"><div class="card-title"><i class="fab fa-whatsapp" style="color:#25d366"></i>Send Manual Message</div></div>
      <div class="fg"><label class="fl">Phone Number *</label><input class="fc" id="wa-send-phone" placeholder="+91 9999999999"></div>
      <div class="fg"><label class="fl">Use Template</label>
        <select class="fc" id="wa-send-tpl" onchange="loadWATpl(this.value)">
          <option value="">Custom message</option>
          ${tpls.map(t=>`<option value="${t.id}">${t.name}</option>`).join('')}
        </select>
      </div>
      <div class="fg"><label class="fl">Message *</label><textarea class="fc" id="wa-send-msg" rows="6" placeholder="Type your message..."></textarea></div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-success" onclick="sendManualWA()"><i class="fab fa-whatsapp"></i>Send Message</button>
        <button class="btn btn-secondary" onclick="previewWAMsg()"><i class="fas fa-eye"></i>Preview</button>
      </div>
    </div>
    <div class="card">
      <div class="card-hd"><div class="card-title"><i class="fas fa-broadcast-tower" style="color:var(--accent)"></i>Bulk Send</div></div>
      <div class="fg"><label class="fl">Target Audience</label>
        <select class="fc" id="wa-bulk-target">
          <option value="all">All Customers</option>
          <option value="active">Active Subscribers</option>
          <option value="expiring">Expiring in 7 days</option>
          <option value="expired">Expired Licenses</option>
          <option value="no_order">Never Ordered</option>
        </select>
      </div>
      <div class="fg"><label class="fl">Message</label><textarea class="fc" id="wa-bulk-msg" rows="5" placeholder="Bulk message..."></textarea></div>
      <div style="background:rgba(245,158,11,.1);border:1px solid var(--yellow);border-radius:8px;padding:10px;font-size:12px;color:var(--yellow);margin-bottom:12px">
        <i class="fas fa-exclamation-triangle"></i> Bulk messaging may be rate-limited by your provider. Use responsibly.
      </div>
      <button class="btn btn-warning" onclick="sendBulkWA()"><i class="fas fa-paper-plane"></i>Send Bulk</button>
    </div>
  </div>`:''}

  ${tab==='logs'?`
  <div class="card">
    <div class="card-hd"><div class="card-title">Message Logs</div>
      <div style="display:flex;gap:8px">
        <span class="tag tg">${logs.filter(l=>l.success).length} sent</span>
        <span class="tag tr">${logs.filter(l=>!l.success).length} failed</span>
        <button class="btn btn-danger btn-sm" onclick="localStorage.removeItem('dk_wa_logs');navigate('whatsapp')"><i class="fas fa-trash"></i>Clear</button>
      </div>
    </div>
    ${logs.length?`<div class="tw"><table>
      <thead><tr><th>Phone</th><th>Message Preview</th><th>Order</th><th>Status</th><th>Time</th></tr></thead>
      <tbody>${logs.slice(0,50).map(l=>`<tr>
        <td style="font-size:12px">${l.phone||'—'}</td>
        <td style="font-size:12px;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${l.message||'—'}</td>
        <td style="font-size:12px">${l.orderId?'#'+l.orderId:'—'}</td>
        <td><span class="tag ${l.success?'tg':'tr'}">${l.success?'Sent':'Failed'}</span>${l.error?`<div style="font-size:10px;color:var(--red)">${l.error}</div>`:''}</td>
        <td style="font-size:11px;color:var(--text2)">${new Date(l.at).toLocaleString('en-IN')}</td>
      </tr>`).join('')}</tbody>
    </table></div>`:'<div class="es"><i class="fab fa-whatsapp"></i><p>No messages sent yet</p></div>'}
  </div>`:''}`;
};

window.saveWAConfig = function() {
  const c = {
    provider: document.getElementById('wa-provider')?.value,
    apiUrl: document.getElementById('wa-url')?.value,
    apiKey: document.getElementById('wa-key')?.value,
    phoneId: document.getElementById('wa-phone-id')?.value,
    bizId: document.getElementById('wa-biz-id')?.value,
    webhookSecret: document.getElementById('wa-webhook-secret')?.value,
    autoOrder: document.getElementById('wa-auto-order')?.checked,
    autoAssign: document.getElementById('wa-auto-assign')?.checked,
    autoDeliver: document.getElementById('wa-auto-deliver')?.checked,
    autoLicense: document.getElementById('wa-auto-license')?.checked,
    auto7d: document.getElementById('wa-auto-7d')?.checked,
    auto1d: document.getElementById('wa-auto-1d')?.checked,
    autoExpired: document.getElementById('wa-auto-expired')?.checked,
    autoRenew: document.getElementById('wa-auto-renew')?.checked,
    autoVendor: document.getElementById('wa-auto-vendor')?.checked,
  };
  WA.saveCfg(c);
  window.toast('WhatsApp configuration saved!', 's');
};

window.testWAConnection = async function() {
  const c = WA.cfg();
  if (!c.apiUrl) return window.toast('Configure API URL first', 'w');
  window.toast('Testing connection...', 'i');
  try {
    const r = await fetch(c.apiUrl + '/status', { headers: { Authorization: `Bearer ${c.apiKey}` } });
    r.ok ? window.toast('WhatsApp API connected!', 's') : window.toast('API returned ' + r.status, 'e');
  } catch { window.toast('Cannot reach API. Check URL and key.', 'e'); }
};

window.toggleWATpl = function(i, active) {
  const tpls = WA.templates(); tpls[i].active = active;
  localStorage.setItem('dk_wa_tpl', JSON.stringify(tpls));
  window.toast(active ? 'Template enabled' : 'Template disabled');
};

window.editWATpl = function(i) {
  const tpls = WA.templates();
  const body = prompt('Edit template body:', tpls[i].body);
  if (body !== null) { tpls[i].body = body; localStorage.setItem('dk_wa_tpl', JSON.stringify(tpls)); window.toast('Template saved!'); navigate('whatsapp'); }
};

window.loadWATpl = function(id) {
  if (!id) return;
  const tpl = WA.templates().find(t => t.id === id);
  if (tpl) document.getElementById('wa-send-msg').value = tpl.body;
};

window.sendManualWA = async function() {
  const phone = document.getElementById('wa-send-phone')?.value;
  const msg = document.getElementById('wa-send-msg')?.value;
  if (!phone || !msg) return window.toast('Phone and message required', 'w');
  window.toast('Sending...', 'i');
  const r = await WA.send(phone, msg);
  r.success ? window.toast('Message sent!', 's') : window.toast('Send failed: ' + (r.error || r.status), 'e');
  navigate('whatsapp');
};

window.sendBulkWA = function() {
  const target = document.getElementById('wa-bulk-target')?.value;
  const msg = document.getElementById('wa-bulk-msg')?.value;
  if (!msg) return window.toast('Enter a message first', 'w');
  window.toast(`Bulk send queued for "${target}" segment. Processing...`, 'i');
};

window.previewWAMsg = function() {
  const msg = document.getElementById('wa-send-msg')?.value;
  if (!msg) return;
  alert('Preview:\n\n' + msg);
};

window.updateWAProvider = function(provider) {
  const hints = {
    wati: 'https://live-server-XXXXX.wati.io/api/v1',
    interakt: 'https://api.interakt.ai/v1',
    aisensy: 'https://backend.aisensy.com/campaign/t1/api/v2',
    gupshup: 'https://api.gupshup.io/sm/api/v1',
    twilio: 'https://api.twilio.com/2010-04-01',
    '360dialog': 'https://waba.360dialog.io/v1',
    meta_cloud_api: 'https://graph.facebook.com/v18.0',
    custom_api: ''
  };
  const el = document.getElementById('wa-url');
  if (el && hints[provider]) el.placeholder = hints[provider];
};
