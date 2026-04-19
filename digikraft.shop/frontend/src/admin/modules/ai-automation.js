// ===== AI AUTOMATION MODULE =====
// AI-powered product listing from URLs and PDFs

window._aiTab = window._aiTab || 'url';
window._aiResults = window._aiResults || [];
window._aiJobId = window._aiJobId || null;
window._aiJobTimer = null;

window.renderAI = function() {
  const tab = window._aiTab;
  const tabs = [
    ['url','URL to Product'],['pdf','PDF / Bulk Import'],['queue','Review Queue'],['config','AI Config']
  ];
  return `
  <div class="ph">
    <div>
      <div class="ph-title" style="display:flex;align-items:center;gap:10px">
        <span style="background:linear-gradient(135deg,#6366f1,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:22px">✦</span>
        AI Product Automation
      </div>
      <div class="ph-sub">Paste a product URL or upload a PDF — AI generates the full listing automatically</div>
    </div>
    <div class="ph-actions">
      <a href="http://localhost:3001/products" target="_blank" class="btn btn-secondary"><i class="fas fa-eye"></i>View Store</a>
    </div>
  </div>
  <div class="tabs" style="margin-bottom:16px">
    ${tabs.map(([id,lb]) => `<button class="tab ${tab===id?'on':''}" onclick="window._aiTab='${id}';navigate('ai')">${lb}</button>`).join('')}
  </div>
  ${tab==='url' ? renderAIUrlTab() : ''}
  ${tab==='pdf' ? renderAIPdfTab() : ''}
  ${tab==='queue' ? renderAIQueueTab() : ''}
  ${tab==='config' ? renderAIConfigTab() : ''}`;
};

// ── URL TAB ───────────────────────────────────────────────────────────────────
function renderAIUrlTab() {
  return `
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
    <!-- INPUT PANEL -->
    <div class="card">
      <div class="card-hd">
        <div class="card-title"><i class="fas fa-link" style="color:var(--accent)"></i>Product URL Analyzer</div>
      </div>
      <div class="fg">
        <label class="fl">Product URL *</label>
        <input class="fc" id="ai-url-input" placeholder="https://creativemarket.com/product/..." style="font-size:13px">
        <div style="font-size:11px;color:var(--text3);margin-top:4px">Paste any digital product page URL — Envato, Creative Market, Gumroad, etc.</div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">
        ${['https://creativemarket.com','https://elements.envato.com','https://gumroad.com','https://ui8.net'].map(s=>`
        <button class="btn btn-secondary btn-sm" style="font-size:11px" onclick="document.getElementById('ai-url-input').value='${s}/'">${s.replace('https://','')}</button>`).join('')}
      </div>
      <div class="fg">
        <label class="fl">Override Price (₹) — optional</label>
        <input class="fc" id="ai-price-override" type="number" placeholder="Leave empty for AI suggestion" min="0">
      </div>
      <div class="fg">
        <label class="fl">Default Status</label>
        <select class="fc" id="ai-status-select">
          <option value="draft">Draft (review before publishing)</option>
          <option value="published">Published immediately</option>
        </select>
      </div>
      <button class="btn btn-primary" id="ai-analyze-btn" onclick="aiAnalyzeUrl()" style="width:100%">
        <i class="fas fa-robot"></i>Analyze & Generate Listing
      </button>
      <div id="ai-url-progress" style="display:none;margin-top:12px">
        <div style="background:var(--bg3);border-radius:8px;padding:12px;display:flex;align-items:center;gap:10px">
          <div class="spinner" style="width:20px;height:20px;border:2px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin .8s linear infinite;flex-shrink:0"></div>
          <div>
            <div style="font-size:13px;font-weight:600" id="ai-progress-text">Fetching page...</div>
            <div style="font-size:11px;color:var(--text3)">AI is analyzing the product page</div>
          </div>
        </div>
      </div>
    </div>

    <!-- RESULT PREVIEW -->
    <div class="card" id="ai-url-result" style="display:none">
      <div class="card-hd">
        <div class="card-title"><i class="fas fa-check-circle" style="color:var(--green)"></i>Generated Listing</div>
        <div style="display:flex;gap:6px">
          <button class="btn btn-success btn-sm" onclick="aiCreateProduct()"><i class="fas fa-plus"></i>Create Product</button>
          <button class="btn btn-secondary btn-sm" onclick="aiEditResult()"><i class="fas fa-edit"></i>Edit</button>
        </div>
      </div>
      <div id="ai-result-content"></div>
    </div>

    <!-- PLACEHOLDER when no result yet -->
    <div class="card" id="ai-url-placeholder" style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;border:2px dashed var(--border)">
      <div style="font-size:48px;margin-bottom:12px">🤖</div>
      <div style="font-size:15px;font-weight:700;color:var(--text2)">Paste a URL to get started</div>
      <div style="font-size:12px;color:var(--text3);margin-top:6px;text-align:center;max-width:240px">AI will analyze the page and generate a complete product listing with description, price, SEO, and tags</div>
    </div>
  </div>

  <!-- MULTI-URL BATCH -->
  <div class="card" style="margin-top:16px">
    <div class="card-hd">
      <div class="card-title"><i class="fas fa-list" style="color:var(--blue)"></i>Batch URL Import</div>
      <button class="btn btn-primary btn-sm" onclick="aiBatchAnalyze()"><i class="fas fa-robot"></i>Analyze All</button>
    </div>
    <div class="fg">
      <label class="fl">Paste multiple URLs (one per line)</label>
      <textarea class="fc" id="ai-batch-urls" rows="5" placeholder="https://example.com/product-1&#10;https://example.com/product-2&#10;https://example.com/product-3" style="font-family:monospace;font-size:12px"></textarea>
    </div>
    <div id="ai-batch-progress" style="display:none">
      <div style="background:var(--bg3);border-radius:8px;padding:12px;margin-top:8px">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px">
          <span style="font-size:13px;font-weight:600" id="ai-batch-status">Processing...</span>
          <span style="font-size:12px;color:var(--text2)" id="ai-batch-count">0/0</span>
        </div>
        <div style="background:var(--border);border-radius:99px;height:6px">
          <div id="ai-batch-bar" style="background:var(--accent);height:6px;border-radius:99px;width:0%;transition:.3s"></div>
        </div>
      </div>
    </div>
    <div id="ai-batch-results" style="margin-top:12px"></div>
  </div>`;
}

// ── PDF TAB ───────────────────────────────────────────────────────────────────
function renderAIPdfTab() {
  const job = window._aiJobId ? window._aiJobData : null;
  return `
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
    <div class="card">
      <div class="card-hd"><div class="card-title"><i class="fas fa-file-pdf" style="color:var(--red)"></i>PDF / Text File Import</div></div>
      <div style="border:2px dashed var(--border);border-radius:12px;padding:32px;text-align:center;cursor:pointer;margin-bottom:16px;transition:.2s"
        id="pdf-drop-zone"
        ondragover="event.preventDefault();this.style.borderColor='var(--accent)'"
        ondragleave="this.style.borderColor='var(--border)'"
        ondrop="aiHandlePdfDrop(event)"
        onclick="document.getElementById('ai-pdf-input').click()">
        <i class="fas fa-file-upload" style="font-size:36px;color:var(--text3);display:block;margin-bottom:10px"></i>
        <div style="font-size:14px;font-weight:700">Drop PDF or TXT file here</div>
        <div style="font-size:12px;color:var(--text3);margin-top:4px">or click to browse · Max 20MB</div>
        <input type="file" id="ai-pdf-input" accept=".pdf,.txt" style="display:none" onchange="aiUploadPdf(this.files[0])">
      </div>
      <div style="background:var(--bg3);border-radius:10px;padding:12px;margin-bottom:12px">
        <div style="font-size:12px;font-weight:700;margin-bottom:6px;color:var(--text2)">How it works:</div>
        <div style="font-size:12px;color:var(--text3);line-height:1.7">
          1. Upload a PDF containing product links<br>
          2. AI extracts all URLs from the document<br>
          3. Each URL is analyzed and a product listing is generated<br>
          4. Review and publish products from the queue
        </div>
      </div>
      <div style="font-size:12px;color:var(--text3)">
        <strong>Supported formats:</strong> PDF files with clickable links, text files with URLs (one per line)
      </div>
    </div>

    <div class="card">
      <div class="card-hd"><div class="card-title"><i class="fas fa-tasks" style="color:var(--accent)"></i>Processing Status</div></div>
      <div id="ai-pdf-status">
        ${job ? renderJobStatus(job) : `
        <div style="text-align:center;padding:40px 20px;color:var(--text3)">
          <i class="fas fa-inbox" style="font-size:32px;display:block;margin-bottom:10px"></i>
          <div style="font-size:13px">No active job. Upload a PDF to start.</div>
        </div>`}
      </div>
    </div>
  </div>

  <!-- EXTRACTED URLS PREVIEW -->
  <div class="card" id="ai-pdf-urls-card" style="margin-top:16px;display:${job && job.urls ? 'block' : 'none'}">
    <div class="card-hd">
      <div class="card-title"><i class="fas fa-link" style="color:var(--blue)"></i>Extracted URLs</div>
      <button class="btn btn-primary btn-sm" id="ai-pdf-create-all-btn" onclick="aiCreateAllFromJob()" style="display:none">
        <i class="fas fa-plus"></i>Create All Products
      </button>
    </div>
    <div id="ai-pdf-urls-list"></div>
  </div>`;
}

function renderJobStatus(job) {
  if (!job) return '';
  const pct = job.total > 0 ? Math.round((job.progress / job.total) * 100) : 0;
  const statusColor = job.status === 'done' ? 'var(--green)' : job.status === 'error' ? 'var(--red)' : 'var(--accent)';
  return `
  <div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <span class="tag ${job.status==='done'?'tg':job.status==='error'?'tr':'tb'}">${job.status}</span>
      <span style="font-size:12px;color:var(--text2)">${job.progress||0} / ${job.total||0} URLs</span>
    </div>
    <div style="background:var(--border);border-radius:99px;height:8px;margin-bottom:12px">
      <div style="background:${statusColor};height:8px;border-radius:99px;width:${pct}%;transition:.3s"></div>
    </div>
    ${job.status === 'processing' ? `<div style="font-size:12px;color:var(--text3)">Processing URL ${job.progress+1} of ${job.total}...</div>` : ''}
    ${job.status === 'done' ? `<div style="font-size:13px;color:var(--green);font-weight:600">✓ Complete! ${job.results?.filter(r=>r.status==='success').length||0} products ready</div>` : ''}
    ${job.error ? `<div style="font-size:12px;color:var(--red);margin-top:6px">${job.error}</div>` : ''}
  </div>`;
}

// ── QUEUE TAB ─────────────────────────────────────────────────────────────────
function renderAIQueueTab() {
  const results = window._aiResults || [];
  return `
  <div class="ph" style="margin-bottom:16px">
    <div>
      <div style="font-size:16px;font-weight:700">Review Queue</div>
      <div style="font-size:13px;color:var(--text2)">${results.length} products ready to review · Edit details before publishing</div>
    </div>
    <div class="ph-actions">
      ${results.length > 0 ? `
      <button class="btn btn-success" onclick="aiPublishAll()"><i class="fas fa-check-double"></i>Publish All</button>
      <button class="btn btn-primary" onclick="aiCreateAllQueued()"><i class="fas fa-save"></i>Save All as Draft</button>
      <button class="btn btn-danger btn-sm" onclick="window._aiResults=[];navigate('ai')"><i class="fas fa-trash"></i>Clear</button>` : ''}
    </div>
  </div>
  ${results.length === 0 ? `
  <div class="es">
    <i class="fas fa-robot" style="font-size:48px;color:var(--text3)"></i>
    <p>No products in queue. Analyze URLs or upload a PDF to generate listings.</p>
    <button class="btn btn-primary" onclick="window._aiTab='url';navigate('ai')"><i class="fas fa-link"></i>Analyze URL</button>
  </div>` : `
  <div style="display:flex;flex-direction:column;gap:12px">
    ${results.map((r, i) => renderQueueItem(r, i)).join('')}
  </div>`}`;
}

function renderQueueItem(r, i) {
  const d = r.data || r;
  const statusColor = r.created ? 'var(--green)' : 'var(--text3)';
  return `
  <div class="card" id="queue-item-${i}" style="border-left:3px solid ${r.created?'var(--green)':'var(--accent)'}">
    <div class="card-hd">
      <div style="display:flex;align-items:center;gap:12px;flex:1;min-width:0">
        ${d.thumbnail_url ? `<img src="${d.thumbnail_url}" style="width:56px;height:56px;border-radius:8px;object-fit:cover;flex-shrink:0" onerror="this.src='https://via.placeholder.com/56x56/6366f1/fff?text=AI'">` :
          `<div style="width:56px;height:56px;border-radius:8px;background:linear-gradient(135deg,var(--accent),var(--accent3));display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:20px">✦</div>`}
        <div style="flex:1;min-width:0">
          <div style="font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${d.name || 'Untitled'}</div>
          <div style="font-size:11px;color:var(--text3);margin-top:2px">${d.category || ''} · ₹${d.price || 0} · ${d.file_format || 'ZIP'}</div>
          ${d.source_url ? `<div style="font-size:10px;color:var(--text3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${d.source_url}</div>` : ''}
        </div>
      </div>
      <div style="display:flex;gap:6px;flex-shrink:0">
        ${r.created ? `<span class="tag tg" style="font-size:11px">Created</span>` : `
        <button class="btn btn-success btn-sm" onclick="aiCreateQueueItem(${i},'published')"><i class="fas fa-globe"></i>Publish</button>
        <button class="btn btn-primary btn-sm" onclick="aiCreateQueueItem(${i},'draft')"><i class="fas fa-save"></i>Draft</button>`}
        <button class="btn btn-secondary btn-sm btn-icon" onclick="aiToggleQueueEdit(${i})"><i class="fas fa-edit"></i></button>
        <button class="btn btn-danger btn-sm btn-icon" onclick="window._aiResults.splice(${i},1);navigate('ai')"><i class="fas fa-times"></i></button>
      </div>
    </div>

    <!-- Inline editor -->
    <div id="queue-edit-${i}" style="display:none;margin-top:12px;border-top:1px solid var(--border);padding-top:12px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div class="fg cs2"><label class="fl">Product Name</label><input class="fc" id="qe-name-${i}" value="${(d.name||'').replace(/"/g,'&quot;')}"></div>
        <div class="fg"><label class="fl">Price (₹)</label><input class="fc" id="qe-price-${i}" type="number" value="${d.price||499}"></div>
        <div class="fg"><label class="fl">Original Price (₹)</label><input class="fc" id="qe-oprice-${i}" type="number" value="${d.original_price||0}"></div>
        <div class="fg"><label class="fl">Category</label>
          <select class="fc" id="qe-cat-${i}">
            ${['Graphics','Fonts','Templates','UI Kits','Plugins','3D Assets','Courses','Tools'].map(c=>`<option ${d.category===c?'selected':''}>${c}</option>`).join('')}
          </select>
        </div>
        <div class="fg"><label class="fl">File Format</label><input class="fc" id="qe-fmt-${i}" value="${d.file_format||'ZIP'}"></div>
        <div class="fg cs2"><label class="fl">Short Description</label><input class="fc" id="qe-sdesc-${i}" value="${(d.short_description||'').replace(/"/g,'&quot;')}"></div>
        <div class="fg cs2"><label class="fl">Tags (comma separated)</label><input class="fc" id="qe-tags-${i}" value="${Array.isArray(d.tags)?d.tags.join(', '):''}"></div>
        <div class="fg cs2"><label class="fl">Thumbnail URL</label><input class="fc" id="qe-thumb-${i}" value="${d.thumbnail_url||''}"></div>
        <div class="fg cs2"><label class="fl">SEO Title</label><input class="fc" id="qe-seo-title-${i}" value="${(d.seo_title||'').replace(/"/g,'&quot;')}"></div>
        <div class="fg cs2"><label class="fl">SEO Description</label><input class="fc" id="qe-seo-desc-${i}" value="${(d.seo_description||'').replace(/"/g,'&quot;')}"></div>
      </div>
      <button class="btn btn-primary btn-sm" style="margin-top:8px" onclick="aiSaveQueueEdit(${i})"><i class="fas fa-save"></i>Save Changes</button>
    </div>
  </div>`;
}

// ── CONFIG TAB ────────────────────────────────────────────────────────────────
function renderAIConfigTab() {
  return `
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
    <div class="card">
      <div class="card-hd"><div class="card-title"><i class="fas fa-key" style="color:var(--accent)"></i>AI Provider Keys</div></div>
      <div style="background:rgba(99,102,241,.08);border:1px solid var(--accent);border-radius:10px;padding:12px;margin-bottom:14px;font-size:12px;color:var(--text2)">
        <strong>Without API keys:</strong> AI uses smart rule-based extraction (free, works offline).<br>
        <strong>With OpenAI/Gemini:</strong> Full AI-powered descriptions, SEO, and pricing suggestions.
      </div>
      <div class="fg">
        <label class="fl">OpenAI API Key</label>
        <div style="display:flex;gap:6px">
          <input class="fc" id="ai-openai-key" type="password" placeholder="sk-..." style="flex:1">
          <button class="btn btn-secondary btn-sm" onclick="document.getElementById('ai-openai-key').type=document.getElementById('ai-openai-key').type==='password'?'text':'password'"><i class="fas fa-eye"></i></button>
        </div>
        <div style="font-size:11px;color:var(--text3);margin-top:3px">Get key at <a href="https://platform.openai.com/api-keys" target="_blank" style="color:var(--accent)">platform.openai.com</a> · Uses gpt-4o-mini (~$0.001/product)</div>
      </div>
      <div class="fg">
        <label class="fl">Google Gemini API Key</label>
        <div style="display:flex;gap:6px">
          <input class="fc" id="ai-gemini-key" type="password" placeholder="AIza..." style="flex:1">
          <button class="btn btn-secondary btn-sm" onclick="document.getElementById('ai-gemini-key').type=document.getElementById('ai-gemini-key').type==='password'?'text':'password'"><i class="fas fa-eye"></i></button>
        </div>
        <div style="font-size:11px;color:var(--text3);margin-top:3px">Get key at <a href="https://aistudio.google.com/app/apikey" target="_blank" style="color:var(--accent)">aistudio.google.com</a> · Free tier available</div>
      </div>
      <div class="fg">
        <label class="fl">AI Provider Priority</label>
        <select class="fc" id="ai-provider-select">
          <option value="auto">Auto (OpenAI → Gemini → Rule-based)</option>
          <option value="openai">OpenAI only</option>
          <option value="gemini">Gemini only</option>
          <option value="rules">Rule-based only (no API)</option>
        </select>
      </div>
      <button class="btn btn-primary" onclick="aiSaveConfig()"><i class="fas fa-save"></i>Save API Keys</button>
      <div id="ai-config-status" style="margin-top:8px"></div>
    </div>

    <div class="card">
      <div class="card-hd"><div class="card-title"><i class="fas fa-sliders-h" style="color:var(--blue)"></i>Default Settings</div></div>
      <div class="fg">
        <label class="fl">Default Product Status</label>
        <select class="fc" id="ai-default-status">
          <option value="draft">Draft (review before publishing)</option>
          <option value="published">Published immediately</option>
        </select>
      </div>
      <div class="fg">
        <label class="fl">Default License Type</label>
        <select class="fc" id="ai-default-license">
          <option value="Commercial">Commercial</option>
          <option value="Personal">Personal</option>
          <option value="Extended">Extended</option>
        </select>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
        <div>
          <div style="font-size:13px;font-weight:600">Auto-fetch OG thumbnail</div>
          <div style="font-size:11px;color:var(--text3)">Use product page's Open Graph image as thumbnail</div>
        </div>
        <label class="tgl"><input type="checkbox" id="ai-auto-thumb" checked><span class="tgs"></span></label>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
        <div>
          <div style="font-size:13px;font-weight:600">Add source URL to product</div>
          <div style="font-size:11px;color:var(--text3)">Store original URL in product metadata</div>
        </div>
        <label class="tgl"><input type="checkbox" id="ai-save-source" checked><span class="tgs"></span></label>
      </div>
      <button class="btn btn-primary" style="margin-top:12px" onclick="aiSaveConfig()"><i class="fas fa-save"></i>Save Settings</button>
    </div>

    <div class="card" style="grid-column:span 2">
      <div class="card-hd"><div class="card-title"><i class="fas fa-info-circle" style="color:var(--green)"></i>How AI Automation Works</div></div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">
        ${[
          ['1','fa-link','Paste URL','Provide any digital product page URL from Envato, Gumroad, Creative Market, etc.'],
          ['2','fa-robot','AI Analyzes','AI scrapes the page, extracts product info, and generates name, description, price, tags, SEO'],
          ['3','fa-eye','Review & Edit','Preview the generated listing, edit any field, adjust price and category'],
          ['4','fa-rocket','Publish','Create as draft or publish directly to your store with one click']
        ].map(([n,icon,title,desc]) => `
        <div style="text-align:center;padding:16px;background:var(--bg3);border-radius:12px">
          <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent3));display:flex;align-items:center;justify-content:center;margin:0 auto 10px;font-size:16px;font-weight:800;color:#fff">${n}</div>
          <i class="fas ${icon}" style="color:var(--accent);font-size:20px;display:block;margin-bottom:8px"></i>
          <div style="font-size:13px;font-weight:700;margin-bottom:4px">${title}</div>
          <div style="font-size:11px;color:var(--text3)">${desc}</div>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
}

// ── ACTIONS: URL ANALYSIS ─────────────────────────────────────────────────────
window.aiAnalyzeUrl = async function() {
  const url = document.getElementById('ai-url-input')?.value?.trim();
  if (!url || !url.startsWith('http')) {
    window.toast('Please enter a valid URL starting with http', 'e'); return;
  }

  const btn = document.getElementById('ai-analyze-btn');
  const progress = document.getElementById('ai-url-progress');
  const resultDiv = document.getElementById('ai-url-result');
  const placeholder = document.getElementById('ai-url-placeholder');

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>Analyzing...';
  if (progress) progress.style.display = 'block';
  if (resultDiv) resultDiv.style.display = 'none';
  if (placeholder) placeholder.style.display = 'flex';

  const steps = ['Fetching page...', 'Extracting content...', 'Running AI analysis...', 'Generating listing...'];
  let stepIdx = 0;
  const stepTimer = setInterval(() => {
    const el = document.getElementById('ai-progress-text');
    if (el && stepIdx < steps.length) el.textContent = steps[stepIdx++];
  }, 2000);

  try {
    const data = await AdminAPI.post('/v1/ai/analyze-url', { url });
    clearInterval(stepTimer);

    if (!data.success) throw new Error(data.error || 'Analysis failed');

    // Apply price override if set
    const priceOverride = parseFloat(document.getElementById('ai-price-override')?.value);
    if (priceOverride > 0) data.data.price = priceOverride;

    // Store result
    window._aiCurrentResult = data.data;

    // Show result
    if (resultDiv) {
      resultDiv.style.display = 'block';
      document.getElementById('ai-result-content').innerHTML = renderProductPreview(data.data);
    }
    if (placeholder) placeholder.style.display = 'none';
    if (progress) progress.style.display = 'none';

    window.toast('Product listing generated!', 's');
  } catch (e) {
    clearInterval(stepTimer);
    if (progress) progress.style.display = 'none';
    window.toast('Analysis failed: ' + e.message, 'e');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-robot"></i>Analyze & Generate Listing';
  }
};

function renderProductPreview(d) {
  return `
  <div style="display:flex;gap:12px;margin-bottom:14px">
    ${d.thumbnail_url ? `<img src="${d.thumbnail_url}" style="width:80px;height:80px;border-radius:10px;object-fit:cover;flex-shrink:0" onerror="this.src='https://via.placeholder.com/80x80/6366f1/fff?text=AI'">` :
      `<div style="width:80px;height:80px;border-radius:10px;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:28px">✦</div>`}
    <div style="flex:1;min-width:0">
      <div style="font-size:15px;font-weight:800;margin-bottom:4px">${d.name || 'Untitled'}</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <span class="tag tb">${d.category || 'Templates'}</span>
        <span class="tag tg">₹${d.price || 0}</span>
        ${d.original_price ? `<span class="tag" style="text-decoration:line-through;color:var(--text3)">₹${d.original_price}</span>` : ''}
        <span class="tag">${d.file_format || 'ZIP'}</span>
        <span class="tag">${d.license_type || 'Commercial'}</span>
        ${d.ai_generated ? '<span class="tag" style="background:rgba(99,102,241,.15);color:var(--accent)">AI Generated</span>' : ''}
      </div>
    </div>
  </div>
  <div style="font-size:12px;color:var(--text2);margin-bottom:10px;line-height:1.6">${d.short_description || ''}</div>
  ${d.tags?.length ? `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px">${d.tags.map(t=>`<span style="background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:2px 8px;font-size:11px">#${t}</span>`).join('')}</div>` : ''}
  ${d.features?.length ? `
  <div style="margin-bottom:10px">
    <div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:4px">FEATURES</div>
    ${d.features.slice(0,4).map(f=>`<div style="font-size:12px;color:var(--text2);padding:2px 0">✓ ${f}</div>`).join('')}
  </div>` : ''}
  <div style="background:var(--bg3);border-radius:8px;padding:10px;font-size:11px">
    <div style="font-weight:700;margin-bottom:4px;color:var(--text2)">SEO</div>
    <div style="color:var(--text3)"><strong>Title:</strong> ${d.seo_title || ''}</div>
    <div style="color:var(--text3);margin-top:2px"><strong>Desc:</strong> ${(d.seo_description || '').substring(0, 100)}${d.seo_description?.length > 100 ? '...' : ''}</div>
  </div>
  <div style="margin-top:10px">
    <button class="btn btn-secondary btn-sm" onclick="aiAddToQueue()" style="width:100%"><i class="fas fa-plus"></i>Add to Review Queue</button>
  </div>`;
}

window.aiCreateProduct = async function() {
  const d = window._aiCurrentResult;
  if (!d) { window.toast('No product data. Analyze a URL first.', 'e'); return; }
  const status = document.getElementById('ai-status-select')?.value || 'draft';
  d.status = status;
  try {
    const res = await AdminAPI.post('/v1/ai/create-product', d);
    if (res.success) {
      window.toast(`✓ "${res.data.name}" created as ${status}!`, 's');
      window._aiCurrentResult = null;
      document.getElementById('ai-url-input').value = '';
      document.getElementById('ai-url-result').style.display = 'none';
      document.getElementById('ai-url-placeholder').style.display = 'flex';
    } else {
      window.toast('Create failed: ' + res.error, 'e');
    }
  } catch (e) {
    window.toast('Error: ' + e.message, 'e');
  }
};

window.aiEditResult = function() {
  const d = window._aiCurrentResult;
  if (!d) return;
  // Add to queue and switch to queue tab for editing
  aiAddToQueue();
  window._aiTab = 'queue';
  navigate('ai');
};

window.aiAddToQueue = function() {
  const d = window._aiCurrentResult;
  if (!d) return;
  if (!window._aiResults) window._aiResults = [];
  window._aiResults.unshift({ data: d, created: false });
  window.toast('Added to review queue', 's');
};

// ── ACTIONS: BATCH URL ────────────────────────────────────────────────────────
window.aiBatchAnalyze = async function() {
  const raw = document.getElementById('ai-batch-urls')?.value?.trim();
  if (!raw) { window.toast('Enter at least one URL', 'e'); return; }

  const urls = raw.split('\n').map(u => u.trim()).filter(u => u.startsWith('http'));
  if (!urls.length) { window.toast('No valid URLs found', 'e'); return; }

  const progressDiv = document.getElementById('ai-batch-progress');
  const resultsDiv = document.getElementById('ai-batch-results');
  if (progressDiv) progressDiv.style.display = 'block';
  if (resultsDiv) resultsDiv.innerHTML = '';

  const updateProgress = (done, total, status) => {
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    const bar = document.getElementById('ai-batch-bar');
    const cnt = document.getElementById('ai-batch-count');
    const stat = document.getElementById('ai-batch-status');
    if (bar) bar.style.width = pct + '%';
    if (cnt) cnt.textContent = `${done}/${total}`;
    if (stat) stat.textContent = status;
  };

  const batchResults = [];
  for (let i = 0; i < urls.length; i++) {
    updateProgress(i, urls.length, `Analyzing ${i + 1}/${urls.length}...`);
    try {
      const res = await AdminAPI.post('/v1/ai/analyze-url', { url: urls[i] });
      if (res.success) {
        batchResults.push({ url: urls[i], status: 'success', data: res.data });
        if (!window._aiResults) window._aiResults = [];
        window._aiResults.push({ data: res.data, created: false });
      } else {
        batchResults.push({ url: urls[i], status: 'error', error: res.error });
      }
    } catch (e) {
      batchResults.push({ url: urls[i], status: 'error', error: e.message });
    }
    // Small delay
    await new Promise(r => setTimeout(r, 300));
  }

  updateProgress(urls.length, urls.length, 'Complete!');

  // Show summary
  const ok = batchResults.filter(r => r.status === 'success').length;
  if (resultsDiv) {
    resultsDiv.innerHTML = `
    <div style="background:var(--bg3);border-radius:10px;padding:12px">
      <div style="font-size:13px;font-weight:700;margin-bottom:8px">Results: ${ok}/${urls.length} analyzed</div>
      ${batchResults.map(r => `
      <div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--border);font-size:12px">
        <span class="tag ${r.status==='success'?'tg':'tr'}" style="font-size:10px">${r.status==='success'?'OK':'ERR'}</span>
        <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text2)">${r.url}</span>
        ${r.status==='success' ? `<span style="color:var(--text3)">${r.data?.name?.substring(0,30)||''}</span>` : `<span style="color:var(--red)">${r.error?.substring(0,40)||''}</span>`}
      </div>`).join('')}
    </div>
    ${ok > 0 ? `<button class="btn btn-primary" style="margin-top:10px;width:100%" onclick="window._aiTab='queue';navigate('ai')"><i class="fas fa-list"></i>Review ${ok} Products in Queue</button>` : ''}`;
  }

  window.toast(`Batch complete: ${ok}/${urls.length} products generated`, ok > 0 ? 's' : 'w');
};

// ── ACTIONS: PDF UPLOAD ───────────────────────────────────────────────────────
window.aiHandlePdfDrop = function(e) {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) aiUploadPdf(file);
};

window.aiUploadPdf = async function(file) {
  if (!file) return;
  const zone = document.getElementById('pdf-drop-zone');
  const statusDiv = document.getElementById('ai-pdf-status');

  if (zone) {
    zone.innerHTML = `<div class="spinner" style="width:32px;height:32px;border:3px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 10px"></div>
    <div style="font-size:13px;font-weight:600">Uploading ${file.name}...</div>`;
  }

  try {
    const formData = new FormData();
    formData.append('pdf', file);

    const token = localStorage.getItem('dk_admin_token') || '';
    const res = await fetch('https://digikraft2-production.up.railway.app/api/v1/ai/analyze-pdf', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    const data = await res.json();

    if (!data.success) throw new Error(data.error || 'Upload failed');

    window._aiJobId = data.jobId;
    window._aiJobData = { status: 'processing', progress: 0, total: 0, results: [] };

    if (statusDiv) statusDiv.innerHTML = renderJobStatus(window._aiJobData);
    window.toast('PDF uploaded! Processing URLs...', 's');

    // Poll for job status
    aiPollJob(data.jobId);

    // Reset drop zone
    if (zone) {
      zone.innerHTML = `<i class="fas fa-check-circle" style="font-size:36px;color:var(--green);display:block;margin-bottom:10px"></i>
      <div style="font-size:14px;font-weight:700">${file.name} uploaded</div>
      <div style="font-size:12px;color:var(--text3);margin-top:4px">Processing in background...</div>
      <input type="file" id="ai-pdf-input" accept=".pdf,.txt" style="display:none" onchange="aiUploadPdf(this.files[0])">`;
    }
  } catch (e) {
    window.toast('Upload failed: ' + e.message, 'e');
    if (zone) {
      zone.innerHTML = `<i class="fas fa-exclamation-circle" style="font-size:36px;color:var(--red);display:block;margin-bottom:10px"></i>
      <div style="font-size:13px;color:var(--red)">${e.message}</div>
      <div style="font-size:12px;color:var(--text3);margin-top:6px;cursor:pointer" onclick="navigate('ai')">Click to retry</div>
      <input type="file" id="ai-pdf-input" accept=".pdf,.txt" style="display:none" onchange="aiUploadPdf(this.files[0])">`;
    }
  }
};

window.aiPollJob = function(jobId) {
  clearInterval(window._aiJobTimer);
  window._aiJobTimer = setInterval(async () => {
    try {
      const res = await AdminAPI.get(`/v1/ai/job/${jobId}`);
      if (!res.success) return;

      window._aiJobData = res.data;
      const statusDiv = document.getElementById('ai-pdf-status');
      if (statusDiv) statusDiv.innerHTML = renderJobStatus(res.data);

      // Update URLs list
      if (res.data.urls?.length) {
        const urlsCard = document.getElementById('ai-pdf-urls-card');
        const urlsList = document.getElementById('ai-pdf-urls-list');
        if (urlsCard) urlsCard.style.display = 'block';
        if (urlsList) {
          urlsList.innerHTML = res.data.results?.length ?
            res.data.results.map((r, i) => `
            <div style="display:flex;align-items:center;gap:8px;padding:8px;background:var(--bg3);border-radius:8px;margin-bottom:6px">
              <span class="tag ${r.status==='success'?'tg':'tr'}" style="font-size:10px;flex-shrink:0">${r.status==='success'?'OK':'ERR'}</span>
              <span style="flex:1;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text2)">${r.url}</span>
              ${r.status==='success' ? `<span style="font-size:11px;color:var(--text3);flex-shrink:0">${r.data?.name?.substring(0,25)||''}</span>` : ''}
            </div>`).join('') :
            `<div style="font-size:12px;color:var(--text3);padding:8px">Extracting URLs from document...</div>`;
        }
      }

      if (res.data.status === 'done') {
        clearInterval(window._aiJobTimer);
        const ok = res.data.results?.filter(r => r.status === 'success') || [];
        if (ok.length > 0) {
          // Add to queue
          if (!window._aiResults) window._aiResults = [];
          ok.forEach(r => window._aiResults.push({ data: r.data, created: false }));
          const createBtn = document.getElementById('ai-pdf-create-all-btn');
          if (createBtn) createBtn.style.display = 'inline-flex';
          window.toast(`PDF processed! ${ok.length} products ready in queue`, 's');
        } else {
          window.toast('PDF processed but no valid product URLs found', 'w');
        }
      }
    } catch (e) {
      console.error('[AI Poll]', e.message);
    }
  }, 2000);
};

window.aiCreateAllFromJob = function() {
  window._aiTab = 'queue';
  navigate('ai');
};

// ── ACTIONS: QUEUE ────────────────────────────────────────────────────────────
window.aiToggleQueueEdit = function(i) {
  const el = document.getElementById(`queue-edit-${i}`);
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
};

window.aiSaveQueueEdit = function(i) {
  if (!window._aiResults?.[i]) return;
  const d = window._aiResults[i].data;
  d.name = document.getElementById(`qe-name-${i}`)?.value || d.name;
  d.price = parseFloat(document.getElementById(`qe-price-${i}`)?.value) || d.price;
  d.original_price = parseFloat(document.getElementById(`qe-oprice-${i}`)?.value) || d.original_price;
  d.category = document.getElementById(`qe-cat-${i}`)?.value || d.category;
  d.file_format = document.getElementById(`qe-fmt-${i}`)?.value || d.file_format;
  d.short_description = document.getElementById(`qe-sdesc-${i}`)?.value || d.short_description;
  d.thumbnail_url = document.getElementById(`qe-thumb-${i}`)?.value || d.thumbnail_url;
  d.seo_title = document.getElementById(`qe-seo-title-${i}`)?.value || d.seo_title;
  d.seo_description = document.getElementById(`qe-seo-desc-${i}`)?.value || d.seo_description;
  const tagsRaw = document.getElementById(`qe-tags-${i}`)?.value || '';
  d.tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);
  window._aiResults[i].data = d;
  window.toast('Changes saved', 's');
  navigate('ai');
};

window.aiCreateQueueItem = async function(i, status) {
  const item = window._aiResults?.[i];
  if (!item) return;
  item.data.status = status;
  try {
    const res = await AdminAPI.post('/v1/ai/create-product', item.data);
    if (res.success) {
      window._aiResults[i].created = true;
      window._aiResults[i].productId = res.data.id;
      window.toast(`"${res.data.name}" ${status === 'published' ? 'published' : 'saved as draft'}!`, 's');
      navigate('ai');
    } else {
      window.toast('Failed: ' + res.error, 'e');
    }
  } catch (e) {
    window.toast('Error: ' + e.message, 'e');
  }
};

window.aiCreateAllQueued = async function() {
  const pending = (window._aiResults || []).filter(r => !r.created);
  if (!pending.length) { window.toast('No pending products', 'w'); return; }
  window.toast(`Creating ${pending.length} products...`, 'i');
  const products = pending.map(r => ({ ...r.data, status: 'draft' }));
  try {
    const res = await AdminAPI.post('/v1/ai/batch-create', { products });
    if (res.success) {
      // Mark all as created
      window._aiResults.forEach(r => { if (!r.created) r.created = true; });
      window.toast(res.message, 's');
      navigate('ai');
    } else {
      window.toast('Batch create failed: ' + res.error, 'e');
    }
  } catch (e) {
    window.toast('Error: ' + e.message, 'e');
  }
};

window.aiPublishAll = async function() {
  const pending = (window._aiResults || []).filter(r => !r.created);
  if (!pending.length) { window.toast('No pending products', 'w'); return; }
  if (!confirm(`Publish ${pending.length} products immediately?`)) return;
  const products = pending.map(r => ({ ...r.data, status: 'published' }));
  try {
    const res = await AdminAPI.post('/v1/ai/batch-create', { products });
    if (res.success) {
      window._aiResults.forEach(r => { if (!r.created) r.created = true; });
      window.toast(res.message, 's');
      navigate('ai');
    } else {
      window.toast('Failed: ' + res.error, 'e');
    }
  } catch (e) {
    window.toast('Error: ' + e.message, 'e');
  }
};

// ── ACTIONS: CONFIG ───────────────────────────────────────────────────────────
window.aiSaveConfig = async function() {
  const openaiKey = document.getElementById('ai-openai-key')?.value?.trim();
  const geminiKey = document.getElementById('ai-gemini-key')?.value?.trim();
  const provider = document.getElementById('ai-provider-select')?.value;
  const defaultStatus = document.getElementById('ai-default-status')?.value;
  const defaultLicense = document.getElementById('ai-default-license')?.value;

  try {
    const res = await AdminAPI.put('/v1/ai/config', {
      openai_key: openaiKey || undefined,
      gemini_key: geminiKey || undefined,
      ai_provider: provider,
      default_status: defaultStatus,
      default_license: defaultLicense
    });
    if (res.success) {
      window.toast('AI config saved!', 's');
      const statusEl = document.getElementById('ai-config-status');
      if (statusEl) {
        statusEl.innerHTML = `<div style="background:rgba(16,185,129,.1);border:1px solid var(--green);border-radius:8px;padding:8px 12px;font-size:12px;color:var(--green)">
          ✓ Config saved · ${openaiKey ? 'OpenAI key set' : ''} ${geminiKey ? '· Gemini key set' : ''} ${!openaiKey && !geminiKey ? 'Using rule-based extraction' : ''}
        </div>`;
      }
    } else {
      window.toast('Save failed: ' + res.error, 'e');
    }
  } catch (e) {
    window.toast('Error: ' + e.message, 'e');
  }
};

// Load config on tab open
window.aiLoadConfig = async function() {
  try {
    const res = await AdminAPI.get('/v1/ai/config');
    if (res.success && res.data) {
      const d = res.data;
      const providerEl = document.getElementById('ai-provider-select');
      const statusEl = document.getElementById('ai-default-status');
      const licenseEl = document.getElementById('ai-default-license');
      if (providerEl) providerEl.value = d.ai_provider || 'auto';
      if (statusEl) statusEl.value = d.default_status || 'draft';
      if (licenseEl) licenseEl.value = d.default_license || 'Commercial';
      if (d.openai_key_preview) {
        const el = document.getElementById('ai-openai-key');
        if (el) el.placeholder = `Current: ${d.openai_key_preview}`;
      }
      if (d.gemini_key_preview) {
        const el = document.getElementById('ai-gemini-key');
        if (el) el.placeholder = `Current: ${d.gemini_key_preview}`;
      }
    }
  } catch {}
};

// Auto-load config when config tab is shown
const _origRenderAI = window.renderAI;
window.renderAI = function() {
  const html = _origRenderAI();
  if (window._aiTab === 'config') {
    setTimeout(() => window.aiLoadConfig(), 100);
  }
  return html;
};

// CSS for spinner animation (injected once)
if (!document.getElementById('ai-spinner-style')) {
  const style = document.createElement('style');
  style.id = 'ai-spinner-style';
  style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(style);
}
