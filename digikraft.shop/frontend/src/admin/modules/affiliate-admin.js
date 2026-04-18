
// ===== AFFILIATE ADMIN MODULE =====
window._affTab = window._affTab || 'active';
window._affiliates = [];

window.renderAffiliate = function() {
  Promise.all([
    AdminAPI.get('/v1/affiliate'),
  ]).then(([res]) => {
    window._affiliates = res.data || [];
    const el = document.getElementById('page');
    if (el) el.innerHTML = renderAffiliateHTML();
  }).catch(e => {
    const el = document.getElementById('page');
    if (el) el.innerHTML = `<div class="es"><i class="fas fa-exclamation-triangle" style="color:var(--red)"></i><p>Failed to load: ${e.message}</p></div>`;
  });
  return renderAffiliateHTML();
};

function renderAffiliateHTML() {
  const all = window._affiliates;
  const tab = window._affTab;
  const pending = all.filter(a => a.status === 'pending');
  const active = all.filter(a => a.status === 'approved');
  const suspended = all.filter(a => a.status === 'rejected');
  const payoutReady = active.filter(a => (a.pending_payout || 0) >= (a.payout_target || 1000));

  // Stats
  const totalEarned = active.reduce((s, a) => s + (a.total_earned || 0), 0);
  const totalPending = active.reduce((s, a) => s + (a.pending_payout || 0), 0);
  const totalSales = active.reduce((s, a) => s + (a.total_sales || 0), 0);

  return `
  <div class="ph">
    <div>
      <div class="ph-title">Affiliate Program</div>
      <div class="ph-sub">${active.length} active · ${pending.length} pending · ₹${totalPending.toLocaleString('en-IN')} pending payout</div>
    </div>
    <div class="ph-actions">
      <button class="btn btn-secondary" onclick="affExportCSV()"><i class="fas fa-download"></i>Export</button>
      <button class="btn btn-primary" onclick="affAddManual()"><i class="fas fa-user-plus"></i>Add Affiliate</button>
    </div>
  </div>

  <!-- Stats -->
  <div class="stats-grid" style="margin-bottom:16px">
    <div class="stat-card"><div class="si si-blue"><i class="fas fa-users"></i></div><div><div class="sv">${active.length}</div><div class="sl">Active</div></div></div>
    <div class="stat-card"><div class="si si-yellow"><i class="fas fa-clock"></i></div><div><div class="sv">${pending.length}</div><div class="sl">Pending</div></div></div>
    <div class="stat-card"><div class="si si-green"><i class="fas fa-rupee-sign"></i></div><div><div class="sv">₹${totalEarned.toLocaleString('en-IN')}</div><div class="sl">Total Earned</div></div></div>
    <div class="stat-card"><div class="si si-purple"><i class="fas fa-wallet"></i></div><div><div class="sv">₹${totalPending.toLocaleString('en-IN')}</div><div class="sl">Pending Payout</div></div></div>
  </div>

  <!-- Tabs -->
  <div class="tabs" style="margin-bottom:16px">
    <button class="tab ${tab==='active'?'on':''}" onclick="window._affTab='active';navigate('affiliate')">Active (${active.length})</button>
    <button class="tab ${tab==='pending'?'on':''}" onclick="window._affTab='pending';navigate('affiliate')">
      Requests ${pending.length>0?`<span class="nav-badge" style="background:var(--red)">${pending.length}</span>`:'(0)'}
    </button>
    <button class="tab ${tab==='payouts'?'on':''}" onclick="window._affTab='payouts';navigate('affiliate')">Payouts Ready (${payoutReady.length})</button>
    <button class="tab ${tab==='all'?'on':''}" onclick="window._affTab='all';navigate('affiliate')">All (${all.length})</button>
  </div>

  ${tab === 'pending' ? renderPendingTab(pending) : ''}
  ${tab === 'active' ? renderActiveTab(active) : ''}
  ${tab === 'payouts' ? renderPayoutsTab(payoutReady) : ''}
  ${tab === 'all' ? renderAllTab(all) : ''}`;
}

// ── PENDING REQUESTS TAB ──────────────────────────────────────────────────────
function renderPendingTab(affiliates) {
  if (!affiliates.length) return `<div class="es"><i class="fas fa-inbox"></i><p>No pending requests</p></div>`;
  return `<div style="display:flex;flex-direction:column;gap:12px">
    ${affiliates.map(a => `
    <div class="card" style="border-left:4px solid var(--yellow)">
      <div class="card-hd">
        <div style="display:flex;align-items:center;gap:12px;flex:1">
          <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,var(--accent),var(--purple));display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px;color:#fff;flex-shrink:0">${(a.name||'?')[0].toUpperCase()}</div>
          <div>
            <div style="font-size:15px;font-weight:700">${a.name}</div>
            <div style="font-size:12px;color:var(--text3)">${a.email} ${a.phone?'· '+a.phone:''}</div>
          </div>
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0">
          <button class="btn btn-success btn-sm" onclick="affApprove(${a.id})"><i class="fas fa-check"></i>Approve</button>
          <button class="btn btn-secondary btn-sm" onclick="affOpenProfile(${a.id})"><i class="fas fa-eye"></i>View</button>
          <button class="btn btn-danger btn-sm" onclick="affReject(${a.id})"><i class="fas fa-times"></i>Reject</button>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:10px">
        <div style="background:var(--bg3);border-radius:8px;padding:8px 12px">
          <div style="font-size:10px;color:var(--text3)">PROMOTION METHOD</div>
          <div style="font-size:13px;font-weight:600">${a.promotion_method||'—'}</div>
        </div>
        <div style="background:var(--bg3);border-radius:8px;padding:8px 12px">
          <div style="font-size:10px;color:var(--text3)">WEBSITE</div>
          <div style="font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${a.website||'—'}</div>
        </div>
        <div style="background:var(--bg3);border-radius:8px;padding:8px 12px">
          <div style="font-size:10px;color:var(--text3)">SOCIAL MEDIA</div>
          <div style="font-size:12px">${a.social_media||'—'}</div>
        </div>
      </div>
      ${a.notes?`<div style="margin-top:8px;font-size:12px;color:var(--text2);padding:8px 12px;background:var(--bg3);border-radius:8px">"${a.notes}"</div>`:''}
      <div style="font-size:11px;color:var(--text3);margin-top:8px">Applied: ${new Date(a.applied_at||a.created_at).toLocaleDateString('en-IN')}</div>
    </div>`).join('')}
  </div>`;
}

// ── ACTIVE AFFILIATES TAB ─────────────────────────────────────────────────────
function renderActiveTab(affiliates) {
  if (!affiliates.length) return `<div class="es"><i class="fas fa-handshake"></i><p>No active affiliates yet</p></div>`;
  return `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px">
    ${affiliates.map(a => renderAffiliateCard(a)).join('')}
  </div>`;
}

function renderAffiliateCard(a) {
  const tier = a.tier_info || { name: 'Bronze', color: '#cd7f32', icon: '🥉' };
  const progress = Math.min(100, Math.round(((a.pending_payout||0) / (a.payout_target||1000)) * 100));
  const progressColor = progress >= 100 ? 'var(--green)' : progress >= 60 ? 'var(--yellow)' : 'var(--accent)';
  return `
  <div class="card" style="cursor:pointer;transition:.2s" onclick="affOpenProfile(${a.id})" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
      <div style="width:42px;height:42px;border-radius:11px;background:linear-gradient(135deg,var(--accent),var(--purple));display:flex;align-items:center;justify-content:center;font-weight:800;font-size:17px;color:#fff;flex-shrink:0">${(a.name||'?')[0].toUpperCase()}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${a.name}</div>
        <div style="font-size:11px;color:var(--text3)">${a.email}</div>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <div style="font-size:11px;font-weight:700;color:${tier.color}">${tier.icon} ${tier.name}</div>
        <div style="font-size:10px;color:var(--text3)">${a.commission_rate}% rate</div>
      </div>
    </div>
    <!-- Stats row -->
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:10px">
      <div style="text-align:center;padding:6px;background:var(--bg3);border-radius:7px">
        <div style="font-size:16px;font-weight:800;color:var(--accent)">${a.total_clicks||0}</div>
        <div style="font-size:9px;color:var(--text3)">Clicks</div>
      </div>
      <div style="text-align:center;padding:6px;background:var(--bg3);border-radius:7px">
        <div style="font-size:16px;font-weight:800;color:var(--green)">${a.total_sales||0}</div>
        <div style="font-size:9px;color:var(--text3)">Sales</div>
      </div>
      <div style="text-align:center;padding:6px;background:var(--bg3);border-radius:7px">
        <div style="font-size:14px;font-weight:800;color:var(--purple)">₹${(a.total_earned||0).toLocaleString('en-IN')}</div>
        <div style="font-size:9px;color:var(--text3)">Earned</div>
      </div>
    </div>
    <!-- Payout progress -->
    <div style="margin-bottom:8px">
      <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px">
        <span style="color:var(--text3)">Payout Progress</span>
        <span style="font-weight:700;color:${progressColor}">₹${(a.pending_payout||0).toLocaleString('en-IN')} / ₹${(a.payout_target||1000).toLocaleString('en-IN')}</span>
      </div>
      <div style="background:var(--border);border-radius:99px;height:6px">
        <div style="background:${progressColor};height:6px;border-radius:99px;width:${progress}%;transition:.3s"></div>
      </div>
    </div>
    <!-- Code + actions -->
    <div style="display:flex;align-items:center;justify-content:space-between">
      <code style="background:var(--bg3);padding:3px 8px;border-radius:6px;font-size:11px;color:var(--accent)">${a.code}</code>
      <div style="display:flex;gap:4px" onclick="event.stopPropagation()">
        ${progress >= 100 ? `<button class="btn btn-success btn-sm btn-icon" onclick="affMarkPayout(${a.id})" title="Mark payout done"><i class="fas fa-money-bill-wave"></i></button>` : ''}
        <button class="btn btn-secondary btn-sm btn-icon" onclick="affOpenProfile(${a.id})" title="Full profile"><i class="fas fa-id-card"></i></button>
        <button class="btn btn-danger btn-sm btn-icon" onclick="affSuspend(${a.id})" title="Suspend"><i class="fas fa-ban"></i></button>
      </div>
    </div>
  </div>`;
}

// ── PAYOUTS TAB ───────────────────────────────────────────────────────────────
function renderPayoutsTab(affiliates) {
  if (!affiliates.length) return `<div class="es"><i class="fas fa-wallet"></i><p>No affiliates have reached their payout target yet</p></div>`;
  return `
  <div style="background:rgba(16,185,129,.08);border:1px solid var(--green);border-radius:10px;padding:12px 16px;margin-bottom:16px;font-size:13px">
    <strong>💰 ${affiliates.length} affiliate(s) ready for payout</strong> — Total: ₹${affiliates.reduce((s,a)=>s+(a.pending_payout||0),0).toLocaleString('en-IN')}
  </div>
  <div class="card"><div class="tw"><table>
    <thead><tr><th>Affiliate</th><th>Code</th><th>Pending</th><th>Target</th><th>UPI / Bank</th><th>Actions</th></tr></thead>
    <tbody>
      ${affiliates.map(a => `<tr>
        <td><div style="display:flex;align-items:center;gap:8px">
          <div style="width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,var(--accent),var(--purple));display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;color:#fff">${(a.name||'?')[0].toUpperCase()}</div>
          <div><div style="font-size:13px;font-weight:700">${a.name}</div><div style="font-size:11px;color:var(--text3)">${a.email}</div></div>
        </div></td>
        <td><code style="background:var(--bg3);padding:2px 7px;border-radius:5px;font-size:11px">${a.code}</code></td>
        <td><strong style="color:var(--green);font-size:15px">₹${(a.pending_payout||0).toLocaleString('en-IN')}</strong></td>
        <td style="font-size:12px;color:var(--text2)">₹${(a.payout_target||1000).toLocaleString('en-IN')}</td>
        <td style="font-size:12px">${a.upi_id||a.bank_details||'<span style="color:var(--red)">Not set</span>'}</td>
        <td><div style="display:flex;gap:5px">
          <button class="btn btn-success btn-sm" onclick="affMarkPayout(${a.id})"><i class="fas fa-check"></i>Mark Paid</button>
          <button class="btn btn-secondary btn-sm btn-icon" onclick="affOpenProfile(${a.id})"><i class="fas fa-eye"></i></button>
        </div></td>
      </tr>`).join('')}
    </tbody>
  </table></div></div>`;
}

// ── ALL TAB ───────────────────────────────────────────────────────────────────
function renderAllTab(affiliates) {
  return `<div class="card"><div class="tw"><table>
    <thead><tr><th>Affiliate</th><th>Code</th><th>Status</th><th>Tier</th><th>Sales</th><th>Earned</th><th>Pending</th><th>Actions</th></tr></thead>
    <tbody>
      ${affiliates.map(a => {
        const tier = a.tier_info || { name: 'Bronze', color: '#cd7f32', icon: '🥉' };
        return `<tr>
          <td><div style="display:flex;align-items:center;gap:8px">
            <div style="width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,var(--accent),var(--purple));display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;color:#fff">${(a.name||'?')[0].toUpperCase()}</div>
            <div><div style="font-size:13px;font-weight:700">${a.name}</div><div style="font-size:11px;color:var(--text3)">${a.email}</div></div>
          </div></td>
          <td><code style="background:var(--bg3);padding:2px 7px;border-radius:5px;font-size:11px">${a.code}</code></td>
          <td><span class="tag ${a.status==='approved'?'tg':a.status==='pending'?'ty':'tr'}" style="font-size:10px">${a.status}</span></td>
          <td style="font-size:12px;color:${tier.color};font-weight:700">${tier.icon} ${tier.name}</td>
          <td><strong>${a.total_sales||0}</strong></td>
          <td style="color:var(--green)">₹${(a.total_earned||0).toLocaleString('en-IN')}</td>
          <td style="color:var(--yellow)">₹${(a.pending_payout||0).toLocaleString('en-IN')}</td>
          <td><div style="display:flex;gap:4px">
            <button class="btn btn-sm btn-primary btn-icon" onclick="affOpenProfile(${a.id})"><i class="fas fa-id-card"></i></button>
            ${a.status==='pending'?`<button class="btn btn-sm btn-success btn-icon" onclick="affApprove(${a.id})"><i class="fas fa-check"></i></button>`:''}
          </div></td>
        </tr>`;
      }).join('')}
    </tbody>
  </table></div></div>`;
}

// ── FULL PROFILE MODAL ────────────────────────────────────────────────────────
window.affOpenProfile = async function(id) {
  const overlay = document.createElement('div');
  overlay.id = 'aff-profile-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:600;display:flex;align-items:flex-start;justify-content:center;padding:20px;overflow-y:auto';
  overlay.innerHTML = `<div style="background:var(--bg2);border-radius:16px;padding:40px;text-align:center;margin-top:80px"><div style="width:32px;height:32px;border:3px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 12px"></div><div style="color:var(--text2)">Loading profile...</div></div>`;
  document.body.appendChild(overlay);

  try {
    const res = await AdminAPI.get('/v1/affiliate/' + id);
    const a = res.data;
    const tier = a.tier_info || { name: 'Bronze', color: '#cd7f32', icon: '🥉' };
    const progress = a.payout_progress || 0;
    const progressColor = progress >= 100 ? 'var(--green)' : progress >= 60 ? 'var(--yellow)' : 'var(--accent)';

    overlay.innerHTML = `
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:16px;width:100%;max-width:860px;margin:0 auto">

      <!-- HEADER -->
      <div style="padding:20px 24px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:var(--bg2);z-index:10;border-radius:16px 16px 0 0">
        <div style="display:flex;align-items:center;gap:14px">
          <div style="width:52px;height:52px;border-radius:14px;background:linear-gradient(135deg,var(--accent),var(--purple));display:flex;align-items:center;justify-content:center;font-weight:900;font-size:22px;color:#fff">${(a.name||'?')[0].toUpperCase()}</div>
          <div>
            <div style="font-size:20px;font-weight:800">${a.name||'Unknown'}</div>
            <div style="font-size:12px;color:var(--text3);display:flex;align-items:center;gap:8px;flex-wrap:wrap">
              <span>${a.email||'—'}</span>
              ${a.phone?`<span>· ${a.phone}</span>`:''}
              <span class="tag ${a.status==='approved'?'tg':a.status==='pending'?'ty':'tr'}" style="font-size:10px">${a.status}</span>
              <span style="font-size:11px;font-weight:700;color:${tier.color}">${tier.icon} ${tier.name}</span>
            </div>
          </div>
        </div>
        <div style="display:flex;gap:8px;flex-shrink:0">
          ${a.status==='approved'?`<button class="btn btn-danger btn-sm" onclick="affSuspend(${a.id})"><i class="fas fa-ban"></i>Suspend</button>`:''}
          ${a.status==='pending'?`<button class="btn btn-success btn-sm" onclick="affApprove(${a.id})"><i class="fas fa-check"></i>Approve</button>`:''}
          ${a.status==='rejected'?`<button class="btn btn-success btn-sm" onclick="affReactivate(${a.id})"><i class="fas fa-redo"></i>Reactivate</button>`:''}
          <button onclick="document.getElementById('aff-profile-overlay').remove()" style="background:var(--bg3);border:none;border-radius:8px;width:32px;height:32px;cursor:pointer;color:var(--text2);font-size:16px">×</button>
        </div>
      </div>

      <div style="padding:20px 24px;display:grid;grid-template-columns:1fr 1fr;gap:16px">

        <!-- STATS -->
        <div class="card">
          <div class="card-hd"><div class="card-title"><i class="fas fa-chart-bar" style="color:var(--accent)"></i>Performance</div></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            ${[
              ['Total Clicks', a.total_clicks||0, 'var(--blue)'],
              ['Total Sales', a.total_sales||0, 'var(--green)'],
              ['Total Earned', '₹'+(a.total_earned||0).toLocaleString('en-IN'), 'var(--purple)'],
              ['Pending Payout', '₹'+(a.pending_payout||0).toLocaleString('en-IN'), 'var(--yellow)'],
              ['Paid Out', '₹'+(a.paid_out||0).toLocaleString('en-IN'), 'var(--green)'],
              ['Commission Rate', a.commission_rate+'%', 'var(--accent)']
            ].map(([label,val,color]) => `
            <div style="padding:8px 10px;background:var(--bg3);border-radius:8px">
              <div style="font-size:10px;color:var(--text3)">${label}</div>
              <div style="font-size:16px;font-weight:800;color:${color}">${val}</div>
            </div>`).join('')}
          </div>
        </div>

        <!-- SETTINGS -->
        <div class="card">
          <div class="card-hd"><div class="card-title"><i class="fas fa-cog" style="color:var(--text2)"></i>Settings</div></div>
          <div class="fg"><label class="fl">Commission Rate (%)</label>
            <input class="fc" id="aff-rate-${a.id}" type="number" value="${a.commission_rate||10}" min="1" max="50">
          </div>
          <div class="fg"><label class="fl">Payout Target (₹)</label>
            <input class="fc" id="aff-target-${a.id}" type="number" value="${a.payout_target||1000}" min="100">
          </div>
          <div class="fg"><label class="fl">Admin Notes</label>
            <textarea class="fc" id="aff-notes-${a.id}" rows="2" placeholder="Internal notes...">${a.notes||''}</textarea>
          </div>
          <button class="btn btn-primary btn-sm" style="width:100%" onclick="affUpdateSettings(${a.id})"><i class="fas fa-save"></i>Save Settings</button>
          <!-- Payout progress -->
          <div style="margin-top:12px">
            <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px">
              <span style="color:var(--text3)">Payout Progress</span>
              <span style="font-weight:700;color:${progressColor}">${progress}%</span>
            </div>
            <div style="background:var(--border);border-radius:99px;height:6px">
              <div style="background:${progressColor};height:6px;border-radius:99px;width:${Math.min(100,progress)}%;transition:.3s"></div>
            </div>
            <div style="font-size:11px;color:var(--text3);margin-top:4px">₹${(a.pending_payout||0).toLocaleString('en-IN')} / ₹${(a.payout_target||1000).toLocaleString('en-IN')}</div>
          </div>
          ${progress >= 100 ? `<button class="btn btn-success btn-sm" style="width:100%;margin-top:8px" onclick="affMarkPayout(${a.id})"><i class="fas fa-money-bill-wave"></i>Mark Payout Done</button>` : ''}
        </div>

        <!-- PAYMENT DETAILS — shows UPI saved by user -->
        <div class="card" style="grid-column:span 2;border:2px solid ${a.upi_id?'var(--green)':'var(--border)'}">
          <div class="card-hd">
            <div class="card-title"><i class="fas fa-university" style="color:var(--purple)"></i>Payment Details (for payout)</div>
            ${a.upi_id?`<span class="tag tg" style="font-size:11px">✓ UPI Set</span>`:`<span class="tag ty" style="font-size:11px">⚠ Not set by user</span>`}
          </div>
          <!-- Read-only display of what user saved -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
            <div>
              <div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:6px">UPI ID (saved by user)</div>
              <div style="padding:12px 16px;background:var(--bg3);border-radius:9px;font-family:monospace;font-size:15px;font-weight:700;color:${a.upi_id?'var(--green)':'var(--text3)'}">
                ${a.upi_id||'Not provided yet'}
              </div>
            </div>
            <div>
              <div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:6px">Bank Details (saved by user)</div>
              <div style="padding:12px 16px;background:var(--bg3);border-radius:9px;font-size:12px;min-height:44px;color:${a.bank_details?'var(--text)':'var(--text3)'}">
                ${a.bank_details||'Not provided yet'}
              </div>
            </div>
          </div>
          <!-- Admin can also update payment details -->
          <div style="padding-top:12px;border-top:1px solid var(--border)">
            <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:10px">Admin Override — Update Payment Details</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
              <div class="fg"><label class="fl">UPI ID</label>
                <input class="fc" id="aff-upi-${a.id}" value="${a.upi_id||''}" placeholder="name@upi or 9999999999@paytm">
              </div>
              <div class="fg"><label class="fl">Bank Details</label>
                <textarea class="fc" id="aff-bank-${a.id}" rows="2" placeholder="Account no, IFSC, Bank name...">${a.bank_details||''}</textarea>
              </div>
            </div>
            <button class="btn btn-primary btn-sm" style="margin-top:8px" onclick="affSavePaymentDetails(${a.id})"><i class="fas fa-save"></i>Save Payment Details</button>
          </div>
        </div>

        <!-- SALES HISTORY -->
        <div class="card" style="grid-column:span 2">
          <div class="card-hd"><div class="card-title"><i class="fas fa-history" style="color:var(--accent)"></i>Sales History (${(a.conversions||[]).filter(c=>c.type==='sale').length} conversions)</div></div>
          ${(a.conversions||[]).filter(c=>c.type==='sale').length ? `
          <div class="tw"><table>
            <thead><tr><th>Order ID</th><th>Sale Amount</th><th>Commission</th><th>Date</th></tr></thead>
            <tbody>
              ${(a.conversions||[]).filter(c=>c.type==='sale').map(c=>`<tr>
                <td style="font-size:12px;font-family:monospace">${c.order_id||'—'}</td>
                <td>₹${(c.order_total||0).toLocaleString('en-IN')}</td>
                <td><strong style="color:var(--green)">+₹${(c.commission||0).toLocaleString('en-IN')}</strong></td>
                <td style="font-size:11px;color:var(--text2)">${new Date(c.created_at).toLocaleDateString('en-IN')}</td>
              </tr>`).join('')}
            </tbody>
          </table></div>` : '<div style="text-align:center;padding:20px;color:var(--text3)">No sales yet</div>'}
        </div>

        <!-- REFERRAL INFO -->
        <div class="card" style="grid-column:span 2">
          <div class="card-hd"><div class="card-title"><i class="fas fa-link" style="color:var(--blue)"></i>Referral Info</div></div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
            <div>
              <div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:6px">REFERRAL CODE</div>
              <code style="background:var(--bg3);padding:8px 14px;border-radius:8px;font-size:14px;color:var(--accent);display:block">${a.code}</code>
            </div>
            <div>
              <div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:6px">PROMOTION METHOD</div>
              <div style="padding:8px 14px;background:var(--bg3);border-radius:8px;font-size:13px">${a.promotion_method||'—'}</div>
            </div>
            <div>
              <div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:6px">WEBSITE / SOCIAL</div>
              <div style="padding:8px 14px;background:var(--bg3);border-radius:8px;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${a.website||a.social_media||'—'}</div>
            </div>
          </div>
          ${a.notes?`<div style="margin-top:10px;padding:10px 14px;background:var(--bg3);border-radius:8px;font-size:12px;color:var(--text2)">"${a.notes}"</div>`:''}
          <div style="margin-top:10px;font-size:11px;color:var(--text3)">
            Applied: ${new Date(a.applied_at||a.created_at).toLocaleDateString('en-IN')}
            ${a.approved_at?` · Approved: ${new Date(a.approved_at).toLocaleDateString('en-IN')}`:''}
          </div>
        </div>

      </div>
    </div>`;
  } catch (e) {
    overlay.innerHTML = `<div style="background:var(--bg2);border-radius:16px;padding:40px;text-align:center;color:var(--red);margin-top:80px"><i class="fas fa-exclamation-triangle" style="font-size:32px;display:block;margin-bottom:12px"></i>Failed: ${e.message}<br><button class="btn btn-secondary" style="margin-top:16px" onclick="document.getElementById('aff-profile-overlay').remove()">Close</button></div>`;
  }
};

// ── ACTIONS ───────────────────────────────────────────────────────────────────
window.affApprove = async function(id) {
  const rate = prompt('Commission rate (%):', '10');
  if (!rate) return;
  const target = prompt('Payout target (₹):', '1000');
  if (!target) return;
  try {
    const res = await AdminAPI.put(`/v1/affiliate/${id}/status`, { status: 'approved', commission_rate: parseFloat(rate), payout_target: parseFloat(target) });
    if (res.success) { toast('Affiliate approved!', 's'); document.getElementById('aff-profile-overlay')?.remove(); navigate('affiliate'); }
    else toast('Failed: ' + res.error, 'e');
  } catch (e) { toast('Error: ' + e.message, 'e'); }
};

window.affReject = async function(id) {
  if (!confirm('Reject this application?')) return;
  try {
    await AdminAPI.put(`/v1/affiliate/${id}/status`, { status: 'rejected' });
    toast('Application rejected', 'w');
    document.getElementById('aff-profile-overlay')?.remove();
    navigate('affiliate');
  } catch (e) { toast('Error: ' + e.message, 'e'); }
};

window.affSuspend = async function(id) {
  if (!confirm('Suspend this affiliate?')) return;
  try {
    await AdminAPI.put(`/v1/affiliate/${id}/status`, { status: 'rejected' });
    toast('Affiliate suspended', 'w');
    document.getElementById('aff-profile-overlay')?.remove();
    navigate('affiliate');
  } catch (e) { toast('Error: ' + e.message, 'e'); }
};

window.affReactivate = async function(id) {
  try {
    await AdminAPI.put(`/v1/affiliate/${id}/status`, { status: 'approved' });
    toast('Affiliate reactivated!', 's');
    document.getElementById('aff-profile-overlay')?.remove();
    navigate('affiliate');
  } catch (e) { toast('Error: ' + e.message, 'e'); }
};

window.affMarkPayout = async function(id) {
  const aff = window._affiliates.find(a => a.id === id);
  const amount = aff?.pending_payout || 0;
  if (!confirm(`Mark payout of ₹${amount.toLocaleString('en-IN')} as done?`)) return;
  try {
    const res = await AdminAPI.put(`/v1/affiliate/${id}/payout`, {});
    if (res.success) { toast(res.message, 's'); document.getElementById('aff-profile-overlay')?.remove(); navigate('affiliate'); }
    else toast('Failed: ' + res.error, 'e');
  } catch (e) { toast('Error: ' + e.message, 'e'); }
};

window.affUpdateSettings = async function(id) {
  const rate = document.getElementById(`aff-rate-${id}`)?.value;
  const target = document.getElementById(`aff-target-${id}`)?.value;
  const notes = document.getElementById(`aff-notes-${id}`)?.value;
  try {
    await AdminAPI.put(`/v1/affiliate/${id}`, {
      commission_rate: parseFloat(rate),
      payout_target: parseFloat(target),
      notes
    });
    toast('Settings saved!', 's');
  } catch (e) { toast('Error: ' + e.message, 'e'); }
};

window.affSavePaymentDetails = async function(id) {
  const upi = document.getElementById(`aff-upi-${id}`)?.value;
  const bank = document.getElementById(`aff-bank-${id}`)?.value;
  try {
    await AdminAPI.put(`/v1/affiliate/${id}`, { upi_id: upi, bank_details: bank });
    toast('Payment details saved!', 's');
  } catch (e) { toast('Error: ' + e.message, 'e'); }
};

window.affAddManual = function() {
  const overlay = document.createElement('div');
  overlay.id = 'aff-add-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:600;display:flex;align-items:center;justify-content:center;padding:16px';
  overlay.innerHTML = `
  <div style="background:var(--bg2);border:1px solid var(--border);border-radius:14px;width:100%;max-width:440px;padding:24px">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
      <div><div style="font-size:16px;font-weight:800">Add Affiliate Manually</div><div style="font-size:12px;color:var(--text3)">Directly approve a registered user</div></div>
      <button onclick="document.getElementById('aff-add-overlay').remove()" style="background:var(--bg3);border:none;border-radius:7px;width:28px;height:28px;cursor:pointer;color:var(--text2)">×</button>
    </div>
    <div class="fg"><label class="fl">User Email *</label><input class="fc" id="aff-add-email" placeholder="user@example.com" type="email"></div>
    <div class="fg"><label class="fl">Commission Rate (%)</label><input class="fc" id="aff-add-rate" type="number" value="10" min="1" max="50"></div>
    <div class="fg"><label class="fl">Payout Target (₹)</label><input class="fc" id="aff-add-target" type="number" value="1000" min="100"></div>
    <div id="aff-add-result" style="display:none;margin-bottom:12px;padding:10px;border-radius:8px;font-size:13px"></div>
    <button class="btn btn-primary" style="width:100%" onclick="affAddManualSubmit()"><i class="fas fa-user-plus"></i>Add as Affiliate</button>
  </div>`;
  document.body.appendChild(overlay);
};

window.affAddManualSubmit = async function() {
  const email = document.getElementById('aff-add-email')?.value?.trim();
  const rate = document.getElementById('aff-add-rate')?.value;
  const target = document.getElementById('aff-add-target')?.value;
  const resultEl = document.getElementById('aff-add-result');
  if (!email) { toast('Enter an email', 'w'); return; }
  try {
    const res = await AdminAPI.post('/v1/affiliate/add', { email, commission_rate: parseFloat(rate), payout_target: parseFloat(target) });
    if (res.success) {
      if (resultEl) { resultEl.style.display='block'; resultEl.style.background='rgba(16,185,129,.1)'; resultEl.style.border='1px solid var(--green)'; resultEl.innerHTML=`✓ ${res.message}`; }
      toast(res.message, 's');
      setTimeout(() => { document.getElementById('aff-add-overlay')?.remove(); navigate('affiliate'); }, 1500);
    } else {
      if (resultEl) { resultEl.style.display='block'; resultEl.style.background='rgba(239,68,68,.1)'; resultEl.style.border='1px solid var(--red)'; resultEl.innerHTML=`✗ ${res.error}`; }
    }
  } catch (e) { toast('Error: ' + e.message, 'e'); }
};

window.affExportCSV = async function() {
  try {
    const res = await AdminAPI.get('/v1/affiliate');
    const affiliates = res.data || [];
    const csv = ['Name,Email,Code,Status,Tier,Sales,Earned,Pending,UPI,Joined'].concat(
      affiliates.map(a => `"${a.name}","${a.email}","${a.code}","${a.status}","${a.tier||'Bronze'}","${a.total_sales||0}","${a.total_earned||0}","${a.pending_payout||0}","${a.upi_id||''}","${a.created_at||''}"`)
    ).join('\n');
    const el = document.createElement('a');
    el.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    el.download = `affiliates-${new Date().toISOString().slice(0,10)}.csv`;
    el.click();
    toast('Exported!', 's');
  } catch (e) { toast('Export failed', 'e'); }
};
