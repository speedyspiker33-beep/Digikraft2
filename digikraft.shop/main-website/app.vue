<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const { config, loadFromBackend } = useSiteConfig()

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
