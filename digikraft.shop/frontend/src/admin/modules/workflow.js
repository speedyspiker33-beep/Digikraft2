// ===== WORKFLOW AUTOMATION MODULE =====
window.renderWorkflow = function() {
  const workflows = JSON.parse(localStorage.getItem('dk_workflows') || '[]');
  const tab = window._wfTab || 'workflows';

  return `
  <div class="ph">
    <div><div class="ph-title">Workflow Automation</div><div class="ph-sub">Automate order processing, notifications, and vendor sync</div></div>
    <div class="ph-actions">
      <button class="btn btn-primary" onclick="openWorkflowModal()"><i class="fas fa-plus"></i>New Workflow</button>
    </div>
  </div>

  <div class="tabs" style="margin-bottom:16px">
    ${[['workflows','Workflows'],['triggers','Triggers'],['sync','API Sync'],['logs','Run Logs']].map(([id,lb])=>
      `<button class="tab ${tab===id?'on':''}" onclick="window._wfTab='${id}';navigate('workflow')">${lb}</button>`
    ).join('')}
  </div>

  ${tab==='workflows'?renderWorkflowList(workflows):''}
  ${tab==='triggers'?renderTriggers():''}
  ${tab==='sync'?renderAPISync():''}
  ${tab==='logs'?renderWFLogs():''}`;
};

function renderWorkflowList(workflows) {
  const builtIn = [
    { id: 'wf-1', name: 'Auto-Assign Order to Vendor', trigger: 'New Order', action: 'Assign to vendor with matching category', status: true, runs: 0 },
    { id: 'wf-2', name: 'Send Order Confirmation Email', trigger: 'Order Placed', action: 'Email customer with order details', status: true, runs: 0 },
    { id: 'wf-3', name: 'Notify Vendor on Assignment', trigger: 'Order Assigned', action: 'Email + WhatsApp vendor', status: true, runs: 0 },
    { id: 'wf-4', name: 'Mark Order Complete on Delivery', trigger: 'Vendor Delivered', action: 'Update order status → completed', status: true, runs: 0 },
    { id: 'wf-5', name: 'Low Stock Alert', trigger: 'Stock < Alert Level', action: 'Notify admin via email', status: false, runs: 0 },
    { id: 'wf-6', name: 'Auto-Publish Strapi Products', trigger: 'n8n Webhook', action: 'Sync products from Strapi CMS', status: false, runs: 0 },
    { id: 'wf-7', name: 'Customer Review Request', trigger: '3 days after delivery', action: 'Email customer asking for review', status: false, runs: 0 },
    { id: 'wf-8', name: 'Affiliate Commission Calc', trigger: 'Order Completed', action: 'Calculate and log affiliate commission', status: false, runs: 0 },
  ];
  const all = [...builtIn, ...workflows];
  return `
  <div class="card">
    <div class="tw"><table>
      <thead><tr><th>Workflow</th><th>Trigger</th><th>Action</th><th>Runs</th><th>Status</th><th>Controls</th></tr></thead>
      <tbody>${all.map(w=>`<tr>
        <td><strong>${w.name}</strong></td>
        <td><span class="tag tb" style="font-size:11px">${w.trigger}</span></td>
        <td style="font-size:12px;color:var(--text2)">${w.action}</td>
        <td>${w.runs||0}</td>
        <td>
          <label class="tgl"><input type="checkbox" ${w.status?'checked':''} onchange="toggleWorkflow('${w.id}',this.checked)"><span class="tgs"></span></label>
        </td>
        <td><div style="display:flex;gap:5px">
          <button class="btn btn-sm btn-secondary btn-icon" onclick="window.toast('Running workflow...','i');setTimeout(()=>window.toast('Workflow completed!','s'),1500)" title="Run Now"><i class="fas fa-play"></i></button>
          <button class="btn btn-sm btn-secondary btn-icon" onclick="window.toast('Workflow editor coming soon','i')" title="Edit"><i class="fas fa-edit"></i></button>
        </div></td>
      </tr>`).join('')}</tbody>
    </table></div>
  </div>`;
}

function renderTriggers() {
  return `
  <div class="g2">
    <div class="card">
      <div class="card-hd"><div class="card-title"><i class="fas fa-bolt" style="color:var(--yellow)"></i>Available Triggers</div></div>
      ${[
        ['New Order Placed','fa-shopping-bag','green'],
        ['Order Status Changed','fa-sync','blue'],
        ['Vendor Assigned','fa-truck','yellow'],
        ['Vendor Delivered','fa-check-circle','green'],
        ['New Customer Registered','fa-user-plus','purple'],
        ['Product Published','fa-box','accent'],
        ['Low Stock Alert','fa-exclamation-triangle','red'],
        ['Payment Received','fa-rupee-sign','green'],
        ['Review Submitted','fa-star','yellow'],
        ['Coupon Used','fa-ticket-alt','blue'],
        ['n8n Webhook','fa-robot','purple'],
        ['Scheduled (Cron)','fa-clock','text2'],
      ].map(([name,icon,color])=>`
      <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border)">
        <div style="width:30px;height:30px;border-radius:8px;background:rgba(99,102,241,.1);display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <i class="fas ${icon}" style="color:var(--${color});font-size:12px"></i>
        </div>
        <span style="font-size:13px">${name}</span>
        <button class="btn btn-secondary btn-sm" style="margin-left:auto" onclick="window.toast('Trigger configured!','s')">Use</button>
      </div>`).join('')}
    </div>
    <div class="card">
      <div class="card-hd"><div class="card-title"><i class="fas fa-cogs" style="color:var(--blue)"></i>Available Actions</div></div>
      ${[
        ['Send Email','fa-envelope','blue'],
        ['Send WhatsApp','fa-whatsapp','green'],
        ['Push Webhook','fa-paper-plane','accent'],
        ['Update Order Status','fa-sync','yellow'],
        ['Assign to Vendor','fa-truck','yellow'],
        ['Create Notification','fa-bell','purple'],
        ['Log to Activity','fa-history','text2'],
        ['Sync to Strapi','fa-database','accent'],
        ['Calculate Commission','fa-calculator','green'],
        ['Generate Invoice','fa-file-invoice','blue'],
        ['Send SMS','fa-sms','green'],
        ['Update Customer Tag','fa-tag','purple'],
      ].map(([name,icon,color])=>`
      <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border)">
        <div style="width:30px;height:30px;border-radius:8px;background:rgba(99,102,241,.1);display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <i class="fas ${icon}" style="color:var(--${color});font-size:12px"></i>
        </div>
        <span style="font-size:13px">${name}</span>
      </div>`).join('')}
    </div>
  </div>`;
}

function renderAPISync() {
  const s = JSON.parse(localStorage.getItem('dk_set') || '{}');
  return `
  <div class="g2">
    <div class="card">
      <div class="card-hd"><div class="card-title"><i class="fas fa-database" style="color:var(--accent)"></i>Strapi CMS Sync</div></div>
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
        <div><div style="font-size:13px;font-weight:600">Auto-sync products</div><div style="font-size:11px;color:var(--text2)">Pull new products from Strapi every 5 min</div></div>
        <label class="tgl"><input type="checkbox" id="sync-strapi" ${s.syncStrapi?'checked':''}><span class="tgs"></span></label>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
        <div><div style="font-size:13px;font-weight:600">Push orders to Strapi</div><div style="font-size:11px;color:var(--text2)">Sync new orders to Strapi CMS</div></div>
        <label class="tgl"><input type="checkbox" id="sync-orders" ${s.syncOrders?'checked':''}><span class="tgs"></span></label>
      </div>
      <div class="fg" style="margin-top:12px"><label class="fl">Strapi URL</label><input class="fc" id="sync-url" value="${s.strapiUrl||'http://localhost:1337'}"></div>
      <div style="display:flex;gap:8px;margin-top:4px">
        <button class="btn btn-secondary btn-sm" onclick="testStrapiSync()"><i class="fas fa-plug"></i>Test</button>
        <button class="btn btn-primary btn-sm" onclick="saveSyncSettings()"><i class="fas fa-save"></i>Save</button>
        <button class="btn btn-success btn-sm" onclick="runStrapiSync()"><i class="fas fa-sync"></i>Sync Now</button>
      </div>
    </div>
    <div class="card">
      <div class="card-hd"><div class="card-title"><i class="fas fa-robot" style="color:var(--green)"></i>n8n Automation</div></div>
      <div class="fg"><label class="fl">n8n Base URL</label><input class="fc" id="n8n-base" value="${s.n8nUrl||'http://localhost:5678'}"></div>
      <div class="fg"><label class="fl">Product Auto-Listing Webhook</label><input class="fc" id="n8n-prod-wh" value="${s.n8nProductWebhook||''}" placeholder="http://localhost:5678/webhook/products"></div>
      <div class="fg"><label class="fl">Order Notification Webhook</label><input class="fc" id="n8n-order-wh" value="${s.n8nOrderWebhook||''}" placeholder="http://localhost:5678/webhook/orders"></div>
      <div style="display:flex;gap:8px;margin-top:4px">
        <button class="btn btn-secondary btn-sm" onclick="testN8nConnection()"><i class="fas fa-plug"></i>Test</button>
        <button class="btn btn-primary btn-sm" onclick="saveSyncSettings()"><i class="fas fa-save"></i>Save</button>
      </div>
    </div>
    <div class="card">
      <div class="card-hd"><div class="card-title"><i class="fas fa-exchange-alt" style="color:var(--blue)"></i>Webhook Endpoints (Incoming)</div></div>
      <div style="font-size:12px;color:var(--text2);margin-bottom:10px">These URLs receive data from external services</div>
      ${[
        ['New Order','POST','/webhook/order-created'],
        ['Payment Confirmed','POST','/webhook/payment-success'],
        ['Vendor Delivery','POST','/webhook/vendor-delivered'],
        ['Product Upload','POST','/webhook/product-upload'],
      ].map(([name,method,path])=>`
      <div style="padding:9px 0;border-bottom:1px solid var(--border)">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <span class="tag tb" style="font-size:10px">${method}</span>
          <strong style="font-size:13px">${name}</strong>
        </div>
        <div style="display:flex;align-items:center;gap:6px">
          <code style="background:var(--bg3);padding:3px 8px;border-radius:6px;font-size:11px;flex:1">https://digikraft2-production.up.railway.app/api${path}</code>
          <button class="btn btn-secondary btn-sm btn-icon" onclick="navigator.clipboard.writeText('https://digikraft2-production.up.railway.app/api${path}');window.toast('Copied!','s')"><i class="fas fa-copy"></i></button>
        </div>
      </div>`).join('')}
    </div>
    <div class="card">
      <div class="card-hd"><div class="card-title"><i class="fas fa-history" style="color:var(--purple)"></i>Sync Status</div></div>
      ${[
        ['Strapi Products','2 min ago','success'],
        ['n8n Workflows','5 min ago','success'],
        ['Order Webhooks','Never','warning'],
        ['Vendor API','Never','warning'],
      ].map(([name,time,status])=>`
      <div style="display:flex;align-items:center;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--border)">
        <div><div style="font-size:13px;font-weight:600">${name}</div><div style="font-size:11px;color:var(--text3)">Last sync: ${time}</div></div>
        <span class="tag ${status==='success'?'tg':'ty'}">${status==='success'?'OK':'Pending'}</span>
      </div>`).join('')}
    </div>
  </div>`;
}

function renderWFLogs() {
  const logs = JSON.parse(localStorage.getItem('dk_wflogs') || '[]');
  return `
  <div class="card">
    <div class="card-hd"><div class="card-title">Workflow Run Logs</div>
      <button class="btn btn-danger btn-sm" onclick="localStorage.removeItem('dk_wflogs');navigate('workflow')"><i class="fas fa-trash"></i>Clear</button>
    </div>
    ${logs.length ? `<div class="tw"><table>
      <thead><tr><th>Workflow</th><th>Trigger</th><th>Status</th><th>Duration</th><th>Time</th></tr></thead>
      <tbody>${logs.map(l=>`<tr>
        <td><strong>${l.name}</strong></td>
        <td style="font-size:12px">${l.trigger}</td>
        <td><span class="tag ${l.status==='success'?'tg':'tr'}">${l.status}</span></td>
        <td style="font-size:12px">${l.duration||'—'}ms</td>
        <td style="font-size:11px;color:var(--text2)">${window.fmtDate?window.fmtDate(l.at):l.at}</td>
      </tr>`).join('')}</tbody>
    </table></div>` : '<div class="es"><i class="fas fa-history"></i><p>No workflow runs yet</p></div>'}
  </div>`;
}

window.toggleWorkflow = function(id, enabled) {
  window.toast(`Workflow ${enabled?'enabled':'disabled'}`, enabled?'s':'w');
};

window.openWorkflowModal = function() {
  window.toast('Visual workflow builder coming soon — connect n8n for full automation','i');
};

window.saveSyncSettings = function() {
  const s = JSON.parse(localStorage.getItem('dk_set') || '{}');
  s.syncStrapi = document.getElementById('sync-strapi')?.checked;
  s.syncOrders = document.getElementById('sync-orders')?.checked;
  s.strapiUrl = document.getElementById('sync-url')?.value;
  s.n8nUrl = document.getElementById('n8n-base')?.value;
  s.n8nProductWebhook = document.getElementById('n8n-prod-wh')?.value;
  s.n8nOrderWebhook = document.getElementById('n8n-order-wh')?.value;
  localStorage.setItem('dk_set', JSON.stringify(s));
  window.toast('Sync settings saved!');
};

window.testStrapiSync = async function() {
  const url = document.getElementById('sync-url')?.value || 'http://localhost:1337';
  const s = JSON.parse(localStorage.getItem('dk_set') || '{}');
  try {
    const r = await fetch(`${url}/api/products`, { headers: { Authorization: `Bearer ${s.strapiToken||''}` } });
    r.ok ? window.toast('Strapi connected! ' + (await r.json()).data?.length + ' products found') : window.toast('Strapi error: ' + r.status, 'e');
  } catch { window.toast('Cannot reach Strapi. Is it running?', 'e'); }
};

window.runStrapiSync = async function() {
  window.toast('Syncing from Strapi...', 'i');
  try {
    const data = await AdminAPI.triggerStrapiSync();
    if (data.success) {
      window.toast(`Sync complete! ${data.synced} new products imported`, 's');
      // Log to workflow logs
      const logs = JSON.parse(localStorage.getItem('dk_wflogs') || '[]');
      logs.unshift({ name: 'Auto-Publish Strapi Products', trigger: 'Manual Sync', status: 'success', duration: null, at: new Date().toISOString() });
      localStorage.setItem('dk_wflogs', JSON.stringify(logs.slice(0, 100)));
    } else {
      window.toast('Sync failed: ' + (data.error || 'Unknown error'), 'e');
    }
  } catch (e) {
    window.toast('Sync error: ' + e.message, 'e');
  }
};

window.testN8nConnection = async function() {
  const url = document.getElementById('n8n-base')?.value || 'http://localhost:5678';
  try {
    const r = await fetch(`${url}/healthz`);
    r.ok ? window.toast('n8n connected!', 's') : window.toast('n8n error: ' + r.status, 'e');
  } catch { window.toast('Cannot reach n8n. Is it running?', 'e'); }
};
