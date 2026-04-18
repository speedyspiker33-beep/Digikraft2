<template>
  <div class="min-h-screen bg-gray-50 pt-[150px] pb-12 px-6 lg:px-12">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-4xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div v-if="cartStore.items.length === 0" class="text-center py-20">
        <div class="inline-flex items-center justify-center size-24 bg-gray-100 rounded-full mb-6">
          <span class="material-symbols-outlined text-5xl text-gray-400">shopping_cart</span>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <p class="text-gray-600 mb-8">Start adding some amazing digital assets!</p>
        <NuxtLink 
          to="/"
          class="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all"
        >
          <span class="material-symbols-outlined">storefront</span>
          Browse Products
        </NuxtLink>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Cart Items -->
        <div class="lg:col-span-2 space-y-4">
          <div 
            v-for="item in cartStore.items" 
            :key="item.product.id"
            class="bg-white rounded-xl p-6 flex gap-6 border border-gray-200 hover:shadow-md transition-all group"
          >
            <img 
              :src="item.product.image" 
              :alt="item.product.name"
              class="w-32 h-32 object-cover rounded-lg"
            />
            <div class="flex-1">
              <h3 class="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                {{ item.product.name }}
              </h3>
              <p class="text-sm text-gray-600 mb-4">{{ item.product.description }}</p>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <button 
                    @click="cartStore.updateQuantity(item.product.id, item.quantity - 1)"
                    class="size-8 flex items-center justify-center border-2 border-gray-200 rounded-lg hover:border-primary hover:text-primary transition-all"
                  >
                    <span class="material-symbols-outlined text-lg">remove</span>
                  </button>
                  <span class="text-sm font-bold w-8 text-center">{{ item.quantity }}</span>
                  <button 
                    @click="cartStore.updateQuantity(item.product.id, item.quantity + 1)"
                    class="size-8 flex items-center justify-center border-2 border-gray-200 rounded-lg hover:border-primary hover:text-primary transition-all"
                  >
                    <span class="material-symbols-outlined text-lg">add</span>
                  </button>
                </div>
                <div class="text-right">
                  <p class="text-xl font-bold text-gray-900">₹{{ (item.product.price * item.quantity).toFixed(2) }}</p>
                  <button 
                    @click="cartStore.removeItem(item.product.id)"
                    class="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl p-6 border border-gray-200 sticky top-[150px] z-40">
            <h2 class="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
            
            <div class="space-y-4 mb-6">
              <div class="flex justify-between text-gray-600">
                <span>Subtotal ({{ cartStore.itemCount }} items)</span>
                <span class="font-bold">₹{{ cartStore.total.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>Tax</span>
                <span class="font-bold">₹0.00</span>
              </div>
              <div class="border-t border-gray-200 pt-4 flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>₹{{ cartStore.total.toFixed(2) }}</span>
              </div>
            </div>

            <button 
              @click="navigateTo('/checkout')"
              class="w-full bg-gradient-to-r from-primary to-blue-700 text-white py-4 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all duration-300 mb-4"
            >
              Proceed to Checkout
            </button>

            <NuxtLink 
              to="/"
              class="block text-center text-sm text-primary hover:text-blue-700 font-medium"
            >
              Continue Shopping
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '~/stores/cart'

const cartStore = useCartStore()

useHead({
  title: 'Shopping Cart'
})
</script>
