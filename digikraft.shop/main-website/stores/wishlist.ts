// ===== WISHLIST STORE =====
import { defineStore } from 'pinia'
import type { Product } from '~/types'

export const useWishlistStore = defineStore('wishlist', {
  state: () => ({
    items: [] as Product[]
  }),

  getters: {
    count: (state) => state.items.length,
    isInWishlist: (state) => (productId: number) =>
      state.items.some(p => p.id === productId)
  },

  actions: {
    toggle(product: Product) {
      const idx = this.items.findIndex(p => p.id === product.id)
      if (idx > -1) {
        this.items.splice(idx, 1)
      } else {
        this.items.push(product)
      }
      this.persist()
    },

    remove(productId: number) {
      this.items = this.items.filter(p => p.id !== productId)
      this.persist()
    },

    clear() {
      this.items = []
      this.persist()
    },

    persist() {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('dk_wishlist', JSON.stringify(this.items))
        this.syncToBackend()
      }
    },

    async syncToBackend() {
      if (typeof localStorage === 'undefined') return
      try {
        const authData = localStorage.getItem('digikraft_auth')
        if (!authData) return
        const { token } = JSON.parse(authData)
        if (!token) return
        const wishlistPayload = this.items.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.image,
          category: (p as any).category || ''
        }))
        await fetch('http://localhost:8080/api/customer/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ wishlist: wishlistPayload })
        })
      } catch { /* non-blocking */ }
    },

    load() {
      if (typeof localStorage !== 'undefined') {
        try {
          const saved = localStorage.getItem('dk_wishlist')
          if (saved) this.items = JSON.parse(saved)
        } catch {}
      }
    }
  }
})
