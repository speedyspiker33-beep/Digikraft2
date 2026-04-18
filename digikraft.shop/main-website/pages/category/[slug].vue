<template>
  <div class="py-4">
    <!-- Category Header - Compact -->
    <div class="mb-4 px-6">
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center gap-2 text-xs text-gray-600 mb-2">
          <NuxtLink to="/" class="hover:text-primary">Home</NuxtLink>
          <span class="material-symbols-outlined text-xs">chevron_right</span>
          <span class="text-gray-900 font-bold">{{ category?.name }}</span>
        </div>
        
        <div class="flex items-center gap-4">
          <h1 class="text-2xl font-bold text-gray-900">{{ category?.name }}</h1>
          <div class="size-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <span class="material-symbols-outlined text-primary text-xl">{{ category?.icon }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters & Products -->
    <div class="px-6">
      <div class="max-w-7xl mx-auto">
        <!-- Filters Bar - Compact -->
        <div class="bg-white rounded-lg border border-gray-100 p-2 mb-4 flex items-center gap-3">
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium text-gray-600">Sort:</span>
            <select 
              v-model="sortBy"
              class="px-2 py-1.5 border border-gray-200 rounded-md text-xs focus:border-primary outline-none"
            >
              <option value="trending">Trending</option>
              <option value="latest">Latest</option>
              <option value="price-low">Price: Low</option>
              <option value="price-high">Price: High</option>
              <option value="popular">Popular</option>
            </select>
          </div>

          <div class="flex items-center gap-1 ml-auto">
            <button 
              @click="viewMode = 'grid'"
              class="p-1.5 rounded transition-all"
              :class="viewMode === 'grid' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            >
              <span class="material-symbols-outlined text-sm">grid_view</span>
            </button>
            <button 
              @click="viewMode = 'list'"
              class="p-1.5 rounded transition-all"
              :class="viewMode === 'list' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            >
              <span class="material-symbols-outlined text-sm">view_list</span>
            </button>
          </div>

          <div class="text-xs text-gray-500">
            {{ filteredProducts.length }} products
          </div>
        </div>

        <!-- Products Grid -->
        <div 
          class="grid gap-4 mb-8"
          :class="viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'"
        >
          <ProductCard 
            v-for="product in paginatedProducts" 
            :key="product.id"
            :product="product"
            :size="viewMode === 'list' ? 'large' : 'small'"
          />
          <div v-if="filteredProducts.length === 0" class="col-span-full py-16 text-center text-gray-400">
            <span class="material-symbols-outlined text-5xl block mb-3">inventory_2</span>
            <p class="font-medium">No products in this category yet</p>
          </div>
        </div>

        <!-- Pagination -->
        <div class="flex justify-center gap-2">
          <button 
            v-for="page in totalPages" 
            :key="page"
            @click="currentPage = page"
            class="size-10 rounded-lg font-bold transition-all"
            :class="currentPage === page ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-primary'"
          >
            {{ page }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProductsStore } from '~/stores/products'

const route = useRoute()
const productsStore = useProductsStore()

const slug = computed(() => route.params.slug as string)
const sortBy = ref('trending')
const viewMode = ref<'grid' | 'list'>('grid')
const currentPage = ref(1)
const itemsPerPage = 12

// Get category info — first try from store, then fallback to static map
const category = computed(() => {
  // Try from store categories
  const storeCat = productsStore.categories.find(c => c.slug === slug.value)
  if (storeCat) return { name: storeCat.name, description: storeCat.description || '', icon: getCatIcon(slug.value), id: storeCat.id }

  // Fallback static map
  const categories: Record<string, any> = {
    'graphics': { name: 'Graphics', description: 'Premium graphics, illustrations, and visual assets', icon: 'palette', id: 1 },
    'fonts': { name: 'Fonts', description: 'Professional typefaces and font families', icon: 'text_fields', id: 2 },
    'templates': { name: 'Templates', description: 'Ready-to-use design templates', icon: 'dashboard', id: 3 },
    '3d-assets': { name: '3D Assets', description: '3D models, icons and mockups', icon: 'view_in_ar', id: 4 },
    'ui-kits': { name: 'UI Kits', description: 'Complete UI design systems', icon: 'view_quilt', id: 5 },
    'plugins': { name: 'Plugins', description: 'Software plugins and extensions', icon: 'extension', id: 6 },
    'icons': { name: 'Icons', description: 'Icon sets and symbol libraries', icon: 'category', id: null },
    'mockups': { name: 'Mockups', description: 'Product mockup templates', icon: 'devices', id: null },
  }
  return categories[slug.value] || { name: slug.value, description: '', icon: 'folder', id: null }
})

function getCatIcon(slug: string) {
  const icons: Record<string, string> = {
    graphics: 'palette', fonts: 'text_fields', templates: 'dashboard',
    '3d-assets': 'view_in_ar', 'ui-kits': 'view_quilt', plugins: 'extension',
    icons: 'category', mockups: 'devices'
  }
  return icons[slug] || 'folder'
}

const filteredProducts = computed(() => {
  let products = [...productsStore.products]

  // Filter by category — match by category_ids array OR categoryId OR category name/slug
  const catSlug = slug.value
  const catId = category.value.id

  products = products.filter(p => {
    // Check category_ids array (backend format)
    if (Array.isArray(p.category_ids) && catId) {
      if (p.category_ids.includes(catId)) return true
    }
    // Check categoryId (store mapped format)
    if (catId && p.categoryId === catId) return true
    // Check categories array (enriched backend format)
    if (Array.isArray(p.categories)) {
      if (p.categories.some((c: any) => c.slug === catSlug || c.id === catId)) return true
    }
    // Check category string field (AI-created products)
    if (p.category && typeof p.category === 'string') {
      if (p.category.toLowerCase() === catSlug.replace('-', ' ') ||
          p.category.toLowerCase() === category.value.name.toLowerCase()) return true
    }
    return false
  })

  // Sort
  switch (sortBy.value) {
    case 'latest': products.sort((a, b) => b.id - a.id); break
    case 'price-low': products.sort((a, b) => a.price - b.price); break
    case 'price-high': products.sort((a, b) => b.price - a.price); break
    case 'popular': products.sort((a, b) => (b.sales || b.downloads || 0) - (a.sales || a.downloads || 0)); break
    default: products.sort((a, b) => (b.sales || b.downloads || 0) - (a.sales || a.downloads || 0)); break
  }

  return products
})

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredProducts.value.slice(start, start + itemsPerPage)
})

const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage))

// Reset page when slug changes
watch(slug, () => { currentPage.value = 1 })

useHead({
  title: computed(() => category.value.name),
  meta: [
    { name: 'description', content: computed(() => category.value.description) }
  ]
})

onMounted(async () => {
  await Promise.all([
    productsStore.fetchProducts(),
    productsStore.fetchCategories()
  ])
})
</script>
