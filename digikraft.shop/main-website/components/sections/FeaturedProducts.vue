<template>
  <section class="py-24 bg-white px-6 lg:px-12">
    <div class="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
      <div>
        <h2 class="text-4xl font-bold text-gray-900 mb-6">
          Featured <span class="text-gradient">Products</span>
        </h2>
        <p class="text-slate-500 max-w-md">
          The most downloaded and trending assets this week across our global network.
        </p>
      </div>
      
      <!-- Filter Tabs -->
      <div class="flex bg-gray-50 p-1 rounded-lg border border-gray-100">
        <button 
          v-for="tab in tabs" 
          :key="tab.value"
          @click="activeTab = tab.value"
          :class="[
            'px-6 py-2 rounded text-xs font-bold transition-all-300',
            activeTab === tab.value 
              ? 'bg-white text-primary shadow-sm' 
              : 'text-slate-400 hover:text-gray-700'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Product Grid -->
    <ClientOnly>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <ProductCard 
          v-for="product in featuredProducts" 
          :key="product.id"
          :product="product"
          size="large"
          show-badge
        />
      </div>
      <template #fallback>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div v-for="i in 8" :key="i" class="bg-gray-100 rounded-xl animate-pulse h-80"></div>
        </div>
      </template>
    </ClientOnly>
  </section>
</template>

<script setup lang="ts">
import { useProductsStore } from '~/stores/products'

const productsStore = useProductsStore()
const activeTab = ref('all')

const tabs = [
  { label: 'All', value: 'all' },
  { label: 'Graphics', value: 'graphics' },
  { label: 'Fonts', value: 'fonts' },
  { label: 'Templates', value: 'templates' }
]

const featuredProducts = computed(() => {
  return productsStore.products.slice(0, 8)
})
</script>
