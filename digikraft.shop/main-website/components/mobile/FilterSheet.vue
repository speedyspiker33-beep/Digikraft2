<template>
  <Teleport to="body">
    <!-- Backdrop -->
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
        class="fixed inset-0 bg-black/50 z-40 md:hidden"
        @click="close"
      />
    </Transition>

    <!-- Filter Sheet -->
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
        class="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 md:hidden max-h-[90vh] overflow-y-auto"
      >
        <!-- Handle Bar -->
        <div class="flex justify-center pt-3 pb-2">
          <div class="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>

        <!-- Header -->
        <div class="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h3 class="font-bold text-lg">Filters</h3>
          <button 
            @click="close"
            class="text-gray-600 hover:text-gray-900"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Filters -->
        <div class="p-4 space-y-6">
          <!-- Price Range -->
          <div>
            <h4 class="font-bold text-gray-900 mb-3 flex items-center justify-between">
              <span>Price Range</span>
              <button 
                @click="expandedFilters.price = !expandedFilters.price"
                class="text-gray-400"
              >
                <span class="material-symbols-outlined" :class="{ 'rotate-180': expandedFilters.price }">expand_more</span>
              </button>
            </h4>
            <div v-show="expandedFilters.price" class="space-y-3">
              <div class="flex items-center gap-2">
                <input 
                  v-model.number="priceRange[0]"
                  type="number" 
                  placeholder="Min"
                  class="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <span class="text-gray-400">-</span>
                <input 
                  v-model.number="priceRange[1]"
                  type="number" 
                  placeholder="Max"
                  class="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <input 
                type="range" 
                :value="priceRange[0]"
                @input="priceRange[0] = Math.min($event.target.value, priceRange[1])"
                min="0"
                max="1000"
                class="w-full"
              />
              <input 
                type="range" 
                :value="priceRange[1]"
                @input="priceRange[1] = Math.max($event.target.value, priceRange[0])"
                min="0"
                max="1000"
                class="w-full"
              />
            </div>
          </div>

          <!-- Category -->
          <div>
            <h4 class="font-bold text-gray-900 mb-3 flex items-center justify-between">
              <span>Category</span>
              <button 
                @click="expandedFilters.category = !expandedFilters.category"
                class="text-gray-400"
              >
                <span class="material-symbols-outlined" :class="{ 'rotate-180': expandedFilters.category }">expand_more</span>
              </button>
            </h4>
            <div v-show="expandedFilters.category" class="space-y-2">
              <label v-for="cat in categories" :key="cat" class="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  :value="cat"
                  v-model="selectedCategories"
                  class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span class="text-gray-700 text-sm">{{ cat }}</span>
              </label>
            </div>
          </div>

          <!-- Rating -->
          <div>
            <h4 class="font-bold text-gray-900 mb-3 flex items-center justify-between">
              <span>Rating</span>
              <button 
                @click="expandedFilters.rating = !expandedFilters.rating"
                class="text-gray-400"
              >
                <span class="material-symbols-outlined" :class="{ 'rotate-180': expandedFilters.rating }">expand_more</span>
              </button>
            </h4>
            <div v-show="expandedFilters.rating" class="space-y-2">
              <label v-for="rating in [5, 4, 3, 2, 1]" :key="rating" class="flex items-center gap-3 cursor-pointer">
                <input 
                  type="radio" 
                  :value="rating"
                  v-model="selectedRating"
                  class="w-4 h-4 border-gray-300 text-primary focus:ring-primary"
                />
                <div class="flex items-center gap-1">
                  <span v-for="i in 5" :key="i" :class="i <= rating ? 'text-yellow-400' : 'text-gray-300'" class="text-sm">★</span>
                  <span class="text-gray-600 text-sm ml-1">{{ rating }}+</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Availability -->
          <div>
            <h4 class="font-bold text-gray-900 mb-3 flex items-center justify-between">
              <span>Availability</span>
              <button 
                @click="expandedFilters.availability = !expandedFilters.availability"
                class="text-gray-400"
              >
                <span class="material-symbols-outlined" :class="{ 'rotate-180': expandedFilters.availability }">expand_more</span>
              </button>
            </h4>
            <div v-show="expandedFilters.availability" class="space-y-2">
              <label class="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  v-model="inStockOnly"
                  class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span class="text-gray-700 text-sm">In Stock Only</span>
              </label>
              <label class="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  v-model="onSaleOnly"
                  class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span class="text-gray-700 text-sm">On Sale</span>
              </label>
            </div>
          </div>

          <!-- Sort -->
          <div>
            <h4 class="font-bold text-gray-900 mb-3 flex items-center justify-between">
              <span>Sort By</span>
              <button 
                @click="expandedFilters.sort = !expandedFilters.sort"
                class="text-gray-400"
              >
                <span class="material-symbols-outlined" :class="{ 'rotate-180': expandedFilters.sort }">expand_more</span>
              </button>
            </h4>
            <div v-show="expandedFilters.sort" class="space-y-2">
              <label v-for="option in sortOptions" :key="option.value" class="flex items-center gap-3 cursor-pointer">
                <input 
                  type="radio" 
                  :value="option.value"
                  v-model="selectedSort"
                  class="w-4 h-4 border-gray-300 text-primary focus:ring-primary"
                />
                <span class="text-gray-700 text-sm">{{ option.label }}</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="sticky bottom-0 bg-white border-t border-gray-200 p-4 space-y-3">
          <button 
            @click="applyFilters"
            class="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
          >
            Apply Filters
          </button>
          <button 
            @click="resetFilters"
            class="w-full border border-gray-200 text-gray-900 py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors"
          >
            Reset All
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  apply: [filters: any]
}>()

const priceRange = ref([0, 1000])
const selectedCategories = ref<string[]>([])
const selectedRating = ref<number | null>(null)
const inStockOnly = ref(false)
const onSaleOnly = ref(false)
const selectedSort = ref('newest')

const expandedFilters = ref({
  price: true,
  category: true,
  rating: false,
  availability: false,
  sort: false
})

const categories = [
  'Graphics',
  'Fonts',
  'Templates',
  '3D Assets',
  'Icons',
  'Illustrations',
  'Web Templates'
]

const sortOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Best Selling', value: 'bestselling' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Top Rated', value: 'rating' },
  { label: 'Most Reviewed', value: 'reviews' }
]

const close = () => {
  emit('close')
}

const applyFilters = () => {
  const filters = {
    priceRange: priceRange.value,
    categories: selectedCategories.value,
    rating: selectedRating.value,
    inStockOnly: inStockOnly.value,
    onSaleOnly: onSaleOnly.value,
    sort: selectedSort.value
  }
  emit('apply', filters)
  close()
}

const resetFilters = () => {
  priceRange.value = [0, 1000]
  selectedCategories.value = []
  selectedRating.value = null
  inStockOnly.value = false
  onSaleOnly.value = false
  selectedSort.value = 'newest'
}
</script>

<style scoped>
input[type="range"] {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e5e7eb;
  outline: none;
  -webkit-appearance: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input[type="range"]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>
