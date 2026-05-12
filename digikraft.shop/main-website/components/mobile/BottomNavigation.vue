<template>
  <div 
    v-if="isMobile"
    class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden"
  >
    <div class="flex items-center justify-around h-16 max-w-md mx-auto">
      <!-- Home -->
      <NuxtLink 
        to="/"
        class="flex flex-col items-center justify-center gap-1 flex-1 h-full text-gray-600 hover:text-primary transition-colors"
        :class="isActive('/') ? 'text-primary' : ''"
      >
        <span class="material-symbols-outlined text-2xl">home</span>
        <span class="text-[10px] font-medium">Home</span>
      </NuxtLink>

      <!-- Search -->
      <button 
        @click="showSearchModal = true"
        class="flex flex-col items-center justify-center gap-1 flex-1 h-full text-gray-600 hover:text-primary transition-colors"
      >
        <span class="material-symbols-outlined text-2xl">search</span>
        <span class="text-[10px] font-medium">Search</span>
      </button>

      <!-- Cart -->
      <button 
        @click="cartStore.toggleCart"
        class="flex flex-col items-center justify-center gap-1 flex-1 h-full text-gray-600 hover:text-primary transition-colors relative"
      >
        <span class="material-symbols-outlined text-2xl">shopping_cart</span>
        <span 
          v-if="cartStore.itemCount > 0"
          class="absolute top-1 right-2 size-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center"
        >
          {{ cartStore.itemCount }}
        </span>
        <span class="text-[10px] font-medium">Cart</span>
      </button>

      <!-- Wishlist -->
      <button 
        @click="handleWishlistClick"
        class="flex flex-col items-center justify-center gap-1 flex-1 h-full text-gray-600 hover:text-primary transition-colors relative"
      >
        <span class="material-symbols-outlined text-2xl">favorite</span>
        <span 
          v-if="wishlistCount > 0"
          class="absolute top-1 right-2 size-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center"
        >
          {{ wishlistCount }}
        </span>
        <span class="text-[10px] font-medium">Saved</span>
      </button>

      <!-- Account -->
      <NuxtLink 
        v-if="authStore.isAuthenticated"
        to="/account"
        class="flex flex-col items-center justify-center gap-1 flex-1 h-full text-gray-600 hover:text-primary transition-colors"
        :class="isActive('/account') ? 'text-primary' : ''"
      >
        <span class="material-symbols-outlined text-2xl">account_circle</span>
        <span class="text-[10px] font-medium">Account</span>
      </NuxtLink>
      <button 
        v-else
        @click="openAuthModal(true)"
        class="flex flex-col items-center justify-center gap-1 flex-1 h-full text-gray-600 hover:text-primary transition-colors"
      >
        <span class="material-symbols-outlined text-2xl">login</span>
        <span class="text-[10px] font-medium">Login</span>
      </button>
    </div>
  </div>

  <!-- Search Modal -->
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
        v-if="showSearchModal"
        class="fixed inset-0 bg-black/50 z-50 md:hidden"
        @click="showSearchModal = false"
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
        v-if="showSearchModal"
        class="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 md:hidden max-h-[90vh] overflow-y-auto"
      >
        <!-- Header -->
        <div class="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-2xl">
          <h3 class="font-bold text-lg">Search Products</h3>
          <button 
            @click="showSearchModal = false"
            class="text-gray-600 hover:text-gray-900"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Search Input -->
        <div class="p-4 border-b border-gray-200">
          <div class="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-primary transition-all">
            <input 
              v-model="searchQuery"
              type="text" 
              class="flex-1 border-none text-sm px-4 py-3 focus:ring-0 focus:outline-none bg-transparent" 
              placeholder="Search assets..."
              @keyup.enter="handleSearch"
              autofocus
            />
            <button 
              @click="handleSearch"
              class="bg-primary text-white px-4 py-3 hover:bg-blue-700 transition-colors"
            >
              <span class="material-symbols-outlined">search</span>
            </button>
          </div>
        </div>

        <!-- Recent Searches -->
        <div v-if="recentSearches.length > 0" class="p-4 border-b border-gray-200">
          <h4 class="text-sm font-bold text-gray-700 mb-3">Recent Searches</h4>
          <div class="flex flex-wrap gap-2">
            <button 
              v-for="search in recentSearches"
              :key="search"
              @click="searchQuery = search; handleSearch()"
              class="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
            >
              {{ search }}
            </button>
          </div>
        </div>

        <!-- Popular Categories -->
        <div class="p-4">
          <h4 class="text-sm font-bold text-gray-700 mb-3">Popular Categories</h4>
          <div class="space-y-2">
            <button 
              v-for="category in popularCategories"
              :key="category"
              @click="searchQuery = category; handleSearch()"
              class="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors text-gray-700 flex items-center justify-between"
            >
              <span>{{ category }}</span>
              <span class="material-symbols-outlined text-gray-400">arrow_forward</span>
            </button>
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

const cartStore = useCartStore()
const authStore = useAuthStore()
const wishlistStore = useWishlistStore()
const router = useRouter()
const route = useRoute()

const openAuthModal = inject('openAuthModal', (showLogin: boolean) => {})

const isMobile = ref(false)
const showSearchModal = ref(false)
const searchQuery = ref('')
const recentSearches = ref<string[]>([])

const wishlistCount = computed(() => wishlistStore.count)

const popularCategories = [
  'Graphics',
  'Fonts',
  'Templates',
  '3D Assets',
  'Icons',
  'Illustrations',
  'Web Templates'
]

const isActive = (path: string) => {
  return route.path === path
}

const handleWishlistClick = () => {
  if (!authStore.isAuthenticated) {
    openAuthModal(true)
  } else {
    navigateTo('/account?tab=favorites')
  }
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    // Add to recent searches
    if (!recentSearches.value.includes(searchQuery.value)) {
      recentSearches.value.unshift(searchQuery.value)
      if (recentSearches.value.length > 5) {
        recentSearches.value.pop()
      }
      localStorage.setItem('dk_recent_searches', JSON.stringify(recentSearches.value))
    }

    showSearchModal.value = false
    navigateTo(`/search?q=${encodeURIComponent(searchQuery.value)}`)
  }
}

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  
  // Load recent searches
  const saved = localStorage.getItem('dk_recent_searches')
  if (saved) {
    recentSearches.value = JSON.parse(saved)
  }

  wishlistStore.load()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
/* Ensure bottom nav doesn't overlap content */
:global(body) {
  padding-bottom: 4rem;
}

@media (min-width: 768px) {
  :global(body) {
    padding-bottom: 0;
  }
}
</style>
