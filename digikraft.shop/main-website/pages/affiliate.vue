<template>
  <div class="min-h-screen bg-gray-50">

    <!-- Hero -->
    <div class="bg-gradient-to-br from-primary via-purple-600 to-indigo-700 text-white py-20 px-6 lg:px-12">
      <div class="max-w-4xl mx-auto text-center">
        <div class="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold mb-6">
          <span class="material-symbols-outlined text-yellow-300">star</span>
          Earn up to ₹50,000/month
        </div>
        <h1 class="text-4xl lg:text-6xl font-black mb-6 leading-tight">
          Earn Money by Sharing<br>
          <span class="text-yellow-300">DigiKraft Products</span>
        </h1>
        <p class="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
          Join our affiliate program and earn <strong class="text-white">10% commission</strong> on every sale you refer. Share links, earn money — it's that simple.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            v-if="!authStore.isAuthenticated"
            @click="openAuthModal(false)"
            class="bg-white text-primary px-8 py-4 rounded-xl font-black text-lg hover:shadow-2xl hover:scale-105 transition-all"
          >
            Join Free — Start Earning
          </button>
          <button
            v-else-if="!affiliateProfile"
            @click="showApplyModal = true"
            class="bg-white text-primary px-8 py-4 rounded-xl font-black text-lg hover:shadow-2xl hover:scale-105 transition-all"
          >
            Apply Now — It's Free
          </button>
          <NuxtLink
            v-else
            to="/account?tab=affiliate"
            class="bg-white text-primary px-8 py-4 rounded-xl font-black text-lg hover:shadow-2xl hover:scale-105 transition-all"
          >
            Go to My Dashboard →
          </NuxtLink>
          <a href="#how-it-works" class="border-2 border-white/50 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all">
            How It Works
          </a>
        </div>
      </div>
    </div>

    <!-- Stats Bar -->
    <div class="bg-white border-b border-gray-100 py-8 px-6">
      <div class="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div>
          <div class="text-3xl font-black text-primary">10%</div>
          <div class="text-sm text-gray-500 mt-1">Commission Rate</div>
        </div>
        <div>
          <div class="text-3xl font-black text-primary">30 days</div>
          <div class="text-sm text-gray-500 mt-1">Cookie Duration</div>
        </div>
        <div>
          <div class="text-3xl font-black text-primary">₹500</div>
          <div class="text-sm text-gray-500 mt-1">Min. Payout</div>
        </div>
        <div>
          <div class="text-3xl font-black text-primary">Real-time</div>
          <div class="text-sm text-gray-500 mt-1">Tracking</div>
        </div>
      </div>
    </div>

    <!-- How It Works -->
    <div id="how-it-works" class="py-20 px-6 lg:px-12">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl font-black text-gray-900 text-center mb-4">How It Works</h2>
        <p class="text-gray-500 text-center mb-12">Three simple steps to start earning</p>
        <div class="grid md:grid-cols-3 gap-8">
          <div v-for="(step, i) in steps" :key="i" class="text-center">
            <div class="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span class="material-symbols-outlined text-primary text-3xl">{{ step.icon }}</span>
            </div>
            <div class="text-xs font-black text-primary uppercase tracking-widest mb-2">Step {{ i + 1 }}</div>
            <h3 class="text-lg font-black text-gray-900 mb-2">{{ step.title }}</h3>
            <p class="text-gray-500 text-sm">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Commission Calculator -->
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20 px-6 lg:px-12">
      <div class="max-w-2xl mx-auto text-center">
        <h2 class="text-3xl font-black mb-4">Earnings Calculator</h2>
        <p class="text-gray-400 mb-10">See how much you can earn</p>
        <div class="bg-white/10 backdrop-blur-md rounded-2xl p-8">
          <div class="mb-6">
            <label class="block text-sm font-bold text-gray-300 mb-2">Monthly Referrals</label>
            <input
              v-model.number="calcReferrals"
              type="range" min="1" max="200" step="1"
              class="w-full accent-primary"
            />
            <div class="text-2xl font-black text-primary mt-2">{{ calcReferrals }} sales/month</div>
          </div>
          <div class="mb-6">
            <label class="block text-sm font-bold text-gray-300 mb-2">Average Order Value</label>
            <input
              v-model.number="calcAvgOrder"
              type="range" min="299" max="9999" step="100"
              class="w-full accent-primary"
            />
            <div class="text-2xl font-black text-yellow-300 mt-2">₹{{ calcAvgOrder }} avg. order</div>
          </div>
          <div class="border-t border-white/20 pt-6 mt-6">
            <div class="text-gray-400 text-sm mb-2">Your estimated monthly earnings</div>
            <div class="text-5xl font-black text-green-400">₹{{ calcEarnings.toLocaleString('en-IN') }}</div>
            <div class="text-gray-400 text-sm mt-2">at 10% commission rate</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Terms Summary -->
    <div class="py-20 px-6 lg:px-12 bg-white">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl font-black text-gray-900 text-center mb-4">Program Terms</h2>
        <p class="text-gray-500 text-center mb-12">Everything you need to know</p>
        <div class="grid md:grid-cols-2 gap-6">
          <div v-for="term in terms" :key="term.heading" class="border border-gray-100 rounded-xl p-6 hover:border-primary/30 transition-all">
            <h3 class="font-black text-gray-900 mb-2 flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-lg">{{ term.icon }}</span>
              {{ term.heading }}
            </h3>
            <p class="text-gray-500 text-sm">{{ term.content }}</p>
          </div>
        </div>
        <div class="text-center mt-8">
          <a href="#" @click.prevent="showFullTerms = true" class="text-primary font-bold hover:underline text-sm">
            View Full Terms & Conditions →
          </a>
        </div>
      </div>
    </div>

    <!-- CTA -->
    <div class="bg-primary py-16 px-6 text-center text-white">
      <h2 class="text-3xl font-black mb-4">Ready to Start Earning?</h2>
      <p class="text-white/80 mb-8">Join hundreds of creators already earning with DigiKraft</p>
      <button
        v-if="!authStore.isAuthenticated"
        @click="openAuthModal(false)"
        class="bg-white text-primary px-10 py-4 rounded-xl font-black text-lg hover:shadow-2xl hover:scale-105 transition-all"
      >
        Create Free Account & Apply
      </button>
      <button
        v-else-if="!affiliateProfile"
        @click="showApplyModal = true"
        class="bg-white text-primary px-10 py-4 rounded-xl font-black text-lg hover:shadow-2xl hover:scale-105 transition-all"
      >
        Apply Now — Free
      </button>
      <NuxtLink v-else to="/account?tab=affiliate" class="bg-white text-primary px-10 py-4 rounded-xl font-black text-lg hover:shadow-2xl hover:scale-105 transition-all">
        Open My Dashboard →
      </NuxtLink>
    </div>

    <!-- Apply Modal -->
    <Teleport to="body">
      <Transition enter-active-class="transition ease-out duration-300" enter-from-class="opacity-0" enter-to-class="opacity-100">
        <div v-if="showApplyModal" class="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4" @click.self="showApplyModal = false">
          <div class="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-2xl font-black text-gray-900">Apply to Affiliate Program</h3>
              <button @click="showApplyModal = false" class="text-gray-400 hover:text-gray-600">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <div v-if="applySuccess" class="text-center py-8">
              <div class="size-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="material-symbols-outlined text-green-600 text-3xl">check_circle</span>
              </div>
              <h4 class="text-xl font-black text-gray-900 mb-2">Application Submitted!</h4>
              <p class="text-gray-500">We'll review your application and get back to you within 3-5 business days.</p>
              <button @click="showApplyModal = false" class="mt-6 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:opacity-90">
                Got it!
              </button>
            </div>

            <form v-else @submit.prevent="submitApplication" class="space-y-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Website / Blog (optional)</label>
                <input v-model="applyForm.website" type="url" placeholder="https://yourwebsite.com" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary outline-none transition-all" />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Social Media Profiles</label>
                <input v-model="applyForm.social_media" type="text" placeholder="Instagram, YouTube, Twitter handles..." class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary outline-none transition-all" />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">How will you promote DigiKraft? *</label>
                <select v-model="applyForm.promotion_method" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary outline-none transition-all">
                  <option value="">Select method...</option>
                  <option value="social_media">Social Media (Instagram, YouTube, etc.)</option>
                  <option value="blog">Blog / Website</option>
                  <option value="email">Email Newsletter</option>
                  <option value="community">Online Communities / Forums</option>
                  <option value="word_of_mouth">Word of Mouth</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Additional Notes</label>
                <textarea v-model="applyForm.notes" rows="3" placeholder="Tell us about your audience..." class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary outline-none transition-all resize-none"></textarea>
              </div>
              <div class="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <input v-model="applyForm.agreed" type="checkbox" id="terms-agree" required class="mt-1 w-4 h-4 text-primary" />
                <label for="terms-agree" class="text-sm text-gray-600 cursor-pointer">
                  I agree to the <a href="#" @click.prevent="showFullTerms = true" class="text-primary font-bold hover:underline">Affiliate Terms & Conditions</a> and confirm I will not engage in self-referrals or fraudulent activity.
                </label>
              </div>
              <div v-if="applyError" class="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{{ applyError }}</div>
              <button type="submit" :disabled="applyLoading" class="w-full bg-primary text-white py-4 rounded-xl font-black text-lg hover:opacity-90 transition-all disabled:opacity-50">
                {{ applyLoading ? 'Submitting...' : 'Submit Application' }}
              </button>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Full Terms Modal -->
    <Teleport to="body">
      <Transition enter-active-class="transition ease-out duration-300" enter-from-class="opacity-0" enter-to-class="opacity-100">
        <div v-if="showFullTerms" class="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4" @click.self="showFullTerms = false">
          <div class="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-8 shadow-2xl">
            <div class="flex items-center justify-between mb-6 sticky top-0 bg-white pb-4 border-b">
              <h3 class="text-xl font-black text-gray-900">Affiliate Terms & Conditions</h3>
              <button @click="showFullTerms = false" class="text-gray-400 hover:text-gray-600">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <div v-if="fullTerms" class="space-y-6">
              <div v-for="section in fullTerms.sections" :key="section.heading">
                <h4 class="font-black text-gray-900 mb-2">{{ section.heading }}</h4>
                <p class="text-gray-600 text-sm leading-relaxed">{{ section.content }}</p>
              </div>
              <p class="text-xs text-gray-400 mt-6">Last updated: {{ fullTerms.last_updated }}</p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const config = useRuntimeConfig()
const openAuthModal = inject('openAuthModal', (showLogin: boolean) => {})

const showApplyModal = ref(false)
const showFullTerms = ref(false)
const affiliateProfile = ref<any>(null)
const fullTerms = ref<any>(null)
const applyLoading = ref(false)
const applyError = ref('')
const applySuccess = ref(false)

const calcReferrals = ref(20)
const calcAvgOrder = ref(1499)
const calcEarnings = computed(() => Math.round(calcReferrals.value * calcAvgOrder.value * 0.10))

const applyForm = ref({
  website: '',
  social_media: '',
  promotion_method: '',
  notes: '',
  agreed: false
})

const steps = [
  { icon: 'how_to_reg', title: 'Apply & Get Approved', desc: 'Fill out a quick application. We review and approve within 3-5 business days.' },
  { icon: 'link', title: 'Share Your Links', desc: 'Get unique affiliate links for any product. Share on social media, blog, or anywhere.' },
  { icon: 'payments', title: 'Earn Commission', desc: 'Earn 10% on every sale. Track earnings in real-time. Withdraw via UPI.' }
]

const terms = [
  { icon: 'percent', heading: 'Commission Rate', content: '10% on every completed sale. Custom rates available for top performers.' },
  { icon: 'cookie', heading: 'Cookie Duration', content: '30-day cookie window. Customer must purchase within 30 days of clicking your link.' },
  { icon: 'currency_rupee', heading: 'Minimum Payout', content: '₹500 minimum. Payouts processed within 30 days via UPI or bank transfer.' },
  { icon: 'block', heading: 'No Self-Referrals', content: 'Purchasing through your own link is prohibited and will result in account termination.' },
  { icon: 'refresh', heading: 'Refund Policy', content: 'Commission reversed if customer gets a refund within 30 days of purchase.' },
  { icon: 'verified', heading: 'Approval Required', content: 'All applications reviewed manually. We approve genuine promoters only.' }
]

const loadAffiliateProfile = async () => {
  if (!authStore.isAuthenticated) return
  try {
    const res = await $fetch<any>(`${config.public.apiBase}/v1/affiliate/me`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    if (res.success) affiliateProfile.value = res.data
  } catch {}
}

const loadTerms = async () => {
  try {
    const res = await $fetch<any>(`${config.public.apiBase}/v1/affiliate/terms`)
    if (res.success) fullTerms.value = res.data
  } catch {}
}

const submitApplication = async () => {
  applyLoading.value = true
  applyError.value = ''
  try {
    const res = await $fetch<any>(`${config.public.apiBase}/v1/affiliate/register`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: applyForm.value
    })
    if (res.success) {
      applySuccess.value = true
      affiliateProfile.value = res.data
    } else {
      applyError.value = res.error || 'Failed to submit'
    }
  } catch (e: any) {
    applyError.value = e.data?.error || 'Something went wrong'
  } finally {
    applyLoading.value = false
  }
}

onMounted(() => {
  loadAffiliateProfile()
  loadTerms()
})

useHead({ title: 'Affiliate Program — Earn with DigiKraft' })
</script>
