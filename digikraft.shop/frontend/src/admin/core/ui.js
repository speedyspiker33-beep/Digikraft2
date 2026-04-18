// ============================================================
// CORE UI UTILITIES
// ============================================================

export function toast(msg, type = 'success') {
  const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle', warn: 'fa-exclamation-triangle' };
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${msg}</span>`;
  document.getElementById('toast-container').appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3200);
}

export function openModal(id) { document.getElementById(id)?.classList.add('open'); }
export function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }

export function confirm2(msg) { return window.confirm(msg); }

export function formatCurrency(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN');
}

export function formatDate(d) {
  return new Date(d || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function tabs(items, activeId, onClickFn) {
  return `<div class="tab-bar">${items.map(t =>
    `<button class="tab-btn ${t.id === activeId ? 'active' : ''}" onclick="${onClickFn}('${t.id}')">${t.label}</button>`
  ).join('')}</div>`;
}

export function badge(text, color = 'purple') {
  return `<span class="tag tag-${color}">${text}</span>`;
}

export function emptyState(icon, msg, action = '') {
  return `<div class="empty-state"><i class="fas ${icon}"></i><p>${msg}</p>${action}</div>`;
}

export function updateSidebarCounts() {
  const { State } = window.AdminCore;
  const el = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
  el('cnt-products', State.products.length);
  el('cnt-orders', State.orders.filter(o => o.status === 'pending').length);
  el('cnt-customers', State.customers.length);
}
