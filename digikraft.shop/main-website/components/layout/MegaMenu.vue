<template>
  <div class="relative">
    <!-- Mega Menu Trigger -->
    <button
      @mouseenter="handleMouseEnter"
      @click="toggleMenu"
      :class="[
        'flex items-center gap-1 text-xs font-bold uppercase tracking-wider transition-colors py-2.5',
        isMenuActive ? 'text-primary' : 'text-gray-800 hover:text-primary'
      ]"
    >
      {{ category.name }}
      <span class="material-symbols-outlined text-sm transition-transform" :class="{ 'rotate-180': isOpen }">
        expand_more
      </span>
    </button>

    <!-- Mega Menu Dropdown -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="isOpen"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
        class="absolute left-0 top-full mt-0 w-screen max-w-7xl bg-white border border-gray-100 rounded-b-2xl shadow-2xl z-50"
        style="left: 50%; transform: translateX(-50%);"
      >
        <div class="flex">
          <!-- Left Sidebar - Subcategories -->
          <div class="w-64 bg-gray-50 p-6 border-r border-gray-100">
            <h3 class="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">
              Browse {{ category.name }}
            </h3>
            <nav class="space-y-1">
              <button
                v-for="subcategory in category.subcategories"
                :key="subcategory.id"
                @mouseenter="selectedSubcategory = subcategory"
                @click="navigateToSubcategory(subcategory)"
                class="w-full text-left px-3 py-2 rounded-lg text-sm transition-all group"
                :class="selectedSubcategory?.id === subcategory.id 
                  ? 'bg-primary text-white font-bold' 
                  : 'text-gray-700 hover:bg-white hover:text-primary'"
              >
                <div class="flex items-center justify-between">
                  <span>{{ subcategory.name }}</span>
                  <span class="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    chevron_right
                  </span>
                </div>
              </button>
            </nav>
            
            <!-- Popular Searches in Left Sidebar -->
            <div class="mt-8 pt-6 border-t border-gray-200">
              <h4 class="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-2">
                <span class="material-symbols-outlined text-sm text-purple-500">search</span>
                Popular
              </h4>
              <div class="flex flex-wrap gap-2">
                <NuxtLink
                  v-for="search in popularSearches"
                  :key="search"
                  :to="`/search?q=${encodeURIComponent(search)}`"
                  @click="closeMenu"
                  class="px-2 py-1 bg-white rounded-full text-xs text-gray-700 hover:bg-primary hover:text-white transition-all"
                >
                  {{ search }}
                </NuxtLink>
              </div>
            </div>
          </div>

          <!-- Main Content Area - Full Width -->
          <div class="flex-1 p-8">
            <div v-if="selectedSubcategory">
              <!-- Subcategory Header -->
              <div class="mb-6">
                <h3 class="text-2xl font-bold text-gray-900 mb-2">
                  {{ selectedSubcategory.name }}
                </h3>
                <p class="text-sm text-gray-600">{{ selectedSubcategory.description }}</p>
              </div>

              <!-- Sub-subcategories Grid -->
              <div class="grid grid-cols-4 gap-6 mb-8">
                <div v-for="subcat in selectedSubcategory.items" :key="subcat.id">
                  <h4 class="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wider">
                    {{ subcat.name }}
                  </h4>
                  <ul class="space-y-2">
                    <li v-for="item in subcat.links" :key="item.name">
                      <NuxtLink
                        :to="item.href"
                        @click="closeMenu"
                        class="text-sm text-gray-600 hover:text-primary transition-colors block"
                      >
                        {{ item.name }}
                      </NuxtLink>
                    </li>
                  </ul>
                </div>
              </div>

              <!-- Featured Products -->
              <div v-if="selectedSubcategory.featured && selectedSubcategory.featured.length > 0">
                <div class="flex items-center justify-between mb-4">
                  <h4 class="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary">star</span>
                    Featured in {{ selectedSubcategory.name }}
                  </h4>
                  <NuxtLink 
                    :to="selectedSubcategory.href"
                    @click="closeMenu"
                    class="text-xs text-primary hover:text-blue-700 font-bold"
                  >
                    View All →
                  </NuxtLink>
                </div>
                <div class="grid grid-cols-4 gap-4">
                  <NuxtLink
                    v-for="product in selectedSubcategory.featured"
                    :key="product.id"
                    :to="product.href"
                    @click="closeMenu"
                    class="group"
                  >
                    <div class="relative rounded-lg overflow-hidden mb-2 bg-gray-100">
                      <img
                        :src="product.image"
                        :alt="product.name"
                        class="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div class="absolute bottom-2 left-2 right-2">
                          <p class="text-white text-xs font-bold">View Product</p>
                        </div>
                      </div>
                    </div>
                    <p class="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                      {{ product.name }}
                    </p>
                    <p class="text-xs text-primary font-bold">{{ product.price }}</p>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
interface Props {
  category: {
    name: string
    subcategories: any[]
  }
}

const props = defineProps<Props>()

const route = useRoute()
const isOpen = ref(false)
const { setActiveCategory } = useCategory()

// Check if current route matches this category
const isMenuActive = computed(() => {
  const path = route.path
  const categorySlug = getCategorySlug(props.category.name)
  return path.includes(`/category/${categorySlug}`)
})

const getCategorySlug = (name: string) => {
  const slugMap: Record<string, string> = {
    'Fonts': 'fonts',
    'Graphics': 'graphics',
    'Templates': 'templates',
    'Crafts': 'crafts'
  }
  return slugMap[name.toLowerCase()] || name.toLowerCase()
}
const selectedSubcategory = ref(props.category.subcategories[0])
let closeTimeout: NodeJS.Timeout | null = null

const popularSearches = [
  'Logo Templates',
  'Social Media',
  'Business Cards',
  'Mockups',
  'Icons',
  'Illustrations'
]

const toggleMenu = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    selectedSubcategory.value = props.category.subcategories[0]
  }
}

const handleMouseEnter = () => {
  if (closeTimeout) {
    clearTimeout(closeTimeout)
    closeTimeout = null
  }
  isOpen.value = true
}

const handleMouseLeave = () => {
  closeTimeout = setTimeout(() => {
    isOpen.value = false
  }, 300)
}

const closeMenu = () => {
  isOpen.value = false
}

const navigateToSubcategory = (subcategory: any) => {
  navigateTo(subcategory.href)
  closeMenu()
}

// Close menu when clicking outside
onMounted(() => {
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    if (!target.closest('.relative')) {
      isOpen.value = false
    }
  }
  document.addEventListener('click', handleClickOutside)
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})
</script>
