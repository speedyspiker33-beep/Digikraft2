<template>
  <section class="bg-gray-50 py-12 px-6 lg:px-12">
    <div class="max-w-[1920px] mx-auto">
      <!-- Main Product Area -->
      <div class="min-w-0">
        <div class="mb-8 flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-900">
            {{ heroTitle }} <span class="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">{{ heroTitleAccent }}</span>
          </h2>
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-500">Sort by:</span>
            <select 
              v-model="sortBy" 
              class="bg-transparent border-none text-xs font-bold text-gray-900 focus:ring-0 cursor-pointer p-0"
            >
              <option value="trending">🔥 Trending Now</option>
              <option value="latest">✨ Latest</option>
              <option value="bestselling">⭐ Best Selling</option>
            </select>
          </div>
        </div>

        <!-- 5-column Product Grid -->
        <ClientOnly>
          <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            <ProductCard 
              v-for="product in heroProducts" 
              :key="product.id"
              :product="product"
              size="small"
            />
          </div>
          <template #fallback>
            <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
              <div v-for="i in 10" :key="i" class="bg-gray-100 rounded-xl animate-pulse h-64"></div>
            </div>
          </template>
        </ClientOnly>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useProductsStore } from '~/stores/products'

const productsStore = useProductsStore()
const { config } = useSiteConfig()
const sortBy = ref('trending')

// Read hero title from admin appearance settings
const heroTitle = computed(() => config.value.homepage?.heroTitle || 'Featured')
const heroTitleAccent = computed(() => config.value.homepage?.heroTitleAccent || 'Graphics')

const heroProducts = computed(() => {
  let products = [...productsStore.products]

  // Sort based on selection
  switch (sortBy.value) {
    case 'latest':
      products.sort((a, b) => b.id - a.id)
      break
    case 'bestselling':
      products.sort((a, b) => (b.sales || b.downloads || 0) - (a.sales || a.downloads || 0))
      break
    default: // trending — featured first, then by sales
      products.sort((a, b) => {
        if (a.featured && !b.featured) return -1
        if (!a.featured && b.featured) return 1
        return (b.sales || b.downloads || 0) - (a.sales || a.downloads || 0)
      })
      break
  }

  return products.slice(0, 10)
})
</script>
