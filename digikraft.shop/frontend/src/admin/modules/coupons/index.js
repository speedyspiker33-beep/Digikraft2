// MODULE: COUPONS
export function render() {
  const { State, UI } = window.AdminCore;
  const coupons = State.coupons;
  return `
  <div class="page-header">
    <div><div class="page-title">Coupons</div><div class="page-subtitle">${coupons.length} discount codes</div></div>
    <div class="header-actions">
      <button class="btn btn-primary" onclick="window.AdminModules.coupons.openAdd()"><i class="fas fa-plus"></i> Create Coupon</button>
    </div>
  </div>
  <div class="card">
    ${coupons.length ? `
    <div class="table-wrap"><table>
      <thead><tr><th>Code</th><th>Discount</th><th>Type</th><th>Min Order</th><th>Uses</th><th>Expires</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>${coupons.map((c,i)=>`
        <tr>
          <td><code style="background:var(--bg3);padding:4px 10px;border-radius:6px;font-size:13px;font-weight:700">${c.code}</code></td>
          <td>${UI.badge(c.discount+(c.type==='percent'?'% OFF':'₹ OFF'),'green')}</td>
          <td>${c.type}</td>
          <td>${UI.formatCurrency(c.minOrder||0)}</td>
          <td>${c.uses||0}${c.maxUses?'/'+c.maxUses:''}</td>
          <td style="font-size:12px;color:var(--text2)">${c.expires||'No expiry'}</td>
          <td>${UI.badge(c.active!==false?'Active':'Inactive',c.active!==false?'green':'red')}</td>
          <td><div style="display:flex;gap:6px">
            <button class="btn btn-sm btn-secondary btn-icon" onclick="window.AdminModules.coupons.toggle(${i})"><i class="fas fa-toggle-on"></i></button>
            <button class="btn btn-sm btn-danger btn-icon" onclick="window.AdminModules.coupons.remove(${i})"><i class="fas fa-trash"></i></button>
          </div></td>
        </tr>`).join('')}
      </tbody>
    </table></div>` :
    `<div class="empty-state"><i class="fas fa-ticket-alt"></i><p>No coupons yet. Create your first discount code.</p></div>`}
  </div>`;
}

export function openAdd() { window.AdminCore.UI.openModal('coupon-modal'); }

export function save(e) {
  e.preventDefault();
  const { State, UI } = window.AdminCore;
  const f = new FormData(e.target);
  const coupons = State.coupons;
  coupons.push({
    code: f.get('code').toUpperCase(),
    discount: parseFloat(f.get('discount')),
    type: f.get('type'),
    minOrder: parseFloat(f.get('minOrder')||0),
    maxUses: f.get('maxUses') ? parseInt(f.get('maxUses')) : null,
    expires: f.get('expires') || null,
    uses: 0, active: true,
    createdAt: new Date().toISOString()
  });
  State.coupons = coupons;
  UI.toast('Coupon created!');
  UI.closeModal('coupon-modal');
  e.target.reset();
  window.AdminApp.render();
}

export function toggle(i) {
  const { State, UI } = window.AdminCore;
  const coupons = State.coupons;
  coupons[i].active = !coupons[i].active;
  State.coupons = coupons;
  UI.toast('Coupon updated!');
  window.AdminApp.render();
}

export function remove(i) {
  const { State, UI } = window.AdminCore;
  if (!confirm('Delete this coupon?')) return;
  const coupons = State.coupons;
  coupons.splice(i, 1);
  State.coupons = coupons;
  UI.toast('Coupon deleted', 'error');
  window.AdminApp.render();
}
