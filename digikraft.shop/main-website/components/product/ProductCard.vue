<template>
  <div 
    class="bg-white rounded-xl border border-gray-200 overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
    @click="goToProduct"
  >
    <!-- Image -->
    <div 
      class="relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200"
      :class="size === 'large' ? 'aspect-[4/3]' : 'aspect-square'"
    >
      <!-- Badges -->
      <div class="absolute top-3 left-3 z-10 flex flex-col gap-2">
        <span 
          v-if="product.featured"
          class="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-md animate-pulse"
        >
          ⭐ FEATURED
        </span>
        <span 
          v-if="product.originalPrice"
          class="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-md"
        >
          -{{ Math.round((1 - product.price / product.originalPrice) * 100) }}%
        </span>
        <!-- Landing Page Badge -->
        <span 
          v-if="hasLandingPage"
          class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-md flex items-center gap-1"
        >
          🚀 FULL PAGE
        </span>
      </div>

      <!-- Favorite Button -->
      <button 
        @click.stop="toggleFavorite"
        class="absolute top-3 right-3 z-10 size-8 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-lg"
        :class="isFavorite ? 'bg-white' : ''"
      >
        <span 
          :class="[
            'material-symbols-outlined text-lg transition-all duration-300',
            isFavorite 
              ? 'text-red-500 heart-filled' 
              : 'text-gray-400 hover:text-red-400'
          ]"
          :style="isFavorite ? 'font-variation-settings: \'FILL\' 1' : 'font-variation-settings: \'FILL\' 0'"
        >
          favorite
        </span>
      </button>

      <!-- Login Prompt Toast -->
      <Transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-2"
      >
        <div 
          v-if="showLoginPrompt"
          class="absolute top-12 right-3 z-20 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap"
        >
          Login to save to wishlist ❤️
        </div>
      </Transition>

      <img
        :src="product.image" 
        :alt="product.name"
        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        loading="lazy"
      />

      <!-- Quick Add Overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
        <button 
          @click.stop="addToCart"
          class="w-full bg-white text-primary py-2 rounded-lg font-bold hover:bg-primary hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 flex items-center justify-center gap-2"
        >
          <span class="material-symbols-outlined">add_shopping_cart</span>
          Quick Add
        </button>
      </div>
    </div>

    <!-- Content -->
    <div :class="size === 'large' ? 'p-5' : 'p-4'">
      <h4 
        class="font-bold group-hover:text-primary transition-colors mb-2 line-clamp-2"
        :class="size === 'large' ? 'text-base' : 'text-sm'"
      >
        {{ product.name }}
      </h4>
      
      <p 
        v-if="size === 'large'"
        class="text-gray-500 text-sm mb-3 line-clamp-2"
      >
        {{ product.description }}
      </p>

      <!-- Rating -->
      <div v-if="product.rating" class="flex items-center gap-2 mb-3">
        <div class="flex items-center gap-0.5">
          <span v-for="i in 5" :key="i" :class="i <= Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'" class="text-sm">★</span>
        </div>
        <span class="text-xs text-gray-500">({{ product.reviewCount }})</span>
      </div>

      <!-- Price & Actions -->
      <div class="flex justify-between items-center">
        <div>
          <span 
            v-if="product.originalPrice"
            class="text-xs text-gray-400 line-through block"
          >
            {{ formatPrice(product.originalPrice) }}
          </span>
          <span 
            class="font-bold text-gray-900"
            :class="size === 'large' ? 'text-xl' : 'text-lg'"
          >
            {{ formatPrice(product.price) }}
          </span>
        </div>
        
        <div v-if="product.sales" class="text-xs text-gray-500">
          {{ product.sales }} sales
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'
import { useWishlistStore } from '~/stores/wishlist'
import type { Product } from '~/types'

const props = withDefaults(defineProps<{
  product: Product
  size?: 'small' | 'medium' | 'large'
  showBadge?: boolean
}>(), {
  size: 'medium',
  showBadge: false
})

const cartStore = useCartStore()
const authStore = useAuthStore()
const wishlistStore = useWishlistStore()
const { formatPrice } = useCurrency()
const showLoginPrompt = ref(false)

// Reactive wishlist state — no navigation on toggle
const isFavorite = computed(() => wishlistStore.isInWishlist(props.product.id))

// Check if this product has a landing page configured in admin
const hasLandingPage = computed(() => {
  try {
    const pages = JSON.parse(localStorage.getItem('dk_landing_pages') || '[]')
    return pages.some((p: any) => p.slug === props.product.slug && p.status === 'published')
  } catch { return false }
})

// Route to landing page if available, otherwise standard product page
const goToProduct = () => {
  if (hasLandingPage.value) {
    navigateTo(`/product-landing/${props.product.slug}`)
  } else {
    navigateTo(`/product/${props.product.slug}`)
  }
}

// Get auth modal function
const openAuthModal = inject('openAuthModal', (showLogin: boolean) => {})

const addToCart = () => {
  cartStore.addItem(props.product)
}

const toggleFavorite = () => {
  if (!authStore.isAuthenticated) {
    // Show brief tooltip instead of navigating
    showLoginPrompt.value = true
    setTimeout(() => { showLoginPrompt.value = false }, 2000)
    return
  }
  // Just toggle — no navigation
  wishlistStore.toggle(props.product)
}

// Load wishlist on mount
onMounted(() => {
  wishlistStore.load()
})
</script>

<style scoped>
/* Heart fill animation using Material Symbols variable font axis */
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  transition: font-variation-settings 0.3s ease, color 0.3s ease, transform 0.2s ease;
}

/* Filled state */
.heart-filled {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24 !important;
  animation: heartPop 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* Pop animation when filling */
@keyframes heartPop {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.4); }
  70%  { transform: scale(0.9); }
  100% { transform: scale(1); }
}
</style>
