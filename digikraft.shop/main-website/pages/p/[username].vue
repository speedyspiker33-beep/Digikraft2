<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

definePageMeta({ layout: false })

const route = useRoute()
const username = route.params.username as string

// ── TYPES ─────────────────────────────────────────────────────────────────────
interface ProfileLink {
  title: string
  url: string
  icon?: string
  enabled?: boolean
  track_clicks?: boolean
  clicks?: number
}

interface DigiProfile {
  id: string
  username: string
  display_name?: string
  bio?: string
  avatar?: string
  cover_image?: string
  category?: string
  theme_color?: string
  theme_style?: 'minimal' | 'gradient' | 'dark' | 'neon' | 'glass'
  links?: ProfileLink[]
  products?: any[]
  social?: Record<string, string>
  payment_enabled?: boolean
  key_id?: string
  upi_id?: string
  accept_donations?: boolean
  donation_amounts?: number[]
  instagram_username?: string
  meta_pixel_id?: string
  seo_title?: string
  seo_desc?: string
  total_views?: number
  total_clicks?: number
}

// ── STATE ─────────────────────────────────────────────────────────────────────
const profile = ref<DigiProfile | null>(null)
const loading = ref(true)
const notFound = ref(false)
const showDonationModal = ref(false)
const donationAmount = ref(0)
const customAmount = ref('')
const donationLoading = ref(false)
const donationSuccess = ref(false)
const igPosts = ref<any[]>([])

const API = 'http://localhost:8080/api/v1'

// ── FETCH PROFILE ─────────────────────────────────────────────────────────────
onMounted(async () => {
  try {
    const res = await fetch(`${API}/digiprofile/p/${username}`)
    if (!res.ok) { notFound.value = true; loading.value = false; return }
    const data = await res.json()
    profile.value = data.data || data
    loading.value = false
    // Track view
    fetch(`${API}/digiprofile/p/${username}/view`, { method: 'POST' }).catch(() => {})
    // Meta pixel
    if (profile.value?.meta_pixel_id) injectMetaPixel(profile.value.meta_pixel_id)
  } catch {
    notFound.value = true
    loading.value = false
  }
})

// ── SEO ───────────────────────────────────────────────────────────────────────
useHead(computed(() => ({
  title: profile.value?.seo_title || profile.value?.display_name || username,
  meta: [
    { name: 'description', content: profile.value?.seo_desc || profile.value?.bio || '' },
    { property: 'og:title', content: profile.value?.seo_title || profile.value?.display_name || username },
    { property: 'og:description', content: profile.value?.seo_desc || profile.value?.bio || '' },
    { property: 'og:image', content: profile.value?.avatar || '' },
    { property: 'og:url', content: `http://localhost:3001/p/${username}` },
    { name: 'twitter:card', content: 'summary' },
  ]
})))

// ── THEME ─────────────────────────────────────────────────────────────────────
const themeClass = computed(() => `theme-${profile.value?.theme_style || 'minimal'}`)
const accentColor = computed(() => profile.value?.theme_color || '#6366f1')

const themeStyles = computed(() => {
  const c = accentColor.value
  const style = profile.value?.theme_style || 'minimal'
  const base: Record<string, string> = {
    '--accent': c,
    '--accent-light': c + '22',
    '--accent-mid': c + '44',
  }
  if (style === 'dark') return { ...base, '--bg': '#0f0f1a', '--bg2': '#1a1a2e', '--text': '#ffffff', '--text2': '#a0a0b0', '--card-bg': '#1a1a2e', '--card-border': '#2a2a3e' }
  if (style === 'neon') return { ...base, '--bg': '#0d0d0d', '--bg2': '#111', '--text': '#ffffff', '--text2': '#888', '--card-bg': '#111', '--card-border': c + '44' }
  if (style === 'glass') return { ...base, '--bg': 'linear-gradient(135deg,#667eea,#764ba2)', '--bg2': 'rgba(255,255,255,.05)', '--text': '#ffffff', '--text2': 'rgba(255,255,255,.7)', '--card-bg': 'rgba(255,255,255,.1)', '--card-border': 'rgba(255,255,255,.2)' }
  if (style === 'gradient') return { ...base, '--bg': `linear-gradient(135deg,${c}11,${c}05,#fff)`, '--bg2': '#f8f8ff', '--text': '#111', '--text2': '#555', '--card-bg': '#ffffff', '--card-border': '#e5e7eb' }
  // minimal
  return { ...base, '--bg': '#f9fafb', '--bg2': '#ffffff', '--text': '#111827', '--text2': '#6b7280', '--card-bg': '#ffffff', '--card-border': '#e5e7eb' }
})

// ── SOCIAL ICONS ──────────────────────────────────────────────────────────────
const socialConfig: Record<string, { icon: string; color: string; label: string }> = {
  instagram: { icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z', color: '#e1306c', label: 'Instagram' },
  youtube: { icon: 'M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z', color: '#ff0000', label: 'YouTube' },
  twitter: { icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z', color: '#000000', label: 'X / Twitter' },
  linkedin: { icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z', color: '#0077b5', label: 'LinkedIn' },
  whatsapp: { icon: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z', color: '#25d366', label: 'WhatsApp' },
  telegram: { icon: 'M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z', color: '#0088cc', label: 'Telegram' },
  facebook: { icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z', color: '#1877f2', label: 'Facebook' },
  tiktok: { icon: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z', color: '#000000', label: 'TikTok' },
}

const activeSocials = computed(() => {
  if (!profile.value?.social) return []
  return Object.entries(profile.value.social)
    .filter(([, v]) => v)
    .map(([k, v]) => ({ key: k, url: v, ...socialConfig[k] }))
    .filter(s => s.icon)
})

// ── CLICK TRACKING ────────────────────────────────────────────────────────────
async function trackClick(linkUrl: string, linkTitle: string) {
  try {
    await fetch(`${API}/digiprofile/p/${username}/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: linkUrl, title: linkTitle })
    })
  } catch {}
}

function handleLinkClick(link: ProfileLink) {
  if (link.track_clicks !== false) trackClick(link.url, link.title)
  window.open(link.url, '_blank', 'noopener')
}

// ── DONATION ──────────────────────────────────────────────────────────────────
function openDonation() {
  const amounts = profile.value?.donation_amounts || [49, 99, 199, 499]
  donationAmount.value = amounts[0]
  showDonationModal.value = true
}

async function processDonation() {
  const amount = customAmount.value ? parseInt(customAmount.value) : donationAmount.value
  if (!amount || amount < 1) return
  if (!profile.value?.key_id) { alert('Payment not configured for this profile.'); return }

  donationLoading.value = true
  try {
    const Razorpay = (window as any).Razorpay
    if (!Razorpay) {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      document.head.appendChild(script)
      await new Promise(r => { script.onload = r })
    }
    const options = {
      key: profile.value.key_id,
      amount: amount * 100,
      currency: 'INR',
      name: profile.value.display_name || profile.value.username,
      description: `Support ${profile.value.display_name || profile.value.username}`,
      image: profile.value.avatar,
      handler: () => {
        donationSuccess.value = true
        donationLoading.value = false
        setTimeout(() => { showDonationModal.value = false; donationSuccess.value = false }, 3000)
      },
      prefill: {},
      theme: { color: accentColor.value },
    }
    const rzp = new (window as any).Razorpay(options)
    rzp.open()
  } catch (e) {
    alert('Payment failed. Please try again.')
  }
  donationLoading.value = false
}

// ── SHARE ─────────────────────────────────────────────────────────────────────
async function shareProfile() {
  const url = `http://localhost:3001/p/${username}`
  if (navigator.share) {
    try {
      await navigator.share({ title: profile.value?.display_name || username, url })
    } catch {}
  } else {
    await navigator.clipboard.writeText(url)
    alert('Link copied!')
  }
}

// ── META PIXEL ────────────────────────────────────────────────────────────────
function injectMetaPixel(pixelId: string) {
  const script = document.createElement('script')
  script.innerHTML = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`
  document.head.appendChild(script)
}

// ── LINK ICON ─────────────────────────────────────────────────────────────────
function getLinkIcon(icon?: string): string {
  if (!icon) return 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1'
  const iconMap: Record<string, string> = {
    'fa-youtube': 'M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z',
    'fa-instagram': 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
  }
  return iconMap[icon] || 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1'
}
</script>

<template>
  <!-- LOADING -->
  <div v-if="loading" class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-gray-500 text-sm">Loading profile...</p>
    </div>
  </div>

  <!-- 404 -->
  <div v-else-if="notFound" class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center px-6">
      <div class="text-8xl mb-6">🔍</div>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Profile not found</h1>
      <p class="text-gray-500 mb-8">@{{ username }} doesn't exist or has been removed.</p>
      <a href="/" class="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
        Go to DigiKraft
      </a>
    </div>
  </div>

  <!-- PROFILE PAGE -->
  <div v-else-if="profile" :class="themeClass" :style="themeStyles as any" class="min-h-screen profile-page">

    <!-- COVER IMAGE -->
    <div class="relative h-48 md:h-64 overflow-hidden" :style="{ background: profile.cover_image ? 'transparent' : `linear-gradient(135deg, ${accentColor}33, ${accentColor}11)` }">
      <img v-if="profile.cover_image" :src="profile.cover_image" :alt="profile.display_name" class="w-full h-full object-cover" />
      <div v-else class="w-full h-full" :style="{ background: `linear-gradient(135deg, ${accentColor}44, ${accentColor}11)` }"></div>
      <!-- Share button -->
      <button @click="shareProfile" class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
      </button>
    </div>

    <!-- MAIN CONTENT -->
    <div class="max-w-lg mx-auto px-4 pb-16">

      <!-- AVATAR + HEADER -->
      <div class="text-center -mt-16 mb-6 relative z-10">
        <div class="inline-block relative">
          <img
            :src="profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.display_name || profile.username)}&background=6366f1&color=fff&size=128`"
            :alt="profile.display_name"
            class="w-28 h-28 rounded-full object-cover border-4 shadow-xl mx-auto"
            :style="{ borderColor: accentColor }"
          />
          <div v-if="profile.category" class="absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-semibold text-white shadow-md whitespace-nowrap" :style="{ background: accentColor }">
            {{ profile.category }}
          </div>
        </div>
        <h1 class="text-2xl font-bold mt-4 mb-1" style="color: var(--text)">{{ profile.display_name || profile.username }}</h1>
        <p class="text-sm mb-3" style="color: var(--text2)">@{{ profile.username }}</p>
        <p v-if="profile.bio" class="text-sm leading-relaxed max-w-sm mx-auto" style="color: var(--text2)">{{ profile.bio }}</p>
      </div>

      <!-- SOCIAL LINKS -->
      <div v-if="activeSocials.length" class="flex justify-center gap-3 mb-8 flex-wrap">
        <a
          v-for="s in activeSocials"
          :key="s.key"
          :href="s.url"
          target="_blank"
          rel="noopener"
          :title="s.label"
          class="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg"
          :style="{ background: s.color + '18', border: `1.5px solid ${s.color}33` }"
          @click="trackClick(s.url, s.label)"
        >
          <svg class="w-5 h-5" :style="{ fill: s.color }" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path :d="s.icon" />
          </svg>
        </a>
      </div>

      <!-- LINKS -->
      <div v-if="profile.links?.filter(l => l.enabled !== false).length" class="space-y-3 mb-8">
        <button
          v-for="link in profile.links?.filter(l => l.enabled !== false)"
          :key="link.url"
          @click="handleLinkClick(link)"
          class="w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-semibold text-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] group"
          :style="{ background: 'var(--card-bg)', border: '1.5px solid var(--card-border)', color: 'var(--text)' }"
        >
          <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors" :style="{ background: accentColor + '18' }">
            <svg class="w-5 h-5" :style="{ stroke: accentColor }" fill="none" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" :d="getLinkIcon(link.icon)" />
            </svg>
          </div>
          <span class="flex-1 text-left">{{ link.title }}</span>
          <svg class="w-4 h-4 opacity-40 group-hover:opacity-70 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>

      <!-- PRODUCTS -->
      <div v-if="profile.products?.length" class="mb-8">
        <h2 class="text-base font-bold mb-4" style="color: var(--text)">Products</h2>
        <div class="grid grid-cols-2 gap-3">
          <a
            v-for="prod in profile.products"
            :key="typeof prod === 'object' ? prod.id : prod"
            :href="`/product/${typeof prod === 'object' ? (prod.slug || prod.id) : prod}`"
            class="rounded-2xl overflow-hidden transition-all hover:scale-[1.02] hover:shadow-lg"
            :style="{ background: 'var(--card-bg)', border: '1.5px solid var(--card-border)' }"
          >
            <div class="aspect-video bg-gray-100 overflow-hidden" :style="{ background: accentColor + '11' }">
              <img v-if="typeof prod === 'object' && prod.image" :src="prod.image" :alt="prod.name" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center text-3xl">📦</div>
            </div>
            <div class="p-3">
              <div class="text-sm font-semibold truncate" style="color: var(--text)">{{ typeof prod === 'object' ? prod.name : prod }}</div>
              <div v-if="typeof prod === 'object' && prod.price" class="text-xs mt-1 font-bold" :style="{ color: accentColor }">₹{{ prod.price }}</div>
            </div>
          </a>
        </div>
      </div>

      <!-- INSTAGRAM FEED PREVIEW -->
      <div v-if="profile.instagram_username" class="mb-8">
        <div class="flex items-center gap-2 mb-4">
          <svg class="w-5 h-5" style="fill:#e1306c" viewBox="0 0 24 24"><path :d="socialConfig.instagram.icon"/></svg>
          <h2 class="text-base font-bold" style="color: var(--text)">@{{ profile.instagram_username }}</h2>
        </div>
        <a :href="`https://instagram.com/${profile.instagram_username}`" target="_blank" rel="noopener"
          class="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-semibold transition-all hover:opacity-80"
          :style="{ background: '#e1306c18', color: '#e1306c', border: '1.5px solid #e1306c33' }">
          <svg class="w-4 h-4" style="fill:#e1306c" viewBox="0 0 24 24"><path :d="socialConfig.instagram.icon"/></svg>
          View on Instagram
        </a>
      </div>

      <!-- DONATION SECTION -->
      <div v-if="profile.accept_donations" class="mb-8">
        <div class="rounded-2xl p-6 text-center" :style="{ background: accentColor + '0d', border: `1.5px solid ${accentColor}33` }">
          <div class="text-3xl mb-3">💝</div>
          <h2 class="text-lg font-bold mb-1" style="color: var(--text)">Support {{ profile.display_name || profile.username }}</h2>
          <p class="text-sm mb-4" style="color: var(--text2)">If you enjoy my content, consider buying me a coffee!</p>
          <button @click="openDonation" class="px-8 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 hover:shadow-lg active:scale-95" :style="{ background: accentColor }">
            💝 Support Me
          </button>
        </div>
      </div>

    </div>

    <!-- FOOTER -->
    <div class="text-center py-6 text-xs" style="color: var(--text2)">
      <a href="/" class="hover:opacity-80 transition-opacity inline-flex items-center gap-1">
        <span>Powered by</span>
        <span class="font-bold" :style="{ color: accentColor }">DigiKraft</span>
      </a>
    </div>

    <!-- DONATION MODAL -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showDonationModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" @click.self="showDonationModal = false">
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showDonationModal = false"></div>
          <div class="relative w-full max-w-sm rounded-3xl p-6 shadow-2xl z-10 bg-white dark:bg-gray-900">
            <div v-if="donationSuccess" class="text-center py-8">
              <div class="text-6xl mb-4">🎉</div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Thank you!</h3>
              <p class="text-gray-500">Your support means the world.</p>
            </div>
            <div v-else>
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Support {{ profile.display_name || profile.username }}</h3>
                <button @click="showDonationModal = false" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
              <div class="grid grid-cols-2 gap-3 mb-4">
                <button
                  v-for="amt in (profile.donation_amounts || [49, 99, 199, 499])"
                  :key="amt"
                  @click="donationAmount = amt; customAmount = ''"
                  class="py-3 rounded-xl font-bold text-sm transition-all"
                  :class="donationAmount === amt && !customAmount ? 'text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                  :style="donationAmount === amt && !customAmount ? { background: accentColor } : {}"
                >₹{{ amt }}</button>
              </div>
              <div class="mb-6">
                <input
                  v-model="customAmount"
                  type="number"
                  placeholder="Custom amount (₹)"
                  class="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 transition-all"
                  :style="{ '--tw-ring-color': accentColor }"
                  @focus="donationAmount = 0"
                />
              </div>
              <button
                @click="processDonation"
                :disabled="donationLoading"
                class="w-full py-4 rounded-xl font-bold text-white text-base transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
                :style="{ background: accentColor }"
              >
                <span v-if="donationLoading" class="inline-flex items-center gap-2">
                  <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Processing...
                </span>
                <span v-else>💝 Support ₹{{ customAmount || donationAmount }}</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<style scoped>
.profile-page {
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  transition: background 0.3s, color 0.3s;
}

/* Theme: neon glow on links */
.theme-neon .link-card:hover {
  box-shadow: 0 0 20px var(--accent);
}

/* Theme: glass blur */
.theme-glass {
  background: linear-gradient(135deg, #667eea, #764ba2) !important;
}

/* Animations */
.modal-enter-active, .modal-leave-active { transition: opacity 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

/* Smooth link hover */
button, a { transition: all 0.2s ease; }

/* Mobile-first responsive */
@media (max-width: 640px) {
  .profile-page { padding-bottom: env(safe-area-inset-bottom); }
}
</style>
