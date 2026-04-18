export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()
  const productsStore = useProductsStore()
  
  // Load auth from localStorage on app init
  if (process.client) {
    const saved = localStorage.getItem('digikraft_auth')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        authStore.token = data.token
        authStore.user = data.user
        authStore.isAuthenticated = true
      } catch (e) {
        console.error('Failed to parse auth data:', e)
      }
    }
    
    // Preload products and categories in background if not cached
    productsStore.fetchProducts()
    productsStore.fetchCategories()
  }
})
