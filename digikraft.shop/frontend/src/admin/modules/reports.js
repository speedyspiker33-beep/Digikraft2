// ===== REPORTS MODULE =====
// Connected to Backend API (port 8080)
window.renderReports = async function() {
  let orders = [], products = [], customers = [], analytics = {}

  try {
    const [ordRes, prodRes, custRes, analyticsRes] = await Promise.all([
      AdminAPI.getOrders({ limit: 500 }),
      AdminAPI.getProducts({ status: 'all', limit: 500 }),
      AdminAPI.getCustomers({ limit: 500 }),
      AdminAPI.getAnalytics(30)
    ])
    orders = ordRes.data?.orders || []
    products = prodRes.data?.products || []
    customers = custRes.data?.customers || []
    analytics = analyticsRes.data || {}
  } catch (e) {
    orders = JSON.parse(localStorage.getItem('dk_o') || '[]')
    products = JSON.parse(localStorage.getItem('dk_p') || '[]')
    customers = JSON.parse(localStorage.getItem('dk_c') || '[]')
  }

  const vOrders = JSON.parse(localStorage.getItem('dk_vorders') || '[]')
  const tab = window._reportTab || 'sales'

  const totalRev = analytics.summary?.totalRevenue || orders.reduce((s,o)=>s+(o.total||0),0)
  const vendorCost = vOrders.reduce((s,v)=>s+(v.cost||0),0)
  const profit = totalRev - vendorCost
  const margin = totalRev ? ((profit/totalRev)*100).toFixed(1) : 0

  // Revenue by day from analytics or compute locally
  const revenueByDay = analytics.revenueByDay || {}
  const dateEntries = Object.entries(revenueByDay).slice(-14)
  const maxRev = Math.max(...dateEntries.map(([,v])=>v), 1)

  const topProducts = analytics.topProducts || [...products].sort((a,b)=>(b.downloads||0)-(a.downloads||0)).slice(0,8)

  return `
  <div class="ph">
    <div><div class="ph-title">Reports</div><div class="ph-sub">Business intelligence and insights</div></div>
    <div class="ph-actions">
      <select class="fc" style="width:auto" id="report-range">
        <option>Last 7 days</option><option>Last 30 days</option><option>Last 90 days</option><option>This year</option>
      </select>
      <button class="btn btn-secondary" onclick="window.toast('PDF export coming soon','i')"><i class="fas fa-file-pdf"></i>Export PDF</button>
    </div>
  </div>

  <!-- P&L SUMMARY -->
  <div class="stats-grid" style="margin-bottom:16px">
    <div class="stat-card"><div class="si si-green"><i class="fas fa-rupee-sign"></i></div><div><div class="sv">${window.fmt?window.fmt(totalRev):totalRev}</div><div class="sl">Gross Revenue</div></div></div>
    <div class="stat-card"><div class="si si-red"><i class="fas fa-truck"></i></div><div><div class="sv">${window.fmt?window.fmt(vendorCost):vendorCost}</div><div class="sl">Vendor Cost</div></div></div>
    <div class="stat-card"><div class="si si-purple"><i class="fas fa-chart-line"></i></div><div><div class="sv">${window.fmt?window.fmt(profit):profit}</div><div class="sl">Net Profit</div></div></div>
    <div class="stat-card"><div class="si si-blue"><i class="fas fa-percentage"></i></div><div><div class="sv">${margin}%</div><div class="sl">Profit Margin</div></div></div>
  </div>

  <div class="tabs" style="margin-bottom:16px">
    ${[['sales','Sales'],['products','Products'],['customers','Customers'],['vendors','Vendor P&L']].map(([id,lb])=>
      `<button class="tab ${tab===id?'on':''}" onclick="window._reportTab='${id}';navigate('reports')">${lb}</button>`
    ).join('')}
  </div>

  ${tab==='sales'?`
  <div class="g2">
    <div class="card" style="grid-column:span 2">
      <div class="card-hd"><div class="card-title"><i class="fas fa-chart-bar" style="color:var(--accent)"></i>Daily Revenue (Last 14 days)</div></div>
      ${dateEntries.length ? `
      <div style="display:flex;align-items:flex-end;gap:6px;height:160px;padding:8px 0">
        ${dateEntries.map(([d,v])=>`
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
          <div style="font-size:10px;color:var(--text3)">${window.fmt?window.fmt(v):v}</div>
          <div style="width:100%;background:linear-gradient(180deg,var(--accent),var(--accent2));border-radius:5px 5px 0 0;height:${Math.round(v/maxRev*120)}px;min-height:4px;transition:height .5s"></div>
          <div style="font-size:9px;color:var(--text3)">${d}</div>
        </div>`).join('')}
      </div>` : '<div class="es" style="padding:20px"><i class="fas fa-chart-bar"></i><p>No sales data yet</p></div>'}
    </div>
    <div class="card">
      <div class="card-hd"><div class="card-title">Order Status Breakdown</div></div>
      <div class="cbw">
        ${['completed','processing','pending','cancelled'].map(s=>{
          const cnt = orders.filter(o=>(o.status||'pending')===s).length;
          const pct = orders.length ? Math.round(cnt/orders.length*100) : 0;
          return `<div class="cbr"><div class="cbl">${s}</div><div class="cbt"><div class="cbf" style="width:${pct}%"></div></div><div class="cbv">${cnt}</div></div>`;
        }).join('')}
      </div>
    </div>
    <div class="card">
      <div class="card-hd"><div class="card-title">Payment Methods</div></div>
      <div class="cbw">
        ${['online','upi','cod','card'].map(m=>{
          const cnt = orders.filter(o=>(o.payment||'online')===m).length;
          const pct = orders.length ? Math.round(cnt/orders.length*100) : 0;
          return `<div class="cbr"><div class="cbl">${m.toUpperCase()}</div><div class="cbt"><div class="cbf" style="width:${pct}%"></div></div><div class="cbv">${cnt}</div></div>`;
        }).join('')}
      </div>
    </div>
  </div>` : ''}

  ${tab==='products'?`
  <div class="g2">
    <div class="card">
      <div class="card-hd"><div class="card-title">Top Products by Downloads</div></div>
      ${topProducts.slice(0,8).map((p,i)=>`
      <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border)">
        <div style="width:22px;height:22px;border-radius:6px;background:var(--bg3);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--text3)">${i+1}</div>
        <img class="pt" style="width:32px;height:32px" src="${p.image||''}" onerror="this.src='https://via.placeholder.com/32'">
        <div style="flex:1"><div style="font-size:13px;font-weight:600">${p.title}</div><div style="font-size:11px;color:var(--text2)">${p.categories?.[0]?.name||p.category||'—'}</div></div>
        <div style="text-align:right"><div style="font-size:13px;font-weight:700">${p.downloads||0}</div><div style="font-size:10px;color:var(--text3)">downloads</div></div>
      </div>`).join('')}
    </div>
    <div class="card">
      <div class="card-hd"><div class="card-title">Category Performance</div></div>
      <div class="cbw">
        ${(analytics.categoryBreakdown || [...new Set(products.map(p=>p.category).filter(Boolean))].map(cat=>({name:cat,count:products.filter(p=>p.category===cat).length,downloads:products.filter(p=>p.category===cat).reduce((s,p)=>s+(p.downloads||0),0)}))).map(cat=>{
          const pct = products.length ? Math.round((cat.count||0)/products.length*100) : 0
          return `<div class="cbr"><div class="cbl">${cat.name}</div><div class="cbt"><div class="cbf" style="width:${pct}%"></div></div><div class="cbv">${cat.downloads||cat.count||0}</div></div>`
        }).join('')}
      </div>
    </div>
  </div>` : ''}

  ${tab==='customers'?`
  <div class="g2">
    <div class="card">
      <div class="card-hd"><div class="card-title">Customer Growth</div></div>
      <div class="es" style="padding:30px"><i class="fas fa-chart-line"></i><p>Customer growth chart — connect to backend API for live data</p></div>
    </div>
    <div class="card">
      <div class="card-hd"><div class="card-title">Top Customers by Spend</div></div>
      ${customers.sort((a,b)=>(b.spent||0)-(a.spent||0)).slice(0,8).map((c,i)=>`
      <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border)">
        <div style="width:22px;height:22px;border-radius:6px;background:var(--bg3);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--text3)">${i+1}</div>
        <div style="width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,var(--accent),var(--purple));display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px">${(c.name||'?')[0].toUpperCase()}</div>
        <div style="flex:1"><div style="font-size:13px;font-weight:600">${c.name||'Unknown'}</div><div style="font-size:11px;color:var(--text2)">${c.orders||0} orders</div></div>
        <strong style="color:var(--green)">${window.fmt?window.fmt(c.spent):c.spent}</strong>
      </div>`).join('')}
    </div>
  </div>` : ''}

  ${tab==='vendors'?`
  <div class="card">
    <div class="card-hd"><div class="card-title"><i class="fas fa-truck" style="color:var(--accent)"></i>Vendor Profit & Loss</div></div>
    <div class="tw"><table>
      <thead><tr><th>Vendor</th><th>Orders</th><th>Revenue Generated</th><th>Vendor Cost</th><th>Your Profit</th><th>Margin</th></tr></thead>
      <tbody>${JSON.parse(localStorage.getItem('dk_vendors')||'[]').map(v=>{
        const vos = vOrders.filter(vo=>vo.vendorId===v.id);
        const cost = vos.reduce((s,vo)=>s+(vo.cost||0),0);
        const rev = vos.reduce((s,vo)=>{
          const o = orders.find(x=>x.id===vo.orderId);
          return s+(o?.total||0);
        },0);
        const profit = rev - cost;
        const margin = rev ? ((profit/rev)*100).toFixed(1) : 0;
        return `<tr>
          <td><strong>${v.name}</strong></td>
          <td>${vos.length}</td>
          <td>${window.fmt?window.fmt(rev):rev}</td>
          <td style="color:var(--red)">${window.fmt?window.fmt(cost):cost}</td>
          <td style="color:var(--green)"><strong>${window.fmt?window.fmt(profit):profit}</strong></td>
          <td><span class="tag ${parseFloat(margin)>30?'tg':parseFloat(margin)>10?'ty':'tr'}">${margin}%</span></td>
        </tr>`;
      }).join('')}</tbody>
    </table></div>
  </div>` : ''}`;
};
