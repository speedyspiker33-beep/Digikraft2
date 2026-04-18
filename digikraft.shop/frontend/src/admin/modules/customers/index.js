// ============================================================
// MODULE: CUSTOMERS
// ============================================================
let _tab = 'all';

export function render() {
  const { State, UI } = window.AdminCore;
  let customers = State.customers;
  const search = document.getElementById('cust-search')?.value || '';
  if (search) customers = customers.filter(c =>
    (c.name||'').toLowerCase().includes(search.toLowerCase()) ||
    (c.email||'').toLowerCase().includes(search.toLowerCase())
  );
  if (_tab === 'active') customers = customers.filter(c => c.orders > 0);
  if (_tab === 'new') customers = customers.filter(c => !c.orders || c.orders === 0);

  const totalSpent = State.customers.reduce((s,c)=>s+(c.spent||0),0);
  const active = State.customers.filter(c=>c.orders>0).length;

  return `
  <div class="page-header">
    <div><div class="page-title">Customers</div><div class="page-subtitle">${State.customers.length} registered · ${active} active</div></div>
    <div class="header-actions">
      <button class="btn btn-secondary" onclick="window.AdminModules.customers.exportCSV()"><i class="fas fa-download"></i> Export</button>
    </div>
  </div>

  <div class="stats-grid" style="margin-bottom:20px">
    <div class="stat-card"><div class="stat-icon blue"><i class="fas fa-users"></i></div><div><div class="stat-value">${State.customers.length}</div><div class="stat-label">Total Customers</div></div></div>
    <div class="stat-card"><div class="stat-icon green"><i class="fas fa-user-check"></i></div><div><div class="stat-value">${active}</div><div class="stat-label">Active Buyers</div></div></div>
    <div class="stat-card"><div class="stat-icon purple"><i class="fas fa-rupee-sign"></i></div><div><div class="stat-value">${UI.formatCurrency(totalSpent)}</div><div class="stat-label">Total Spent</div></div></div>
    <div class="stat-card"><div class="stat-icon yellow"><i class="fas fa-user-plus"></i></div><div><div class="stat-value">${State.customers.filter(c=>{const d=new Date(c.createdAt);return (Date.now()-d)<7*86400000;}).length}</div><div class="stat-label">New This Week</div></div></div>
  </div>

  <div class="tab-bar" style="margin-bottom:16px">
    ${segTab('all','All')} ${segTab('active','Active Buyers')} ${segTab('new','New')}
  </div>

  <div class="card">
    <div class="table-toolbar">
      <div class="table-search"><i class="fas fa-search"></i>
        <input type="text" id="cust-search" placeholder="Search by name or email..." oninput="window.AdminApp.render()" value="${search}">
      </div>
    </div>
    ${customers.length ? `
    <div class="table-wrap"><table>
      <thead><tr><th>Customer</th><th>Email</th><th>Orders</th><th>Total Spent</th><th>Joined</th><th>Actions</th></tr></thead>
      <tbody>${customers.map(c=>`
        <tr>
          <td><div style="display:flex;align-items:center;gap:10px">
            <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,var(--accent),#a855f7);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;flex-shrink:0">${(c.name||'?')[0].toUpperCase()}</div>
            <strong>${c.name||'Unknown'}</strong>
          </div></td>
          <td>${c.email||'—'}</td>
          <td>${c.orders||0}</td>
          <td><strong>${UI.formatCurrency(c.spent)}</strong></td>
          <td style="font-size:12px;color:var(--text2)">${UI.formatDate(c.createdAt)}</td>
          <td><button class="btn btn-sm btn-secondary btn-icon" onclick="window.AdminModules.customers.view('${c.id||c.email}')"><i class="fas fa-eye"></i></button></td>
        </tr>`).join('')}
      </tbody>
    </table></div>` :
    `<div class="empty-state"><i class="fas fa-users"></i><p>No customers found.</p></div>`}
  </div>`;
}

function segTab(id, label) {
  return `<button class="tab-btn ${_tab===id?'active':''}" onclick="window.AdminModules.customers.setTab('${id}')">${label}</button>`;
}

export function setTab(id) { _tab = id; window.AdminApp.render(); }

export function view(id) {
  const { State, UI } = window.AdminCore;
  const c = State.customers.find(x=>(x.id||x.email)===id);
  if (!c) return;
  alert(`Customer: ${c.name}\nEmail: ${c.email}\nOrders: ${c.orders||0}\nSpent: ${UI.formatCurrency(c.spent)}`);
}

export function exportCSV() {
  const { State } = window.AdminCore;
  const rows = [['Name','Email','Orders','Spent','Joined']];
  State.customers.forEach(c=>rows.push([c.name,c.email,c.orders,c.spent,c.createdAt]));
  const csv = rows.map(r=>r.map(c=>`"${c||''}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,'+encodeURIComponent(csv);
  a.download = 'customers.csv'; a.click();
}
