// ===== DIGIPROFILE ADMIN MODULE =====
// SuperProfile / Linktree-style creator profile pages

window._dpTab = window._dpTab || 'profiles';
window._dpEditing = window._dpEditing || null;
window._dpState = window._dpState || {};

// ── MAIN RENDER ──────────────────────────────────────────────────────────────
window.renderDigiProfile = async function () {
  if (window._dpEditing) {
    return renderDPEditor(window._dpEditing)
  }

  const tab = window._dpTab
  const el = document.getElementById('page')
  if (!el) return ''

  el.innerHTML = `
  <div class="ph">
    <div>
      <div class="ph-title"><i class="fas fa-id-card" style="color:var(--accent)"></i> DigiProfile</div>
      <div class="ph-sub">Creator link-in-bio pages · SuperProfile style</div>
    </div>
    <div class="ph-actions">
      <button class="btn btn-primary" onclick="dpOpenCreate()"><i class="fas fa-plus"></i>New Profile</button>
    </div>
  </div>

  <div class="tabs" style="margin-bottom:16px">
    ${[['profiles','Profiles','fa-id-card'],['analytics','Analytics','fa-chart-line'],['settings','Settings','fa-cog']].map(([id,lb,ic])=>
      `<button class="tab ${tab===id?'on':''}" onclick="window._dpTab='${id}';renderDigiProfile()">
        <i class="fas ${ic}"></i> ${lb}
      </button>`
    ).join('')}
  </div>

  <div id="dp-tab-content"><div class="es"><i class="fas fa-spinner fa-spin"></i><p>Loading...</p></div></div>`

  if (tab === 'profiles') await dpRenderProfiles()
  else if (tab === 'analytics') dpRenderAnalytics()
  else if (tab === 'settings') dpRenderSettings()

  return ''
}

// ── PROFILES TAB ─────────────────────────────────────────────────────────────
async function dpRenderProfiles() {
  const tc = document.getElementById('dp-tab-content');
  let profiles = [];
  try { const r = await AdminAPI.getDigiProfiles(); profiles = r.data || r || []; } catch(e) { profiles = []; }

  const kycBadge = (s) => {
    const map = { verified:'tg', pending:'ty', rejected:'tr' };
    return `<span class="tag ${map[s]||'tb'}" style="font-size:10px"><i class="fas fa-${s==='verified'?'check-circle':s==='rejected'?'times-circle':'clock'}"></i> KYC: ${s||'none'}</span>`;
  };

  tc.innerHTML = `
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px">
    ${profiles.map(p => `
    <div class="card" style="transition:.2s;position:relative" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'">
      <!-- Cover -->
      <div style="height:80px;border-radius:10px 10px 0 0;margin:-16px -16px 0;overflow:hidden;background:${p.theme_color||'var(--accent)'}22;position:relative">
        ${p.cover_image ? `<img src="${p.cover_image}" style="width:100%;height:100%;object-fit:cover">` : `<div style="width:100%;height:100%;background:linear-gradient(135deg,${p.theme_color||'#6366f1'}44,${p.theme_color||'#6366f1'}22)"></div>`}
      </div>
      <!-- Avatar -->
      <div style="margin-top:-28px;margin-bottom:8px;position:relative;z-index:1">
        <img src="${p.avatar||'https://ui-avatars.com/api/?name='+encodeURIComponent(p.display_name||p.username||'?')+'&background=6366f1&color=fff'}"
          style="width:56px;height:56px;border-radius:50%;border:3px solid var(--bg2);object-fit:cover">
      </div>
      <div style="font-size:15px;font-weight:700">${p.display_name||p.username}</div>
      <div style="font-size:12px;color:var(--text3);margin-bottom:8px">@${p.username}</div>
      <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px">
        ${p.category ? `<span class="tag tb" style="font-size:10px">${p.category}</span>` : ''}
        ${kycBadge(p.kyc_status)}
        ${p.payment_enabled ? `<span class="tag tg" style="font-size:10px"><i class="fas fa-rupee-sign"></i> Razorpay</span>` : ''}
        ${p.instagram_username ? `<span class="tag tp" style="font-size:10px"><i class="fab fa-instagram"></i> IG</span>` : ''}
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <button class="btn btn-primary btn-sm" onclick="dpEdit('${p.id||p._id}')"><i class="fas fa-edit"></i>Edit</button>
        <button class="btn btn-secondary btn-sm" onclick="dpCopyLink('${p.username}')"><i class="fas fa-link"></i>Copy Link</button>
        <a href="http://localhost:3001/p/${p.username}" target="_blank" class="btn btn-secondary btn-sm"><i class="fas fa-eye"></i>View</a>
        <button class="btn btn-danger btn-sm btn-icon" onclick="dpDelete('${p.id||p._id}')"><i class="fas fa-trash"></i></button>
      </div>
    </div>`).join('')}
    <!-- ADD NEW -->
    <div class="card" style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:200px;cursor:pointer;border-style:dashed;transition:.2s"
      onclick="dpOpenCreate()" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'">
      <i class="fas fa-plus" style="font-size:32px;color:var(--text3);margin-bottom:10px"></i>
      <div style="font-size:14px;color:var(--text2);font-weight:600">Create New DigiProfile</div>
    </div>
  </div>`;
}

// ── ANALYTICS TAB ─────────────────────────────────────────────────────────────
function dpRenderAnalytics() {
  const tc = document.getElementById('dp-tab-content');
  tc.innerHTML = `
  <div class="g2" style="margin-bottom:16px">
    ${[['Total Views','fa-eye','var(--blue)','dpAnalyticsViews'],['Total Clicks','fa-mouse-pointer','var(--green)','dpAnalyticsClicks'],
       ['Profiles','fa-id-card','var(--accent)','dpAnalyticsProfiles'],['Avg CTR','fa-percent','var(--yellow)','dpAnalyticsCTR']].map(([lb,ic,cl,id])=>`
    <div class="card" style="display:flex;align-items:center;gap:14px">
      <div style="width:44px;height:44px;border-radius:12px;background:${cl}22;display:flex;align-items:center;justify-content:center">
        <i class="fas ${ic}" style="color:${cl};font-size:18px"></i>
      </div>
      <div><div style="font-size:22px;font-weight:700" id="${id}">—</div><div style="font-size:12px;color:var(--text3)">${lb}</div></div>
    </div>`).join('')}
  </div>

  <div class="g2" style="align-items:start">
    <div class="card">
      <div class="card-hd"><div class="card-title"><i class="fas fa-link" style="color:var(--accent)"></i>Top Links</div></div>
      <div id="dp-top-links"><div class="es" style="padding:20px"><i class="fas fa-spinner fa-spin"></i></div></div>
    </div>
    <div class="card">
      <div class="card-hd"><div class="card-title"><i class="fas fa-chart-bar" style="color:var(--blue)"></i>Views by Profile</div></div>
      <div id="dp-views-chart"><div class="es" style="padding:20px"><i class="fas fa-spinner fa-spin"></i></div></div>
    </div>
  </div>`;

  // Load analytics async
  AdminAPI.getDigiProfiles().then(r => {
    const profiles = r.data || r || [];
    const totalViews = profiles.reduce((s,p)=>s+(p.total_views||0),0);
    const totalClicks = profiles.reduce((s,p)=>s+(p.total_clicks||0),0);
    const ctr = totalViews > 0 ? ((totalClicks/totalViews)*100).toFixed(1)+'%' : '0%';
    document.getElementById('dpAnalyticsViews').textContent = totalViews.toLocaleString();
    document.getElementById('dpAnalyticsClicks').textContent = totalClicks.toLocaleString();
    document.getElementById('dpAnalyticsProfiles').textContent = profiles.length;
    document.getElementById('dpAnalyticsCTR').textContent = ctr;

    // Top links
    const allLinks = profiles.flatMap(p=>(p.links||[]).map(l=>({...l,profile:p.username})));
    allLinks.sort((a,b)=>(b.clicks||0)-(a.clicks||0));
    document.getElementById('dp-top-links').innerHTML = allLinks.slice(0,8).map(l=>`
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${l.title||l.url}</div>
          <div style="font-size:11px;color:var(--text3)">@${l.profile}</div>
        </div>
        <span class="tag tb">${l.clicks||0} clicks</span>
      </div>`).join('') || '<div style="color:var(--text3);font-size:13px;padding:10px">No link data yet</div>';

    // Views by profile
    document.getElementById('dp-views-chart').innerHTML = profiles.slice(0,8).map(p=>`
      <div style="display:flex;align-items:center;gap:10px;padding:6px 0">
        <div style="font-size:13px;width:120px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">@${p.username}</div>
        <div style="flex:1;background:var(--bg3);border-radius:4px;height:8px;overflow:hidden">
          <div style="height:100%;background:var(--accent);border-radius:4px;width:${totalViews>0?Math.round(((p.total_views||0)/totalViews)*100):0}%"></div>
        </div>
        <div style="font-size:12px;color:var(--text3);width:40px;text-align:right">${p.total_views||0}</div>
      </div>`).join('') || '<div style="color:var(--text3);font-size:13px;padding:10px">No data yet</div>';
  }).catch(()=>{});
}

// ── SETTINGS TAB ─────────────────────────────────────────────────────────────
function dpRenderSettings() {
  const tc = document.getElementById('dp-tab-content');
  tc.innerHTML = `
  <div style="max-width:600px">
    <div class="card" style="margin-bottom:14px">
      <div class="card-hd"><div class="card-title"><i class="fas fa-globe" style="color:var(--accent)"></i>Global DigiProfile Settings</div></div>
      <div class="fgrid">
        <div class="fg cs2"><label class="fl">Custom Domain (e.g. links.yourbrand.com)</label>
          <input class="fc" id="dp-custom-domain" placeholder="links.yourbrand.com" value="${localStorage.getItem('dp_custom_domain')||''}">
        </div>
        <div class="fg cs2"><label class="fl">Default Profile URL Base</label>
          <input class="fc" value="http://localhost:3001/p/" readonly style="opacity:.6">
        </div>
        <div class="fg cs2">
          <label class="fl">DigiKraft Branding</label>
          <div style="display:flex;align-items:center;gap:10px;margin-top:4px">
            <label class="tgl"><input type="checkbox" id="dp-show-branding" ${localStorage.getItem('dp_show_branding')!=='false'?'checked':''}><span class="tgs"></span></label>
            <span style="font-size:13px">Show "Powered by DigiKraft" on all profiles</span>
          </div>
        </div>
        <div class="fg cs2"><label class="fl">Default Theme Style</label>
          <select class="fc" id="dp-default-theme">
            ${['minimal','gradient','dark','neon','glass'].map(t=>`<option value="${t}" ${localStorage.getItem('dp_default_theme')===t?'selected':''}>${t.charAt(0).toUpperCase()+t.slice(1)}</option>`).join('')}
          </select>
        </div>
      </div>
      <button class="btn btn-primary" style="margin-top:14px" onclick="dpSaveSettings()"><i class="fas fa-save"></i>Save Settings</button>
    </div>

    <div class="card">
      <div class="card-hd"><div class="card-title"><i class="fas fa-info-circle" style="color:var(--blue)"></i>DigiProfile Info</div></div>
      <div style="font-size:13px;color:var(--text2);line-height:1.7">
        <p>DigiProfile is a SuperProfile/Linktree-style creator page system built into DigiKraft.</p>
        <p>Each profile gets a public URL: <code style="background:var(--bg3);padding:2px 6px;border-radius:4px">http://localhost:3001/p/[username]</code></p>
        <p>Profiles support: custom links, social media, DigiKraft products, Razorpay donations, Instagram feed, KYC verification, and automation.</p>
      </div>
    </div>
  </div>`;
}

window.dpSaveSettings = function() {
  localStorage.setItem('dp_custom_domain', document.getElementById('dp-custom-domain')?.value||'');
  localStorage.setItem('dp_show_branding', document.getElementById('dp-show-branding')?.checked?'true':'false');
  localStorage.setItem('dp_default_theme', document.getElementById('dp-default-theme')?.value||'minimal');
  toast('Settings saved', 's');
};

// ── EDITOR ───────────────────────────────────────────────────────────────────
async function renderDPEditor(id) {
  const el = document.getElementById('page')
  if (!el) return ''

  let p = { id:'new', links:[], social:{}, products:[], donation_amounts:[49,99,199,499], kyc_documents:[], keyword_triggers:[], theme_color:'#6366f1', theme_style:'minimal', category:'creator' };
  if (id !== 'new') {
    try { const r = await AdminAPI.getDigiProfile(id); p = { ...p, ...(r.data||r) }; } catch(e) {}
  }

  const editorTabs = ['basic','theme','links','products','social','razorpay','instagram','automation','kyc','seo'];
  window._dpEditTab = window._dpEditTab || 'basic';

  el.innerHTML = `
  <div class="ph">
    <div style="display:flex;align-items:center;gap:10px">
      <button class="btn btn-secondary btn-sm" onclick="window._dpEditing=null;window._dpEditTab='basic';renderDigiProfile()"><i class="fas fa-arrow-left"></i>Back</button>
      <div>
        <div class="ph-title">${id==='new'?'New DigiProfile':('@'+(p.username||'profile'))}</div>
        <div class="ph-sub">Creator link-in-bio page</div>
      </div>
    </div>
    <div class="ph-actions">
      ${id!=='new'?`<button class="btn btn-secondary" onclick="dpCopyLink('${p.username}')"><i class="fas fa-link"></i>Copy Link</button>
      <a href="http://localhost:3001/p/${p.username}" target="_blank" class="btn btn-secondary"><i class="fas fa-eye"></i>Preview</a>`:''}
      <button class="btn btn-primary" onclick="dpSaveEditor()"><i class="fas fa-save"></i>Save Profile</button>
    </div>
  </div>

  <div style="display:flex;gap:16px;align-items:start">
    <!-- LEFT: EDITOR TABS -->
    <div style="flex:1;min-width:0">
      <div class="tabs" style="margin-bottom:14px;flex-wrap:wrap">
        ${editorTabs.map(t=>`<button class="tab ${window._dpEditTab===t?'on':''}" onclick="window._dpEditTab='${t}';dpRefreshEditorTabs()">${dpTabLabel(t)}</button>`).join('')}
      </div>
      <div id="dp-editor-panel">${dpRenderEditorPanel(p, window._dpEditTab)}</div>
    </div>

    <!-- RIGHT: LIVE PREVIEW -->
    <div style="width:280px;flex-shrink:0;position:sticky;top:80px">
      <div class="card">
        <div class="card-hd"><div class="card-title"><i class="fas fa-mobile-alt" style="color:var(--accent)"></i>Live Preview</div></div>
        <div id="dp-preview" style="border-radius:12px;overflow:hidden;border:1px solid var(--border)">
          ${dpRenderPreview(p)}
        </div>
        <button class="btn btn-secondary" style="width:100%;margin-top:10px" onclick="dpRefreshPreview()">
          <i class="fas fa-sync"></i>Refresh Preview
        </button>
      </div>
    </div>
  </div>`;

  // Store current profile data for preview
  window._dpCurrentProfile = p;
}

function dpTabLabel(t) {
  const labels = { basic:'Basic', theme:'Theme', links:'Links', products:'Products', social:'Social', razorpay:'Razorpay', instagram:'Instagram', automation:'Automation', kyc:'KYC', seo:'SEO' };
  return labels[t] || t;
}

window.dpRefreshEditorTabs = function() {
  const panel = document.getElementById('dp-editor-panel');
  if (panel) panel.innerHTML = dpRenderEditorPanel(window._dpCurrentProfile||{}, window._dpEditTab);
};

window.dpRefreshPreview = function() {
  const preview = document.getElementById('dp-preview');
  if (preview) preview.innerHTML = dpRenderPreview(window._dpCurrentProfile||{});
};

function dpRenderEditorPanel(p, tab) {
  if (tab === 'basic') return dpPanelBasic(p);
  if (tab === 'theme') return dpPanelTheme(p);
  if (tab === 'links') return dpPanelLinks(p);
  if (tab === 'products') return dpPanelProducts(p);
  if (tab === 'social') return dpPanelSocial(p);
  if (tab === 'razorpay') return dpPanelRazorpay(p);
  if (tab === 'instagram') return dpPanelInstagram(p);
  if (tab === 'automation') return dpPanelAutomation(p);
  if (tab === 'kyc') return dpPanelKYC(p);
  if (tab === 'seo') return dpPanelSEO(p);
  return '';
}

// ── PANEL: BASIC ─────────────────────────────────────────────────────────────
function dpPanelBasic(p) {
  return `
  <div class="card">
    <div class="card-hd"><div class="card-title"><i class="fas fa-user" style="color:var(--accent)"></i>Basic Info</div></div>
    <div class="fgrid">
      <div class="fg">
        <label class="fl">Username *</label>
        <div style="display:flex;gap:6px;align-items:center">
          <input class="fc" id="dp-username" value="${p.username||''}" placeholder="yourname" oninput="dpCheckUsername(this.value)">
          <span id="dp-username-status" style="font-size:12px;white-space:nowrap"></span>
        </div>
        <div style="font-size:11px;color:var(--text3);margin-top:3px">localhost:3001/p/<b>${p.username||'yourname'}</b></div>
      </div>
      <div class="fg">
        <label class="fl">Display Name</label>
        <input class="fc" id="dp-display-name" value="${p.display_name||''}" placeholder="Your Name">
      </div>
      <div class="fg cs2">
        <label class="fl">Bio</label>
        <textarea class="fc" id="dp-bio" rows="3" placeholder="Tell your audience about yourself...">${p.bio||''}</textarea>
      </div>
      <div class="fg">
        <label class="fl">Avatar URL</label>
        <input class="fc" id="dp-avatar" value="${p.avatar||''}" placeholder="https://...">
      </div>
      <div class="fg">
        <label class="fl">Cover Image URL</label>
        <input class="fc" id="dp-cover-image" value="${p.cover_image||''}" placeholder="https://...">
      </div>
      <div class="fg cs2">
        <label class="fl">Category</label>
        <select class="fc" id="dp-category">
          ${['creator','business','artist','influencer','freelancer'].map(c=>`<option value="${c}" ${p.category===c?'selected':''}>${c.charAt(0).toUpperCase()+c.slice(1)}</option>`).join('')}
        </select>
      </div>
    </div>
  </div>`;
}

// ── PANEL: THEME ─────────────────────────────────────────────────────────────
function dpPanelTheme(p) {
  return `
  <div class="card">
    <div class="card-hd"><div class="card-title"><i class="fas fa-palette" style="color:var(--accent)"></i>Theme</div></div>
    <div class="fgrid">
      <div class="fg">
        <label class="fl">Theme Color</label>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="color" id="dp-theme-color" value="${p.theme_color||'#6366f1'}" style="width:44px;height:36px;border:none;border-radius:8px;cursor:pointer;background:none">
          <input class="fc" id="dp-theme-color-hex" value="${p.theme_color||'#6366f1'}" placeholder="#6366f1" style="flex:1" oninput="document.getElementById('dp-theme-color').value=this.value">
        </div>
      </div>
      <div class="fg">
        <label class="fl">Theme Style</label>
        <select class="fc" id="dp-theme-style">
          ${['minimal','gradient','dark','neon','glass'].map(s=>`<option value="${s}" ${p.theme_style===s?'selected':''}>${s.charAt(0).toUpperCase()+s.slice(1)}</option>`).join('')}
        </select>
      </div>
    </div>
    <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">
      ${['#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ef4444','#14b8a6'].map(c=>`
      <div onclick="document.getElementById('dp-theme-color').value='${c}';document.getElementById('dp-theme-color-hex').value='${c}'"
        style="width:32px;height:32px;border-radius:8px;background:${c};cursor:pointer;border:2px solid ${p.theme_color===c?'var(--text1)':'transparent'};transition:.2s"></div>`).join('')}
    </div>
    <div style="margin-top:14px;padding:14px;border-radius:10px;background:var(--bg3)">
      <div style="font-size:12px;color:var(--text3);margin-bottom:8px">Theme Preview</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${['minimal','gradient','dark','neon','glass'].map(s=>`
        <div style="padding:6px 12px;border-radius:20px;font-size:12px;cursor:pointer;
          background:${s==='dark'?'#1a1a2e':s==='neon'?'#0d0d0d':s==='glass'?'rgba(255,255,255,.1)':s==='gradient'?'linear-gradient(135deg,#6366f1,#ec4899)':'var(--bg2)'};
          color:${s==='dark'||s==='neon'?'#fff':'var(--text1)'};
          border:1px solid ${s==='glass'?'rgba(255,255,255,.2)':'var(--border)'}"
          onclick="document.getElementById('dp-theme-style').value='${s}'">${s}</div>`).join('')}
      </div>
    </div>
  </div>`;
}

// ── PANEL: LINKS ─────────────────────────────────────────────────────────────
function dpPanelLinks(p) {
  const links = p.links || [];
  return `
  <div class="card">
    <div class="card-hd">
      <div class="card-title"><i class="fas fa-link" style="color:var(--accent)"></i>Links</div>
      <button class="btn btn-primary btn-sm" onclick="dpAddLink()"><i class="fas fa-plus"></i>Add Link</button>
    </div>
    <div id="dp-links-list" style="display:flex;flex-direction:column;gap:8px">
      ${links.length === 0 ? `<div style="text-align:center;padding:20px;color:var(--text3);font-size:13px">No links yet. Add your first link!</div>` : ''}
      ${links.map((l,i)=>`
      <div style="background:var(--bg3);border-radius:10px;padding:12px" id="dp-link-${i}">
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
          <i class="fas fa-grip-vertical" style="color:var(--text3);cursor:grab"></i>
          <input class="fc" placeholder="Link Title" value="${l.title||''}" style="flex:1" oninput="dpUpdateLink(${i},'title',this.value)">
          <label class="tgl" title="Enabled"><input type="checkbox" ${l.enabled!==false?'checked':''} onchange="dpUpdateLink(${i},'enabled',this.checked)"><span class="tgs"></span></label>
          <button class="btn btn-danger btn-sm btn-icon" onclick="dpRemoveLink(${i})"><i class="fas fa-times"></i></button>
        </div>
        <div style="display:flex;gap:8px">
          <input class="fc" placeholder="https://..." value="${l.url||''}" style="flex:2" oninput="dpUpdateLink(${i},'url',this.value)">
          <input class="fc" placeholder="Icon (fa-globe)" value="${l.icon||''}" style="flex:1" oninput="dpUpdateLink(${i},'icon',this.value)">
        </div>
        <div style="display:flex;align-items:center;gap:6px;margin-top:6px;font-size:11px;color:var(--text3)">
          <i class="fas fa-mouse-pointer"></i> ${l.clicks||0} clicks
          <label style="display:flex;align-items:center;gap:4px;margin-left:8px">
            <input type="checkbox" ${l.track_clicks!==false?'checked':''} onchange="dpUpdateLink(${i},'track_clicks',this.checked)"> Track clicks
          </label>
        </div>
      </div>`).join('')}
    </div>
  </div>`;
}

// ── PANEL: PRODUCTS ───────────────────────────────────────────────────────────
function dpPanelProducts(p) {
  const linked = p.products || [];
  return `
  <div class="card">
    <div class="card-hd"><div class="card-title"><i class="fas fa-box" style="color:var(--accent)"></i>Linked DigiKraft Products</div></div>
    <div style="font-size:13px;color:var(--text3);margin-bottom:12px">Link your DigiKraft products to show them on your profile page.</div>
    <div class="fg" style="margin-bottom:12px">
      <label class="fl">Add Product by ID or Slug</label>
      <div style="display:flex;gap:8px">
        <input class="fc" id="dp-product-input" placeholder="product-slug or ID" style="flex:1">
        <button class="btn btn-primary btn-sm" onclick="dpAddProduct()"><i class="fas fa-plus"></i>Add</button>
      </div>
    </div>
    <div id="dp-products-list" style="display:flex;flex-direction:column;gap:6px">
      ${linked.map((prod,i)=>`
      <div style="display:flex;align-items:center;gap:10px;background:var(--bg3);border-radius:8px;padding:10px">
        <i class="fas fa-box" style="color:var(--accent)"></i>
        <div style="flex:1;font-size:13px">${typeof prod==='object'?(prod.name||prod.slug||prod.id):prod}</div>
        <button class="btn btn-danger btn-sm btn-icon" onclick="dpRemoveProduct(${i})"><i class="fas fa-times"></i></button>
      </div>`).join('')}
      ${linked.length===0?`<div style="text-align:center;padding:20px;color:var(--text3);font-size:13px">No products linked yet.</div>`:''}
    </div>
  </div>`;
}

// ── PANEL: SOCIAL ─────────────────────────────────────────────────────────────
function dpPanelSocial(p) {
  const s = p.social || {};
  const socials = [
    ['instagram','Instagram','fab fa-instagram','#e1306c'],
    ['youtube','YouTube','fab fa-youtube','#ff0000'],
    ['twitter','Twitter / X','fab fa-twitter','#1da1f2'],
    ['linkedin','LinkedIn','fab fa-linkedin','#0077b5'],
    ['whatsapp','WhatsApp','fab fa-whatsapp','#25d366'],
    ['telegram','Telegram','fab fa-telegram','#0088cc'],
    ['facebook','Facebook','fab fa-facebook','#1877f2'],
    ['tiktok','TikTok','fab fa-tiktok','#000000'],
  ];
  return `
  <div class="card">
    <div class="card-hd"><div class="card-title"><i class="fas fa-share-alt" style="color:var(--accent)"></i>Social Links</div></div>
    <div class="fgrid">
      ${socials.map(([key,label,icon,color])=>`
      <div class="fg">
        <label class="fl"><i class="${icon}" style="color:${color}"></i> ${label}</label>
        <input class="fc" id="dp-social-${key}" value="${s[key]||''}" placeholder="${key==='whatsapp'?'+91XXXXXXXXXX':'https://...'}">
      </div>`).join('')}
    </div>
  </div>`;
}

// ── PANEL: RAZORPAY ───────────────────────────────────────────────────────────
function dpPanelRazorpay(p) {
  const amounts = p.donation_amounts || [49,99,199,499];
  return `
  <div class="card">
    <div class="card-hd">
      <div class="card-title"><i class="fas fa-rupee-sign" style="color:var(--green)"></i>Razorpay & Payments</div>
      <span class="tag ${p.payment_enabled?'tg':'ty'}">${p.payment_enabled?'Connected':'Not Connected'}</span>
    </div>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
      <label class="tgl"><input type="checkbox" id="dp-payment-enabled" ${p.payment_enabled?'checked':''}><span class="tgs"></span></label>
      <span style="font-size:13px">Enable Razorpay Payments</span>
    </div>
    <div class="fgrid">
      <div class="fg">
        <label class="fl">Razorpay Key ID</label>
        <input class="fc" id="dp-rzp-key-id" value="${p.key_id||''}" placeholder="rzp_live_...">
      </div>
      <div class="fg">
        <label class="fl">Razorpay Key Secret</label>
        <input class="fc" id="dp-rzp-key-secret" type="password" value="${p.key_secret||''}" placeholder="••••••••••••••••">
      </div>
      <div class="fg cs2">
        <label class="fl">UPI ID</label>
        <input class="fc" id="dp-upi-id" value="${p.upi_id||''}" placeholder="yourname@upi">
      </div>
    </div>
    <div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--border)">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        <label class="tgl"><input type="checkbox" id="dp-accept-donations" ${p.accept_donations?'checked':''}><span class="tgs"></span></label>
        <span style="font-size:13px;font-weight:600">Accept Donations</span>
      </div>
      <div class="fg">
        <label class="fl">Donation Amounts (₹) — comma separated</label>
        <input class="fc" id="dp-donation-amounts" value="${amounts.join(',')}" placeholder="49,99,199,499">
      </div>
    </div>
  </div>`;
}

// ── PANEL: INSTAGRAM / META ───────────────────────────────────────────────────
function dpPanelInstagram(p) {
  return `
  <div class="card">
    <div class="card-hd">
      <div class="card-title"><i class="fab fa-instagram" style="color:#e1306c"></i>Instagram & Meta API</div>
      <span class="tag ${p.instagram_username?'tg':'ty'}">${p.instagram_username?'Connected':'Not Connected'}</span>
    </div>
    <div class="fgrid">
      <div class="fg">
        <label class="fl">Instagram Username</label>
        <input class="fc" id="dp-ig-username" value="${p.instagram_username||''}" placeholder="@yourhandle">
      </div>
      <div class="fg">
        <label class="fl">Instagram Access Token</label>
        <input class="fc" id="dp-ig-token" type="password" value="${p.instagram_access_token||''}" placeholder="IGQV...">
      </div>
      <div class="fg">
        <label class="fl">Instagram App ID</label>
        <input class="fc" id="dp-ig-app-id" value="${p.instagram_app_id||''}" placeholder="123456789">
      </div>
      <div class="fg">
        <label class="fl">Instagram App Secret</label>
        <input class="fc" id="dp-ig-app-secret" type="password" value="${p.instagram_app_secret||''}" placeholder="••••••••••••••••">
      </div>
      <div class="fg">
        <label class="fl">Meta Pixel ID</label>
        <input class="fc" id="dp-meta-pixel" value="${p.meta_pixel_id||''}" placeholder="123456789012345">
      </div>
      <div class="fg">
        <label class="fl">Meta Access Token</label>
        <input class="fc" id="dp-meta-token" type="password" value="${p.meta_access_token||''}" placeholder="EAABs...">
      </div>
    </div>
  </div>`;
}

// ── PANEL: AUTOMATION ─────────────────────────────────────────────────────────
function dpPanelAutomation(p) {
  const triggers = p.keyword_triggers || [];
  return `
  <div class="card">
    <div class="card-hd"><div class="card-title"><i class="fas fa-robot" style="color:var(--purple)"></i>Automation</div></div>
    <div style="display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;align-items:center;gap:10px">
        <label class="tgl"><input type="checkbox" id="dp-automation-enabled" ${p.automation_enabled?'checked':''}><span class="tgs"></span></label>
        <span style="font-size:13px;font-weight:600">Enable Automation</span>
      </div>
      <div style="padding:14px;background:var(--bg3);border-radius:10px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
          <label class="tgl"><input type="checkbox" id="dp-auto-dm-enabled" ${p.auto_dm_enabled?'checked':''}><span class="tgs"></span></label>
          <span style="font-size:13px;font-weight:600">Auto DM</span>
        </div>
        <div class="fg">
          <label class="fl">Auto DM Message</label>
          <textarea class="fc" id="dp-auto-dm-message" rows="3" placeholder="Hey! Thanks for reaching out. Here's my link: ...">${p.auto_dm_message||''}</textarea>
        </div>
      </div>
      <div style="padding:14px;background:var(--bg3);border-radius:10px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
          <label class="tgl"><input type="checkbox" id="dp-auto-reply-enabled" ${p.auto_reply_enabled?'checked':''}><span class="tgs"></span></label>
          <span style="font-size:13px;font-weight:600">Auto Reply on Comments</span>
        </div>
        <div class="fg">
          <label class="fl">Keyword Triggers (one per line)</label>
          <textarea class="fc" id="dp-keyword-triggers" rows="4" placeholder="link\nprice\nbuy\ninfo">${triggers.join('\n')}</textarea>
        </div>
      </div>
    </div>
  </div>`;
}

// ── PANEL: KYC ────────────────────────────────────────────────────────────────
function dpPanelKYC(p) {
  const kycColors = { verified:'var(--green)', pending:'var(--yellow)', rejected:'var(--red)' };
  const kycIcons = { verified:'check-circle', pending:'clock', rejected:'times-circle' };
  const status = p.kyc_status || 'pending';
  return `
  <div class="card">
    <div class="card-hd">
      <div class="card-title"><i class="fas fa-id-badge" style="color:var(--blue)"></i>KYC Verification</div>
      <span style="display:flex;align-items:center;gap:6px;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:600;background:${kycColors[status]}22;color:${kycColors[status]}">
        <i class="fas fa-${kycIcons[status]}"></i>${status.toUpperCase()}
      </span>
    </div>
    <div class="fg" style="margin-bottom:14px">
      <label class="fl">KYC Status</label>
      <select class="fc" id="dp-kyc-status">
        <option value="pending" ${status==='pending'?'selected':''}>Pending</option>
        <option value="verified" ${status==='verified'?'selected':''}>Verified</option>
        <option value="rejected" ${status==='rejected'?'selected':''}>Rejected</option>
      </select>
    </div>
    <div class="fgrid">
      <div class="fg">
        <label class="fl">PAN Number</label>
        <input class="fc" id="dp-kyc-pan" value="${p.kyc_pan||''}" placeholder="ABCDE1234F">
      </div>
      <div class="fg">
        <label class="fl">Aadhaar Number</label>
        <input class="fc" id="dp-kyc-aadhaar" value="${p.kyc_aadhaar||''}" placeholder="XXXX XXXX XXXX">
      </div>
      <div class="fg">
        <label class="fl">GST Number</label>
        <input class="fc" id="dp-kyc-gst" value="${p.kyc_gst||''}" placeholder="22AAAAA0000A1Z5">
      </div>
      <div class="fg">
        <label class="fl">Bank Account Number</label>
        <input class="fc" id="dp-kyc-bank" value="${p.kyc_bank_account||''}" placeholder="XXXXXXXXXX">
      </div>
      <div class="fg cs2">
        <label class="fl">IFSC Code</label>
        <input class="fc" id="dp-kyc-ifsc" value="${p.kyc_ifsc||''}" placeholder="SBIN0001234">
      </div>
    </div>
    <div class="fg" style="margin-top:10px">
      <label class="fl">KYC Documents (URLs, one per line)</label>
      <textarea class="fc" id="dp-kyc-docs" rows="3" placeholder="https://... (PAN card image)&#10;https://... (Aadhaar image)">${(p.kyc_documents||[]).join('\n')}</textarea>
    </div>
  </div>`;
}

// ── PANEL: SEO ────────────────────────────────────────────────────────────────
function dpPanelSEO(p) {
  return `
  <div class="card">
    <div class="card-hd"><div class="card-title"><i class="fas fa-search" style="color:var(--blue)"></i>SEO</div></div>
    <div class="fg">
      <label class="fl">SEO Title</label>
      <input class="fc" id="dp-seo-title" value="${p.seo_title||''}" placeholder="${p.display_name||p.username||'Profile'} | DigiKraft">
    </div>
    <div class="fg" style="margin-top:10px">
      <label class="fl">SEO Description</label>
      <textarea class="fc" id="dp-seo-desc" rows="3" placeholder="Describe this profile for search engines...">${p.seo_desc||''}</textarea>
    </div>
    <div style="margin-top:14px;padding:14px;background:var(--bg3);border-radius:10px">
      <div style="font-size:11px;color:var(--text3);margin-bottom:6px">Google Preview</div>
      <div style="font-size:18px;color:#1a0dab;font-weight:400" id="dp-seo-preview-title">${p.seo_title||p.display_name||'Profile'} | DigiKraft</div>
      <div style="font-size:13px;color:#006621">localhost:3001/p/${p.username||'username'}</div>
      <div style="font-size:13px;color:#545454;margin-top:2px" id="dp-seo-preview-desc">${p.seo_desc||p.bio||'No description set.'}</div>
    </div>
  </div>`;
}

// ── LIVE PREVIEW ──────────────────────────────────────────────────────────────
function dpRenderPreview(p) {
  const themeStyles = {
    minimal: `background:#fff;color:#111`,
    gradient: `background:linear-gradient(135deg,${p.theme_color||'#6366f1'}22,${p.theme_color||'#6366f1'}08);color:#111`,
    dark: `background:#0f0f1a;color:#fff`,
    neon: `background:#0d0d0d;color:#fff`,
    glass: `background:rgba(255,255,255,.05);backdrop-filter:blur(20px);color:#fff`,
  };
  const btnStyle = `background:${p.theme_color||'#6366f1'};color:#fff;border-radius:12px;padding:10px 14px;font-size:12px;font-weight:600;margin-bottom:6px;width:100%;text-align:center`;
  const links = (p.links||[]).filter(l=>l.enabled!==false).slice(0,4);
  const social = p.social || {};
  const socialIcons = { instagram:'fab fa-instagram', youtube:'fab fa-youtube', twitter:'fab fa-twitter', linkedin:'fab fa-linkedin', whatsapp:'fab fa-whatsapp', telegram:'fab fa-telegram' };

  return `
  <div style="${themeStyles[p.theme_style||'minimal']};padding:20px;min-height:400px;font-family:system-ui,sans-serif">
    ${p.cover_image?`<div style="height:60px;border-radius:10px;overflow:hidden;margin-bottom:-20px;background:${p.theme_color||'#6366f1'}33"><img src="${p.cover_image}" style="width:100%;height:100%;object-fit:cover"></div>`:''}
    <div style="text-align:center;margin-bottom:16px;${p.cover_image?'padding-top:10px':''}">
      <img src="${p.avatar||'https://ui-avatars.com/api/?name='+encodeURIComponent(p.display_name||p.username||'?')+'&background=6366f1&color=fff'}"
        style="width:64px;height:64px;border-radius:50%;border:3px solid ${p.theme_color||'#6366f1'};object-fit:cover;margin-bottom:8px">
      <div style="font-size:16px;font-weight:700">${p.display_name||p.username||'Your Name'}</div>
      ${p.category?`<div style="display:inline-block;padding:2px 8px;border-radius:20px;font-size:10px;background:${p.theme_color||'#6366f1'}22;color:${p.theme_color||'#6366f1'};margin:4px 0">${p.category}</div>`:''}
      ${p.bio?`<div style="font-size:11px;opacity:.7;margin-top:4px;line-height:1.4">${p.bio.slice(0,80)}${p.bio.length>80?'...':''}</div>`:''}
    </div>
    ${Object.keys(social).filter(k=>social[k]).length>0?`
    <div style="display:flex;justify-content:center;gap:8px;margin-bottom:14px">
      ${Object.entries(social).filter(([,v])=>v).slice(0,5).map(([k])=>`
      <div style="width:28px;height:28px;border-radius:50%;background:${p.theme_color||'#6366f1'}22;display:flex;align-items:center;justify-content:center;font-size:12px">
        <i class="${socialIcons[k]||'fas fa-link'}"></i>
      </div>`).join('')}
    </div>`:''}
    ${links.map(l=>`<div style="${btnStyle}"><i class="fas fa-${(l.icon||'link').replace('fa-','')}"></i> ${l.title||l.url}</div>`).join('')}
    ${links.length===0?`<div style="text-align:center;opacity:.4;font-size:12px;padding:20px">Add links to see them here</div>`:''}
    ${p.accept_donations?`<div style="margin-top:10px;padding:10px;border-radius:10px;border:1px dashed ${p.theme_color||'#6366f1'};text-align:center;font-size:11px;opacity:.8">💝 Support me</div>`:''}
    <div style="text-align:center;margin-top:16px;font-size:10px;opacity:.4">Powered by DigiKraft</div>
  </div>`;
}

// ── LINK HELPERS ──────────────────────────────────────────────────────────────
window.dpAddLink = function() {
  if (!window._dpCurrentProfile) return;
  window._dpCurrentProfile.links = window._dpCurrentProfile.links || [];
  window._dpCurrentProfile.links.push({ title:'New Link', url:'', icon:'fa-link', enabled:true, track_clicks:true, clicks:0 });
  window._dpEditTab = 'links';
  dpRefreshEditorTabs();
};

window.dpRemoveLink = function(i) {
  if (!window._dpCurrentProfile?.links) return;
  window._dpCurrentProfile.links.splice(i, 1);
  dpRefreshEditorTabs();
};

window.dpUpdateLink = function(i, key, val) {
  if (!window._dpCurrentProfile?.links?.[i]) return;
  window._dpCurrentProfile.links[i][key] = val;
};

window.dpAddProduct = function() {
  const input = document.getElementById('dp-product-input');
  if (!input?.value.trim()) return;
  window._dpCurrentProfile = window._dpCurrentProfile || {};
  window._dpCurrentProfile.products = window._dpCurrentProfile.products || [];
  window._dpCurrentProfile.products.push(input.value.trim());
  input.value = '';
  dpRefreshEditorTabs();
};

window.dpRemoveProduct = function(i) {
  if (!window._dpCurrentProfile?.products) return;
  window._dpCurrentProfile.products.splice(i, 1);
  dpRefreshEditorTabs();
};

// ── USERNAME CHECK ────────────────────────────────────────────────────────────
let _dpUsernameTimer = null;
window.dpCheckUsername = function(val) {
  const statusEl = document.getElementById('dp-username-status');
  if (!statusEl) return;
  if (!val || val.length < 3) { statusEl.textContent = ''; return; }
  statusEl.innerHTML = '<i class="fas fa-spinner fa-spin" style="color:var(--text3)"></i>';
  clearTimeout(_dpUsernameTimer);
  _dpUsernameTimer = setTimeout(async () => {
    try {
      const r = await AdminAPI.checkDigiUsername(val);
      const available = r.available !== false;
      statusEl.innerHTML = available
        ? '<i class="fas fa-check-circle" style="color:var(--green)"></i> Available'
        : '<i class="fas fa-times-circle" style="color:var(--red)"></i> Taken';
    } catch {
      statusEl.textContent = '';
    }
  }, 600);
};

// ── SAVE EDITOR ───────────────────────────────────────────────────────────────
window.dpSaveEditor = async function() {
  const g = (id) => document.getElementById(id)?.value || '';
  const gc = (id) => document.getElementById(id)?.checked || false;

  const p = window._dpCurrentProfile || {};
  const id = window._dpEditing;

  const payload = {
    username: g('dp-username') || p.username,
    display_name: g('dp-display-name') || p.display_name,
    bio: g('dp-bio') || p.bio,
    avatar: g('dp-avatar') || p.avatar,
    cover_image: g('dp-cover-image') || p.cover_image,
    category: g('dp-category') || p.category,
    theme_color: g('dp-theme-color-hex') || g('dp-theme-color') || p.theme_color,
    theme_style: g('dp-theme-style') || p.theme_style,
    links: p.links || [],
    products: p.products || [],
    social: {
      instagram: g('dp-social-instagram'),
      youtube: g('dp-social-youtube'),
      twitter: g('dp-social-twitter'),
      linkedin: g('dp-social-linkedin'),
      whatsapp: g('dp-social-whatsapp'),
      telegram: g('dp-social-telegram'),
      facebook: g('dp-social-facebook'),
      tiktok: g('dp-social-tiktok'),
    },
    payment_enabled: gc('dp-payment-enabled'),
    key_id: g('dp-rzp-key-id'),
    key_secret: g('dp-rzp-key-secret'),
    upi_id: g('dp-upi-id'),
    accept_donations: gc('dp-accept-donations'),
    donation_amounts: (g('dp-donation-amounts')||'49,99,199,499').split(',').map(n=>parseInt(n.trim())).filter(Boolean),
    instagram_username: g('dp-ig-username'),
    instagram_access_token: g('dp-ig-token'),
    instagram_app_id: g('dp-ig-app-id'),
    instagram_app_secret: g('dp-ig-app-secret'),
    meta_pixel_id: g('dp-meta-pixel'),
    meta_access_token: g('dp-meta-token'),
    automation_enabled: gc('dp-automation-enabled'),
    auto_dm_enabled: gc('dp-auto-dm-enabled'),
    auto_dm_message: g('dp-auto-dm-message'),
    auto_reply_enabled: gc('dp-auto-reply-enabled'),
    keyword_triggers: (g('dp-keyword-triggers')||'').split('\n').map(s=>s.trim()).filter(Boolean),
    kyc_status: g('dp-kyc-status') || p.kyc_status,
    kyc_pan: g('dp-kyc-pan'),
    kyc_aadhaar: g('dp-kyc-aadhaar'),
    kyc_gst: g('dp-kyc-gst'),
    kyc_bank_account: g('dp-kyc-bank'),
    kyc_ifsc: g('dp-kyc-ifsc'),
    kyc_documents: (g('dp-kyc-docs')||'').split('\n').map(s=>s.trim()).filter(Boolean),
    seo_title: g('dp-seo-title'),
    seo_desc: g('dp-seo-desc'),
  };

  // Remove empty social keys
  Object.keys(payload.social).forEach(k => { if (!payload.social[k]) delete payload.social[k]; });

  try {
    let result;
    if (id === 'new') {
      result = await AdminAPI.createDigiProfile(payload);
    } else {
      result = await AdminAPI.updateDigiProfile(id, payload);
    }
    toast('DigiProfile saved!', 's');
    window._dpCurrentProfile = { ...payload, id: result?.data?.id || result?.id || id };
    window._dpEditing = window._dpCurrentProfile.id;
    dpRefreshPreview();
  } catch(e) {
    showToast('Save failed: ' + e.message, 'error');
  }
};

// ── ACTIONS ───────────────────────────────────────────────────────────────────
window.dpOpenCreate = function() {
  window._dpEditing = 'new';
  window._dpEditTab = 'basic';
  window._dpCurrentProfile = { id:'new', links:[], social:{}, products:[], donation_amounts:[49,99,199,499], kyc_documents:[], keyword_triggers:[], theme_color:'#6366f1', theme_style:'minimal', category:'creator' };
  renderDPEditor('new');
};

window.dpEdit = async function(id) {
  window._dpEditing = id;
  window._dpEditTab = 'basic';
  await renderDPEditor(id);
};

window.dpDelete = async function(id) {
  if (!confirm('Delete this DigiProfile? This cannot be undone.')) return;
  try {
    await AdminAPI.deleteDigiProfile(id);
    toast('Profile deleted', 's');
    renderDigiProfile();
  } catch(e) {
    showToast('Delete failed: ' + e.message, 'error');
  }
};

window.dpCopyLink = function(username) {
  const url = `http://localhost:3001/p/${username}`;
  navigator.clipboard.writeText(url).then(() => showToast('Link copied: ' + url, 'success')).catch(() => {
    prompt('Copy this link:', url);
  });
};
