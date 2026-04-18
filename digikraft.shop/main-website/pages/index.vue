<template>
  <div>
    <!-- Announcement Banner (from admin Appearance → Homepage settings) -->
    <ClientOnly>
      <div 
        v-if="homepage.announcementBannerEnabled && homepage.announcementBannerText"
        class="w-full text-center py-2 text-sm font-bold text-white cursor-pointer transition-opacity hover:opacity-90"
        :style="`background:${homepage.announcementBannerColor||'#6366f1'}`"
        @click="homepage.announcementBannerLink ? navigateTo(homepage.announcementBannerLink) : null"
      >
        {{ homepage.announcementBannerText }}
      </div>
    </ClientOnly>

    <SectionsHero v-if="homepage.heroEnabled !== false" />
    <SectionsFeaturedProducts v-if="homepage.featuredEnabled !== false" />
    <SectionsHubCards v-if="homepage.hubCardsEnabled !== false" />
    <SectionsFeaturesBar />
    <SectionsNewsletter v-if="homepage.newsletterEnabled !== false" />
  </div>
</template>

<script setup lang="ts">
import { useProductsStore } from '~/stores/products'

const productsStore = useProductsStore()
const { config } = useSiteConfig()

// Homepage settings from admin Appearance panel
const homepage = computed(() => config.value.homepage || {})

// Fetch products on client-side
if (import.meta.client) {
  productsStore.fetchProducts()
}

useHead({
  title: 'Home',
  meta: [
    { name: 'description', content: 'Browse premium digital assets, graphics, fonts, and templates at DigiKraft.shop' }
  ]
})
</script>
