<template>
  <div class="min-h-screen bg-gray-50 py-12 px-6 lg:px-12">
    <div class="max-w-[1920px] mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">All Products</h1>
        <p class="text-gray-600">Discover {{ productsStore.products.length }} premium digital assets</p>
      </div>

      <div class="flex gap-8">
        <!-- Filters Sidebar -->
        <aside class="hidden lg:block w-72 shrink-0">
          <div class="bg-white rounded-xl border border-gray-200 p-6 sticky top-[150px] z-40">
            <h2 class="text-lg font-bold text-gray-900 mb-6">Filters</h2>

            <!-- Categories as Buttons -->
            <div class="mb-6">
              <h3 class="text-sm font-bold text-gray-700 mb-3">Categories</h3>
              <div class="flex flex-wrap gap-2">
                <button 
                  v-for="cat in categories" 
                  :key="cat.id"
                  @click="toggleCategory(cat.id)"
                  :class="[
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    selectedCategories.includes(cat.id) 
                      ? 'bg-primary text-white shadow-md' 
                      : 'bg-gray-100 text-gray-600 hover:bg-primary hover:text-white'
                  ]"
                >
                  {{ cat.name }}
                  <span class="ml-1 opacity-70">({{ cat.productCount }})</span>
                </button>
              </div>
            </div>

            <!-- Price Range -->
            <div class="mb-6">
              <h3 class="text-sm font-bold text-gray-700 mb-3">Price Range</h3>
              <div class="space-y-3">
                <div class="flex gap-2">
                  <input 
                    type="number" 
                    v-model="minPrice"
                    placeholder="Min"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
                  />
                  <input 
                    type="number" 
                    v-model="maxPrice"
                    placeholder="Max"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
                  />
                </div>
              </div>
            </div>

            <!-- Rating -->
            <div class="mb-6">
              <h3 class="text-sm font-bold text-gray-700 mb-3">Rating</h3>
              <div class="space-y-2">
                <label v-for="rating in [5, 4, 3]" :key="rating" class="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="rating"
                    :value="rating"
                    v-model="minRating"
                    class="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                  />
                  <div class="flex items-center gap-1">
                    <span v-for="i in rating" :key="i" class="text-yellow-400">★</span>
                    <span v-for="i in (5 - rating)" :key="'e'+i" class="text-gray-300">★</span>
                  </div>
                  <span class="text-sm text-gray-600">& up</span>
                </label>
              </div>
            </div>

            <button 
              @click="clearFilters"
              class="w-full py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
            >
              Clear Filters
            </button>
          </div>
        </aside>

        <!-- Products Grid -->
        <main class="flex-1 min-w-0">
          <!-- Toolbar -->
          <div class="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex items-center justify-between">
            <p class="text-sm text-gray-600">
              Showing <span class="font-bold">{{ filteredProducts.length }}</span> products
            </p>
            <div class="flex items-center gap-4">
              <select 
                v-model="sortBy"
                class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
              >
                <option value="trending">Trending</option>
                <option value="latest">Latest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
              <div class="flex gap-2">
                <button 
                  @click="viewMode = 'grid'"
                  :class="[
                    'p-2 rounded-lg transition-all',
                    viewMode === 'grid' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  ]"
                >
                  <span class="material-symbols-outlined">grid_view</span>
                </button>
                <button 
                  @click="viewMode = 'list'"
                  :class="[
                    'p-2 rounded-lg transition-all',
                    viewMode === 'list' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  ]"
                >
                  <span class="material-symbols-outlined">view_list</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Products -->
          <div 
            :class="[
              'grid gap-6',
              viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'
            ]"
          >
            <ProductCard 
              v-for="product in filteredProducts" 
              :key="product.id"
              :product="product"
              :size="viewMode === 'grid' ? 'medium' : 'large'"
            />
          </div>

          <!-- Pagination -->
          <div class="mt-12 flex justify-center">
            <div class="flex items-center gap-2">
              <button class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all">
                Previous
              </button>
              <button v-for="page in 5" :key="page" :class="[
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                page === 1 ? 'bg-primary text-white' : 'border border-gray-200 hover:bg-gray-50'
              ]">
                {{ page }}
              </button>
              <button class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all">
                Next
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProductsStore } from '~/stores/products'

const route = useRoute()
const productsStore = useProductsStore()
const selectedCategories = ref<number[]>([])
const minPrice = ref<number | null>(null)
const maxPrice = ref<number | null>(null)
const minRating = ref<number | null>(null)
const sortBy = ref('trending')
const viewMode = ref<'grid' | 'list'>('grid')

const categories = computed(() => {
  return productsStore.categories.map(cat => ({
    ...cat,
    productCount: productsStore.products.filter(p => {
      if (p.categoryId === cat.id) return true
      if (Array.isArray(p.category_ids) && p.category_ids.includes(cat.id)) return true
      if (Array.isArray(p.categories) && p.categories.some((c: any) => c.id === cat.id)) return true
      return false
    }).length
  }))
})

const toggleCategory = (catId: number) => {
  const index = selectedCategories.value.indexOf(catId)
  if (index > -1) {
    selectedCategories.value.splice(index, 1)
  } else {
    selectedCategories.value.push(catId)
  }
}

const filteredProducts = computed(() => {
  let products = [...productsStore.products]

  // Filter by selected categories
  if (selectedCategories.value.length > 0) {
    products = products.filter(p => {
      return selectedCategories.value.some(catId => {
        // categoryId (store mapped format from mock/backend)
        if (p.categoryId === catId) return true
        // category_ids array (raw backend format)
        if (Array.isArray(p.category_ids) && p.category_ids.includes(catId)) return true
        // categories array (enriched backend format)
        if (Array.isArray(p.categories) && p.categories.some((c: any) => c.id === catId)) return true
        return false
      })
    })
  }

  // Filter by price
  if (minPrice.value !== null && minPrice.value !== '') {
    products = products.filter(p => p.price >= Number(minPrice.value))
  }
  if (maxPrice.value !== null && maxPrice.value !== '') {
    products = products.filter(p => p.price <= Number(maxPrice.value))
  }

  // Filter by rating
  if (minRating.value !== null) {
    products = products.filter(p => (p.rating || 0) >= minRating.value!)
  }

  // Sort
  switch (sortBy.value) {
    case 'latest':
      products.sort((a, b) => b.id - a.id)
      break
    case 'price-low':
      products.sort((a, b) => a.price - b.price)
      break
    case 'price-high':
      products.sort((a, b) => b.price - a.price)
      break
    case 'rating':
      products.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      break
    default: // trending
      products.sort((a, b) => (b.sales || b.downloads || 0) - (a.sales || a.downloads || 0))
      break
  }

  return products
})

const clearFilters = () => {
  selectedCategories.value = []
  minPrice.value = null
  maxPrice.value = null
  minRating.value = null
}

onMounted(async () => {
  await Promise.all([
    productsStore.fetchProducts(),
    productsStore.fetchCategories()
  ])

  // Pre-select category from URL query param (?category=graphics or ?category=1)
  const queryCat = route.query.category as string
  if (queryCat) {
    // Try matching by slug
    const matchBySlug = productsStore.categories.find(c => c.slug === queryCat)
    if (matchBySlug) {
      selectedCategories.value = [matchBySlug.id]
    } else {
      // Try matching by id
      const id = parseInt(queryCat)
      if (!isNaN(id)) selectedCategories.value = [id]
    }
  }
})

useHead({
  title: 'All Products'
})
</script>
