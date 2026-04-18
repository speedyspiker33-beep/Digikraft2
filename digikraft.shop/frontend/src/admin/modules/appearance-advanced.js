// ===== APPEARANCE / SITE CUSTOMIZER MODULE =====
// Controls main website sections via localStorage dk_site_config

window._appTab = window._appTab || 'overview';

function getSiteCfg() {
  try { return JSON.parse(localStorage.getItem('dk_site_config') || '{}'); } catch { return {}; }
}
async function saveSiteCfg(v) {
  // Save to localStorage (for admin panel own use)
  localStorage.setItem('dk_site_config', JSON.stringify(v));
  // Save to backend so main website (different origin) can read it
  try {
    await AdminAPI.updateSettings({ site_config: JSON.stringify(v) });
    window.toast('Changes saved! Main website updated.', 's');
  } catch (e) {
    window.toast('Saved locally. Backend sync failed — check if backend is running.', 'w');
  }
}
function mergeSave(partial) {
  const cfg = getSiteCfg();
  const merged = deepMerge(cfg, partial);
  saveSiteCfg(merged); // async, fire-and-forget is fine here
}
function deepMerge(target, source) {
  const out = { ...target };
  for (const k in source) {
    if (source[k] && typeof source[k] === 'object' && !Array.isArray(source[k])) {
      out[k] = deepMerge(target[k] || {}, source[k]);
    } else { out[k] = source[k]; }
  }
  return out;
}

window.renderAppearance = function() {
  const cfg = getSiteCfg();
  const tab = window._appTab;
  const tabs = [
    ['overview','Overview'],['topbar','Top Bar'],['sidebar','Right Sidebar'],
    ['homepage','Homepage'],['blog','Blog & Articles'],['branding','Branding']
  ];
  return `
  <div class="ph">
    <div><div class="ph-title">Site Customizer</div><div class="ph-sub">Control your main website sections from here · Changes apply instantly</div></div>
    <div class="ph-actions">
      <a href="http://localhost:3001" target="_blank" class="btn btn-secondary"><i class="fas fa-eye"></i>Preview Website</a>
    </div>
  </div>
  <div class="tabs" style="margin-bottom:16px">
    ${tabs.map(([id,lb])=>`<button class="tab ${tab===id?'on':''}" onclick="window._appTab='${id}';navigate('appearance')">${lb}</button>`).join('')}
  </div>
  ${tab==='overview'?renderOverview(cfg):''}
  ${tab==='topbar'?renderTopBarEditor(cfg):''}
  ${tab==='sidebar'?renderSidebarEditor(cfg):''}
  ${tab==='homepage'?renderHomepageEditor(cfg):''}
  ${tab==='blog'?renderBlogEditor(cfg):''}
  ${tab==='branding'?renderBrandingEditor(cfg):''}`;
};

// ── OVERVIEW ──────────────────────────────────────────────────────────────────
function renderOverview(cfg) {
  const sections = [
    { key:'topbar.enabled', label:'Top Bar', icon:'fa-bars', desc:'Social links, announcement, nav links', color:'var(--blue)' },
    { key:'rightSidebar.enabled', label:'Right Sidebar', icon:'fa-columns', desc:'Hot offers, trending, blog feed, newsletter', color:'var(--accent)' },
    { key:'homepage.heroEnabled', label:'Hero Section', icon:'fa-home', desc:'Featured products grid on homepage', color:'var(--green)' },
    { key:'homepage.featuredEnabled', label:'Featured Products', icon:'fa-star', desc:'Featured products section', color:'var(--yellow)' },
    { key:'homepage.hubCardsEnabled', label:'Hub Cards', icon:'fa-th-large', desc:'Category hub cards section', color:'var(--purple)' },
    { key:'homepage.newsletterEnabled', label:'Newsletter Section', icon:'fa-envelope', desc:'Email subscription section', color:'var(--pink)' },
    { key:'homepage.announcementBannerEnabled', label:'Announcement Banner', icon:'fa-bullhorn', desc:'Top announcement banner', color:'var(--red)' },
    { key:'rightSidebar.sections.hotOffers.enabled', label:'Hot Offers Widget', icon:'fa-fire', desc:'Promotional products in sidebar', color:'var(--red)' },
    { key:'rightSidebar.sections.trending.enabled', label:'Trending Widget', icon:'fa-trending-up', desc:'Trending items in sidebar', color:'var(--accent)' },
    { key:'rightSidebar.sections.blogFeed.enabled', label:'Blog Feed Widget', icon:'fa-newspaper', desc:'Latest articles in sidebar', color:'var(--purple)' },
    { key:'rightSidebar.sections.newsletter.enabled', label:'Newsletter Widget', icon:'fa-mail-bulk', desc:'Newsletter signup in sidebar', color:'var(--blue)' },
    { key:'rightSidebar.sections.promo.enabled', label:'Promo Banner Widget', icon:'fa-ad', desc:'Custom promotional banner in sidebar', color:'var(--green)' },
  ];

  function getVal(obj, path) {
    return path.split('.').reduce((o,k)=>o?.[k], obj);
  }

  return `
  <div class="card" style="margin-bottom:16px">
    <div class="card-hd"><div class="card-title"><i class="fas fa-toggle-on" style="color:var(--accent)"></i>Section Toggles — Quick Control</div>
      <div style="font-size:12px;color:var(--text2)">Toggle any section on/off instantly</div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px">
      ${sections.map(s=>{
        const enabled = getVal(cfg, s.key) !== false;
        return `
        <div style="display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--bg3);border-radius:10px;border:1px solid ${enabled?s.color+'44':'var(--border)'};transition:.2s">
          <div style="width:36px;height:36px;border-radius:9px;background:${s.color}22;display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <i class="fas ${s.icon}" style="color:${s.color};font-size:14px"></i>
          </div>
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:700">${s.label}</div>
            <div style="font-size:11px;color:var(--text3)">${s.desc}</div>
          </div>
          <label class="tgl"><input type="checkbox" ${enabled?'checked':''} onchange="toggleSection('${s.key}',this.checked)"><span class="tgs"></span></label>
        </div>`;
      }).join('')}
    </div>
  </div>
  <div style="background:rgba(99,102,241,.1);border:1px solid var(--accent);border-radius:11px;padding:14px 16px;display:flex;align-items:center;gap:10px">
    <i class="fas fa-info-circle" style="color:var(--accent);font-size:18px"></i>
    <div>
      <strong style="font-size:13px">How it works:</strong>
      <span style="font-size:13px;color:var(--text2)"> Changes save instantly to browser storage. The main website at <a href="http://localhost:3001" target="_blank" style="color:var(--accent)">localhost:3001</a> reads this config on every page load. Refresh the website to see changes.</span>
    </div>
  </div>`;
}

window.toggleSection = function(keyPath, val) {
  const cfg = getSiteCfg();
  const keys = keyPath.split('.');
  let obj = cfg;
  for (let i=0; i<keys.length-1; i++) { if (!obj[keys[i]]) obj[keys[i]] = {}; obj = obj[keys[i]]; }
  obj[keys[keys.length-1]] = val;
  saveSiteCfg(cfg);
  navigate('appearance');
};

// ── TOP BAR EDITOR ────────────────────────────────────────────────────────────
function renderTopBarEditor(cfg) {
  const tb = cfg.topbar || {};
  const links = tb.navLinks || [{label:'Guides',href:'/blog?category=guides',enabled:true},{label:'About',href:'/about',enabled:true},{label:'Help',href:'/help',enabled:true}];
  const social = tb.socialLinks || {};
  return `
  <div class="g2">
    <div class="card">
      <div class="card-hd"><div class="card-title"><i class="fas fa-bars" style="color:var(--blue)"></i>Top Bar Settings</div>
        <label class="tgl"><input type="checkbox" id="tb-enabled" ${tb.enabled!==false?'checked':''} onchange="saveTopBar()"><span class="tgs"></span></label>
      </div>
      <div class="fg"><label class="fl">Announcement Text (leave empty to hide)</label>
        <input class="fc" id="tb-announcement" value="${tb.announcement||''}" placeholder="🎉 Special Sale — 50% off all products!">
      </div>
      <div class="fg"><label class="fl">Announcement Background Color</label>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="color" id="tb-ann-color" value="${tb.announcementColor||'#6366f1'}" style="width:44px;height:36px;border-radius:8px;border:1px solid var(--border);background:none;cursor:pointer">
          <input class="fc" id="tb-ann-color-hex" value="${tb.announcementColor||'#6366f1'}" style="flex:1" oninput="document.getElementById('tb-ann-color').value=this.value">
        </div>
      </div>
      <button class="btn btn-primary" onclick="saveTopBar()"><i class="fas fa-save"></i>Save Top Bar</button>
    </div>
    <div class="card">
      <div class="card-hd"><div class="card-title"><i class="fas fa-share-alt" style="color:var(--green)"></i>Social Links</div></div>
      ${[['whatsapp','WhatsApp','#25d366'],['instagram','Instagram','#e1306c'],['youtube','YouTube','#ff0000'],['telegram','Telegram','#0088cc'],['facebook','Facebook','#1877f2'],['twitter','Twitter / X','#000000']].map(([key,label,color])=>`
      <div class="fg"><label class="fl" style="display:flex;align-items:center;gap:6px"><span style="width:10px;height:10px;border-radius:50%;background:${color};display:inline-block"></span>${label}</label>
        <input class="fc" id="social-${key}" value="${social[key]||''}" placeholder="https://...">
      </div>`).join('')}
      <button class="btn btn-primary" onclick="saveTopBar()"><i class="fas fa-save"></i>Save Social Links</button>
    </div>
    <div class="card" style="grid-column:span 2">
      <div class="card-hd"><div class="card-title"><i class="fas fa-link" style="color:var(--accent)"></i>Navigation Links</div>
        <button class="btn btn-secondary btn-sm" onclick="addNavLink()"><i class="fas fa-plus"></i>Add Link</button>
      </div>
      <div id="nav-links-list" style="display:flex;flex-direction:column;gap:6px">
        ${links.map((l,i)=>`
        <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--bg3);border-radius:9px">
          <label class="tgl"><input type="checkbox" ${l.enabled!==false?'checked':''} onchange="toggleNavLink(${i},this.checked)"><span class="tgs"></span></label>
          <input class="fc" placeholder="Label" value="${l.label}" style="flex:1" oninput="updateNavLink(${i},'label',this.value)">
          <input class="fc" placeholder="URL e.g. /about" value="${l.href}" style="flex:2" oninput="updateNavLink(${i},'href',this.value)">
          <button class="btn btn-danger btn-sm btn-icon" onclick="removeNavLink(${i})"><i class="fas fa-times"></i></button>
        </div>`).join('')}
      </div>
      <button class="btn btn-primary" style="margin-top:10px" onclick="saveTopBar()"><i class="fas fa-save"></i>Save Navigation</button>
    </div>
  </div>`;
}

window.saveTopBar = function() {
  const cfg = getSiteCfg();
  if (!cfg.topbar) cfg.topbar = {};
  cfg.topbar.enabled = document.getElementById('tb-enabled')?.checked !== false;
  cfg.topbar.announcement = document.getElementById('tb-announcement')?.value || '';
  cfg.topbar.announcementEnabled = !!cfg.topbar.announcement;
  cfg.topbar.announcementColor = document.getElementById('tb-ann-color-hex')?.value || '#6366f1';
  cfg.topbar.socialLinks = {
    whatsapp: document.getElementById('social-whatsapp')?.value || '',
    instagram: document.getElementById('social-instagram')?.value || '',
    youtube: document.getElementById('social-youtube')?.value || '',
    telegram: document.getElementById('social-telegram')?.value || '',
    facebook: document.getElementById('social-facebook')?.value || '',
    twitter: document.getElementById('social-twitter')?.value || '',
  };
  saveSiteCfg(cfg);
};

window._navLinks = null;
window.addNavLink = function() {
  const cfg = getSiteCfg();
  if (!cfg.topbar) cfg.topbar = {};
  if (!cfg.topbar.navLinks) cfg.topbar.navLinks = [];
  cfg.topbar.navLinks.push({ label: 'New Link', href: '/', enabled: true });
  saveSiteCfg(cfg);
  navigate('appearance');
};
window.removeNavLink = function(i) {
  const cfg = getSiteCfg();
  cfg.topbar?.navLinks?.splice(i, 1);
  saveSiteCfg(cfg);
  navigate('appearance');
};
window.toggleNavLink = function(i, val) {
  const cfg = getSiteCfg();
  if (cfg.topbar?.navLinks?.[i]) { cfg.topbar.navLinks[i].enabled = val; saveSiteCfg(cfg); }
};
window.updateNavLink = function(i, key, val) {
  const cfg = getSiteCfg();
  if (cfg.topbar?.navLinks?.[i]) cfg.topbar.navLinks[i][key] = val;
  localStorage.setItem('dk_site_config', JSON.stringify(cfg));
  // Debounce backend sync to avoid too many requests while typing
  clearTimeout(window._navLinkSyncTimer);
  window._navLinkSyncTimer = setTimeout(() => AdminAPI.updateSettings({ site_config: JSON.stringify(cfg) }).catch(()=>{}), 1000);
};

// ── SIDEBAR EDITOR ────────────────────────────────────────────────────────────
function renderSidebarEditor(cfg) {
  const sb = cfg.rightSidebar || {};
  const hotOffers = sb.hotOffers || [];
  const trending = sb.trending || [];
  const promo = sb.promo || {};
  return `
  <div class="g2">
    <!-- SECTION TOGGLES -->
    <div class="card">
      <div class="card-hd"><div class="card-title"><i class="fas fa-toggle-on" style="color:var(--accent)"></i>Sidebar Sections</div>
        <div style="display:flex;align-items:center;gap:8px;font-size:13px">
          Sidebar <label class="tgl" style="margin-left:6px"><input type="checkbox" id="sb-enabled" ${sb.enabled!==false?'checked':''} onchange="saveSidebarToggles()"><span class="tgs"></span></label>
        </div>
      </div>
      ${[['tools','Tools Widget','fa-tools'],['hotOffers','Hot Offers','fa-fire'],['trending','Trending Now','fa-trending-up'],['blogFeed','Blog Feed','fa-newspaper'],['newsletter','Newsletter','fa-envelope'],['promo','Promo Banner','fa-ad']].map(([key,label,icon])=>`
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
        <div style="display:flex;align-items:center;gap:8px">
          <i class="fas ${icon}" style="color:var(--text3);width:14px;text-align:center"></i>
          <div>
            <div style="font-size:13px;font-weight:600">${label}</div>
            <input class="fc" placeholder="Section title" value="${sb.sections?.[key]?.title||label}" style="margin-top:4px;padding:4px 8px;font-size:12px" oninput="updateSectionTitle('${key}',this.value)">
          </div>
        </div>
        <label class="tgl"><input type="checkbox" ${sb.sections?.[key]?.enabled!==false?'checked':''} onchange="saveSidebarToggles()"><span class="tgs"></span></label>
      </div>`).join('')}
      <button class="btn btn-primary" style="margin-top:12px" onclick="saveSidebarToggles()"><i class="fas fa-save"></i>Save Toggles</button>
    </div>

    <!-- PROMO BANNER -->
    <div class="card">
      <div class="card-hd"><div class="card-title"><i class="fas fa-ad" style="color:var(--green)"></i>Promo Banner Widget</div></div>
      <div class="fg"><label class="fl">Title</label><input class="fc" id="promo-title" value="${promo.title||''}" placeholder="Special Offer"></div>
      <div class="fg"><label class="fl">Description</label><input class="fc" id="promo-desc" value="${promo.description||''}" placeholder="Get 50% off today!"></div>
      <div class="fg"><label class="fl">Image URL</label><input class="fc" id="promo-img" value="${promo.image||''}" placeholder="https://..."></div>
      <div class="fg"><label class="fl">Link URL</label><input class="fc" id="promo-link" value="${promo.link||''}" placeholder="/products"></div>
      <div class="fg"><label class="fl">Button Text</label><input class="fc" id="promo-btn" value="${promo.buttonText||'Shop Now'}" placeholder="Shop Now"></div>
      <div class="fg"><label class="fl">Background Color</label>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="color" id="promo-color" value="${promo.bgColor||'#6366f1'}" style="width:44px;height:36px;border-radius:8px;border:1px solid var(--border);background:none;cursor:pointer">
          <input class="fc" id="promo-color-hex" value="${promo.bgColor||'#6366f1'}" style="flex:1" oninput="document.getElementById('promo-color').value=this.value">
        </div>
      </div>
      <button class="btn btn-primary" onclick="savePromo()"><i class="fas fa-save"></i>Save Promo</button>
    </div>

    <!-- HOT OFFERS -->
    <div class="card" style="grid-column:span 2">
      <div class="card-hd"><div class="card-title"><i class="fas fa-fire" style="color:var(--red)"></i>Hot Offers (${hotOffers.length})</div>
        <button class="btn btn-secondary btn-sm" onclick="addHotOffer()"><i class="fas fa-plus"></i>Add Offer</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px" id="hot-offers-list">
        ${hotOffers.map((o,i)=>`
        <div style="background:var(--bg3);border-radius:10px;padding:12px">
          <div style="display:flex;gap:8px;margin-bottom:8px;align-items:center">
            <img src="${o.image||''}" onerror="this.src='https://via.placeholder.com/48'" style="width:48px;height:48px;border-radius:8px;object-fit:cover;flex-shrink:0">
            <input class="fc" placeholder="Title" value="${o.title||''}" style="flex:1" oninput="updateHotOffer(${i},'title',this.value)">
            <button class="btn btn-danger btn-sm btn-icon" onclick="removeHotOffer(${i})"><i class="fas fa-times"></i></button>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:6px">
            <input class="fc" placeholder="Image URL" value="${o.image||''}" style="grid-column:span 2;font-size:11px" oninput="updateHotOffer(${i},'image',this.value)">
            <input class="fc" placeholder="Link" value="${o.link||'/products'}" style="font-size:11px" oninput="updateHotOffer(${i},'link',this.value)">
            <input class="fc" placeholder="Discount %" value="${o.discount||50}" type="number" style="font-size:11px" oninput="updateHotOffer(${i},'discount',parseInt(this.value))">
            <input class="fc" placeholder="Original ₹" value="${o.originalPrice||0}" type="number" style="font-size:11px" oninput="updateHotOffer(${i},'originalPrice',parseInt(this.value))">
            <input class="fc" placeholder="Sale ₹" value="${o.salePrice||0}" type="number" style="font-size:11px" oninput="updateHotOffer(${i},'salePrice',parseInt(this.value))">
          </div>
        </div>`).join('')}
      </div>
      <button class="btn btn-primary" style="margin-top:10px" onclick="saveHotOffers()"><i class="fas fa-save"></i>Save Hot Offers</button>
    </div>

    <!-- TRENDING -->
    <div class="card" style="grid-column:span 2">
      <div class="card-hd"><div class="card-title"><i class="fas fa-trending-up" style="color:var(--accent)"></i>Trending Items (${trending.length})</div>
        <button class="btn btn-secondary btn-sm" onclick="addTrending()"><i class="fas fa-plus"></i>Add Item</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">
        ${trending.map((t,i)=>`
        <div style="display:flex;gap:8px;align-items:center;padding:8px;background:var(--bg3);border-radius:9px">
          <img src="${t.image||''}" onerror="this.src='https://via.placeholder.com/40'" style="width:40px;height:40px;border-radius:8px;object-fit:cover;flex-shrink:0">
          <input class="fc" placeholder="Title" value="${t.title||''}" style="flex:2" oninput="updateTrending(${i},'title',this.value)">
          <input class="fc" placeholder="Image URL" value="${t.image||''}" style="flex:2;font-size:11px" oninput="updateTrending(${i},'image',this.value)">
          <input class="fc" placeholder="Link" value="${t.link||'/products'}" style="flex:1;font-size:11px" oninput="updateTrending(${i},'link',this.value)">
          <input class="fc" placeholder="Rating" value="${t.rating||4.5}" type="number" step="0.1" style="width:70px;font-size:11px" oninput="updateTrending(${i},'rating',parseFloat(this.value))">
          <input class="fc" placeholder="Sales" value="${t.sales||'0'}" style="width:60px;font-size:11px" oninput="updateTrending(${i},'sales',this.value)">
          <button class="btn btn-danger btn-sm btn-icon" onclick="removeTrending(${i})"><i class="fas fa-times"></i></button>
        </div>`).join('')}
      </div>
      <button class="btn btn-primary" style="margin-top:10px" onclick="saveTrending()"><i class="fas fa-save"></i>Save Trending</button>
    </div>
  </div>`;
}

window.saveSidebarToggles = function() {
  const cfg = getSiteCfg();
  if (!cfg.rightSidebar) cfg.rightSidebar = {};
  cfg.rightSidebar.enabled = document.getElementById('sb-enabled')?.checked !== false;
  if (!cfg.rightSidebar.sections) cfg.rightSidebar.sections = {};
  ['tools','hotOffers','trending','blogFeed','newsletter','promo'].forEach(key => {
    if (!cfg.rightSidebar.sections[key]) cfg.rightSidebar.sections[key] = {};
    const cb = document.querySelector(`input[onchange*="saveSidebarToggles"][type="checkbox"]`);
    // Use the toggle state from the rendered checkboxes
    cfg.rightSidebar.sections[key].enabled = document.querySelector(`[onchange*="saveSidebarToggles"]`)?.checked !== false;
  });
  // Re-read all section toggles properly
  const sectionKeys = ['tools','hotOffers','trending','blogFeed','newsletter','promo'];
  const checkboxes = document.querySelectorAll('[onchange="saveSidebarToggles()"]');
  checkboxes.forEach((cb, i) => {
    if (i === 0) { cfg.rightSidebar.enabled = cb.checked; return; }
    const key = sectionKeys[i-1];
    if (key) { if (!cfg.rightSidebar.sections[key]) cfg.rightSidebar.sections[key] = {}; cfg.rightSidebar.sections[key].enabled = cb.checked; }
  });
  saveSiteCfg(cfg);
};

window.updateSectionTitle = function(key, val) {
  const cfg = getSiteCfg();
  if (!cfg.rightSidebar) cfg.rightSidebar = {};
  if (!cfg.rightSidebar.sections) cfg.rightSidebar.sections = {};
  if (!cfg.rightSidebar.sections[key]) cfg.rightSidebar.sections[key] = {};
  cfg.rightSidebar.sections[key].title = val;
  localStorage.setItem('dk_site_config', JSON.stringify(cfg));
  clearTimeout(window._sectionTitleSyncTimer);
  window._sectionTitleSyncTimer = setTimeout(() => AdminAPI.updateSettings({ site_config: JSON.stringify(cfg) }).catch(()=>{}), 1000);
};

window.savePromo = function() {
  const cfg = getSiteCfg();
  if (!cfg.rightSidebar) cfg.rightSidebar = {};
  cfg.rightSidebar.promo = {
    title: document.getElementById('promo-title')?.value || '',
    description: document.getElementById('promo-desc')?.value || '',
    image: document.getElementById('promo-img')?.value || '',
    link: document.getElementById('promo-link')?.value || '/products',
    buttonText: document.getElementById('promo-btn')?.value || 'Shop Now',
    bgColor: document.getElementById('promo-color-hex')?.value || '#6366f1'
  };
  saveSiteCfg(cfg);
};

window.addHotOffer = function() {
  const cfg = getSiteCfg();
  if (!cfg.rightSidebar) cfg.rightSidebar = {};
  if (!cfg.rightSidebar.hotOffers) cfg.rightSidebar.hotOffers = [];
  cfg.rightSidebar.hotOffers.push({ id: Date.now().toString(), title: 'New Offer', image: '', originalPrice: 999, salePrice: 499, discount: 50, link: '/products' });
  saveSiteCfg(cfg); navigate('appearance');
};
window.removeHotOffer = function(i) { const cfg=getSiteCfg(); cfg.rightSidebar?.hotOffers?.splice(i,1); saveSiteCfg(cfg); navigate('appearance'); };
window.updateHotOffer = function(i,k,v) {
  const cfg=getSiteCfg();
  if(cfg.rightSidebar?.hotOffers?.[i]) cfg.rightSidebar.hotOffers[i][k]=v;
  localStorage.setItem('dk_site_config',JSON.stringify(cfg));
  clearTimeout(window._hotOfferSyncTimer);
  window._hotOfferSyncTimer = setTimeout(() => AdminAPI.updateSettings({ site_config: JSON.stringify(cfg) }).catch(()=>{}), 1000);
};
window.saveHotOffers = function() { saveSiteCfg(getSiteCfg()); };

window.addTrending = function() {
  const cfg = getSiteCfg();
  if (!cfg.rightSidebar) cfg.rightSidebar = {};
  if (!cfg.rightSidebar.trending) cfg.rightSidebar.trending = [];
  cfg.rightSidebar.trending.push({ id: Date.now().toString(), title: 'New Item', image: '', rating: 4.5, sales: '0', link: '/products' });
  saveSiteCfg(cfg); navigate('appearance');
};
window.removeTrending = function(i) { const cfg=getSiteCfg(); cfg.rightSidebar?.trending?.splice(i,1); saveSiteCfg(cfg); navigate('appearance'); };
window.updateTrending = function(i,k,v) {
  const cfg=getSiteCfg();
  if(cfg.rightSidebar?.trending?.[i]) cfg.rightSidebar.trending[i][k]=v;
  localStorage.setItem('dk_site_config',JSON.stringify(cfg));
  clearTimeout(window._trendingSyncTimer);
  window._trendingSyncTimer = setTimeout(() => AdminAPI.updateSettings({ site_config: JSON.stringify(cfg) }).catch(()=>{}), 1000);
};
window.saveTrending = function() { saveSiteCfg(getSiteCfg()); };

// ── HOMEPAGE EDITOR ───────────────────────────────────────────────────────────
function renderHomepageEditor(cfg) {
  const hp = cfg.homepage || {};
  return `
  <div class="g2">
    <div class="card">
      <div class="card-hd"><div class="card-title"><i class="fas fa-home" style="color:var(--accent)"></i>Homepage Sections</div></div>
      ${[
        ['heroEnabled','Hero / Featured Products Grid','fa-th'],
        ['featuredEnabled','Featured Products Section','fa-star'],
        ['hubCardsEnabled','Hub Cards Section','fa-th-large'],
        ['newsletterEnabled','Newsletter Section','fa-envelope'],
      ].map(([key,label,icon])=>`
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
        <div style="display:flex;align-items:center;gap:8px;font-size:13px">
          <i class="fas ${icon}" style="color:var(--text3);width:14px;text-align:center"></i>${label}
        </div>
        <label class="tgl"><input type="checkbox" id="hp-${key}" ${hp[key]!==false?'checked':''} onchange="saveHomepage()"><span class="tgs"></span></label>
      </div>`).join('')}
      <div style="margin-top:12px">
        <div class="fg"><label class="fl">Hero Section Title</label><input class="fc" id="hp-hero-title" value="${hp.heroTitle||'Featured'}" placeholder="Featured"></div>
        <div class="fg"><label class="fl">Hero Title Accent (gradient text)</label><input class="fc" id="hp-hero-accent" value="${hp.heroTitleAccent||'Graphics'}" placeholder="Graphics"></div>
      </div>
      <button class="btn btn-primary" onclick="saveHomepage()"><i class="fas fa-save"></i>Save Homepage</button>
    </div>
    <div class="card">
      <div class="card-hd"><div class="card-title"><i class="fas fa-bullhorn" style="color:var(--red)"></i>Announcement Banner</div>
        <label class="tgl"><input type="checkbox" id="hp-ann-enabled" ${hp.announcementBannerEnabled?'checked':''} onchange="saveHomepage()"><span class="tgs"></span></label>
      </div>
      <div class="fg"><label class="fl">Banner Text</label><input class="fc" id="hp-ann-text" value="${hp.announcementBannerText||'🎉 Special Sale — 50% off all products!'}" placeholder="🎉 Special Sale!"></div>
      <div class="fg"><label class="fl">Banner Link</label><input class="fc" id="hp-ann-link" value="${hp.announcementBannerLink||'/products'}" placeholder="/products"></div>
      <div class="fg"><label class="fl">Banner Color</label>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="color" id="hp-ann-color" value="${hp.announcementBannerColor||'#6366f1'}" style="width:44px;height:36px;border-radius:8px;border:1px solid var(--border);background:none;cursor:pointer">
          <input class="fc" id="hp-ann-color-hex" value="${hp.announcementBannerColor||'#6366f1'}" style="flex:1" oninput="document.getElementById('hp-ann-color').value=this.value">
        </div>
      </div>
      <button class="btn btn-primary" onclick="saveHomepage()"><i class="fas fa-save"></i>Save Banner</button>
    </div>
  </div>`;
}

window.saveHomepage = function() {
  const cfg = getSiteCfg();
  if (!cfg.homepage) cfg.homepage = {};
  cfg.homepage.heroEnabled = document.getElementById('hp-heroEnabled')?.checked !== false;
  cfg.homepage.featuredEnabled = document.getElementById('hp-featuredEnabled')?.checked !== false;
  cfg.homepage.hubCardsEnabled = document.getElementById('hp-hubCardsEnabled')?.checked !== false;
  cfg.homepage.newsletterEnabled = document.getElementById('hp-newsletterEnabled')?.checked !== false;
  cfg.homepage.heroTitle = document.getElementById('hp-hero-title')?.value || 'Featured';
  cfg.homepage.heroTitleAccent = document.getElementById('hp-hero-accent')?.value || 'Graphics';
  cfg.homepage.announcementBannerEnabled = document.getElementById('hp-ann-enabled')?.checked || false;
  cfg.homepage.announcementBannerText = document.getElementById('hp-ann-text')?.value || '';
  cfg.homepage.announcementBannerLink = document.getElementById('hp-ann-link')?.value || '/products';
  cfg.homepage.announcementBannerColor = document.getElementById('hp-ann-color-hex')?.value || '#6366f1';
  saveSiteCfg(cfg);
};

// ── BLOG EDITOR ───────────────────────────────────────────────────────────────
function renderBlogEditor(cfg) {
  const articles = cfg.blog?.articles || [];
  return `
  <div class="ph" style="margin-bottom:16px">
    <div><div style="font-size:16px;font-weight:700">Blog Articles</div><div style="font-size:13px;color:var(--text2)">${articles.length} articles · These appear in the sidebar blog feed and blog page</div></div>
    <div class="ph-actions"><button class="btn btn-primary" onclick="addArticle()"><i class="fas fa-plus"></i>Add Article</button></div>
  </div>
  <div style="display:flex;flex-direction:column;gap:12px">
    ${articles.map((a,i)=>`
    <div class="card">
      <div class="card-hd">
        <div style="display:flex;align-items:center;gap:10px">
          ${a.image?`<img src="${a.image}" style="width:48px;height:48px;border-radius:8px;object-fit:cover;flex-shrink:0">`:'<div style="width:48px;height:48px;border-radius:8px;background:var(--bg3);display:flex;align-items:center;justify-content:center"><i class="fas fa-image" style="color:var(--text3)"></i></div>'}
          <div><div style="font-size:14px;font-weight:700">${a.title||'Untitled'}</div><div style="font-size:11px;color:var(--text3)">${a.date||'No date'} · ${a.category||'Uncategorized'}</div></div>
        </div>
        <div style="display:flex;gap:6px">
          <span class="tag ${a.published!==false?'tg':'ty'}">${a.published!==false?'Published':'Draft'}</span>
          <button class="btn btn-sm btn-secondary btn-icon" onclick="editArticle(${i})"><i class="fas fa-edit"></i></button>
          <button class="btn btn-sm btn-danger btn-icon" onclick="removeArticle(${i})"><i class="fas fa-trash"></i></button>
        </div>
      </div>
      <div id="article-edit-${i}" style="display:none">
        <div class="fgrid" style="margin-top:10px">
          <div class="fg cs2"><label class="fl">Title *</label><input class="fc" id="art-title-${i}" value="${a.title||''}" placeholder="Article title"></div>
          <div class="fg cs2"><label class="fl">Excerpt</label><textarea class="fc" id="art-excerpt-${i}" rows="2">${a.excerpt||''}</textarea></div>
          <div class="fg"><label class="fl">Image URL</label><input class="fc" id="art-img-${i}" value="${a.image||''}" placeholder="https://..."></div>
          <div class="fg"><label class="fl">Slug (URL)</label><input class="fc" id="art-slug-${i}" value="${a.slug||''}" placeholder="my-article-slug"></div>
          <div class="fg"><label class="fl">Category</label>
            <select class="fc" id="art-cat-${i}">
              ${['guides','tutorials','tips','ai','design','news'].map(c=>`<option value="${c}" ${a.category===c?'selected':''}>${c}</option>`).join('')}
            </select>
          </div>
          <div class="fg"><label class="fl">Date</label><input class="fc" id="art-date-${i}" type="date" value="${a.date||new Date().toISOString().slice(0,10)}"></div>
          <div class="fg"><label class="fl">Read Time (min)</label><input class="fc" id="art-read-${i}" type="number" value="${a.readTime||5}" min="1"></div>
          <div class="fg"><label class="fl">Link (if external)</label><input class="fc" id="art-link-${i}" value="${a.link||''}" placeholder="/blog/my-article or https://..."></div>
          <div class="fg cs2" style="display:flex;align-items:center;gap:8px;background:var(--bg3);padding:10px;border-radius:9px">
            <input type="checkbox" id="art-pub-${i}" ${a.published!==false?'checked':''} style="width:15px;height:15px">
            <label for="art-pub-${i}" style="cursor:pointer;font-size:13px;font-weight:600">Published (visible on website)</label>
          </div>
        </div>
        <button class="btn btn-primary btn-sm" style="margin-top:8px" onclick="saveArticle(${i})"><i class="fas fa-save"></i>Save Article</button>
      </div>
    </div>`).join('')}
    ${articles.length===0?`<div class="es"><i class="fas fa-newspaper"></i><p>No articles yet. Add your first blog article.</p></div>`:''}
  </div>`;
}

window.addArticle = function() {
  const cfg = getSiteCfg();
  if (!cfg.blog) cfg.blog = {};
  if (!cfg.blog.articles) cfg.blog.articles = [];
  cfg.blog.articles.unshift({ id: Date.now().toString(), title: 'New Article', excerpt: '', image: '', slug: 'new-article', category: 'guides', date: new Date().toISOString().slice(0,10), readTime: 5, published: false, link: '' });
  saveSiteCfg(cfg);
  navigate('appearance');
};

window.editArticle = function(i) {
  const el = document.getElementById('article-edit-'+i);
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
};

window.saveArticle = function(i) {
  const cfg = getSiteCfg();
  if (!cfg.blog?.articles?.[i]) return;
  cfg.blog.articles[i] = {
    ...cfg.blog.articles[i],
    title: document.getElementById('art-title-'+i)?.value || '',
    excerpt: document.getElementById('art-excerpt-'+i)?.value || '',
    image: document.getElementById('art-img-'+i)?.value || '',
    slug: document.getElementById('art-slug-'+i)?.value || '',
    category: document.getElementById('art-cat-'+i)?.value || 'guides',
    date: document.getElementById('art-date-'+i)?.value || '',
    readTime: parseInt(document.getElementById('art-read-'+i)?.value || 5),
    link: document.getElementById('art-link-'+i)?.value || '',
    published: document.getElementById('art-pub-'+i)?.checked !== false,
  };
  saveSiteCfg(cfg);
  window.toast('Article saved!');
  navigate('appearance');
};

window.removeArticle = function(i) {
  if (!confirm('Delete this article?')) return;
  const cfg = getSiteCfg();
  cfg.blog?.articles?.splice(i, 1);
  saveSiteCfg(cfg);
  navigate('appearance');
};

// ── BRANDING EDITOR ───────────────────────────────────────────────────────────
function renderBrandingEditor(cfg) {
  const b = cfg.branding || {};
  return `
  <div class="g2">
    <div class="card">
      <div class="card-hd"><div class="card-title"><i class="fas fa-paint-brush" style="color:var(--accent)"></i>Branding</div></div>
      <div class="fg"><label class="fl">Site Name</label><input class="fc" id="br-name" value="${b.siteName||'DigiKraft'}" placeholder="DigiKraft"></div>
      <div class="fg"><label class="fl">Tagline</label><input class="fc" id="br-tagline" value="${b.tagline||'Premium Digital Marketplace'}" placeholder="Premium Digital Marketplace"></div>
      <div class="fg"><label class="fl">Logo URL</label><input class="fc" id="br-logo" value="${b.logoUrl||''}" placeholder="https://..."></div>
      <div class="fg"><label class="fl">Favicon URL</label><input class="fc" id="br-favicon" value="${b.faviconUrl||''}" placeholder="https://..."></div>
      <div class="fg"><label class="fl">Primary Color</label>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="color" id="br-color" value="${b.primaryColor||'#6366f1'}" style="width:44px;height:36px;border-radius:8px;border:1px solid var(--border);background:none;cursor:pointer">
          <input class="fc" id="br-color-hex" value="${b.primaryColor||'#6366f1'}" style="flex:1" oninput="document.getElementById('br-color').value=this.value">
        </div>
      </div>
      <button class="btn btn-primary" onclick="saveBranding()"><i class="fas fa-save"></i>Save Branding</button>
    </div>
    <div class="card">
      <div class="card-hd"><div class="card-title"><i class="fas fa-eye" style="color:var(--blue)"></i>Preview</div></div>
      <div style="background:var(--bg3);border-radius:10px;padding:16px;text-align:center">
        ${b.logoUrl?`<img src="${b.logoUrl}" style="height:40px;margin:0 auto 10px;display:block">`:''}
        <div style="font-size:20px;font-weight:800;color:var(--accent)">${b.siteName||'DigiKraft'}</div>
        <div style="font-size:12px;color:var(--text2);margin-top:4px">${b.tagline||'Premium Digital Marketplace'}</div>
        <div style="width:40px;height:4px;border-radius:99px;margin:10px auto 0;background:${b.primaryColor||'#6366f1'}"></div>
      </div>
    </div>
  </div>`;
}

window.saveBranding = function() {
  const cfg = getSiteCfg();
  cfg.branding = {
    siteName: document.getElementById('br-name')?.value || 'DigiKraft',
    tagline: document.getElementById('br-tagline')?.value || 'Premium Digital Marketplace',
    logoUrl: document.getElementById('br-logo')?.value || '',
    faviconUrl: document.getElementById('br-favicon')?.value || '',
    primaryColor: document.getElementById('br-color-hex')?.value || '#6366f1'
  };
  saveSiteCfg(cfg);
};
