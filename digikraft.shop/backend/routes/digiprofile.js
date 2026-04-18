const express = require('express')
const router = express.Router()
const { db, dbFind, dbFindOne, dbInsert, dbUpdate, dbRemove } = require('../db/database')
const { adminMiddleware, authMiddleware, optionalAuth } = require('../middleware/auth')

// ===== PUBLIC: Create profile (no auth - pending review) =====
router.post('/public', async (req, res) => {
  try {
    const { username, display_name, bio, avatar, category, links, social, theme_color, theme_style } = req.body
    if (!username) return res.status(400).json({ success: false, error: 'Username required' })

    const uname = username.toLowerCase().replace(/[^a-z0-9_]/g, '')
    const existing = await dbFindOne(db.digiprofiles, { username: uname })
    if (existing) return res.status(400).json({ success: false, error: 'Username already taken' })

    const profile = await dbInsert(db.digiprofiles, {
      username: uname,
      display_name: display_name || username,
      bio: bio || '',
      avatar: avatar || '',
      category: category || 'creator',
      links: links || [],
      social: social || {},
      theme_color: theme_color || '#6366f1',
      theme_style: theme_style || 'minimal',
      status: 'pending', // Requires admin approval
      kyc_status: 'pending',
      payment_enabled: false,
      accept_donations: false,
      views: 0,
      clicks: 0,
      created_at: new Date(),
      updated_at: new Date()
    })

    // Notify admin
    await dbInsert(db.notifications, {
      type: 'new_digiprofile',
      title: 'New DigiProfile Request',
      message: `@${uname} wants to create a profile`,
      data: { profileId: profile._id },
      read: false,
      created_at: new Date()
    })

    res.status(201).json({ success: true, data: { username: uname, status: 'pending' } })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ===== PUBLIC: GET profile by username =====
router.get('/p/:username', async (req, res) => {
  try {
    const profile = await dbFindOne(db.digiprofiles, {
      username: req.params.username.toLowerCase(),
      status: 'active'
    })
    if (!profile) return res.status(404).json({ success: false, error: 'Profile not found' })

    // Increment view count
    await dbUpdate(db.digiprofiles, { _id: profile._id }, { $inc: { views: 1 } })

    // Remove sensitive fields
    const { razorpay_key_secret, instagram_access_token, kyc_documents, ...safe } = profile
    res.json({ success: true, data: safe })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ===== PUBLIC: Check username availability =====
router.get('/check/:username', async (req, res) => {
  try {
    const existing = await dbFindOne(db.digiprofiles, { username: req.params.username.toLowerCase() })
    res.json({ success: true, available: !existing })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ===== ADMIN: List all profiles =====
router.get('/', adminMiddleware, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query
    let profiles = await dbFind(db.digiprofiles, {}, { created_at: -1 })

    if (status) profiles = profiles.filter(p => p.status === status)
    if (search) {
      const re = new RegExp(search, 'i')
      profiles = profiles.filter(p => re.test(p.username) || re.test(p.display_name) || re.test(p.email))
    }

    const total = profiles.length
    const offset = (parseInt(page) - 1) * parseInt(limit)
    profiles = profiles.slice(offset, offset + parseInt(limit))

    // Remove sensitive fields
    const safe = profiles.map(({ razorpay_key_secret, instagram_access_token, kyc_documents, ...p }) => p)

    res.json({
      success: true,
      data: safe,
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ===== ADMIN: Get single profile =====
router.get('/:id', adminMiddleware, async (req, res) => {
  try {
    const profile = await dbFindOne(db.digiprofiles, { _id: req.params.id })
    if (!profile) return res.status(404).json({ success: false, error: 'Profile not found' })
    res.json({ success: true, data: profile })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ===== ADMIN: Create profile =====
router.post('/', adminMiddleware, async (req, res) => {
  try {
    const {
      username, display_name, email, phone, bio, avatar, cover_image,
      theme_color, theme_style, category,
      links, products, social_links,
      razorpay_key_id, razorpay_key_secret,
      instagram_username, instagram_access_token, instagram_app_id, instagram_app_secret,
      meta_pixel_id, meta_access_token,
      kyc_status, kyc_pan, kyc_aadhaar, kyc_gst, kyc_bank_account, kyc_ifsc,
      payment_enabled, upi_id, accept_donations, donation_amounts,
      automation_enabled, auto_dm_enabled, auto_dm_message, auto_reply_enabled,
      status, seo_title, seo_desc
    } = req.body

    if (!username) return res.status(400).json({ success: false, error: 'Username required' })

    const uname = username.toLowerCase().replace(/[^a-z0-9_]/g, '')
    const existing = await dbFindOne(db.digiprofiles, { username: uname })
    if (existing) return res.status(400).json({ success: false, error: 'Username already taken' })

    const profile = await dbInsert(db.digiprofiles, {
      username: uname,
      display_name: display_name || username,
      email: email || '',
      phone: phone || '',
      bio: bio || '',
      avatar: avatar || '',
      cover_image: cover_image || '',
      theme_color: theme_color || '#6366f1',
      theme_style: theme_style || 'minimal',
      category: category || 'creator',

      // Links
      links: links || [],
      products: products || [],
      social_links: social_links || {},

      // Razorpay
      razorpay_key_id: razorpay_key_id || '',
      razorpay_key_secret: razorpay_key_secret || '',
      payment_enabled: !!payment_enabled,
      upi_id: upi_id || '',
      accept_donations: !!accept_donations,
      donation_amounts: donation_amounts || [49, 99, 199, 499],

      // Instagram / Meta
      instagram_username: instagram_username || '',
      instagram_access_token: instagram_access_token || '',
      instagram_app_id: instagram_app_id || '',
      instagram_app_secret: instagram_app_secret || '',
      meta_pixel_id: meta_pixel_id || '',
      meta_access_token: meta_access_token || '',

      // Automation
      automation_enabled: !!automation_enabled,
      auto_dm_enabled: !!auto_dm_enabled,
      auto_dm_message: auto_dm_message || '',
      auto_reply_enabled: !!auto_reply_enabled,

      // KYC
      kyc_status: kyc_status || 'pending',
      kyc_pan: kyc_pan || '',
      kyc_aadhaar: kyc_aadhaar || '',
      kyc_gst: kyc_gst || '',
      kyc_bank_account: kyc_bank_account || '',
      kyc_ifsc: kyc_ifsc || '',

      // Meta
      status: status || 'active',
      seo_title: seo_title || display_name || username,
      seo_desc: seo_desc || bio || '',
      views: 0,
      clicks: 0,
      created_at: new Date(),
      updated_at: new Date()
    })

    // Notification
    await dbInsert(db.notifications, {
      type: 'new_digiprofile',
      title: 'New DigiProfile Created',
      message: `@${uname} profile created`,
      data: { profileId: profile._id },
      read: false,
      created_at: new Date()
    })

    res.status(201).json({ success: true, data: profile })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ===== ADMIN: Update profile =====
router.put('/:id', adminMiddleware, async (req, res) => {
  try {
    const updates = { ...req.body, updated_at: new Date() }
    if (updates.username) updates.username = updates.username.toLowerCase().replace(/[^a-z0-9_]/g, '')

    await dbUpdate(db.digiprofiles, { _id: req.params.id }, { $set: updates })
    const profile = await dbFindOne(db.digiprofiles, { _id: req.params.id })
    res.json({ success: true, data: profile })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ===== ADMIN: Delete profile =====
router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    await dbRemove(db.digiprofiles, { _id: req.params.id })
    res.json({ success: true, message: 'Profile deleted' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ===== PUBLIC: Track link click =====
router.post('/p/:username/click', async (req, res) => {
  try {
    const { linkId } = req.body
    await dbUpdate(db.digiprofiles, { username: req.params.username }, { $inc: { clicks: 1 } })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ===== PUBLIC: Process donation =====
router.post('/p/:username/donate', async (req, res) => {
  try {
    const { amount, name, message } = req.body
    const profile = await dbFindOne(db.digiprofiles, { username: req.params.username })
    if (!profile) return res.status(404).json({ success: false, error: 'Profile not found' })
    if (!profile.accept_donations) return res.status(400).json({ success: false, error: 'Donations not enabled' })

    // In production: create Razorpay order here
    const orderId = 'don_' + Date.now()
    res.json({
      success: true,
      data: {
        order_id: orderId,
        amount,
        currency: 'INR',
        razorpay_key_id: profile.razorpay_key_id,
        profile_name: profile.display_name
      }
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router
