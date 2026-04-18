import { defineStore } from 'pinia'
import type { Product, CartItem } from '~/types'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
    isOpen: false
  }),

  getters: {
    itemCount: (state) => state.items.reduce((total, item) => total + item.quantity, 0),
    
    subtotal: (state) => state.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity)
    }, 0),
    
    total: (state) => {
      return state.items.reduce((total, item) => {
        return total + (item.product.price * item.quantity)
      }, 0)
    }
  },

  actions: {
    addItem(product: Product, quantity: number = 1) {
      const existingItem = this.items.find(item => item.product.id === product.id)
      
      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        this.items.push({ product, quantity })
      }
      
      this.saveToLocalStorage()
    },

    removeItem(productId: number) {
      this.items = this.items.filter(item => item.product.id !== productId)
      this.saveToLocalStorage()
    },

    updateQuantity(productId: number, quantity: number) {
      const item = this.items.find(item => item.product.id === productId)
      if (item) {
        item.quantity = quantity
        if (item.quantity <= 0) {
          this.removeItem(productId)
        } else {
          this.saveToLocalStorage()
        }
      }
    },

    clearCart() {
      this.items = []
      this.saveToLocalStorage()
    },

    toggleCart() {
      this.isOpen = !this.isOpen
    },

    closeCart() {
      this.isOpen = false
    },

    saveToLocalStorage() {
      if (import.meta.client) {
        localStorage.setItem('digikraft_cart', JSON.stringify(this.items))
        // Sync to backend if user is logged in
        this.syncToBackend()
      }
    },

    async syncToBackend() {
      if (!import.meta.client) return
      try {
        const authData = localStorage.getItem('digikraft_auth')
        if (!authData) return
        const { token } = JSON.parse(authData)
        if (!token) return
        const cartPayload = this.items.map(i => ({
          id: i.product.id,
          name: i.product.name,
          price: i.product.price,
          image: i.product.image,
          quantity: i.quantity,
          category: i.product.category
        }))
        await fetch('http://localhost:8080/api/customer/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ cart_items: cartPayload })
        })
      } catch { /* non-blocking */ }
    },

    loadFromLocalStorage() {
      if (import.meta.client) {
        const saved = localStorage.getItem('digikraft_cart')
        if (saved) {
          this.items = JSON.parse(saved)
        }
      }
    }
  }
})
