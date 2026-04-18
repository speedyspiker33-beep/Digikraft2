// ===== REVIEWS MODULE — Backend Connected =====
window.renderReviews = async function() {
  let reviews = []
  let meta = {}

  try {
    const res = await AdminAPI.getReviews({ limit: 100 })
    reviews = res.data?.reviews || []
    meta = res.data?.pagination || {}
  } catch (e) {
    // Fallback to localStorage
    reviews = JSON.parse(localStorage.getItem('dk_reviews') || '[]')
  }

  let tab = window._reviewTab || 'all'
  let filtered = [...reviews]
  if (tab === 'pending') filtered = reviews.filter(r => r.status === 'pending')
  if (tab === 'approved') filtered = reviews.filter(r => r.status === 'approved')
  if (tab === 'rejected') filtered = reviews.filter(r => r.status === 'rejected')

  const stars = n => '★'.repeat(n) + '☆'.repeat(5 - n)
  const avg = reviews.length ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) : 0

  return `
  <div class="ph">
    <div><div class="ph-title">Reviews & Ratings</div><div class="ph-sub">${reviews.length} total · ${avg} avg rating · Live from backend</div></div>
    <div class="ph-actions">
      <button class="btn btn-secondary" onclick="exportReviewsCSV()"><i class="fas fa-download"></i>Export</button>
    </div>
  </div>
  <div class="stats-grid" style="margin-bottom:16px">
    <div class="stat-card"><div class="si si-yellow"><i class="fas fa-star"></i></div><div><div class="sv">${avg}</div><div class="sl">Avg Rating</div></div></div>
    <div class="stat-card"><div class="si si-green"><i class="fas fa-check"></i></div><div><div class="sv">${reviews.filter(r=>r.status==='approved').length}</div><div class="sl">Approved</div></div></div>
    <div class="stat-card"><div class="si si-yellow"><i class="fas fa-clock"></i></div><div><div class="sv">${reviews.filter(r=>r.status==='pending').length}</div><div class="sl">Pending</div></div></div>
    <div class="stat-card"><div class="si si-red"><i class="fas fa-times"></i></div><div><div class="sv">${reviews.filter(r=>r.status==='rejected').length}</div><div class="sl">Rejected</div></div></div>
  </div>
  <div class="tabs" style="margin-bottom:16px">
    ${[['all','All'],['pending','Pending'],['approved','Approved'],['rejected','Rejected']].map(([id,lb])=>
      `<button class="tab ${tab===id?'on':''}" onclick="window._reviewTab='${id}';navigate('reviews')">${lb}</button>`
    ).join('')}
  </div>
  <div class="card">
    ${filtered.length ? `
    <div style="display:flex;flex-direction:column;gap:0">
      ${filtered.map(r => `
      <div style="padding:16px 0;border-bottom:1px solid var(--border)">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px">
          <div style="flex:1">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
              <div style="width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,var(--accent),var(--purple));display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px">${(r.customer_name||r.customer||'?')[0].toUpperCase()}</div>
              <div>
                <strong style="font-size:13px">${r.customer_name||r.customer||'Anonymous'}</strong>
                <div style="font-size:11px;color:var(--text3)">${r.product_id ? 'Product #'+r.product_id : (r.product||'Unknown Product')} · ${window.fmtDate?window.fmtDate(r.created_at||r.at):r.created_at||r.at}</div>
              </div>
              <span style="color:var(--yellow);font-size:14px;margin-left:4px">${stars(r.rating||5)}</span>
            </div>
            ${r.title ? `<div style="font-size:13px;font-weight:600;margin-bottom:4px">${r.title}</div>` : ''}
            <p style="font-size:13px;color:var(--text2);line-height:1.5">${r.body||r.comment||'No comment'}</p>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0">
            <span class="tag ${r.status==='approved'?'tg':r.status==='rejected'?'tr':'ty'}">${r.status||'pending'}</span>
            ${r.status!=='approved'?`<button class="btn btn-success btn-sm" onclick="reviewActionAPI('${r._id||r.id}','approved')"><i class="fas fa-check"></i>Approve</button>`:''}
            ${r.status!=='rejected'?`<button class="btn btn-danger btn-sm" onclick="reviewActionAPI('${r._id||r.id}','rejected')"><i class="fas fa-times"></i>Reject</button>`:''}
            <button class="btn btn-secondary btn-sm" onclick="reviewActionAPI('${r._id||r.id}','delete')"><i class="fas fa-trash"></i></button>
          </div>
        </div>
        ${r.admin_reply?`<div style="margin-top:10px;padding:10px;background:var(--bg3);border-radius:8px;border-left:3px solid var(--accent)"><div style="font-size:11px;color:var(--accent);font-weight:700;margin-bottom:4px">Admin Reply</div><div style="font-size:13px;color:var(--text2)">${r.admin_reply}</div></div>`:''}
        <div style="margin-top:8px">
          <input placeholder="Reply to this review..." style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:6px 10px;color:var(--text);font-size:12px;width:60%;font-family:inherit" id="reply-${r._id||r.id}">
          <button class="btn btn-secondary btn-sm" style="margin-left:6px" onclick="replyReviewAPI('${r._id||r.id}')"><i class="fas fa-reply"></i>Reply</button>
        </div>
      </div>`).join('')}
    </div>` : '<div class="es"><i class="fas fa-star"></i><p>No reviews in this segment</p></div>'}
  </div>`
}

window.reviewActionAPI = async function(id, action) {
  try {
    if (action === 'delete') {
      await AdminAPI.deleteReview(id)
      toast('Review deleted', 'e')
    } else {
      await AdminAPI.updateReview(id, { status: action })
      toast(`Review ${action}!`, action === 'approved' ? 's' : 'w')
    }
    navigate('reviews')
  } catch (e) {
    // Fallback to localStorage
    const reviews = JSON.parse(localStorage.getItem('dk_reviews') || '[]')
    if (action === 'delete') {
      localStorage.setItem('dk_reviews', JSON.stringify(reviews.filter(r => r.id !== id)))
    } else {
      const r = reviews.find(x => x.id === id)
      if (r) { r.status = action; localStorage.setItem('dk_reviews', JSON.stringify(reviews)) }
    }
    toast(action === 'delete' ? 'Deleted' : `Review ${action}`, action === 'delete' ? 'e' : 's')
    navigate('reviews')
  }
}

window.replyReviewAPI = async function(id) {
  const reply = document.getElementById('reply-' + id)?.value
  if (!reply) return toast('Enter a reply first', 'w')
  try {
    await AdminAPI.updateReview(id, { admin_reply: reply })
    toast('Reply saved!', 's')
    navigate('reviews')
  } catch (e) {
    // Fallback
    const reviews = JSON.parse(localStorage.getItem('dk_reviews') || '[]')
    const r = reviews.find(x => x.id === id)
    if (r) { r.reply = reply; localStorage.setItem('dk_reviews', JSON.stringify(reviews)) }
    toast('Reply saved!', 's')
    navigate('reviews')
  }
}

window.exportReviewsCSV = async function() {
  try {
    const res = await AdminAPI.getReviews({ limit: 1000 })
    const reviews = res.data?.reviews || []
    const csv = ['Customer,Product,Rating,Comment,Status,Date'].concat(
      reviews.map(r => `"${r.customer_name||''}","${r.product_id||''}","${r.rating}","${(r.body||'').replace(/"/g,'""')}","${r.status}","${r.created_at||''}"`)
    ).join('\n')
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    a.download = 'reviews.csv'
    a.click()
  } catch (e) {
    toast('Export failed', 'e')
  }
}

// Update sidebar badge with pending reviews count from backend
async function updateReviewsBadge() {
  try {
    const res = await AdminAPI.getReviews({ status: 'pending', limit: 1 })
    const count = res.data?.pagination?.total || 0
    const badge = document.getElementById('cnt-rev')
    if (badge) {
      badge.textContent = count
      badge.style.display = count ? 'inline-flex' : 'none'
    }
  } catch (e) {}
}

// Auto-update badge on load
setTimeout(updateReviewsBadge, 2000)
