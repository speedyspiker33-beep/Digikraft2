import { defineStore } from 'pinia'
import type { User } from '~/types'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
    isAuthenticated: false
  }),

  actions: {
    async login(email: string, password: string) {
      try {
        const config = useRuntimeConfig()
        const response = await $fetch<any>(`${config.public.apiBase}/customer/login`, {
          method: 'POST',
          body: { email, password }
        })
        this.token = response.token
        this.user = response.user
        this.isAuthenticated = true
        this.saveToLocalStorage()
        return { success: true }
      } catch (error: any) {
        return { success: false, error: error?.data?.error || 'Invalid credentials' }
      }
    },

    async register(name: string, email: string, password: string) {
      try {
        const config = useRuntimeConfig()
        const response = await $fetch<any>(`${config.public.apiBase}/customer/register`, {
          method: 'POST',
          body: { name, email, password }
        })
        this.token = response.token
        this.user = response.user
        this.isAuthenticated = true
        this.saveToLocalStorage()
        return { success: true }
      } catch (error: any) {
        return { success: false, error: error?.data?.error || 'Registration failed' }
      }
    },

    logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      
      if (import.meta.client) {
        localStorage.removeItem('digikraft_auth')
        localStorage.removeItem('digikraft_cart')
      }
    },

    async fetchUser() {
      if (!this.token) return
      
      try {
        const config = useRuntimeConfig()
        const user = await $fetch(`${config.public.apiBase}/customer/profile`, {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        })
        
        this.user = user as User
      } catch (error) {
        this.logout()
      }
    },

    saveToLocalStorage() {
      if (import.meta.client) {
        localStorage.setItem('digikraft_auth', JSON.stringify({
          user: this.user,
          token: this.token
        }))
      }
    },

    loadFromLocalStorage() {
      if (import.meta.client) {
        const saved = localStorage.getItem('digikraft_auth')
        if (saved) {
          const data = JSON.parse(saved)
          this.user = data.user
          this.token = data.token
          this.isAuthenticated = !!data.token
        }
      }
    }
  }
})
