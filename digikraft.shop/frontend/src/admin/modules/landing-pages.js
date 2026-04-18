// ===== LANDING PAGES BUILDER MODULE =====
window._lpTab = window._lpTab || 'list';
window._lpEditing = window._lpEditing || null;

// Seed demo eCut page
(function seedLP() {
  if (localStorage.getItem('dk_landing_pages')) return;
  const demo = [{
    id: 'lp-ecut', name: 'eCut Plugin', slug: 'ecut-plugin',
    status: 'published', price: 2999, originalPrice: 5999,
    badge: '#1 CorelDRAW Plugin for Designers',
    headline: 'eCut Plugin', headlineAccent: 'Supercharge Your CorelDRAW',
    subheadline: 'The most powerful plugin for CorelDRAW. Automate repetitive tasks, create complex designs in seconds, and boost your productivity by 10x.',
    ctaText: 'Get eCut Now', guarantee: '30-day money back guarantee · Instant download',
    pricingTitle: 'Get eCut Plugin Today', pricingSubtitle: 'One-time payment · Lifetime license · Instant download',
    heroImage: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&h=450&fit=crop',
    heroVideoId: 'dQw4w9WgXcQ', demoVideoId: 'dQw4w9WgXcQ',
    demoVideoTitle: 'See eCut In Action', demoVideoSubtitle: 'Watch how eCut transforms your CorelDRAW workflow',
    galleryTitle: 'Screenshots', featuresTitle: 'Everything You Need', featuresSubtitle: '50+ professional tools packed into one powerful plugin',
    testimonialsTitle: '12,000+ Happy Designers', faqTitle: 'Frequently Asked Questions',
    howItWorksTitle: 'How It Works',
    showHeroVideo: true, showFeatures: true, showDemoVideo: true, showGallery: true,
    showHowItWorks: true, showTestimonials: true, showFAQ: true, showStats: true,
    navLinks: [{label:'Features',href:'#features'},{label:'Demo',href:'#demo'},{label:'Reviews',href:'#testimonials'},{label:'FAQ',href:'#faq'}],
    stats: [{value:'50+',label:'Pro Tools'},{value:'12k+',label:'Happy Users'},{value:'4.9★',label:'Rating'},{value:'10x',label:'Faster'}],
    features: [
      {icon:'✂️',title:'Smart Cut Lines',desc:'Automatically generate perfect cut lines for vinyl cutting, laser cutting, and CNC machines.'},
      {icon:'📐',title:'Nesting & Layout',desc:'Optimize material usage with intelligent nesting. Save up to 40% on material costs.'},
      {icon:'🎨',title:'Color Separation',desc:'Professional color separation for screen printing, spot colors, and multi-layer designs.'},
      {icon:'🔄',title:'Batch Processing',desc:'Process hundreds of files automatically. Apply effects, resize, export — all in one go.'},
      {icon:'🖼️',title:'Image Vectorizer',desc:'Convert raster images to clean vector paths with AI-powered tracing technology.'},
      {icon:'📦',title:'Box & Package Maker',desc:'Create packaging templates, boxes, and die-cut layouts with built-in templates.'},
    ],
    gallery: [
      {url:'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&h=450&fit=crop',caption:'Smart Cut Lines Tool'},
      {url:'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&h=450&fit=crop',caption:'Nesting & Layout Panel'},
      {url:'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=450&fit=crop',caption:'Color Separation Module'},
    ],
    steps: [
      {title:'Purchase & Download',desc:'Complete your purchase and instantly download the eCut installer file.'},
      {title:'Install in CorelDRAW',desc:'Run the installer and eCut automatically integrates into your CorelDRAW toolbar.'},
      {title:'Start Creating Faster',desc:'Access all 50+ tools from the eCut panel. Your workflow will never be the same.'},
    ],
    testimonials: [
      {name:'Rahul Sharma',role:'Vinyl Cutter, Mumbai',rating:5,text:'eCut completely transformed my vinyl cutting business. The nesting tool alone saves me 2 hours every day.'},
      {name:'Priya Patel',role:'Graphic Designer, Ahmedabad',rating:5,text:'The color separation feature is incredible. I used to spend 30 minutes on each job, now it takes 2 minutes.'},
      {name:'Amit Kumar',role:'Sign Maker, Delhi',rating:5,text:'I was skeptical at first but eCut exceeded all my expectations. The cut line generator is perfect.'},
    ],
    faq: [
      {q:'Which versions of CorelDRAW does eCut support?',a:'eCut works with CorelDRAW X7, X8, 2017–2024. Both 32-bit and 64-bit versions are supported.'},
      {q:'Is this a one-time payment or subscription?',a:'eCut is a one-time payment with a lifetime license. You pay once and use it forever.'},
      {q:'Do I get free updates?',a:'Yes! All updates are completely free for life.'},
      {q:'What if eCut doesn\'t work for me?',a:'We offer a 30-day money-back guarantee. Contact us and we\'ll refund you immediately.'},
    ],
    includes: ['eCut Plugin — Full Version (50+ tools)','Lifetime License — Use on 2 computers','Free Updates Forever','Installation Guide & Video Tutorials','Priority Email Support','30-Day Money Back Guarantee'],
    seoTitle: 'eCut Plugin for CorelDRAW — 50+ Pro Tools | DigiKraft',
    seoDesc: 'The most powerful CorelDRAW plugin. Smart cut lines, nesting, color separation, batch processing and 50+ professional tools.',
    createdAt: new Date().toISOString()
  }];
  localStorage.setItem('dk_landing_pages', JSON.stringify(demo));
})();

// ── MAIN RENDER ──────────────────────────────────────────────────────────────
window.renderLandingPages = function() {
  if (window._lpEditing) return renderLPEditor(window._lpEditing);
  const pages = JSON.parse(localStorage.getItem('dk_landing_pages') || '[]');
  const tab = window._lpTab;

  return `
  <div class="ph">
    <div><div class="ph-title">Landing Pages</div><div class="ph-sub">${pages.length} product landing pages · Toggle sections on/off</div></div>
    <div class="ph-actions">
      <button class="btn btn-secondary" onclick="exportCSV(JSON.parse(localStorage.getItem('dk_landing_pages')||'[]'),'landing-pages.csv')"><i class="fas fa-download"></i>Export</button>
      <button class="btn btn-primary" onclick="openNewLP()"><i class="fas fa-plus"></i>New Landing Page</button>
    </div>
  </div>

  <div class="tabs" style="margin-bottom:16px">
    ${[['list','All Pages'],['published','Published'],['draft','Drafts']].map(([id,lb])=>
      `<button class="tab ${tab===id?'on':''}" onclick="window._lpTab='${id}';navigate('landing-pages')">${lb}</button>`
    ).join('')}
  </div>

  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px">
    ${pages.filter(p=>tab==='all'||tab==='list'?true:p.status===tab).map(p=>`
    <div class="card" style="transition:.2s" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'">
      <div style="position:relative;border-radius:10px;overflow:hidden;margin-bottom:14px;aspect-ratio:16/9;background:var(--bg3)">
        ${p.heroImage?`<img src="${p.heroImage}" style="width:100%;height:100%;object-fit:cover">`:'<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:32px">🚀</div>'}
        <div style="position:absolute;top:8px;right:8px"><span class="tag ${p.status==='published'?'tg':'ty'}">${p.status}</span></div>
      </div>
      <div style="font-size:16px;font-weight:700;margin-bottom:4px">${p.name}</div>
      <div style="font-size:12px;color:var(--text3);margin-bottom:10px">/product-landing/${p.slug}</div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;flex-wrap:wrap">
        <span class="tag tp">₹${p.price}</span>
        ${p.originalPrice?`<span class="tag tr" style="text-decoration:line-through;font-size:10px">₹${p.originalPrice}</span>`:''}
        ${[p.showFeatures&&'Features',p.showDemoVideo&&'Video',p.showTestimonials&&'Reviews',p.showFAQ&&'FAQ'].filter(Boolean).map(s=>`<span class="tag tb" style="font-size:10px">${s}</span>`).join('')}
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <button class="btn btn-primary btn-sm" onclick="editLP('${p.id}')"><i class="fas fa-edit"></i>Edit</button>
        <a href="/product-landing/${p.slug}" target="_blank" class="btn btn-secondary btn-sm"><i class="fas fa-eye"></i>Preview</a>
        <button class="btn btn-secondary btn-sm" onclick="toggleLPStatus('${p.id}')"><i class="fas fa-toggle-on"></i>${p.status==='published'?'Unpublish':'Publish'}</button>
        <button class="btn btn-danger btn-sm btn-icon" onclick="deleteLP('${p.id}')"><i class="fas fa-trash"></i></button>
      </div>
    </div>`).join('')}
    <!-- ADD NEW CARD -->
    <div class="card" style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:200px;cursor:pointer;border-style:dashed;transition:.2s" onclick="openNewLP()" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'">
      <i class="fas fa-plus" style="font-size:32px;color:var(--text3);margin-bottom:10px"></i>
      <div style="font-size:14px;color:var(--text2);font-weight:600">Create New Landing Page</div>
    </div>
  </div>`;
};

// ── EDITOR ───────────────────────────────────────────────────────────────────
function renderLPEditor(id) {
  const pages = JSON.parse(localStorage.getItem('dk_landing_pages') || '[]');
  const p = id === 'new' ? { id:'new', status:'draft', showFeatures:true, showDemoVideo:true, showGallery:true, showHowItWorks:true, showTestimonials:true, showFAQ:true, showStats:true, features:[], gallery:[], steps:[], testimonials:[], faq:[], includes:[], navLinks:[], stats:[] } : pages.find(x=>x.id===id);
  if (!p) return `<div class="es"><i class="fas fa-file"></i><p>Page not found</p><button class="btn btn-secondary" onclick="window._lpEditing=null;navigate('landing-pages')">Back</button></div>`;

  const sec = (label, key, content) => `
  <div class="card" style="margin-bottom:14px">
    <div class="card-hd" style="cursor:pointer" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='none'?'block':'none'">
      <div class="card-title">${label}</div>
      <div style="display:flex;align-items:center;gap:10px">
        <label class="tgl" onclick="event.stopPropagation()"><input type="checkbox" id="lp-${key}" ${p[key]?'checked':''} onchange="lpToggle('${key}',this.checked)"><span class="tgs"></span></label>
        <i class="fas fa-chevron-down" style="color:var(--text3);font-size:12px"></i>
      </div>
    </div>
    <div style="padding-top:14px">${content}</div>
  </div>`;

  return `
  <div class="ph">
    <div style="display:flex;align-items:center;gap:10px">
      <button class="btn btn-secondary btn-sm" onclick="window._lpEditing=null;navigate('landing-pages')"><i class="fas fa-arrow-left"></i>Back</button>
      <div>
        <div class="ph-title">${p.id==='new'?'New Landing Page':p.name}</div>
        <div class="ph-sub">Toggle sections on/off · All changes auto-save</div>
      </div>
    </div>
    <div class="ph-actions">
      ${p.id!=='new'?`<a href="/product-landing/${p.slug}" target="_blank" class="btn btn-secondary"><i class="fas fa-eye"></i>Preview</a>`:''}
      <button class="btn btn-primary" onclick="saveLPEditor()"><i class="fas fa-save"></i>Save Page</button>
    </div>
  </div>

  <div class="g2" style="align-items:start">
    <!-- LEFT: SETTINGS -->
    <div style="display:flex;flex-direction:column;gap:0">

      <!-- BASIC INFO -->
      <div class="card" style="margin-bottom:14px">
        <div class="card-hd"><div class="card-title"><i class="fas fa-info-circle" style="color:var(--accent)"></i>Basic Info</div></div>
        <div class="fgrid">
          <div class="fg"><label class="fl">Page Name *</label><input class="fc" id="lp-name" value="${p.name||''}" placeholder="e.g. eCut Plugin"></div>
          <div class="fg"><label class="fl">URL Slug *</label><input class="fc" id="lp-slug" value="${p.slug||''}" placeholder="ecut-plugin"></div>
          <div class="fg"><label class="fl">Price (₹) *</label><input class="fc" id="lp-price" type="number" value="${p.price||0}"></div>
          <div class="fg"><label class="fl">Original Price (₹)</label><input class="fc" id="lp-orig-price" type="number" value="${p.originalPrice||''}"></div>
          <div class="fg cs2"><label class="fl">Status</label>
            <select class="fc" id="lp-status">
              <option value="draft" ${p.status==='draft'?'selected':''}>Draft</option>
              <option value="published" ${p.status==='published'?'selected':''}>Published</option>
            </select>
          </div>
        </div>
      </div>

      <!-- HERO -->
      <div class="card" style="margin-bottom:14px">
        <div class="card-hd"><div class="card-title"><i class="fas fa-star" style="color:var(--yellow)"></i>Hero Section</div></div>
        <div class="fgrid">
          <div class="fg cs2"><label class="fl">Badge Text</label><input class="fc" id="lp-badge" value="${p.badge||''}" placeholder="#1 Plugin for Designers"></div>
          <div class="fg cs2"><label class="fl">Headline *</label><input class="fc" id="lp-headline" value="${p.headline||''}" placeholder="Main headline"></div>
          <div class="fg cs2"><label class="fl">Headline Accent (gradient text)</label><input class="fc" id="lp-headline-accent" value="${p.headlineAccent||''}" placeholder="Supercharge Your CorelDRAW"></div>
          <div class="fg cs2"><label class="fl">Subheadline</label><textarea class="fc" id="lp-subheadline" rows="2">${p.subheadline||''}</textarea></div>
          <div class="fg cs2"><label class="fl">CTA Button Text</label><input class="fc" id="lp-cta" value="${p.ctaText||'Buy Now'}"></div>
          <div class="fg cs2"><label class="fl">Hero Image URL</label><input class="fc" id="lp-hero-img" value="${p.heroImage||''}" placeholder="https://..."></div>
          <div class="fg"><label class="fl">Hero YouTube Video ID</label><input class="fc" id="lp-hero-vid" value="${p.heroVideoId||''}" placeholder="dQw4w9WgXcQ"></div>
          <div class="fg" style="display:flex;align-items:center;gap:8px;padding-top:20px">
            <label class="tgl"><input type="checkbox" id="lp-show-hero-video" ${p.showHeroVideo?'checked':''}><span class="tgs"></span></label>
            <span style="font-size:13px">Show video instead of image</span>
          </div>
        </div>
      </div>

      <!-- STATS -->
      ${sec('<i class="fas fa-chart-bar" style="color:var(--blue)"></i> Stats Bar', 'showStats', `
        <div id="lp-stats-list" style="display:flex;flex-direction:column;gap:6px">
          ${(p.stats||[]).map((s,i)=>`
          <div style="display:flex;gap:6px;align-items:center">
            <input class="fc" placeholder="Value" value="${s.value}" style="flex:1" oninput="lpUpdateStat(${i},'value',this.value)">
            <input class="fc" placeholder="Label" value="${s.label}" style="flex:1" oninput="lpUpdateStat(${i},'label',this.value)">
            <button class="btn btn-danger btn-sm btn-icon" onclick="lpRemoveStat(${i})"><i class="fas fa-times"></i></button>
          </div>`).join('')}
        </div>
        <button class="btn btn-secondary btn-sm" style="margin-top:8px" onclick="lpAddStat()"><i class="fas fa-plus"></i>Add Stat</button>
      `)}

      <!-- FEATURES -->
      ${sec('<i class="fas fa-list" style="color:var(--green)"></i> Features Section', 'showFeatures', `
        <div class="fgrid" style="margin-bottom:10px">
          <div class="fg"><label class="fl">Section Title</label><input class="fc" id="lp-feat-title" value="${p.featuresTitle||'Key Features'}"></div>
          <div class="fg"><label class="fl">Subtitle</label><input class="fc" id="lp-feat-sub" value="${p.featuresSubtitle||''}"></div>
        </div>
        <div id="lp-features-list" style="display:flex;flex-direction:column;gap:8px">
          ${(p.features||[]).map((f,i)=>`
          <div style="background:var(--bg3);border-radius:9px;padding:10px;display:flex;gap:8px;align-items:start">
            <input class="fc" placeholder="Icon" value="${f.icon}" style="width:60px" oninput="lpUpdateFeature(${i},'icon',this.value)">
            <input class="fc" placeholder="Title" value="${f.title}" style="flex:1" oninput="lpUpdateFeature(${i},'title',this.value)">
            <input class="fc" placeholder="Description" value="${f.desc}" style="flex:2" oninput="lpUpdateFeature(${i},'desc',this.value)">
            <button class="btn btn-danger btn-sm btn-icon" onclick="lpRemoveFeature(${i})"><i class="fas fa-times"></i></button>
          </div>`).join('')}
        </div>
        <button class="btn btn-secondary btn-sm" style="margin-top:8px" onclick="lpAddFeature()"><i class="fas fa-plus"></i>Add Feature</button>
      `)}

      <!-- DEMO VIDEO -->
      ${sec('<i class="fab fa-youtube" style="color:#ff0000"></i> Demo Video Section', 'showDemoVideo', `
        <div class="fgrid">
          <div class="fg"><label class="fl">YouTube Video ID</label><input class="fc" id="lp-demo-vid" value="${p.demoVideoId||''}" placeholder="dQw4w9WgXcQ"></div>
          <div class="fg"><label class="fl">Section Title</label><input class="fc" id="lp-demo-title" value="${p.demoVideoTitle||'See It In Action'}"></div>
          <div class="fg cs2"><label class="fl">Subtitle</label><input class="fc" id="lp-demo-sub" value="${p.demoVideoSubtitle||''}"></div>
        </div>
      `)}

      <!-- GALLERY -->
      ${sec('<i class="fas fa-images" style="color:var(--purple)"></i> Screenshots Gallery', 'showGallery', `
        <div class="fg" style="margin-bottom:10px"><label class="fl">Section Title</label><input class="fc" id="lp-gallery-title" value="${p.galleryTitle||'Screenshots'}"></div>
        <div id="lp-gallery-list" style="display:flex;flex-direction:column;gap:6px">
          ${(p.gallery||[]).map((g,i)=>`
          <div style="display:flex;gap:6px;align-items:center">
            <input class="fc" placeholder="Image URL" value="${g.url}" style="flex:2" oninput="lpUpdateGallery(${i},'url',this.value)">
            <input class="fc" placeholder="Caption" value="${g.caption||''}" style="flex:1" oninput="lpUpdateGallery(${i},'caption',this.value)">
            <button class="btn btn-danger btn-sm btn-icon" onclick="lpRemoveGallery(${i})"><i class="fas fa-times"></i></button>
          </div>`).join('')}
        </div>
        <button class="btn btn-secondary btn-sm" style="margin-top:8px" onclick="lpAddGallery()"><i class="fas fa-plus"></i>Add Image</button>
      `)}

      <!-- HOW IT WORKS -->
      ${sec('<i class="fas fa-list-ol" style="color:var(--blue)"></i> How It Works', 'showHowItWorks', `
        <div class="fg" style="margin-bottom:10px"><label class="fl">Section Title</label><input class="fc" id="lp-hiw-title" value="${p.howItWorksTitle||'How It Works'}"></div>
        <div id="lp-steps-list" style="display:flex;flex-direction:column;gap:6px">
          ${(p.steps||[]).map((s,i)=>`
          <div style="display:flex;gap:6px;align-items:center">
            <span style="width:24px;height:24px;border-radius:6px;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0">${i+1}</span>
            <input class="fc" placeholder="Step title" value="${s.title}" style="flex:1" oninput="lpUpdateStep(${i},'title',this.value)">
            <input class="fc" placeholder="Description" value="${s.desc}" style="flex:2" oninput="lpUpdateStep(${i},'desc',this.value)">
            <button class="btn btn-danger btn-sm btn-icon" onclick="lpRemoveStep(${i})"><i class="fas fa-times"></i></button>
          </div>`).join('')}
        </div>
        <button class="btn btn-secondary btn-sm" style="margin-top:8px" onclick="lpAddStep()"><i class="fas fa-plus"></i>Add Step</button>
      `)}

      <!-- TESTIMONIALS -->
      ${sec('<i class="fas fa-star" style="color:var(--yellow)"></i> Testimonials', 'showTestimonials', `
        <div class="fg" style="margin-bottom:10px"><label class="fl">Section Title</label><input class="fc" id="lp-test-title" value="${p.testimonialsTitle||'What Users Say'}"></div>
        <div id="lp-test-list" style="display:flex;flex-direction:column;gap:8px">
          ${(p.testimonials||[]).map((t,i)=>`
          <div style="background:var(--bg3);border-radius:9px;padding:10px">
            <div style="display:flex;gap:6px;margin-bottom:6px">
              <input class="fc" placeholder="Name" value="${t.name}" style="flex:1" oninput="lpUpdateTest(${i},'name',this.value)">
              <input class="fc" placeholder="Role" value="${t.role}" style="flex:1" oninput="lpUpdateTest(${i},'role',this.value)">
              <select class="fc" style="width:80px" onchange="lpUpdateTest(${i},'rating',parseInt(this.value))">
                ${[5,4,3,2,1].map(r=>`<option value="${r}" ${t.rating===r?'selected':''}>${r}★</option>`).join('')}
              </select>
              <button class="btn btn-danger btn-sm btn-icon" onclick="lpRemoveTest(${i})"><i class="fas fa-times"></i></button>
            </div>
            <textarea class="fc" rows="2" placeholder="Review text" oninput="lpUpdateTest(${i},'text',this.value)">${t.text}</textarea>
          </div>`).join('')}
        </div>
        <button class="btn btn-secondary btn-sm" style="margin-top:8px" onclick="lpAddTest()"><i class="fas fa-plus"></i>Add Testimonial</button>
      `)}

      <!-- FAQ -->
      ${sec('<i class="fas fa-question-circle" style="color:var(--accent)"></i> FAQ', 'showFAQ', `
        <div class="fg" style="margin-bottom:10px"><label class="fl">Section Title</label><input class="fc" id="lp-faq-title" value="${p.faqTitle||'Frequently Asked Questions'}"></div>
        <div id="lp-faq-list" style="display:flex;flex-direction:column;gap:6px">
          ${(p.faq||[]).map((f,i)=>`
          <div style="background:var(--bg3);border-radius:9px;padding:10px">
            <div style="display:flex;gap:6px;margin-bottom:6px;align-items:center">
              <input class="fc" placeholder="Question" value="${f.q}" style="flex:1" oninput="lpUpdateFaq(${i},'q',this.value)">
              <button class="btn btn-danger btn-sm btn-icon" onclick="lpRemoveFaq(${i})"><i class="fas fa-times"></i></button>
            </div>
            <textarea class="fc" rows="2" placeholder="Answer" oninput="lpUpdateFaq(${i},'a',this.value)">${f.a}</textarea>
          </div>`).join('')}
        </div>
        <button class="btn btn-secondary btn-sm" style="margin-top:8px" onclick="lpAddFaq()"><i class="fas fa-plus"></i>Add FAQ</button>
      `)}

      <!-- PRICING -->
      <div class="card" style="margin-bottom:14px">
        <div class="card-hd"><div class="card-title"><i class="fas fa-tag" style="color:var(--green)"></i>Pricing Section</div></div>
        <div class="fgrid">
          <div class="fg"><label class="fl">Section Title</label><input class="fc" id="lp-price-title" value="${p.pricingTitle||'Get Started Today'}"></div>
          <div class="fg"><label class="fl">Subtitle</label><input class="fc" id="lp-price-sub" value="${p.pricingSubtitle||''}"></div>
          <div class="fg cs2"><label class="fl">Guarantee Text</label><input class="fc" id="lp-guarantee" value="${p.guarantee||'30-day money back guarantee · Instant download'}"></div>
        </div>
        <div class="fg" style="margin-top:8px"><label class="fl">What's Included (one per line)</label>
          <textarea class="fc" id="lp-includes" rows="5">${(p.includes||[]).join('\n')}</textarea>
        </div>
      </div>

      <!-- SEO -->
      <div class="card">
        <div class="card-hd"><div class="card-title"><i class="fas fa-search" style="color:var(--blue)"></i>SEO</div></div>
        <div class="fg"><label class="fl">SEO Title</label><input class="fc" id="lp-seo-title" value="${p.seoTitle||''}" placeholder="Product Name | DigiKraft"></div>
        <div class="fg"><label class="fl">SEO Description</label><textarea class="fc" id="lp-seo-desc" rows="2">${p.seoDesc||''}</textarea></div>
      </div>

    </div>

    <!-- RIGHT: LIVE PREVIEW PANEL -->
    <div style="position:sticky;top:80px">
      <div class="card">
        <div class="card-hd"><div class="card-title"><i class="fas fa-eye" style="color:var(--accent)"></i>Section Toggles</div></div>
        <div style="display:flex;flex-direction:column;gap:0">
          ${[
            ['showStats','Stats Bar','fa-chart-bar'],
            ['showFeatures','Features Section','fa-list'],
            ['showDemoVideo','Demo Video','fa-play-circle'],
            ['showGallery','Screenshots Gallery','fa-images'],
            ['showHowItWorks','How It Works','fa-list-ol'],
            ['showTestimonials','Testimonials','fa-star'],
            ['showFAQ','FAQ Section','fa-question-circle'],
          ].map(([key,label,icon])=>`
          <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
            <div style="display:flex;align-items:center;gap:8px;font-size:13px">
              <i class="fas ${icon}" style="color:var(--text3);width:14px;text-align:center"></i>${label}
            </div>
            <label class="tgl"><input type="checkbox" id="lp-toggle-${key}" ${p[key]?'checked':''} onchange="lpToggle('${key}',this.checked);document.getElementById('lp-${key}').checked=this.checked"><span class="tgs"></span></label>
          </div>`).join('')}
        </div>
        <button class="btn btn-primary" style="width:100%;margin-top:14px" onclick="saveLPEditor()"><i class="fas fa-save"></i>Save All Changes</button>
        ${p.id!=='new'?`<a href="/product-landing/${p.slug}" target="_blank" class="btn btn-secondary" style="width:100%;margin-top:8px;display:flex;justify-content:center"><i class="fas fa-external-link-alt"></i>Open Live Preview</a>`:''}
      </div>
    </div>
  </div>`;
}

// ── EDITOR STATE (in-memory while editing) ────────────────────────────────────
window._lpState = {};

window.lpToggle = function(key, val) {
  window._lpState[key] = val;
  // Sync both toggle buttons
  const a = document.getElementById('lp-'+key);
  const b = document.getElementById('lp-toggle-'+key);
  if (a) a.checked = val;
  if (b) b.checked = val;
};

function getLPState() {
  const pages = JSON.parse(localStorage.getItem('dk_landing_pages') || '[]');
  const id = window._lpEditing;
  const base = id === 'new' ? {} : (pages.find(x=>x.id===id) || {});
  return { ...base, ...window._lpState };
}

// Array helpers
const lpArr = (key) => { const p = getLPState(); return [...(p[key]||[])]; };
const lpSaveArr = (key, arr) => { window._lpState[key] = arr; };

window.lpAddFeature = () => { const a=lpArr('features'); a.push({icon:'⭐',title:'New Feature',desc:'Description'}); lpSaveArr('features',a); navigate('landing-pages'); };
window.lpRemoveFeature = (i) => { const a=lpArr('features'); a.splice(i,1); lpSaveArr('features',a); navigate('landing-pages'); };
window.lpUpdateFeature = (i,k,v) => { const a=lpArr('features'); if(a[i])a[i][k]=v; lpSaveArr('features',a); };

window.lpAddStat = () => { const a=lpArr('stats'); a.push({value:'0',label:'Label'}); lpSaveArr('stats',a); navigate('landing-pages'); };
window.lpRemoveStat = (i) => { const a=lpArr('stats'); a.splice(i,1); lpSaveArr('stats',a); navigate('landing-pages'); };
window.lpUpdateStat = (i,k,v) => { const a=lpArr('stats'); if(a[i])a[i][k]=v; lpSaveArr('stats',a); };

window.lpAddGallery = () => { const a=lpArr('gallery'); a.push({url:'',caption:''}); lpSaveArr('gallery',a); navigate('landing-pages'); };
window.lpRemoveGallery = (i) => { const a=lpArr('gallery'); a.splice(i,1); lpSaveArr('gallery',a); navigate('landing-pages'); };
window.lpUpdateGallery = (i,k,v) => { const a=lpArr('gallery'); if(a[i])a[i][k]=v; lpSaveArr('gallery',a); };

window.lpAddStep = () => { const a=lpArr('steps'); a.push({title:'New Step',desc:'Description'}); lpSaveArr('steps',a); navigate('landing-pages'); };
window.lpRemoveStep = (i) => { const a=lpArr('steps'); a.splice(i,1); lpSaveArr('steps',a); navigate('landing-pages'); };
window.lpUpdateStep = (i,k,v) => { const a=lpArr('steps'); if(a[i])a[i][k]=v; lpSaveArr('steps',a); };

window.lpAddTest = () => { const a=lpArr('testimonials'); a.push({name:'User Name',role:'Role',rating:5,text:'Great product!'}); lpSaveArr('testimonials',a); navigate('landing-pages'); };
window.lpRemoveTest = (i) => { const a=lpArr('testimonials'); a.splice(i,1); lpSaveArr('testimonials',a); navigate('landing-pages'); };
window.lpUpdateTest = (i,k,v) => { const a=lpArr('testimonials'); if(a[i])a[i][k]=v; lpSaveArr('testimonials',a); };

window.lpAddFaq = () => { const a=lpArr('faq'); a.push({q:'Question?',a:'Answer.'}); lpSaveArr('faq',a); navigate('landing-pages'); };
window.lpRemoveFaq = (i) => { const a=lpArr('faq'); a.splice(i,1); lpSaveArr('faq',a); navigate('landing-pages'); };
window.lpUpdateFaq = (i,k,v) => { const a=lpArr('faq'); if(a[i])a[i][k]=v; lpSaveArr('faq',a); };

// ── SAVE ─────────────────────────────────────────────────────────────────────
window.saveLPEditor = function() {
  const pages = JSON.parse(localStorage.getItem('dk_landing_pages') || '[]');
  const id = window._lpEditing;
  const base = id === 'new' ? {} : (pages.find(x=>x.id===id) || {});

  const g = (elId) => document.getElementById(elId)?.value || '';
  const gc = (elId) => document.getElementById(elId)?.checked || false;

  const updated = {
    ...base, ...window._lpState,
    id: id === 'new' ? Date.now().toString() : id,
    name: g('lp-name'), slug: g('lp-slug'),
    price: parseFloat(g('lp-price')||0), originalPrice: parseFloat(g('lp-orig-price')||0)||null,
    status: g('lp-status'), badge: g('lp-badge'),
    headline: g('lp-headline'), headlineAccent: g('lp-headline-accent'),
    subheadline: g('lp-subheadline'), ctaText: g('lp-cta'),
    heroImage: g('lp-hero-img'), heroVideoId: g('lp-hero-vid'),
    showHeroVideo: gc('lp-show-hero-video'),
    demoVideoId: g('lp-demo-vid'), demoVideoTitle: g('lp-demo-title'), demoVideoSubtitle: g('lp-demo-sub'),
    galleryTitle: g('lp-gallery-title'), featuresTitle: g('lp-feat-title'), featuresSubtitle: g('lp-feat-sub'),
    howItWorksTitle: g('lp-hiw-title'), testimonialsTitle: g('lp-test-title'), faqTitle: g('lp-faq-title'),
    pricingTitle: g('lp-price-title'), pricingSubtitle: g('lp-price-sub'), guarantee: g('lp-guarantee'),
    includes: g('lp-includes').split('\n').map(s=>s.trim()).filter(Boolean),
    seoTitle: g('lp-seo-title'), seoDesc: g('lp-seo-desc'),
    updatedAt: new Date().toISOString(),
    createdAt: base.createdAt || new Date().toISOString(),
  };

  if (id === 'new') pages.unshift(updated);
  else { const i = pages.findIndex(x=>x.id===id); if(i>-1) pages[i]=updated; }
  localStorage.setItem('dk_landing_pages', JSON.stringify(pages));
  window._lpState = {};
  window._lpEditing = null;
  window.toast('Landing page saved!', 's');
  if (window.ActivityLog) ActivityLog.log('update', 'Landing Page', updated.name);
  navigate('landing-pages');
};

// ── ACTIONS ──────────────────────────────────────────────────────────────────
window.openNewLP = function() { window._lpState = {}; window._lpEditing = 'new'; navigate('landing-pages'); };
window.editLP = function(id) { window._lpState = {}; window._lpEditing = id; navigate('landing-pages'); };

window.deleteLP = function(id) {
  if (!confirm('Delete this landing page?')) return;
  localStorage.setItem('dk_landing_pages', JSON.stringify(JSON.parse(localStorage.getItem('dk_landing_pages')||'[]').filter(p=>p.id!==id)));
  window.toast('Deleted', 'e'); navigate('landing-pages');
};

window.toggleLPStatus = function(id) {
  const pages = JSON.parse(localStorage.getItem('dk_landing_pages')||'[]');
  const p = pages.find(x=>x.id===id);
  if (p) { p.status = p.status==='published'?'draft':'published'; localStorage.setItem('dk_landing_pages',JSON.stringify(pages)); window.toast(`Page ${p.status}!`); navigate('landing-pages'); }
};

// ── BACKEND SYNC ─────────────────────────────────────────────────────────────
// After saving locally, also sync to backend satellite-pages API
const _origSaveLPEditor = window.saveLPEditor
window.saveLPEditor = async function() {
  // First save locally (original function)
  const pages = JSON.parse(localStorage.getItem('dk_landing_pages') || '[]')
  const id = window._lpEditing
  const base = id === 'new' ? {} : (pages.find(x=>x.id===id) || {})
  const g = (elId) => document.getElementById(elId)?.value || ''
  const gc = (elId) => document.getElementById(elId)?.checked || false

  const updated = {
    ...base, ...window._lpState,
    id: id === 'new' ? Date.now().toString() : id,
    name: g('lp-name'), slug: g('lp-slug'),
    price: parseFloat(g('lp-price')||0), originalPrice: parseFloat(g('lp-orig-price')||0)||null,
    status: g('lp-status'), badge: g('lp-badge'),
    headline: g('lp-headline'), headlineAccent: g('lp-headline-accent'),
    subheadline: g('lp-subheadline'), ctaText: g('lp-cta'),
    heroImage: g('lp-hero-img'), heroVideoId: g('lp-hero-vid'),
    showHeroVideo: gc('lp-show-hero-video'),
    demoVideoId: g('lp-demo-vid'), demoVideoTitle: g('lp-demo-title'), demoVideoSubtitle: g('lp-demo-sub'),
    galleryTitle: g('lp-gallery-title'), featuresTitle: g('lp-feat-title'), featuresSubtitle: g('lp-feat-sub'),
    howItWorksTitle: g('lp-hiw-title'), testimonialsTitle: g('lp-test-title'), faqTitle: g('lp-faq-title'),
    pricingTitle: g('lp-price-title'), pricingSubtitle: g('lp-price-sub'), guarantee: g('lp-guarantee'),
    includes: g('lp-includes').split('\n').map(s=>s.trim()).filter(Boolean),
    seoTitle: g('lp-seo-title'), seoDesc: g('lp-seo-desc'),
    updatedAt: new Date().toISOString(),
    createdAt: base.createdAt || new Date().toISOString(),
  }

  if (id === 'new') pages.unshift(updated)
  else { const i = pages.findIndex(x=>x.id===id); if(i>-1) pages[i]=updated }
  localStorage.setItem('dk_landing_pages', JSON.stringify(pages))
  window._lpState = {}
  window._lpEditing = null

  // Sync to backend satellite pages
  try {
    const payload = {
      name: updated.name,
      slug: updated.slug,
      description: updated.subheadline || '',
      emoji: '🚀',
      status: updated.status,
      seo_title: updated.seoTitle || updated.name,
      seo_desc: updated.seoDesc || '',
      hero_title: updated.headline || updated.name,
      hero_subtitle: updated.headlineAccent || ''
    }
    if (id === 'new') {
      await AdminAPI.createSatellitePage(payload)
    } else {
      await AdminAPI.updateSatellitePage(updated.slug, payload).catch(() => AdminAPI.createSatellitePage(payload))
    }
    window.toast('Landing page saved & synced to backend!', 's')
  } catch (e) {
    window.toast('Landing page saved locally (backend sync failed)', 'w')
  }

  if (window.ActivityLog) ActivityLog.log('update', 'Landing Page', updated.name)
  navigate('landing-pages')
}

// ── PUBLISH AS PRODUCT ────────────────────────────────────────────────────────
window.publishLPAsProduct = async function(id) {
  const pages = JSON.parse(localStorage.getItem('dk_landing_pages') || '[]')
  const p = pages.find(x => x.id === id)
  if (!p) return toast('Page not found', 'e')

  if (!confirm(`Create a product listing for "${p.name}" at ₹${p.price}?`)) return

  try {
    const res = await AdminAPI.createProduct({
      title: p.name,
      slug: p.slug,
      description: p.subheadline || p.headline || p.name,
      short_description: p.badge || '',
      price: p.price || 0,
      sale_price: p.originalPrice || null,
      image: p.heroImage || '',
      tags: ['plugin', 'software', 'tool'],
      featured: true,
      show_on_main: true,
      status: p.status === 'published' ? 'published' : 'draft',
      seo_title: p.seoTitle || p.name,
      seo_desc: p.seoDesc || '',
      satellite_page: p.slug,
      categories: [6] // Plugins category
    })
    toast(`Product "${p.name}" created! ID: ${res.data.id}`, 's')
    navigate('products')
  } catch (e) {
    toast('Failed to create product: ' + e.message, 'e')
  }
}

// Add "Publish as Product" button to landing page cards
const _origRenderLP = window.renderLandingPages
window.renderLandingPages = function() {
  const html = _origRenderLP()
  // Inject "Publish as Product" button into each card's action buttons
  return html.replace(
    /(<button class="btn btn-danger btn-sm btn-icon" onclick="deleteLP\('([^']+)'\)">)/g,
    `<button class="btn btn-secondary btn-sm" onclick="publishLPAsProduct('$2')" title="Create product listing"><i class="fas fa-box"></i>→ Product</button>$1`
  )
}
