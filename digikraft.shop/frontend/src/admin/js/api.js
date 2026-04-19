// ===== DigiKraft Admin API Client =====
// All admin panel API calls go through this module → Backend at port 8080

const API_BASE = 'https://digikraft2-production.up.railway.app/api'
const ADMIN_TOKEN_KEY = 'dk_admin_token'

const AdminAPI = {
  // ===== AUTH =====
  getToken() {
    return localStorage.getItem(ADMIN_TOKEN_KEY)
  },

  setToken(token) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token)
  },

  clearToken() {
    localStorage.removeItem(ADMIN_TOKEN_KEY)
  },

  headers(extra = {}) {
    const token = this.getToken()
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...extra
    }
  },

  async request(method, path, body = null, isFormData = false) {
    const opts = {
      method,
      headers: isFormData
        ? { ...(this.getToken() ? { Authorization: `Bearer ${this.getToken()}` } : {}) }
        : this.headers()
    }
    if (body) opts.body = isFormData ? body : JSON.stringify(body)

    try {
      const res = await fetch(`${API_BASE}${path}`, opts)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
      return data
    } catch (err) {
      console.error(`[API] ${method} ${path}:`, err.message)
      throw err
    }
  },

  get: (path) => AdminAPI.request('GET', path),
  post: (path, body) => AdminAPI.request('POST', path, body),
  put: (path, body) => AdminAPI.request('PUT', path, body),
  delete: (path) => AdminAPI.request('DELETE', path),

  // ===== ADMIN LOGIN =====
  async login(email, password) {
    const data = await this.post('/admin/login', { email, password })
    if (data.token) this.setToken(data.token)
    return data
  },

  // ===== DASHBOARD =====
  getDashboard: () => AdminAPI.get('/v1/dashboard'),
  getStats: () => AdminAPI.get('/admin/stats'),

  // ===== PRODUCTS =====
  getProducts: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return AdminAPI.get(`/v1/products${q ? '?' + q : ''}`)
  },
  getProduct: (id) => AdminAPI.get(`/v1/products/${id}`),
  createProduct: (data) => AdminAPI.post('/v1/products', data),
  updateProduct: (id, data) => AdminAPI.put(`/v1/products/${id}`, data),
  deleteProduct: (id) => AdminAPI.delete(`/v1/products/${id}`),
  bulkImportProducts: (products) => AdminAPI.post('/v1/products/bulk-import', { products }),

  // ===== CATEGORIES =====
  getCategories: () => AdminAPI.get('/v1/categories'),
  createCategory: (data) => AdminAPI.post('/v1/categories', data),
  updateCategory: (id, data) => AdminAPI.put(`/v1/categories/${id}`, data),
  deleteCategory: (id) => AdminAPI.delete(`/v1/categories/${id}`),

  // ===== ORDERS =====
  getOrders: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return AdminAPI.get(`/v1/orders${q ? '?' + q : ''}`)
  },
  getOrder: (id) => AdminAPI.get(`/v1/orders/${id}`),
  updateOrder: (id, data) => AdminAPI.put(`/v1/orders/${id}`, data),

  // ===== CUSTOMERS =====
  getCustomers: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return AdminAPI.get(`/v1/customers${q ? '?' + q : ''}`)
  },
  getCustomer: (id) => AdminAPI.get(`/v1/customers/${id}`),
  updateCustomer: (id, data) => AdminAPI.put(`/v1/customers/${id}`, data),

  // ===== COUPONS =====
  getCoupons: () => AdminAPI.get('/v1/coupons'),
  createCoupon: (data) => AdminAPI.post('/v1/coupons', data),
  updateCoupon: (id, data) => AdminAPI.put(`/v1/coupons/${id}`, data),
  deleteCoupon: (id) => AdminAPI.delete(`/v1/coupons/${id}`),

  // ===== SETTINGS =====
  getSettings: () => AdminAPI.get('/v1/settings'),
  updateSettings: (data) => AdminAPI.put('/v1/settings', data),

  // ===== NOTIFICATIONS =====
  getNotifications: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return AdminAPI.get(`/v1/notifications${q ? '?' + q : ''}`)
  },
  markAllRead: () => AdminAPI.put('/v1/notifications/read-all', {}),

  // ===== WEBHOOKS =====
  triggerStrapiSync: () => AdminAPI.post('/webhook/strapi-sync', {}),

  // ===== REVIEWS =====
  getReviews: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return AdminAPI.get(`/v1/reviews${q ? '?' + q : ''}`)
  },
  updateReview: (id, data) => AdminAPI.put(`/v1/reviews/${id}`, data),
  deleteReview: (id) => AdminAPI.delete(`/v1/reviews/${id}`),

  // ===== BLOG =====
  getBlogPosts: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return AdminAPI.get(`/v1/blog${q ? '?' + q : ''}`)
  },
  getBlogPost: (slug) => AdminAPI.get(`/v1/blog/${slug}`),
  createBlogPost: (data) => AdminAPI.post('/v1/blog', data),
  updateBlogPost: (slug, data) => AdminAPI.put(`/v1/blog/${slug}`, data),
  deleteBlogPost: (slug) => AdminAPI.delete(`/v1/blog/${slug}`),

  // ===== SATELLITE PAGES =====
  getSatellitePages: () => AdminAPI.get('/v1/satellite-pages'),
  createSatellitePage: (data) => AdminAPI.post('/v1/satellite-pages', data),
  updateSatellitePage: (slug, data) => AdminAPI.put(`/v1/satellite-pages/${slug}`, data),
  deleteSatellitePage: (slug) => AdminAPI.delete(`/v1/satellite-pages/${slug}`),

  // ===== PRODUCT FILES =====
  getProductFiles: (productId) => AdminAPI.get(`/v1/product-files/${productId}`),
  addProductFile: (productId, data) => AdminAPI.post(`/v1/product-files/${productId}`, data),
  deleteProductFile: (productId, fileId) => AdminAPI.delete(`/v1/product-files/${productId}/${fileId}`),

  // ===== SUBSCRIPTIONS =====
  getSubscriptions: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return AdminAPI.get(`/v1/subscriptions${q ? '?' + q : ''}`)
  },
  createSubscription: (data) => AdminAPI.post('/v1/subscriptions', data),
  updateSubscription: (id, data) => AdminAPI.put(`/v1/subscriptions/${id}`, data),
  deleteSubscription: (id) => AdminAPI.delete(`/v1/subscriptions/${id}`),

  // ===== LICENSES =====
  getLicenses: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return AdminAPI.get(`/v1/licenses${q ? '?' + q : ''}`)
  },
  addLicensesToPool: (keys, program) => AdminAPI.post('/v1/licenses', { keys, program }),
  issueLicense: (data) => AdminAPI.post('/v1/licenses/issue', data),
  deleteLicense: (id) => AdminAPI.delete(`/v1/licenses/${id}`),

  // ===== VENDORS =====
  getVendors: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return AdminAPI.get(`/v1/vendors${q ? '?' + q : ''}`)
  },
  createVendor: (data) => AdminAPI.post('/v1/vendors', data),
  updateVendor: (id, data) => AdminAPI.put(`/v1/vendors/${id}`, data),
  deleteVendor: (id) => AdminAPI.delete(`/v1/vendors/${id}`),

  // ===== DIGIPROFILE =====
  getDigiProfiles: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return AdminAPI.get(`/v1/digiprofile${q ? '?' + q : ''}`)
  },
  getDigiProfile: (id) => AdminAPI.get(`/v1/digiprofile/${id}`),
  createDigiProfile: (data) => AdminAPI.post('/v1/digiprofile', data),
  updateDigiProfile: (id, data) => AdminAPI.put(`/v1/digiprofile/${id}`, data),
  deleteDigiProfile: (id) => AdminAPI.delete(`/v1/digiprofile/${id}`),
  checkDigiUsername: (username) => AdminAPI.get(`/v1/digiprofile/check/${username}`),

  // ===== ANALYTICS =====
  getAnalytics: (range = 30) => AdminAPI.get(`/v1/analytics?range=${range}`),

  // ===== AI AUTOMATION =====
  getAIConfig: () => AdminAPI.get('/v1/ai/config'),
  saveAIConfig: (data) => AdminAPI.put('/v1/ai/config', data),
  aiAnalyzeUrl: (url) => AdminAPI.post('/v1/ai/analyze-url', { url }),
  aiCreateProduct: (data) => AdminAPI.post('/v1/ai/create-product', data),
  aiBatchCreate: (products) => AdminAPI.post('/v1/ai/batch-create', { products }),

  // ===== HEALTH CHECK =====
  async checkHealth() {
    try {
      const res = await fetch('http://localhost:8080/health')
      return res.ok
    } catch {
      return false
    }
  }
}

// Make globally available
window.AdminAPI = AdminAPI

// Auto-check backend on load and auto-login admin
document.addEventListener('DOMContentLoaded', async () => {
  const healthy = await AdminAPI.checkHealth()
  if (!healthy) {
    console.warn('[AdminAPI] Backend not reachable at http://localhost:8080')
    console.warn('[AdminAPI] Run: node server.js in digikraft.shop/backend/')
    return
  }
  console.log('[AdminAPI] ✅ Backend connected at http://localhost:8080')

  // Auto-login with default admin if no token stored
  if (!AdminAPI.getToken()) {
    try {
      await AdminAPI.login('admin@digikraft.shop', 'admin123')
      console.log('[AdminAPI] ✅ Auto-logged in as admin')
    } catch (e) {
      console.warn('[AdminAPI] Auto-login failed:', e.message)
    }
  }

  // Load initial stats
  try {
    const stats = await AdminAPI.getStats()
    if (stats.success) {
      const s = stats.data
      const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val }
      el('cnt-p', s.products || 0)
      el('cnt-o', s.orders || 0)
      if (s.notifications > 0) {
        const badge = document.getElementById('notif-badge')
        if (badge) { badge.style.display = 'flex'; badge.textContent = s.notifications }
      }
    }
  } catch (e) {}

  // Sync notifications from backend
  if (window.Notifications) {
    await Notifications.syncFromBackend()
  }
})
