// ===== PORTAL BROWSER MODULE =====
// Embedded browser for vendor panels, license tools, and external services
window.renderPortals = function() {
  const portals = JSON.parse(localStorage.getItem('dk_portals') || '[]');
  const active = window._activePortal || null;
  const tab = window._portalTab || 'browser';

  return `
  <div class="ph" style="margin-bottom:0">
    <div><div class="ph-title">Portal Browser</div><div class="ph-sub">${portals.length} portals · Open vendor panels inside admin</div></div>
    <div class="ph-actions">
      <button class="btn btn-secondary" onclick="window._portalTab='manage';navigate('portals')"><i class="fas fa-cog"></i>Manage Portals</button>
      <button class="btn btn-primary" onclick="openAddPortalModal()"><i class="fas fa-plus"></i>Add Portal</button>
    </div>
  </div>

  <div class="tabs" style="margin:12px 0">
    ${[['browser','Browser'],['manage','Manage'],['credentials','Credentials']].map(([id,lb])=>
      `<button class="tab ${tab===id?'on':''}" onclick="window._portalTab='${id}';navigate('portals')">${lb}</button>`
    ).join('')}
  </div>

  ${tab==='browser'?renderBrowserTab(portals, active):''}
  ${tab==='manage'?renderManageTab(portals):''}
  ${tab==='credentials'?renderCredentialsTab(portals):''}

  <!-- ADD/EDIT PORTAL MODAL -->
  <div class="mo" id="portal-modal">
    <div class="md" style="max-width:520px">
      <div class="mh">
        <div class="mt" id="portal-modal-title">Add Portal</div>
        <button class="mc" onclick="closeModal('portal-modal')"><i class="fas fa-times"></i></button>
      </div>
      <div class="mb">
        <form id="portal-form" onsubmit="savePortal(event)">
          <input type="hidden" name="id" id="portal-id">
          <div class="fgrid">
            <div class="fg cs2"><label class="fl">Portal Name *</label><input class="fc" name="name" placeholder="e.g. CorelDRAW License Panel" required></div>
            <div class="fg cs2"><label class="fl">URL *</label><input class="fc" name="url" type="url" placeholder="https://panel.vendor.com" required oninput="updateFavicon(this.value)"></div>
            <div class="fg"><label class="fl">Category</label>
              <select class="fc" name="category">
                <option>License Panel</option><option>Vendor Portal</option><option>Reseller Panel</option>
                <option>Payment Gateway</option><option>Analytics</option><option>CMS</option>
                <option>Support Tool</option><option>Other</option>
              </select>
            </div>
            <div class="fg"><label class="fl">Icon / Emoji</label><input class="fc" name="icon" placeholder="🔑 or leave blank for auto-favicon" maxlength="4"></div>
            <div class="fg"><label class="fl">Login Username / Email</label><input class="fc" name="username" placeholder="your@email.com" autocomplete="off"></div>
            <div class="fg"><label class="fl">Password</label><input class="fc" name="password" type="password" placeholder="••••••••" autocomplete="new-password"></div>
            <div class="fg cs2"><label class="fl">Notes</label><textarea class="fc" name="notes" rows="2" placeholder="What this portal is used for..."></textarea></div>
            <div class="fg cs2">
              <label class="fl">Open Mode</label>
              <select class="fc" name="openMode">
                <option value="iframe">Try Iframe (may be blocked by some sites)</option>
                <option value="popup">Popup Window (works with all sites)</option>
                <option value="tab">New Tab</option>
              </select>
              <div style="font-size:11px;color:var(--text3);margin-top:4px"><i class="fas fa-info-circle"></i> Most external sites (Razorpay, Google, etc.) require Popup or New Tab mode</div>
            </div>
            <div class="fg cs2" style="display:flex;align-items:center;gap:10px;background:var(--bg3);padding:12px;border-radius:9px">
              <input type="checkbox" name="pinned" id="portal-pin" style="width:16px;height:16px">
              <label for="portal-pin" style="cursor:pointer;font-size:13px;font-weight:600"><i class="fas fa-thumbtack" style="color:var(--yellow);margin-right:6px"></i>Pin to quick access bar</label>
            </div>
          </div>
        </form>
      </div>
      <div class="mf">
        <button class="btn btn-secondary" onclick="closeModal('portal-modal')">Cancel</button>
        <button class="btn btn-primary" onclick="document.getElementById('portal-form').requestSubmit()"><i class="fas fa-save"></i>Save Portal</button>
      </div>
    </div>
  </div>`;
};

function renderBrowserTab(portals, active) {
  const pinned = portals.filter(p => p.pinned);
  const current = active ? portals.find(p => p.id === active) : null;

  return `
  <!-- QUICK ACCESS BAR -->
  <div style="display:flex;align-items:center;gap:6px;padding:10px 0;flex-wrap:wrap;border-bottom:1px solid var(--border);margin-bottom:12px">
    <span style="font-size:11px;color:var(--text3);font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-right:4px">Quick Access:</span>
    ${portals.length ? portals.map(p=>`
    <button onclick="openPortal('${p.id}')"
      style="display:flex;align-items:center;gap:6px;padding:5px 12px;border-radius:8px;background:${active===p.id?'var(--accent)':'var(--bg3)'};border:1px solid ${active===p.id?'var(--accent)':'var(--border)'};color:${active===p.id?'#fff':'var(--text)'};font-size:12px;font-weight:600;cursor:pointer;transition:.15s">
      <span style="font-size:14px">${p.icon||'🌐'}</span>${p.name}
      ${p.pinned?'<i class="fas fa-thumbtack" style="font-size:9px;opacity:.6"></i>':''}
    </button>`).join('') : '<span style="font-size:12px;color:var(--text3)">No portals added yet</span>'}
    <button onclick="openAddPortalModal()" style="padding:5px 10px;border-radius:8px;background:none;border:1px dashed var(--border);color:var(--text3);font-size:12px;cursor:pointer">+ Add</button>
  </div>

  ${current ? `
  <!-- BROWSER CHROME -->
  <div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden">
    <!-- Browser Toolbar -->
    <div style="display:flex;align-items:center;gap:8px;padding:10px 14px;background:var(--bg3);border-bottom:1px solid var(--border)">
      <!-- Traffic lights -->
      <div style="display:flex;gap:5px">
        <div style="width:12px;height:12px;border-radius:50%;background:#ef4444;cursor:pointer" onclick="closePortalBrowser()" title="Close"></div>
        <div style="width:12px;height:12px;border-radius:50%;background:#f59e0b" title="Minimize"></div>
        <div style="width:12px;height:12px;border-radius:50%;background:#22c55e;cursor:pointer" onclick="toggleFullscreenPortal()" title="Fullscreen"></div>
      </div>
      <!-- Nav buttons -->
      <button onclick="document.getElementById('portal-frame').contentWindow?.history.back()" style="background:none;border:none;color:var(--text2);cursor:pointer;font-size:14px;padding:2px 6px" title="Back"><i class="fas fa-arrow-left"></i></button>
      <button onclick="document.getElementById('portal-frame').contentWindow?.history.forward()" style="background:none;border:none;color:var(--text2);cursor:pointer;font-size:14px;padding:2px 6px" title="Forward"><i class="fas fa-arrow-right"></i></button>
      <button onclick="document.getElementById('portal-frame').src=document.getElementById('portal-frame').src" style="background:none;border:none;color:var(--text2);cursor:pointer;font-size:14px;padding:2px 6px" title="Reload"><i class="fas fa-redo"></i></button>
      <!-- URL bar -->
      <div style="flex:1;display:flex;align-items:center;gap:6px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:5px 10px">
        <i class="fas fa-lock" style="color:var(--green);font-size:11px"></i>
        <input id="portal-url-bar" value="${current.url}" style="flex:1;background:none;border:none;color:var(--text);font-size:12px;font-family:monospace" onkeydown="if(event.key==='Enter')navigatePortalTo(this.value)">
        <button onclick="navigatePortalTo(document.getElementById('portal-url-bar').value)" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:11px"><i class="fas fa-arrow-right"></i></button>
      </div>
      <!-- Actions -->
      <button onclick="copyPortalCredentials('${current.id}')" class="btn btn-secondary btn-sm" title="Copy credentials"><i class="fas fa-key"></i>Credentials</button>
      <button onclick="openInNewTab('${current.url}')" class="btn btn-secondary btn-sm" title="Open in new tab"><i class="fas fa-external-link-alt"></i></button>
      <button onclick="editPortal('${current.id}')" class="btn btn-secondary btn-sm btn-icon" title="Edit portal"><i class="fas fa-edit"></i></button>
    </div>

    <!-- Credentials Quick Bar -->
    <div style="display:flex;align-items:center;gap:10px;padding:7px 14px;background:rgba(99,102,241,.06);border-bottom:1px solid var(--border);font-size:12px">
      <i class="fas fa-user-circle" style="color:var(--accent)"></i>
      <span style="color:var(--text2)">Saved:</span>
      <strong>${current.username||'No username saved'}</strong>
      ${current.password?`<button onclick="copyToClipboard('${current.username||''}','Username')" class="btn btn-secondary btn-sm" style="padding:2px 8px;font-size:11px"><i class="fas fa-copy"></i>User</button>
      <button onclick="copyToClipboard('${current.password}','Password')" class="btn btn-secondary btn-sm" style="padding:2px 8px;font-size:11px"><i class="fas fa-copy"></i>Pass</button>`:''}
      <span style="margin-left:auto;font-size:11px;color:var(--text3)">${current.category||'Portal'} · ${current.notes||''}</span>
    </div>

    <!-- IFRAME with block detection -->
    <div id="portal-frame-wrap" style="position:relative">
      <iframe id="portal-frame" src="${current.url}"
        style="width:100%;height:calc(100vh - 340px);min-height:500px;border:none;background:#fff"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation allow-modals"
        onload="onPortalFrameLoad(this,'${current.url}')"
        onerror="showPortalBlockedMsg('${current.url}')">
      </iframe>
      <!-- Blocked overlay (hidden by default) -->
      <div id="portal-blocked-msg" style="display:none;position:absolute;inset:0;background:var(--bg2);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:40px">
        <div style="font-size:48px">🚫</div>
        <div style="font-size:18px;font-weight:700">This website blocks embedding</div>
        <div style="font-size:14px;color:var(--text2);text-align:center;max-width:480px">
          <strong>${current.url}</strong> uses <code style="background:var(--bg3);padding:2px 6px;border-radius:4px">X-Frame-Options</code> or <code style="background:var(--bg3);padding:2px 6px;border-radius:4px">Content-Security-Policy</code> headers that prevent it from loading inside an iframe.<br><br>
          This is a browser security restriction — not a bug.
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">
          <button class="btn btn-primary" onclick="openPopupWindow('${current.url}','${current.name}','${current.username||''}','${current.password||''}')">
            <i class="fas fa-external-link-alt"></i>Open in Popup Window
          </button>
          <button class="btn btn-secondary" onclick="openInNewTab('${current.url}')">
            <i class="fas fa-window-maximize"></i>Open in New Tab
          </button>
          <button class="btn btn-secondary" onclick="retryPortalFrame('${current.url}')">
            <i class="fas fa-redo"></i>Retry
          </button>
        </div>
        <div style="background:var(--bg3);border-radius:10px;padding:14px 18px;max-width:480px;font-size:12px;color:var(--text2)">
          <strong style="color:var(--text)">💡 Tip:</strong> Use <strong>Open in Popup Window</strong> — it opens the site in a floating window that stays on top of your admin panel. Your saved credentials are auto-copied to clipboard.
        </div>
      </div>
    </div>
  </div>` : `
  <!-- NO PORTAL SELECTED -->
  <div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:60px 20px;text-align:center">
    <div style="font-size:64px;margin-bottom:16px">🌐</div>
    <div style="font-size:18px;font-weight:700;margin-bottom:8px">Portal Browser</div>
    <div style="font-size:14px;color:var(--text2);margin-bottom:24px">Open vendor panels, license tools, and external services directly inside your admin panel.</div>
    ${portals.length ? `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;max-width:700px;margin:0 auto">
      ${portals.map(p=>`
      <button onclick="openPortal('${p.id}')"
        style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:20px 12px;border-radius:12px;background:var(--bg3);border:1px solid var(--border);cursor:pointer;transition:.2s"
        onmouseover="this.style.borderColor='var(--accent)';this.style.transform='translateY(-2px)'"
        onmouseout="this.style.borderColor='var(--border)';this.style.transform='none'">
        <span style="font-size:32px">${p.icon||'🌐'}</span>
        <div style="font-size:13px;font-weight:700;color:var(--text)">${p.name}</div>
        <div style="font-size:11px;color:var(--text3)">${p.category||'Portal'}</div>
        <span class="tag tp" style="font-size:10px">${new URL(p.url).hostname}</span>
      </button>`).join('')}
    </div>` : `<button class="btn btn-primary" onclick="openAddPortalModal()"><i class="fas fa-plus"></i>Add Your First Portal</button>`}
  </div>`}`;
}

function renderManageTab(portals) {
  const cats = [...new Set(portals.map(p=>p.category||'Other'))];
  return `
  <div class="card">
    <div class="card-hd">
      <div class="card-title"><i class="fas fa-globe" style="color:var(--accent)"></i>All Portals (${portals.length})</div>
      <button class="btn btn-primary btn-sm" onclick="openAddPortalModal()"><i class="fas fa-plus"></i>Add Portal</button>
    </div>
    ${portals.length ? `
    <div style="display:flex;flex-direction:column;gap:8px">
      ${portals.map(p=>`
      <div style="display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--bg3);border-radius:10px;border:1px solid var(--border);transition:.15s" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'">
        <div style="width:40px;height:40px;border-radius:10px;background:var(--bg2);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;border:1px solid var(--border)">${p.icon||'🌐'}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:14px;font-weight:700">${p.name}</div>
          <div style="font-size:11px;color:var(--text3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.url}</div>
          <div style="display:flex;align-items:center;gap:6px;margin-top:3px">
            <span class="tag tp" style="font-size:10px">${p.category||'Other'}</span>
            ${p.username?`<span style="font-size:11px;color:var(--text2)"><i class="fas fa-user" style="font-size:9px"></i> ${p.username}</span>`:''}
            ${p.pinned?'<span class="tag ty" style="font-size:10px"><i class="fas fa-thumbtack"></i> Pinned</span>':''}
          </div>
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0">
          <button class="btn btn-primary btn-sm" onclick="window._portalTab='browser';window._activePortal='${p.id}';navigate('portals')"><i class="fas fa-external-link-alt"></i>Open</button>
          <button class="btn btn-secondary btn-sm btn-icon" onclick="editPortal('${p.id}')"><i class="fas fa-edit"></i></button>
          <button class="btn btn-secondary btn-sm btn-icon" onclick="togglePinPortal('${p.id}')" title="${p.pinned?'Unpin':'Pin'}"><i class="fas fa-thumbtack" style="color:${p.pinned?'var(--yellow)':'var(--text3)'}"></i></button>
          <button class="btn btn-danger btn-sm btn-icon" onclick="deletePortal('${p.id}')"><i class="fas fa-trash"></i></button>
        </div>
      </div>`).join('')}
    </div>` : `
    <div class="es">
      <i class="fas fa-globe"></i>
      <p>No portals added yet.</p>
      <button class="btn btn-primary" style="margin-top:12px" onclick="openAddPortalModal()"><i class="fas fa-plus"></i>Add Your First Portal</button>
    </div>`}
  </div>

  <!-- SUGGESTED PORTALS -->
  <div class="card" style="margin-top:16px">
    <div class="card-hd"><div class="card-title"><i class="fas fa-lightbulb" style="color:var(--yellow)"></i>Suggested Portals</div></div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px">
      ${[
        {name:'Strapi CMS',url:'http://localhost:1337/admin',icon:'🗄️',cat:'CMS'},
        {name:'n8n Automation',url:'http://localhost:5678',icon:'🤖',cat:'Automation'},
        {name:'Razorpay Dashboard',url:'https://dashboard.razorpay.com',icon:'💳',cat:'Payment Gateway'},
        {name:'Interakt WhatsApp',url:'https://app.interakt.ai',icon:'💬',cat:'WhatsApp'},
        {name:'WATI Dashboard',url:'https://app.wati.io',icon:'📱',cat:'WhatsApp'},
        {name:'Google Analytics',url:'https://analytics.google.com',icon:'📊',cat:'Analytics'},
        {name:'Cloudflare',url:'https://dash.cloudflare.com',icon:'☁️',cat:'Hosting'},
        {name:'Netlify',url:'https://app.netlify.com',icon:'🚀',cat:'Hosting'},
      ].map(s=>`
      <button onclick="quickAddPortal('${s.name}','${s.url}','${s.icon}','${s.cat}')"
        style="display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:9px;background:var(--bg3);border:1px solid var(--border);cursor:pointer;text-align:left;transition:.15s"
        onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'">
        <span style="font-size:18px">${s.icon}</span>
        <div><div style="font-size:12px;font-weight:600;color:var(--text)">${s.name}</div><div style="font-size:10px;color:var(--text3)">${s.cat}</div></div>
        <i class="fas fa-plus" style="margin-left:auto;color:var(--text3);font-size:11px"></i>
      </button>`).join('')}
    </div>
  </div>`;
}

function renderCredentialsTab(portals) {
  return `
  <div style="background:rgba(245,158,11,.1);border:1px solid var(--yellow);border-radius:10px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:10px">
    <i class="fas fa-exclamation-triangle" style="color:var(--yellow)"></i>
    <span style="font-size:13px">Credentials are stored in browser localStorage. Do not use on shared computers.</span>
  </div>
  <div class="card">
    <div class="card-hd"><div class="card-title"><i class="fas fa-key" style="color:var(--accent)"></i>Saved Credentials</div></div>
    ${portals.filter(p=>p.username||p.password).length ? `
    <div class="tw"><table>
      <thead><tr><th>Portal</th><th>URL</th><th>Username</th><th>Password</th><th>Actions</th></tr></thead>
      <tbody>${portals.filter(p=>p.username||p.password).map(p=>`<tr>
        <td><div style="display:flex;align-items:center;gap:8px"><span style="font-size:16px">${p.icon||'🌐'}</span><strong>${p.name}</strong></div></td>
        <td style="font-size:11px;color:var(--text3)">${new URL(p.url).hostname}</td>
        <td>
          <div style="display:flex;align-items:center;gap:6px">
            <span style="font-size:13px">${p.username||'—'}</span>
            ${p.username?`<button class="btn btn-secondary btn-sm btn-icon" onclick="copyToClipboard('${p.username}','Username')"><i class="fas fa-copy"></i></button>`:''}
          </div>
        </td>
        <td>
          <div style="display:flex;align-items:center;gap:6px">
            <span id="pw-${p.id}" style="font-size:13px;font-family:monospace">••••••••</span>
            <button class="btn btn-secondary btn-sm btn-icon" onclick="toggleShowPw('${p.id}','${p.password||''}')"><i class="fas fa-eye"></i></button>
            ${p.password?`<button class="btn btn-secondary btn-sm btn-icon" onclick="copyToClipboard('${p.password}','Password')"><i class="fas fa-copy"></i></button>`:''}
          </div>
        </td>
        <td><div style="display:flex;gap:5px">
          <button class="btn btn-primary btn-sm" onclick="window._portalTab='browser';window._activePortal='${p.id}';navigate('portals')"><i class="fas fa-external-link-alt"></i>Open</button>
          <button class="btn btn-secondary btn-sm btn-icon" onclick="editPortal('${p.id}')"><i class="fas fa-edit"></i></button>
        </div></td>
      </tr>`).join('')}</tbody>
    </table></div>` : '<div class="es"><i class="fas fa-key"></i><p>No credentials saved yet. Add portals with login details.</p></div>'}
  </div>`;
}

// ── ACTIONS ──────────────────────────────────────────────────────────────────

window.openAddPortalModal = function() {
  document.getElementById('portal-modal-title').textContent = 'Add Portal';
  document.getElementById('portal-form').reset();
  document.getElementById('portal-id').value = '';
  openModal('portal-modal');
};

window.savePortal = function(e) {
  e.preventDefault();
  const f = new FormData(e.target);
  const id = f.get('id');
  const portal = {
    id: id || Date.now().toString(),
    name: f.get('name'), url: f.get('url'), category: f.get('category'),
    icon: f.get('icon') || '', username: f.get('username'), password: f.get('password'),
    notes: f.get('notes'), pinned: f.get('pinned') === 'on',
    openMode: f.get('openMode') || 'iframe',
    createdAt: id ? (JSON.parse(localStorage.getItem('dk_portals')||'[]').find(p=>p.id===id)?.createdAt||new Date().toISOString()) : new Date().toISOString()
  };
  const portals = JSON.parse(localStorage.getItem('dk_portals') || '[]');
  if (id) { const i = portals.findIndex(p=>p.id===id); if(i>-1) portals[i]=portal; window.toast('Portal updated!'); }
  else { portals.push(portal); window.toast('Portal added!'); }
  localStorage.setItem('dk_portals', JSON.stringify(portals));
  closeModal('portal-modal');
  window._portalTab = 'browser';
  window._activePortal = portal.id;
  navigate('portals');
};

window.editPortal = function(id) {
  const p = JSON.parse(localStorage.getItem('dk_portals')||'[]').find(x=>x.id===id);
  if (!p) return;
  document.getElementById('portal-modal-title').textContent = 'Edit Portal';
  const f = document.getElementById('portal-form');
  f.name.value = p.name; f.url.value = p.url; f.category.value = p.category||'License Panel';
  f.icon.value = p.icon||''; f.username.value = p.username||''; f.password.value = p.password||'';
  f.notes.value = p.notes||''; f.pinned.checked = p.pinned||false;
  document.getElementById('portal-id').value = p.id;
  openModal('portal-modal');
};

window.deletePortal = function(id) {
  if (!confirm('Delete this portal?')) return;
  localStorage.setItem('dk_portals', JSON.stringify(JSON.parse(localStorage.getItem('dk_portals')||'[]').filter(p=>p.id!==id)));
  if (window._activePortal === id) window._activePortal = null;
  window.toast('Portal deleted', 'e');
  navigate('portals');
};

window.openPortal = function(id) {
  const portals = JSON.parse(localStorage.getItem('dk_portals')||'[]');
  const p = portals.find(x=>x.id===id);
  if (!p) return;

  if (p.openMode === 'popup') {
    openPopupWindow(p.url, p.name, p.username, p.password);
    return;
  }
  if (p.openMode === 'tab') {
    if (p.username || p.password) {
      navigator.clipboard.writeText(`Username: ${p.username||''}\nPassword: ${p.password||''}`).catch(()=>{});
      window.toast('Credentials copied! Opening in new tab...', 's');
    }
    window.open(p.url, '_blank');
    return;
  }
  // Default: iframe mode
  window._portalTab = 'browser';
  window._activePortal = id;
  navigate('portals');
};

window.togglePinPortal = function(id) {
  const portals = JSON.parse(localStorage.getItem('dk_portals')||'[]');
  const p = portals.find(x=>x.id===id);
  if (p) { p.pinned = !p.pinned; localStorage.setItem('dk_portals', JSON.stringify(portals)); navigate('portals'); }
};

window.closePortalBrowser = function() {
  window._activePortal = null;
  navigate('portals');
};

window.toggleFullscreenPortal = function() {
  const frame = document.getElementById('portal-frame');
  if (!frame) return;
  if (!document.fullscreenElement) frame.requestFullscreen?.();
  else document.exitFullscreen?.();
};

window.navigatePortalTo = function(url) {
  const frame = document.getElementById('portal-frame');
  if (!frame) return;
  if (!url.startsWith('http')) url = 'https://' + url;
  frame.src = url;
  const bar = document.getElementById('portal-url-bar');
  if (bar) bar.value = url;
};

window.updatePortalUrlBar = function(frame) {
  try {
    const bar = document.getElementById('portal-url-bar');
    if (bar && frame.contentWindow?.location?.href) bar.value = frame.contentWindow.location.href;
  } catch {}
};

window.openInNewTab = function(url) {
  window.open(url, '_blank');
};

window.copyPortalCredentials = function(id) {
  const p = JSON.parse(localStorage.getItem('dk_portals')||'[]').find(x=>x.id===id);
  if (!p) return;
  const text = `Portal: ${p.name}\nURL: ${p.url}\nUsername: ${p.username||'—'}\nPassword: ${p.password||'—'}`;
  navigator.clipboard.writeText(text).then(() => window.toast('Credentials copied!', 's'));
};

window.copyToClipboard = function(text, label) {
  navigator.clipboard.writeText(text).then(() => window.toast(`${label} copied!`, 's'));
};

window.toggleShowPw = function(id, pw) {
  const el = document.getElementById('pw-'+id);
  if (!el) return;
  el.textContent = el.textContent === '••••••••' ? pw : '••••••••';
};

window.quickAddPortal = function(name, url, icon, category) {
  const portals = JSON.parse(localStorage.getItem('dk_portals')||'[]');
  if (portals.find(p=>p.url===url)) return window.toast('Portal already added', 'w');
  portals.push({ id: Date.now().toString(), name, url, icon, category, pinned: false, createdAt: new Date().toISOString() });
  localStorage.setItem('dk_portals', JSON.stringify(portals));
  window.toast(`${name} added!`, 's');
  navigate('portals');
};

window.updateFavicon = function(url) {
  // Auto-suggest favicon as icon
  try { new URL(url); } catch { return; }
};

// ── IFRAME BLOCK DETECTION ────────────────────────────────────────────────────

window.onPortalFrameLoad = function(frame, url) {
  updatePortalUrlBar(frame);
  // Try to detect if the page actually loaded or was blocked
  // We can't read cross-origin content, but we can check if the frame is empty
  setTimeout(() => {
    try {
      // If we can access contentDocument and it's empty/error, show blocked msg
      const doc = frame.contentDocument;
      if (doc && (doc.body === null || doc.body?.innerHTML === '')) {
        showPortalBlockedMsg(url);
      }
    } catch (e) {
      // Cross-origin access denied = page loaded (good!) OR blocked
      // We can't tell the difference, so just hide the blocked msg
      hidePortalBlockedMsg();
    }
  }, 2000);
};

window.showPortalBlockedMsg = function(url) {
  const msg = document.getElementById('portal-blocked-msg');
  const frame = document.getElementById('portal-frame');
  if (msg) { msg.style.display = 'flex'; }
  if (frame) frame.style.visibility = 'hidden';
};

window.hidePortalBlockedMsg = function() {
  const msg = document.getElementById('portal-blocked-msg');
  const frame = document.getElementById('portal-frame');
  if (msg) msg.style.display = 'none';
  if (frame) frame.style.visibility = 'visible';
};

window.retryPortalFrame = function(url) {
  hidePortalBlockedMsg();
  const frame = document.getElementById('portal-frame');
  if (frame) { frame.src = ''; setTimeout(() => { frame.src = url; }, 100); }
};

// Open in a floating popup window (best workaround for X-Frame-Options)
window.openPopupWindow = function(url, name, username, password) {
  // Copy credentials to clipboard first
  if (username || password) {
    const creds = `Username: ${username}\nPassword: ${password}`;
    navigator.clipboard.writeText(creds).then(() => {
      window.toast('Credentials copied to clipboard! Paste them in the popup.', 's');
    }).catch(() => {});
  }

  // Calculate popup position (centered, large)
  const w = Math.min(1200, screen.width - 100);
  const h = Math.min(800, screen.height - 100);
  const left = (screen.width - w) / 2;
  const top = (screen.height - h) / 2;

  const popup = window.open(
    url,
    name || 'Portal',
    `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes,toolbar=yes,menubar=no,location=yes,status=yes`
  );

  if (!popup || popup.closed) {
    window.toast('Popup was blocked by browser. Allow popups for this site.', 'e');
    // Fallback: open in new tab
    window.open(url, '_blank');
  } else {
    window.toast(`${name||'Portal'} opened in popup window`, 's');
    // Watch for popup close
    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        window.toast('Portal window closed', 'i');
      }
    }, 1000);
  }
};
