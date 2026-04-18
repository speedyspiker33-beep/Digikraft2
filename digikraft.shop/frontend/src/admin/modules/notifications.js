// ===== NOTIFICATIONS MODULE =====
// Syncs with backend API (port 8080) and falls back to localStorage
window.Notifications = (() => {
  const KEY = 'dk_notifs';
  const get = () => JSON.parse(localStorage.getItem(KEY) || '[]');
  const save = v => localStorage.setItem(KEY, JSON.stringify(v));

  // Fetch from backend and merge with local
  async function syncFromBackend() {
    try {
      const data = await AdminAPI.getNotifications({ limit: 50 });
      if (data.success && data.data) {
        const backendNotifs = data.data.map(n => ({
          id: n._id || n.id || String(n.created_at),
          msg: n.message || n.title,
          type: n.type === 'new_order' ? 'success' : n.type === 'product_created' ? 'info' : 'info',
          link: '',
          read: !!n.read,
          at: n.created_at
        }));
        // Merge: backend notifs take precedence, keep local-only ones
        const localNotifs = get();
        const backendIds = new Set(backendNotifs.map(n => n.id));
        const localOnly = localNotifs.filter(n => !backendIds.has(n.id));
        const merged = [...backendNotifs, ...localOnly].slice(0, 100);
        save(merged);
        updateBadge();
        return merged;
      }
    } catch (e) {
      // Backend not available, use localStorage only
    }
    return get();
  }

  function add(msg, type = 'info', link = '') {
    const notifs = get();
    notifs.unshift({ id: Date.now().toString(), msg, type, link, read: false, at: new Date().toISOString() });
    if (notifs.length > 100) notifs.pop();
    save(notifs);
    updateBadge();
    if (window.toast) window.toast(msg, type === 'error' ? 'e' : type === 'success' ? 's' : 'i');
  }

  function markRead(id) {
    const n = get(); const item = n.find(x => x.id === id);
    if (item) { item.read = true; save(n); updateBadge(); }
  }

  async function markAllRead() {
    const n = get(); n.forEach(x => x.read = true); save(n); updateBadge();
    try { await AdminAPI.markAllRead(); } catch (e) {}
  }

  function clear() { save([]); updateBadge(); }

  function updateBadge() {
    const count = get().filter(n => !n.read).length;
    const badge = document.getElementById('notif-badge');
    if (badge) { badge.textContent = count; badge.style.display = count ? 'flex' : 'none'; }
  }

  function renderPanel() {
    const notifs = get();
    return `
    <div style="position:fixed;top:58px;right:12px;width:340px;background:var(--bg2);border:1px solid var(--border);border-radius:14px;box-shadow:var(--shadow);z-index:500;max-height:480px;display:flex;flex-direction:column" id="notif-panel">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid var(--border)">
        <strong style="font-size:14px">Notifications</strong>
        <div style="display:flex;gap:8px">
          <button class="btn btn-secondary btn-sm" onclick="Notifications.markAllRead().then(()=>renderNotifPanel())">Mark all read</button>
          <button class="btn btn-danger btn-sm" onclick="Notifications.clear();renderNotifPanel()">Clear</button>
          <button onclick="document.getElementById('notif-panel').remove()" style="background:none;border:none;color:var(--text2);font-size:16px;cursor:pointer">×</button>
        </div>
      </div>
      <div style="overflow-y:auto;flex:1">
        ${notifs.length ? notifs.map(n => `
        <div onclick="Notifications.markRead('${n.id}');renderNotifPanel()" style="padding:12px 16px;border-bottom:1px solid var(--border);cursor:pointer;background:${n.read ? 'transparent' : 'rgba(99,102,241,.06)'};transition:.15s" onmouseover="this.style.background='var(--bg3)'" onmouseout="this.style.background='${n.read ? 'transparent' : 'rgba(99,102,241,.06)'}'">
          <div style="display:flex;align-items:flex-start;gap:10px">
            <div style="width:8px;height:8px;border-radius:50%;background:${n.read ? 'var(--text3)' : 'var(--accent)'};margin-top:5px;flex-shrink:0"></div>
            <div style="flex:1">
              <div style="font-size:13px">${n.msg}</div>
              <div style="font-size:11px;color:var(--text3);margin-top:3px">${window.fmtDate ? window.fmtDate(n.at) : n.at}</div>
            </div>
          </div>
        </div>`).join('') : '<div style="text-align:center;padding:40px;color:var(--text3)"><i class="fas fa-bell-slash" style="font-size:32px;display:block;margin-bottom:10px"></i>No notifications</div>'}
      </div>
    </div>`;
  }

  return { add, markRead, markAllRead, clear, updateBadge, renderPanel, get, syncFromBackend };
})();

window.renderNotifPanel = async function() {
  document.getElementById('notif-panel')?.remove();
  // Sync from backend first, then render
  await Notifications.syncFromBackend();
  document.body.insertAdjacentHTML('beforeend', Notifications.renderPanel());
};
