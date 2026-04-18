// ===== EMAIL TEMPLATES MODULE =====
// Shared by Settings > Email tab and AI Hub > Email tab

window._emailTemplates = [];
window._emailTplEditId = null;

const EMAIL_TRIGGERS = [
  { value: 'order_placed',        label: '🛍️ Order Placed',           desc: 'Fires immediately when a customer places an order' },
  { value: 'order_completed',     label: '✅ Order Completed',         desc: 'Fires when order status changes to completed' },
  { value: 'order_cancelled',     label: '❌ Order Cancelled',         desc: 'Fires when an order is cancelled' },
  { value: 'payment_failed',      label: '💳 Payment Failed',          desc: 'Fires when a payment attempt fails' },
  { value: 'customer_registered', label: '👤 New Registration',        desc: 'Fires when a new customer registers' },
  { value: 'password_reset',      label: '🔑 Password Reset',          desc: 'Fires when customer requests password reset' },
  { value: 'review_request',      label: '⭐ Review Request',          desc: 'Fires after delivery to ask for a review' },
  { value: 'coupon_issued',       label: '🎟️ Coupon Issued',           desc: 'Fires when a personal coupon is issued' },
  { value: 'subscription_started',label: '🔄 Subscription Started',    desc: 'Fires when a subscription begins' },
  { value: 'subscription_expired',label: '⏰ Subscription Expired',    desc: 'Fires when a subscription expires' },
  { value: 'download_ready',      label: '📥 Download Ready',          desc: 'Fires when a digital product is ready to download' },
  { value: 'vendor_assigned',     label: '🚚 Vendor Assigned',         desc: 'Fires when an order is assigned to a vendor' },
  { value: 'custom',              label: '⚙️ Custom / Manual',         desc: 'Manually triggered or used via API' },
];

const DELAY_UNITS = ['minutes', 'hours', 'days'];

const TEMPLATE_VARS = [
  '{{customer_name}}', '{{customer_email}}', '{{order_number}}',
  '{{order_total}}', '{{product_name}}', '{{download_link}}',
  '{{coupon_code}}', '{{store_name}}', '{{site_url}}'
];

// ── RENDER ────────────────────────────────────────────────────────────────────
window.renderEmailTemplatesSection = async function() {
  try {
    const res = await AdminAPI.get('/v1/email-templates');
    window._emailTemplates = res.data || [];
  } catch (e) {
    window._emailTemplates = [];
  }

  return `
  <div class="card" style="margin-top:20px">
    <div class="card-hd">
      <div class="card-title"><i class="fas fa-file-alt" style="color:var(--accent)"></i>Email Templates</div>
      <button class="btn btn-primary btn-sm" onclick="openEmailTemplateEditor(null)">
        <i class="fas fa-plus"></i>New Template
      </button>
    </div>

    ${window._emailTemplates.length === 0
      ? `<div style="text-align:center;padding:32px;color:var(--text3)">
          <i class="fas fa-envelope-open" style="font-size:32px;display:block;margin-bottom:10px"></i>
          <div style="font-size:14px;font-weight:600;margin-bottom:4px">No email templates yet</div>
          <div style="font-size:12px">Create your first template to automate customer emails</div>
          <button class="btn btn-primary btn-sm" style="margin-top:12px" onclick="openEmailTemplateEditor(null)">
            <i class="fas fa-plus"></i>Create Template
          </button>
        </div>`
      : `<div style="display:flex;flex-direction:column;gap:8px" id="email-tpl-list">
          ${window._emailTemplates.map(t => renderEmailTemplateRow(t)).join('')}
        </div>`
    }
  </div>`;
};

function renderEmailTemplateRow(t) {
  const trigger = EMAIL_TRIGGERS.find(tr => tr.value === t.trigger) || EMAIL_TRIGGERS[EMAIL_TRIGGERS.length - 1];
  const delay = t.delay_value > 0 ? `<span style="font-size:10px;color:var(--text3);margin-left:6px">⏱ +${t.delay_value} ${t.delay_unit}</span>` : '';
  return `
  <div style="display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--bg3);border-radius:10px;border:1px solid var(--border)">
    <div style="width:36px;height:36px;border-radius:9px;background:var(--bg2);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">
      ${trigger.label.split(' ')[0]}
    </div>
    <div style="flex:1;min-width:0">
      <div style="font-size:13px;font-weight:700">${t.title}</div>
      <div style="font-size:11px;color:var(--text3);display:flex;align-items:center;gap:6px;flex-wrap:wrap">
        <span>${trigger.label.slice(trigger.label.indexOf(' ')+1)}</span>
        ${delay}
        <span style="color:var(--text3)">·</span>
        <span style="font-style:italic">${t.subject}</span>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
      <label class="tgl" title="${t.enabled ? 'Enabled' : 'Disabled'}">
        <input type="checkbox" ${t.enabled ? 'checked' : ''} onchange="toggleEmailTemplate(${t.id}, this.checked)">
        <span class="tgs"></span>
      </label>
      <button class="btn btn-sm btn-secondary btn-icon" onclick="openEmailTemplateEditor(${t.id})" title="Edit"><i class="fas fa-edit"></i></button>
      <button class="btn btn-sm btn-secondary btn-icon" onclick="sendTestEmailTemplate(${t.id})" title="Send test"><i class="fas fa-paper-plane"></i></button>
      <button class="btn btn-sm btn-danger btn-icon" onclick="deleteEmailTemplate(${t.id},'${(t.title||'').replace(/'/g,"\\'")}')"><i class="fas fa-trash"></i></button>
    </div>
  </div>`;
}

// ── EDITOR MODAL ──────────────────────────────────────────────────────────────
window.openEmailTemplateEditor = async function(id) {
  let tpl = null;
  if (id) {
    try {
      const res = await AdminAPI.get(`/v1/email-templates/${id}`);
      tpl = res.data;
    } catch (e) {
      window.toast('Failed to load template', 'e');
      return;
    }
  }

  const overlay = document.createElement('div');
  overlay.id = 'email-tpl-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:900;display:flex;align-items:flex-start;justify-content:center;padding:20px;overflow-y:auto';

  overlay.innerHTML = `
  <div style="background:var(--bg2);border:1px solid var(--border);border-radius:16px;width:100%;max-width:780px;margin:auto">

    <!-- HEADER -->
    <div style="padding:18px 24px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:var(--bg2);z-index:10;border-radius:16px 16px 0 0">
      <div>
        <div style="font-size:17px;font-weight:800">${tpl ? 'Edit Template' : 'New Email Template'}</div>
        <div style="font-size:12px;color:var(--text3)">Design your email, set a trigger and optional delay</div>
      </div>
      <button onclick="document.getElementById('email-tpl-overlay').remove()" style="background:var(--bg3);border:none;border-radius:8px;width:32px;height:32px;cursor:pointer;color:var(--text2);font-size:16px">×</button>
    </div>

    <div style="padding:20px 24px;display:flex;flex-direction:column;gap:16px">

      <!-- BASIC INFO -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="fg" style="grid-column:span 2">
          <label class="fl">Template Title <span style="color:var(--red)">*</span></label>
          <input class="fc" id="etpl-title" value="${tpl?.title||''}" placeholder="e.g. Welcome Email, Order Confirmation...">
        </div>
        <div class="fg">
          <label class="fl">From Name</label>
          <input class="fc" id="etpl-from-name" value="${tpl?.from_name||'DigiKraft'}" placeholder="DigiKraft">
        </div>
        <div class="fg">
          <label class="fl">From Email</label>
          <input class="fc" id="etpl-from-email" value="${tpl?.from_email||''}" placeholder="noreply@digikraft.shop" type="email">
        </div>
        <div class="fg" style="grid-column:span 2">
          <label class="fl">Email Subject <span style="color:var(--red)">*</span></label>
          <input class="fc" id="etpl-subject" value="${tpl?.subject||''}" placeholder="e.g. Your order {{order_number}} is confirmed!">
        </div>
      </div>

      <!-- TRIGGER & DELAY -->
      <div style="background:var(--bg3);border-radius:12px;padding:16px">
        <div style="font-size:13px;font-weight:700;margin-bottom:12px;display:flex;align-items:center;gap:8px">
          <i class="fas fa-bolt" style="color:var(--yellow)"></i>Trigger & Timing
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
          <div class="fg" style="grid-column:span 1">
            <label class="fl">Send When</label>
            <select class="fc" id="etpl-trigger" onchange="updateTriggerDesc()">
              ${EMAIL_TRIGGERS.map(tr => `<option value="${tr.value}" ${tpl?.trigger===tr.value?'selected':''}>${tr.label}</option>`).join('')}
            </select>
          </div>
          <div class="fg">
            <label class="fl">Delay After Trigger</label>
            <input class="fc" id="etpl-delay-val" type="number" min="0" value="${tpl?.delay_value||0}" placeholder="0">
          </div>
          <div class="fg">
            <label class="fl">Unit</label>
            <select class="fc" id="etpl-delay-unit">
              ${DELAY_UNITS.map(u => `<option value="${u}" ${tpl?.delay_unit===u?'selected':''}>${u.charAt(0).toUpperCase()+u.slice(1)}</option>`).join('')}
            </select>
          </div>
        </div>
        <div id="etpl-trigger-desc" style="font-size:11px;color:var(--text3);margin-top:6px;padding:6px 10px;background:var(--bg2);border-radius:7px">
          ${(EMAIL_TRIGGERS.find(tr => tr.value === (tpl?.trigger||'order_placed')) || EMAIL_TRIGGERS[0]).desc}
        </div>
      </div>

      <!-- BODY EDITOR -->
      <div class="fg">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
          <label class="fl" style="margin:0">Email Body (HTML supported) <span style="color:var(--red)">*</span></label>
          <div style="display:flex;gap:4px">
            <button class="btn btn-secondary btn-sm" onclick="toggleEmailPreview()" id="etpl-preview-btn"><i class="fas fa-eye"></i>Preview</button>
            <div style="position:relative">
              <button class="btn btn-secondary btn-sm" onclick="toggleVarPicker()" title="Insert variable"><i class="fas fa-code"></i>Variables</button>
              <div id="var-picker" style="display:none;position:absolute;right:0;top:100%;margin-top:4px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:8px;z-index:20;min-width:200px;box-shadow:0 8px 24px rgba(0,0,0,.3)">
                ${TEMPLATE_VARS.map(v => `<button onclick="insertTemplateVar('${v}')" style="display:block;width:100%;text-align:left;padding:5px 8px;border:none;background:none;cursor:pointer;font-size:12px;font-family:monospace;color:var(--accent);border-radius:5px" onmouseover="this.style.background='var(--bg3)'" onmouseout="this.style.background='none'">${v}</button>`).join('')}
              </div>
            </div>
          </div>
        </div>
        <textarea class="fc" id="etpl-body" rows="14" style="font-family:monospace;font-size:12px;resize:vertical" placeholder="Write your email HTML here...
Use {{customer_name}}, {{order_number}}, etc. for dynamic content">${tpl?.body||getDefaultEmailBody()}</textarea>
        <div id="etpl-preview-panel" style="display:none;margin-top:8px;border:1px solid var(--border);border-radius:10px;overflow:hidden">
          <div style="padding:8px 12px;background:var(--bg3);font-size:11px;font-weight:700;color:var(--text3);border-bottom:1px solid var(--border)">PREVIEW (sample data)</div>
          <div id="etpl-preview-content" style="padding:16px;background:#fff;color:#111;min-height:100px"></div>
        </div>
      </div>

      <!-- ERROR -->
      <div id="etpl-error" style="display:none;padding:10px 12px;background:rgba(239,68,68,.1);border:1px solid var(--red);border-radius:8px;font-size:13px;color:var(--red)"></div>

      <!-- ACTIONS -->
      <div style="display:flex;gap:8px;padding-top:4px">
        <button class="btn btn-secondary" style="flex:1" onclick="document.getElementById('email-tpl-overlay').remove()">Cancel</button>
        <button class="btn btn-primary" style="flex:2" onclick="saveEmailTemplate(${tpl?.id||'null'})">
          <i class="fas fa-save"></i>${tpl ? 'Save Changes' : 'Create Template'}
        </button>
      </div>
    </div>
  </div>`;

  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
window.updateTriggerDesc = function() {
  const val = document.getElementById('etpl-trigger')?.value;
  const tr = EMAIL_TRIGGERS.find(t => t.value === val);
  const el = document.getElementById('etpl-trigger-desc');
  if (el && tr) el.textContent = tr.desc;
};

window.toggleEmailPreview = function() {
  const panel = document.getElementById('etpl-preview-panel');
  const content = document.getElementById('etpl-preview-content');
  const btn = document.getElementById('etpl-preview-btn');
  if (!panel) return;
  const isHidden = panel.style.display === 'none';
  panel.style.display = isHidden ? 'block' : 'none';
  if (btn) btn.innerHTML = isHidden ? '<i class="fas fa-eye-slash"></i>Hide' : '<i class="fas fa-eye"></i>Preview';
  if (isHidden && content) {
    let html = document.getElementById('etpl-body')?.value || '';
    // Replace vars with sample data
    const samples = {
      '{{customer_name}}': 'Rahul Sharma',
      '{{customer_email}}': 'rahul@example.com',
      '{{order_number}}': 'ORD-2024-001',
      '{{order_total}}': '₹2,499',
      '{{product_name}}': 'Premium Logo Bundle',
      '{{download_link}}': '#',
      '{{coupon_code}}': 'WELCOME20',
      '{{store_name}}': 'DigiKraft',
      '{{site_url}}': 'https://digikraft.shop'
    };
    Object.entries(samples).forEach(([k, v]) => { html = html.replaceAll(k, v); });
    content.innerHTML = html;
  }
};

window.toggleVarPicker = function() {
  const el = document.getElementById('var-picker');
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
};

window.insertTemplateVar = function(v) {
  const ta = document.getElementById('etpl-body');
  if (!ta) return;
  const start = ta.selectionStart;
  const end = ta.selectionEnd;
  ta.value = ta.value.slice(0, start) + v + ta.value.slice(end);
  ta.selectionStart = ta.selectionEnd = start + v.length;
  ta.focus();
  document.getElementById('var-picker').style.display = 'none';
};

function getDefaultEmailBody() {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
  body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
  .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; }
  .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px; text-align: center; color: #fff; }
  .header h1 { margin: 0; font-size: 24px; }
  .body { padding: 32px; color: #333; line-height: 1.6; }
  .footer { padding: 20px 32px; background: #f9f9f9; text-align: center; font-size: 12px; color: #999; }
  .btn { display: inline-block; background: #6366f1; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px; }
</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>{{store_name}}</h1>
    </div>
    <div class="body">
      <p>Hi {{customer_name}},</p>
      <p>Write your message here...</p>
      <a href="{{site_url}}" class="btn">Visit Store</a>
    </div>
    <div class="footer">
      © {{store_name}} · <a href="{{site_url}}">{{site_url}}</a>
    </div>
  </div>
</body>
</html>`;
}

// ── CRUD ACTIONS ──────────────────────────────────────────────────────────────
window.saveEmailTemplate = async function(id) {
  const title = document.getElementById('etpl-title')?.value?.trim();
  const subject = document.getElementById('etpl-subject')?.value?.trim();
  const body = document.getElementById('etpl-body')?.value?.trim();
  const from_name = document.getElementById('etpl-from-name')?.value?.trim();
  const from_email = document.getElementById('etpl-from-email')?.value?.trim();
  const trigger = document.getElementById('etpl-trigger')?.value;
  const delay_value = document.getElementById('etpl-delay-val')?.value;
  const delay_unit = document.getElementById('etpl-delay-unit')?.value;
  const errEl = document.getElementById('etpl-error');

  if (!title || !subject || !body) {
    if (errEl) { errEl.style.display = 'block'; errEl.textContent = 'Title, Subject and Body are required.'; }
    return;
  }
  if (errEl) errEl.style.display = 'none';

  const payload = { title, subject, body, from_name, from_email, trigger, delay_value, delay_unit };

  try {
    if (id) {
      await AdminAPI.put(`/v1/email-templates/${id}`, payload);
      window.toast('Template updated!', 's');
    } else {
      await AdminAPI.post('/v1/email-templates', payload);
      window.toast('Template created!', 's');
    }
    document.getElementById('email-tpl-overlay')?.remove();
    // Refresh whichever section is visible
    refreshEmailTemplatesSection();
  } catch (e) {
    if (errEl) { errEl.style.display = 'block'; errEl.textContent = 'Failed: ' + e.message; }
  }
};

window.toggleEmailTemplate = async function(id, enabled) {
  try {
    await AdminAPI.put(`/v1/email-templates/${id}`, { enabled });
    window.toast(enabled ? 'Template enabled' : 'Template disabled', 's');
  } catch (e) {
    window.toast('Failed: ' + e.message, 'e');
  }
};

window.deleteEmailTemplate = async function(id, title) {
  if (!confirm(`Delete template "${title}"?`)) return;
  try {
    await AdminAPI.delete(`/v1/email-templates/${id}`);
    window.toast('Template deleted', 's');
    refreshEmailTemplatesSection();
  } catch (e) {
    window.toast('Failed: ' + e.message, 'e');
  }
};

window.sendTestEmailTemplate = async function(id) {
  const to = prompt('Send test to email address:');
  if (!to) return;
  try {
    const res = await AdminAPI.post(`/v1/email-templates/${id}/send-test`, { to });
    window.toast(res.message || 'Test sent!', 's');
  } catch (e) {
    window.toast('Failed: ' + e.message, 'e');
  }
};

// Refresh the templates list in-place without full page reload
async function refreshEmailTemplatesSection() {
  const container = document.getElementById('email-tpl-list');
  const card = container?.closest('.card');
  if (!card) {
    // Full re-render if container not found
    if (window._aiHubTab === 'email') navigate('ai-hub');
    else navigate('settings');
    return;
  }
  try {
    const res = await AdminAPI.get('/v1/email-templates');
    window._emailTemplates = res.data || [];
    const newHtml = await window.renderEmailTemplatesSection();
    // Replace just the card
    const wrapper = document.createElement('div');
    wrapper.innerHTML = newHtml;
    card.replaceWith(wrapper.firstElementChild);
  } catch (e) { /* ignore */ }
}
