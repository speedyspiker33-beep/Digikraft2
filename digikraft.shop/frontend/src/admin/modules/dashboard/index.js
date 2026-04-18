// ============================================================
// MODULE: DASHBOARD
// ============================================================
export function render() {
  const { State, UI } = window.AdminCore;
  const products = State.products;
  const orders = State.orders;
  const customers = State.customers;

  const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const pending = orders.filter(o => o.status === 'pending').length;
  const published = products.filter(p => p.status === 'published').length;

  const catCounts = {};
  products.forEach(p => { catCounts[p.category] = (catCounts[p.category] || 0) + 1; });
  const topCats = Object.entries(catCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxCat = topCats[0]?.[1] || 1;

  const recentOrders = orders.slice(0, 5);
  const recentProducts = products.slice(0, 5);

  return `
  <div class="page-header">
    <div>
      <div class="page-title">Dashboard</div>
      <div class="page-subtitle">Welcome back! Here's your store overview.</div>
    </div>
    <div class="header-actions">
      <button class="btn btn-secondary" onclick="window.AdminModules.products.openAdd()">
        <i class="fas fa-plus"></i> Add Product
      </button>
      <button class="btn btn-primary" onclick="window.AdminApp.navigate('analytics')">
        <i class="fas fa-chart-line"></i> Analytics
      </button>
    </div>
  </div>

  <!-- KPI STATS -->
  <div class="stats-grid">
    ${statCard('fa-rupee-sign', 'purple', UI.formatCurrency(revenue), 'Total Revenue', 'All time')}
    ${statCard('fa-box', 'blue', products.length, 'Products', `${published} published`)}
    ${statCard('fa-shopping-bag', 'green', orders.length, 'Orders', `${pending} pending`)}
    ${statCard('fa-users', 'yellow', customers.length, 'Customers', 'Registered')}
    ${statCard('fa-star', 'red', products.filter(p=>p.featured).length, 'Featured', 'Products')}
    ${statCard('fa-ticket-alt', 'purple', State.coupons.length, 'Coupons', 'Active')}
  </div>

  <!-- CHARTS ROW -->
  <div class="grid-3" style="margin-bottom:20px">
    <div class="card" style="grid-column:span 2">
      <div class="card-header">
        <div class="card-title"><i class="fas fa-chart-bar" style="color:var(--accent);margin-right:8px"></i>Products by Category</div>
      </div>
      ${topCats.length ? `
      <div class="chart-bar-wrap">
        ${topCats.map(([cat, count]) => `
        <div class="chart-bar-row">
          <div class="chart-bar-label">${cat}</div>
          <div class="chart-bar-track"><div class="chart-bar-fill" style="width:${Math.round(count / maxCat * 100)}%"></div></div>
          <div class="chart-bar-val">${count}</div>
        </div>`).join('')}
      </div>` : UI.emptyState('fa-chart-bar', 'Add products to see category breakdown')}
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title"><i class="fas fa-bolt" style="color:var(--yellow);margin-right:8px"></i>Quick Actions</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${quickAction('fa-plus', 'Add Product', "window.AdminModules.products.openAdd()", 'purple')}
        ${quickAction('fa-tags', 'Add Category', "window.AdminModules.categories.addCategory()", 'blue')}
        ${quickAction('fa-ticket-alt', 'Create Coupon', "window.AdminModules.coupons.openAdd()", 'green')}
        ${quickAction('fa-upload', 'Upload Media', "window.AdminApp.navigate('media')", 'yellow')}
        ${quickAction('fa-cog', 'Settings', "window.AdminApp.navigate('settings')", 'red')}
      </div>
    </div>
  </div>

  <!-- RECENT TABLES -->
  <div class="grid-2">
    <div class="card">
      <div class="card-header">
        <div class="card-title">Recent Products</div>
        <button class="btn btn-secondary btn-sm" onclick="window.AdminApp.navigate('products')">View All</button>
      </div>
      ${recentProducts.length ? `
      <div class="table-wrap"><table>
        <thead><tr><th>Product</th><th>Price</th><th>Status</th></tr></thead>
        <tbody>${recentProducts.map(p => `
          <tr>
            <td><div style="display:flex;align-items:center;gap:10px">
              <img class="product-thumb" src="${p.image || ''}" onerror="this.src='https://via.placeholder.com/40'">
              <div class="product-info"><strong>${p.title}</strong><span>${p.category || '—'}</span></div>
            </div></td>
            <td><strong>${UI.formatCurrency(p.price)}</strong></td>
            <td>${UI.badge(p.status, p.status === 'published' ? 'green' : 'yellow')}</td>
          </tr>`).join('')}
        </tbody>
      </table></div>` : UI.emptyState('fa-box-open', 'No products yet')}
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">Recent Orders</div>
        <button class="btn btn-secondary btn-sm" onclick="window.AdminApp.navigate('orders')">View All</button>
      </div>
      ${recentOrders.length ? `
      <div class="table-wrap"><table>
        <thead><tr><th>Order</th><th>Total</th><th>Status</th></tr></thead>
        <tbody>${recentOrders.map(o => `
          <tr>
            <td><strong>#${o.id}</strong><br><small style="color:var(--text2)">${o.customer || 'Guest'}</small></td>
            <td><strong>${UI.formatCurrency(o.total)}</strong></td>
            <td>${UI.badge(o.status || 'pending', o.status === 'completed' ? 'green' : o.status === 'cancelled' ? 'red' : 'yellow')}</td>
          </tr>`).join('')}
        </tbody>
      </table></div>` : UI.emptyState('fa-shopping-bag', 'No orders yet')}
    </div>
  </div>`;
}

function statCard(icon, color, value, label, sub) {
  return `<div class="stat-card">
    <div class="stat-icon ${color}"><i class="fas ${icon}"></i></div>
    <div>
      <div class="stat-value">${value}</div>
      <div class="stat-label">${label}</div>
      <div class="stat-change up">${sub}</div>
    </div>
  </div>`;
}

function quickAction(icon, label, onclick, color) {
  return `<button class="btn btn-secondary" style="justify-content:flex-start;gap:12px" onclick="${onclick}">
    <span style="width:28px;height:28px;border-radius:8px;background:rgba(99,102,241,0.15);display:flex;align-items:center;justify-content:center;color:var(--${color === 'purple' ? 'accent' : color})">
      <i class="fas ${icon}" style="font-size:12px"></i>
    </span>
    ${label}
  </button>`;
}
