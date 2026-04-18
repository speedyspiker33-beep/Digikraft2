<template>
  <div class="min-h-screen flex flex-col">
    <LayoutTopBar />
    <LayoutHeader />
    <LayoutNav />
    
    <!-- Page Banners - Shows on special pages, replaces padding -->
    <div v-if="pageBanner" class="bg-gradient-to-r" :class="pageBanner.gradient">
      <div class="max-w-7xl mx-auto px-6 py-6 flex items-center gap-4">
        <span class="material-symbols-outlined text-white text-3xl">{{ pageBanner.icon }}</span>
        <div>
          <h1 class="text-xl font-bold text-white">{{ pageBanner.title }}</h1>
          <p class="text-white/80 text-sm">{{ pageBanner.description }}</p>
        </div>
      </div>
    </div>
    
    <main class="flex-1 flex" :class="pageBanner ? 'pt-0' : 'pt-[144px]'">
      <div class="flex-1 flex max-w-[1920px] mx-auto w-full">
        <!-- Left Sidebar - hide on auth pages -->
        <LayoutLeftSidebar v-if="!isAuthPage" />
        
        <!-- Main Content -->
        <div class="flex-1 min-w-0">
          <slot />
        </div>
        
        <!-- Right Sidebar - hide on auth pages -->
        <LayoutRightSidebar v-if="!isAuthPage" />
      </div>
    </main>
    
    <LayoutFooter />
    <LayoutCartDrawer />
    <AuthModal ref="authModal" />
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'
import { useProductsStore } from '~/stores/products'

const route = useRoute()

const cartStore = useCartStore()
const authStore = useAuthStore()
const productsStore = useProductsStore()

// Expose auth modal for global use
const authModal = ref()
provide('openAuthModal', (showLogin = true) => {
  if (authModal.value) {
    authModal.value.open(showLogin)
  }
})

// Hide sidebars on specific pages
const isAuthPage = computed(() => {
  const path = route.path
  const noSidebarPages = ['/login', '/register', '/forgot-password', '/cart', '/checkout', '/account', '/purchases']
  return noSidebarPages.some(page => path.startsWith(page))
})

// Get hub name from route
const hubName = computed(() => {
  const slug = route.params.slug
  if (slug === 'coreldraw') return 'CorelDRAW Hub'
  if (slug === 'ai-workflow') return 'AI Workflow Hub'
  if (slug === 'design-arsenal') return 'Design Arsenal Hub'
  return 'Hub'
})

// Page banner based on current route
const pageBanner = computed(() => {
  const path = route.path
  
  // Hub pages
  if (path.startsWith('/hub/')) {
    const slug = route.params.slug as string
    const hubData: Record<string, { title: string; description: string; icon: string; gradient: string }> = {
      'coreldraw': { 
        title: 'CorelDRAW Hub', 
        description: 'Exclusive brushes, templates & vector resources',
        icon: 'draw',
        gradient: 'from-emerald-600 via-teal-500 to-emerald-600 bg-size-200 animate-gradient'
      },
      'ai-workflow': { 
        title: 'AI Workflow Hub', 
        description: 'AI-powered design automation tools',
        icon: 'psychology',
        gradient: 'from-fuchsia-600 via-purple-600 to-pink-600 bg-size-200 animate-gradient'
      },
      'design-arsenal': { 
        title: 'Design Arsenal Hub', 
        description: 'Complete toolkit for designers',
        icon: 'construction',
        gradient: 'from-cyan-600 via-blue-600 to-cyan-600 bg-size-200 animate-gradient'
      }
    }
    return hubData[slug] || null
  }
  
  // Blog pages
  if (path.startsWith('/blog') || path === '/blog') {
    return {
      title: 'DigiKraft Blog',
      description: 'Tips, tutorials and insights for creative professionals',
      icon: 'article',
      gradient: 'from-blue-600 via-purple-600 to-pink-600 bg-size-200 animate-gradient'
    }
  }
  
  // About page
  if (path === '/about') {
    return {
      title: 'About DigiKraft',
      description: 'Your trusted destination for premium digital assets',
      icon: 'info',
      gradient: 'from-amber-500 to-orange-500'
    }
  }
  
  // Category pages
  if (path.startsWith('/category/')) {
    const slug = route.params.slug as string
    const categoryData: Record<string, { title: string; icon: string; gradient: string }> = {
      'graphics': { title: 'Graphics', icon: 'palette', gradient: 'from-pink-500 to-rose-500' },
      'fonts': { title: 'Fonts', icon: 'text_fields', gradient: 'from-violet-500 to-purple-500' },
      'templates': { title: 'Templates', icon: 'web', gradient: 'from-blue-500 to-cyan-500' },
      '3d': { title: '3D Assets', icon: 'view_in_ar', gradient: 'from-orange-500 to-amber-500' }
    }
    const cat = categoryData[slug]
    if (cat) {
      return {
        title: cat.title,
        description: `Premium ${cat.title.toLowerCase()} for creative professionals`,
        icon: cat.icon,
        gradient: cat.gradient
      }
    }
  }
  
  // Product page
  if (path.startsWith('/product/')) {
    return {
      title: 'Product Details',
      description: 'View product information',
      icon: 'inventory_2',
      gradient: 'from-gray-600 to-gray-800'
    }
  }
  
  // Help/FAQ/Ticket pages
  if (path === '/help') {
    return {
      title: 'Help Center',
      description: 'Get help and support',
      icon: 'help',
      gradient: 'from-green-600 to-teal-600'
    }
  }
  
  if (path === '/faq') {
    return {
      title: 'FAQ',
      description: 'Frequently asked questions',
      icon: 'quiz',
      gradient: 'from-indigo-600 to-blue-600'
    }
  }
  
  if (path === '/ticket') {
    return {
      title: 'Submit Ticket',
      description: 'Contact us for custom work',
      icon: 'confirmation_number',
      gradient: 'from-red-600 to-orange-600'
    }
  }
  
  return null
})

// Load persisted data immediately on client
if (process.client) {
  cartStore.loadFromLocalStorage()
  productsStore.fetchCategories()
}
</script>

<style>
.animate-gradient {
  animation: gradient-animation 8s ease infinite;
  background-size: 200% 200%;
}

@keyframes gradient-animation {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
