<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="isOpen"
        class="fixed inset-0 bg-black/50 z-40"
        @click="close"
      />
    </Transition>

    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="translate-y-full"
      enter-to-class="translate-y-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="translate-y-0"
      leave-to-class="translate-y-full"
    >
      <div 
        v-if="isOpen"
        class="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[90vh] overflow-y-auto"
      >
        <!-- Handle Bar -->
        <div class="flex justify-center pt-3 pb-2">
          <div class="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>

        <!-- Close Button -->
        <button 
          @click="close"
          class="absolute top-4 right-4 text-gray-600 hover:text-gray-900 z-10"
        >
          <span class="material-symbols-outlined">close</span>
        </button>

        <!-- Product Content -->
        <div v-if="product" class="p-4 space-y-4">
          <!-- Image -->
          <div class="relative overflow-hidden rounded-xl bg-gray-100 aspect-square">
            <img
              :src="product.image"
              :alt="product.name"
              class="w-full h-full object-cover"
            />
            <!-- Badges -->
            <div class="absolute top-3 left-3 flex flex-col gap-2">
              <span 
                v-if="product.featured"
                class="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full"
              >
                ⭐ FEATURED
              </span>
              <span 
                v-if="product.originalPrice"
                class="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full"
              >
                -{{ Math.round((1 - product.price / product.originalPrice) * 100) }}%
              </span>
            </div>

            <!-- Favorite Button -->
            <button 
              @click.stop="toggleFavorite"
              class="absolute top-3 right-3 size-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-lg"
            >
              <span 
                :class="[
                  'material-symbols-outlined text-lg transition-all duration-300',
                  isFavorite 
                    ? 'text-red-500' 
                    : 'text-gray-400 hover:text-red-400'
                ]"
                :style="isFavorite ? 'font-variation-settings: \'FILL\' 1' : 'font-variation-settings: \'FILL\' 0'"
              >
                favorite
              </span>
            </button>
          </div>

          <!-- Product Info -->
          <div>
            <h2 class="text-xl font-bold text-gray-900 mb-2">{{ product.name }}</h2>
            <p class="text-gray-600 text-sm mb-4">{{ product.description }}</p>

            <!-- Rating -->
            <div v-if="product.rating" class="flex items-center gap-2 mb-4">
              <div class="flex items-center gap-0.5">
                <span v-for="i in 5" :key="i" :class="i <= Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'" class="text-sm">★</span>
              </div>
              <span class="text-xs text-gray-500">({{ product.reviewCount }} reviews)</span>
            </div>

            <!-- Price -->
            <div class="mb-4">
              <span 
                v-if="product.originalPrice"
                class="text-sm text-gray-400 line-through block mb-1"
              >
                {{ formatPrice(product.originalPrice) }}
              </span>
              <span class="text-2xl font-bold text-gray-900">
                {{ formatPrice(product.price) }}
              </span>
            </div>

            <!-- Stock Status -->
            <div class="mb-4 p-3 rounded-lg" :class="product.inStock ? 'bg-green-50' : 'bg-red-50'">
              <span :class="product.inStock ? 'text-green-700' : 'text-red-700'" class="text-sm font-medium">
                {{ product.inStock ? '✓ In Stock' : '✗ Out of Stock' }}
              </span>
            </div>

            <!-- Features -->
            <div v-if="product.features && product.features.length > 0" class="mb-4">
              <h4 class="font-bold text-gray-900 mb-2 text-sm">Features</h4>
              <ul class="space-y-1">
                <li v-for="(feature, idx) in product.features" :key="idx" class="text-sm text-gray-600 flex items-start gap-2">
                  <span class="text-primary mt-0.5">✓</span>
                  <span>{{ feature }}</span>
                </li>
              </ul>
            </div>

            <!-- Actions -->
            <div class="space-y-3 pt-4 border-t border-gray-200">
              <button 
                @click="addToCart"
                :disabled="!product.inStock"
                class="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span class="material-symbols-outlined">add_shopping_cart</span>
                Add to Cart
              </button>

              <button 
                @click="viewFullDetails"
                class="w-full border border-gray-200 text-gray-900 py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <span class="material-symbols-outlined">open_in_new</span>
                View Full Details
              </button>

              <!-- Share Button -->
              <button 
                @click="shareProduct"
                class="w-full border border-gray-200 text-gray-900 py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <span class="material-symbols-outlined">share</span>
                Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useCartStore } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'
import { useWishlistStore } from '~/stores/wishlist'
import type { Product } from '~/types'

const cartStore = useCartStore()
const authStore = useAuthStore()
const wishlistStore = useWishlistStore()
const { formatPrice } = useCurrency()

const props = defineProps<{
  isOpen: boolean
  product: Product | null
}>()

const emit = defineEmits<{
  close: []
}>()

const isFavorite = computed(() => {
  if (!props.product) return false
  return wishlistStore.isInWishlist(props.product.id)
})

const close = () => {
  emit('close')
}

const toggleFavorite = () => {
  if (!authStore.isAuthenticated) {
    const openAuthModal = inject('openAuthModal', (showLogin: boolean) => {})
    openAuthModal(true)
    return
  }
  if (props.product) {
    wishlistStore.toggle(props.product)
  }
}

const addToCart = () => {
  if (props.product) {
    cartStore.addItem(props.product)
    // Show toast notification
    const toast = inject('showToast', (message: string, type: string) => {})
    toast(`${props.product.name} added to cart!`, 'success')
  }
}

const viewFullDetails = () => {
  if (props.product) {
    close()
    navigateTo(`/product/${props.product.slug}`)
  }
}

const shareProduct = async () => {
  if (!props.product) return

  const shareData = {
    title: props.product.name,
    text: props.product.description,
    url: `${window.location.origin}/product/${props.product.slug}`
  }

  if (navigator.share) {
    try {
      await navigator.share(shareData)
    } catch (err) {
      console.log('Share cancelled')
    }
  } else {
    // Fallback: copy to clipboard
    const text = `${shareData.title}\n${shareData.text}\n${shareData.url}`
    await navigator.clipboard.writeText(text)
    const toast = inject('showToast', (message: string, type: string) => {})
    toast('Link copied to clipboard!', 'success')
  }
}

onMounted(() => {
  wishlistStore.load()
})
</script>

<style scoped>
/* Smooth scrolling */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
