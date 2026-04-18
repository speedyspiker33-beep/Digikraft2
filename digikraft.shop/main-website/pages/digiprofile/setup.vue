<script setup lang="ts">
definePageMeta({ layout: 'default' })

useHead({ title: 'DigiProfile Setup – DigiKraft' })

const route = useRoute()
const username = computed(() => (route.query.username as string) || '')

// ── Step management ──────────────────────────────────────────────
const step = ref(1)
const TOTAL_STEPS = 5

// ── Step 1: Basic info ───────────────────────────────────────────
const basicInfo = reactive({
  displayName: '',
  bio: '',
  avatarUrl: '',
  category: 'creator',
})
const categories = [
  { value: 'creator', label: '🎨 Creator' },
  { value: 'freelancer', label: '💼 Freelancer' },
  { value: 'business', label: '🏪 Business' },
  { value: 'musician', label: '🎵 Musician' },
  { value: 'fitness', label: '💪 Fitness' },
  { value: 'educator', label: '📚 Educator' },
  { value: 'other', label: '✨ Other' },
]

// ── Step 2: Links ────────────────────────────────────────────────
interface LinkItem { title: string; url: string }
const links = ref<LinkItem[]>([{ title: '', url: '' }])
const MAX_FREE_LINKS = 5

function addLink() {
  if (links.value.length < MAX_FREE_LINKS) links.value.push({ title: '', url: '' })
}
function removeLink(i: number) {
  links.value.splice(i, 1)
}

// ── Step 3: Social links ─────────────────────────────────────────
const socials = reactive({
  instagram: '',
  twitter: '',
  youtube: '',
  linkedin: '',
  github: '',
  whatsapp: '',
})
const socialFields = [
  { key: 'instagram', label: 'Instagram', placeholder: 'username', icon: '📸', prefix: 'instagram.com/' },
  { key: 'twitter', label: 'Twitter / X', placeholder: 'username', icon: '🐦', prefix: 'x.com/' },
  { key: 'youtube', label: 'YouTube', placeholder: 'channel URL', icon: '▶️', prefix: '' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'username', icon: '💼', prefix: 'linkedin.com/in/' },
  { key: 'github', label: 'GitHub', placeholder: 'username', icon: '🐙', prefix: 'github.com/' },
  { key: 'whatsapp', label: 'WhatsApp', placeholder: '91XXXXXXXXXX', icon: '💬', prefix: 'wa.me/' },
] as const

// ── Step 4: Theme ────────────────────────────────────────────────
const selectedTheme = ref('midnight')
const themes = [
  {
    id: 'midnight',
    name: 'Midnight',
    bg: 'bg-gradient-to-br from-slate-950 to-indigo-950',
    card: 'bg-indigo-600',
    text: 'text-white',
    preview: 'from-slate-900 to-indigo-900',
  },
  {
    id: 'aurora',
    name: 'Aurora',
    bg: 'bg-gradient-to-br from-violet-950 to-pink-950',
    card: 'bg-gradient-to-r from-violet-500 to-pink-500',
    text: 'text-white',
    preview: 'from-violet-900 to-pink-900',
  },
  {
    id: 'forest',
    name: 'Forest',
    bg: 'bg-gradient-to-br from-emerald-950 to-teal-950',
    card: 'bg-emerald-500',
    text: 'text-white',
    preview: 'from-emerald-900 to-teal-900',
  },
  {
    id: 'solar',
    name: 'Solar',
    bg: 'bg-gradient-to-br from-amber-950 to-orange-950',
    card: 'bg-amber-500',
    text: 'text-white',
    preview: 'from-amber-900 to-orange-900',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    bg: 'bg-white',
    card: 'bg-gray-900',
    text: 'text-gray-900',
    preview: 'from-gray-100 to-gray-200',
  },
]
const activeTheme = computed(() => themes.find(t => t.id === selectedTheme.value) || themes[0])

// ── Submission ───────────────────────────────────────────────────
const submitting = ref(false)
const submitted = ref(false)
const profileUrl = computed(() => `https://digikraft.shop/u/${username.value}`)

async function submit() {
  submitting.value = true
  const payload = {
    username: username.value,
    ...basicInfo,
    links: links.value.filter(l => l.title && l.url),
    socials: Object.fromEntries(Object.entries(socials).filter(([, v]) => v)),
    theme: selectedTheme.value,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }

  // Save to localStorage as pending
  try {
    const existing = JSON.parse(localStorage.getItem('digiprofile_pending') || '[]')
    existing.push(payload)
    localStorage.setItem('digiprofile_pending', JSON.stringify(existing))
  } catch {}

  // Best-effort API call to public endpoint (no auth needed)
  try {
    await fetch('http://localhost:8080/api/v1/digiprofile/public', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {}

  submitting.value = false
  submitted.value = true
  step.value = 5
}

// ── Validation helpers ───────────────────────────────────────────
const step1Valid = computed(() => basicInfo.displayName.trim().length >= 2)
const step2Valid = computed(() => links.value.some(l => l.title && l.url))

function next() {
  if (step.value === 4) { submit(); return }
  if (step.value < TOTAL_STEPS - 1) step.value++
}
function back() {
  if (step.value > 1) step.value--
}

const stepLabels = ['Basic Info', 'Links', 'Socials', 'Theme', 'Done']
</script>

<template>
  <div class="min-h-screen bg-[#0a0a0f] text-white py-10 px-4">
    <div class="max-w-2xl mx-auto">

      <!-- Header -->
      <div class="text-center mb-8">
        <NuxtLink to="/digiprofile" class="text-indigo-400 text-sm hover:text-indigo-300 transition-colors">
          ← DigiProfile
        </NuxtLink>
        <h1 class="text-2xl font-bold mt-3">
          Setting up
          <span class="text-indigo-400">@{{ username || 'your profile' }}</span>
        </h1>
      </div>

      <!-- Progress bar -->
      <div v-if="step < 5" class="mb-8">
        <div class="flex items-center justify-between mb-2">
          <span
            v-for="(label, i) in stepLabels.slice(0, 4)"
            :key="label"
            :class="[
              'text-xs font-medium transition-colors',
              step === i + 1 ? 'text-indigo-400' : step > i + 1 ? 'text-emerald-400' : 'text-slate-600'
            ]"
          >
            {{ label }}
          </span>
        </div>
        <div class="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
            :style="{ width: `${((step - 1) / 4) * 100}%` }"
          />
        </div>
      </div>

      <!-- Card -->
      <div class="bg-white/[0.03] border border-white/[0.07] rounded-3xl p-6 sm:p-8">

        <!-- ── Step 1: Basic Info ── -->
        <div v-if="step === 1">
          <h2 class="text-lg font-semibold mb-6">Tell us about yourself</h2>
          <div class="space-y-5">
            <div>
              <label class="block text-sm text-slate-400 mb-1.5">Display Name <span class="text-red-400">*</span></label>
              <input
                v-model="basicInfo.displayName"
                type="text"
                placeholder="Your full name or brand name"
                class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500/60 transition-colors"
              />
            </div>
            <div>
              <label class="block text-sm text-slate-400 mb-1.5">Bio</label>
              <textarea
                v-model="basicInfo.bio"
                placeholder="A short description about you (max 160 chars)"
                maxlength="160"
                rows="3"
                class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500/60 transition-colors resize-none"
              />
              <p class="text-right text-xs text-slate-600 mt-1">{{ basicInfo.bio.length }}/160</p>
            </div>
            <div>
              <label class="block text-sm text-slate-400 mb-1.5">Avatar URL</label>
              <input
                v-model="basicInfo.avatarUrl"
                type="url"
                placeholder="https://example.com/your-photo.jpg"
                class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500/60 transition-colors"
              />
            </div>
            <div>
              <label class="block text-sm text-slate-400 mb-1.5">Category</label>
              <select
                v-model="basicInfo.category"
                class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/60 transition-colors appearance-none"
              >
                <option v-for="cat in categories" :key="cat.value" :value="cat.value" class="bg-slate-900">
                  {{ cat.label }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- ── Step 2: Links ── -->
        <div v-else-if="step === 2">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold">Add your links</h2>
            <span class="text-xs text-slate-500">{{ links.length }}/{{ MAX_FREE_LINKS }} (Free)</span>
          </div>
          <div class="space-y-3">
            <div
              v-for="(link, i) in links"
              :key="i"
              class="flex gap-2 items-start"
            >
              <div class="flex-1 space-y-2">
                <input
                  v-model="link.title"
                  type="text"
                  placeholder="Link title (e.g. My Portfolio)"
                  class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500/60 transition-colors"
                />
                <input
                  v-model="link.url"
                  type="url"
                  placeholder="https://..."
                  class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500/60 transition-colors"
                />
              </div>
              <button
                v-if="links.length > 1"
                @click="removeLink(i)"
                class="mt-1 text-slate-600 hover:text-red-400 transition-colors p-1"
              >
                ✕
              </button>
            </div>
          </div>
          <button
            v-if="links.length < MAX_FREE_LINKS"
            @click="addLink"
            class="mt-4 w-full border border-dashed border-white/10 hover:border-indigo-500/40 text-slate-500 hover:text-indigo-400 rounded-xl py-3 text-sm transition-colors"
          >
            + Add another link
          </button>
          <p v-else class="mt-3 text-xs text-amber-400/80 text-center">
            Free plan limit reached. Upgrade to Pro for unlimited links.
          </p>
        </div>

        <!-- ── Step 3: Socials ── -->
        <div v-else-if="step === 3">
          <h2 class="text-lg font-semibold mb-2">Social links</h2>
          <p class="text-sm text-slate-500 mb-6">All optional. Add what you have.</p>
          <div class="space-y-4">
            <div v-for="field in socialFields" :key="field.key">
              <label class="block text-sm text-slate-400 mb-1.5">
                {{ field.icon }} {{ field.label }}
              </label>
              <div class="flex items-center bg-white/5 border border-white/10 rounded-xl focus-within:border-indigo-500/60 transition-colors overflow-hidden">
                <span v-if="field.prefix" class="pl-3 pr-1 text-slate-600 text-xs whitespace-nowrap select-none">
                  {{ field.prefix }}
                </span>
                <input
                  v-model="(socials as any)[field.key]"
                  type="text"
                  :placeholder="field.placeholder"
                  class="flex-1 bg-transparent px-3 py-3 text-sm text-white placeholder-slate-600 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- ── Step 4: Theme ── -->
        <div v-else-if="step === 4">
          <h2 class="text-lg font-semibold mb-6">Choose your theme</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            <button
              v-for="theme in themes"
              :key="theme.id"
              @click="selectedTheme = theme.id"
              :class="[
                'relative rounded-2xl overflow-hidden border-2 transition-all',
                selectedTheme === theme.id ? 'border-indigo-500 scale-[1.02]' : 'border-white/5 hover:border-white/20'
              ]"
            >
              <div :class="`bg-gradient-to-br ${theme.preview} h-20 flex flex-col items-center justify-center gap-1.5 p-2`">
                <div class="w-6 h-6 rounded-full bg-white/20" />
                <div :class="`${theme.card} rounded-lg w-full h-2.5 opacity-90`" />
                <div :class="`${theme.card} rounded-lg w-3/4 h-2.5 opacity-60`" />
              </div>
              <div class="bg-black/40 py-1.5 text-xs font-medium text-center">{{ theme.name }}</div>
              <div v-if="selectedTheme === theme.id" class="absolute top-1.5 right-1.5 bg-indigo-500 rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                ✓
              </div>
            </button>
          </div>

          <!-- Live preview -->
          <div class="rounded-2xl overflow-hidden border border-white/10">
            <p class="text-xs text-slate-600 text-center py-2 bg-white/[0.02]">Live Preview</p>
            <div :class="`${activeTheme.bg} p-6 flex flex-col items-center`">
              <div class="w-14 h-14 rounded-full bg-white/20 mb-3 overflow-hidden">
                <img
                  v-if="basicInfo.avatarUrl"
                  :src="basicInfo.avatarUrl"
                  class="w-full h-full object-cover"
                  @error="(e) => (e.target as HTMLImageElement).style.display = 'none'"
                />
              </div>
              <p :class="`font-bold text-sm mb-0.5 ${activeTheme.text}`">
                {{ basicInfo.displayName || 'Your Name' }}
              </p>
              <p :class="`text-xs mb-4 opacity-60 ${activeTheme.text}`">@{{ username }}</p>
              <div class="w-full max-w-xs space-y-2">
                <div
                  v-for="link in links.filter(l => l.title).slice(0, 3)"
                  :key="link.title"
                  :class="`${activeTheme.card} rounded-xl px-4 py-2 text-xs font-medium text-center text-white`"
                >
                  {{ link.title }}
                </div>
                <div v-if="!links.some(l => l.title)" :class="`${activeTheme.card} rounded-xl px-4 py-2 text-xs font-medium text-center text-white opacity-40`">
                  Your links appear here
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Step 5: Done ── -->
        <div v-else-if="step === 5" class="text-center py-4">
          <div class="text-5xl mb-4">🎉</div>
          <h2 class="text-2xl font-bold mb-2">You're all set!</h2>
          <p class="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
            Your profile request has been submitted. Admin will review and activate it within 24 hours.
          </p>

          <div class="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-4 mb-6 inline-block">
            <p class="text-xs text-slate-500 mb-1">Your profile URL</p>
            <p class="text-indigo-300 font-mono text-sm font-semibold">{{ profileUrl }}</p>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              @click="navigator.clipboard?.writeText(profileUrl)"
              class="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-colors"
            >
              📋 Copy URL
            </button>
            <NuxtLink
              to="/account"
              class="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition-colors"
            >
              Go to Account →
            </NuxtLink>
          </div>

          <p class="mt-6 text-xs text-slate-600">
            Profile saved locally. You'll receive a notification once it's live.
          </p>
        </div>

      </div>

      <!-- Navigation buttons -->
      <div v-if="step < 5" class="flex items-center justify-between mt-6">
        <button
          v-if="step > 1"
          @click="back"
          class="px-5 py-2.5 text-sm text-slate-400 hover:text-white border border-white/10 hover:border-white/20 rounded-xl transition-colors"
        >
          ← Back
        </button>
        <div v-else />

        <button
          @click="next"
          :disabled="(step === 1 && !step1Valid) || (step === 2 && !step2Valid) || submitting"
          class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2"
        >
          <svg v-if="submitting" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <span>{{ step === 4 ? (submitting ? 'Submitting…' : 'Submit Profile') : 'Continue →' }}</span>
        </button>
      </div>

    </div>
  </div>
</template>
