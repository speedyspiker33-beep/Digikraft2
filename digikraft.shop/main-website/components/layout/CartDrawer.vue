<template>
  <Teleport to="body">
    <Transition name="fade">
      <div 
        v-if="cartStore.isOpen"
        class="fixed inset-0 bg-black/50 z-[100]"
        @click="cartStore.closeCart"
      ></div>
    </Transition>
    
    <Transition name="slide">
      <div 
        v-if="cartStore.isOpen"
        class="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col"
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 class="text-lg font-bold text-gray-900">Shopping Cart ({{ cartStore.itemCount }})</h2>
          <button 
            @click="cartStore.closeCart"
            class="text-gray-400 hover:text-gray-600"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Cart Items -->
        <div class="flex-1 overflow-y-auto p-6">
          <div v-if="cartStore.items.length === 0" class="text-center py-12">
            <span class="material-symbols-outlined text-6xl text-gray-300 mb-4">shopping_cart</span>
            <p class="text-gray-500">Your cart is empty</p>
          </div>

          <div v-else class="space-y-4">
            <div 
              v-for="item in cartStore.items" 
              :key="item.product.id"
              class="flex gap-4 p-4 border border-gray-100 rounded-lg"
            >
              <img 
                :src="item.product.image || item.product.images?.[0] || 'https://via.placeholder.com/80'" 
                :alt="item.product.name"
                class="w-20 h-20 object-cover rounded bg-gray-100"
              />
              <div class="flex-1">
                <h3 class="font-bold text-sm text-gray-900 mb-1">{{ item.product.name }}</h3>
                <p class="text-xs text-gray-500 mb-2">by {{ item.product.author }}</p>
                <div class="flex items-center gap-2">
                  <button 
                    @click="cartStore.updateQuantity(item.product.id, item.quantity - 1)"
                    class="size-6 border border-gray-200 rounded flex items-center justify-center hover:bg-gray-50"
                  >
                    <span class="material-symbols-outlined text-sm">remove</span>
                  </button>
                  <span class="text-sm font-medium">{{ item.quantity }}</span>
                  <button 
                    @click="cartStore.updateQuantity(item.product.id, item.quantity + 1)"
                    class="size-6 border border-gray-200 rounded flex items-center justify-center hover:bg-gray-50"
                  >
                    <span class="material-symbols-outlined text-sm">add</span>
                  </button>
                </div>
              </div>
              <div class="text-right">
                <p class="font-bold text-primary">₹{{ (item.product.originalPrice || item.product.price).toFixed(2) }}</p>
                <button 
                  @click="cartStore.removeItem(item.product.id)"
                  class="text-xs text-red-500 hover:text-red-700 mt-2"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="border-t border-gray-100 p-6 space-y-4">
          <div class="flex justify-between items-center text-lg font-bold">
            <span>Total:</span>
            <span class="text-primary">₹{{ cartStore.total.toFixed(2) }}</span>
          </div>
          
          <div class="space-y-2">
            <button 
              @click="handleCheckout"
              :disabled="cartStore.items.length === 0"
              class="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Proceed to Checkout
            </button>
            <button 
              @click="cartStore.closeCart"
              class="w-full border border-gray-200 py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useCartStore } from '~/stores/cart'

const cartStore = useCartStore()

const handleCheckout = () => {
  cartStore.closeCart()
  navigateTo('/checkout')
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s;
}
.slide-enter-from, .slide-leave-to {
  transform: translateX(100%);
}
</style>
