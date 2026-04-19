<script setup lang="ts">
definePageMeta({ layout: 'default' })

useHead({
  title: 'DigiProfile – Your Link in Bio, Supercharged',
  meta: [
    { name: 'description', content: 'Create your free DigiProfile link-in-bio page with custom themes, Razorpay payments, analytics, and more.' }
  ]
})

const username = ref('')
const checking = ref(false)
const availability = ref<'available' | 'taken' | 'error' | null>(null)
const errorMsg = ref('')

const demoProfiles = [
  {
    name: 'Priya Sharma',
    handle: 'priyacreates',
    bio: 'Digital artist & content creator ✨',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
    theme: 'gradient',
    links: ['Portfolio', 'Instagram', 'Buy Presets'],
    accent: 'from-violet-500 to-pink-500',
    bg: 'bg-gradient-to-br from-violet-950 to-pink-950',
  },
  {
    name: 'Rahul Dev',
    handle: 'rahulbuilds',
    bio: 'Full-stack dev. Building in public 🚀',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rahul',
    theme: 'dark',
    links: ['GitHub', 'Newsletter', 'Hire Me'],
    accent: 'from-cyan-500 to-blue-500',
    bg: 'bg-gradient-to-br from-slate-950 to-cyan-950',
  },
  {
    name: 'Meera Nair',
    handle: 'meerafitness',
    bio: 'Certified trainer. Wellness coach 💪',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=meera',
    theme: 'minimal',
    links: ['Book Session', 'YouTube', 'Free Guide'],
    accent: 'from-emerald-500 to-teal-500',
    bg: 'bg-gradient-to-br from-emerald-950 to-teal-950',
  },
]

const features = [
  { icon: '🎨', title: 'Custom Themes', desc: '5 premium themes with live preview. Make it yours.' },
  { icon: '💳', title: 'Razorpay Payments', desc: 'Accept payments directly from your profile. No middleman.' },
  { icon: '📸', title: 'Instagram Feed', desc: 'Auto-sync your latest posts to your profile page.' },
  { icon: '✅', title: 'KYC Verified', desc: 'Build trust with a verified badge on your profile.' },
  { icon: '📊', title: 'Analytics', desc: 'See who clicks what. Track your audience in real time.' },
  { icon: '🔗', title: 'Unlimited Links', desc: 'Add as many links as you need on the Pro plan.' },
]

const pricing = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    features: ['Up to 3 links', 'Basic themes', 'Public profile', 'digikraft.shop/u/username'],
    cta: 'Get Started Free',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '₹199',
    period: '/month',
    features: ['Unlimited links', 'All 5 themes', 'Razorpay payments', 'Instagram feed', 'Analytics dashboard', 'KYC verified badge', 'Custom domain (soon)'],
    cta: 'Go Pro',
    highlight: true,
  },
]

const sanitizeUsername = (val: string) =>
  val.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 30)

function onUsernameInput(e: Event) {
  username.value = sanitizeUsername((e.target as HTMLInputElement).value)
  availability.value = null
}

async function checkAndClaim() {
  const u = username.value.trim()
  if (!u || u.length < 3) {
    errorMsg.value = 'Username must be at least 3 characters.'
    return
  }
  errorMsg.value = ''
  checking.value = true
  availability.value = null
  try {
    const res = await fetch(`https://digikraft2-production.up.railway.app/api/v1/digiprofile/check/${u}`)
    if (res.ok) {
      const data = await res.json()
      if (data.available === false) {
        availability.value = 'taken'
      } else {
        availability.value = 'available'
        await navigateTo(`/digiprofile/setup?username=${u}`)
      }
    } else {
      // If API is down, still allow proceeding (offline-first)
      availability.value = 'available'
      await navigateTo(`/digiprofile/setup?username=${u}`)
    }
  } catch {
    // API unreachable – proceed anyway
    availability.value = 'available'
    await navigateTo(`/digiprofile/setup?username=${u}`)
  } finally {
    checking.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#0a0a0f] text-white">

    <!-- Hero -->
    <section class="relative overflow-hidden pt-24 pb-20 px-4">
      <!-- Background glow -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]" />
      </div>

      <div class="relative max-w-3xl mx-auto text-center">
        <span class="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          ✨ Now in Beta – Free to join
        </span>

        <h1 class="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight mb-5">
          Your Link in Bio,<br>
          <span class="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Supercharged
          </span>
        </h1>

        <p class="text-lg text-slate-400 max-w-xl mx-auto mb-10">
          One beautiful page for all your links, products, and payments.
          Built for Indian creators, freelancers, and businesses.
        </p>

        <!-- Username claim form -->
        <div class="max-w-md mx-auto">
          <div class="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1.5 focus-within:border-indigo-500/60 transition-colors">
            <span class="pl-3 pr-1 text-slate-500 text-sm whitespace-nowrap select-none">digikraft.shop/u/</span>
            <input
              :value="username"
              @input="onUsernameInput"
              @keydown.enter="checkAndClaim"
              type="text"
              placeholder="yourname"
              maxlength="30"
              class="flex-1 bg-transparent outline-none text-white placeholder-slate-600 text-sm py-2 min-w-0"
            />
            <button
              @click="checkAndClaim"
              :disabled="checking || username.length < 3"
              class="shrink-0 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              <span v-if="checking" class="flex items-center gap-2">
                <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Checking…
              </span>
              <span v-else>Claim →</span>
            </button>
          </div>

          <p v-if="errorMsg" class="mt-2 text-red-400 text-sm">{{ errorMsg }}</p>
          <p v-if="availability === 'taken'" class="mt-2 text-amber-400 text-sm">
            @{{ username }} is taken. Try another one.
          </p>
          <p v-if="availability === 'available'" class="mt-2 text-emerald-400 text-sm">
            ✓ @{{ username }} is available!
          </p>
        </div>

        <p class="mt-4 text-slate-600 text-xs">No credit card required. Free forever plan available.</p>
      </div>
    </section>

    <!-- Demo Profile Cards -->
    <section class="py-16 px-4">
      <div class="max-w-5xl mx-auto">
        <p class="text-center text-slate-500 text-sm uppercase tracking-widest mb-10">See it in action</p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div
            v-for="profile in demoProfiles"
            :key="profile.handle"
            :class="[profile.bg, 'rounded-3xl p-6 border border-white/5 hover:border-white/10 transition-all hover:-translate-y-1 duration-300']"
          >
            <div class="flex flex-col items-center text-center">
              <img :src="profile.avatar" alt="" class="w-16 h-16 rounded-full bg-white/10 mb-3" />
              <h3 class="font-bold text-white">{{ profile.name }}</h3>
              <p class="text-xs text-white/50 mb-1">@{{ profile.handle }}</p>
              <p class="text-sm text-white/70 mb-5">{{ profile.bio }}</p>
              <div class="w-full space-y-2">
                <div
                  v-for="link in profile.links"
                  :key="link"
                  :class="`bg-gradient-to-r ${profile.accent} p-px rounded-xl`"
                >
                  <div class="bg-black/40 rounded-xl px-4 py-2 text-sm font-medium text-white/90 hover:bg-black/20 transition-colors cursor-pointer">
                    {{ link }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="py-16 px-4 bg-white/[0.02]">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold mb-3">Everything you need</h2>
          <p class="text-slate-400">Built for the Indian creator economy.</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div
            v-for="f in features"
            :key="f.title"
            class="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-indigo-500/30 transition-colors"
          >
            <div class="text-3xl mb-3">{{ f.icon }}</div>
            <h3 class="font-semibold text-white mb-1">{{ f.title }}</h3>
            <p class="text-sm text-slate-400">{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing -->
    <section class="py-20 px-4">
      <div class="max-w-3xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold mb-3">Simple pricing</h2>
          <p class="text-slate-400">Start free. Upgrade when you're ready.</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div
            v-for="plan in pricing"
            :key="plan.name"
            :class="[
              'rounded-3xl p-8 border transition-all',
              plan.highlight
                ? 'bg-indigo-600/10 border-indigo-500/40 ring-1 ring-indigo-500/20'
                : 'bg-white/[0.03] border-white/[0.06]'
            ]"
          >
            <div v-if="plan.highlight" class="inline-block bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
              MOST POPULAR
            </div>
            <h3 class="text-xl font-bold mb-1">{{ plan.name }}</h3>
            <div class="flex items-baseline gap-1 mb-6">
              <span class="text-4xl font-extrabold">{{ plan.price }}</span>
              <span class="text-slate-400 text-sm">{{ plan.period }}</span>
            </div>
            <ul class="space-y-3 mb-8">
              <li v-for="feat in plan.features" :key="feat" class="flex items-center gap-2 text-sm text-slate-300">
                <span class="text-indigo-400">✓</span> {{ feat }}
              </li>
            </ul>
            <button
              @click="username ? checkAndClaim() : ($el.closest('section')?.previousElementSibling?.previousElementSibling?.querySelector('input') as HTMLInputElement)?.focus()"
              :class="[
                'w-full py-3 rounded-xl font-semibold text-sm transition-colors',
                plan.highlight
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
              ]"
            >
              {{ plan.cta }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="py-20 px-4 text-center">
      <div class="max-w-xl mx-auto">
        <h2 class="text-3xl font-bold mb-4">Ready to claim your profile?</h2>
        <p class="text-slate-400 mb-8">Join thousands of creators already on DigiProfile.</p>
        <div class="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1.5 focus-within:border-indigo-500/60 transition-colors max-w-sm mx-auto">
          <span class="pl-3 pr-1 text-slate-500 text-sm whitespace-nowrap select-none">digikraft.shop/u/</span>
          <input
            :value="username"
            @input="onUsernameInput"
            @keydown.enter="checkAndClaim"
            type="text"
            placeholder="yourname"
            maxlength="30"
            class="flex-1 bg-transparent outline-none text-white placeholder-slate-600 text-sm py-2 min-w-0"
          />
          <button
            @click="checkAndClaim"
            :disabled="checking || username.length < 3"
            class="shrink-0 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            Claim →
          </button>
        </div>
      </div>
    </section>

  </div>
</template>
