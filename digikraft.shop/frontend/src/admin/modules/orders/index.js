// ============================================================
// MODULE: ORDERS
// ============================================================
let _tab = 'all';

export function render() {
  const { State, UI } = window.AdminCore;
  let orders = State.orders;

  const search = document.getElementById('ord-search')?.value || '';
  if (search) orders = orders.filter(o =>
    String(o.id).includes(search) || (o.customer || '').toLowerCase().includes(search.toLowerCase())
  );
  if (_tab !== 'all') orders = orders.filter(o => (o.status || 'pending') === _tab);

  const counts = { all: State.orders.length };
  ['pending', 'processing', 'completed', 'cancelled'].forEach(s => {
    counts[s] = State.orders.filter(o => (o.status || 'pending') === s).length;
  });

  return `
  <div class="page-header">
    <div>
      <div class="page-title">Orders</div>
      <div class="page-subtitle">${counts.all} total · ${counts.pending} pending · ${counts.completed} completed</div>
    </div>
    <div class="header-actions">
      <button class="btn btn-secondary" onclick="window.AdminModules.orders.exportCSV()">
        <i class="fas fa-download"></i> Export
      </button>
      <button class="btn btn-primary" onclick="window.AdminModules.orders.openAdd()">
        <i class="fas fa-plus"></i> Manual Order
      </button>
    </div>
  </div>

  <!-- SEGMENT TABS -->
  <div class="tab-bar" style="margin-bottom:16px">
    ${segTab('all', `All (${counts.all})`)}
    ${segTab('pending', `Pending (${counts.pending})`)}
    ${segTab('processing', `Processing (${counts.processing})`)}
    ${segTab('completed', `Completed (${counts.completed})`)}
    ${segTab('cancelled', `Cancelled (${counts.cancelled})`)}
  </div>

  <!-- STATS ROW -->
  <div class="stats-grid" style="margin-bottom:20px">
    ${miniStat('fa-rupee-sign', 'purple', UI.formatCurrency(State.orders.reduce((s,o)=>s+(o.total||0),0)), 'Total Revenue')}
    ${miniStat('fa-clock', 'yellow', counts.pending, 'Pending')}
    ${miniStat('fa-check-circle', 'green', counts.completed, 'Completed')}
    ${miniStat('fa-times-circle', 'red', counts.cancelled, 'Cancelled')}
  </div>

  <div class="card">
    <div class="table-toolbar">
      <div class="table-search">
        <i class="fas fa-search"></i>
        <input type="text" id="ord-search" placeholder="Search by order ID or customer..." oninput="window.AdminApp.render()" value="${search}">
      </div>
    </div>
    ${orders.length ? `
    <div class="table-wrap"><table>
      <thead>
        <tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th>Actions</th></tr>
      </thead>
      <tbody>
        ${orders.map(o => `
        <tr>
          <td><strong>#${o.id}</strong></td>
          <td>
            <div class="product-info">
              <strong>${o.customer || 'Guest'}</strong>
              <span>${o.email || '—'}</span>
            </div>
          </td>
          <td>${(o.items || []).length} item(s)</td>
          <td><strong>${UI.formatCurrency(o.total)}</strong></td>
          <td>${UI.badge(o.payment || 'online', o.payment === 'cod' ? 'yellow' : 'blue')}</td>
          <td>
            <select class="form-control" style="width:auto;padding:4px 8px;font-size:12px"
              onchange="window.AdminModules.orders.updateStatus('${o.id}', this.value)">
              ${['pending','processing','completed','cancelled'].map(s =>
                `<option value="${s}" ${(o.status||'pending')===s?'selected':''}>${s}</option>`
              ).join('')}
            </select>
          </td>
          <td style="font-size:12px;color:var(--text2)">${UI.formatDate(o.createdAt)}</td>
          <td>
            <div style="display:flex;gap:6px">
              <button class="btn btn-sm btn-secondary btn-icon" onclick="window.AdminModules.orders.viewOrder('${o.id}')" title="View"><i class="fas fa-eye"></i></button>
              <button class="btn btn-sm btn-danger btn-icon" onclick="window.AdminModules.orders.remove('${o.id}')" title="Delete"><i class="fas fa-trash"></i></button>
            </div>
          </td>
        </tr>`).join('')}
      </tbody>
    </table></div>` :
    `<div class="empty-state"><i class="fas fa-shopping-bag"></i><p>No orders found in this segment.</p></div>`}
  </div>`;
}

function segTab(id, label) {
  return `<button class="tab-btn ${_tab === id ? 'active' : ''}" onclick="window.AdminModules.orders.setTab('${id}')">${label}</button>`;
}

function miniStat(icon, color, value, label) {
  return `<div class="stat-card">
    <div class="stat-icon ${color}"><i class="fas ${icon}"></i></div>
    <div><div class="stat-value">${value}</div><div class="stat-label">${label}</div></div>
  </div>`;
}

export function setTab(id) { _tab = id; window.AdminApp.render(); }

export function updateStatus(id, status) {
  const { State, UI } = window.AdminCore;
  const orders = State.orders;
  const o = orders.find(x => x.id === id);
  if (o) { o.status = status; State.orders = orders; UI.toast(`Order #${id} → ${status}`); }
}

export function remove(id) {
  const { State, UI } = window.AdminCore;
  if (!confirm('Delete this order?')) return;
  State.orders = State.orders.filter(o => o.id !== id);
  UI.toast('Order deleted', 'error');
  window.AdminApp.render();
  UI.updateSidebarCounts();
}

export function viewOrder(id) {
  const { State, UI } = window.AdminCore;
  const o = State.orders.find(x => x.id === id);
  if (!o) return;
  alert(`Order #${o.id}\nCustomer: ${o.customer || 'Guest'}\nTotal: ${UI.formatCurrency(o.total)}\nStatus: ${o.status}\nItems: ${(o.items||[]).length}`);
}

export function openAdd() {
  window.AdminCore.UI.toast('Manual order creation coming soon', 'info');
}

export function exportCSV() {
  const { State } = window.AdminCore;
  const rows = [['ID', 'Customer', 'Email', 'Total', 'Status', 'Date']];
  State.orders.forEach(o => rows.push([o.id, o.customer, o.email, o.total, o.status, o.createdAt]));
  const csv = rows.map(r => r.map(c => `"${c || ''}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = 'orders.csv';
  a.click();
}
