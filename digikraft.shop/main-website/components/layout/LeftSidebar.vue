<template>
  <aside class="w-64 shrink-0 hidden lg:block">
    <div class="bg-white border border-gray-200 rounded-xl p-4 sticky top-[150px] z-[85]">
      <!-- Category Heading -->
      <div class="mb-4 border-b border-gray-100 pb-2">
        <h3 class="text-sm font-bold text-gray-900 uppercase tracking-widest">
          {{ categoryTitle }}
        </h3>
      </div>
      
      <!-- Blog Posts List -->
      <div v-if="isBlogPage" class="space-y-1">
        <NuxtLink 
          v-for="post in blogPosts" 
          :key="post.slug"
          :to="`/blog/${post.slug}`"
          class="block px-3 py-2 rounded-lg text-xs font-medium transition-all hover:bg-primary/10"
          :class="currentBlogSlug === post.slug ? 'bg-primary text-white' : 'text-gray-700 hover:text-primary'"
        >
          {{ post.title }}
        </NuxtLink>
      </div>
      
      <!-- All Other Pages - Main Categories with Subcategories -->
      <div v-else class="space-y-4">
        <!-- Main Categories -->
        <div>
          <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Categories</p>
          <div class="flex flex-col gap-1">
            <button 
              v-for="cat in allCategories" 
              :key="cat.slug"
              @click="selectCategory(cat)"
              class="px-3 py-2 rounded-lg text-xs font-medium transition-all text-left"
              :class="selectedCategory === cat.slug ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-primary hover:text-white'"
            >
              {{ cat.name }}
            </button>
          </div>
        </div>
        
        <!-- Subcategories -->
        <div v-if="selectedCategory && categorySubcategories.length > 0" class="pt-3 border-t border-gray-100">
          <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Subcategories</p>
          <div class="flex flex-col gap-1">
            <NuxtLink 
              v-for="sub in categorySubcategories" 
              :key="sub"
              :to="`/category/${selectedCategory}/${sub.toLowerCase().replace(/\s+/g, '-')}`"
              class="px-3 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:border-primary hover:text-primary transition-all"
            >
              {{ sub }}
            </NuxtLink>
          </div>
        </div>
      </div>
      
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useProductsStore } from '~/stores/products'
import { useCategory } from '~/composables/useCategory'
import { useRoute } from 'vue-router'

const productsStore = useProductsStore()
const { activeCategory, activeSubcategories, setActiveCategory, getCategoryName } = useCategory()
const route = useRoute()

const categories = computed(() => productsStore.categories)

// All categories with subcategories for sidebar
const allCategories = computed(() => {
  // Use predefined categories with subcategories
  const categoryData = [
    { 
      name: 'Graphics', 
      slug: 'graphics',
      subcategories: ['Logos & Branding', 'Illustrations', 'Icons', 'Patterns', 'Vectors', 'Badges', 'Stickers', 'T-Shirt'] 
    },
    { 
      name: 'Fonts', 
      slug: 'fonts',
      subcategories: ['Display Fonts', 'Script & Handwritten', 'Serif Fonts', 'Sans Serif', 'Brush Fonts', 'Modern'] 
    },
    { 
      name: 'Templates', 
      slug: 'templates',
      subcategories: ['Web Templates', 'Social Media', 'Print Templates', 'Presentations', 'Email Templates', 'Business Cards'] 
    },
    { 
      name: '3D Assets', 
      slug: '3d',
      subcategories: ['3D Models', '3D Icons', 'Mockups', 'Textures', 'Product Viz'] 
    },
    { 
      name: 'UI Kits', 
      slug: 'ui-kits',
      subcategories: ['Mobile UI', 'Web UI', 'Dashboard', 'E-commerce', 'Admin Panel'] 
    },
    { 
      name: 'Mockups', 
      slug: 'mockups',
      subcategories: ['T-Shirt', 'Mug', 'Phone', 'Laptop', 'Packaging', 'Book'] 
    },
    { 
      name: 'Icons', 
      slug: 'icons',
      subcategories: ['Social Icons', 'Business Icons', 'Medical Icons', 'Education Icons', 'Shopping Icons'] 
    },
    { 
      name: 'Patterns', 
      slug: 'patterns',
      subcategories: ['Geometric', 'Floral', 'Abstract', 'Seamless', 'Background'] 
    }
  ]
  return categoryData
})

// Selected category for sidebar
const selectedCategory = ref<string | null>(null)
const categorySubcategories = ref<string[]>([])

const selectCategory = (cat: { name: string; slug: string; subcategories: string[] }) => {
  if (selectedCategory.value === cat.slug) {
    // Second click — navigate to category page
    navigateTo(`/category/${cat.slug}`)
    selectedCategory.value = null
    categorySubcategories.value = []
  } else {
    selectedCategory.value = cat.slug
    categorySubcategories.value = cat.subcategories || []
    // Navigate to category page directly
    navigateTo(`/category/${cat.slug}`)
  }
}

// Check if on hub page
const isHubPage = computed(() => route.path.startsWith('/hub/'))
const hubSlug = computed(() => route.params.slug as string)

// Check if on blog page
const isBlogPage = computed(() => route.path.startsWith('/blog') || route.path === '/blog')
const currentBlogSlug = computed(() => {
  const match = route.path.match(/\/blog\/(.+)/)
  return match ? match[1] : null
})

// Blog posts list
const blogPosts = ref([
  { title: 'Getting Started with CorelDRAW', slug: 'getting-started-coreldraw' },
  { title: 'Mastering Vector Graphics', slug: 'mastering-vector-graphics' },
  { title: 'AI Tools for Designers', slug: 'ai-tools-designers' },
  { title: 'Font Pairing Guide', slug: 'font-pairing-guide' },
  { title: 'Design Trends 2024', slug: 'design-trends-2024' },
  { title: 'Creating Mockups', slug: 'creating-mockups' },
  { title: 'Print Ready Files', slug: 'print-ready-files' },
  { title: 'Logo Design Tips', slug: 'logo-design-tips' }
])

// Get selected category from URL query
const selectedCategorySlug = computed(() => route.query.category as string)

// Hub-specific categories with subcategories
const hubCategoriesWithSubs = computed(() => {
  const categoriesMap: Record<string, { 
    name: string; 
    slug: string; 
    icon: string;
    subcategories?: { name: string; slug: string }[];
  }[]> = {
    'coreldraw': [
      { name: 'Templates', slug: 'templates', icon: 'web',
        subcategories: ['Resume', 'Business Card', 'Brochure', 'Flyer', 'Poster', 'Certificate'] },
      { name: 'Vectors', slug: 'vectors', icon: 'category',
        subcategories: ['Animal', 'Nature', 'Abstract', 'Cartoon', 'Banner'] },
      { name: 'Graphics', slug: 'graphics', icon: 'palette',
        subcategories: ['Logos', 'Illustrations', 'Badges', 'Labels', 'Stickers'] },
      { name: 'Icons', slug: 'icons', icon: 'emoji_symbols',
        subcategories: ['Social', 'Business', 'Medical', 'Education', 'Shopping'] },
      { name: 'Mockups', slug: 'mockups', icon: 'dashboard',
        subcategories: ['T-Shirt', 'Mug', 'Phone', 'Laptop', 'Packaging'] },
      { name: 'Fonts', slug: 'fonts', icon: 'text_fields',
        subcategories: ['Display', 'Script', 'Serif', 'Sans Serif', 'Handwritten'] },
      { name: 'UI Kits', slug: 'ui-kits', icon: 'view_quilt',
        subcategories: ['Mobile', 'Web', 'Dashboard', 'E-commerce', 'Admin'] },
      { name: 'Patterns', slug: 'patterns', icon: 'pattern',
        subcategories: ['Geometric', 'Floral', 'Abstract', 'Seamless', 'Background'] }
    ],
    'ai-workflow': [
      { name: 'AI Tools', slug: 'ai-tools', icon: 'psychology',
        subcategories: ['ChatGPT', 'Midjourney', 'DALL-E', 'Stable Diffusion'] },
      { name: 'Automation', slug: 'automation', icon: 'smart_toys',
        subcategories: ['Workflows', 'Scripts', 'Plugins', 'APIs'] },
      { name: 'Templates', slug: 'templates', icon: 'web',
        subcategories: ['Social Media', 'Presentations', 'Videos'] },
      { name: 'Workflows', slug: 'workflows', icon: 'account_tree',
        subcategories: ['Image Gen', 'Text Gen', 'Video Gen', 'Audio Gen'] }
    ],
    'design-arsenal': [
      { name: 'UI Kits', slug: 'ui-kits', icon: 'view_quilt',
        subcategories: ['Mobile', 'Web', 'Dashboard', 'E-commerce'] },
      { name: 'Mockups', slug: 'mockups', icon: 'dashboard',
        subcategories: ['T-Shirt', 'Mug', 'Phone', 'Laptop'] },
      { name: 'Icons', slug: 'icons', icon: 'emoji_symbols',
        subcategories: ['Social', 'Business', 'Medical'] },
      { name: 'Graphics', slug: 'graphics', icon: 'palette',
        subcategories: ['Logos', 'Illustrations', 'Badges'] },
      { name: 'Fonts', slug: 'fonts', icon: 'text_fields',
        subcategories: ['Display', 'Script', 'Serif'] }
    ]
  }
  return hubSlug.value ? categoriesMap[hubSlug.value] || [] : []
})

// Get current category's subcategories
const currentSubcategories = computed(() => {
  if (!selectedCategorySlug.value) return []
  const category = hubCategoriesWithSubs.value.find(c => c.slug === selectedCategorySlug.value)
  return category?.subcategories?.map(sub => ({ name: sub, slug: sub.toLowerCase().replace(/\s+/g, '-') })) || []
})

// Show subcategories when a category is selected
const showSubcategories = computed(() => isHubPage.value && selectedCategorySlug.value && currentSubcategories.value.length > 0)

// Hub-specific categories (simple list)
const hubCategories = computed(() => {
  return hubCategoriesWithSubs.value.map(c => ({ name: c.name, slug: c.slug, icon: c.icon }))
})

// Determine which categories to show
const displayCategories = computed(() => {
  if (isHubPage.value && hubCategories.value.length > 0) {
    return hubCategories.value
  }
  return []
})

const categoryTitle = computed(() => {
  if (isBlogPage.value) {
    return 'Blogs'
  }
  if (isHubPage.value) {
    if (selectedCategorySlug.value) {
      const cat = displayCategories.value.find(c => c.slug === selectedCategorySlug.value)
      return cat?.name || 'Browse'
    }
    return 'Browse ' + (route.params.slug as string)?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }
  if (activeCategory.value) {
    return getCategoryName(activeCategory.value)
  }
  return 'Categories'
})

const handleCategoryClick = (slug: string) => {
  setActiveCategory(slug)
}

const goBack = () => {
  setActiveCategory(null)
}

// Set active category based on current route
watch(() => route.path, (path) => {
  if (path.includes('/category/')) {
    const slug = path.split('/category/')[1]?.split('/')[0]
    if (slug && ['graphics', 'fonts', 'templates', '3d'].includes(slug)) {
      setActiveCategory(slug)
    }
  } else {
    setActiveCategory(null)
  }
}, { immediate: true })

const getIcon = (slug: string) => {
  const icons: Record<string, string> = {
    graphics: 'palette',
    fonts: 'text_fields',
    templates: 'web',
    '3d': 'view_in_ar',
    crafts: 'construction'
  }
  return icons[slug] || 'folder'
}
</script>
