<template>
  <div>
    <!-- Toast Notifications -->
    <UiToast />

    <!-- Quick View Modal -->
    <MobileQuickViewModal 
      :is-open="quickViewOpen"
      :product="selectedProduct"
      @close="quickViewOpen = false"
    />

    <!-- Filter Sheet -->
    <MobileFilterSheet 
      :is-open="filterSheetOpen"
      @close="filterSheetOpen = false"
      @apply="applyFilters"
    />

    <!-- Main Layout -->
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <!-- Bottom Navigation (Mobile) -->
    <MobileBottomNavigation />
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types'

const { config, loadFromBackend } = useSiteConfig()

// Mobile state
const quickViewOpen = ref(false)
const selectedProduct = ref<Product | null>(null)
const filterSheetOpen = ref(false)

// Provide functions to child components
const openQuickView = (product: Product) => {
  selectedProduct.value = product
  quickViewOpen.value = true
}

const openFilterSheet = () => {
  filterSheetOpen.value = true
}

const applyFilters = (filters: any) => {
  // Emit filters to parent or store
  console.log('Filters applied:', filters)
}

provide('openQuickView', openQuickView)
provide('openFilterSheet', openFilterSheet)

// Apply branding from admin Appearance → Branding settings
onMounted(async () => {
  // Load config from backend first (cross-origin sync from admin panel)
  await loadFromBackend()

  const applyBranding = () => {
    const branding = config.value.branding || {}
    if (branding.primaryColor) {
      document.documentElement.style.setProperty('--color-primary', branding.primaryColor)
    }
    if (branding.faviconUrl) {
      const link = document.querySelector("link[rel='icon']") as HTMLLinkElement || document.createElement('link')
      link.rel = 'icon'
      link.href = branding.faviconUrl
      document.head.appendChild(link)
    }
  }
  applyBranding()
  // Re-apply when config changes (admin saves)
  watch(() => config.value.branding, applyBranding, { deep: true })
})

useHead({
  titleTemplate: (titleChunk) => {
    const siteName = config.value.branding?.siteName || 'DigiKraft.shop'
    return titleChunk ? `${titleChunk} - ${siteName}` : `${siteName} | ${config.value.branding?.tagline || 'Premium Digital Marketplace'}`
  }
})
</script>
