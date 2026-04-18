<template>
  <div v-if="cfg.enabled !== false" class="bg-gray-50 border-b border-gray-100 py-1.5 px-6 lg:px-12 sticky top-0 z-[100]">
    <!-- Announcement Banner -->
    <div
      v-if="cfg.announcementEnabled && cfg.announcement"
      class="w-full text-center py-1 text-xs font-bold text-white rounded mb-1 cursor-pointer"
      :style="`background:${cfg.announcementColor || '#6366f1'}`"
      @click="cfg.announcementLink ? navigateTo(cfg.announcementLink) : null"
    >
      {{ cfg.announcement }}
    </div>

    <div class="flex justify-between items-center">
      <!-- Left: Social Links -->
      <div class="flex items-center gap-3">
        <span class="text-gray-500 text-xs">Follow us:</span>

        <a
          v-for="social in activeSocials"
          :key="social.key"
          :href="social.url"
          :aria-label="social.label"
          target="_blank"
          rel="noopener"
          class="w-[30px] h-[30px] rounded-full flex items-center justify-center transition-all hover:scale-110"
          :style="{ background: social.color + '18', border: `1px solid ${social.color}33` }"
        >
          <span class="text-sm" :style="{ color: social.color }">{{ social.emoji }}</span>
        </a>
      </div>

      <!-- Right: Nav Links + Currency -->
      <div class="flex items-center gap-4">
        <template v-for="link in enabledNavLinks" :key="link.label">
          <NuxtLink
            :to="link.href"
            class="text-xs font-medium text-gray-600 hover:text-primary transition-colors"
          >
            {{ link.label }}
          </NuxtLink>
        </template>

        <div class="h-4 w-px bg-gray-300"></div>

        <div class="flex items-center gap-1">
          <span class="material-symbols-outlined text-sm text-gray-500">language</span>
          <select
            v-model="currency"
            class="bg-transparent border-none outline-none cursor-pointer font-bold uppercase text-xs focus:ring-0 p-0 text-gray-600"
          >
            <option value="INR">₹ INR</option>
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
            <option value="GBP">£ GBP</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { currency, setCurrency } = useCurrency()
const { config } = useSiteConfig()
const cfg = computed(() => config.value.topbar || {})

// Social links with emoji icons (no SVG, no external deps)
const socialMap: Record<string, { emoji: string; color: string; label: string }> = {
  whatsapp:  { emoji: '💬', color: '#25d366', label: 'WhatsApp' },
  instagram: { emoji: '📸', color: '#e1306c', label: 'Instagram' },
  youtube:   { emoji: '▶️', color: '#ff0000', label: 'YouTube' },
  telegram:  { emoji: '✈️', color: '#0088cc', label: 'Telegram' },
  facebook:  { emoji: '👤', color: '#1877f2', label: 'Facebook' },
  twitter:   { emoji: '🐦', color: '#1da1f2', label: 'Twitter' },
}

const activeSocials = computed(() => {
  const links = cfg.value.socialLinks || {
    whatsapp: 'https://wa.me/1234567890',
    instagram: 'https://instagram.com/digikraft',
    youtube: 'https://youtube.com/@digikraft',
    telegram: 'https://t.me/digikraft',
  }
  return Object.entries(links)
    .filter(([, url]) => url)
    .map(([key, url]) => ({ key, url, ...(socialMap[key] || { emoji: '🔗', color: '#6366f1', label: key }) }))
})

// Dynamic nav links from admin appearance settings
const enabledNavLinks = computed(() => {
  const links = cfg.value.navLinks || [
    { label: 'Guides', href: '/blog?category=guides', enabled: true },
    { label: 'About', href: '/about', enabled: true },
    { label: 'Help', href: '/help', enabled: true },
    { label: 'FAQ', href: '/faq', enabled: true },
    { label: 'Ticket', href: '/ticket', enabled: true },
  ]
  return links.filter((l: any) => l.enabled !== false)
})

watch(currency, (val) => setCurrency(val))
</script>
