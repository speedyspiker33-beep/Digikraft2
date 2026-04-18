// ===== LICENSE GENERATOR UI =====
window._licTab = window._licTab || 'generator';
window._licProgram = window._licProgram || 'standard';

window.renderLicenses = function() {
  const pool = JSON.parse(localStorage.getItem('dk_lic_pool') || '[]');
  const issued = JSON.parse(localStorage.getItem('dk_lic_issued') || '[]');
  const programs = window.LicenseGen ? Object.entries(LicenseGen.programs) : [];
  const tab = window._licTab;
  const prog = window._licProgram;
  const p = LicenseGen?.programs[prog];

  return `
  <div class="ph">
    <div><div class="ph-title">License Generator</div><div class="ph-sub">${pool.length} in pool · ${issued.length} issued · 10 programs</div></div>
    <div class="ph-actions">
      <button class="btn btn-secondary" onclick="exportLicensePool()"><i class="fas fa-download"></i>Export Pool</button>
      <button class="btn btn-primary" onclick="window._licTab='bulk';navigate('licenses')"><i class="fas fa-layer-group"></i>Bulk Generate</button>
    </div>
  </div>
  <div class="tabs" style="margin-bottom:16px">
    ${[['generator','Generator'],['pool','Pool ('+pool.length+')'],['issued','Issued ('+issued.length+')'],['validator','Validator'],['programs','All Programs'],['bulk','Bulk']].map(([id,lb])=>
      `<button class="tab ${tab===id?'on':''}" onclick="window._licTab='${id}';navigate('licenses')">${lb}</button>`
    ).join('')}
  </div>
  ${tab==='programs'?renderProgramsTab(programs):''}
  ${tab==='validator'?renderValidatorTab():''}
  ${tab==='pool'?renderPoolTab(pool):''}
  ${tab==='issued'?renderIssuedTab(issued):''}
  ${tab==='bulk'?renderBulkTab():''}
  ${tab==='generator'?renderGeneratorTab(programs, prog, p):''}`;
};

function renderProgramsTab(programs) {
  return `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px">
    ${programs.map(([id,p])=>`
    <div class="card" style="cursor:pointer;transition:.2s" onmouseover="this.style.borderColor='${p.color}'" onmouseout="this.style.borderColor='var(--border)'" onclick="window._licProgram='${id}';window._licTab='generator';navigate('licenses')">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
        <div style="width:42px;height:42px;border-radius:11px;background:${p.color}22;display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <i class="fas ${p.icon}" style="color:${p.color};font-size:17px"></i>
        </div>
        <div><div style="font-size:14px;font-weight:700">${p.name}</div><code style="font-size:10px;color:var(--text3)">${id}</code></div>
      </div>
      <p style="font-size:12px;color:var(--text2);line-height:1.5;margin-bottom:10px">${p.desc}</p>
      <div style="font-size:11px;color:var(--text3);margin-bottom:8px">${p.options.length} configurable options</div>
      <button class="btn btn-secondary btn-sm" style="width:100%" onclick="event.stopPropagation();window._licProgram='${id}';window._licTab='generator';navigate('licenses')">
        <i class="fas fa-magic"></i>Use This Program
      </button>
    </div>`).join('')}
  </div>`;
}

function renderValidatorTab() {
  return `<div class="card" style="max-width:600px">
    <div class="card-hd"><div class="card-title"><i class="fas fa-shield-alt" style="color:var(--green)"></i>License Validator</div></div>
    <div class="fg"><label class="fl">License Key</label><textarea class="fc" id="val-key" rows="3" placeholder="Paste any license key here..."></textarea></div>
    <div class="fg"><label class="fl">Program Format</label>
      <select class="fc" id="val-prog">
        <option value="standard">Auto / Standard</option>
        ${window.LicenseGen?Object.entries(LicenseGen.programs).map(([id,p])=>`<option value="${id}">${p.name}</option>`).join(''):''}
      </select>
    </div>
    <button class="btn btn-primary" onclick="runValidator()"><i class="fas fa-search"></i>Validate</button>
    <div id="val-result" style="margin-top:14px"></div>
  </div>`;
}

function renderPoolTab(pool) {
  return `<div class="card">
    <div class="card-hd">
      <div class="card-title"><i class="fas fa-database" style="color:var(--blue)"></i>Key Pool (${pool.length})</div>
      <div style="display:flex;gap:6px">
        <button class="btn btn-secondary btn-sm" onclick="exportLicensePool()"><i class="fas fa-download"></i>Export</button>
        <button class="btn btn-danger btn-sm" onclick="clearPool()"><i class="fas fa-trash"></i>Clear</button>
      </div>
    </div>
    ${pool.length?`<div class="tw"><table>
      <thead><tr><th>#</th><th>License Key</th><th>Program</th><th>Added</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>${pool.map((k,i)=>`<tr>
        <td style="color:var(--text3);font-size:12px">${i+1}</td>
        <td><code style="background:var(--bg3);padding:3px 8px;border-radius:6px;font-size:11px;cursor:pointer" onclick="navigator.clipboard.writeText('${k.key}');window.toast('Copied!','s')" title="Click to copy">${k.key.length>35?k.key.slice(0,35)+'…':k.key}</code></td>
        <td><span class="tag tp" style="font-size:10px">${k.program||'standard'}</span></td>
        <td style="font-size:11px;color:var(--text2)">${new Date(k.at).toLocaleDateString('en-IN')}</td>
        <td><span class="tag ${k.used?'tr':'tg'}">${k.used?'Used':'Available'}</span></td>
        <td><div style="display:flex;gap:4px">
          <button class="btn btn-sm btn-secondary btn-icon" onclick="navigator.clipboard.writeText('${k.key}');window.toast('Copied!','s')"><i class="fas fa-copy"></i></button>
          <button class="btn btn-sm btn-primary" style="font-size:11px;padding:4px 10px" onclick="issueFromPool(${i})" ${k.used?'disabled style="opacity:.4"':''}><i class="fas fa-paper-plane"></i>Issue</button>
          <button class="btn btn-sm btn-danger btn-icon" onclick="removeFromPool(${i})"><i class="fas fa-trash"></i></button>
        </div></td>
      </tr>`).join('')}</tbody>
    </table></div>`:'<div class="es"><i class="fas fa-database"></i><p>Pool empty. Generate keys and add them here.</p></div>'}
  </div>`;
}

function renderIssuedTab(issued) {
  return `<div class="card">
    <div class="card-hd">
      <div class="card-title"><i class="fas fa-check-double" style="color:var(--green)"></i>Issued Licenses (${issued.length})</div>
      <button class="btn btn-secondary btn-sm" onclick="exportCSV(JSON.parse(localStorage.getItem('dk_lic_issued')||'[]'),'issued-licenses.csv')"><i class="fas fa-download"></i>Export</button>
    </div>
    ${issued.length?`<div class="tw"><table>
      <thead><tr><th>License Key</th><th>Customer</th><th>Product</th><th>Program</th><th>Issued</th><th>Actions</th></tr></thead>
      <tbody>${issued.map(k=>`<tr>
        <td><code style="background:var(--bg3);padding:3px 8px;border-radius:6px;font-size:11px;cursor:pointer" onclick="navigator.clipboard.writeText('${k.key}');window.toast('Copied!','s')">${k.key.length>30?k.key.slice(0,30)+'…':k.key}</code></td>
        <td style="font-size:12px">${k.customer||'—'}</td>
        <td style="font-size:12px">${k.product||'—'}</td>
        <td><span class="tag tp" style="font-size:10px">${k.program||'—'}</span></td>
        <td style="font-size:11px;color:var(--text2)">${new Date(k.at).toLocaleDateString('en-IN')}</td>
        <td><button class="btn btn-sm btn-secondary btn-icon" onclick="validateKey('${k.key}','${k.program}')"><i class="fas fa-check"></i></button></td>
      </tr>`).join('')}</tbody>
    </table></div>`:'<div class="es"><i class="fas fa-check-double"></i><p>No licenses issued yet</p></div>'}
  </div>`;
}

function renderBulkTab() {
  return `<div class="card" style="max-width:700px">
    <div class="card-hd"><div class="card-title"><i class="fas fa-layer-group" style="color:var(--blue)"></i>Bulk Key Generator</div></div>
    <div class="fgrid">
      <div class="fg"><label class="fl">Program</label>
        <select class="fc" id="bulk-prog">
          ${window.LicenseGen?Object.entries(LicenseGen.programs).filter(([id])=>id!=='bulkPool').map(([id,p])=>`<option value="${id}">${p.name}</option>`).join(''):''}
        </select>
      </div>
      <div class="fg"><label class="fl">Quantity (max 1000)</label><input class="fc" id="bulk-count" type="number" value="10" min="1" max="1000"></div>
      <div class="fg"><label class="fl">Prefix</label><input class="fc" id="bulk-prefix" value="DK" placeholder="DK"></div>
      <div class="fg"><label class="fl">Auto-add to Pool</label><div style="margin-top:6px"><label class="tgl"><input type="checkbox" id="bulk-auto-pool" checked><span class="tgs"></span></label></div></div>
    </div>
    <button class="btn btn-primary" onclick="runBulkGenerate()"><i class="fas fa-magic"></i>Generate</button>
    <div id="bulk-output" style="margin-top:14px"></div>
  </div>`;
}


function renderGeneratorTab(programs, prog, p) {
  if (!p) return '<div class="es"><i class="fas fa-key"></i><p>Select a program from the list</p></div>';
  return `<div class="g2">
    <div class="card">
      <div class="card-hd"><div class="card-title"><i class="fas fa-list" style="color:var(--accent)"></i>Program</div></div>
      <div style="display:flex;flex-direction:column;gap:3px">
        ${programs.map(([id,pr])=>`
        <button onclick="window._licProgram='${id}';navigate('licenses')"
          style="display:flex;align-items:center;gap:9px;padding:9px 11px;border-radius:9px;background:${prog===id?'var(--accent)':'var(--bg3)'};border:1px solid ${prog===id?'var(--accent)':'var(--border)'};color:${prog===id?'#fff':'var(--text)'};text-align:left;cursor:pointer;transition:.15s">
          <i class="fas ${pr.icon}" style="color:${prog===id?'#fff':pr.color};width:15px;text-align:center;font-size:12px"></i>
          <div style="flex:1"><div style="font-size:12px;font-weight:600">${pr.name}</div></div>
          ${prog===id?'<i class="fas fa-check" style="font-size:10px"></i>':''}
        </button>`).join('')}
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:14px">
      <div class="card">
        <div class="card-hd">
          <div class="card-title"><i class="fas ${p.icon}" style="color:${p.color}"></i>${p.name}</div>
          <span class="tag tp" style="font-size:10px">${prog}</span>
        </div>
        <p style="font-size:12px;color:var(--text2);margin-bottom:14px">${p.desc}</p>
        <div class="fgrid" id="lic-opts">
          ${p.options.map(opt=>`
          <div class="fg ${opt.type==='checkbox'?'cs2':''}">
            <label class="fl">${opt.label}</label>
            ${opt.type==='text'?`<input class="fc" id="lopt-${opt.id}" value="${opt.default||''}" placeholder="${opt.default||''}">`:''}
            ${opt.type==='number'?`<input class="fc" id="lopt-${opt.id}" type="number" value="${opt.default||1}" min="${opt.min||1}" max="${opt.max||999}">`:''}
            ${opt.type==='select'?`<select class="fc" id="lopt-${opt.id}">${(opt.options||[]).map(o=>`<option value="${o}" ${o===opt.default?'selected':''}>${o}</option>`).join('')}</select>`:''}
            ${opt.type==='checkbox'?`<div style="margin-top:4px"><label class="tgl"><input type="checkbox" id="lopt-${opt.id}" ${opt.default?'checked':''}><span class="tgs"></span></label></div>`:''}
          </div>`).join('')}
        </div>
        <div style="background:var(--bg3);border-radius:9px;padding:12px;margin-top:8px">
          <div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:8px">CONTEXT (optional)</div>
          <div class="fgrid">
            <div class="fg"><label class="fl">Customer ID</label><input class="fc" id="lctx-cid" placeholder="CUST001"></div>
            <div class="fg"><label class="fl">Customer Name</label><input class="fc" id="lctx-name" placeholder="Rahul Sharma"></div>
          </div>
        </div>
        <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
          <button class="btn btn-primary" onclick="generateLicenseUI()"><i class="fas fa-magic"></i>Generate 1</button>
          <button class="btn btn-secondary" onclick="generateMultiple(5)"><i class="fas fa-layer-group"></i>×5</button>
          <button class="btn btn-secondary" onclick="generateMultiple(10)"><i class="fas fa-layer-group"></i>×10</button>
          <button class="btn btn-secondary" onclick="generateMultiple(25)"><i class="fas fa-layer-group"></i>×25</button>
        </div>
      </div>
      <div class="card" id="lic-output-card" style="display:none">
        <div class="card-hd">
          <div class="card-title"><i class="fas fa-check-circle" style="color:var(--green)"></i>Generated</div>
          <div style="display:flex;gap:6px">
            <button class="btn btn-secondary btn-sm" onclick="copyAllKeys()"><i class="fas fa-copy"></i>Copy</button>
            <button class="btn btn-success btn-sm" onclick="addToPool()"><i class="fas fa-plus"></i>Add to Pool</button>
          </div>
        </div>
        <div id="lic-output" style="font-family:monospace;font-size:12px;background:var(--bg3);border-radius:9px;padding:12px;white-space:pre-wrap;word-break:break-all;max-height:280px;overflow-y:auto;line-height:1.8"></div>
        <div id="lic-validate-result" style="margin-top:8px;font-size:12px"></div>
      </div>
    </div>
  </div>`;
}

// ── ACTIONS ──────────────────────────────────────────────────────────────────
window.generateLicenseUI = function() {
  const prog = window._licProgram; const p = LicenseGen?.programs[prog]; if(!p)return;
  const opts = {}; p.options.forEach(opt=>{const el=document.getElementById('lopt-'+opt.id);if(!el)return;opts[opt.id]=opt.type==='checkbox'?el.checked:opt.type==='number'?parseFloat(el.value)||opt.default:el.value||opt.default;});
  const ctx = {customerId:document.getElementById('lctx-cid')?.value,customerName:document.getElementById('lctx-name')?.value};
  const key = LicenseGen.generate(prog, opts, ctx);
  document.getElementById('lic-output-card').style.display='block';
  document.getElementById('lic-output').textContent=key;
  window._lastGeneratedKeys=[key]; window._lastProgram=prog;
  const v=LicenseGen.validate(key,prog);
  document.getElementById('lic-validate-result').innerHTML=`<span class="tag ${v.valid?'tg':'tr'}">${v.valid?'✓ Valid':'✗ Invalid'}</span> <span style="font-size:12px;color:var(--text2)">${v.reason}</span>`;
};

window.generateMultiple = function(n) {
  const prog=window._licProgram; const p=LicenseGen?.programs[prog]; if(!p)return;
  const opts={}; p.options.forEach(opt=>{const el=document.getElementById('lopt-'+opt.id);if(!el)return;opts[opt.id]=opt.type==='checkbox'?el.checked:opt.type==='number'?parseFloat(el.value)||opt.default:el.value||opt.default;});
  const ctx={customerId:document.getElementById('lctx-cid')?.value};
  const keys=Array.from({length:n},()=>LicenseGen.generate(prog,opts,ctx));
  document.getElementById('lic-output-card').style.display='block';
  document.getElementById('lic-output').textContent=keys.join('\n');
  window._lastGeneratedKeys=keys; window._lastProgram=prog;
  document.getElementById('lic-validate-result').innerHTML=`<span class="tag tg">✓ ${n} keys generated</span>`;
};

window.copyAllKeys=()=>{navigator.clipboard.writeText((window._lastGeneratedKeys||[]).join('\n')).then(()=>window.toast('Copied!','s'));};

window.addToPool=function(){
  const keys=window._lastGeneratedKeys||[]; const prog=window._lastProgram||'standard';
  const pool=JSON.parse(localStorage.getItem('dk_lic_pool')||'[]');
  keys.forEach(key=>pool.push({key,program:prog,at:new Date().toISOString(),used:false}));
  localStorage.setItem('dk_lic_pool',JSON.stringify(pool));
  window.toast(`${keys.length} key(s) added to pool!`,'s'); navigate('licenses');
};

window.issueFromPool=function(i){
  const pool=JSON.parse(localStorage.getItem('dk_lic_pool')||'[]');
  const customer=prompt('Customer name:'); const product=prompt('Product:');
  if(!customer)return;
  pool[i].used=true; pool[i].issuedTo=customer; pool[i].issuedAt=new Date().toISOString();
  localStorage.setItem('dk_lic_pool',JSON.stringify(pool));
  const issued=JSON.parse(localStorage.getItem('dk_lic_issued')||'[]');
  issued.unshift({key:pool[i].key,customer,product,program:pool[i].program,at:new Date().toISOString()});
  localStorage.setItem('dk_lic_issued',JSON.stringify(issued));
  window.toast(`License issued to ${customer}!`,'s'); navigate('licenses');
};

window.removeFromPool=function(i){const pool=JSON.parse(localStorage.getItem('dk_lic_pool')||'[]');pool.splice(i,1);localStorage.setItem('dk_lic_pool',JSON.stringify(pool));window.toast('Removed','e');navigate('licenses');};
window.clearPool=function(){if(!confirm('Clear unused keys?'))return;localStorage.setItem('dk_lic_pool',JSON.stringify(JSON.parse(localStorage.getItem('dk_lic_pool')||'[]').filter(k=>k.used)));window.toast('Cleared','e');navigate('licenses');};

window.exportLicensePool=function(){
  const pool=JSON.parse(localStorage.getItem('dk_lic_pool')||'[]');
  if(!pool.length)return window.toast('Pool empty','w');
  const csv=['Key,Program,Status,Added,Issued To'].concat(pool.map(k=>`"${k.key}","${k.program}","${k.used?'Used':'Available'}","${k.at}","${k.issuedTo||''}"`)).join('\n');
  const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);a.download='license-pool.csv';a.click();
};

window.runValidator=function(){
  const key=document.getElementById('val-key')?.value?.trim(); const prog=document.getElementById('val-prog')?.value||'standard';
  if(!key)return window.toast('Enter a key','w');
  const result=LicenseGen.validate(key,prog);
  document.getElementById('val-result').innerHTML=`
    <div style="background:${result.valid?'rgba(34,197,94,.1)':'rgba(239,68,68,.1)'};border:1px solid ${result.valid?'var(--green)':'var(--red)'};border-radius:10px;padding:14px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <i class="fas ${result.valid?'fa-check-circle':'fa-times-circle'}" style="color:${result.valid?'var(--green)':'var(--red)'};font-size:20px"></i>
        <strong style="font-size:15px">${result.valid?'Valid Key':'Invalid Key'}</strong>
      </div>
      <div style="font-size:13px;color:var(--text2)">${result.reason}</div>
    </div>`;
};

window.validateKey=function(key,prog){window._licTab='validator';navigate('licenses');setTimeout(()=>{const el=document.getElementById('val-key');if(el)el.value=key;const sel=document.getElementById('val-prog');if(sel)sel.value=prog||'standard';runValidator();},200);};

window.runBulkGenerate=function(){
  const prog=document.getElementById('bulk-prog')?.value||'standard';
  const count=parseInt(document.getElementById('bulk-count')?.value||10);
  const prefix=document.getElementById('bulk-prefix')?.value||'DK';
  const autoPool=document.getElementById('bulk-auto-pool')?.checked;
  const p=LicenseGen?.programs[prog]; if(!p)return;
  const opts={}; p.options.forEach(opt=>{opts[opt.id]=opt.default;}); opts.prefix=prefix;
  const keys=Array.from({length:count},()=>LicenseGen.generate(prog,opts,{}));
  document.getElementById('bulk-output').innerHTML=`
    <div class="card">
      <div class="card-hd"><div class="card-title">${count} Keys Generated</div>
        <div style="display:flex;gap:6px">
          <button class="btn btn-secondary btn-sm" onclick="navigator.clipboard.writeText(document.getElementById('bk').textContent);window.toast('Copied!','s')"><i class="fas fa-copy"></i>Copy All</button>
          <button class="btn btn-success btn-sm" onclick="addBulkToPool(${JSON.stringify(keys).replace(/"/g,"'")}, '${prog}')"><i class="fas fa-plus"></i>Add to Pool</button>
        </div>
      </div>
      <div id="bk" style="font-family:monospace;font-size:12px;background:var(--bg3);border-radius:9px;padding:12px;max-height:300px;overflow-y:auto;line-height:1.8;white-space:pre">${keys.join('\n')}</div>
    </div>`;
  if(autoPool){const pool=JSON.parse(localStorage.getItem('dk_lic_pool')||'[]');keys.forEach(key=>pool.push({key,program:prog,at:new Date().toISOString(),used:false}));localStorage.setItem('dk_lic_pool',JSON.stringify(pool));window.toast(`${count} keys added to pool!`,'s');}
};

window.addBulkToPool=function(keys,prog){
  const pool=JSON.parse(localStorage.getItem('dk_lic_pool')||'[]');
  keys.forEach(key=>pool.push({key,program:prog,at:new Date().toISOString(),used:false}));
  localStorage.setItem('dk_lic_pool',JSON.stringify(pool));
  window.toast(`${keys.length} keys added!`,'s'); window._licTab='pool'; navigate('licenses');
};

// Override simple key generator in subscriptions to use engine
window.generateLicenseKey=function(){
  const prog=window._licProgram||'standard';
  const key=LicenseGen?.generate(prog,{prefix:'DK',segments:4,segLen:5,charset:'SAFE_CHARS',separator:'-',checksum:'CRC8'},{});
  const el=document.getElementById('sub-license-key');
  if(el)el.value=key||'';
  else{window._lastGeneratedKeys=[key];window._lastProgram=prog;}
};
