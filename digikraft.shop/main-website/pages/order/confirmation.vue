<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 px-6">
    <div class="max-w-4xl mx-auto">
      <!-- Success Header -->
      <div class="text-center mb-12">
        <div class="size-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
          <span class="material-symbols-outlined text-green-600 text-5xl">check_circle</span>
        </div>
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
        <p class="text-xl text-gray-600 mb-2">Thank you for your purchase</p>
        <p class="text-gray-500">Order #{{ orderId }}</p>
      </div>

      <!-- Order Details -->
      <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
        <div class="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 mb-2">Order Details</h2>
            <p class="text-gray-600">{{ orderDate }}</p>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-600 mb-1">Total Amount</p>
            <p class="text-3xl font-bold text-primary">${{ total.toFixed(2) }}</p>
          </div>
        </div>

        <!-- Purchased Items -->
        <div class="space-y-4 mb-6">
          <h3 class="font-bold text-gray-900 mb-4">Your Digital Products</h3>
          <div v-for="item in items" :key="item.id" class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <img :src="item.image" :alt="item.name" class="size-20 rounded-lg object-cover" />
            <div class="flex-1">
              <h4 class="font-bold text-gray-900 mb-1">{{ item.name }}</h4>
              <p class="text-sm text-gray-600 mb-2">by {{ item.author }}</p>
              <p class="text-sm font-bold text-primary">${{ item.price.toFixed(2) }}</p>
            </div>
            <button class="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-blue-700 transition-all flex items-center gap-2">
              <span class="material-symbols-outlined">download</span>
              Download
            </button>
          </div>
        </div>

        <!-- Download All Button -->
        <button class="w-full bg-gradient-to-r from-primary to-blue-700 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2">
          <span class="material-symbols-outlined">download</span>
          Download All Files
        </button>
      </div>

      <!-- Additional Info -->
      <div class="grid md:grid-cols-2 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-start gap-3">
            <div class="size-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span class="material-symbols-outlined text-primary">mail</span>
            </div>
            <div>
              <h3 class="font-bold text-gray-900 mb-2">Confirmation Email Sent</h3>
              <p class="text-sm text-gray-600">
                We've sent a confirmation email with download links to your email address. 
                Check your spam folder if you don't see it.
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-start gap-3">
            <div class="size-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span class="material-symbols-outlined text-purple-600">cloud_download</span>
            </div>
            <div>
              <h3 class="font-bold text-gray-900 mb-2">Lifetime Access</h3>
              <p class="text-sm text-gray-600">
                All your purchases are saved in your account. You can re-download them 
                anytime from your dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <NuxtLink 
          to="/account" 
          class="px-8 py-4 bg-white border-2 border-gray-200 text-gray-900 rounded-xl font-bold hover:border-primary hover:bg-primary/5 transition-all text-center"
        >
          View My Account
        </NuxtLink>
        <NuxtLink 
          to="/products" 
          class="px-8 py-4 bg-gradient-to-r from-primary to-blue-700 text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all text-center"
        >
          Continue Shopping
        </NuxtLink>
      </div>

      <!-- Support -->
      <div class="mt-12 text-center">
        <p class="text-gray-600 mb-2">Need help with your order?</p>
        <NuxtLink to="/contact" class="text-primary font-bold hover:text-blue-700">
          Contact Support
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'auth'
})

useHead({
  title: 'Order Confirmation',
  meta: [
    { name: 'description', content: 'Your order has been confirmed' }
  ]
})

const route = useRoute()
const orderId = computed(() => route.query.id || 'DK' + Math.random().toString(36).substring(7).toUpperCase())

const orderDate = new Date().toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})

// Mock order data
const items = [
  {
    id: 1,
    name: 'Premium UI Kit Bundle',
    author: 'Design Studio',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop'
  },
  {
    id: 2,
    name: 'Modern Icon Set',
    author: 'Icon Masters',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=300&fit=crop'
  }
]

const total = computed(() => items.reduce((sum, item) => sum + item.price, 0))
</script>
