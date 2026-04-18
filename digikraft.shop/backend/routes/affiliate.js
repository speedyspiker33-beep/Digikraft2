// ===== AFFILIATE ROUTES — Full CRM =====
const express = require('express')
const router = express.Router()
const { db, dbFind, dbFindOne, dbInsert, dbUpdate, dbRemove, dbCount, getNextId } = require('../db/database')
const { adminMiddleware, authMiddleware } = require('../middleware/auth')

function generateCode(name) {
  const base = (name || 'user').toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 8)
  const suffix = Math.random().toString(36).substring(2, 6)
  return `${base}${suffix}`
}

function getTier(totalSales) {
  if (totalSales >= 50) return { name: 'Gold', color: '#f59e0b', rate: 15, icon: '🥇' }
  if (totalSales >= 11) return { name: 'Silver', color: '#94a3b8', rate: 12, icon: '🥈' }
  return { name: 'Bronze', color: '#cd7f32', rate: 10, icon: '🥉' }
}

// ── PUBLIC: TERMS ─────────────────────────────────────────────────────────────
router.get('/terms', (req, res) => {
  res.json({
    success: true,
    data: {
      title: 'DigiKraft Affiliate Program — Terms & Conditions',
      last_updated: '2026-01-01',
      sections: [
        { heading: 'Commission Structure', content: 'Affiliates earn 10% commission on every completed sale. Bronze tier (0-10 sales): 10%, Silver (11-50 sales): 12%, Gold (50+ sales): 15%. Rates may be adjusted individually by admin.' },
        { heading: 'Cookie Duration', content: 'Referral cookies are valid for 30 days. If a customer clicks your link and purchases within 30 days, you earn the commission.' },
        { heading: 'Eligibility', content: 'Any registered DigiKraft user can apply. Applications are reviewed within 3-5 business days.' },
        { heading: 'Self-Referrals', content: 'Self-referrals are strictly prohibited and will result in immediate termination.' },
        { heading: 'Payout Target', content: 'Each affiliate has a payout target (default ₹1000). Once your pending balance reaches the target, you can request a payout.' },
        { heading: 'Payout Method', content: 'Payouts via UPI or bank transfer within 30 days of request.' },
        { heading: 'Refunds', content: 'Commission is reversed if a customer gets a refund within 30 days.' },
        { heading: 'Prohibited Activities', content: 'Spam, misleading advertising, cookie stuffing, and fraud will result in immediate termination.' }
      ]
    }
  })
})

// ── PUBLIC: TRACK CLICK ───────────────────────────────────────────────────────
router.post('/track', async (req, res) => {
  const { code, product_id, page_url } = req.body
  if (!code) return res.json({ success: false })
  try {
    const affiliate = await dbFindOne(db.affiliates, { code, status: 'approved' })
    if (!affiliate) return res.json({ success: false })
    await dbInsert(db.affiliate_clicks, {
      affiliate_id: affiliate.id, code, product_id: product_id || null,
      page_url: page_url || '', ip: req.ip, created_at: new Date()
    })
    await dbUpdate(db.affiliates, { id: affiliate.id }, { $inc: { total_clicks: 1 } })
    res.json({ success: true })
  } catch { res.json({ success: false }) }
})

// ── USER: REGISTER AS AFFILIATE ───────────────────────────────────────────────
router.post('/register', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id
    const existing = await dbFindOne(db.affiliates, { user_id: userId })
    if (existing) return res.status(400).json({ success: false, error: 'Already applied', data: existing })

    const user = await dbFindOne(db.customers, { id: userId })
    const { website, social_media, promotion_method, notes, upi_id } = req.body
    const code = generateCode(user?.name || user?.email)

    const affiliate = await dbInsert(db.affiliates, {
      id: Date.now(),
      user_id: userId,
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      code,
      status: 'pending',
      commission_rate: 10,
      payout_target: 1000,
      total_clicks: 0,
      total_sales: 0,
      total_earned: 0,
      pending_payout: 0,
      paid_out: 0,
      website: website || '',
      social_media: social_media || '',
      promotion_method: promotion_method || '',
      notes: notes || '',
      upi_id: upi_id || '',
      bank_details: '',
      tier: 'Bronze',
      applied_at: new Date(),
      approved_at: null,
      created_at: new Date()
    })
    res.status(201).json({ success: true, data: affiliate, message: 'Application submitted! We will review within 3-5 business days.' })
  } catch (err) { res.status(500).json({ success: false, error: err.message }) }
})

// ── USER: GET OWN PROFILE ─────────────────────────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const affiliate = await dbFindOne(db.affiliates, { user_id: req.user.id })
    if (!affiliate) return res.status(404).json({ success: false, error: 'Not an affiliate' })
    const tier = getTier(affiliate.total_sales || 0)
    res.json({ success: true, data: { ...affiliate, tier_info: tier } })
  } catch (err) { res.status(500).json({ success: false, error: err.message }) }
})

// ── USER: UPDATE PAYMENT DETAILS ──────────────────────────────────────────────
router.put('/me/payment', authMiddleware, async (req, res) => {
  try {
    const { upi_id, bank_details } = req.body
    const affiliate = await dbFindOne(db.affiliates, { user_id: req.user.id })
    if (!affiliate) return res.status(404).json({ success: false, error: 'Not an affiliate' })
    const updates = {}
    if (upi_id !== undefined) updates.upi_id = upi_id
    if (bank_details !== undefined) updates.bank_details = bank_details
    await dbUpdate(db.affiliates, { user_id: req.user.id }, { $set: updates })
    res.json({ success: true, message: 'Payment details updated' })
  } catch (err) { res.status(500).json({ success: false, error: err.message }) }
})

// ── USER: GET STATS ───────────────────────────────────────────────────────────
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const affiliate = await dbFindOne(db.affiliates, { user_id: req.user.id, status: 'approved' })
    if (!affiliate) return res.status(404).json({ success: false, error: 'Not an approved affiliate' })
    const conversions = await dbFind(db.affiliate_conversions, { affiliate_id: affiliate.id }, { created_at: -1 }, 20)
    const clicks = await dbFind(db.affiliate_clicks, { affiliate_id: affiliate.id }, { created_at: -1 }, 5)
    const tier = getTier(affiliate.total_sales || 0)
    const progress = Math.min(100, Math.round(((affiliate.pending_payout || 0) / (affiliate.payout_target || 1000)) * 100))
    res.json({
      success: true,
      data: {
        code: affiliate.code,
        commission_rate: affiliate.commission_rate,
        payout_target: affiliate.payout_target || 1000,
        total_clicks: affiliate.total_clicks || 0,
        total_sales: affiliate.total_sales || 0,
        total_earned: affiliate.total_earned || 0,
        pending_payout: affiliate.pending_payout || 0,
        paid_out: affiliate.paid_out || 0,
        payout_progress: progress,
        tier_info: tier,
        recent_conversions: conversions,
        recent_clicks: clicks
      }
    })
  } catch (err) { res.status(500).json({ success: false, error: err.message }) }
})

// ── USER: GENERATE LINK ───────────────────────────────────────────────────────
router.post('/links', authMiddleware, async (req, res) => {
  try {
    const affiliate = await dbFindOne(db.affiliates, { user_id: req.user.id, status: 'approved' })
    if (!affiliate) return res.status(403).json({ success: false, error: 'Not an approved affiliate' })
    const { product_slug, custom_url } = req.body
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3001'
    let url
    if (custom_url) url = `${custom_url}${custom_url.includes('?') ? '&' : '?'}ref=${affiliate.code}`
    else if (product_slug) url = `${baseUrl}/products/${product_slug}?ref=${affiliate.code}`
    else url = `${baseUrl}/products?ref=${affiliate.code}`
    res.json({ success: true, data: { affiliate_link: url, code: affiliate.code, product_slug: product_slug || null } })
  } catch (err) { res.status(500).json({ success: false, error: err.message }) }
})

// ── ADMIN: LIST ALL AFFILIATES ────────────────────────────────────────────────
router.get('/', adminMiddleware, async (req, res) => {
  try {
    const { status } = req.query
    const query = status ? { status } : {}
    const affiliates = await dbFind(db.affiliates, query, { created_at: -1 })
    const enriched = affiliates.map(a => ({ ...a, tier_info: getTier(a.total_sales || 0) }))
    res.json({ success: true, data: enriched, total: enriched.length })
  } catch (err) { res.status(500).json({ success: false, error: err.message }) }
})

// ── ADMIN: GET SINGLE AFFILIATE FULL PROFILE ──────────────────────────────────
router.get('/:id', adminMiddleware, async (req, res) => {
  try {
    const affiliate = await dbFindOne(db.affiliates, { id: parseInt(req.params.id) })
    if (!affiliate) return res.status(404).json({ success: false, error: 'Not found' })
    const conversions = await dbFind(db.affiliate_conversions, { affiliate_id: affiliate.id }, { created_at: -1 }, 50)
    const clicks = await dbFind(db.affiliate_clicks, { affiliate_id: affiliate.id }, { created_at: -1 }, 20)
    const payoutHistory = await dbFind(db.affiliate_payouts || db.affiliate_conversions, { affiliate_id: affiliate.id, type: 'payout' }, { created_at: -1 })
    const tier = getTier(affiliate.total_sales || 0)
    const progress = Math.min(100, Math.round(((affiliate.pending_payout || 0) / (affiliate.payout_target || 1000)) * 100))
    res.json({
      success: true,
      data: {
        ...affiliate,
        tier_info: tier,
        payout_progress: progress,
        conversions,
        clicks,
        payout_history: payoutHistory
      }
    })
  } catch (err) { res.status(500).json({ success: false, error: err.message }) }
})

// ── ADMIN: APPROVE/REJECT/UPDATE ──────────────────────────────────────────────
router.put('/:id/status', adminMiddleware, async (req, res) => {
  try {
    const { status, commission_rate, payout_target } = req.body
    const updates = { status, updated_at: new Date() }
    if (status === 'approved') updates.approved_at = new Date()
    if (commission_rate) updates.commission_rate = parseFloat(commission_rate)
    if (payout_target) updates.payout_target = parseFloat(payout_target)
    await dbUpdate(db.affiliates, { id: parseInt(req.params.id) }, { $set: updates })
    const updated = await dbFindOne(db.affiliates, { id: parseInt(req.params.id) })
    res.json({ success: true, data: { ...updated, tier_info: getTier(updated.total_sales || 0) } })
  } catch (err) { res.status(500).json({ success: false, error: err.message }) }
})

// ── ADMIN: UPDATE AFFILIATE SETTINGS ─────────────────────────────────────────
router.put('/:id', adminMiddleware, async (req, res) => {
  try {
    const { commission_rate, payout_target, notes, status, upi_id, bank_details } = req.body
    const updates = { updated_at: new Date() }
    if (commission_rate !== undefined) updates.commission_rate = parseFloat(commission_rate)
    if (payout_target !== undefined) updates.payout_target = parseFloat(payout_target)
    if (notes !== undefined) updates.notes = notes
    if (status !== undefined) updates.status = status
    if (upi_id !== undefined) updates.upi_id = upi_id
    if (bank_details !== undefined) updates.bank_details = bank_details
    await dbUpdate(db.affiliates, { id: parseInt(req.params.id) }, { $set: updates })
    const updated = await dbFindOne(db.affiliates, { id: parseInt(req.params.id) })
    res.json({ success: true, data: updated })
  } catch (err) { res.status(500).json({ success: false, error: err.message }) }
})

// ── ADMIN: MARK PAYOUT DONE ───────────────────────────────────────────────────
router.put('/:id/payout', adminMiddleware, async (req, res) => {
  try {
    const affiliate = await dbFindOne(db.affiliates, { id: parseInt(req.params.id) })
    if (!affiliate) return res.status(404).json({ success: false, error: 'Not found' })
    const amount = affiliate.pending_payout || 0
    await dbUpdate(db.affiliates, { id: parseInt(req.params.id) }, {
      $set: { pending_payout: 0, updated_at: new Date() },
      $inc: { paid_out: amount }
    })
    await dbInsert(db.affiliate_conversions, {
      affiliate_id: affiliate.id, type: 'payout',
      amount: -amount, note: `Payout of ₹${amount} processed`, created_at: new Date()
    })
    res.json({ success: true, message: `Payout of ₹${amount} marked as done` })
  } catch (err) { res.status(500).json({ success: false, error: err.message }) }
})

// ── ADMIN: ADD AFFILIATE MANUALLY ─────────────────────────────────────────────
router.post('/add', adminMiddleware, async (req, res) => {
  try {
    const { email, commission_rate = 10, payout_target = 1000 } = req.body
    if (!email) return res.status(400).json({ success: false, error: 'Email required' })
    const user = await dbFindOne(db.customers, { email })
    if (!user) return res.status(404).json({ success: false, error: 'User not found with that email' })
    const existing = await dbFindOne(db.affiliates, { user_id: user.id })
    if (existing) return res.status(400).json({ success: false, error: 'User is already an affiliate', data: existing })
    const code = generateCode(user.name || user.email)
    const affiliate = await dbInsert(db.affiliates, {
      id: Date.now(),
      user_id: user.id,
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      code,
      status: 'approved',
      commission_rate: parseFloat(commission_rate),
      payout_target: parseFloat(payout_target),
      total_clicks: 0, total_sales: 0, total_earned: 0,
      pending_payout: 0, paid_out: 0,
      website: '', social_media: '', promotion_method: 'direct',
      notes: 'Added directly by admin',
      upi_id: '', bank_details: '', tier: 'Bronze',
      applied_at: new Date(), approved_at: new Date(), created_at: new Date()
    })
    res.status(201).json({ success: true, data: affiliate, message: `${user.name} added as affiliate` })
  } catch (err) { res.status(500).json({ success: false, error: err.message }) }
})

// ── INTERNAL: RECORD CONVERSION ───────────────────────────────────────────────
router.post('/convert', async (req, res) => {
  const { ref_code, order_id, order_total, customer_id } = req.body
  if (!ref_code) return res.json({ success: false })
  try {
    const affiliate = await dbFindOne(db.affiliates, { code: ref_code, status: 'approved' })
    if (!affiliate) return res.json({ success: false })
    if (affiliate.user_id === customer_id) return res.json({ success: false, error: 'Self-referral not allowed' })
    const commission = Math.round((order_total * affiliate.commission_rate) / 100)
    await dbInsert(db.affiliate_conversions, {
      affiliate_id: affiliate.id, order_id, order_total, commission, type: 'sale', created_at: new Date()
    })
    // Auto-upgrade tier
    const newSales = (affiliate.total_sales || 0) + 1
    const tier = getTier(newSales)
    await dbUpdate(db.affiliates, { id: affiliate.id }, {
      $inc: { total_sales: 1, total_earned: commission, pending_payout: commission },
      $set: { tier: tier.name }
    })
    res.json({ success: true, commission })
  } catch (err) { res.json({ success: false, error: err.message }) }
})

module.exports = router
