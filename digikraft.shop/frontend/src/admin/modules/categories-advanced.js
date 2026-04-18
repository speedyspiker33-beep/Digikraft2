// ===== ADVANCED CATEGORIES MODULE =====
// Tree structure, subcategories, tags, SEO, interconnections

// ── SEED DATA ─────────────────────────────────────────────────────────────────
(function seedCats() {
  if (localStorage.getItem('dk_cats_v2')) return;
  const cats = [
    {
      id:'cat-1', name:'Graphics', slug:'graphics', icon:'🎨', color:'#6366f1',
      description:'Premium graphics, illustrations, icons and visual assets',
      tags:['design','visual','creative','artwork'],
      seoTitle:'Graphics & Visual Assets | DigiKraft',
      seoDesc:'Download premium graphics, illustrations, icons and visual assets for your projects.',
      seoKeywords:'graphics, illustrations, icons, vectors, design assets',
      status:'active', featured:true, order:1, parentId:null,
      linkedPages:[], linkedHubs:['coreldraw'],
      productCount:0, createdAt:new Date().toISOString()
    },
    {
      id:'cat-2', name:'Fonts', slug:'fonts', icon:'🔤', color:'#8b5cf6',
      description:'Professional typefaces for every design need',
      tags:['typography','typeface','lettering','text'],
      seoTitle:'Fonts & Typography | DigiKraft',
      seoDesc:'Download professional fonts and typefaces for web, print and branding projects.',
      seoKeywords:'fonts, typography, typeface, serif, sans-serif, script fonts',
      status:'active', featured:true, order:2, parentId:null,
      linkedPages:[], linkedHubs:[],
      productCount:0, createdAt:new Date().toISOString()
    },
    {
      id:'cat-3', name:'Templates', slug:'templates', icon:'📄', color:'#06b6d4',
      description:'Ready-to-use templates for web, print and social media',
      tags:['template','layout','design','ready-made'],
      seoTitle:'Design Templates | DigiKraft',
      seoDesc:'Download ready-to-use templates for websites, social media, print and presentations.',
      seoKeywords:'templates, web templates, social media templates, print templates',
      status:'active', featured:true, order:3, parentId:null,
      linkedPages:[], linkedHubs:[],
      productCount:0, createdAt:new Date().toISOString()
    },
    {
      id:'cat-4', name:'UI Kits', slug:'ui-kits', icon:'🖥️', color:'#10b981',
      description:'Complete UI component libraries and design systems',
      tags:['ui','ux','components','design-system','figma'],
      seoTitle:'UI Kits & Design Systems | DigiKraft',
      seoDesc:'Download complete UI kits and design systems for web and mobile app design.',
      seoKeywords:'ui kit, design system, components, figma, sketch, adobe xd',
      status:'active', featured:false, order:4, parentId:null,
      linkedPages:[], linkedHubs:[],
      productCount:0, createdAt:new Date().toISOString()
    },
    {
      id:'cat-5', name:'Icons', slug:'icons', icon:'⭐', color:'#f59e0b',
      description:'Icon sets for web, mobile and print design',
      tags:['icons','symbols','pictograms','svg'],
      seoTitle:'Icon Sets & Packs | DigiKraft',
      seoDesc:'Download premium icon sets and packs for web, mobile and print design projects.',
      seoKeywords:'icons, icon pack, svg icons, vector icons, icon set',
      status:'active', featured:false, order:5, parentId:null,
      linkedPages:[], linkedHubs:[],
      productCount:0, createdAt:new Date().toISOString()
    },
    {
      id:'cat-6', name:'3D Assets', slug:'3d', icon:'🎲', color:'#ef4444',
      description:'3D models, mockups, textures and renders',
      tags:['3d','models','mockups','textures','renders'],
      seoTitle:'3D Assets & Models | DigiKraft',
      seoDesc:'Download premium 3D models, mockups, textures and renders for your projects.',
      seoKeywords:'3d models, mockups, textures, 3d assets, renders',
      status:'active', featured:false, order:6, parentId:null,
      linkedPages:[], linkedHubs:[],
      productCount:0, createdAt:new Date().toISOString()
    },
    {
      id:'cat-7', name:'Mockups', slug:'mockups', icon:'📱', color:'#ec4899',
      description:'Product mockups for branding and presentation',
      tags:['mockup','presentation','branding','product'],
      seoTitle:'Product Mockups | DigiKraft',
      seoDesc:'Download professional product mockups for branding and presentation.',
      seoKeywords:'mockups, product mockup, branding mockup, t-shirt mockup, phone mockup',
      status:'active', featured:false, order:7, parentId:null,
      linkedPages:[], linkedHubs:[],
      productCount:0, createdAt:new Date().toISOString()
    },
    {
      id:'cat-8', name:'Patterns', slug:'patterns', icon:'🔷', color:'#14b8a6',
      description:'Seamless patterns and backgrounds for design',
      tags:['pattern','seamless','background','texture','repeat'],
      seoTitle:'Patterns & Backgrounds | DigiKraft',
      seoDesc:'Download seamless patterns and backgrounds for web and print design.',
      seoKeywords:'patterns, seamless patterns, backgrounds, textures, repeat patterns',
      status:'active', featured:false, order:8, parentId:null,
      linkedPages:[], linkedHubs:[],
      productCount:0, createdAt:new Date().toISOString()
    },
    // Subcategories of Graphics
    {
      id:'cat-1-1', name:'Logos & Branding', slug:'logos-branding', icon:'🏷️', color:'#6366f1',
      description:'Logo templates and branding identity packages',
      tags:['logo','branding','identity','brand'],
      seoTitle:'Logo Templates & Branding | DigiKraft',
      seoDesc:'Download professional logo templates and branding identity packages.',
      seoKeywords:'logo templates, branding, brand identity, logo design',
      status:'active', featured:false, order:1, parentId:'cat-1',
      linkedPages:[], linkedHubs:[], productCount:0, createdAt:new Date().toISOString()
    },
    {
      id:'cat-1-2', name:'Illustrations', slug:'illustrations', icon:'🖼️', color:'#6366f1',
      description:'Hand-drawn and digital illustrations',
      tags:['illustration','drawing','artwork','vector'],
      seoTitle:'Illustrations & Artwork | DigiKraft',
      seoDesc:'Download premium hand-drawn and digital illustrations for your projects.',
      seoKeywords:'illustrations, digital art, vector illustrations, hand-drawn',
      status:'active', featured:false, order:2, parentId:'cat-1',
      linkedPages:[], linkedHubs:[], productCount:0, createdAt:new Date().toISOString()
    },
    {
      id:'cat-1-3', name:'Vectors', slug:'vectors', icon:'📐', color:'#6366f1',
      description:'Vector graphics and clipart collections',
      tags:['vector','clipart','svg','eps','ai'],
      seoTitle:'Vector Graphics & Clipart | DigiKraft',
      seoDesc:'Download premium vector graphics and clipart for your design projects.',
      seoKeywords:'vectors, vector graphics, clipart, svg, eps files',
      status:'active', featured:false, order:3, parentId:'cat-1',
      linkedPages:[], linkedHubs:[], productCount:0, createdAt:new Date().toISOString()
    },
    // Subcategories of Fonts
    {
      id:'cat-2-1', name:'Serif Fonts', slug:'serif-fonts', icon:'📖', color:'#8b5cf6',
      description:'Classic and modern serif typefaces',
      tags:['serif','classic','editorial','print'],
      seoTitle:'Serif Fonts | DigiKraft',
      seoDesc:'Download premium serif fonts for editorial, print and branding projects.',
      seoKeywords:'serif fonts, serif typeface, editorial fonts, print fonts',
      status:'active', featured:false, order:1, parentId:'cat-2',
      linkedPages:[], linkedHubs:[], productCount:0, createdAt:new Date().toISOString()
    },
    {
      id:'cat-2-2', name:'Sans Serif', slug:'sans-serif-fonts', icon:'🔡', color:'#8b5cf6',
      description:'Clean and modern sans serif typefaces',
      tags:['sans-serif','modern','clean','digital'],
      seoTitle:'Sans Serif Fonts | DigiKraft',
      seoDesc:'Download clean and modern sans serif fonts for digital and print projects.',
      seoKeywords:'sans serif fonts, modern fonts, clean fonts, digital fonts',
      status:'active', featured:false, order:2, parentId:'cat-2',
      linkedPages:[], linkedHubs:[], productCount:0, createdAt:new Date().toISOString()
    },
    {
      id:'cat-2-3', name:'Script & Handwritten', slug:'script-fonts', icon:'✍️', color:'#8b5cf6',
      description:'Elegant script and handwritten typefaces',
      tags:['script','handwritten','calligraphy','cursive'],
      seoTitle:'Script & Handwritten Fonts | DigiKraft',
      seoDesc:'Download elegant script and handwritten fonts for invitations and branding.',
      seoKeywords:'script fonts, handwritten fonts, calligraphy fonts, cursive fonts',
      status:'active', featured:false, order:3, parentId:'cat-2',
      linkedPages:[], linkedHubs:[], productCount:0, createdAt:new Date().toISOString()
    },
  ];
  localStorage.setItem('dk_cats_v2', JSON.stringify(cats));
})();

window._catTab = window._catTab || 'tree';
window._catSearch = window._catSearch || '';
window._catExpanded = window._catExpanded || {};
window._catEditing = window._catEditing || null;

// ── HELPERS ───────────────────────────────────────────────────────────────────
function getCats() { return JSON.parse(localStorage.getItem('dk_cats_v2') || '[]'); }
function saveCats(v) { localStorage.setItem('dk_cats_v2', JSON.stringify(v)); }
function getRoots(cats) { return cats.filter(c => !c.parentId).sort((a,b)=>a.order-b.order); }
function getChildren(cats, parentId) { return cats.filter(c => c.parentId === parentId).sort((a,b)=>a.order-b.order); }
function countProducts(catId) { return JSON.parse(localStorage.getItem('dk_p')||'[]').filter(p=>p.category===catId||p.categoryId===catId).length; }
function countAllProducts(cats, catId) {
  const direct = countProducts(catId);
  const children = getChildren(cats, catId);
  return direct + children.reduce((s,c)=>s+countAllProducts(cats,c.id),0);
}

// ── MAIN RENDER ───────────────────────────────────────────────────────────────
window.renderCategories = function() {
  if (window._catEditing) return renderCatEditor(window._catEditing);
  const cats = getCats();
  const search = document.getElementById('cat-search')?.value || '';
  const tab = window._catTab;

  const filtered = search ? cats.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.tags||[]).some(t=>t.toLowerCase().includes(search.toLowerCase())) ||
    (c.seoKeywords||'').toLowerCase().includes(search.toLowerCase())
  ) : cats;

  const roots = getRoots(filtered);
  const totalProducts = JSON.parse(localStorage.getItem('dk_p')||'[]').length;

  return `
  <div class="ph">
    <div><div class="ph-title">Categories</div><div class="ph-sub">${cats.length} categories · ${cats.filter(c=>!c.parentId).length} root · ${cats.filter(c=>c.parentId).length} subcategories</div></div>
    <div class="ph-actions">
      <button class="btn btn-primary" onclick="openCatEditor('new',null)"><i class="fas fa-plus"></i>New Category</button>
    </div>
  </div>

  <!-- SEARCH + TABS -->
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap">
    <div class="ts" style="flex:1;min-width:200px"><i class="fas fa-search"></i><input type="text" id="cat-search" placeholder="Search categories, tags, keywords..." oninput="navigate('categories')" value="${search}"></div>
    <div class="tabs" style="margin-bottom:0">
      ${[['tree','Tree View'],['grid','Grid View'],['table','Table View'],['seo','SEO Overview']].map(([id,lb])=>
        `<button class="tab ${tab===id?'on':''}" onclick="window._catTab='${id}';navigate('categories')">${lb}</button>`
      ).join('')}
    </div>
  </div>

  ${tab==='tree'?renderTreeView(cats, filtered, roots, search):''}
  ${tab==='grid'?renderGridView(cats, filtered):''}
  ${tab==='table'?renderTableView(cats, filtered):''}
  ${tab==='seo'?renderSEOView(cats, filtered):''}

  <!-- CATEGORY MODAL -->
  ${renderCatModal()}`;
};

// ── TREE VIEW ─────────────────────────────────────────────────────────────────
function renderTreeView(allCats, filtered, roots, search) {
  const renderNode = (cat, depth=0) => {
    const children = getChildren(allCats, cat.id);
    const expanded = window._catExpanded[cat.id] !== false; // default expanded
    const prodCount = countAllProducts(allCats, cat.id);
    const directCount = countProducts(cat.id);
    const products = JSON.parse(localStorage.getItem('dk_p')||'[]').filter(p=>p.category===cat.id||p.categoryId===cat.id);
    const pages = JSON.parse(localStorage.getItem('dk_landing_pages')||'[]').filter(p=>(p.categories||[]).includes(cat.id));

    return `
    <div style="margin-left:${depth*20}px">
      <div style="display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:10px;background:var(--bg3);border:1px solid var(--border);margin-bottom:4px;transition:.15s" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'">
        <!-- Expand toggle -->
        ${children.length ? `<button onclick="window._catExpanded['${cat.id}']=!window._catExpanded['${cat.id}'];navigate('categories')" style="background:none;border:none;color:var(--text3);cursor:pointer;width:18px;font-size:11px"><i class="fas fa-chevron-${expanded?'down':'right'}"></i></button>` : '<span style="width:18px"></span>'}
        <!-- Icon + Color dot -->
        <div style="width:32px;height:32px;border-radius:8px;background:${cat.color}22;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;border:2px solid ${cat.color}44">${cat.icon||'📁'}</div>
        <!-- Name + slug -->
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            <strong style="font-size:14px">${cat.name}</strong>
            <span style="font-size:10px;color:var(--text3);font-family:monospace">/${cat.slug}</span>
            ${cat.featured?'<span class="tag ty" style="font-size:9px">Featured</span>':''}
            <span class="tag ${cat.status==='active'?'tg':'tr'}" style="font-size:9px">${cat.status}</span>
            ${cat.parentId?'':'<span class="tag tb" style="font-size:9px">Root</span>'}
          </div>
          <!-- Tags -->
          <div style="display:flex;gap:3px;flex-wrap:wrap;margin-top:3px">
            ${(cat.tags||[]).map(t=>`<span style="background:var(--bg4);color:var(--text3);font-size:10px;padding:1px 6px;border-radius:99px">#${t}</span>`).join('')}
          </div>
        </div>
        <!-- Stats -->
        <div style="display:flex;gap:12px;align-items:center;flex-shrink:0">
          <div style="text-align:center;cursor:pointer" onclick="filterProductsByCat('${cat.id}')" title="Products in this category">
            <div style="font-size:14px;font-weight:700;color:var(--accent)">${prodCount}</div>
            <div style="font-size:10px;color:var(--text3)">products</div>
          </div>
          ${children.length?`<div style="text-align:center"><div style="font-size:14px;font-weight:700;color:var(--blue)">${children.length}</div><div style="font-size:10px;color:var(--text3)">subcats</div></div>`:''}
          ${pages.length?`<div style="text-align:center"><div style="font-size:14px;font-weight:700;color:var(--purple)">${pages.length}</div><div style="font-size:10px;color:var(--text3)">pages</div></div>`:''}
        </div>
        <!-- Actions -->
        <div style="display:flex;gap:4px;flex-shrink:0">
          <button class="btn btn-secondary btn-sm btn-icon" onclick="openCatEditor('${cat.id}',null)" title="Edit"><i class="fas fa-edit"></i></button>
          <button class="btn btn-secondary btn-sm btn-icon" onclick="openCatEditor('new','${cat.id}')" title="Add Subcategory"><i class="fas fa-folder-plus"></i></button>
          <button class="btn btn-secondary btn-sm btn-icon" onclick="viewCatProducts('${cat.id}')" title="View Products"><i class="fas fa-box"></i></button>
          <button class="btn btn-danger btn-sm btn-icon" onclick="deleteCat('${cat.id}')" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </div>
      ${expanded && children.length ? children.map(child=>renderNode(child, depth+1)).join('') : ''}
    </div>`;
  };

  return `
  <div class="card">
    ${roots.length ? roots.map(r=>renderNode(r)).join('') : `<div class="es"><i class="fas fa-folder"></i><p>No categories found. <a href="#" onclick="openCatEditor('new',null)" style="color:var(--accent)">Add your first category</a></p></div>`}
  </div>`;
}

// ── GRID VIEW ─────────────────────────────────────────────────────────────────
function renderGridView(allCats, filtered) {
  const roots = getRoots(filtered);
  return `
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px">
    ${roots.map(cat=>{
      const children = getChildren(allCats, cat.id);
      const prodCount = countAllProducts(allCats, cat.id);
      return `
      <div class="card" style="cursor:pointer;transition:.2s;border-top:3px solid ${cat.color}" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='var(--shadow)'" onmouseout="this.style.transform='none';this.style.boxShadow='none'">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
          <div style="width:44px;height:44px;border-radius:11px;background:${cat.color}22;display:flex;align-items:center;justify-content:center;font-size:22px;border:2px solid ${cat.color}44">${cat.icon||'📁'}</div>
          <div>
            <div style="font-size:15px;font-weight:700">${cat.name}</div>
            <div style="font-size:11px;color:var(--text3)">/${cat.slug}</div>
          </div>
          <span class="tag ${cat.status==='active'?'tg':'tr'}" style="margin-left:auto;font-size:10px">${cat.status}</span>
        </div>
        <p style="font-size:12px;color:var(--text2);margin-bottom:10px;line-height:1.5">${cat.description||'—'}</p>
        <!-- Tags -->
        <div style="display:flex;gap:3px;flex-wrap:wrap;margin-bottom:10px">
          ${(cat.tags||[]).slice(0,4).map(t=>`<span style="background:var(--bg3);color:var(--text3);font-size:10px;padding:2px 7px;border-radius:99px">#${t}</span>`).join('')}
        </div>
        <!-- Stats row -->
        <div style="display:flex;gap:12px;padding:10px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border);margin-bottom:10px">
          <div style="text-align:center;flex:1"><div style="font-size:16px;font-weight:700;color:var(--accent)">${prodCount}</div><div style="font-size:10px;color:var(--text3)">Products</div></div>
          <div style="text-align:center;flex:1"><div style="font-size:16px;font-weight:700;color:var(--blue)">${children.length}</div><div style="font-size:10px;color:var(--text3)">Subcats</div></div>
        </div>
        <!-- Subcategories -->
        ${children.length?`<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px">${children.map(c=>`<span style="background:${c.color}22;color:${c.color};font-size:11px;padding:2px 8px;border-radius:6px;cursor:pointer" onclick="openCatEditor('${c.id}',null)">${c.icon||''} ${c.name}</span>`).join('')}</div>`:''}
        <!-- Actions -->
        <div style="display:flex;gap:6px">
          <button class="btn btn-primary btn-sm" onclick="openCatEditor('${cat.id}',null)"><i class="fas fa-edit"></i>Edit</button>
          <button class="btn btn-secondary btn-sm" onclick="openCatEditor('new','${cat.id}')"><i class="fas fa-plus"></i>Sub</button>
          <button class="btn btn-secondary btn-sm" onclick="viewCatProducts('${cat.id}')"><i class="fas fa-box"></i>${prodCount}</button>
        </div>
      </div>`;
    }).join('')}
    <div class="card" style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:180px;cursor:pointer;border-style:dashed" onclick="openCatEditor('new',null)" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'">
      <i class="fas fa-folder-plus" style="font-size:28px;color:var(--text3);margin-bottom:8px"></i>
      <div style="font-size:13px;color:var(--text2);font-weight:600">Add Category</div>
    </div>
  </div>`;
}

// ── TABLE VIEW ────────────────────────────────────────────────────────────────
function renderTableView(allCats, filtered) {
  return `
  <div class="card">
    <div class="tw"><table>
      <thead><tr><th>Category</th><th>Parent</th><th>Tags</th><th>Products</th><th>Status</th><th>SEO Title</th><th>Actions</th></tr></thead>
      <tbody>${filtered.map(cat=>{
        const parent = cat.parentId ? allCats.find(c=>c.id===cat.parentId) : null;
        const prodCount = countProducts(cat.id);
        return `<tr>
          <td><div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:16px">${cat.icon||'📁'}</span>
            <div class="pi"><strong>${cat.name}</strong><span>/${cat.slug}</span></div>
          </div></td>
          <td style="font-size:12px">${parent?`<span style="color:var(--accent)">${parent.icon} ${parent.name}</span>`:'<span class="tag tb" style="font-size:10px">Root</span>'}</td>
          <td>${(cat.tags||[]).slice(0,3).map(t=>`<span style="background:var(--bg3);color:var(--text3);font-size:10px;padding:1px 6px;border-radius:99px;margin:1px">#${t}</span>`).join('')}</td>
          <td><strong style="color:var(--accent)">${prodCount}</strong></td>
          <td><span class="tag ${cat.status==='active'?'tg':'tr'}">${cat.status}</span></td>
          <td style="font-size:11px;color:var(--text2);max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${cat.seoTitle||'—'}</td>
          <td><div style="display:flex;gap:4px">
            <button class="btn btn-sm btn-secondary btn-icon" onclick="openCatEditor('${cat.id}',null)"><i class="fas fa-edit"></i></button>
            <button class="btn btn-sm btn-secondary btn-icon" onclick="openCatEditor('new','${cat.id}')"><i class="fas fa-folder-plus"></i></button>
            <button class="btn btn-sm btn-danger btn-icon" onclick="deleteCat('${cat.id}')"><i class="fas fa-trash"></i></button>
          </div></td>
        </tr>`;
      }).join('')}</tbody>
    </table></div>
  </div>`;
}

// ── SEO VIEW ──────────────────────────────────────────────────────────────────
function renderSEOView(allCats, filtered) {
  return `
  <div class="card">
    <div class="card-hd"><div class="card-title"><i class="fas fa-search" style="color:var(--accent)"></i>SEO Overview</div></div>
    <div class="tw"><table>
      <thead><tr><th>Category</th><th>SEO Title</th><th>SEO Description</th><th>Keywords</th><th>Score</th><th>Actions</th></tr></thead>
      <tbody>${filtered.map(cat=>{
        const hasTitle = !!cat.seoTitle;
        const hasDesc = !!cat.seoDesc;
        const hasKw = !!cat.seoKeywords;
        const score = [hasTitle,hasDesc,hasKw].filter(Boolean).length;
        const scoreColor = score===3?'var(--green)':score===2?'var(--yellow)':'var(--red)';
        return `<tr>
          <td><div style="display:flex;align-items:center;gap:8px"><span>${cat.icon||'📁'}</span><strong>${cat.name}</strong></div></td>
          <td style="font-size:12px;max-width:180px">
            ${cat.seoTitle?`<span style="color:var(--text)">${cat.seoTitle.slice(0,40)}${cat.seoTitle.length>40?'…':''}</span>`:'<span style="color:var(--red)">Missing</span>'}
            ${cat.seoTitle?`<div style="font-size:10px;color:${cat.seoTitle.length<30||cat.seoTitle.length>60?'var(--yellow)':'var(--green)'}">${cat.seoTitle.length} chars (ideal: 30-60)</div>`:''}
          </td>
          <td style="font-size:12px;max-width:200px">
            ${cat.seoDesc?`<span style="color:var(--text)">${cat.seoDesc.slice(0,50)}…</span>`:'<span style="color:var(--red)">Missing</span>'}
            ${cat.seoDesc?`<div style="font-size:10px;color:${cat.seoDesc.length<120||cat.seoDesc.length>160?'var(--yellow)':'var(--green)'}">${cat.seoDesc.length} chars (ideal: 120-160)</div>`:''}
          </td>
          <td style="font-size:11px;color:var(--text2)">${cat.seoKeywords||'<span style="color:var(--red)">Missing</span>'}</td>
          <td>
            <div style="display:flex;align-items:center;gap:6px">
              <div style="width:36px;height:36px;border-radius:50%;border:3px solid ${scoreColor};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:${scoreColor}">${score}/3</div>
            </div>
          </td>
          <td><button class="btn btn-sm btn-primary" onclick="openCatEditor('${cat.id}',null)"><i class="fas fa-edit"></i>Fix SEO</button></td>
        </tr>`;
      }).join('')}</tbody>
    </table></div>
  </div>`;
}

// ── EDITOR ────────────────────────────────────────────────────────────────────
function renderCatEditor(id) {
  const cats = getCats();
  const isNew = id === 'new';
  const cat = isNew ? { id:'new', status:'active', tags:[], linkedPages:[], linkedHubs:[], parentId:null } : cats.find(c=>c.id===id);
  if (!cat) return `<div class="es"><i class="fas fa-folder"></i><p>Category not found</p><button class="btn btn-secondary" onclick="window._catEditing=null;navigate('categories')">Back</button></div>`;

  const roots = getRoots(cats).filter(c=>c.id!==id);
  const products = JSON.parse(localStorage.getItem('dk_p')||'[]');
  const landingPages = JSON.parse(localStorage.getItem('dk_landing_pages')||'[]');
  const catProducts = isNew ? [] : products.filter(p=>p.category===id||p.categoryId===id);

  return `
  <div class="ph">
    <div style="display:flex;align-items:center;gap:10px">
      <button class="btn btn-secondary btn-sm" onclick="window._catEditing=null;navigate('categories')"><i class="fas fa-arrow-left"></i>Back</button>
      <div><div class="ph-title">${isNew?'New Category':cat.name}</div><div class="ph-sub">${isNew?'Create a new category':'Edit category details, SEO, and connections'}</div></div>
    </div>
    <div class="ph-actions">
      <button class="btn btn-primary" onclick="saveCatEditor()"><i class="fas fa-save"></i>Save Category</button>
    </div>
  </div>

  <div class="g2" style="align-items:start">
    <!-- LEFT: MAIN FORM -->
    <div style="display:flex;flex-direction:column;gap:14px">

      <!-- BASIC INFO -->
      <div class="card">
        <div class="card-hd"><div class="card-title"><i class="fas fa-folder" style="color:var(--accent)"></i>Basic Information</div></div>
        <div class="fgrid">
          <div class="fg"><label class="fl">Category Name *</label><input class="fc" id="ce-name" value="${cat.name||''}" placeholder="e.g. Graphics" oninput="updateCatSlug(this.value)"></div>
          <div class="fg"><label class="fl">URL Slug *</label><input class="fc" id="ce-slug" value="${cat.slug||''}" placeholder="graphics"></div>
          <div class="fg"><label class="fl">Icon (emoji)</label><input class="fc" id="ce-icon" value="${cat.icon||''}" placeholder="🎨" maxlength="4" style="font-size:20px"></div>
          <div class="fg"><label class="fl">Color</label>
            <div style="display:flex;gap:8px;align-items:center">
              <input type="color" id="ce-color" value="${cat.color||'#6366f1'}" style="width:44px;height:36px;border-radius:8px;border:1px solid var(--border);background:none;cursor:pointer">
              <input class="fc" id="ce-color-hex" value="${cat.color||'#6366f1'}" style="flex:1" oninput="document.getElementById('ce-color').value=this.value">
            </div>
          </div>
          <div class="fg cs2"><label class="fl">Description</label><textarea class="fc" id="ce-desc" rows="2">${cat.description||''}</textarea></div>
          <div class="fg"><label class="fl">Parent Category</label>
            <select class="fc" id="ce-parent">
              <option value="">None (Root Category)</option>
              ${roots.map(r=>`<option value="${r.id}" ${cat.parentId===r.id?'selected':''}>${r.icon||''} ${r.name}</option>`).join('')}
            </select>
          </div>
          <div class="fg"><label class="fl">Status</label>
            <select class="fc" id="ce-status">
              <option value="active" ${cat.status==='active'?'selected':''}>Active</option>
              <option value="inactive" ${cat.status==='inactive'?'selected':''}>Inactive</option>
              <option value="draft" ${cat.status==='draft'?'selected':''}>Draft</option>
            </select>
          </div>
          <div class="fg"><label class="fl">Display Order</label><input class="fc" id="ce-order" type="number" value="${cat.order||1}" min="1"></div>
          <div class="fg cs2" style="display:flex;align-items:center;gap:10px;background:var(--bg3);padding:12px;border-radius:9px">
            <input type="checkbox" id="ce-featured" ${cat.featured?'checked':''} style="width:16px;height:16px">
            <label for="ce-featured" style="cursor:pointer;font-size:13px;font-weight:600"><i class="fas fa-star" style="color:var(--yellow);margin-right:6px"></i>Featured Category (show in homepage)</label>
          </div>
        </div>
      </div>

      <!-- TAGS -->
      <div class="card">
        <div class="card-hd"><div class="card-title"><i class="fas fa-tags" style="color:var(--blue)"></i>Tags</div></div>
        <div class="fg"><label class="fl">Tags (comma separated)</label>
          <input class="fc" id="ce-tags" value="${(cat.tags||[]).join(', ')}" placeholder="design, visual, creative, artwork">
          <div style="font-size:11px;color:var(--text3);margin-top:4px">Tags help with search and filtering. Use relevant keywords.</div>
        </div>
        <!-- Tag preview -->
        <div id="ce-tag-preview" style="display:flex;gap:4px;flex-wrap:wrap;margin-top:6px">
          ${(cat.tags||[]).map(t=>`<span style="background:var(--bg3);color:var(--text2);font-size:12px;padding:3px 10px;border-radius:99px">#${t}</span>`).join('')}
        </div>
      </div>

      <!-- SEO -->
      <div class="card">
        <div class="card-hd"><div class="card-title"><i class="fas fa-search" style="color:var(--green)"></i>SEO Settings</div></div>
        <div class="fg"><label class="fl">SEO Title <span style="font-size:10px;color:var(--text3)">(30-60 chars ideal)</span></label>
          <input class="fc" id="ce-seo-title" value="${cat.seoTitle||''}" placeholder="Category Name | DigiKraft" oninput="updateSEOPreview()">
          <div id="ce-seo-title-count" style="font-size:11px;margin-top:3px;color:var(--text3)">${(cat.seoTitle||'').length} chars</div>
        </div>
        <div class="fg"><label class="fl">SEO Description <span style="font-size:10px;color:var(--text3)">(120-160 chars ideal)</span></label>
          <textarea class="fc" id="ce-seo-desc" rows="3" placeholder="Describe this category for search engines..." oninput="updateSEOPreview()">${cat.seoDesc||''}</textarea>
          <div id="ce-seo-desc-count" style="font-size:11px;margin-top:3px;color:var(--text3)">${(cat.seoDesc||'').length} chars</div>
        </div>
        <div class="fg"><label class="fl">SEO Keywords <span style="font-size:10px;color:var(--text3)">(comma separated)</span></label>
          <input class="fc" id="ce-seo-kw" value="${cat.seoKeywords||''}" placeholder="graphics, illustrations, icons, vectors">
        </div>
        <!-- Google Preview -->
        <div style="background:var(--bg3);border-radius:10px;padding:14px;margin-top:8px">
          <div style="font-size:11px;color:var(--text3);font-weight:700;margin-bottom:8px">GOOGLE SEARCH PREVIEW</div>
          <div id="seo-prev-title" style="color:#1a0dab;font-size:16px;font-weight:500">${cat.seoTitle||cat.name||'Category Title'}</div>
          <div style="color:#006621;font-size:12px">digikraft.shop/category/${cat.slug||'category-slug'}</div>
          <div id="seo-prev-desc" style="color:var(--text2);font-size:12px;margin-top:3px">${cat.seoDesc||'Category description will appear here...'}</div>
        </div>
      </div>

      <!-- CONNECTIONS -->
      <div class="card">
        <div class="card-hd"><div class="card-title"><i class="fas fa-link" style="color:var(--purple)"></i>Connections</div></div>
        <div class="fg"><label class="fl">Linked Landing Pages</label>
          <div style="display:flex;flex-direction:column;gap:4px">
            ${landingPages.map(p=>`
            <label style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:var(--bg3);border-radius:8px;cursor:pointer;font-size:13px">
              <input type="checkbox" name="linked-pages" value="${p.id}" ${(cat.linkedPages||[]).includes(p.id)?'checked':''} style="width:14px;height:14px">
              <span>${p.name}</span><span style="font-size:10px;color:var(--text3)">/product-landing/${p.slug}</span>
            </label>`).join('') || '<div style="font-size:12px;color:var(--text3)">No landing pages created yet</div>'}
          </div>
        </div>
        <div class="fg"><label class="fl">Linked Hub Pages</label>
          <div style="display:flex;flex-wrap:wrap;gap:6px">
            ${['coreldraw','ai-workflow','design-arsenal','fonts-hub','templates-hub'].map(h=>`
            <label style="display:flex;align-items:center;gap:6px;padding:5px 10px;background:var(--bg3);border-radius:8px;cursor:pointer;font-size:12px">
              <input type="checkbox" name="linked-hubs" value="${h}" ${(cat.linkedHubs||[]).includes(h)?'checked':''} style="width:13px;height:13px">
              ${h}
            </label>`).join('')}
          </div>
        </div>
      </div>

    </div>

    <!-- RIGHT: PRODUCTS IN THIS CATEGORY -->
    <div style="display:flex;flex-direction:column;gap:14px">
      <div class="card">
        <div class="card-hd">
          <div class="card-title"><i class="fas fa-box" style="color:var(--accent)"></i>Products (${catProducts.length})</div>
          <button class="btn btn-primary btn-sm" onclick="openAddProd()"><i class="fas fa-plus"></i>Add Product</button>
        </div>
        ${catProducts.length ? `
        <div style="display:flex;flex-direction:column;gap:6px;max-height:400px;overflow-y:auto">
          ${catProducts.map(p=>`
          <div style="display:flex;align-items:center;gap:8px;padding:8px;background:var(--bg3);border-radius:8px">
            <img src="${p.image||''}" onerror="this.src='https://via.placeholder.com/32'" style="width:32px;height:32px;border-radius:6px;object-fit:cover;flex-shrink:0">
            <div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.title||p.name}</div><div style="font-size:10px;color:var(--text3)">₹${p.price}</div></div>
            <span class="tag ${p.status==='published'?'tg':'ty'}" style="font-size:10px">${p.status||'draft'}</span>
            <button class="btn btn-sm btn-secondary btn-icon" onclick="editProd('${p.id}')"><i class="fas fa-edit"></i></button>
          </div>`).join('')}
        </div>` : `<div class="es" style="padding:20px"><i class="fas fa-box-open"></i><p>No products in this category</p></div>`}
      </div>

      <!-- SUBCATEGORIES -->
      <div class="card">
        <div class="card-hd">
          <div class="card-title"><i class="fas fa-folder-open" style="color:var(--blue)"></i>Subcategories</div>
          <button class="btn btn-secondary btn-sm" onclick="openCatEditor('new','${cat.id}')"><i class="fas fa-plus"></i>Add Sub</button>
        </div>
        ${!isNew ? (() => {
          const children = getChildren(cats, cat.id);
          return children.length ? `
          <div style="display:flex;flex-direction:column;gap:4px">
            ${children.map(c=>`
            <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--bg3);border-radius:8px">
              <span style="font-size:16px">${c.icon||'📁'}</span>
              <div style="flex:1"><div style="font-size:13px;font-weight:600">${c.name}</div><div style="font-size:10px;color:var(--text3)">/${c.slug} · ${countProducts(c.id)} products</div></div>
              <button class="btn btn-sm btn-secondary btn-icon" onclick="openCatEditor('${c.id}',null)"><i class="fas fa-edit"></i></button>
            </div>`).join('')}
          </div>` : `<div class="es" style="padding:16px"><i class="fas fa-folder"></i><p>No subcategories</p></div>`;
        })() : '<div style="font-size:12px;color:var(--text3);padding:8px">Save this category first to add subcategories</div>'}
      </div>
    </div>
  </div>
  <input type="hidden" id="ce-id" value="${cat.id}">`;
}

function renderCatModal() { return ''; } // Editor is full-page, no modal needed

// ── ACTIONS ───────────────────────────────────────────────────────────────────
window.openCatEditor = function(id, parentId) {
  if (id === 'new' && parentId === 'prompt') {
    const name = prompt('Category name:');
    if (!name) return;
    const cats = getCats();
    cats.push({
      id: 'cat-'+Date.now(), name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),
      icon:'📁', color:'#6366f1', description:'', tags:[], seoTitle:'', seoDesc:'', seoKeywords:'',
      status:'active', featured:false, order:cats.length+1, parentId:null,
      linkedPages:[], linkedHubs:[], productCount:0, createdAt:new Date().toISOString()
    });
    saveCats(cats);
    window.toast('Category added!');
    navigate('categories');
    return;
  }
  window._catEditing = id;
  if (id === 'new') window._newCatParent = parentId;
  navigate('categories');
};

window.updateCatSlug = function(name) {
  const el = document.getElementById('ce-slug');
  if (el && !el.dataset.manual) el.value = name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
};

window.updateSEOPreview = function() {
  const title = document.getElementById('ce-seo-title')?.value || '';
  const desc = document.getElementById('ce-seo-desc')?.value || '';
  const tc = document.getElementById('ce-seo-title-count');
  const dc = document.getElementById('ce-seo-desc-count');
  const pt = document.getElementById('seo-prev-title');
  const pd = document.getElementById('seo-prev-desc');
  if (tc) tc.textContent = title.length + ' chars';
  if (dc) dc.textContent = desc.length + ' chars';
  if (pt) pt.textContent = title || 'Category Title';
  if (pd) pd.textContent = desc || 'Description...';
};

window.saveCatEditor = function() {
  const cats = getCats();
  const id = document.getElementById('ce-id')?.value;
  const isNew = id === 'new';
  const linkedPages = [...document.querySelectorAll('[name="linked-pages"]:checked')].map(c=>c.value);
  const linkedHubs = [...document.querySelectorAll('[name="linked-hubs"]:checked')].map(c=>c.value);
  const tags = (document.getElementById('ce-tags')?.value||'').split(',').map(t=>t.trim()).filter(Boolean);
  const color = document.getElementById('ce-color-hex')?.value || document.getElementById('ce-color')?.value || '#6366f1';

  const cat = {
    id: isNew ? 'cat-'+Date.now() : id,
    name: document.getElementById('ce-name')?.value || '',
    slug: document.getElementById('ce-slug')?.value || '',
    icon: document.getElementById('ce-icon')?.value || '📁',
    color,
    description: document.getElementById('ce-desc')?.value || '',
    parentId: document.getElementById('ce-parent')?.value || null,
    status: document.getElementById('ce-status')?.value || 'active',
    order: parseInt(document.getElementById('ce-order')?.value||1),
    featured: document.getElementById('ce-featured')?.checked || false,
    tags, linkedPages, linkedHubs,
    seoTitle: document.getElementById('ce-seo-title')?.value || '',
    seoDesc: document.getElementById('ce-seo-desc')?.value || '',
    seoKeywords: document.getElementById('ce-seo-kw')?.value || '',
    createdAt: isNew ? new Date().toISOString() : (cats.find(c=>c.id===id)?.createdAt||new Date().toISOString()),
    updatedAt: new Date().toISOString()
  };

  if (!cat.name) return window.toast('Category name is required', 'w');
  if (!cat.slug) return window.toast('Slug is required', 'w');

  if (isNew) cats.push(cat);
  else { const i=cats.findIndex(c=>c.id===id); if(i>-1) cats[i]=cat; }
  saveCats(cats);

  // Also update the simple dk_categories list for backward compat
  const simpleList = cats.filter(c=>!c.parentId).map(c=>c.name);
  localStorage.setItem('dk_categories', JSON.stringify(simpleList));

  if (window.ActivityLog) ActivityLog.log(isNew?'create':'update','Category',cat.name);
  window.toast(isNew?'Category created!':'Category updated!');
  window._catEditing = null;
  navigate('categories');
};

window.deleteCat = function(id) {
  const cats = getCats();
  const cat = cats.find(c=>c.id===id);
  const children = getChildren(cats, id);
  if (children.length && !confirm(`This category has ${children.length} subcategories. Delete all?`)) return;
  if (!confirm(`Delete "${cat?.name}"?`)) return;
  const toDelete = [id, ...children.map(c=>c.id)];
  saveCats(cats.filter(c=>!toDelete.includes(c.id)));
  window.toast('Category deleted','e');
  navigate('categories');
};

window.filterProductsByCat = function(catId) {
  window._catEditing = null;
  navigate('products');
  setTimeout(()=>{
    const el = document.getElementById('prod-cat');
    if (el) { el.value = catId; navigate('products'); }
  }, 200);
};

window.viewCatProducts = function(catId) {
  window._catEditing = catId;
  navigate('categories');
};
