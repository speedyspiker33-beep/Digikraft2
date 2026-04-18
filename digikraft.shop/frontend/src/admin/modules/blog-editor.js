
// ===== BLOG EDITOR MODULE — AI-Powered =====
// Full blog management with AI generation, PDF/MD upload, backend sync

window._blogTab = window._blogTab || 'list';
window._blogEditing = window._blogEditing || null;
window._blogPosts = window._blogPosts || [];
window._blogCategories = window._blogCategories || [];
window._blogAIModels = window._blogAIModels || [];
window._blogRefText = window._blogRefText || ''; // reference text from PDF/MD

// ── DATA LAYER ────────────────────────────────────────────────────────────────
async function loadBlogPosts() {
  try {
    const res = await AdminAPI.get(`/v1/blog?status=all&limit=200&_t=${Date.now()}`);
    window._blogPosts = res.data || [];
  } catch {
    window._blogPosts = [];
  }
}

async function loadBlogCategories() {
  try {
    const res = await AdminAPI.get('/v1/blog-ai/categories');
    window._blogCategories = res.data || [];
  } catch {
    window._blogCategories = [];
  }
}

async function loadAIModels() {
  try {
    const res = await AdminAPI.get('/v1/ai-hub/models');
    window._blogAIModels = (res.data || []).filter(m => m.enabled);
  } catch {
    window._blogAIModels = [];
  }
}

// ── MAIN RENDER ───────────────────────────────────────────────────────────────
window.renderBlog = function() {
  if (window._blogEditing) return renderBlogEditor(window._blogEditing);

  // Load data async then re-render
  Promise.all([loadBlogPosts(), loadBlogCategories(), loadAIModels()]).then(() => {
    const el = document.getElementById('page');
    if (el && !window._blogEditing) el.innerHTML = renderBlogList();
  });

  return renderBlogList();
};

function renderBlogList() {
  const posts = window._blogPosts;
  const tab = window._blogTab;
  const search = document.getElementById('blog-search')?.value || '';

  let filtered = [...posts];
  if (search) filtered = filtered.filter(p =>
    (p.title||'').toLowerCase().includes(search.toLowerCase()) ||
    (p.category||'').toLowerCase().includes(search.toLowerCase()) ||
    JSON.stringify(p.tags||[]).toLowerCase().includes(search.toLowerCase())
  );
  if (tab === 'published') filtered = filtered.filter(p => p.status === 'published');
  if (tab === 'draft') filtered = filtered.filter(p => p.status === 'draft');

  const pubCount = posts.filter(p => p.status === 'published').length;
  const draftCount = posts.filter(p => p.status !== 'published').length;

  return `
  <div class="ph">
    <div>
      <div class="ph-title">Blog & Articles</div>
      <div class="ph-sub">${posts.length} articles · ${pubCount} published · ${draftCount} drafts</div>
    </div>
    <div class="ph-actions">
      <button class="btn btn-secondary" onclick="blogManageCategories()"><i class="fas fa-tags"></i>Categories</button>
      <button class="btn btn-secondary" onclick="openBlogEditor('new')"><i class="fas fa-pen"></i>Write Article</button>
      <button class="btn btn-primary" onclick="openBlogAIGenerator()"><i class="fas fa-robot"></i>AI Generate</button>
    </div>
  </div>

  <div class="tabs" style="margin-bottom:16px">
    ${[['list',`All (${posts.length})`],['published',`Published (${pubCount})`],['draft',`Drafts (${draftCount})`]].map(([id,lb])=>
      `<button class="tab ${tab===id?'on':''}" onclick="window._blogTab='${id}';navigate('blog')">${lb}</button>`
    ).join('')}
  </div>

  <div class="card">
    <div class="ttb">
      <div class="ts"><i class="fas fa-search"></i><input type="text" id="blog-search" placeholder="Search title, tags, category..." oninput="navigate('blog')" value="${search}"></div>
      <span style="margin-left:auto;font-size:12px;color:var(--text2)">${filtered.length} result(s)</span>
    </div>

    ${filtered.length ? `
    <div style="display:flex;flex-direction:column;gap:10px">
      ${filtered.map(p => {
        const daysAgo = p.created_at ? Math.floor((Date.now()-new Date(p.created_at))/86400000) : 0;
        return `
        <div style="display:flex;gap:14px;padding:14px;background:var(--bg3);border-radius:12px;border:1px solid var(--border);transition:.15s;cursor:pointer"
          onclick="openBlogEditor('${p.slug}')"
          onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'">
          ${p.image?`<img src="${p.image}" onerror="this.src='https://via.placeholder.com/80'" style="width:80px;height:80px;border-radius:10px;object-fit:cover;flex-shrink:0">`
            :`<div style="width:80px;height:80px;border-radius:10px;background:var(--bg4);display:flex;align-items:center;justify-content:center;flex-shrink:0"><i class="fas fa-image" style="color:var(--text3);font-size:24px"></i></div>`}
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:6px">
              <div>
                <div style="font-size:15px;font-weight:700;margin-bottom:3px">${p.title||'Untitled'}</div>
                <div style="font-size:12px;color:var(--text2);overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">${p.excerpt||'No excerpt'}</div>
              </div>
              <div style="display:flex;gap:4px;flex-shrink:0">
                ${p.ai_generated?`<span class="tag" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-size:10px">✦ AI</span>`:''}
                <span class="tag ${p.status==='published'?'tg':'ty'}">${p.status==='published'?'Published':'Draft'}</span>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:6px">
              ${p.category?`<span class="tag tp" style="font-size:10px">📁 ${p.category}</span>`:''}
              ${(p.tags||[]).slice(0,3).map(t=>`<span style="background:var(--bg4);color:var(--text3);font-size:10px;padding:1px 7px;border-radius:99px">#${t}</span>`).join('')}
              <span style="font-size:11px;color:var(--text3);margin-left:auto">${p.views||0} views · ${daysAgo===0?'Today':daysAgo+'d ago'}</span>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:5px;flex-shrink:0" onclick="event.stopPropagation()">
            <button class="btn btn-sm btn-primary btn-icon" onclick="openBlogEditor('${p.slug}')" title="Edit"><i class="fas fa-edit"></i></button>
            <button class="btn btn-sm btn-secondary btn-icon" onclick="toggleBlogPublish('${p.slug}','${p.status}')" title="${p.status==='published'?'Unpublish':'Publish'}"><i class="fas fa-${p.status==='published'?'eye-slash':'eye'}"></i></button>
            <button class="btn btn-sm btn-danger btn-icon" onclick="deleteBlog('${p.slug}','${(p.title||'').replace(/'/g,"\\'")}')"><i class="fas fa-trash"></i></button>
          </div>
        </div>`;
      }).join('')}
    </div>` : `<div class="es"><i class="fas fa-newspaper"></i><p>No articles found. <a href="#" onclick="openBlogEditor('new')" style="color:var(--accent)">Write your first article</a> or <a href="#" onclick="openBlogAIGenerator()" style="color:var(--accent)">generate with AI</a></p></div>`}
  </div>`;
}

// ── AI GENERATOR PANEL ────────────────────────────────────────────────────────
window.openBlogAIGenerator = function() {
  const cats = window._blogCategories;
  const models = window._blogAIModels;

  const overlay = document.createElement('div');
  overlay.id = 'blog-ai-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:500;display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto';
  overlay.innerHTML = `
  <div style="background:var(--bg2);border:1px solid var(--border);border-radius:16px;width:100%;max-width:760px;max-height:90vh;overflow-y:auto">
    <div style="padding:20px 24px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:var(--bg2);z-index:1">
      <div>
        <div style="font-size:18px;font-weight:800;display:flex;align-items:center;gap:8px">
          <span style="background:linear-gradient(135deg,#6366f1,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent">✦</span>
          AI Article Generator
        </div>
        <div style="font-size:12px;color:var(--text3)">Generate a full SEO-optimized article with AI</div>
      </div>
      <button onclick="document.getElementById('blog-ai-overlay').remove()" style="background:var(--bg3);border:none;border-radius:8px;width:32px;height:32px;cursor:pointer;color:var(--text2);font-size:16px">×</button>
    </div>

    <div style="padding:20px 24px;display:flex;flex-direction:column;gap:14px">

      <!-- TOPIC -->
      <div class="fg">
        <label class="fl" style="font-size:13px;font-weight:700">Article Topic / Title *</label>
        <input class="fc" id="ai-blog-topic" placeholder="e.g. Top 10 CorelDRAW Tips for Beginners, How to Create a Logo in Figma..." style="font-size:14px">
      </div>

      <!-- REFERENCE UPLOAD -->
      <div style="background:var(--bg3);border-radius:10px;padding:14px">
        <div style="font-size:13px;font-weight:700;margin-bottom:8px;display:flex;align-items:center;gap:6px">
          <i class="fas fa-file-upload" style="color:var(--accent)"></i>
          Reference Material (optional)
          <span style="font-size:10px;font-weight:400;color:var(--text3)">Upload PDF, MD, or TXT — AI uses this as reference</span>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <label style="flex:1;border:2px dashed var(--border);border-radius:8px;padding:10px 14px;cursor:pointer;display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text2)" id="ref-upload-label">
            <i class="fas fa-cloud-upload-alt" style="color:var(--text3)"></i>
            <span id="ref-file-name">Drop PDF, MD, TXT here or click to browse</span>
            <input type="file" id="ai-ref-file" accept=".pdf,.md,.txt,.docx" style="display:none" onchange="blogHandleRefFile(this)">
          </label>
          ${window._blogRefText ? `<span class="tag tg" style="font-size:11px;flex-shrink:0">✓ Reference loaded</span>` : ''}
        </div>
        ${window._blogRefText ? `<div style="font-size:11px;color:var(--green);margin-top:6px">✓ Reference text loaded (${window._blogRefText.length} chars) — AI will use this for accuracy</div>` : ''}
        <div id="ref-upload-status" style="font-size:11px;color:var(--text3);margin-top:4px"></div>
      </div>

      <!-- SETTINGS ROW -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
        <div class="fg">
          <label class="fl">Category</label>
          <select class="fc" id="ai-blog-cat">
            <option value="">Select...</option>
            ${cats.map(c=>`<option value="${c.name}">${c.icon} ${c.name}</option>`).join('')}
          </select>
        </div>
        <div class="fg">
          <label class="fl">Tone</label>
          <select class="fc" id="ai-blog-tone">
            <option value="professional">Professional</option>
            <option value="casual">Casual & Friendly</option>
            <option value="technical">Technical & Detailed</option>
            <option value="beginner">Beginner-Friendly</option>
          </select>
        </div>
        <div class="fg">
          <label class="fl">Length</label>
          <select class="fc" id="ai-blog-length">
            <option value="short">Short (~600 words)</option>
            <option value="medium" selected>Medium (~1200 words)</option>
            <option value="long">Long (~2000 words)</option>
          </select>
        </div>
      </div>

      <!-- KEYWORDS & AUDIENCE -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div class="fg">
          <label class="fl">Target Keywords</label>
          <input class="fc" id="ai-blog-keywords" placeholder="coreldraw, design tips, vector graphics">
        </div>
        <div class="fg">
          <label class="fl">Target Audience</label>
          <input class="fc" id="ai-blog-audience" placeholder="graphic designers, freelancers" value="graphic designers and creative professionals">
        </div>
      </div>

      <!-- PRODUCT LINKS -->
      <div class="fg">
        <label class="fl" style="display:flex;align-items:center;gap:6px">
          <i class="fas fa-link" style="color:var(--blue)"></i>
          Link Products in Article
          <span style="font-size:10px;font-weight:400;color:var(--text3)">(AI will naturally mention these)</span>
        </label>
        <input class="fc" id="ai-blog-products" placeholder="Search products to link..." oninput="blogSearchProducts(this.value)">
        <div id="blog-product-suggestions" style="display:none;background:var(--bg3);border-radius:8px;margin-top:4px;max-height:150px;overflow-y:auto"></div>
        <div id="blog-linked-products" style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px"></div>
      </div>

      <!-- AI MODEL -->
      <div class="fg">
        <label class="fl" style="display:flex;align-items:center;gap:6px">
          <i class="fas fa-robot" style="color:var(--accent)"></i>
          AI Model
        </label>
        <select class="fc" id="ai-blog-model">
          <option value="">Default (Claude 3.5 Haiku)</option>
          ${models.map(m=>`<option value="${m.id}">${m.icon||'🤖'} ${m.name}</option>`).join('')}
        </select>
      </div>

      <!-- GENERATE BUTTON -->
      <button class="btn btn-primary" id="ai-blog-gen-btn" onclick="blogAIGenerate()" style="width:100%;padding:14px;font-size:15px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border:none">
        <i class="fas fa-robot"></i> Generate Full Article
      </button>

      <!-- PROGRESS -->
      <div id="ai-blog-progress" style="display:none;background:var(--bg3);border-radius:10px;padding:14px;text-align:center">
        <div class="spinner" style="width:28px;height:28px;border:3px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 10px"></div>
        <div style="font-size:13px;font-weight:600" id="ai-blog-progress-text">AI is writing your article...</div>
        <div style="font-size:11px;color:var(--text3);margin-top:4px">This takes 15-30 seconds</div>
      </div>

      <!-- RESULT PREVIEW -->
      <div id="ai-blog-result" style="display:none">
        <div style="background:rgba(16,185,129,.1);border:1px solid var(--green);border-radius:10px;padding:12px 16px;margin-bottom:12px;display:flex;align-items:center;gap:10px">
          <i class="fas fa-check-circle" style="color:var(--green);font-size:18px"></i>
          <div>
            <div style="font-size:13px;font-weight:700;color:var(--green)">Article generated!</div>
            <div style="font-size:12px;color:var(--text2)">Review the content below, then open in editor to make changes</div>
          </div>
        </div>
        <div id="ai-blog-preview" style="background:var(--bg3);border-radius:10px;padding:16px;max-height:300px;overflow-y:auto;font-size:13px;line-height:1.6"></div>
        <div style="display:flex;gap:8px;margin-top:12px">
          <button class="btn btn-primary" onclick="blogAIOpenInEditor()" style="flex:1"><i class="fas fa-edit"></i>Open in Editor</button>
          <button class="btn btn-success" onclick="blogAISaveDraft()" style="flex:1"><i class="fas fa-save"></i>Save as Draft</button>
          <button class="btn btn-secondary" onclick="blogAIGenerate()" style="flex-shrink:0"><i class="fas fa-sync"></i>Regenerate</button>
        </div>
      </div>

    </div>
  </div>`;
  document.body.appendChild(overlay);
  window._blogLinkedProducts = [];
  window._blogAIResult = null;
};

window._blogLinkedProducts = [];
window._blogAIResult = null;

window.blogHandleRefFile = async function(input) {
  const file = input.files[0];
  if (!file) return;
  const label = document.getElementById('ref-file-name');
  const status = document.getElementById('ref-upload-status');
  if (label) label.textContent = `Uploading ${file.name}...`;
  if (status) status.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Extracting text...';

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', 'reference');
    const token = AdminAPI.getToken();
    const res = await fetch('http://localhost:8080/api/v1/blog-ai/from-pdf', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData
    });
    const data = await res.json();
    if (data.success) {
      window._blogRefText = data.data.reference_text;
      if (label) label.textContent = `✓ ${file.name} (${data.data.word_count} words)`;
      if (status) status.innerHTML = `<span style="color:var(--green)">✓ Reference loaded — AI will use this for accuracy</span>`;
    } else {
      if (status) status.innerHTML = `<span style="color:var(--red)">✗ ${data.error}</span>`;
    }
  } catch (e) {
    if (status) status.innerHTML = `<span style="color:var(--red)">✗ Upload failed: ${e.message}</span>`;
  }
};

window.blogSearchProducts = async function(q) {
  if (!q || q.length < 2) { document.getElementById('blog-product-suggestions').style.display = 'none'; return; }
  try {
    const res = await AdminAPI.getProducts({ search: q, limit: 8 });
    const products = res.data?.products || [];
    const el = document.getElementById('blog-product-suggestions');
    if (!el) return;
    if (!products.length) { el.style.display = 'none'; return; }
    el.style.display = 'block';
    el.innerHTML = products.map(p => `
      <div style="padding:8px 12px;cursor:pointer;font-size:12px;display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--border)"
        onclick="blogAddLinkedProduct(${p.id},'${(p.title||'').replace(/'/g,"\\'")}','${p.slug}')"
        onmouseover="this.style.background='var(--bg4)'" onmouseout="this.style.background='none'">
        <img src="${p.image||''}" style="width:28px;height:28px;border-radius:4px;object-fit:cover" onerror="this.style.display='none'">
        <span>${p.title}</span>
        <span style="color:var(--text3);margin-left:auto">₹${p.price}</span>
      </div>`).join('');
  } catch {}
};

window.blogAddLinkedProduct = function(id, name, slug) {
  if (!window._blogLinkedProducts) window._blogLinkedProducts = [];
  if (window._blogLinkedProducts.find(p => p.id === id)) return;
  window._blogLinkedProducts.push({ id, name, slug });
  const el = document.getElementById('blog-linked-products');
  if (el) el.innerHTML = window._blogLinkedProducts.map(p => `
    <span style="background:var(--bg3);border:1px solid var(--border);padding:3px 10px;border-radius:99px;font-size:11px;display:flex;align-items:center;gap:5px">
      🔗 ${p.name}
      <button onclick="window._blogLinkedProducts=window._blogLinkedProducts.filter(x=>x.id!==${p.id});blogAddLinkedProduct(-1,'','')" style="background:none;border:none;cursor:pointer;color:var(--text3);font-size:12px">×</button>
    </span>`).join('');
  document.getElementById('blog-product-suggestions').style.display = 'none';
  document.getElementById('ai-blog-products').value = '';
};

window.blogAIGenerate = async function() {
  const topic = document.getElementById('ai-blog-topic')?.value?.trim();
  if (!topic) { toast('Enter a topic first', 'w'); return; }

  const btn = document.getElementById('ai-blog-gen-btn');
  const progress = document.getElementById('ai-blog-progress');
  const result = document.getElementById('ai-blog-result');
  if (btn) btn.style.display = 'none';
  if (progress) progress.style.display = 'block';
  if (result) result.style.display = 'none';

  try {
    const body = {
      topic,
      category: document.getElementById('ai-blog-cat')?.value,
      tone: document.getElementById('ai-blog-tone')?.value,
      length: document.getElementById('ai-blog-length')?.value,
      keywords: document.getElementById('ai-blog-keywords')?.value,
      target_audience: document.getElementById('ai-blog-audience')?.value,
      model_id: document.getElementById('ai-blog-model')?.value || undefined,
      product_links: window._blogLinkedProducts || [],
      reference_text: window._blogRefText || undefined
    };

    const res = await AdminAPI.post('/v1/blog-ai/generate', body);
    if (!res.success) throw new Error(res.error);

    window._blogAIResult = res.data;

    // Show preview
    const preview = document.getElementById('ai-blog-preview');
    if (preview) {
      preview.innerHTML = `
        <div style="margin-bottom:10px">
          <div style="font-size:16px;font-weight:800">${res.data.title}</div>
          <div style="font-size:11px;color:var(--text3);margin-top:4px">
            ${res.data.tags?.map(t=>`<span style="background:var(--bg4);padding:1px 7px;border-radius:99px;margin-right:3px">#${t}</span>`).join('')}
          </div>
        </div>
        <div style="font-size:12px;color:var(--text2);margin-bottom:10px;font-style:italic">${res.data.excerpt}</div>
        <div style="font-size:12px;line-height:1.6;color:var(--text)">${res.data.content?.substring(0, 800)}...</div>`;
    }
    if (result) result.style.display = 'block';
  } catch (e) {
    toast('Generation failed: ' + e.message, 'e');
    if (btn) btn.style.display = 'block';
  } finally {
    if (progress) progress.style.display = 'none';
    if (btn) btn.style.display = 'block';
  }
};

window.blogAIOpenInEditor = function() {
  if (!window._blogAIResult) return;
  document.getElementById('blog-ai-overlay')?.remove();
  window._blogEditing = 'new';
  window._blogAIData = window._blogAIResult;
  navigate('blog');
};

window.blogAISaveDraft = async function() {
  if (!window._blogAIResult) return;
  const d = window._blogAIResult;
  try {
    const res = await AdminAPI.createBlogPost({
      title: d.title, slug: d.slug, excerpt: d.excerpt, content: d.content,
      category: document.getElementById('ai-blog-cat')?.value || 'General',
      tags: d.tags || [], image: '', status: 'draft',
      seo_title: d.seo_title, seo_desc: d.seo_desc,
      ai_generated: true, read_time: d.read_time
    });
    if (res.success) {
      toast('Draft saved!', 's');
      document.getElementById('blog-ai-overlay')?.remove();
      window._blogPosts = [];
      navigate('blog');
    }
  } catch (e) { toast('Save failed: ' + e.message, 'e'); }
};

// ── BLOG EDITOR ───────────────────────────────────────────────────────────────
window.openBlogEditor = async function(slugOrNew) {
  window._blogEditing = slugOrNew;
  if (slugOrNew !== 'new') {
    // Load from backend
    try {
      const res = await AdminAPI.getBlogPost(slugOrNew);
      window._blogCurrentPost = res.data;
    } catch { window._blogCurrentPost = null; }
  } else {
    window._blogCurrentPost = null;
  }
  navigate('blog');
};

function renderBlogEditor(slugOrNew) {
  const isNew = slugOrNew === 'new';
  const a = isNew ? (window._blogAIData || {
    title:'', excerpt:'', content:'', image:'', tags:[], category:'',
    slug:'', seo_title:'', seo_desc:'', seo_keywords:'', read_time:5,
    status:'draft', featured:false, author:'Admin'
  }) : (window._blogCurrentPost || {});

  // Clear AI data after use
  if (isNew && window._blogAIData) {
    setTimeout(() => { window._blogAIData = null; }, 100);
  }

  const cats = window._blogCategories;
  const models = window._blogAIModels;
  const content = (a.content || '').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  return `
  <div class="ph">
    <div style="display:flex;align-items:center;gap:10px">
      <button class="btn btn-secondary btn-sm" onclick="window._blogEditing=null;window._blogCurrentPost=null;navigate('blog')"><i class="fas fa-arrow-left"></i>Back</button>
      <div>
        <div class="ph-title">${isNew?'Write New Article':a.title||'Edit Article'}</div>
        <div class="ph-sub">${isNew?'Create a new blog post':'Edit article content, SEO and settings'}</div>
      </div>
    </div>
    <div class="ph-actions">
      <button class="btn btn-secondary" onclick="blogAIAssist()"><i class="fas fa-robot"></i>AI Assist</button>
      <button class="btn btn-secondary" onclick="saveBlogEditor(false)"><i class="fas fa-save"></i>Save Draft</button>
      <button class="btn btn-primary" onclick="saveBlogEditor(true)"><i class="fas fa-rocket"></i>Publish</button>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 300px;gap:16px;align-items:start">
    <!-- MAIN EDITOR -->
    <div style="display:flex;flex-direction:column;gap:14px">

      <!-- TITLE -->
      <div class="card">
        <input class="fc" id="blog-title" value="${(a.title||'').replace(/"/g,'&quot;')}" placeholder="Article title..." style="font-size:22px;font-weight:700;border:none;background:none;padding:8px 0;border-bottom:2px solid var(--border)" oninput="updateBlogSlug(this.value)">
      </div>

      <!-- FEATURED IMAGE -->
      <div class="card">
        <div class="card-hd"><div class="card-title"><i class="fas fa-image" style="color:var(--accent)"></i>Featured Image</div>
          <button class="btn btn-secondary btn-sm" onclick="blogFetchOGImage()"><i class="fas fa-magic"></i>Fetch from URL</button>
        </div>
        <input class="fc" id="blog-image" value="${a.image||''}" placeholder="https://image-url.com/photo.jpg" oninput="previewBlogImage(this.value)">
        <div id="blog-img-preview-wrap" style="margin-top:8px">
          ${a.image?`<img id="blog-img-preview" src="${a.image}" style="width:100%;max-height:200px;object-fit:cover;border-radius:10px">`:`<div id="blog-img-preview" style="width:100%;height:100px;background:var(--bg3);border-radius:10px;display:flex;align-items:center;justify-content:center;cursor:pointer" onclick="document.getElementById('blog-image').focus()"><i class="fas fa-image" style="font-size:28px;color:var(--text3)"></i></div>`}
        </div>
        ${a.image_prompt?`<div style="font-size:11px;color:var(--text3);margin-top:6px;padding:6px 10px;background:var(--bg3);border-radius:6px">💡 AI image prompt: ${a.image_prompt}</div>`:''}
      </div>

      <!-- EXCERPT -->
      <div class="card">
        <div class="card-hd"><div class="card-title"><i class="fas fa-align-left" style="color:var(--blue)"></i>Excerpt / Summary</div>
          <button class="btn btn-secondary btn-sm" onclick="blogAIExcerpt()"><i class="fas fa-robot"></i>AI Write</button>
        </div>
        <textarea class="fc" id="blog-excerpt" rows="3" placeholder="Brief summary shown in blog listing..." oninput="document.getElementById('excerpt-count').textContent=this.value.length+'/200'">${a.excerpt||''}</textarea>
        <div style="font-size:11px;color:var(--text3);margin-top:4px" id="excerpt-count">${(a.excerpt||'').length}/200</div>
      </div>

      <!-- CONTENT EDITOR -->
      <div class="card">
        <div class="card-hd">
          <div class="card-title"><i class="fas fa-pen-nib" style="color:var(--purple)"></i>Article Content</div>
          <div style="display:flex;gap:4px;flex-wrap:wrap">
            <button onclick="toggleBlogPreview()" class="btn btn-secondary btn-sm"><i class="fas fa-eye"></i>Preview</button>
            <button onclick="blogAIExpandSection()" class="btn btn-secondary btn-sm"><i class="fas fa-robot"></i>AI Expand</button>
          </div>
        </div>
        <!-- Format toolbar -->
        <div style="background:var(--bg3);border-radius:9px;padding:6px;margin-bottom:8px;display:flex;gap:4px;flex-wrap:wrap">
          ${[['H2','h2'],['H3','h3'],['Para','p'],['• List','ul'],['1. List','ol'],['❝ Quote','blockquote'],['</> Code','code'],['🖼 Image','img'],['— HR','hr']].map(([lb,cmd])=>
            `<button onclick="insertBlogBlock('${cmd}')" class="btn btn-secondary btn-sm" style="font-size:11px">${lb}</button>`
          ).join('')}
          <button onclick="blogInsertProductLink()" class="btn btn-secondary btn-sm" style="font-size:11px;color:var(--accent)">🔗 Product</button>
        </div>
        <textarea class="fc" id="blog-content" rows="22" placeholder="Write your article content here (HTML supported)..." style="font-family:monospace;font-size:13px;line-height:1.6">${content}</textarea>
        <div id="blog-preview-panel" style="display:none;background:var(--bg3);border-radius:9px;padding:20px;margin-top:8px;max-height:500px;overflow-y:auto">
          <div id="blog-preview-content" style="font-size:14px;line-height:1.7;color:var(--text)"></div>
        </div>
        <div style="font-size:11px;color:var(--text3);margin-top:4px" id="content-count">${(a.content||'').length} chars</div>
      </div>

      <!-- SEO -->
      <div class="card">
        <div class="card-hd"><div class="card-title"><i class="fas fa-search" style="color:var(--green)"></i>SEO Settings</div>
          <button class="btn btn-secondary btn-sm" onclick="blogAIGenerateSEO()"><i class="fas fa-robot"></i>AI Generate SEO</button>
        </div>
        <div class="fg"><label class="fl">SEO Title <span style="font-size:10px;color:var(--text3)">(50-60 chars ideal)</span></label>
          <input class="fc" id="blog-seo-title" value="${(a.seo_title||'').replace(/"/g,'&quot;')}" placeholder="Article Title | DigiKraft Blog" oninput="updateSEOCount(this,'seo-title-count',30,60)">
          <div id="seo-title-count" style="font-size:11px;margin-top:3px;color:var(--text3)">${(a.seo_title||'').length} chars</div>
        </div>
        <div class="fg"><label class="fl">SEO Description <span style="font-size:10px;color:var(--text3)">(120-160 chars ideal)</span></label>
          <textarea class="fc" id="blog-seo-desc" rows="2" placeholder="Meta description..." oninput="updateSEOCount(this,'seo-desc-count',120,160)">${a.seo_desc||''}</textarea>
          <div id="seo-desc-count" style="font-size:11px;margin-top:3px;color:var(--text3)">${(a.seo_desc||'').length} chars</div>
        </div>
        <div class="fg"><label class="fl">SEO Keywords</label>
          <input class="fc" id="blog-seo-kw" value="${a.seo_keywords||''}" placeholder="design, tutorial, figma, ui kit">
        </div>
        <div style="background:var(--bg3);border-radius:9px;padding:12px;margin-top:4px">
          <div style="font-size:11px;color:var(--text3);font-weight:700;margin-bottom:6px">GOOGLE PREVIEW</div>
          <div style="color:#1a0dab;font-size:16px">${a.seo_title||a.title||'Article Title'}</div>
          <div style="color:#006621;font-size:12px">digikraft.shop/blog/${a.slug||'article-slug'}</div>
          <div style="color:var(--text2);font-size:12px;margin-top:3px">${a.seo_desc||a.excerpt||'Article description...'}</div>
        </div>
      </div>

    </div>

    <!-- RIGHT PANEL -->
    <div style="display:flex;flex-direction:column;gap:14px;position:sticky;top:80px">

      <!-- PUBLISH -->
      <div class="card">
        <div class="card-hd"><div class="card-title"><i class="fas fa-rocket" style="color:var(--accent)"></i>Publish</div></div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
          <span style="font-size:13px">Status</span>
          <span class="tag ${a.status==='published'?'tg':'ty'}">${a.status==='published'?'Published':'Draft'}</span>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
          <span style="font-size:13px">Featured</span>
          <label class="tgl"><input type="checkbox" id="blog-featured" ${a.featured?'checked':''}><span class="tgs"></span></label>
        </div>
        <div class="fg" style="margin-top:8px"><label class="fl">Author</label><input class="fc" id="blog-author" value="${a.author||'Admin'}"></div>
        <div class="fg"><label class="fl">Read Time (min)</label><input class="fc" id="blog-readtime" type="number" value="${a.read_time||a.readTime||5}" min="1"></div>
        <div style="display:flex;gap:6px;margin-top:4px">
          <button class="btn btn-secondary" style="flex:1" onclick="saveBlogEditor(false)"><i class="fas fa-save"></i>Draft</button>
          <button class="btn btn-primary" style="flex:1" onclick="saveBlogEditor(true)"><i class="fas fa-rocket"></i>Publish</button>
        </div>
      </div>

      <!-- CATEGORY & TAGS -->
      <div class="card">
        <div class="card-hd"><div class="card-title"><i class="fas fa-tags" style="color:var(--blue)"></i>Category & Tags</div>
          <button class="btn btn-secondary btn-sm btn-icon" onclick="blogManageCategories()" title="Manage categories"><i class="fas fa-cog"></i></button>
        </div>
        <div class="fg"><label class="fl">Category</label>
          <select class="fc" id="blog-category">
            <option value="">Select category...</option>
            ${cats.map(c=>`<option value="${c.name}" ${a.category===c.name?'selected':''}>${c.icon} ${c.name}</option>`).join('')}
          </select>
        </div>
        <div class="fg"><label class="fl">Tags <span style="font-size:10px;color:var(--text3)">(comma separated)</span></label>
          <input class="fc" id="blog-tags" value="${(a.tags||[]).join(', ')}" placeholder="design, tutorial, figma" oninput="updateTagPreview(this.value)">
          <div id="tag-preview" style="display:flex;gap:3px;flex-wrap:wrap;margin-top:6px">
            ${(a.tags||[]).map(t=>`<span style="background:var(--bg3);color:var(--text2);font-size:11px;padding:2px 8px;border-radius:99px">#${t}</span>`).join('')}
          </div>
        </div>
      </div>

      <!-- SLUG -->
      <div class="card">
        <div class="card-hd"><div class="card-title"><i class="fas fa-link" style="color:var(--text3)"></i>URL Slug</div></div>
        <div style="font-size:11px;color:var(--text3);margin-bottom:4px">digikraft.shop/blog/</div>
        <input class="fc" id="blog-slug" value="${a.slug||''}" placeholder="article-url-slug" style="font-family:monospace" oninput="this.dataset.manual='1'">
      </div>

      <!-- AI ASSIST PANEL -->
      <div class="card" id="blog-ai-assist-panel" style="display:none">
        <div class="card-hd"><div class="card-title"><i class="fas fa-robot" style="color:var(--accent)"></i>AI Assist</div>
          <button class="btn btn-secondary btn-sm btn-icon" onclick="document.getElementById('blog-ai-assist-panel').style.display='none'"><i class="fas fa-times"></i></button>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <button class="btn btn-secondary btn-sm" onclick="blogAIExcerpt()"><i class="fas fa-align-left"></i>Write Excerpt</button>
          <button class="btn btn-secondary btn-sm" onclick="blogAIGenerateSEO()"><i class="fas fa-search"></i>Generate SEO</button>
          <button class="btn btn-secondary btn-sm" onclick="blogAIExpandSection()"><i class="fas fa-expand"></i>Expand Selected</button>
          <button class="btn btn-secondary btn-sm" onclick="blogAIAddIntro()"><i class="fas fa-paragraph"></i>Write Intro</button>
          <button class="btn btn-secondary btn-sm" onclick="blogAIAddConclusion()"><i class="fas fa-flag-checkered"></i>Write Conclusion</button>
        </div>
        <div class="fg" style="margin-top:8px"><label class="fl">AI Model</label>
          <select class="fc" id="blog-assist-model">
            <option value="">Default</option>
            ${models.map(m=>`<option value="${m.id}">${m.icon||'🤖'} ${m.name}</option>`).join('')}
          </select>
        </div>
      </div>

    </div>
  </div>
  <input type="hidden" id="blog-slug-original" value="${a.slug||''}">`;
}

// ── EDITOR HELPERS ────────────────────────────────────────────────────────────
window.updateBlogSlug = function(title) {
  const el = document.getElementById('blog-slug');
  if (el && !el.dataset.manual) el.value = title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
};

window.previewBlogImage = function(url) {
  const wrap = document.getElementById('blog-img-preview-wrap');
  if (!wrap) return;
  if (url) wrap.innerHTML = `<img id="blog-img-preview" src="${url}" style="width:100%;max-height:200px;object-fit:cover;border-radius:10px">`;
};

window.blogFetchOGImage = async function() {
  const url = prompt('Enter a URL to fetch its OG image:');
  if (!url) return;
  try {
    const res = await AdminAPI.post('/v1/ai/generate-thumbnail', { url });
    if (res.success && res.thumbnail_url) {
      document.getElementById('blog-image').value = res.thumbnail_url;
      previewBlogImage(res.thumbnail_url);
      toast('Image fetched!', 's');
    }
  } catch (e) { toast('Could not fetch image', 'e'); }
};

window.updateTagPreview = function(val) {
  const tags = val.split(',').map(t=>t.trim()).filter(Boolean);
  const el = document.getElementById('tag-preview');
  if (el) el.innerHTML = tags.map(t=>`<span style="background:var(--bg3);color:var(--text2);font-size:11px;padding:2px 8px;border-radius:99px">#${t}</span>`).join('');
};

window.updateSEOCount = function(el, countId, min, max) {
  const len = el.value.length;
  const countEl = document.getElementById(countId);
  if (countEl) countEl.innerHTML = `<span style="color:${len<min||len>max?'var(--yellow)':'var(--green)'}">${len} chars (ideal: ${min}-${max})</span>`;
};

window.insertBlogBlock = function(type) {
  const ta = document.getElementById('blog-content');
  if (!ta) return;
  const blocks = {
    h2:'\n<h2>Section Heading</h2>\n', h3:'\n<h3>Sub Heading</h3>\n',
    p:'\n<p>Your paragraph text here...</p>\n',
    ul:'\n<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n  <li>Item 3</li>\n</ul>\n',
    ol:'\n<ol>\n  <li>Step 1</li>\n  <li>Step 2</li>\n  <li>Step 3</li>\n</ol>\n',
    blockquote:'\n<blockquote>Your quote here...</blockquote>\n',
    code:'\n<pre><code>// Your code here</code></pre>\n',
    img:'\n<img src="https://image-url.jpg" alt="Image description" style="width:100%;border-radius:8px;margin:12px 0">\n',
    hr:'\n<hr>\n'
  };
  const pos = ta.selectionStart;
  ta.value = ta.value.substring(0,pos) + (blocks[type]||'') + ta.value.substring(pos);
  ta.focus();
};

window.blogInsertProductLink = async function() {
  const name = prompt('Product name to link:');
  if (!name) return;
  try {
    const res = await AdminAPI.getProducts({ search: name, limit: 5 });
    const products = res.data?.products || [];
    if (!products.length) { toast('No products found', 'w'); return; }
    const p = products[0];
    const link = `<a href="/products/${p.slug}" class="product-link">${p.title}</a>`;
    const ta = document.getElementById('blog-content');
    if (ta) {
      const pos = ta.selectionStart;
      ta.value = ta.value.substring(0,pos) + link + ta.value.substring(pos);
    }
    toast(`Linked: ${p.title}`, 's');
  } catch (e) { toast('Search failed', 'e'); }
};

window.toggleBlogPreview = function() {
  const panel = document.getElementById('blog-preview-panel');
  const content = document.getElementById('blog-content');
  const previewContent = document.getElementById('blog-preview-content');
  if (!panel || !content) return;
  const isHidden = panel.style.display === 'none';
  panel.style.display = isHidden ? 'block' : 'none';
  if (isHidden && previewContent) previewContent.innerHTML = content.value;
};

window.blogAIAssist = function() {
  const panel = document.getElementById('blog-ai-assist-panel');
  if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
};

window.blogAIExcerpt = async function() {
  const title = document.getElementById('blog-title')?.value;
  const content = document.getElementById('blog-content')?.value?.substring(0, 500);
  if (!title) { toast('Add a title first', 'w'); return; }
  const model = document.getElementById('blog-assist-model')?.value;
  try {
    const res = await AdminAPI.post('/v1/blog-ai/expand', {
      text: `Title: ${title}\nContent: ${content}`,
      instruction: 'Write a compelling 2-3 sentence excerpt/summary for this blog article (max 200 chars)',
      model_id: model || undefined
    });
    if (res.success) {
      document.getElementById('blog-excerpt').value = res.data.replace(/<[^>]+>/g,'').substring(0,200);
      toast('Excerpt generated!', 's');
    }
  } catch (e) { toast('AI failed: ' + e.message, 'e'); }
};

window.blogAIGenerateSEO = async function() {
  const title = document.getElementById('blog-title')?.value;
  const content = document.getElementById('blog-content')?.value;
  if (!title) { toast('Add a title first', 'w'); return; }
  const model = document.getElementById('blog-assist-model')?.value;
  try {
    toast('Generating SEO...', 'i');
    const res = await AdminAPI.post('/v1/blog-ai/seo', { title, content, model_id: model || undefined });
    if (res.success) {
      const d = res.data;
      if (d.seo_title) document.getElementById('blog-seo-title').value = d.seo_title;
      if (d.seo_desc) document.getElementById('blog-seo-desc').value = d.seo_desc;
      if (d.seo_keywords) document.getElementById('blog-seo-kw').value = d.seo_keywords;
      if (d.tags?.length) {
        document.getElementById('blog-tags').value = d.tags.join(', ');
        updateTagPreview(d.tags.join(', '));
      }
      toast('SEO generated!', 's');
    }
  } catch (e) { toast('AI failed: ' + e.message, 'e'); }
};

window.blogAIExpandSection = async function() {
  const ta = document.getElementById('blog-content');
  if (!ta) return;
  const selected = ta.value.substring(ta.selectionStart, ta.selectionEnd);
  if (!selected) { toast('Select text to expand', 'w'); return; }
  const model = document.getElementById('blog-assist-model')?.value;
  try {
    toast('Expanding...', 'i');
    const res = await AdminAPI.post('/v1/blog-ai/expand', {
      text: selected,
      instruction: 'Expand and improve this section with more detail, examples, and better formatting',
      model_id: model || undefined
    });
    if (res.success) {
      const start = ta.selectionStart;
      ta.value = ta.value.substring(0, start) + res.data + ta.value.substring(ta.selectionEnd);
      toast('Section expanded!', 's');
    }
  } catch (e) { toast('AI failed: ' + e.message, 'e'); }
};

window.blogAIAddIntro = async function() {
  const title = document.getElementById('blog-title')?.value;
  if (!title) { toast('Add a title first', 'w'); return; }
  const model = document.getElementById('blog-assist-model')?.value;
  try {
    const res = await AdminAPI.post('/v1/blog-ai/expand', {
      text: title,
      instruction: 'Write an engaging introduction paragraph for this blog article. Include a hook, context, and what the reader will learn.',
      model_id: model || undefined
    });
    if (res.success) {
      const ta = document.getElementById('blog-content');
      if (ta) ta.value = res.data + '\n\n' + ta.value;
      toast('Intro added!', 's');
    }
  } catch (e) { toast('AI failed: ' + e.message, 'e'); }
};

window.blogAIAddConclusion = async function() {
  const title = document.getElementById('blog-title')?.value;
  const content = document.getElementById('blog-content')?.value?.substring(0, 1000);
  const model = document.getElementById('blog-assist-model')?.value;
  try {
    const res = await AdminAPI.post('/v1/blog-ai/expand', {
      text: `Title: ${title}\nContent: ${content}`,
      instruction: 'Write a strong conclusion paragraph that summarizes key points and includes a call-to-action',
      model_id: model || undefined
    });
    if (res.success) {
      const ta = document.getElementById('blog-content');
      if (ta) ta.value = ta.value + '\n\n' + res.data;
      toast('Conclusion added!', 's');
    }
  } catch (e) { toast('AI failed: ' + e.message, 'e'); }
};

// ── SAVE TO BACKEND ───────────────────────────────────────────────────────────
window.saveBlogEditor = async function(publish) {
  const title = document.getElementById('blog-title')?.value?.trim();
  const content = document.getElementById('blog-content')?.value?.trim();
  if (!title) { toast('Title is required', 'w'); return; }
  if (!content) { toast('Content is required', 'w'); return; }

  const tags = (document.getElementById('blog-tags')?.value||'').split(',').map(t=>t.trim()).filter(Boolean);
  const slug = document.getElementById('blog-slug')?.value?.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g,'-');
  const originalSlug = document.getElementById('blog-slug-original')?.value;
  const isNew = !originalSlug;

  const payload = {
    title,
    slug,
    excerpt: document.getElementById('blog-excerpt')?.value?.trim() || '',
    content,
    image: document.getElementById('blog-image')?.value?.trim() || '',
    category: document.getElementById('blog-category')?.value || '',
    tags,
    status: publish ? 'published' : 'draft',
    featured: document.getElementById('blog-featured')?.checked || false,
    author: document.getElementById('blog-author')?.value || 'Admin',
    read_time: parseInt(document.getElementById('blog-readtime')?.value || 5),
    seo_title: document.getElementById('blog-seo-title')?.value?.trim() || '',
    seo_desc: document.getElementById('blog-seo-desc')?.value?.trim() || '',
    seo_keywords: document.getElementById('blog-seo-kw')?.value?.trim() || '',
    ai_generated: !!(window._blogCurrentPost?.ai_generated || window._blogAIData)
  };

  const saveBtn = document.querySelector('.ph-actions .btn-primary');
  if (saveBtn) { saveBtn.disabled = true; saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...'; }

  try {
    let res;
    if (isNew) {
      res = await AdminAPI.createBlogPost(payload);
    } else {
      res = await AdminAPI.updateBlogPost(originalSlug, payload);
    }

    if (res.success) {
      toast(publish ? 'Article published!' : 'Draft saved!', publish ? 's' : 'i');
      window._blogEditing = null;
      window._blogCurrentPost = null;
      window._blogPosts = []; // force reload
      navigate('blog');
    } else {
      toast('Save failed: ' + (res.error || 'Unknown error'), 'e');
    }
  } catch (e) {
    toast('Save failed: ' + e.message, 'e');
  } finally {
    if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = '<i class="fas fa-rocket"></i>Publish'; }
  }
};

// ── BLOG ACTIONS ──────────────────────────────────────────────────────────────
window.toggleBlogPublish = async function(slug, currentStatus) {
  const newStatus = currentStatus === 'published' ? 'draft' : 'published';
  try {
    await AdminAPI.updateBlogPost(slug, { status: newStatus });
    toast(newStatus === 'published' ? 'Published!' : 'Moved to draft', 's');
    window._blogPosts = [];
    navigate('blog');
  } catch (e) { toast('Failed: ' + e.message, 'e'); }
};

window.deleteBlog = async function(slug, title) {
  if (!confirm(`Delete "${title}"?`)) return;
  try {
    await AdminAPI.deleteBlogPost(slug);
    toast('Article deleted', 's');
    window._blogPosts = [];
    navigate('blog');
  } catch (e) { toast('Delete failed: ' + e.message, 'e'); }
};

// ── CATEGORY MANAGER ──────────────────────────────────────────────────────────
window.blogManageCategories = function() {
  const cats = window._blogCategories;
  const overlay = document.createElement('div');
  overlay.id = 'blog-cat-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:500;display:flex;align-items:center;justify-content:center;padding:16px';
  overlay.innerHTML = `
  <div style="background:var(--bg2);border:1px solid var(--border);border-radius:14px;width:100%;max-width:480px;max-height:80vh;overflow-y:auto">
    <div style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between">
      <strong style="font-size:15px">Blog Categories</strong>
      <button onclick="document.getElementById('blog-cat-overlay').remove()" style="background:var(--bg3);border:none;border-radius:7px;width:28px;height:28px;cursor:pointer;color:var(--text2)">×</button>
    </div>
    <div style="padding:16px 20px">
      <!-- Add new -->
      <div style="display:flex;gap:8px;margin-bottom:16px">
        <input class="fc" id="new-cat-icon" placeholder="📝" style="width:50px;text-align:center;font-size:18px">
        <input class="fc" id="new-cat-name" placeholder="Category name" style="flex:1">
        <button class="btn btn-primary btn-sm" onclick="blogAddCategory()"><i class="fas fa-plus"></i>Add</button>
      </div>
      <!-- List -->
      <div id="blog-cat-list" style="display:flex;flex-direction:column;gap:6px">
        ${cats.map(c => `
        <div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--bg3);border-radius:9px">
          <span style="font-size:18px">${c.icon}</span>
          <span style="flex:1;font-size:13px;font-weight:600">${c.name}</span>
          <span style="font-size:11px;color:var(--text3)">${c.slug}</span>
          <button class="btn btn-danger btn-sm btn-icon" onclick="blogDeleteCategory('${c.id}')"><i class="fas fa-trash"></i></button>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
  document.body.appendChild(overlay);
};

window.blogAddCategory = async function() {
  const name = document.getElementById('new-cat-name')?.value?.trim();
  const icon = document.getElementById('new-cat-icon')?.value?.trim() || '📝';
  if (!name) { toast('Enter a category name', 'w'); return; }
  try {
    const res = await AdminAPI.post('/v1/blog-ai/categories', { name, icon });
    if (res.success) {
      window._blogCategories = res.data;
      toast('Category added!', 's');
      document.getElementById('blog-cat-overlay')?.remove();
      blogManageCategories();
    }
  } catch (e) { toast('Failed: ' + e.message, 'e'); }
};

window.blogDeleteCategory = async function(id) {
  if (!confirm('Delete this category?')) return;
  try {
    const res = await AdminAPI.delete(`/v1/blog-ai/categories/${id}`);
    if (res.success) {
      window._blogCategories = res.data;
      toast('Category deleted', 's');
      document.getElementById('blog-cat-overlay')?.remove();
      blogManageCategories();
    }
  } catch (e) { toast('Failed: ' + e.message, 'e'); }
};

// Add createBlogPost to AdminAPI if not present
if (!AdminAPI.createBlogPost) {
  AdminAPI.createBlogPost = (data) => AdminAPI.post('/v1/blog', data);
}
