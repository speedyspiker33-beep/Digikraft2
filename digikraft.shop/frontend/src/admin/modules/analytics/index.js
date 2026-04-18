// MODULE: ANALYTICS
export function render() {
  const { State, UI } = window.AdminCore;
  const orders = State.orders;
  const products = State.products;
  const revenue = orders.reduce((s,o)=>s+(o.total||0),0);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const bars = months.map(m=>({m,v:Math.floor(Math.random()*80)+10}));
  const maxV = Math.max(...bars.map(b=>b.v));
  const topProducts = [...products].sort((a,b)=>(b.downloads||0)-(a.downloads||0)).slice(0,5);

  return `
  <div class="page-header">
    <div><div class="page-title">Analytics</div><div class="page-subtitle">Store performance overview</div></div>
    <div class="header-actions">
      <select class="form-control" style="width:auto">
        <option>Last 30 days</option><option>Last 90 days</option><option>This year</option>
      </select>
    </div>
  </div>

  <div class="stats-grid" style="margin-bottom:20px">
    <div class="stat-card"><div class="stat-icon purple"><i class="fas fa-eye"></i></div><div><div class="stat-value">${(Math.random()*10000|0).toLocaleString()}</div><div class="stat-label">Page Views</div><div class="stat-change up"><i class="fas fa-arrow-up"></i> 12%</div></div></div>
    <div class="stat-card"><div class="stat-icon green"><i class="fas fa-rupee-sign"></i></div><div><div class="stat-value">${UI.formatCurrency(revenue)}</div><div class="stat-label">Revenue</div><div class="stat-change up"><i class="fas fa-arrow-up"></i> 8%</div></div></div>
    <div class="stat-card"><div class="stat-icon blue"><i class="fas fa-percentage"></i></div><div><div class="stat-value">${(Math.random()*10).toFixed(1)}%</div><div class="stat-label">Conversion</div></div></div>
    <div class="stat-card"><div class="stat-icon yellow"><i class="fas fa-clock"></i></div><div><div class="stat-value">${(Math.random()*5+1).toFixed(1)}m</div><div class="stat-label">Avg Session</div></div></div>
  </div>

  <div class="grid-2" style="margin-bottom:20px">
    <div class="card">
      <div class="card-header"><div class="card-title">Monthly Revenue</div></div>
      <div style="display:flex;align-items:flex-end;gap:6px;height:160px;padding:10px 0">
        ${bars.map(b=>`
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
          <div style="width:100%;background:linear-gradient(180deg,var(--accent),var(--accent2));border-radius:6px 6px 0 0;height:${Math.round(b.v/maxV*120)}px;transition:height .5s;cursor:pointer" title="${b.m}: ₹${b.v*1000}"></div>
          <div style="font-size:10px;color:var(--text3)">${b.m}</div>
        </div>`).join('')}
      </div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">Traffic Sources</div></div>
      <div class="chart-bar-wrap">
        ${[['Organic Search',65],['Direct',20],['Social Media',10],['Referral',5]].map(([src,pct])=>`
        <div class="chart-bar-row">
          <div class="chart-bar-label" style="width:120px">${src}</div>
          <div class="chart-bar-track"><div class="chart-bar-fill" style="width:${pct}%"></div></div>
          <div class="chart-bar-val">${pct}%</div>
        </div>`).join('')}
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-header"><div class="card-title">Top Products by Downloads</div></div>
    ${topProducts.length ? `
    <div class="table-wrap"><table>
      <thead><tr><th>Product</th><th>Category</th><th>Downloads</th><th>Revenue</th><th>Rating</th></tr></thead>
      <tbody>${topProducts.map(p=>`
        <tr>
          <td><div style="display:flex;align-items:center;gap:10px">
            <img class="product-thumb" src="${p.image||''}" onerror="this.src='https://via.placeholder.com/40'">
            <strong>${p.title}</strong>
          </div></td>
          <td>${UI.badge(p.category||'—','purple')}</td>
          <td>${p.downloads||0}</td>
          <td>${UI.formatCurrency((p.downloads||0)*p.price)}</td>
          <td><span style="color:var(--yellow)">★</span> ${p.rating||4.5}</td>
        </tr>`).join('')}
      </tbody>
    </table></div>` :
    `<div class="empty-state"><i class="fas fa-chart-line"></i><p>Add products to see analytics</p></div>`}
  </div>`;
}
