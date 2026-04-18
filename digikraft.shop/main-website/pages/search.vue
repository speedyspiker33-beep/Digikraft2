<template>
  <div class="min-h-screen bg-gray-50 py-12 px-6 lg:px-12">
    <div class="max-w-7xl mx-auto">
      <!-- Search Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Search Results</h1>
        <div class="flex items-center gap-4">
          <div class="flex-1 relative">
            <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input 
              v-model="searchQuery"
              type="text"
              placeholder="Search for products..."
              class="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
              @keyup.enter="performSearch"
            />
          </div>
          <button 
            @click="performSearch"
            class="bg-primary text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all"
          >
            Search
          </button>
        </div>
      </div>

      <!-- Results -->
      <div v-if="searchQuery">
        <p class="text-gray-600 mb-6">
          Found <span class="font-bold text-gray-900">{{ searchResults.length }}</span> results for 
          <span class="font-bold text-primary">"{{ searchQuery }}"</span>
        </p>

        <div v-if="searchResults.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProductCard 
            v-for="product in searchResults" 
            :key="product.id"
            :product="product"
            size="medium"
          />
        </div>

        <div v-else class="text-center py-20">
          <div class="inline-flex items-center justify-center size-24 bg-gray-100 rounded-full mb-6">
            <span class="material-symbols-outlined text-5xl text-gray-400">search_off</span>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">No results found</h2>
          <p class="text-gray-600 mb-8">Try adjusting your search terms or browse our categories</p>
          <NuxtLink 
            to="/products"
            class="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all"
          >
            Browse All Products
          </NuxtLink>
        </div>
      </div>

      <!-- Popular Searches -->
      <div v-else class="text-center py-20">
        <h2 class="text-2xl font-bold text-gray-900 mb-8">Popular Searches</h2>
        <div class="flex flex-wrap justify-center gap-3">
          <button 
            v-for="term in popularSearches" 
            :key="term"
            @click="searchQuery = term; performSearch()"
            class="px-6 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-primary hover:text-primary transition-all font-medium"
          >
            {{ term }}
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

const searchQuery = ref((route.query.q as string) || '')
const searchResults = ref<any[]>([])

const popularSearches = [
  'UI Kit',
  'Logo Templates',
  'Fonts',
  '3D Icons',
  'Illustrations',
  'Mockups',
  'Social Media',
  'Branding'
]

const performSearch = () => {
  if (!searchQuery.value.trim()) return
  
  const query = searchQuery.value.toLowerCase()
  searchResults.value = productsStore.products.filter(product => 
    product.name.toLowerCase().includes(query) ||
    product.description.toLowerCase().includes(query) ||
    product.tags?.some(tag => tag.toLowerCase().includes(query))
  )
}

onMounted(async () => {
  await productsStore.fetchProducts()
  if (searchQuery.value) {
    performSearch()
  }
})

watch(() => route.query.q, (newQuery) => {
  searchQuery.value = (newQuery as string) || ''
  if (searchQuery.value) {
    performSearch()
  }
})

useHead({
  title: searchQuery.value ? `Search: ${searchQuery.value}` : 'Search'
})
</script>
