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
      <div class="flex items-center gap-0">
        <span class="text-gray-400 text-xs font-medium mr-2">Follow us:</span>

        <!-- Instagram -->
        <a v-if="socials.instagram" :href="socials.instagram" target="_blank" rel="noopener" aria-label="Instagram" class="social-btn social-instagram">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="M3 8a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8Zm5-3a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H8Zm7.597 2.214a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2h-.01a1 1 0 0 1-1-1ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm-5 3a5 5 0 1 1 10 0 5 5 0 0 1-10 0Z" fill-rule="evenodd" fill="currentColor"/></svg>
        </a>

        <!-- WhatsApp -->
        <a v-if="socials.whatsapp" :href="socials.whatsapp" target="_blank" rel="noopener" aria-label="WhatsApp" class="social-btn social-whatsapp">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="M12 4a8 8 0 0 0-6.895 12.06l.569.718-.697 2.359 2.32-.648.379.243A8 8 0 1 0 12 4ZM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10a9.96 9.96 0 0 1-5.016-1.347l-4.948 1.382 1.426-4.829-.006-.007-.033-.055A9.958 9.958 0 0 1 2 12Z" fill-rule="evenodd" fill="currentColor"/><path d="M16.735 13.492c-.038-.018-1.497-.736-1.756-.83a1.008 1.008 0 0 0-.34-.075c-.196 0-.362.098-.49.291-.146.217-.587.732-.723.886-.018.02-.042.045-.057.045-.013 0-.239-.093-.307-.123-1.564-.68-2.751-2.313-2.914-2.589-.023-.04-.024-.057-.024-.057.005-.021.058-.074.085-.101.08-.079.166-.182.249-.283l.117-.14c.121-.14.175-.25.237-.375l.033-.066a.68.68 0 0 0-.02-.64c-.034-.069-.65-1.555-.715-1.711-.158-.377-.366-.552-.655-.552-.027 0 0 0-.112.005-.137.005-.883.104-1.213.311-.35.22-.94.924-.94 2.16 0 1.112.705 2.162 1.008 2.561l.041.06c1.161 1.695 2.608 2.951 4.074 3.537 1.412.564 2.081.63 2.461.63.16 0 .288-.013.4-.024l.072-.007c.488-.043 1.56-.599 1.804-1.276.192-.534.243-1.117.115-1.329-.088-.144-.239-.216-.43-.308Z" fill="currentColor"/></svg>
        </a>

        <!-- Twitter/X -->
        <a v-if="socials.twitter" :href="socials.twitter" target="_blank" rel="noopener" aria-label="Twitter" class="social-btn social-twitter">
          <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="M22 5.892a8.178 8.178 0 0 1-2.355.635 4.074 4.074 0 0 0 1.8-2.235 8.343 8.343 0 0 1-2.605.981A4.13 4.13 0 0 0 15.85 4a4.068 4.068 0 0 0-4.1 4.038c0 .31.035.618.105.919A11.705 11.705 0 0 1 3.4 4.734a4.006 4.006 0 0 0 1.268 5.392 4.165 4.165 0 0 1-1.859-.5v.05A4.057 4.057 0 0 0 6.1 13.635a4.192 4.192 0 0 1-1.856.07 4.108 4.108 0 0 0 3.831 2.807A8.36 8.36 0 0 1 2 18.184 11.732 11.732 0 0 0 8.291 20 11.502 11.502 0 0 0 19.964 8.5c0-.177 0-.349-.012-.523A8.143 8.143 0 0 0 22 5.892Z" fill-rule="evenodd"/></svg>
        </a>

        <!-- YouTube -->
        <a v-if="socials.youtube" :href="socials.youtube" target="_blank" rel="noopener" aria-label="YouTube" class="social-btn social-youtube">
          <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="M21.7 8.037a4.26 4.26 0 0 0-.789-1.964 2.84 2.84 0 0 0-1.984-.839c-2.767-.2-6.926-.2-6.926-.2s-4.157 0-6.928.2a2.836 2.836 0 0 0-1.983.839 4.225 4.225 0 0 0-.79 1.965 30.146 30.146 0 0 0-.2 3.206v1.5a30.12 30.12 0 0 0 .2 3.206c.094.712.364 1.39.784 1.972.604.536 1.38.837 2.187.848 1.583.151 6.731.2 6.731.2s4.161 0 6.928-.2a2.844 2.844 0 0 0 1.985-.84 4.27 4.27 0 0 0 .787-1.965 30.12 30.12 0 0 0 .2-3.206v-1.516a30.672 30.672 0 0 0-.202-3.206Zm-11.692 6.554v-5.62l5.4 2.819-5.4 2.801Z" fill-rule="evenodd"/></svg>
        </a>

        <!-- Telegram -->
        <a v-if="socials.telegram" :href="socials.telegram" target="_blank" rel="noopener" aria-label="Telegram" class="social-btn social-telegram">
          <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
        </a>

        <!-- Facebook -->
        <a v-if="socials.facebook" :href="socials.facebook" target="_blank" rel="noopener" aria-label="Facebook" class="social-btn social-facebook">
          <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z"/></svg>
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

const socials = computed(() => {
  return cfg.value.socialLinks || {
    instagram: 'https://instagram.com/digikraft',
    whatsapp: 'https://wa.me/1234567890',
    twitter: 'https://twitter.com/digikraft',
    youtube: 'https://youtube.com/@digikraft',
    telegram: 'https://t.me/digikraft',
    facebook: '',
  }
})

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

<style scoped>
.social-btn {
  cursor: pointer;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  position: relative;
  z-index: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 6px;
  transition: transform 0.1s;
  text-decoration: none;
  color: white;
}

.social-btn svg {
  width: 15px;
  height: 15px;
  z-index: 9;
  position: relative;
  color: white;
}

/* Individual platform gradients */
.social-instagram { background: linear-gradient(120deg, #833ab4, #fd1d1d, #fcb045); }
.social-whatsapp  { background: linear-gradient(120deg, #02ff2c, #008a12); }
.social-twitter   { background: rgb(0, 0, 0); }
.social-youtube   { background: rgb(255, 33, 33); }
.social-telegram  { background: rgb(69, 187, 255); }
.social-facebook  { background: rgb(24, 119, 242); }

.social-btn:active {
  transform: scale(0.85);
}

/* Dark overlay that shrinks on hover — your exact animation */
.social-btn::before {
  content: "";
  position: absolute;
  width: 34px;
  height: 34px;
  background-color: #212121;
  border-radius: 50%;
  z-index: -1;
  border: 0px solid rgba(255, 255, 255, 0.411);
  transition: 0.4s;
}

.social-btn:hover::before {
  width: 0px;
  height: 0px;
}
</style>
