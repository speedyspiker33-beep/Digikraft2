<template>
  <div v-if="product" class="min-h-screen bg-gradient-to-b from-gray-50 to-white">
    <!-- Breadcrumb -->
    <div class="px-6 lg:px-12 py-4 bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <NuxtLink to="/" class="hover:text-primary transition-colors">Home</NuxtLink>
          <span>/</span>
          <NuxtLink to="/products" class="hover:text-primary transition-colors">Products</NuxtLink>
          <span>/</span>
          <span class="text-gray-900 font-medium">{{ product.name }}</span>
        </div>
      </div>
    </div>

    <!-- Product Hero -->
    <section class="py-8 px-6 lg:px-12">
      <div class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <!-- Image Gallery with Zoom -->
          <div class="space-y-4">
            <!-- Main Image -->
            <div class="relative group">
              <div class="aspect-square bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
                <img 
                  :src="selectedImage" 
                  :alt="product.name"
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <!-- Overlay badges -->
                <div class="absolute top-4 left-4 flex flex-col gap-2">
                  <span v-if="product.featured" class="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm">star</span>
                    Featured
                  </span>
                  <span v-if="product.originalPrice" class="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full shadow-lg">
                    {{ Math.round((1 - product.price / product.originalPrice) * 100) }}% OFF
                  </span>
                </div>
              </div>
            </div>

            <!-- Thumbnail Gallery — only show when there are multiple images -->
            <div v-if="productImages.length > 1" class="grid grid-cols-4 gap-3">
              <div 
                v-for="(img, i) in productImages" 
                :key="i" 
                @click="selectedImage = img"
                :class="[
                  'aspect-square bg-white rounded-xl border-2 overflow-hidden cursor-pointer transition-all duration-300',
                  selectedImage === img ? 'border-primary shadow-lg scale-105' : 'border-gray-200 hover:border-gray-300'
                ]"
              >
                <img 
                  :src="img" 
                  :alt="`${product.name} ${i + 1}`"
                  class="w-full h-full object-cover"
                />
              </div>
            </div>

            <!-- Trust Badges -->
            <div class="grid grid-cols-3 gap-4 pt-4">
              <div class="text-center p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all">
                <span class="material-symbols-outlined text-3xl text-primary mb-2">verified</span>
                <p class="text-xs font-bold text-gray-900">Verified</p>
                <p class="text-xs text-gray-500">Quality</p>
              </div>
              <div class="text-center p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all">
                <span class="material-symbols-outlined text-3xl text-green-500 mb-2">download</span>
                <p class="text-xs font-bold text-gray-900">Instant</p>
                <p class="text-xs text-gray-500">Download</p>
              </div>
              <div class="text-center p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all">
                <span class="material-symbols-outlined text-3xl text-blue-500 mb-2">support_agent</span>
                <p class="text-xs font-bold text-gray-900">24/7</p>
                <p class="text-xs text-gray-500">Support</p>
              </div>
            </div>
          </div>

          <!-- Product Info -->
          <div class="space-y-6">
            <!-- Category & Tags with Wishlist Icon -->
            <div class="flex items-center justify-between gap-2 flex-wrap">
              <div class="flex items-center gap-2">
                <span class="px-4 py-1.5 bg-gradient-to-r from-primary to-blue-600 text-white text-xs font-bold rounded-full shadow-md">
                  {{ getCategoryName(product.categoryId) }}
                </span>
                <span class="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                  Digital Download
                </span>
              </div>
              <!-- Wishlist Icon Button -->
              <button 
                @click="toggleWishlist"
                class="size-10 rounded-full border-2 border-gray-300 hover:border-red-500 flex items-center justify-center transition-all hover:scale-110 group"
                :class="isWishlisted ? 'bg-red-50 border-red-500' : 'bg-white'"
              >
                <span 
                  class="material-symbols-outlined transition-colors"
                  :class="isWishlisted ? 'text-red-500' : 'text-gray-400 group-hover:text-red-500'"
                >
                  {{ isWishlisted ? 'favorite' : 'favorite_border' }}
                </span>
              </button>
            </div>

            <!-- Title -->
            <div>
              <h1 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 leading-tight">
                {{ product.name }}
              </h1>
              <p class="text-sm text-gray-600 leading-relaxed">{{ product.description }}</p>
            </div>

            <!-- Rating & Sales -->
            <div class="flex items-center gap-6 pb-6 border-b border-gray-200">
              <div class="flex items-center gap-2">
                <div class="flex items-center gap-0.5">
                  <span v-for="i in 5" :key="i" :class="i <= Math.floor(product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'" class="text-xl">★</span>
                </div>
                <span class="text-sm font-bold text-gray-900">{{ product.rating }}</span>
                <span class="text-sm text-gray-500">({{ product.reviewCount }} reviews)</span>
              </div>
              <div class="flex items-center gap-2 text-gray-600">
                <span class="material-symbols-outlined text-sm">shopping_bag</span>
                <span class="text-sm font-medium">{{ product.sales }} sales</span>
              </div>
            </div>

            <!-- Price Card -->
            <div class="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <div class="flex items-baseline gap-3 mb-4">
                <span class="text-3xl font-bold text-gray-900">
                  ₹{{ product.price }}
                </span>
                <span v-if="product.originalPrice" class="text-base text-gray-400 line-through">
                  ₹{{ product.originalPrice }}
                </span>
                <span v-if="product.originalPrice" class="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  {{ Math.round((1 - product.price / product.originalPrice) * 100) }}% off
                </span>
              </div>
              
              <!-- Action Buttons -->
              <div class="flex gap-2">
                <button 
                  @click="addToCart"
                  class="flex-1 bg-white border border-primary text-primary py-2.5 rounded-lg font-semibold text-sm hover:bg-primary hover:text-white transition-all duration-200 flex items-center justify-center gap-1.5"
                >
                  <span class="material-symbols-outlined text-base">shopping_cart</span>
                  Add to Cart
                </button>
                <button 
                  @click="buyNow"
                  class="flex-1 bg-primary text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-1.5"
                >
                  <span class="material-symbols-outlined text-base">bolt</span>
                  Buy Now
                </button>
              </div>

              <!-- Quick Info -->
              <div class="mt-4 pt-4 border-t border-gray-200 space-y-2">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-gray-500">File Format</span>
                  <span class="font-semibold text-gray-800">Multiple Formats</span>
                </div>
                <div class="flex items-center justify-between text-xs">
                  <span class="text-gray-500">License</span>
                  <span class="font-semibold text-gray-800">Commercial Use</span>
                </div>
                <div class="flex items-center justify-between text-xs">
                  <span class="text-gray-500">Updates</span>
                  <span class="font-semibold text-primary">Lifetime Free</span>
                </div>
              </div>
            </div>

            <!-- Features List -->
            <div class="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
              <h3 class="font-bold text-gray-900 text-lg mb-4">What's Included</h3>
              <div class="space-y-3">
                <div class="flex items-start gap-3">
                  <div class="size-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span class="material-symbols-outlined text-green-600 text-sm">check</span>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">Instant Digital Download</p>
                    <p class="text-sm text-gray-500">Access your files immediately after purchase</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <div class="size-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span class="material-symbols-outlined text-green-600 text-sm">check</span>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">Lifetime Updates</p>
                    <p class="text-sm text-gray-500">Get all future updates at no extra cost</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <div class="size-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span class="material-symbols-outlined text-green-600 text-sm">check</span>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">Commercial License</p>
                    <p class="text-sm text-gray-500">Use in unlimited personal and commercial projects</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <div class="size-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span class="material-symbols-outlined text-green-600 text-sm">check</span>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">Premium Support</p>
                    <p class="text-sm text-gray-500">24/7 customer support via email and chat</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Tabs Section -->
    <section class="py-12 px-6 lg:px-12 bg-white">
      <div class="max-w-7xl mx-auto">
        <ProductTabs v-if="product" :product="product" />
      </div>
    </section>

    <!-- Related Products -->
    <section class="py-12 px-6 lg:px-12 bg-gradient-to-b from-gray-50 to-white">
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-3xl font-bold text-gray-900">You May Also Like</h2>
          <NuxtLink to="/products" class="text-primary font-bold hover:underline flex items-center gap-1">
            View All
            <span class="material-symbols-outlined text-sm">arrow_forward</span>
          </NuxtLink>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProductCard 
            v-for="relatedProduct in relatedProducts" 
            :key="relatedProduct.id"
            :product="relatedProduct"
            size="medium"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useProductsStore } from '~/stores/products'
import { useCartStore } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const router = useRouter()
const productsStore = useProductsStore()
const cartStore = useCartStore()
const authStore = useAuthStore()

const selectedImage = ref('')
const isWishlisted = ref(false)
const fullProduct = ref<any>(null) // full data from backend including linked_blog_posts

const product = computed(() => {
  // Merge store product with full backend data
  const storeProduct = productsStore.products.find(p => p.slug === route.params.slug)
  if (!storeProduct) return null
  return fullProduct.value ? { ...storeProduct, ...fullProduct.value } : storeProduct
})

const productImages = computed(() => {
  if (!product.value) return []
  // Use the images array from backend if available, fall back to main image
  const imgs: string[] = []
  // Main image first
  if (product.value.image) imgs.push(product.value.image)
  // Additional images (from backend `images` field)
  const extra = product.value.images || (fullProduct.value?.images) || []
  for (const img of extra) {
    if (img && !imgs.includes(img)) imgs.push(img)
  }
  // Need at least 1
  return imgs.length ? imgs : [product.value.image]
})

const relatedProducts = computed(() => {
  if (!product.value) return []
  return productsStore.products
    .filter(p => p.categoryId === product.value?.categoryId && p.id !== product.value?.id)
    .slice(0, 4)
})

const getCategoryName = (categoryId: number) => {
  const category = productsStore.categories.find(c => c.id === categoryId)
  return category?.name || 'Unknown'
}

const addToCart = () => {
  if (product.value) {
    cartStore.addItem(product.value)
  }
}

const buyNow = () => {
  if (product.value) {
    cartStore.addItem(product.value)
    router.push('/checkout')
  }
}

const toggleWishlist = () => {
  if (!authStore.isAuthenticated) {
    alert('Please login to add to wishlist')
    return
  }
  isWishlisted.value = !isWishlisted.value
  if (isWishlisted.value) {
    console.log('Added to wishlist:', product.value?.name)
  } else {
    console.log('Removed from wishlist:', product.value?.name)
  }
}

watch(product, (newProduct) => {
  if (newProduct) {
    selectedImage.value = newProduct.image
  }
}, { immediate: true })

onMounted(async () => {
  await Promise.all([
    productsStore.fetchProducts(),
    productsStore.fetchCategories()
  ])
  // Fetch full product data from backend to get linked_blog_posts
  try {
    const config = useRuntimeConfig()
    const slug = route.params.slug as string
    const res = await $fetch<any>(`${config.public.apiBase}/v1/products/${slug}`)
    if (res.success) fullProduct.value = res.data
  } catch {}
})

useHead({
  title: product.value?.name || 'Product'
})
</script>
