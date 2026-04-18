// ===== ACTIVITY LOG MODULE =====
window.ActivityLog = (() => {
  const KEY = 'dk_activity';
  const get = () => JSON.parse(localStorage.getItem(KEY) || '[]');
  const save = v => localStorage.setItem(KEY, JSON.stringify(v));

  function log(action, entity, details = '', user = 'Admin') {
    const logs = get();
    logs.unshift({ id: Date.now().toString(), action, entity, details, user, at: new Date().toISOString() });
    if (logs.length > 500) logs.pop();
    save(logs);
  }

  function render(limit = 50) {
    const logs = get().slice(0, limit);
    const icons = {
      create: { icon: 'fa-plus-circle', color: 'var(--green)' },
      update: { icon: 'fa-edit', color: 'var(--blue)' },
      delete: { icon: 'fa-trash', color: 'var(--red)' },
      assign: { icon: 'fa-truck', color: 'var(--yellow)' },
      login: { icon: 'fa-sign-in-alt', color: 'var(--accent)' },
      export: { icon: 'fa-download', color: 'var(--purple)' },
      publish: { icon: 'fa-rocket', color: 'var(--green)' },
      payment: { icon: 'fa-rupee-sign', color: 'var(--green)' },
    };
    return `
    <div class="ph">
      <div><div class="ph-title">Activity Log</div><div class="ph-sub">${logs.length} recent actions</div></div>
      <div class="ph-actions">
        <button class="btn btn-danger btn-sm" onclick="ActivityLog.clear();navigate('activity')"><i class="fas fa-trash"></i>Clear Log</button>
        <button class="btn btn-secondary" onclick="ActivityLog.exportLog()"><i class="fas fa-download"></i>Export</button>
      </div>
    </div>
    <div class="card">
      ${logs.length ? `
      <div style="display:flex;flex-direction:column">
        ${logs.map(l => {
          const ic = icons[l.action] || { icon: 'fa-circle', color: 'var(--text3)' };
          return `
          <div style="display:flex;align-items:flex-start;gap:12px;padding:11px 0;border-bottom:1px solid var(--border)">
            <div style="width:34px;height:34px;border-radius:9px;background:rgba(99,102,241,.1);display:flex;align-items:center;justify-content:center;flex-shrink:0">
              <i class="fas ${ic.icon}" style="color:${ic.color};font-size:13px"></i>
            </div>
            <div style="flex:1">
              <div style="font-size:13px"><strong style="color:var(--accent)">${l.user}</strong> ${l.action} <strong>${l.entity}</strong>${l.details ? ` — ${l.details}` : ''}</div>
              <div style="font-size:11px;color:var(--text3);margin-top:2px">${new Date(l.at).toLocaleString('en-IN')}</div>
            </div>
          </div>`;
        }).join('')}
      </div>` : '<div class="es"><i class="fas fa-history"></i><p>No activity recorded yet</p></div>'}
    </div>`;
  }

  function clear() { save([]); }

  function exportLog() {
    const logs = get();
    const csv = ['Action,Entity,Details,User,Time', ...logs.map(l => `"${l.action}","${l.entity}","${l.details}","${l.user}","${l.at}"`)].join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'activity-log.csv'; a.click();
  }

  return { log, render, clear, exportLog, get };
})();
