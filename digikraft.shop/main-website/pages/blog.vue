<template>
  <div class="container mx-auto px-6 py-8">
    <!-- Category Tabs -->
    <div class="flex items-center justify-center gap-2 mb-6 flex-wrap">
      <button
        v-for="cat in categories"
        :key="cat.slug"
        @click="selectedCategory = cat.slug"
        class="px-4 py-2 rounded-lg font-medium text-sm transition-all"
        :class="selectedCategory === cat.slug 
          ? 'bg-primary text-white shadow-md' 
          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'"
      >
        {{ cat.name }}
      </button>
    </div>

    <!-- Articles Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <article
        v-for="article in filteredArticles"
        :key="article.id"
        class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group"
      >
        <!-- Article Image -->
        <div class="relative h-48 overflow-hidden">
          <img 
            :src="article.image" 
            :alt="article.title"
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div class="absolute top-4 left-4">
            <span class="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
              {{ getCategoryName(article.category) }}
            </span>
          </div>
        </div>

        <!-- Article Content -->
        <div class="p-6">
          <div class="flex items-center gap-4 text-xs text-gray-500 mb-3">
            <span class="flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">calendar_today</span>
              {{ formatDate(article.date) }}
            </span>
            <span class="flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">schedule</span>
              {{ article.readTime }} min read
            </span>
          </div>

          <h3 class="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors line-clamp-2">
            {{ article.title }}
          </h3>

          <p class="text-gray-600 text-sm mb-4 line-clamp-3">
            {{ article.excerpt }}
          </p>

          <NuxtLink 
            :to="`/blog/${article.slug}`"
            class="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all"
          >
            Read More
            <span class="material-symbols-outlined text-sm">arrow_forward</span>
          </NuxtLink>
        </div>
      </article>
    </div>

    <!-- Empty State -->
    <div v-if="filteredArticles.length === 0" class="text-center py-16">
      <span class="material-symbols-outlined text-gray-300 text-6xl mb-4">article</span>
      <h3 class="text-xl font-bold text-gray-900 mb-2">No articles found</h3>
      <p class="text-gray-600">Check back soon for new content!</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { config } = useSiteConfig()

// Categories
const categories = [
  { slug: 'all', name: 'All Posts', icon: 'grid_view' },
  { slug: 'guides', name: 'Guides', icon: 'menu_book' },
  { slug: 'tutorials', name: 'Tutorials', icon: 'school' },
  { slug: 'tips', name: 'Tips & Tricks', icon: 'lightbulb' },
  { slug: 'ai', name: 'AI Articles', icon: 'psychology' },
  { slug: 'design', name: 'Design', icon: 'palette' },
  { slug: 'news', name: 'News', icon: 'newspaper' }
]

const selectedCategory = ref(route.query.category as string || 'all')

watch(() => route.query.category, (newCategory) => {
  selectedCategory.value = newCategory as string || 'all'
})

// Merge admin articles with hardcoded sample articles
const adminArticles = computed(() => {
  return (config.value.blog?.articles || []).filter((a: any) => a.published !== false).map((a: any) => ({
    id: a.id, slug: a.slug || a.id, title: a.title, excerpt: a.excerpt || '',
    category: a.category || 'guides', image: a.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop',
    date: a.date || new Date().toISOString().slice(0,10), readTime: a.readTime || 5
  }))
})

const sampleArticles = ref([
  { id: 1, slug: 'getting-started-with-figma-templates', title: 'Getting Started with Figma Templates: A Complete Guide', excerpt: 'Learn how to install, customize, and use Figma templates effectively.', category: 'guides', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop', date: '2024-02-20', readTime: 8 },
  { id: 2, slug: 'ai-powered-design-workflow', title: 'How AI is Revolutionizing Design Workflows in 2024', excerpt: 'Discover how artificial intelligence is transforming the way designers work.', category: 'ai', image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop', date: '2024-02-19', readTime: 6 },
  { id: 3, slug: 'photoshop-brush-installation', title: 'How to Install Photoshop Brushes: Step-by-Step Tutorial', excerpt: 'A detailed walkthrough on installing custom brushes in Adobe Photoshop.', category: 'tutorials', image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&h=600&fit=crop', date: '2024-02-18', readTime: 5 },
  { id: 4, slug: 'color-theory-tips', title: '10 Color Theory Tips Every Designer Should Know', excerpt: 'Master the fundamentals of color theory with these essential tips.', category: 'tips', image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&h=600&fit=crop', date: '2024-02-17', readTime: 7 },
  { id: 5, slug: 'font-pairing-guide', title: 'The Ultimate Guide to Font Pairing', excerpt: 'Learn the art of combining fonts to create beautiful typography.', category: 'guides', image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=600&fit=crop', date: '2024-02-16', readTime: 10 },
  { id: 6, slug: 'design-trends-2024', title: 'Top Design Trends to Watch in 2024', excerpt: 'Stay ahead of the curve with these emerging design trends.', category: 'design', image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&h=600&fit=crop', date: '2024-02-15', readTime: 9 }
])

const articles = computed(() => {
  const all = [...backendArticles.value, ...adminArticles.value, ...sampleArticles.value]
  // Deduplicate by slug
  const seen = new Set()
  return all.filter(a => { if (seen.has(a.slug)) return false; seen.add(a.slug); return true; })
})

// Fetch from backend API
const backendArticles = ref<any[]>([])
const loadBlogPosts = async () => {
  try {
    const config = useRuntimeConfig()
    const res = await $fetch<any>(`${config.public.apiBase}/v1/blog?status=published&limit=50`)
    if (res.success && res.data?.length) {
      backendArticles.value = res.data.map((p: any) => ({
        id: p.id, slug: p.slug, title: p.title, excerpt: p.excerpt || '',
        category: p.category?.toLowerCase() || 'guides',
        image: p.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop',
        date: p.created_at?.slice(0,10) || new Date().toISOString().slice(0,10),
        readTime: 5
      }))
    }
  } catch (e) {}
}

onMounted(() => loadBlogPosts())

const filteredArticles = computed(() => {
  if (selectedCategory.value === 'all') return articles.value
  return articles.value.filter(article => article.category === selectedCategory.value)
})

const getCategoryName = (slug: string) => {
  const category = categories.find(cat => cat.slug === slug)
  return category?.name || slug
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

useHead({ title: 'Blog - Guides, Tutorials & Tips' })
</script>
