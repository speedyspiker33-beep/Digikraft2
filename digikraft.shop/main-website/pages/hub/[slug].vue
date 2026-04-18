<template>
  <div>
    <!-- Hub Categories with Subcategories - Compact -->
    <section class="py-3 px-6 bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto">
        <!-- Main Categories as Buttons -->
        <div class="flex flex-wrap gap-2">
          <button 
            v-for="cat in hubCategories" 
            :key="cat.name"
            @click="toggleCategory(cat.slug)"
            :class="[
              'px-3 py-1.5 rounded-lg font-medium text-xs transition-all',
              selectedCategory === cat.slug 
                ? 'bg-primary text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-primary hover:text-white'
            ]"
          >
            {{ cat.name }}
          </button>
        </div>
        
        <!-- Subcategories (show when category selected) -->
        <div v-if="selectedCategory && categorySubcategories.length > 0" class="pt-3 mt-3 border-t border-gray-100">
          <div class="flex flex-wrap gap-2">
            <button 
              v-for="sub in categorySubcategories" 
              :key="sub"
              @click="filterBySubcategory(sub)"
              class="px-2 py-1 bg-white border border-gray-200 text-gray-600 rounded text-xs font-medium hover:border-primary hover:text-primary transition-all"
            >
              {{ sub }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Products - Compact -->
    <section class="py-6 px-6">
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-xl font-bold text-gray-900">Featured in {{ hub?.name }}</h2>
          </div>
          <NuxtLink 
            to="/products" 
            class="px-4 py-2 bg-primary text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-all"
          >
            View All
          </NuxtLink>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <ProductCard 
            v-for="product in featuredProducts" 
            :key="product.id"
            :product="product"
            size="small"
          />
        </div>
      </div>
    </section>

    <!-- Hub Features - Compact -->
    <section class="py-4 px-6 bg-gray-50">
      <div class="max-w-7xl mx-auto">
        <h2 class="text-lg font-bold text-gray-900 mb-4 text-center">Why {{ hub?.name }}?</h2>
        
        <div class="grid md:grid-cols-3 gap-4">
          <div v-for="feature in hub?.features" :key="feature.title" class="bg-white rounded-lg p-4 border border-gray-100">
            <div class="size-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
              <span class="material-symbols-outlined text-primary text-xl">{{ feature.icon }}</span>
            </div>
            <h3 class="text-sm font-bold text-gray-900 mb-2">{{ feature.title }}</h3>
            <p class="text-xs text-gray-600">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section - Compact -->
    <section class="bg-gray-50 py-4 px-6">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-lg font-bold text-gray-900 mb-2">Ready to Get Started?</h2>
        
        <button class="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium text-sm hover:bg-emerald-700 transition-all">
          Start Exploring
        </button>

        <div class="mt-4 flex justify-center gap-4 text-xs text-gray-500">
          <div class="flex items-center gap-1">
            <span class="material-symbols-outlined text-emerald-600 text-sm">verified</span>
            <span>50K+</span>
          </div>
          <div class="flex items-center gap-1">
            <span class="material-symbols-outlined text-emerald-600 text-sm">star</span>
            <span>4.9</span>
          </div>
          <div class="flex items-center gap-1">
            <span class="material-symbols-outlined text-emerald-600 text-sm">support_agent</span>
            <span>24/7</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useProductsStore } from '~/stores/products'

const route = useRoute()
const productsStore = useProductsStore()

const slug = computed(() => route.params.slug as string)

// Try to fetch hubs from admin, fallback to mock
const hubs = ref<Record<string, any>>({})

onMounted(async () => {
  try {
    const response = await fetch('http://localhost:5173/src/admin/public/hubs.json')
    if (response.ok) {
      const data = await response.json()
      data.forEach((hub: any) => {
        hubs.value[hub.slug] = {
          name: hub.name,
          tagline: hub.tagline || '',
          description: hub.description,
          icon: hub.icon,
          gradient: hub.gradient,
          stats: hub.stats || [],
          features: hub.features || []
        }
      })
    }
  } catch (e) {
    console.log('Using mock hub data')
  }
  
  // Still load mock data as fallback
  loadMockHubs()
})

// Mock hub data fallback
const loadMockHubs = () => {
  hubs.value = {
    'coreldraw': {
      name: 'CorelDRAW Hub',
      tagline: 'Premium assets for CorelDRAW professionals',
      description: 'Discover exclusive templates, vector graphics, and design resources optimized for CorelDRAW.',
      icon: 'draw',
      gradient: 'linear-gradient(135deg, #239D4C 0%, #2FB961 25%, #3B82F6 50%, #8B5CF6 75%, #239D4C 100%)',
      stats: [
        { value: '500+', label: 'Templates' },
        { value: '10K+', label: 'Vector Graphics' },
        { value: '50+', label: 'Tutorials' }
      ],
      features: [
        { icon: 'speed', title: 'Optimized Files', description: 'All assets are optimized for CorelDRAW' },
        { icon: 'update', title: 'Regular Updates', description: 'New templates added weekly' }
      ]
    },
    'ai-workflow': {
      name: 'AI Workflow Hub',
      tagline: 'AI-powered design automation',
      description: 'Streamline your creative workflow with AI-enhanced templates and smart automation tools.',
      icon: 'psychology',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      stats: [
        { value: '200+', label: 'AI Tools' },
        { value: '1K+', label: 'Workflows' }
      ],
      features: [
        { icon: 'auto_awesome', title: 'Smart Automation', description: 'Automate repetitive tasks' }
      ]
    },
    'design-arsenal': {
      name: 'Design Arsenal',
      tagline: 'Complete toolkit for designers',
      description: 'Your ultimate collection of design resources including UI kits, mockups, icons, fonts.',
      icon: 'construction',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      stats: [
        { value: '2K+', label: 'Resources' },
        { value: '500+', label: 'UI Kits' }
      ],
      features: [
        { icon: 'inventory_2', title: 'Complete Toolkit', description: 'Everything you need in one place' }
      ]
    }
  }
}

const hub = computed(() => {
  if (!slug.value || !hubs.value[slug.value]) {
    return {
      name: 'Loading...',
      tagline: '',
      description: '',
      icon: 'hub',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      stats: [],
      features: []
    }
  }
  return hubs.value[slug.value]
})

// Hub categories
const hubCategories = computed(() => {
  const categories: Record<string, { name: string }[]> = {
    'coreldraw': [
      { name: 'Templates' },
      { name: 'Vectors' },
      { name: 'Graphics' },
      { name: 'Icons' },
      { name: 'Mockups' },
      { name: 'Fonts' },
      { name: 'UI Kits' },
      { name: 'Patterns' }
    ],
    'ai-workflow': [
      { name: 'AI Tools' },
      { name: 'Automation' },
      { name: 'Templates' },
      { name: 'Workflows' }
    ],
    'design-arsenal': [
      { name: 'UI Kits' },
      { name: 'Mockups' },
      { name: 'Icons' },
      { name: 'Graphics' },
      { name: 'Fonts' }
    ]
  }
  return categories[slug.value] || categories['design-arsenal']
})

// Category with subcategories data
const categoriesWithSubs: Record<string, { name: string; slug: string; subs: string[] }[]> = {
  'coreldraw': [
    { name: 'Templates', slug: 'templates', subs: ['Resume', 'Business Card', 'Brochure', 'Flyer', 'Poster', 'Certificate'] },
    { name: 'Vectors', slug: 'vectors', subs: ['Animal', 'Nature', 'Abstract', 'Cartoon', 'Banner'] },
    { name: 'Graphics', slug: 'graphics', subs: ['Logos', 'Illustrations', 'Badges', 'Labels', 'Stickers'] },
    { name: 'Icons', slug: 'icons', subs: ['Social', 'Business', 'Medical', 'Education', 'Shopping'] },
    { name: 'Mockups', slug: 'mockups', subs: ['T-Shirt', 'Mug', 'Phone', 'Laptop', 'Packaging'] },
    { name: 'Fonts', slug: 'fonts', subs: ['Display', 'Script', 'Serif', 'Sans Serif', 'Handwritten'] },
    { name: 'UI Kits', slug: 'ui-kits', subs: ['Mobile', 'Web', 'Dashboard', 'E-commerce', 'Admin'] },
    { name: 'Patterns', slug: 'patterns', subs: ['Geometric', 'Floral', 'Abstract', 'Seamless', 'Background'] }
  ],
  'ai-workflow': [
    { name: 'AI Tools', slug: 'ai-tools', subs: ['ChatGPT', 'Midjourney', 'DALL-E', 'Stable Diffusion'] },
    { name: 'Automation', slug: 'automation', subs: ['Workflows', 'Scripts', 'Plugins', 'APIs'] },
    { name: 'Templates', slug: 'templates', subs: ['Social Media', 'Presentations', 'Videos'] },
    { name: 'Workflows', slug: 'workflows', subs: ['Image Gen', 'Text Gen', 'Video Gen', 'Audio Gen'] }
  ],
  'design-arsenal': [
    { name: 'UI Kits', slug: 'ui-kits', subs: ['Mobile', 'Web', 'Dashboard', 'E-commerce'] },
    { name: 'Mockups', slug: 'mockups', subs: ['T-Shirt', 'Mug', 'Phone', 'Laptop'] },
    { name: 'Icons', slug: 'icons', subs: ['Social', 'Business', 'Medical'] },
    { name: 'Graphics', slug: 'graphics', subs: ['Logos', 'Illustrations', 'Badges'] },
    { name: 'Fonts', slug: 'fonts', subs: ['Display', 'Script', 'Serif'] }
  ]
}

const selectedCategory = ref('')
const selectedSubcategory = ref('')

const categorySubcategories = computed(() => {
  const cats = categoriesWithSubs[slug.value] || categoriesWithSubs['design-arsenal']
  const cat = cats.find(c => c.slug === selectedCategory.value)
  return cat?.subs || []
})

const toggleCategory = (slug: string) => {
  if (selectedCategory.value === slug) {
    selectedCategory.value = ''
    selectedSubcategory.value = ''
  } else {
    selectedCategory.value = slug
    selectedSubcategory.value = ''
  }
}

const filterBySubcategory = (sub: string) => {
  selectedSubcategory.value = sub
}

const featuredProducts = computed(() => productsStore.products.slice(0, 8))

useHead({
  title: hub.value.name,
  meta: [
    { name: 'description', content: hub.value.description }
  ]
})

onMounted(async () => {
  await productsStore.fetchProducts()
})
</script>
