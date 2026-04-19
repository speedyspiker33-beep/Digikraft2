// DigiKraft Backend API Composable
// Connects main website to backend at port 8080

export const useAPI = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()
  const apiBase = config.public.apiBase as string // http://localhost:8080/api

  const authHeaders = computed(() => ({
    Authorization: authStore.token ? `Bearer ${authStore.token}` : ''
  }))

  // ===== PRODUCTS =====
  const fetchProducts = async (params: Record<string, any> = {}) => {
    const query = new URLSearchParams(params).toString()
    return $fetch<any>(`${apiBase}/v1/products${query ? '?' + query : ''}`)
  }

  const fetchProduct = async (idOrSlug: string | number) => {
    return $fetch<any>(`${apiBase}/v1/products/${idOrSlug}`)
  }

  // ===== CATEGORIES =====
  const fetchCategories = async () => {
    return $fetch<any>(`${apiBase}/v1/categories`)
  }

  // ===== ORDERS =====
  const createOrder = async (orderData: {
    items: Array<{ productId: number; quantity: number }>
    payment_method: string
    billing_address: Record<string, string>
    coupon_code?: string
  }) => {
    return $fetch<any>(`${apiBase}/v1/orders`, {
      method: 'POST',
      headers: authHeaders.value,
      body: orderData
    })
  }

  const fetchOrders = async (page = 1) => {
    return $fetch<any>(`${apiBase}/v1/orders?page=${page}`, {
      headers: authHeaders.value
    })
  }

  const fetchOrder = async (id: string | number) => {
    return $fetch<any>(`${apiBase}/v1/orders/${id}`, {
      headers: authHeaders.value
    })
  }

  // ===== DOWNLOADS =====
  const fetchDownloads = async (page = 1) => {
    return $fetch<any>(`${apiBase}/downloads?page=${page}`, {
      headers: authHeaders.value
    })
  }

  const generateDownloadLink = async (downloadId: string, fileId: string) => {
    return $fetch<any>(`${apiBase}/downloads/${downloadId}/files/${fileId}/url`, {
      headers: authHeaders.value
    })
  }

  // ===== COUPONS =====
  const validateCoupon = async (code: string, subtotal: number) => {
    return $fetch<any>(`${apiBase}/v1/coupons/validate`, {
      method: 'POST',
      headers: authHeaders.value,
      body: { code, subtotal }
    })
  }

  // ===== SETTINGS =====
  const fetchPublicSettings = async () => {
    return $fetch<any>(`${apiBase}/v1/settings/public`)
  }

  // ===== HEALTH =====
  const checkHealth = async () => {
    try {
      const res = await $fetch<any>('https://digikraft2-production.up.railway.app/health')
      return res.status === 'ok'
    } catch {
      return false
    }
  }

  return {
    fetchProducts,
    fetchProduct,
    fetchCategories,
    createOrder,
    fetchOrders,
    fetchOrder,
    fetchDownloads,
    generateDownloadLink,
    validateCoupon,
    fetchPublicSettings,
    checkHealth
  }
}
