// ============================================================
// MODULE: SETTINGS - Tabbed segments
// ============================================================
let _tab = 'store';

export function render() {
  const tabs = [
    { id: 'store', label: '<i class="fas fa-store"></i> Store' },
    { id: 'payment', label: '<i class="fas fa-credit-card"></i> Payment' },
    { id: 'integrations', label: '<i class="fas fa-plug"></i> Integrations' },
    { id: 'email', label: '<i class="fas fa-envelope"></i> Email' },
    { id: 'security', label: '<i class="fas fa-shield-alt"></i> Security' },
    { id: 'appearance', label: '<i class="fas fa-palette"></i> Appearance' },
  ];
  return `
  <div class="page-header">
    <div><div class="page-title">Settings</div><div class="page-subtitle">Configure your store</div></div>
  </div>
  <div class="tab-bar" style="margin-bottom:20px">
    ${tabs.map(t => `<button class="tab-btn ${_tab===t.id?'active':''}" onclick="window.AdminModules.settings.setTab('${t.id}')">${t.label}</button>`).join('')}
  </div>
  ${_tab === 'store' ? renderStore() : ''}
  ${_tab === 'payment' ? renderPayment() : ''}
  ${_tab === 'integrations' ? renderIntegrations() : ''}
  ${_tab === 'email' ? renderEmail() : ''}
  ${_tab === 'security' ? renderSecurity() : ''}
  ${_tab === 'appearance' ? renderAppearance() : ''}`;
}

export function setTab(id) { _tab = id; window.AdminApp.render(); }

function renderStore() {
  const s = window.AdminCore.State.settings;
  return `
  <div class="grid-2">
    <div class="card">
      <div class="card-header"><div class="card-title"><i class="fas fa-info-circle" style="color:var(--accent);margin-right:8px"></i>Store Information</div></div>
      <div class="form-group"><label class="form-label">Store Name</label><input class="form-control" id="s-name" value="${s.name||'DigiKraft.shop'}"></div>
      <div class="form-group"><label class="form-label">Store Tagline</label><input class="form-control" id="s-tagline" value="${s.tagline||'Premium Digital Assets'}"></div>
      <div class="form-group"><label class="form-label">Store Email</label><input class="form-control" id="s-email" type="email" value="${s.email||''}"></div>
      <div class="form-group"><label class="form-label">Support Phone</label><input class="form-control" id="s-phone" value="${s.phone||''}"></div>
      <div class="form-group"><label class="form-label">Store Address</label><textarea class="form-control" id="s-address" rows="2">${s.address||''}</textarea></div>
      <button class="btn btn-primary" onclick="window.AdminModules.settings.saveStore()"><i class="fas fa-save"></i> Save</button>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title"><i class="fas fa-globe" style="color:var(--accent);margin-right:8px"></i>Regional Settings</div></div>
      <div class="form-group"><label class="form-label">Currency</label>
        <select class="form-control" id="s-currency">
          ${['INR','USD','EUR','GBP','AED'].map(c=>`<option ${s.currency===c?'selected':''}>${c}</option>`).join('')}
        </select>
      </div>
      <div class="form-group"><label class="form-label">Timezone</label>
        <select class="form-control" id="s-tz">
          ${['Asia/Kolkata','UTC','America/New_York','Europe/London'].map(t=>`<option ${s.timezone===t?'selected':''}>${t}</option>`).join('')}
        </select>
      </div>
      <div class="form-group"><label class="form-label">Date Format</label>
        <select class="form-control" id="s-dateformat">
          ${['DD/MM/YYYY','MM/DD/YYYY','YYYY-MM-DD'].map(f=>`<option ${s.dateFormat===f?'selected':''}>${f}</option>`).join('')}
        </select>
      </div>
      <div class="form-group"><label class="form-label">Language</label>
        <select class="form-control" id="s-lang">
          ${['English','Hindi','Arabic','French'].map(l=>`<option ${s.language===l?'selected':''}>${l}</option>`).join('')}
        </select>
      </div>
      <div class="form-group"><label class="form-label">Tax Rate (%)</label><input class="form-control" id="s-tax" type="number" value="${s.taxRate||0}" step="0.1"></div>
      <button class="btn btn-primary" onclick="window.AdminModules.settings.saveStore()"><i class="fas fa-save"></i> Save</button>
    </div>
  </div>`;
}

function renderPayment() {
  const s = window.AdminCore.State.settings;
  return `
  <div class="grid-2">
    <div class="card">
      <div class="card-header"><div class="card-title"><i class="fas fa-credit-card" style="color:var(--accent);margin-right:8px"></i>Razorpay</div>
        <label class="toggle-switch"><input type="checkbox" id="rz-enabled" ${s.razorpayEnabled?'checked':''}><span class="toggle-slider"></span></label>
      </div>
      <div class="form-group"><label class="form-label">Key ID</label><input class="form-control" id="rz-key" value="${s.razorpayKey||''}" placeholder="rzp_live_..."></div>
      <div class="form-group"><label class="form-label">Key Secret</label><input class="form-control" id="rz-secret" type="password" value="${s.razorpaySecret||''}" placeholder="••••••••"></div>
      <div class="form-group"><label class="form-label">Webhook Secret</label><input class="form-control" id="rz-webhook" value="${s.razorpayWebhook||''}" placeholder="webhook_secret"></div>
      <button class="btn btn-primary" onclick="window.AdminModules.settings.savePayment()"><i class="fas fa-save"></i> Save</button>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title"><i class="fas fa-money-bill" style="color:var(--green);margin-right:8px"></i>Other Methods</div></div>
      <div class="form-group">
        <label class="form-label">UPI ID</label>
        <input class="form-control" id="s-upi" value="${s.upiId||''}" placeholder="yourname@upi">
      </div>
      <div class="form-group">
        <label class="form-label">Cash on Delivery</label>
        <label class="toggle-switch"><input type="checkbox" id="cod-enabled" ${s.codEnabled?'checked':''}><span class="toggle-slider"></span></label>
      </div>
      <div class="form-group">
        <label class="form-label">Minimum Order for COD (₹)</label>
        <input class="form-control" id="cod-min" type="number" value="${s.codMin||0}">
      </div>
      <div class="form-group">
        <label class="form-label">Free Shipping Above (₹)</label>
        <input class="form-control" id="free-ship" type="number" value="${s.freeShipping||0}">
      </div>
      <button class="btn btn-primary" onclick="window.AdminModules.settings.savePayment()"><i class="fas fa-save"></i> Save</button>
    </div>
  </div>`;
}

function renderIntegrations() {
  const s = window.AdminCore.State.settings;
  return `
  <div class="grid-2">
    <div class="card">
      <div class="card-header"><div class="card-title"><i class="fas fa-database" style="color:var(--accent);margin-right:8px"></i>Strapi CMS</div></div>
      <div class="form-group"><label class="form-label">Strapi URL</label><input class="form-control" id="strapi-url" value="${s.strapiUrl||'http://localhost:1337'}"></div>
      <div class="form-group"><label class="form-label">API Token</label><input class="form-control" id="strapi-token" type="password" value="${s.strapiToken||''}"></div>
      <div style="display:flex;gap:8px;margin-top:4px">
        <button class="btn btn-secondary btn-sm" onclick="window.AdminModules.settings.testStrapi()"><i class="fas fa-plug"></i> Test Connection</button>
        <button class="btn btn-primary btn-sm" onclick="window.AdminModules.settings.saveIntegrations()"><i class="fas fa-save"></i> Save</button>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title"><i class="fas fa-robot" style="color:var(--green);margin-right:8px"></i>n8n Automation</div></div>
      <div class="form-group"><label class="form-label">n8n URL</label><input class="form-control" id="n8n-url" value="${s.n8nUrl||'http://localhost:5678'}"></div>
      <div class="form-group"><label class="form-label">Webhook URL</label><input class="form-control" id="n8n-webhook" value="${s.n8nWebhook||''}" placeholder="http://localhost:5678/webhook/..."></div>
      <div style="display:flex;gap:8px;margin-top:4px">
        <button class="btn btn-secondary btn-sm" onclick="window.AdminCore.UI.toast('n8n test coming soon','info')"><i class="fas fa-plug"></i> Test</button>
        <button class="btn btn-primary btn-sm" onclick="window.AdminModules.settings.saveIntegrations()"><i class="fas fa-save"></i> Save</button>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title"><i class="fab fa-google" style="color:var(--red);margin-right:8px"></i>Google Analytics</div></div>
      <div class="form-group"><label class="form-label">Measurement ID</label><input class="form-control" id="ga-id" value="${s.gaId||''}" placeholder="G-XXXXXXXXXX"></div>
      <button class="btn btn-primary btn-sm" onclick="window.AdminModules.settings.saveIntegrations()"><i class="fas fa-save"></i> Save</button>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title"><i class="fas fa-server" style="color:var(--blue);margin-right:8px"></i>Backend API</div></div>
      <div class="form-group"><label class="form-label">API Base URL</label><input class="form-control" id="api-url" value="${s.apiUrl||'http://localhost:8080/api'}"></div>
      <div class="form-group"><label class="form-label">API Key</label><input class="form-control" id="api-key" type="password" value="${s.apiKey||''}"></div>
      <button class="btn btn-primary btn-sm" onclick="window.AdminModules.settings.saveIntegrations()"><i class="fas fa-save"></i> Save</button>
    </div>
  </div>`;
}

function renderEmail() {
  const s = window.AdminCore.State.settings;
  return `
  <div class="grid-2">
    <div class="card">
      <div class="card-header"><div class="card-title"><i class="fas fa-envelope" style="color:var(--accent);margin-right:8px"></i>SMTP Settings</div></div>
      <div class="form-group"><label class="form-label">SMTP Host</label><input class="form-control" id="s-smtp-host" value="${s.smtpHost||''}" placeholder="smtp.gmail.com"></div>
      <div class="form-group"><label class="form-label">SMTP Port</label><input class="form-control" id="s-smtp-port" value="${s.smtpPort||587}" type="number"></div>
      <div class="form-group"><label class="form-label">Username</label><input class="form-control" id="s-smtp-user" value="${s.smtpUser||''}"></div>
      <div class="form-group"><label class="form-label">Password</label><input class="form-control" id="s-smtp-pass" type="password" value="${s.smtpPass||''}"></div>
      <div class="form-group"><label class="form-label">From Name</label><input class="form-control" id="s-smtp-from-name" value="${s.smtpFromName||'DigiKraft'}"></div>
      <div class="form-group"><label class="form-label">From Email</label><input class="form-control" id="s-smtp-from-email" value="${s.smtpFromEmail||''}"></div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-secondary btn-sm" onclick="window.AdminCore.UI.toast('Test email sent!','success')"><i class="fas fa-paper-plane"></i> Send Test</button>
        <button class="btn btn-primary btn-sm" onclick="window.AdminModules.settings.saveEmail()"><i class="fas fa-save"></i> Save</button>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title"><i class="fas fa-bell" style="color:var(--yellow);margin-right:8px"></i>Email Notifications</div></div>
      ${toggle('New Order', 'notif-order', s.notifOrder)}
      ${toggle('Order Completed', 'notif-complete', s.notifComplete)}
      ${toggle('New Customer', 'notif-customer', s.notifCustomer)}
      ${toggle('Low Stock Alert', 'notif-stock', s.notifStock)}
      ${toggle('New Review', 'notif-review', s.notifReview)}
      ${toggle('Failed Payment', 'notif-payment', s.notifPayment)}
      <button class="btn btn-primary btn-sm" style="margin-top:12px" onclick="window.AdminModules.settings.saveEmail()"><i class="fas fa-save"></i> Save</button>
    </div>
  </div>
  <div id="settings-email-templates-section">
    <div class="card" style="margin-top:20px">
      <div class="card-hd" style="padding:16px 20px">
        <div style="font-size:14px;font-weight:700;display:flex;align-items:center;gap:8px"><i class="fas fa-spinner fa-spin"></i>Loading templates...</div>
      </div>
    </div>
  </div>
  <script>
    (async () => {
      const el = document.getElementById('settings-email-templates-section');
      if (el && window.renderEmailTemplatesSection) {
        el.innerHTML = await window.renderEmailTemplatesSection();
      }
    })();
  </script>`;
}

function renderSecurity() {
  const s = window.AdminCore.State.settings;
  return `
  <div class="grid-2">
    <div class="card">
      <div class="card-header"><div class="card-title"><i class="fas fa-lock" style="color:var(--accent);margin-right:8px"></i>Admin Account</div></div>
      <div class="form-group"><label class="form-label">Admin Email</label><input class="form-control" id="sec-email" value="${s.adminEmail||'admin@digikraft.shop'}"></div>
      <div class="form-group"><label class="form-label">Current Password</label><input class="form-control" id="sec-cur-pass" type="password" placeholder="••••••••"></div>
      <div class="form-group"><label class="form-label">New Password</label><input class="form-control" id="sec-new-pass" type="password" placeholder="••••••••"></div>
      <div class="form-group"><label class="form-label">Confirm Password</label><input class="form-control" id="sec-conf-pass" type="password" placeholder="••••••••"></div>
      <button class="btn btn-primary" onclick="window.AdminModules.settings.changePassword()"><i class="fas fa-key"></i> Change Password</button>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title"><i class="fas fa-shield-alt" style="color:var(--green);margin-right:8px"></i>Security Options</div></div>
      ${toggle('Two-Factor Authentication', 'sec-2fa', s.twoFactor)}
      ${toggle('Login Notifications', 'sec-login-notif', s.loginNotif)}
      ${toggle('Maintenance Mode', 'sec-maintenance', s.maintenance)}
      ${toggle('Force HTTPS', 'sec-https', s.forceHttps)}
      <div class="form-group" style="margin-top:16px"><label class="form-label">Session Timeout (minutes)</label><input class="form-control" id="sec-timeout" type="number" value="${s.sessionTimeout||60}"></div>
      <div class="form-group"><label class="form-label">Allowed IPs (one per line)</label><textarea class="form-control" id="sec-ips" rows="3" placeholder="Leave empty to allow all">${s.allowedIps||''}</textarea></div>
      <button class="btn btn-primary" onclick="window.AdminModules.settings.saveSecurity()"><i class="fas fa-save"></i> Save</button>
    </div>
  </div>`;
}

function renderAppearance() {
  const s = window.AdminCore.State.settings;
  return `
  <div class="grid-2">
    <div class="card">
      <div class="card-header"><div class="card-title"><i class="fas fa-paint-brush" style="color:var(--accent);margin-right:8px"></i>Branding</div></div>
      <div class="form-group"><label class="form-label">Logo URL</label><input class="form-control" id="app-logo" value="${s.logoUrl||''}" placeholder="https://..."></div>
      <div class="form-group"><label class="form-label">Favicon URL</label><input class="form-control" id="app-favicon" value="${s.faviconUrl||''}" placeholder="https://..."></div>
      <div class="form-group"><label class="form-label">Primary Color</label>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="color" id="app-color" value="${s.primaryColor||'#6366f1'}" style="width:48px;height:38px;border-radius:8px;border:1px solid var(--border);background:none;cursor:pointer">
          <input class="form-control" id="app-color-hex" value="${s.primaryColor||'#6366f1'}" placeholder="#6366f1" style="flex:1">
        </div>
      </div>
      <div class="form-group"><label class="form-label">Admin Theme</label>
        <select class="form-control" id="app-theme">
          <option value="dark" ${s.adminTheme==='dark'?'selected':''}>Dark</option>
          <option value="light" ${s.adminTheme==='light'?'selected':''}>Light</option>
        </select>
      </div>
      <button class="btn btn-primary" onclick="window.AdminModules.settings.saveAppearance()"><i class="fas fa-save"></i> Save & Apply</button>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title"><i class="fas fa-home" style="color:var(--blue);margin-right:8px"></i>Homepage Settings</div></div>
      ${toggle('Show Hero Banner', 'app-hero', s.showHero !== false)}
      ${toggle('Show Featured Products', 'app-featured', s.showFeatured !== false)}
      ${toggle('Show Newsletter', 'app-newsletter', s.showNewsletter !== false)}
      ${toggle('Show Blog Section', 'app-blog', s.showBlog !== false)}
      ${toggle('Show Testimonials', 'app-testimonials', s.showTestimonials)}
      <div class="form-group" style="margin-top:16px"><label class="form-label">Products Per Page</label>
        <select class="form-control" id="app-perpage">
          ${[12,24,36,48].map(n=>`<option ${s.perPage===n?'selected':''}>${n}</option>`).join('')}
        </select>
      </div>
      <button class="btn btn-primary" onclick="window.AdminModules.settings.saveAppearance()"><i class="fas fa-save"></i> Save</button>
    </div>
  </div>`;
}

function toggle(label, id, checked) {
  return `<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
    <span style="font-size:14px">${label}</span>
    <label class="toggle-switch"><input type="checkbox" id="${id}" ${checked?'checked':''}><span class="toggle-slider"></span></label>
  </div>`;
}

export function saveStore() {
  const { State, UI } = window.AdminCore;
  const s = State.settings;
  s.name = document.getElementById('s-name')?.value;
  s.tagline = document.getElementById('s-tagline')?.value;
  s.email = document.getElementById('s-email')?.value;
  s.phone = document.getElementById('s-phone')?.value;
  s.address = document.getElementById('s-address')?.value;
  s.currency = document.getElementById('s-currency')?.value;
  s.timezone = document.getElementById('s-tz')?.value;
  s.dateFormat = document.getElementById('s-dateformat')?.value;
  s.language = document.getElementById('s-lang')?.value;
  s.taxRate = document.getElementById('s-tax')?.value;
  State.settings = s;
  UI.toast('Store settings saved!');
}

export function savePayment() {
  const { State, UI } = window.AdminCore;
  const s = State.settings;
  s.razorpayEnabled = document.getElementById('rz-enabled')?.checked;
  s.razorpayKey = document.getElementById('rz-key')?.value;
  s.razorpaySecret = document.getElementById('rz-secret')?.value;
  s.razorpayWebhook = document.getElementById('rz-webhook')?.value;
  s.upiId = document.getElementById('s-upi')?.value;
  s.codEnabled = document.getElementById('cod-enabled')?.checked;
  s.codMin = document.getElementById('cod-min')?.value;
  s.freeShipping = document.getElementById('free-ship')?.value;
  State.settings = s;
  UI.toast('Payment settings saved!');
}

export function saveIntegrations() {
  const { State, UI } = window.AdminCore;
  const s = State.settings;
  s.strapiUrl = document.getElementById('strapi-url')?.value;
  s.strapiToken = document.getElementById('strapi-token')?.value;
  s.n8nUrl = document.getElementById('n8n-url')?.value;
  s.n8nWebhook = document.getElementById('n8n-webhook')?.value;
  s.gaId = document.getElementById('ga-id')?.value;
  s.apiUrl = document.getElementById('api-url')?.value;
  s.apiKey = document.getElementById('api-key')?.value;
  State.settings = s;
  UI.toast('Integration settings saved!');
}

export function saveEmail() {
  const { State, UI } = window.AdminCore;
  const s = State.settings;
  s.smtpHost = document.getElementById('s-smtp-host')?.value;
  s.smtpPort = document.getElementById('s-smtp-port')?.value;
  s.smtpUser = document.getElementById('s-smtp-user')?.value;
  s.smtpPass = document.getElementById('s-smtp-pass')?.value;
  s.smtpFromName = document.getElementById('s-smtp-from-name')?.value;
  s.smtpFromEmail = document.getElementById('s-smtp-from-email')?.value;
  s.notifOrder = document.getElementById('notif-order')?.checked;
  s.notifComplete = document.getElementById('notif-complete')?.checked;
  s.notifCustomer = document.getElementById('notif-customer')?.checked;
  s.notifStock = document.getElementById('notif-stock')?.checked;
  s.notifReview = document.getElementById('notif-review')?.checked;
  s.notifPayment = document.getElementById('notif-payment')?.checked;
  State.settings = s;
  UI.toast('Email settings saved!');
}

export function saveSecurity() {
  const { State, UI } = window.AdminCore;
  const s = State.settings;
  s.adminEmail = document.getElementById('sec-email')?.value;
  s.twoFactor = document.getElementById('sec-2fa')?.checked;
  s.loginNotif = document.getElementById('sec-login-notif')?.checked;
  s.maintenance = document.getElementById('sec-maintenance')?.checked;
  s.forceHttps = document.getElementById('sec-https')?.checked;
  s.sessionTimeout = document.getElementById('sec-timeout')?.value;
  s.allowedIps = document.getElementById('sec-ips')?.value;
  State.settings = s;
  UI.toast('Security settings saved!');
}

export function saveAppearance() {
  const { State, UI } = window.AdminCore;
  const s = State.settings;
  s.logoUrl = document.getElementById('app-logo')?.value;
  s.faviconUrl = document.getElementById('app-favicon')?.value;
  s.primaryColor = document.getElementById('app-color-hex')?.value;
  s.adminTheme = document.getElementById('app-theme')?.value;
  s.showHero = document.getElementById('app-hero')?.checked;
  s.showFeatured = document.getElementById('app-featured')?.checked;
  s.showNewsletter = document.getElementById('app-newsletter')?.checked;
  s.showBlog = document.getElementById('app-blog')?.checked;
  s.showTestimonials = document.getElementById('app-testimonials')?.checked;
  s.perPage = parseInt(document.getElementById('app-perpage')?.value);
  State.settings = s;
  if (s.adminTheme) document.documentElement.setAttribute('data-theme', s.adminTheme);
  UI.toast('Appearance saved & applied!');
}

export function changePassword() {
  const np = document.getElementById('sec-new-pass')?.value;
  const cp = document.getElementById('sec-conf-pass')?.value;
  if (np !== cp) return window.AdminCore.UI.toast('Passwords do not match', 'error');
  if (np.length < 8) return window.AdminCore.UI.toast('Password must be 8+ characters', 'error');
  window.AdminCore.UI.toast('Password changed!');
}

export async function testStrapi() {
  const { STRAPI_TOKEN, UI } = window.AdminCore;
  const url = document.getElementById('strapi-url')?.value || 'http://localhost:1337';
  try {
    const r = await fetch(`${url}/api/products`, { headers: { Authorization: `Bearer ${STRAPI_TOKEN}` } });
    r.ok ? UI.toast('Strapi connected!') : UI.toast('Strapi error: ' + r.status, 'error');
  } catch { UI.toast('Cannot reach Strapi. Is it running?', 'error'); }
}
