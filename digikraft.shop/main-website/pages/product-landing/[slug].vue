<template>
  <div class="min-h-screen bg-gray-950 text-white">

    <!-- STICKY HEADER -->
    <header class="sticky top-0 z-50 bg-gray-950/95 backdrop-blur border-b border-white/10">
      <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <NuxtLink to="/" class="text-xl font-black text-white">Digi<span class="text-indigo-400">Kraft</span></NuxtLink>
        <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
          <a v-for="nav in page.navLinks" :key="nav.label" :href="nav.href" class="hover:text-white transition-colors">{{ nav.label }}</a>
        </nav>
        <button @click="scrollToBuy" class="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg font-bold text-sm transition-all hover:scale-105 shadow-lg shadow-indigo-500/30">
          {{ page.ctaText || 'Buy Now' }}
        </button>
      </div>
    </header>

    <!-- HERO -->
    <section class="relative overflow-hidden py-20 px-6">
      <div class="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-gray-950"></div>
      <div class="relative max-w-7xl mx-auto">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div v-if="page.badge" class="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold px-4 py-2 rounded-full mb-6">
              <span>⚡</span> {{ page.badge }}
            </div>
            <h1 class="text-5xl lg:text-6xl font-black leading-tight mb-6">
              {{ page.headline }}
              <span v-if="page.headlineAccent" class="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{{ page.headlineAccent }}</span>
            </h1>
            <p class="text-xl text-gray-300 leading-relaxed mb-8">{{ page.subheadline }}</p>
            <div class="flex flex-wrap gap-4 mb-8">
              <button @click="scrollToBuy" class="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-2xl shadow-indigo-500/30 flex items-center gap-2">
                <span>🛒</span> {{ page.ctaText || 'Get It Now' }}
              </button>
              <a v-if="page.demoLink" :href="page.demoLink" target="_blank" class="border border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:bg-white/5 flex items-center gap-2">
                <span>▶</span> Watch Demo
              </a>
            </div>
            <!-- Hero Stats -->
            <div v-if="page.showStats" class="flex flex-wrap gap-6">
              <div v-for="stat in page.stats" :key="stat.label" class="text-center">
                <div class="text-2xl font-black text-white">{{ stat.value }}</div>
                <div class="text-xs text-gray-400">{{ stat.label }}</div>
              </div>
            </div>
          </div>
          <!-- Hero Media -->
          <div class="relative">
            <div v-if="page.heroVideoId && page.showHeroVideo" class="relative rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/20 border border-white/10">
              <div class="aspect-video">
                <iframe :src="`https://www.youtube.com/embed/${page.heroVideoId}?autoplay=0&rel=0`" class="w-full h-full" frameborder="0" allowfullscreen></iframe>
              </div>
            </div>
            <img v-else-if="page.heroImage" :src="page.heroImage" :alt="page.headline" class="w-full rounded-2xl shadow-2xl shadow-indigo-500/20 border border-white/10" />
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURES -->
    <section v-if="page.showFeatures && page.features?.length" class="py-20 px-6 bg-gray-900/50">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-14">
          <h2 class="text-4xl font-black mb-4">{{ page.featuresTitle || 'Key Features' }}</h2>
          <p class="text-gray-400 text-lg max-w-2xl mx-auto">{{ page.featuresSubtitle }}</p>
        </div>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="feat in page.features" :key="feat.title" class="bg-gray-800/60 border border-white/10 rounded-2xl p-6 hover:border-indigo-500/50 hover:bg-gray-800 transition-all group">
            <div class="text-3xl mb-4">{{ feat.icon }}</div>
            <h3 class="text-lg font-bold mb-2 group-hover:text-indigo-300 transition-colors">{{ feat.title }}</h3>
            <p class="text-gray-400 text-sm leading-relaxed">{{ feat.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- DEMO VIDEO SECTION -->
    <section v-if="page.showDemoVideo && page.demoVideoId" class="py-20 px-6">
      <div class="max-w-5xl mx-auto text-center">
        <div class="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold px-4 py-2 rounded-full mb-6">
          <span>▶</span> VIDEO DEMO
        </div>
        <h2 class="text-4xl font-black mb-4">{{ page.demoVideoTitle || 'See It In Action' }}</h2>
        <p class="text-gray-400 mb-10">{{ page.demoVideoSubtitle }}</p>
        <div class="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10">
          <div class="aspect-video">
            <iframe :src="`https://www.youtube.com/embed/${page.demoVideoId}?rel=0`" class="w-full h-full" frameborder="0" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
          </div>
        </div>
      </div>
    </section>

    <!-- SCREENSHOTS GALLERY -->
    <section v-if="page.showGallery && page.gallery?.length" class="py-20 px-6 bg-gray-900/50">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-4xl font-black mb-4">{{ page.galleryTitle || 'Screenshots' }}</h2>
        </div>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="(img, i) in page.gallery" :key="i" @click="openLightbox(img)" class="relative rounded-xl overflow-hidden border border-white/10 cursor-pointer group hover:border-indigo-500/50 transition-all">
            <img :src="img.url" :alt="img.caption||'Screenshot'" class="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500" />
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
              <span class="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity">🔍</span>
            </div>
            <div v-if="img.caption" class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-sm font-medium">{{ img.caption }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section v-if="page.showHowItWorks && page.steps?.length" class="py-20 px-6">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-14">
          <h2 class="text-4xl font-black mb-4">{{ page.howItWorksTitle || 'How It Works' }}</h2>
        </div>
        <div class="space-y-6">
          <div v-for="(step, i) in page.steps" :key="i" class="flex gap-6 items-start bg-gray-800/40 border border-white/10 rounded-2xl p-6 hover:border-indigo-500/30 transition-all">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center font-black text-xl flex-shrink-0">{{ i+1 }}</div>
            <div>
              <h3 class="text-lg font-bold mb-1">{{ step.title }}</h3>
              <p class="text-gray-400">{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- TESTIMONIALS -->
    <section v-if="page.showTestimonials && page.testimonials?.length" class="py-20 px-6 bg-gray-900/50">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-14">
          <h2 class="text-4xl font-black mb-4">{{ page.testimonialsTitle || 'What Users Say' }}</h2>
        </div>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="t in page.testimonials" :key="t.name" class="bg-gray-800/60 border border-white/10 rounded-2xl p-6 hover:border-indigo-500/30 transition-all">
            <div class="flex items-center gap-1 mb-4">
              <span v-for="s in 5" :key="s" :class="s <= t.rating ? 'text-yellow-400' : 'text-gray-600'" class="text-lg">★</span>
            </div>
            <p class="text-gray-300 text-sm leading-relaxed mb-6">"{{ t.text }}"</p>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-sm">{{ t.name[0] }}</div>
              <div>
                <div class="font-bold text-sm">{{ t.name }}</div>
                <div class="text-xs text-gray-400">{{ t.role }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section v-if="page.showFAQ && page.faq?.length" class="py-20 px-6">
      <div class="max-w-3xl mx-auto">
        <div class="text-center mb-14">
          <h2 class="text-4xl font-black mb-4">{{ page.faqTitle || 'Frequently Asked Questions' }}</h2>
        </div>
        <div class="space-y-3">
          <div v-for="(item, i) in page.faq" :key="i" class="bg-gray-800/60 border border-white/10 rounded-xl overflow-hidden">
            <button @click="toggleFaq(i)" class="w-full flex items-center justify-between p-5 text-left hover:bg-gray-700/40 transition-colors">
              <span class="font-bold">{{ item.q }}</span>
              <span class="text-indigo-400 text-xl transition-transform" :class="openFaq===i?'rotate-45':''">+</span>
            </button>
            <div v-if="openFaq===i" class="px-5 pb-5 text-gray-400 text-sm leading-relaxed border-t border-white/10 pt-4">{{ item.a }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- PRICING / BUY SECTION -->
    <section id="buy" class="py-20 px-6 bg-gradient-to-br from-indigo-900/40 to-purple-900/20">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-5xl font-black mb-4">{{ page.pricingTitle || 'Get Started Today' }}</h2>
        <p class="text-gray-300 text-lg mb-12">{{ page.pricingSubtitle }}</p>
        <div class="bg-gray-800/80 border border-indigo-500/30 rounded-3xl p-10 shadow-2xl shadow-indigo-500/10 max-w-lg mx-auto">
          <div v-if="page.originalPrice" class="text-gray-400 line-through text-2xl mb-1">₹{{ page.originalPrice }}</div>
          <div class="text-6xl font-black text-white mb-2">₹{{ page.price }}</div>
          <div v-if="page.originalPrice" class="inline-block bg-green-500/20 text-green-400 text-sm font-bold px-4 py-1 rounded-full mb-6">
            Save ₹{{ page.originalPrice - page.price }} ({{ Math.round((1-page.price/page.originalPrice)*100) }}% OFF)
          </div>
          <ul class="text-left space-y-3 mb-8">
            <li v-for="inc in page.includes" :key="inc" class="flex items-center gap-3 text-sm">
              <span class="text-green-400 text-lg">✓</span>
              <span class="text-gray-300">{{ inc }}</span>
            </li>
          </ul>
          <button @click="addToCartAndBuy" class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-5 rounded-2xl font-black text-xl transition-all hover:scale-105 shadow-2xl shadow-indigo-500/30 mb-4">
            🛒 {{ page.ctaText || 'Buy Now' }} — ₹{{ page.price }}
          </button>
          <p class="text-xs text-gray-500">{{ page.guarantee || '30-day money back guarantee · Instant download' }}</p>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="py-10 px-6 border-t border-white/10 text-center text-gray-500 text-sm">
      <NuxtLink to="/" class="text-white font-black text-lg mb-2 block">Digi<span class="text-indigo-400">Kraft</span></NuxtLink>
      <p>© {{ new Date().getFullYear() }} DigiKraft.shop · All rights reserved</p>
    </footer>

    <!-- LIGHTBOX -->
    <div v-if="lightboxImg" @click="lightboxImg=null" class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-pointer">
      <img :src="lightboxImg" class="max-w-full max-h-full rounded-xl shadow-2xl" @click.stop />
    </div>

  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const slug = route.params.slug as string

const openFaq = ref<number|null>(null)
const lightboxImg = ref<string|null>(null)

const toggleFaq = (i: number) => { openFaq.value = openFaq.value === i ? null : i }
const openLightbox = (img: any) => { lightboxImg.value = img.url }
const scrollToBuy = () => document.getElementById('buy')?.scrollIntoView({ behavior: 'smooth' })

// Load page data from localStorage (client-side only)
const page = ref<any>({
  headline: 'Loading...', subheadline: '', price: 0, ctaText: 'Buy Now',
  includes: [], features: [], gallery: [], steps: [], testimonials: [], faq: [], stats: [], navLinks: []
})

onMounted(() => {
  try {
    const allPages = JSON.parse(localStorage.getItem('dk_landing_pages') || '[]')
    const found = allPages.find((p: any) => p.slug === slug)
    if (found) {
      page.value = found
    } else {
      // Redirect to standard product page if no landing page found
      router.push(`/product/${slug}`)
    }
  } catch {
    router.push(`/product/${slug}`)
  }
})

const addToCartAndBuy = () => {
  router.push(`/product/${slug}`)
}

useHead({
  title: computed(() => page.value?.seoTitle || page.value?.headline || 'Product'),
  meta: [{ name: 'description', content: computed(() => page.value?.seoDesc || page.value?.subheadline || '') as any }]
})
</script>
