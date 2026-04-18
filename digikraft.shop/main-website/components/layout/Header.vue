<template>
  <header class="bg-white border-b border-gray-100 px-6 lg:px-12 py-4 sticky top-0 z-[100] shadow-sm">
    <div class="flex items-center gap-8">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-2 shrink-0">
        <div class="size-8 bg-primary rounded-lg flex items-center justify-center">
          <span class="material-symbols-outlined text-white text-xl">bolt</span>
        </div>
        <h1 class="text-xl font-bold tracking-tight text-gray-900">DigiKraft</h1>
      </NuxtLink>

      <!-- Search -->
      <div class="flex-1 max-w-3xl">
        <div class="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-primary transition-all">
          <!-- Category Dropdown -->
          <div class="relative">
            <button
              ref="categoryButton"
              @click.stop="toggleDropdown"
              class="bg-gray-50 border-r border-gray-200 text-xs px-4 py-2.5 hover:bg-gray-100 transition-colors text-gray-700 font-medium flex items-center gap-2 whitespace-nowrap"
            >
              {{ selectedCategory?.name || 'All Categories' }}
              <span class="material-symbols-outlined text-sm leading-none" :class="{ 'rotate-180': showCategoryDropdown }" style="font-size:18px;vertical-align:middle">expand_more</span>
            </button>
          </div>

          <input 
            v-model="searchQuery"
            type="text" 
            class="flex-1 border-none text-sm px-4 focus:ring-0 focus:outline-none bg-transparent" 
            placeholder="Search millions of digital assets..."
            @keyup.enter="handleSearch"
            @focus="showCategoryDropdown = false"
          />
          <button 
            @click="handleSearch"
            class="bg-primary text-white px-6 py-2.5 hover:bg-blue-700 transition-colors"
          >
            <span class="material-symbols-outlined text-xl">search</span>
          </button>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-4 shrink-0">
        <NuxtLink 
          to="/"
          class="text-gray-600 hover:text-primary transition-colors"
          title="Home"
        >
          <span class="material-symbols-outlined text-2xl">home</span>
        </NuxtLink>

        <button 
          @click="handleWishlistClick"
          class="text-gray-600 hover:text-primary transition-colors relative"
          title="Wishlist"
        >
          <span class="material-symbols-outlined text-2xl">favorite</span>
          <span 
            v-if="wishlistCount > 0"
            class="absolute -top-1 -right-1 size-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
          >
            {{ wishlistCount }}
          </span>
        </button>
        
        <template v-if="!authStore.isAuthenticated">
          <button 
            @click="openAuthModal(true)"
            class="text-sm font-bold text-gray-700 hover:text-primary"
          >
            Login
          </button>
          <button 
            @click="openAuthModal(false)"
            class="bg-primary text-white px-5 py-2 text-sm font-bold rounded-lg hover:opacity-90"
          >
            Register
          </button>
        </template>
        <template v-else>
          <NuxtLink 
            to="/account"
            class="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-primary"
          >
            <span class="material-symbols-outlined">account_circle</span>
            {{ authStore.user?.name }}
          </NuxtLink>
        </template>
        
        <div class="h-6 w-[1px] bg-gray-200 mx-2"></div>
        
        <button 
          class="relative text-gray-600 hover:text-primary" 
          @click="cartStore.toggleCart"
        >
          <span class="material-symbols-outlined text-2xl">shopping_cart</span>
          <span 
            v-if="cartStore.itemCount > 0"
            class="absolute -top-1 -right-1 size-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center"
          >
            {{ cartStore.itemCount }}
          </span>
        </button>
      </div>
    </div>

    <!-- Category Dropdown Menu (Teleported to body) -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-1"
      >
        <div
          v-if="showCategoryDropdown"
          ref="dropdownMenu"
          class="fixed w-80 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-96 overflow-y-auto"
          :style="dropdownStyle"
          style="z-index: 99999;"
        >
          <!-- All Categories Option -->
          <button
            @click="selectCategory(null)"
            class="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
            :class="!selectedCategory ? 'bg-primary/5 text-primary font-bold' : 'text-gray-700'"
          >
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined">apps</span>
              <span>All Categories</span>
            </div>
          </button>

          <!-- Category Tree -->
          <div v-for="category in categoryTree" :key="category.id" class="border-b border-gray-100 last:border-0">
            <!-- Parent Category -->
            <button
              @click="toggleCategory(category.id)"
              class="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
              :class="selectedCategory?.id === category.id ? 'bg-primary/5 text-primary font-bold' : 'text-gray-700'"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined">{{ category.icon }}</span>
                  <span class="font-medium">{{ category.name }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-xs text-gray-400">{{ category.count }}</span>
                  <span 
                    v-if="category.subcategories?.length" 
                    class="material-symbols-outlined text-sm transition-transform"
                    :class="{ 'rotate-180': expandedCategories.includes(category.id) }"
                  >
                    expand_more
                  </span>
                </div>
              </div>
            </button>

            <!-- Subcategories -->
            <div v-show="expandedCategories.includes(category.id) && category.subcategories" class="bg-gray-50">
              <button
                v-for="subcategory in category.subcategories"
                :key="subcategory.id"
                @click="selectCategory(subcategory)"
                class="w-full text-left px-4 py-2 pl-12 hover:bg-gray-100 transition-colors text-sm"
                :class="selectedCategory?.id === subcategory.id ? 'text-primary font-bold' : 'text-gray-600'"
              >
                <div class="flex items-center justify-between">
                  <span>{{ subcategory.name }}</span>
                  <span class="text-xs text-gray-400">{{ subcategory.count }}</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </header>
</template>

<script setup lang="ts">
import { useCartStore } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'
import { useWishlistStore } from '~/stores/wishlist'

const cartStore = useCartStore()
const authStore = useAuthStore()
const wishlistStore = useWishlistStore()
const router = useRouter()

// Get auth modal from parent
const openAuthModal = inject('openAuthModal', (showLogin: boolean) => {})

const searchQuery = ref('')
const showCategoryDropdown = ref(false)
const selectedCategory = ref<any>(null)
const expandedCategories = ref<number[]>([])
const categoryButton = ref<HTMLElement | null>(null)
const dropdownMenu = ref<HTMLElement | null>(null)
const dropdownStyle = ref({})
const showToolsDropdown = ref(false)

// Reactive wishlist count from store
const wishlistCount = computed(() => wishlistStore.count)

const handleWishlistClick = () => {
  if (!authStore.isAuthenticated) {
    openAuthModal(true)
  } else {
    navigateTo('/account?tab=favorites')
  }
}

// Calculate dropdown position
const updateDropdownPosition = () => {
  if (categoryButton.value) {
    const rect = categoryButton.value.getBoundingClientRect()
    dropdownStyle.value = {
      top: `${rect.bottom + 8}px`,
      left: `${rect.left}px`
    }
  }
}

// Category tree with subcategories
const categoryTree = [
  {
    id: 1,
    name: 'Graphics',
    icon: 'palette',
    count: '18 items',
    subcategories: [
      { id: 11, name: 'Logos & Branding', count: '3 items' },
      { id: 12, name: 'Illustrations', count: '5 items' },
      { id: 13, name: 'Icons', count: '3 items' },
      { id: 14, name: 'Patterns & Textures', count: '2 items' },
      { id: 15, name: 'Backgrounds', count: '2 items' },
      { id: 16, name: 'Infographics', count: '1 item' },
      { id: 17, name: 'Stickers', count: '1 item' }
    ]
  },
  {
    id: 2,
    name: 'Fonts',
    icon: 'text_fields',
    count: '7 items',
    subcategories: [
      { id: 21, name: 'Serif Fonts', count: '2 items' },
      { id: 22, name: 'Sans Serif Fonts', count: '2 items' },
      { id: 23, name: 'Script & Handwritten', count: '2 items' },
      { id: 24, name: 'Display Fonts', count: '1 item' }
    ]
  },
  {
    id: 3,
    name: 'Templates',
    icon: 'web',
    count: '10 items',
    subcategories: [
      { id: 31, name: 'Web Templates', count: '3 items' },
      { id: 32, name: 'Social Media', count: '2 items' },
      { id: 33, name: 'Print Templates', count: '2 items' },
      { id: 34, name: 'Email Templates', count: '1 item' },
      { id: 35, name: 'Presentations', count: '1 item' },
      { id: 36, name: 'Mobile UI Kits', count: '1 item' }
    ]
  },
  {
    id: 4,
    name: '3D Assets',
    icon: 'view_in_ar',
    count: '4 items',
    subcategories: [
      { id: 41, name: 'Mockups', count: '2 items' },
      { id: 42, name: '3D Characters', count: '1 item' },
      { id: 43, name: 'Textures', count: '1 item' }
    ]
  }
]

const toggleDropdown = () => {
  showCategoryDropdown.value = !showCategoryDropdown.value
  if (showCategoryDropdown.value) {
    nextTick(() => {
      updateDropdownPosition()
    })
  }
  console.log('Dropdown toggled:', showCategoryDropdown.value)
}

const toggleCategory = (categoryId: number) => {
  const index = expandedCategories.value.indexOf(categoryId)
  if (index > -1) {
    expandedCategories.value.splice(index, 1)
  } else {
    expandedCategories.value.push(categoryId)
  }
}

const selectCategory = (category: any) => {
  selectedCategory.value = category
  showCategoryDropdown.value = false
  
  // If a category is selected, navigate to it
  if (category) {
    navigateTo(`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`)
  }
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    const params = new URLSearchParams()
    params.set('q', searchQuery.value)
    if (selectedCategory.value) {
      params.set('category', selectedCategory.value.id.toString())
    }
    navigateTo(`/search?${params.toString()}`)
  }
}

// Close dropdown when clicking outside
onMounted(() => {
  wishlistStore.load()

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    if (
      categoryButton.value && 
      !categoryButton.value.contains(target) &&
      dropdownMenu.value &&
      !dropdownMenu.value.contains(target)
    ) {
      showCategoryDropdown.value = false
    }
    // Close tools dropdown when clicking outside
    const toolsButton = document.querySelector('[data-tools-button]')
    if (toolsButton && !toolsButton.contains(target) && !target.closest('.tools-dropdown')) {
      showToolsDropdown.value = false
    }
  }
  
  const handleScroll = () => {
    if (showCategoryDropdown.value) {
      updateDropdownPosition()
    }
  }
  
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', handleScroll, true)
  window.addEventListener('resize', updateDropdownPosition)
  
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
    window.removeEventListener('scroll', handleScroll, true)
    window.removeEventListener('resize', updateDropdownPosition)
  })
})
</script>

<style scoped>
/* Custom scrollbar for dropdown */
div[style*="z-index: 99999"]::-webkit-scrollbar {
  width: 6px;
}

div[style*="z-index: 99999"]::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

div[style*="z-index: 99999"]::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

div[style*="z-index: 99999"]::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
