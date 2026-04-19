
// ===== AI HUB MODULE =====
// Model manager, purpose assignments, agents, email/SMTP setup

window._aiHubTab = window._aiHubTab || 'models';
window._aiHubModels = [];
window._aiHubPurposes = {};
window._aiHubAgents = [];

window.renderAIHub = function() {
  const tab = window._aiHubTab;
  const tabs = [
    ['models','🤖 AI Models'],
    ['purposes','🎯 Purpose Assignment'],
    ['agents','⚡ AI Agents'],
    ['email','📧 Email & SMTP']
  ];
  return `
  <div class="ph">
    <div>
      <div class="ph-title" style="display:flex;align-items:center;gap:10px">
        <span style="background:linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:22px">⚙</span>
        AI Hub
      </div>
      <div class="ph-sub">Manage AI models, assign them to tasks, configure agents and email</div>
    </div>
  </div>
  <div class="tabs" style="margin-bottom:16px">
    ${tabs.map(([id,lb]) => `<button class="tab ${tab===id?'on':''}" onclick="window._aiHubTab='${id}';navigate('ai-hub')">${lb}</button>`).join('')}
  </div>
  <div id="ai-hub-content">
    ${tab==='models' ? '<div class="es"><i class="fas fa-spinner fa-spin"></i><p>Loading models...</p></div>' : ''}
    ${tab==='purposes' ? '<div class="es"><i class="fas fa-spinner fa-spin"></i><p>Loading...</p></div>' : ''}
    ${tab==='agents' ? '<div class="es"><i class="fas fa-spinner fa-spin"></i><p>Loading agents...</p></div>' : ''}
    ${tab==='email' ? '<div class="es"><i class="fas fa-spinner fa-spin"></i><p>Loading email config...</p></div>' : ''}
  </div>`;
};

// Auto-load data after render
const _origRenderAIHub = window.renderAIHub;
window.renderAIHub = function() {
  const html = _origRenderAIHub();
  setTimeout(() => {
    if (window._aiHubTab === 'models') aiHubLoadModels();
    else if (window._aiHubTab === 'purposes') aiHubLoadPurposes();
    else if (window._aiHubTab === 'agents') aiHubLoadAgents();
    else if (window._aiHubTab === 'email') aiHubLoadEmail();
  }, 80);
  return html;
};

// ── KNOWN PROVIDERS ───────────────────────────────────────────────────────────
const AI_PROVIDERS = [
  { id: 'openrouter', name: 'OpenRouter', url: 'https://openrouter.ai/api/v1', icon: '🔀', color: '#6366f1', desc: 'Access 100+ models with one key', keyLabel: 'OpenRouter API Key', keyPrefix: 'sk-or-v1-', signup: 'https://openrouter.ai' },
  { id: 'openai', name: 'OpenAI', url: 'https://api.openai.com/v1', icon: '🟢', color: '#10a37f', desc: 'GPT-4, GPT-4o, GPT-3.5', keyLabel: 'OpenAI API Key', keyPrefix: 'sk-', signup: 'https://platform.openai.com' },
  { id: 'anthropic', name: 'Anthropic', url: 'https://api.anthropic.com/v1', icon: '🟣', color: '#d97706', desc: 'Claude 3.5 Sonnet, Haiku, Opus', keyLabel: 'Anthropic API Key', keyPrefix: 'sk-ant-', signup: 'https://console.anthropic.com' },
  { id: 'google', name: 'Google Gemini', url: 'https://generativelanguage.googleapis.com/v1beta', icon: '🔵', color: '#4285f4', desc: 'Gemini 1.5 Pro, Flash', keyLabel: 'Google AI API Key', keyPrefix: 'AIza', signup: 'https://aistudio.google.com' },
  { id: 'moonshot', name: 'Moonshot (Kimi)', url: 'https://api.moonshot.cn/v1', icon: '🌙', color: '#8b5cf6', desc: 'Kimi AI — great for Asian content', keyLabel: 'Moonshot API Key', keyPrefix: 'sk-', signup: 'https://platform.moonshot.cn' },
  { id: 'mistral', name: 'Mistral AI', url: 'https://api.mistral.ai/v1', icon: '💨', color: '#ff7000', desc: 'Mistral Large, Mixtral', keyLabel: 'Mistral API Key', keyPrefix: '', signup: 'https://console.mistral.ai' },
  { id: 'groq', name: 'Groq', url: 'https://api.groq.com/openai/v1', icon: '⚡', color: '#f59e0b', desc: 'Ultra-fast inference, free tier', keyLabel: 'Groq API Key', keyPrefix: 'gsk_', signup: 'https://console.groq.com' },
  { id: 'together', name: 'Together AI', url: 'https://api.together.xyz/v1', icon: '🤝', color: '#06b6d4', desc: 'Open source models, cheap', keyLabel: 'Together API Key', keyPrefix: '', signup: 'https://api.together.xyz' },
  { id: 'custom', name: 'Custom / Self-hosted', url: '', icon: '🔧', color: '#64748b', desc: 'Any OpenAI-compatible API', keyLabel: 'API Key', keyPrefix: '', signup: '' },
];

const POPULAR_MODELS = {
  openrouter: ['anthropic/claude-3-5-haiku','anthropic/claude-3-5-sonnet','openai/gpt-4o-mini','openai/gpt-4o','google/gemini-flash-1.5','google/gemini-pro-1.5','meta-llama/llama-3.1-8b-instruct:free','meta-llama/llama-3.1-70b-instruct','mistralai/mixtral-8x7b-instruct','moonshot/moonshot-v1-8k'],
  openai: ['gpt-4o','gpt-4o-mini','gpt-4-turbo','gpt-3.5-turbo'],
  anthropic: ['claude-3-5-sonnet-20241022','claude-3-5-haiku-20241022','claude-3-opus-20240229'],
  google: ['gemini-1.5-pro','gemini-1.5-flash','gemini-1.0-pro'],
  moonshot: ['moonshot-v1-8k','moonshot-v1-32k','moonshot-v1-128k'],
  mistral: ['mistral-large-latest','mistral-medium-latest','mistral-small-latest','open-mixtral-8x7b'],
  groq: ['llama-3.1-70b-versatile','llama-3.1-8b-instant','mixtral-8x7b-32768','gemma2-9b-it'],
  together: ['meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo','mistralai/Mixtral-8x7B-Instruct-v0.1'],
  custom: [],
};

// ── MODELS TAB ────────────────────────────────────────────────────────────────
async function aiHubLoadModels() {
  try {
    const res = await AdminAPI.get('/v1/ai-hub/models');
    window._aiHubModels = res.data || [];
    document.getElementById('ai-hub-content').innerHTML = renderModelsTab(window._aiHubModels);
  } catch (e) {
    document.getElementById('ai-hub-content').innerHTML = `<div class="es"><i class="fas fa-exclamation-triangle" style="color:var(--red)"></i><p>Failed to load: ${e.message}</p></div>`;
  }
}

function renderModelsTab(models) {
  return `
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
    <div style="font-size:14px;color:var(--text2)">${models.length} models configured · <span style="color:var(--green)">${models.filter(m=>m.enabled).length} active</span></div>
    <button class="btn btn-primary" onclick="aiHubOpenAddModel()"><i class="fas fa-plus"></i>Add Model</button>
  </div>

  <!-- QUICK ADD POPULAR PROVIDERS -->
  <div class="card" style="margin-bottom:16px">
    <div class="card-hd"><div class="card-title"><i class="fas fa-bolt" style="color:var(--yellow)"></i>Quick Add — Popular Providers</div></div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px">
      ${AI_PROVIDERS.map(p => `
      <button onclick="aiHubQuickAdd('${p.id}')"
        style="padding:10px 12px;border-radius:10px;border:1px solid var(--border);background:var(--bg3);cursor:pointer;text-align:left;transition:.15s"
        onmouseover="this.style.borderColor='${p.color}'" onmouseout="this.style.borderColor='var(--border)'">
        <div style="font-size:18px;margin-bottom:4px">${p.icon}</div>
        <div style="font-size:12px;font-weight:700">${p.name}</div>
        <div style="font-size:10px;color:var(--text3);margin-top:2px">${p.desc}</div>
      </button>`).join('')}
    </div>
  </div>

  <!-- MODEL LIST -->
  <div style="display:flex;flex-direction:column;gap:10px" id="models-list">
    ${models.length === 0 ? `<div class="es"><i class="fas fa-robot"></i><p>No models yet. Add one above.</p></div>` :
      models.map(m => renderModelCard(m)).join('')}
  </div>

  <!-- ADD MODEL MODAL -->
  <div id="add-model-panel" style="display:none;margin-top:16px">
    ${renderAddModelForm()}
  </div>`;
}

function renderModelCard(m) {
  const provider = AI_PROVIDERS.find(p => p.id === m.provider) || AI_PROVIDERS[AI_PROVIDERS.length-1];
  return `
  <div class="card" style="border-left:3px solid ${m.enabled ? provider.color : 'var(--border)'}">
    <div class="card-hd">
      <div style="display:flex;align-items:center;gap:12px;flex:1;min-width:0">
        <div style="width:40px;height:40px;border-radius:10px;background:${provider.color}22;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">${m.icon || provider.icon}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:14px;font-weight:700">${m.name}</div>
          <div style="font-size:11px;color:var(--text3)">${provider.name} · <code style="background:var(--bg3);padding:1px 6px;border-radius:4px;font-size:10px">${m.model_id}</code></div>
          ${m.description ? `<div style="font-size:11px;color:var(--text2);margin-top:2px">${m.description}</div>` : ''}
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
        <span class="tag ${m.api_key ? 'tg' : 'ty'}" style="font-size:10px">${m.api_key ? '🔑 Key set' : '⚠ No key'}</span>
        <label class="tgl"><input type="checkbox" ${m.enabled?'checked':''} onchange="aiHubToggleModel('${m.id}',this.checked)"><span class="tgs"></span></label>
        <button class="btn btn-sm btn-secondary btn-icon" onclick="aiHubTestModel('${m.id}',this)" title="Test connection"><i class="fas fa-plug"></i></button>
        <button class="btn btn-sm btn-secondary btn-icon" onclick="aiHubEditModel('${m.id}')" title="Edit"><i class="fas fa-edit"></i></button>
        <button class="btn btn-sm btn-danger btn-icon" onclick="aiHubDeleteModel('${m.id}','${m.name}')" title="Delete"><i class="fas fa-trash"></i></button>
      </div>
    </div>
    <div id="model-test-${m.id}" style="display:none;margin-top:8px;font-size:12px;padding:8px 12px;border-radius:8px;background:var(--bg3)"></div>
    <div id="model-edit-${m.id}" style="display:none;margin-top:12px;border-top:1px solid var(--border);padding-top:12px">
      ${renderModelEditForm(m)}
    </div>
  </div>`;
}

function renderAddModelForm() {
  return `
  <div class="card" style="border:2px solid var(--accent)">
    <div class="card-hd"><div class="card-title"><i class="fas fa-plus-circle" style="color:var(--accent)"></i>Add New AI Model</div>
      <button class="btn btn-secondary btn-sm" onclick="document.getElementById('add-model-panel').style.display='none'">Cancel</button>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div class="fg"><label class="fl">Display Name *</label><input class="fc" id="nm-name" placeholder="e.g. Claude 3.5 Haiku"></div>
      <div class="fg"><label class="fl">Provider</label>
        <select class="fc" id="nm-provider" onchange="aiHubProviderChange(this.value)">
          ${AI_PROVIDERS.map(p => `<option value="${p.id}">${p.icon} ${p.name}</option>`).join('')}
        </select>
      </div>
      <div class="fg cs2"><label class="fl">Model ID *</label>
        <div style="display:flex;gap:6px">
          <input class="fc" id="nm-model-id" placeholder="e.g. anthropic/claude-3-5-haiku" style="flex:1">
          <select class="fc" id="nm-model-preset" style="width:auto" onchange="if(this.value)document.getElementById('nm-model-id').value=this.value">
            <option value="">Popular models...</option>
          </select>
        </div>
      </div>
      <div class="fg cs2"><label class="fl" id="nm-key-label">API Key</label>
        <input class="fc" id="nm-api-key" type="password" placeholder="Leave empty to use shared OpenRouter key">
      </div>
      <div class="fg cs2"><label class="fl">Base URL <span style="font-size:10px;color:var(--text3)">(auto-filled by provider)</span></label>
        <input class="fc" id="nm-base-url" placeholder="https://openrouter.ai/api/v1">
      </div>
      <div class="fg"><label class="fl">Icon (emoji)</label><input class="fc" id="nm-icon" placeholder="🤖" maxlength="4" style="font-size:20px"></div>
      <div class="fg"><label class="fl">Description</label><input class="fc" id="nm-desc" placeholder="What is this model good for?"></div>
    </div>
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn btn-primary" onclick="aiHubSaveNewModel()"><i class="fas fa-save"></i>Add Model</button>
      <button class="btn btn-secondary" onclick="aiHubTestNewModel()"><i class="fas fa-plug"></i>Test First</button>
    </div>
    <div id="nm-test-result" style="display:none;margin-top:8px;font-size:12px;padding:8px 12px;border-radius:8px;background:var(--bg3)"></div>
  </div>`;
}

function renderModelEditForm(m) {
  const provider = AI_PROVIDERS.find(p => p.id === m.provider) || AI_PROVIDERS[AI_PROVIDERS.length-1];
  return `
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
    <div class="fg"><label class="fl">Display Name</label><input class="fc" id="me-name-${m.id}" value="${m.name}"></div>
    <div class="fg"><label class="fl">Provider</label>
      <select class="fc" id="me-provider-${m.id}">
        ${AI_PROVIDERS.map(p => `<option value="${p.id}" ${m.provider===p.id?'selected':''}>${p.icon} ${p.name}</option>`).join('')}
      </select>
    </div>
    <div class="fg cs2"><label class="fl">Model ID</label><input class="fc" id="me-model-${m.id}" value="${m.model_id}"></div>
    <div class="fg cs2"><label class="fl">${provider.keyLabel} <span style="font-size:10px;color:var(--text3)">(leave empty to use shared key)</span></label>
      <input class="fc" id="me-key-${m.id}" type="password" placeholder="${m.api_key ? '••••••••' : 'Not set — using shared key'}">
    </div>
    <div class="fg cs2"><label class="fl">Base URL</label><input class="fc" id="me-url-${m.id}" value="${m.base_url || ''}"></div>
    <div class="fg"><label class="fl">Icon</label><input class="fc" id="me-icon-${m.id}" value="${m.icon||'🤖'}" maxlength="4" style="font-size:18px"></div>
    <div class="fg"><label class="fl">Description</label><input class="fc" id="me-desc-${m.id}" value="${m.description||''}"></div>
  </div>
  <button class="btn btn-primary btn-sm" style="margin-top:8px" onclick="aiHubSaveModelEdit('${m.id}')"><i class="fas fa-save"></i>Save Changes</button>`;
}

// ── PURPOSES TAB ──────────────────────────────────────────────────────────────
async function aiHubLoadPurposes() {
  try {
    const [modelsRes, purposesRes] = await Promise.all([
      AdminAPI.get('/v1/ai-hub/models'),
      AdminAPI.get('/v1/ai-hub/purposes')
    ]);
    window._aiHubModels = modelsRes.data || [];
    window._aiHubPurposes = purposesRes.data || {};
    document.getElementById('ai-hub-content').innerHTML = renderPurposesTab(window._aiHubPurposes, window._aiHubModels);
  } catch (e) {
    document.getElementById('ai-hub-content').innerHTML = `<div class="es"><i class="fas fa-exclamation-triangle"></i><p>${e.message}</p></div>`;
  }
}

function renderPurposesTab(purposes, models) {
  const modelOptions = models.filter(m => m.enabled).map(m => `<option value="${m.id}">${m.icon||'🤖'} ${m.name}</option>`).join('');
  const allModelOptions = `<option value="">— Not assigned (use default) —</option>${modelOptions}`;

  return `
  <div style="background:rgba(99,102,241,.08);border:1px solid var(--accent);border-radius:10px;padding:12px 16px;margin-bottom:16px;font-size:13px">
    <strong>How it works:</strong> Assign a specific AI model to each task. If not assigned, the system uses the first enabled model. This lets you use a cheap fast model for listings and a smarter model for customer support.
  </div>

  <div style="display:flex;flex-direction:column;gap:10px" id="purposes-list">
    ${Object.entries(purposes).map(([key, p]) => `
    <div class="card">
      <div style="display:flex;align-items:center;gap:14px">
        <div style="width:44px;height:44px;border-radius:10px;background:var(--bg3);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">${p.icon}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:14px;font-weight:700">${p.label}</div>
          <div style="font-size:11px;color:var(--text3)">${p.description}</div>
        </div>
        <div style="flex-shrink:0;min-width:220px">
          <select class="fc" id="purpose-${key}" style="font-size:12px">
            ${allModelOptions}
          </select>
        </div>
      </div>
    </div>`).join('')}
  </div>

  <div style="margin-top:16px;display:flex;gap:8px">
    <button class="btn btn-primary" onclick="aiHubSavePurposes()"><i class="fas fa-save"></i>Save Assignments</button>
    <button class="btn btn-secondary" onclick="aiHubLoadPurposes()"><i class="fas fa-sync"></i>Reset</button>
  </div>`;
}

// ── AGENTS TAB ────────────────────────────────────────────────────────────────
async function aiHubLoadAgents() {
  try {
    const res = await AdminAPI.get('/v1/ai-hub/agents');
    window._aiHubAgents = res.data || [];
    document.getElementById('ai-hub-content').innerHTML = renderAgentsTab(window._aiHubAgents);
  } catch (e) {
    document.getElementById('ai-hub-content').innerHTML = `<div class="es"><i class="fas fa-exclamation-triangle"></i><p>${e.message}</p></div>`;
  }
}

function renderAgentsTab(agents) {
  const agentTypes = [
    { type: 'email', name: 'Email Agent', icon: '📧', desc: 'Sends automated emails — order confirmations, welcome, review requests', color: '#3b82f6' },
    { type: 'whatsapp', name: 'WhatsApp Agent', icon: '💬', desc: 'Sends WhatsApp messages via API for orders, support', color: '#25d366' },
    { type: 'support', name: 'Customer Support Agent', icon: '🤖', desc: 'AI-powered customer support — answers queries automatically', color: '#8b5cf6' },
    { type: 'vendor', name: 'Vendor Assignment Agent', icon: '🚚', desc: 'Auto-assigns orders to best vendor based on category and availability', color: '#f59e0b' },
    { type: 'seo', name: 'SEO Content Agent', icon: '🔍', desc: 'Auto-generates blog posts, meta descriptions, product SEO', color: '#10b981' },
    { type: 'review', name: 'Review Response Agent', icon: '⭐', desc: 'Auto-replies to customer reviews with personalized responses', color: '#ec4899' },
    { type: 'call', name: 'AI Call Agent', icon: '📞', desc: 'Handles inbound calls with AI voice (requires Twilio/Exotel)', color: '#ef4444' },
    { type: 'hermes', name: 'Hermes Orchestrator', icon: '🪄', desc: 'Master agent that coordinates all other agents and workflows', color: '#6366f1' },
  ];

  return `
  <div style="background:rgba(99,102,241,.08);border:1px solid var(--accent);border-radius:10px;padding:12px 16px;margin-bottom:16px;font-size:13px">
    <strong>AI Agents</strong> run autonomously in the background. Enable them, connect to an AI model, and they handle tasks automatically. Each agent can be configured independently.
  </div>

  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px">
    ${agentTypes.map(at => {
      const agent = agents.find(a => a.type === at.type) || { type: at.type, enabled: false, config: {} };
      return `
      <div class="card" style="border-top:3px solid ${at.color}">
        <div class="card-hd">
          <div style="display:flex;align-items:center;gap:10px;flex:1">
            <div style="width:40px;height:40px;border-radius:10px;background:${at.color}22;display:flex;align-items:center;justify-content:center;font-size:20px">${at.icon}</div>
            <div>
              <div style="font-size:13px;font-weight:700">${at.name}</div>
              <div style="font-size:11px;color:var(--text3)">${at.desc}</div>
            </div>
          </div>
          <label class="tgl"><input type="checkbox" ${agent.enabled?'checked':''} onchange="aiHubToggleAgent('${at.type}',this.checked)"><span class="tgs"></span></label>
        </div>
        <div style="margin-top:10px;display:flex;gap:6px">
          <span class="tag ${agent.enabled?'tg':'ty'}" style="font-size:10px">${agent.enabled?'Active':'Inactive'}</span>
          <button class="btn btn-secondary btn-sm" onclick="aiHubConfigAgent('${at.type}','${at.name}')"><i class="fas fa-cog"></i>Configure</button>
        </div>
        <div id="agent-config-${at.type}" style="display:none;margin-top:12px;border-top:1px solid var(--border);padding-top:12px">
          ${renderAgentConfig(at.type, agent)}
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

function renderAgentConfig(type, agent) {
  const cfg = agent.config || {};
  const modelSelect = `<div class="fg"><label class="fl">AI Model</label>
    <select class="fc" id="agent-model-${type}">
      <option value="">Use default model</option>
      ${(window._aiHubModels||[]).filter(m=>m.enabled).map(m=>`<option value="${m.id}" ${cfg.model_id===m.id?'selected':''}>${m.icon||'🤖'} ${m.name}</option>`).join('')}
    </select></div>`;

  const configs = {
    email: `${modelSelect}<div class="fg"><label class="fl">Trigger Events</label>
      <div style="display:flex;flex-direction:column;gap:6px">
        ${[['order_confirm','Order Confirmation'],['welcome','Welcome Email'],['review_request','Review Request (3 days after delivery)'],['vendor_notify','Vendor Assignment Notification']].map(([k,l])=>`
        <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer">
          <input type="checkbox" ${cfg[k]!==false?'checked':''} id="agent-email-${k}"> ${l}
        </label>`).join('')}
      </div></div>`,
    whatsapp: `${modelSelect}<div class="fg"><label class="fl">WhatsApp API Type</label>
      <select class="fc" id="agent-wa-type">
        <option value="twilio" ${cfg.api_type==='twilio'?'selected':''}>Twilio</option>
        <option value="wati" ${cfg.api_type==='wati'?'selected':''}>WATI</option>
        <option value="360dialog" ${cfg.api_type==='360dialog'?'selected':''}>360dialog</option>
        <option value="custom" ${cfg.api_type==='custom'?'selected':''}>Custom API</option>
      </select></div>
      <div class="fg"><label class="fl">API Key / Token</label><input class="fc" id="agent-wa-key" type="password" placeholder="${cfg.api_key?'••••••••':'Not set'}"></div>`,
    support: `${modelSelect}<div class="fg"><label class="fl">System Prompt</label>
      <textarea class="fc" id="agent-support-prompt" rows="3" placeholder="You are a helpful customer support agent for DigiKraft.shop...">${cfg.system_prompt||''}</textarea></div>
      <div class="fg"><label class="fl">Escalation Email (when AI can't answer)</label><input class="fc" id="agent-support-email" value="${cfg.escalation_email||''}" placeholder="support@digikraft.shop"></div>`,
    vendor: `${modelSelect}<div class="fg"><label class="fl">Assignment Rules</label>
      <select class="fc" id="agent-vendor-rule">
        <option value="category" ${cfg.rule==='category'?'selected':''}>Match by product category</option>
        <option value="load" ${cfg.rule==='load'?'selected':''}>Least loaded vendor</option>
        <option value="rating" ${cfg.rule==='rating'?'selected':''}>Highest rated vendor</option>
        <option value="ai" ${cfg.rule==='ai'?'selected':''}>AI decides</option>
      </select></div>`,
    seo: `${modelSelect}<div class="fg"><label class="fl">Auto-generate for</label>
      <div style="display:flex;flex-direction:column;gap:6px">
        ${[['new_products','New products (on publish)'],['blog_posts','Blog posts'],['meta_descriptions','Missing meta descriptions']].map(([k,l])=>`
        <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer">
          <input type="checkbox" ${cfg[k]?'checked':''} id="agent-seo-${k}"> ${l}
        </label>`).join('')}
      </div></div>`,
    call: `${modelSelect}<div class="fg"><label class="fl">Voice Provider</label>
      <select class="fc" id="agent-call-provider">
        <option value="twilio">Twilio</option><option value="exotel">Exotel</option><option value="plivo">Plivo</option>
      </select></div>
      <div class="fg"><label class="fl">Phone Number</label><input class="fc" id="agent-call-phone" value="${cfg.phone||''}" placeholder="+91XXXXXXXXXX"></div>`,
    hermes: `${modelSelect}<div style="background:rgba(99,102,241,.1);border-radius:8px;padding:10px;font-size:12px;color:var(--text2)">
      Hermes is the master orchestrator. It monitors all events and coordinates other agents. Configure individual agents first, then enable Hermes to tie them together.
    </div>`,
    review: `${modelSelect}<div class="fg"><label class="fl">Response Tone</label>
      <select class="fc" id="agent-review-tone">
        <option value="professional">Professional</option><option value="friendly">Friendly & Warm</option><option value="brief">Brief & Concise</option>
      </select></div>`,
  };

  return `${configs[type] || modelSelect}
  <button class="btn btn-primary btn-sm" style="margin-top:10px" onclick="aiHubSaveAgentConfig('${type}')"><i class="fas fa-save"></i>Save Config</button>`;
}

// ── EMAIL TAB ─────────────────────────────────────────────────────────────────
async function aiHubLoadEmail() {
  try {
    const res = await AdminAPI.get('/v1/ai-hub/email');
    document.getElementById('ai-hub-content').innerHTML = renderEmailTab(res.data || {});
    // Load email templates section after tab renders
    const tplWrap = document.getElementById('ai-hub-email-templates');
    if (tplWrap && window.renderEmailTemplatesSection) {
      tplWrap.innerHTML = await window.renderEmailTemplatesSection();
    }
  } catch (e) {
    document.getElementById('ai-hub-content').innerHTML = `<div class="es"><i class="fas fa-exclamation-triangle"></i><p>${e.message}</p></div>`;
  }
}

function renderEmailTab(cfg) {
  return `
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">

    <!-- SMTP SETUP -->
    <div class="card">
      <div class="card-hd"><div class="card-title"><i class="fas fa-server" style="color:var(--blue)"></i>SMTP Configuration</div></div>

      <!-- QUICK PRESETS -->
      <div style="margin-bottom:14px">
        <div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:8px">QUICK PRESETS</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${[
            ['gmail','Gmail','smtp.gmail.com','587','tls','#ea4335'],
            ['outlook','Outlook','smtp-mail.outlook.com','587','tls','#0078d4'],
            ['yahoo','Yahoo','smtp.mail.yahoo.com','587','tls','#6001d2'],
            ['zoho','Zoho','smtp.zoho.in','587','tls','#e42527'],
            ['sendgrid','SendGrid','smtp.sendgrid.net','587','tls','#1a82e2'],
            ['mailgun','Mailgun','smtp.mailgun.org','587','tls','#f06b26'],
          ].map(([id,name,host,port,sec,color]) => `
          <button onclick="aiHubSmtpPreset('${host}','${port}','${sec}')"
            style="padding:5px 10px;border-radius:7px;border:1px solid var(--border);background:var(--bg3);font-size:11px;font-weight:600;cursor:pointer;color:${color}">
            ${name}
          </button>`).join('')}
        </div>
      </div>

      <div class="fg"><label class="fl">SMTP Host</label><input class="fc" id="smtp-host" value="${cfg.smtp_host||''}" placeholder="smtp.gmail.com"></div>
      <div style="display:grid;grid-template-columns:2fr 1fr;gap:8px">
        <div class="fg"><label class="fl">Port</label><input class="fc" id="smtp-port" value="${cfg.smtp_port||'587'}" placeholder="587"></div>
        <div class="fg"><label class="fl">Security</label>
          <select class="fc" id="smtp-secure">
            <option value="tls" ${cfg.smtp_secure==='tls'?'selected':''}>TLS (587)</option>
            <option value="ssl" ${cfg.smtp_secure==='ssl'?'selected':''}>SSL (465)</option>
            <option value="none" ${cfg.smtp_secure==='none'?'selected':''}>None</option>
          </select>
        </div>
      </div>
      <div class="fg"><label class="fl">Username / Email</label><input class="fc" id="smtp-user" value="${cfg.smtp_user||''}" placeholder="your@gmail.com"></div>
      <div class="fg"><label class="fl">Password / App Password</label>
        <input class="fc" id="smtp-pass" type="password" placeholder="${cfg.smtp_pass_set?'••••••••':'Not set'}">
        <div style="font-size:11px;color:var(--text3);margin-top:4px">For Gmail: use an <a href="https://myaccount.google.com/apppasswords" target="_blank" style="color:var(--accent)">App Password</a>, not your regular password</div>
      </div>
      <div class="fg"><label class="fl">From Name</label><input class="fc" id="smtp-from-name" value="${cfg.smtp_from_name||'DigiKraft'}" placeholder="DigiKraft"></div>
      <div class="fg"><label class="fl">From Email</label><input class="fc" id="smtp-from-email" value="${cfg.smtp_from_email||''}" placeholder="noreply@digikraft.shop"></div>

      <div style="display:flex;gap:8px;margin-top:4px">
        <button class="btn btn-primary" onclick="aiHubSaveEmail()"><i class="fas fa-save"></i>Save SMTP</button>
        <button class="btn btn-secondary" onclick="aiHubTestEmail()"><i class="fas fa-paper-plane"></i>Send Test</button>
      </div>
      <div id="smtp-test-result" style="display:none;margin-top:8px;font-size:12px;padding:8px 12px;border-radius:8px;background:var(--bg3)"></div>
    </div>

    <!-- GOOGLE AUTH -->
    <div class="card">
      <div class="card-hd"><div class="card-title"><i class="fab fa-google" style="color:#ea4335"></i>Google OAuth (Sign in with Google)</div></div>
      <div style="background:rgba(234,67,53,.08);border:1px solid rgba(234,67,53,.3);border-radius:9px;padding:10px 12px;margin-bottom:14px;font-size:12px;color:var(--text2)">
        Allows customers to sign in with their Google account. Get credentials from <a href="https://console.cloud.google.com/apis/credentials" target="_blank" style="color:#ea4335">Google Cloud Console</a>.
      </div>
      <div class="fg"><label class="fl">Client ID</label><input class="fc" id="google-client-id" value="${cfg.google_client_id||''}" placeholder="xxxx.apps.googleusercontent.com"></div>
      <div class="fg"><label class="fl">Client Secret</label><input class="fc" id="google-client-secret" type="password" placeholder="${cfg.google_client_secret_set?'••••••••':'Not set'}"></div>
      <div class="fg"><label class="fl">Redirect URI</label><input class="fc" id="google-redirect" value="${cfg.google_redirect_uri||'https://digikraft2-production.up.railway.app/auth/google/callback'}" placeholder="https://yourdomain.com/auth/google/callback"></div>
      <button class="btn btn-primary" onclick="aiHubSaveGoogleAuth()"><i class="fab fa-google"></i>Save Google Auth</button>
    </div>

    <!-- EMAIL TRIGGERS -->
    <div class="card" style="grid-column:span 2">
      <div class="card-hd"><div class="card-title"><i class="fas fa-bell" style="color:var(--accent)"></i>Email Notification Triggers</div></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px">
        ${[
          ['email_order_confirm','Order Confirmation','Send email when customer places an order','fa-shopping-bag'],
          ['email_welcome','Welcome Email','Send welcome email on new registration','fa-user-plus'],
          ['email_vendor_notify','Vendor Assignment','Notify vendor when order is assigned','fa-truck'],
          ['email_review_request','Review Request','Ask for review 3 days after delivery','fa-star'],
        ].map(([key,label,desc,icon]) => `
        <div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg3);border-radius:10px">
          <div style="width:36px;height:36px;border-radius:9px;background:var(--bg2);display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <i class="fas ${icon}" style="color:var(--accent);font-size:14px"></i>
          </div>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:600">${label}</div>
            <div style="font-size:11px;color:var(--text3)">${desc}</div>
          </div>
          <label class="tgl"><input type="checkbox" id="${key}" ${cfg[key]!==false?'checked':''}><span class="tgs"></span></label>
        </div>`).join('')}
      </div>
      <button class="btn btn-primary" style="margin-top:12px" onclick="aiHubSaveEmailTriggers()"><i class="fas fa-save"></i>Save Triggers</button>
    </div>

    <!-- EMAIL TEMPLATES -->
    <div id="ai-hub-email-templates" style="grid-column:span 2">
      <div class="card" style="margin-top:4px">
        <div class="card-hd">
          <div class="card-title"><i class="fas fa-spinner fa-spin"></i>Loading templates...</div>
        </div>
      </div>
    </div>
  </div>
  <script>
    (async () => {
      const el = document.getElementById('ai-hub-email-templates');
      if (el && window.renderEmailTemplatesSection) {
        el.innerHTML = await window.renderEmailTemplatesSection();
      }
    })();
  </script>`;
}

// ── ACTION FUNCTIONS ──────────────────────────────────────────────────────────

// Models
window.aiHubOpenAddModel = function() {
  const panel = document.getElementById('add-model-panel');
  if (panel) { panel.style.display = panel.style.display === 'none' ? 'block' : 'none'; }
};

window.aiHubProviderChange = function(providerId) {
  const p = AI_PROVIDERS.find(x => x.id === providerId);
  if (!p) return;
  const urlEl = document.getElementById('nm-base-url');
  const keyLabel = document.getElementById('nm-key-label');
  const presetEl = document.getElementById('nm-model-preset');
  if (urlEl) urlEl.value = p.url;
  if (keyLabel) keyLabel.textContent = p.keyLabel;
  if (presetEl) {
    const models = POPULAR_MODELS[providerId] || [];
    presetEl.innerHTML = `<option value="">Popular models...</option>` + models.map(m => `<option value="${m}">${m}</option>`).join('');
  }
};

window.aiHubQuickAdd = function(providerId) {
  const panel = document.getElementById('add-model-panel');
  if (panel) panel.style.display = 'block';
  const providerEl = document.getElementById('nm-provider');
  if (providerEl) { providerEl.value = providerId; aiHubProviderChange(providerId); }
  panel?.scrollIntoView({ behavior: 'smooth' });
};

window.aiHubSaveNewModel = async function() {
  const name = document.getElementById('nm-name')?.value?.trim();
  const model_id = document.getElementById('nm-model-id')?.value?.trim();
  const provider = document.getElementById('nm-provider')?.value;
  const api_key = document.getElementById('nm-api-key')?.value?.trim();
  const base_url = document.getElementById('nm-base-url')?.value?.trim();
  const icon = document.getElementById('nm-icon')?.value?.trim();
  const description = document.getElementById('nm-desc')?.value?.trim();

  if (!name || !model_id) { toast('Name and Model ID are required', 'e'); return; }

  try {
    await AdminAPI.post('/v1/ai-hub/models', { name, model_id, provider, api_key, base_url, icon, description });
    toast(`Model "${name}" added!`, 's');
    aiHubLoadModels();
  } catch (e) { toast('Failed: ' + e.message, 'e'); }
};

window.aiHubTestModel = async function(modelId, btn) {
  const resultEl = document.getElementById(`model-test-${modelId}`);
  if (resultEl) { resultEl.style.display = 'block'; resultEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing connection...'; }
  if (btn) btn.disabled = true;

  try {
    const res = await AdminAPI.post(`/v1/ai-hub/models/${modelId}/test`, {});
    if (res.success) {
      if (resultEl) resultEl.innerHTML = `<span style="color:var(--green)">✓ Connected!</span> Latency: ${res.latency}ms · Model: ${res.model_used}`;
    } else {
      if (resultEl) resultEl.innerHTML = `<span style="color:var(--red)">✗ Failed:</span> ${res.error}`;
    }
  } catch (e) {
    if (resultEl) resultEl.innerHTML = `<span style="color:var(--red)">✗ Error:</span> ${e.message}`;
  } finally {
    if (btn) btn.disabled = false;
  }
};

window.aiHubTestNewModel = async function() {
  const model_id = document.getElementById('nm-model-id')?.value?.trim();
  const api_key = document.getElementById('nm-api-key')?.value?.trim();
  const base_url = document.getElementById('nm-base-url')?.value?.trim() || 'https://openrouter.ai/api/v1';
  const resultEl = document.getElementById('nm-test-result');

  if (!model_id) { toast('Enter a model ID first', 'w'); return; }
  if (resultEl) { resultEl.style.display = 'block'; resultEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...'; }

  // Save temp model, test it, delete it
  try {
    const saveRes = await AdminAPI.post('/v1/ai-hub/models', { name: '_test_', model_id, provider: 'custom', api_key, base_url });
    const testRes = await AdminAPI.post(`/v1/ai-hub/models/${saveRes.data.id}/test`, {});
    await AdminAPI.delete(`/v1/ai-hub/models/${saveRes.data.id}`);

    if (testRes.success) {
      if (resultEl) resultEl.innerHTML = `<span style="color:var(--green)">✓ Works!</span> Latency: ${testRes.latency}ms`;
    } else {
      if (resultEl) resultEl.innerHTML = `<span style="color:var(--red)">✗ Failed:</span> ${testRes.error}`;
    }
  } catch (e) {
    if (resultEl) resultEl.innerHTML = `<span style="color:var(--red)">✗ Error:</span> ${e.message}`;
  }
};

window.aiHubEditModel = function(modelId) {
  const el = document.getElementById(`model-edit-${modelId}`);
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
};

window.aiHubSaveModelEdit = async function(modelId) {
  const updates = {
    name: document.getElementById(`me-name-${modelId}`)?.value?.trim(),
    provider: document.getElementById(`me-provider-${modelId}`)?.value,
    model_id: document.getElementById(`me-model-${modelId}`)?.value?.trim(),
    base_url: document.getElementById(`me-url-${modelId}`)?.value?.trim(),
    icon: document.getElementById(`me-icon-${modelId}`)?.value?.trim(),
    description: document.getElementById(`me-desc-${modelId}`)?.value?.trim(),
  };
  const key = document.getElementById(`me-key-${modelId}`)?.value?.trim();
  if (key) updates.api_key = key;

  try {
    await AdminAPI.put(`/v1/ai-hub/models/${modelId}`, updates);
    toast('Model updated!', 's');
    aiHubLoadModels();
  } catch (e) { toast('Failed: ' + e.message, 'e'); }
};

window.aiHubToggleModel = async function(modelId, enabled) {
  try {
    await AdminAPI.put(`/v1/ai-hub/models/${modelId}`, { enabled });
    toast(enabled ? 'Model enabled' : 'Model disabled', 's');
  } catch (e) { toast('Failed: ' + e.message, 'e'); }
};

window.aiHubDeleteModel = async function(modelId, name) {
  if (!confirm(`Delete model "${name}"?`)) return;
  try {
    await AdminAPI.delete(`/v1/ai-hub/models/${modelId}`);
    toast(`"${name}" deleted`, 's');
    aiHubLoadModels();
  } catch (e) { toast('Failed: ' + e.message, 'e'); }
};

// Purposes
window.aiHubSavePurposes = async function() {
  const purposes = { ...window._aiHubPurposes };
  Object.keys(purposes).forEach(key => {
    const el = document.getElementById(`purpose-${key}`);
    if (el) purposes[key] = { ...purposes[key], model_id: el.value };
  });
  try {
    await AdminAPI.put('/v1/ai-hub/purposes', purposes);
    toast('Purpose assignments saved!', 's');
  } catch (e) { toast('Failed: ' + e.message, 'e'); }
};

// Agents
window.aiHubToggleAgent = async function(type, enabled) {
  try {
    const agent = (window._aiHubAgents || []).find(a => a.type === type) || { type, config: {} };
    await AdminAPI.post('/v1/ai-hub/agents', { ...agent, enabled });
    toast(enabled ? 'Agent activated' : 'Agent deactivated', 's');
  } catch (e) { toast('Failed: ' + e.message, 'e'); }
};

window.aiHubConfigAgent = function(type, name) {
  const el = document.getElementById(`agent-config-${type}`);
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
};

window.aiHubSaveAgentConfig = async function(type) {
  const agent = (window._aiHubAgents || []).find(a => a.type === type) || { type, config: {} };
  const config = { ...agent.config };

  // Collect config fields based on type
  const modelEl = document.getElementById(`agent-model-${type}`);
  if (modelEl) config.model_id = modelEl.value;

  if (type === 'email') {
    ['order_confirm','welcome','review_request','vendor_notify'].forEach(k => {
      const el = document.getElementById(`agent-email-${k}`);
      if (el) config[k] = el.checked;
    });
  } else if (type === 'whatsapp') {
    const typeEl = document.getElementById('agent-wa-type');
    const keyEl = document.getElementById('agent-wa-key');
    if (typeEl) config.api_type = typeEl.value;
    if (keyEl?.value) config.api_key = keyEl.value;
  } else if (type === 'support') {
    const promptEl = document.getElementById('agent-support-prompt');
    const emailEl = document.getElementById('agent-support-email');
    if (promptEl) config.system_prompt = promptEl.value;
    if (emailEl) config.escalation_email = emailEl.value;
  } else if (type === 'vendor') {
    const ruleEl = document.getElementById('agent-vendor-rule');
    if (ruleEl) config.rule = ruleEl.value;
  } else if (type === 'seo') {
    ['new_products','blog_posts','meta_descriptions'].forEach(k => {
      const el = document.getElementById(`agent-seo-${k}`);
      if (el) config[k] = el.checked;
    });
  } else if (type === 'call') {
    const provEl = document.getElementById('agent-call-provider');
    const phoneEl = document.getElementById('agent-call-phone');
    if (provEl) config.provider = provEl.value;
    if (phoneEl) config.phone = phoneEl.value;
  } else if (type === 'review') {
    const toneEl = document.getElementById('agent-review-tone');
    if (toneEl) config.tone = toneEl.value;
  }

  try {
    await AdminAPI.post('/v1/ai-hub/agents', { ...agent, config });
    toast('Agent config saved!', 's');
  } catch (e) { toast('Failed: ' + e.message, 'e'); }
};

// Email
window.aiHubSmtpPreset = function(host, port, secure) {
  const h = document.getElementById('smtp-host');
  const p = document.getElementById('smtp-port');
  const s = document.getElementById('smtp-secure');
  if (h) h.value = host;
  if (p) p.value = port;
  if (s) s.value = secure;
};

window.aiHubSaveEmail = async function() {
  const data = {
    smtp_host: document.getElementById('smtp-host')?.value?.trim(),
    smtp_port: document.getElementById('smtp-port')?.value?.trim(),
    smtp_user: document.getElementById('smtp-user')?.value?.trim(),
    smtp_from_name: document.getElementById('smtp-from-name')?.value?.trim(),
    smtp_from_email: document.getElementById('smtp-from-email')?.value?.trim(),
    smtp_secure: document.getElementById('smtp-secure')?.value,
  };
  const pass = document.getElementById('smtp-pass')?.value?.trim();
  if (pass) data.smtp_pass = pass;

  try {
    await AdminAPI.put('/v1/ai-hub/email', data);
    toast('SMTP config saved!', 's');
  } catch (e) { toast('Failed: ' + e.message, 'e'); }
};

window.aiHubTestEmail = async function() {
  const to = prompt('Send test email to:', document.getElementById('smtp-user')?.value || '');
  if (!to) return;
  const resultEl = document.getElementById('smtp-test-result');
  if (resultEl) { resultEl.style.display = 'block'; resultEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending test email...'; }

  try {
    const res = await AdminAPI.post('/v1/ai-hub/email/test', { to });
    if (resultEl) resultEl.innerHTML = res.success
      ? `<span style="color:var(--green)">✓ ${res.message}</span>`
      : `<span style="color:var(--red)">✗ ${res.error}</span>`;
  } catch (e) {
    if (resultEl) resultEl.innerHTML = `<span style="color:var(--red)">✗ ${e.message}</span>`;
  }
};

window.aiHubSaveGoogleAuth = async function() {
  const data = {
    google_client_id: document.getElementById('google-client-id')?.value?.trim(),
    google_redirect_uri: document.getElementById('google-redirect')?.value?.trim(),
  };
  const secret = document.getElementById('google-client-secret')?.value?.trim();
  if (secret) data.google_client_secret = secret;

  try {
    await AdminAPI.put('/v1/ai-hub/email', data);
    toast('Google Auth config saved!', 's');
  } catch (e) { toast('Failed: ' + e.message, 'e'); }
};

window.aiHubSaveEmailTriggers = async function() {
  const data = {};
  ['email_order_confirm','email_welcome','email_vendor_notify','email_review_request'].forEach(k => {
    const el = document.getElementById(k);
    if (el) data[k] = String(el.checked);
  });
  try {
    await AdminAPI.put('/v1/ai-hub/email', data);
    toast('Email triggers saved!', 's');
  } catch (e) { toast('Failed: ' + e.message, 'e'); }
};
