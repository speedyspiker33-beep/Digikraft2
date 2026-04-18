<template>
  <div class="landing-page" :style="pageStyles">
    <!-- Minimal Header (no main nav) -->
    <header class="py-4 px-6 flex justify-between items-center">
      <NuxtLink to="/" class="text-2xl font-bold">DigiKraft</NuxtLink>
      <button @click="scrollToCTA" class="btn-primary px-6 py-2 rounded-lg">
        {{ landingPage?.ctaButtonText || 'Get Started' }}
      </button>
    </header>

    <!-- Hero Section -->
    <section class="hero min-h-screen flex items-center justify-center px-6">
      <div class="max-w-6xl mx-auto text-center">
        <!-- Hero Image -->
        <div v-if="landingPage?.heroImage" class="mb-8">
          <img 
            :src="getImageUrl(landingPage.heroImage)" 
            :alt="landingPage.title"
            class="mx-auto max-w-3xl w-full rounded-2xl shadow-2xl"
          />
        </div>

        <!-- Headline -->
        <h1 class="text-5xl md:text-7xl font-bold mb-6">
          {{ landingPage?.headline }}
        </h1>

        <!-- Subheadline -->
        <p class="text-xl md:text-2xl mb-8 opacity-90">
          {{ landingPage?.subheadline }}
        </p>

        <!-- CTA Button -->
        <NuxtLink 
          :to="landingPage?.ctaButtonLink || '/products'"
          class="inline-block bg-white text-gray-900 px-12 py-4 rounded-full text-lg font-semibold hover:scale-105 transition-transform shadow-xl"
        >
          {{ landingPage?.ctaButtonText || 'Shop Now' }}
        </NuxtLink>
      </div>
    </section>

    <!-- Features Section (if features exist) -->
    <section v-if="landingPage?.features" class="py-20 px-6 bg-white/10">
      <div class="max-w-6xl mx-auto">
        <div class="grid md:grid-cols-3 gap-8">
          <div 
            v-for="(feature, index) in parsedFeatures" 
            :key="index"
            class="text-center p-6"
          >
            <div class="text-4xl mb-4">{{ feature.icon }}</div>
            <h3 class="text-xl font-bold mb-2">{{ feature.title }}</h3>
            <p class="opacity-80">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Product Showcase (if featured product) -->
    <section v-if="landingPage?.featuredProduct" class="py-20 px-6">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-4xl font-bold mb-12">What You'll Get</h2>
        <div class="bg-white/10 rounded-2xl p-8 backdrop-blur">
          <h3 class="text-2xl font-bold mb-4">
            {{ landingPage.featuredProduct.title }}
          </h3>
          <p class="text-lg mb-6 opacity-90">
            {{ landingPage.featuredProduct.description }}
          </p>
          <div class="text-3xl font-bold mb-6">
            ₹{{ landingPage.featuredProduct.price }}
          </div>
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section id="cta" class="py-20 px-6 text-center">
      <h2 class="text-4xl font-bold mb-6">Ready to Get Started?</h2>
      <NuxtLink 
        :to="landingPage?.ctaButtonLink || '/products'"
        class="inline-block bg-white text-gray-900 px-12 py-4 rounded-full text-lg font-semibold hover:scale-105 transition-transform shadow-xl"
      >
        {{ landingPage?.ctaButtonText || 'Buy Now' }}
      </NuxtLink>
    </section>

    <!-- Minimal Footer -->
    <footer class="py-8 px-6 text-center opacity-70 text-sm">
      <p>&copy; 2024 DigiKraft. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug

// Fetch landing page data from Strapi
const { data: landingPage } = await useFetch(`http://localhost:1337/api/landing-pages`, {
  params: {
    'filters[slug][$eq]': slug,
    'populate': '*'
  },
  transform: (response: any) => response.data?.[0]?.attributes
})

// If no landing page found, redirect to home
if (!landingPage.value) {
  navigateTo('/')
}

// Parse features JSON
const parsedFeatures = computed(() => {
  if (!landingPage.value?.features) return []
  try {
    return typeof landingPage.value.features === 'string' 
      ? JSON.parse(landingPage.value.features)
      : landingPage.value.features
  } catch {
    return []
  }
})

// Dynamic page styles
const pageStyles = computed(() => ({
  backgroundColor: landingPage.value?.backgroundColor || '#6366f1',
  color: landingPage.value?.textColor || '#ffffff'
}))

// Helper to get image URL
const getImageUrl = (image: any) => {
  if (!image) return ''
  const url = image.data?.attributes?.url || image.url
  return url?.startsWith('http') ? url : `http://localhost:1337${url}`
}

// Scroll to CTA
const scrollToCTA = () => {
  document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' })
}

// SEO
useHead({
  title: landingPage.value?.title || 'Special Offer',
  meta: [
    { name: 'description', content: landingPage.value?.subheadline || '' }
  ]
})
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
}

.btn-primary {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s;
}

.btn-primary:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}
</style>
