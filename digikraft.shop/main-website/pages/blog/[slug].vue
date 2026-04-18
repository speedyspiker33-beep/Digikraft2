<template>
  <div class="container mx-auto px-6 py-12 max-w-4xl">
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-2 text-sm text-gray-600 mb-8">
      <NuxtLink to="/" class="hover:text-primary">Home</NuxtLink>
      <span class="material-symbols-outlined text-sm">chevron_right</span>
      <NuxtLink to="/blog" class="hover:text-primary">Blog</NuxtLink>
      <span class="material-symbols-outlined text-sm">chevron_right</span>
      <span class="text-gray-900">{{ article.title }}</span>
    </nav>

    <!-- Article Header -->
    <article class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <!-- Featured Image -->
      <div class="relative h-96 overflow-hidden">
        <img 
          :src="article.image" 
          :alt="article.title"
          class="w-full h-full object-cover"
        />
        <div class="absolute top-6 left-6">
          <span class="bg-primary text-white text-sm font-bold px-4 py-2 rounded-full">
            {{ article.category }}
          </span>
        </div>
      </div>

      <!-- Article Content -->
      <div class="p-8 lg:p-12">
        <!-- Meta Info -->
        <div class="flex items-center gap-6 text-sm text-gray-600 mb-6">
          <span class="flex items-center gap-2">
            <span class="material-symbols-outlined text-lg">calendar_today</span>
            {{ formatDate(article.date) }}
          </span>
          <span class="flex items-center gap-2">
            <span class="material-symbols-outlined text-lg">schedule</span>
            {{ article.readTime }} min read
          </span>
          <span class="flex items-center gap-2">
            <span class="material-symbols-outlined text-lg">person</span>
            {{ article.author }}
          </span>
        </div>

        <!-- Title -->
        <h1 class="text-4xl font-bold text-gray-900 mb-6">
          {{ article.title }}
        </h1>

        <!-- Excerpt -->
        <p class="text-xl text-gray-600 mb-8 leading-relaxed">
          {{ article.excerpt }}
        </p>

        <!-- Article Body -->
        <div class="prose prose-lg max-w-none" v-html="article.content"></div>

        <!-- Tags -->
        <div class="flex items-center gap-3 mt-12 pt-8 border-t border-gray-200">
          <span class="text-sm font-semibold text-gray-700">Tags:</span>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tag in article.tags"
              :key="tag"
              class="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full hover:bg-primary hover:text-white transition-colors cursor-pointer"
            >
              {{ tag }}
            </span>
          </div>
        </div>

        <!-- Share Buttons -->
        <div class="flex items-center gap-4 mt-8 pt-8 border-t border-gray-200">
          <span class="text-sm font-semibold text-gray-700">Share:</span>
          <button class="flex items-center justify-center size-10 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            <span class="material-symbols-outlined text-lg">share</span>
          </button>
          <button class="flex items-center justify-center size-10 rounded-full bg-blue-400 text-white hover:bg-blue-500 transition-colors">
            <span class="material-symbols-outlined text-lg">link</span>
          </button>
        </div>
      </div>
    </article>

    <!-- Related Articles -->
    <div class="mt-16">
      <h2 class="text-2xl font-bold text-gray-900 mb-8">Related Articles</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <NuxtLink
          v-for="related in relatedArticles"
          :key="related.id"
          :to="`/blog/${related.slug}`"
          class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group"
        >
          <div class="relative h-40 overflow-hidden">
            <img 
              :src="related.image" 
              :alt="related.title"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <div class="p-4">
            <h3 class="font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
              {{ related.title }}
            </h3>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

// Sample article data (replace with API call to Strapi)
const article = ref({
  id: 1,
  slug: 'getting-started-with-figma-templates',
  title: 'Getting Started with Figma Templates: A Complete Guide',
  excerpt: 'Learn how to install, customize, and use Figma templates effectively. This comprehensive guide covers everything from setup to advanced customization.',
  category: 'Guides',
  image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=800&fit=crop',
  date: '2024-02-20',
  readTime: 8,
  author: 'DigiKraft Team',
  tags: ['Figma', 'Templates', 'Design', 'Tutorial'],
  content: `
    <h2>Introduction</h2>
    <p>Figma templates are pre-designed files that help you jumpstart your design projects. Whether you're creating a website, mobile app, or marketing materials, templates can save you hours of work.</p>
    
    <h2>Step 1: Finding the Right Template</h2>
    <p>Browse our extensive collection of Figma templates. Look for templates that match your project requirements in terms of style, layout, and functionality.</p>
    
    <h2>Step 2: Installation Process</h2>
    <ol>
      <li>Download the template file from your purchase confirmation email</li>
      <li>Open Figma in your browser or desktop app</li>
      <li>Click "Import" and select the downloaded .fig file</li>
      <li>The template will open in a new Figma file</li>
    </ol>
    
    <h2>Step 3: Customization</h2>
    <p>Once imported, you can customize every aspect of the template:</p>
    <ul>
      <li>Change colors using the color styles panel</li>
      <li>Update text content throughout the design</li>
      <li>Replace placeholder images with your own</li>
      <li>Modify layouts to fit your needs</li>
    </ul>
    
    <h2>Pro Tips</h2>
    <p>Here are some expert tips to get the most out of your Figma templates:</p>
    <ul>
      <li>Always duplicate the original file before making changes</li>
      <li>Use Figma's component system to maintain consistency</li>
      <li>Leverage auto-layout for responsive designs</li>
      <li>Organize your layers with clear naming conventions</li>
    </ul>
    
    <h2>Troubleshooting</h2>
    <p>If you encounter any issues during installation or customization, check our help center or contact support for assistance.</p>
    
    <h2>Conclusion</h2>
    <p>Figma templates are powerful tools that can significantly speed up your design workflow. With this guide, you're now equipped to make the most of them!</p>
  `
})

// Related articles
const relatedArticles = ref([
  {
    id: 2,
    slug: 'photoshop-brush-installation',
    title: 'How to Install Photoshop Brushes',
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=300&fit=crop'
  },
  {
    id: 3,
    slug: 'font-pairing-guide',
    title: 'The Ultimate Guide to Font Pairing',
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop'
  },
  {
    id: 4,
    slug: 'color-theory-tips',
    title: '10 Color Theory Tips',
    image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&h=300&fit=crop'
  }
])

// Helper function
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

// SEO
useHead({
  title: article.value.title,
  meta: [
    {
      name: 'description',
      content: article.value.excerpt
    }
  ]
})
</script>

<style scoped>
.prose h2 {
  @apply text-2xl font-bold text-gray-900 mt-8 mb-4;
}

.prose h3 {
  @apply text-xl font-bold text-gray-900 mt-6 mb-3;
}

.prose p {
  @apply text-gray-700 leading-relaxed mb-4;
}

.prose ul, .prose ol {
  @apply ml-6 mb-4 space-y-2;
}

.prose ul {
  @apply list-disc;
}

.prose ol {
  @apply list-decimal;
}

.prose li {
  @apply text-gray-700;
}

.prose a {
  @apply text-primary hover:underline;
}
</style>
