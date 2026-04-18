const Datastore = require('@seald-io/nedb')
const path = require('path')
const fs = require('fs')
const bcrypt = require('bcryptjs')

const DATA_DIR = path.resolve(process.env.DB_PATH || './data')
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

// Create datastores
const db = {
  products: new Datastore({ filename: path.join(DATA_DIR, 'products.db'), autoload: true }),
  categories: new Datastore({ filename: path.join(DATA_DIR, 'categories.db'), autoload: true }),
  customers: new Datastore({ filename: path.join(DATA_DIR, 'customers.db'), autoload: true }),
  orders: new Datastore({ filename: path.join(DATA_DIR, 'orders.db'), autoload: true }),
  downloads: new Datastore({ filename: path.join(DATA_DIR, 'downloads.db'), autoload: true }),
  coupons: new Datastore({ filename: path.join(DATA_DIR, 'coupons.db'), autoload: true }),
  licenses: new Datastore({ filename: path.join(DATA_DIR, 'licenses.db'), autoload: true }),
  reviews: new Datastore({ filename: path.join(DATA_DIR, 'reviews.db'), autoload: true }),
  notifications: new Datastore({ filename: path.join(DATA_DIR, 'notifications.db'), autoload: true }),
  settings: new Datastore({ filename: path.join(DATA_DIR, 'settings.db'), autoload: true }),
  workflow_logs: new Datastore({ filename: path.join(DATA_DIR, 'workflow_logs.db'), autoload: true }),
  satellite_pages: new Datastore({ filename: path.join(DATA_DIR, 'satellite_pages.db'), autoload: true }),
  blog_posts: new Datastore({ filename: path.join(DATA_DIR, 'blog_posts.db'), autoload: true }),
  vendors: new Datastore({ filename: path.join(DATA_DIR, 'vendors.db'), autoload: true }),
  subscriptions: new Datastore({ filename: path.join(DATA_DIR, 'subscriptions.db'), autoload: true }),
  product_files: new Datastore({ filename: path.join(DATA_DIR, 'product_files.db'), autoload: true }),
  digiprofiles: new Datastore({ filename: path.join(DATA_DIR, 'digiprofiles.db'), autoload: true }),
  affiliates: new Datastore({ filename: path.join(DATA_DIR, 'affiliates.db'), autoload: true }),
  affiliate_clicks: new Datastore({ filename: path.join(DATA_DIR, 'affiliate_clicks.db'), autoload: true }),
  affiliate_conversions: new Datastore({ filename: path.join(DATA_DIR, 'affiliate_conversions.db'), autoload: true }),
  email_templates: new Datastore({ filename: path.join(DATA_DIR, 'email_templates.db'), autoload: true }),
}

// Promisify helpers
const dbFind = (store, query = {}, sort = {}, limit = 0) => new Promise((res, rej) => {
  let cursor = store.find(query).sort(sort)
  if (limit > 0) cursor = cursor.limit(limit)
  cursor.exec((err, docs) => err ? rej(err) : res(docs))
})

const dbFindOne = (store, query) => new Promise((res, rej) =>
  store.findOne(query, (err, doc) => err ? rej(err) : res(doc))
)

const dbInsert = (store, doc) => new Promise((res, rej) =>
  store.insert(doc, (err, newDoc) => err ? rej(err) : res(newDoc))
)

const dbUpdate = (store, query, update, options = {}) => new Promise((res, rej) =>
  store.update(query, update, options, (err, n) => err ? rej(err) : res(n))
)

const dbRemove = (store, query, options = {}) => new Promise((res, rej) =>
  store.remove(query, options, (err, n) => err ? rej(err) : res(n))
)

const dbCount = (store, query = {}) => new Promise((res, rej) =>
  store.count(query, (err, n) => err ? rej(err) : res(n))
)

// Auto-increment ID helper
const getNextId = async (store) => {
  const docs = await dbFind(store)
  if (!docs.length) return 1
  const maxId = Math.max(...docs.map(d => parseInt(d.id) || 0))
  return maxId + 1
}

async function initDB() {
  // Seed categories
  const catCount = await dbCount(db.categories)
  if (catCount === 0) {
    const cats = [
      { id: 1, name: 'Graphics', slug: 'graphics', description: 'Premium graphics and illustrations', icon: '🎨', color: '#6366f1', featured: true, status: 'active', sort_order: 1, created_at: new Date() },
      { id: 2, name: 'Fonts', slug: 'fonts', description: 'Professional typefaces and font families', icon: '✍️', color: '#8b5cf6', featured: true, status: 'active', sort_order: 2, created_at: new Date() },
      { id: 3, name: 'Templates', slug: 'templates', description: 'Ready-to-use design templates', icon: '📄', color: '#3b82f6', featured: true, status: 'active', sort_order: 3, created_at: new Date() },
      { id: 4, name: '3D Assets', slug: '3d-assets', description: '3D models, icons and mockups', icon: '🎲', color: '#10b981', featured: true, status: 'active', sort_order: 4, created_at: new Date() },
      { id: 5, name: 'UI Kits', slug: 'ui-kits', description: 'Complete UI design systems', icon: '🖥️', color: '#f59e0b', featured: false, status: 'active', sort_order: 5, created_at: new Date() },
      { id: 6, name: 'Plugins', slug: 'plugins', description: 'Software plugins and extensions', icon: '🔌', color: '#ef4444', featured: false, status: 'active', sort_order: 6, created_at: new Date() },
    ]
    for (const cat of cats) await dbInsert(db.categories, cat)
    console.log('✅ Categories seeded')
  }

  // Seed default settings
  const settingsCount = await dbCount(db.settings)
  if (settingsCount === 0) {
    const settings = [
      { key: 'site_name', value: 'DigiKraft.shop' },
      { key: 'site_tagline', value: 'Premium Digital Marketplace' },
      { key: 'currency', value: 'INR' },
      { key: 'currency_symbol', value: '₹' },
      { key: 'tax_rate', value: '10' },
      { key: 'contact_email', value: 'admin@digikraft.shop' },
      { key: 'whatsapp_number', value: '+91 9999999999' },
    ]
    for (const s of settings) await dbInsert(db.settings, s)
    console.log('✅ Settings seeded')
  }

  // Seed admin user
  const adminCount = await dbCount(db.customers, { role: 'admin' })
  if (adminCount === 0) {
    const hash = await bcrypt.hash('admin123', 10)
    await dbInsert(db.customers, {
      id: 1,
      name: 'Super Admin',
      email: 'admin@digikraft.shop',
      password_hash: hash,
      role: 'admin',
      status: 'active',
      tags: [],
      total_orders: 0,
      total_spent: 0,
      created_at: new Date()
    })
    console.log('✅ Admin user seeded (admin@digikraft.shop / admin123)')
  }
}

module.exports = { db, dbFind, dbFindOne, dbInsert, dbUpdate, dbRemove, dbCount, getNextId, initDB }
