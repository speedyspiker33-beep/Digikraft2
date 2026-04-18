<template>
  <div class="min-h-screen bg-gray-50 py-12 px-6 lg:px-12">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-4xl font-bold text-gray-900 mb-8">My Account</h1>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Sidebar -->
        <aside class="lg:col-span-1">
          <div class="bg-white rounded-xl border border-gray-200 p-6 sticky top-[150px] z-40">
            <div class="text-center mb-6 pb-6 border-b border-gray-100">
              <div class="size-20 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                {{ authStore.user?.name?.charAt(0) || 'U' }}
              </div>
              <h3 class="font-bold text-gray-900">{{ authStore.user?.name }}</h3>
              <p class="text-sm text-gray-500">{{ authStore.user?.email }}</p>
            </div>
            
            <nav class="space-y-2">
              <button 
                v-for="tab in tabs" 
                :key="tab.id"
                @click="activeTab = tab.id"
                :class="[
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                  activeTab === tab.id 
                    ? 'bg-primary text-white' 
                    : 'text-gray-600 hover:bg-gray-50'
                ]"
              >
                <span class="material-symbols-outlined text-lg">{{ tab.icon }}</span>
                {{ tab.label }}
              </button>
            </nav>

            <button 
              @click="handleLogout"
              class="w-full mt-6 flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
            >
              <span class="material-symbols-outlined text-lg">logout</span>
              Logout
            </button>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="lg:col-span-3">
          <!-- Dashboard -->
          <div v-if="activeTab === 'dashboard'" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="bg-white rounded-xl p-6 border border-gray-200">
                <div class="flex items-center gap-4">
                  <div class="size-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span class="material-symbols-outlined text-primary text-2xl">shopping_bag</span>
                  </div>
                  <div>
                    <p class="text-2xl font-bold text-gray-900">{{ userStats.orders }}</p>
                    <p class="text-sm text-gray-500">Total Orders</p>
                  </div>
                </div>
              </div>
              <div class="bg-white rounded-xl p-6 border border-gray-200">
                <div class="flex items-center gap-4">
                  <div class="size-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span class="material-symbols-outlined text-green-600 text-2xl">download</span>
                  </div>
                  <div>
                    <p class="text-2xl font-bold text-gray-900">{{ userStats.downloads }}</p>
                    <p class="text-sm text-gray-500">Downloads</p>
                  </div>
                </div>
              </div>
              <div class="bg-white rounded-xl p-6 border border-gray-200">
                <div class="flex items-center gap-4">
                  <div class="size-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span class="material-symbols-outlined text-purple-600 text-2xl">payments</span>
                  </div>
                  <div>
                    <p class="text-2xl font-bold text-gray-900">₹{{ userStats.spent }}</p>
                    <p class="text-sm text-gray-500">Total Spent</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl p-6 border border-gray-200">
              <h2 class="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
              <div v-if="recentOrders.length" class="space-y-4">
                <div v-for="order in recentOrders" :key="order.id" class="flex items-center gap-4 p-4 border border-gray-100 rounded-lg hover:border-primary/30 transition-all">
                  <div class="size-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span class="material-symbols-outlined text-primary">receipt</span>
                  </div>
                  <div class="flex-1">
                    <h3 class="font-bold text-gray-900">{{ order.order_number }}</h3>
                    <p class="text-sm text-gray-500">{{ (order.items||[]).length }} item(s) · ₹{{ order.total }}</p>
                  </div>
                  <span :class="['px-3 py-1 text-xs font-bold rounded-full', order.status === 'completed' ? 'bg-green-100 text-green-700' : order.status === 'processing' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700']">
                    {{ order.status }}
                  </span>
                </div>
              </div>
              <div v-else class="text-center py-8 text-gray-500">
                <span class="material-symbols-outlined text-4xl text-gray-300 block mb-2">shopping_bag</span>
                No orders yet. <NuxtLink to="/products" class="text-primary font-bold">Browse products</NuxtLink>
              </div>
            </div>
          </div>

          <!-- Purchases -->
          <div v-if="activeTab === 'purchases'" class="bg-white rounded-xl p-6 border border-gray-200">
            <h2 class="text-xl font-bold text-gray-900 mb-6">My Purchases</h2>
            <div v-if="recentOrders.length" class="space-y-4">
              <div v-for="order in recentOrders" :key="order.id" class="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                <div class="flex items-center justify-between mb-3">
                  <div>
                    <h3 class="font-bold text-gray-900">{{ order.order_number }}</h3>
                    <p class="text-sm text-gray-500">{{ formatOrderDate(order.created_at) }} · ₹{{ order.total }}</p>
                  </div>
                  <span :class="['px-3 py-1 text-xs font-bold rounded-full', order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700']">
                    {{ order.payment_status === 'paid' ? 'Paid' : 'Pending' }}
                  </span>
                </div>
                <div v-for="item in (order.items||[])" :key="item.productId" class="flex items-center gap-3 py-2 border-t border-gray-100">
                  <div class="size-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span class="material-symbols-outlined text-primary text-sm">inventory_2</span>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-bold text-gray-900">{{ item.productName }}</p>
                    <p class="text-xs text-gray-500">₹{{ item.price }}</p>
                  </div>
                  <NuxtLink to="/account?tab=downloads" class="text-xs text-primary font-bold hover:underline">Download</NuxtLink>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-12 text-gray-500">
              <span class="material-symbols-outlined text-5xl text-gray-300 block mb-3">shopping_bag</span>
              <p class="font-bold text-gray-700 mb-2">No purchases yet</p>
              <NuxtLink to="/products" class="text-primary font-bold hover:underline">Browse products →</NuxtLink>
            </div>
          </div>

          <!-- My Downloads Section -->
          <div v-if="activeTab === 'downloads'">
            <MyDownloadsSection />
          </div>

          <!-- Wishlist / Favorites -->
          <div v-if="activeTab === 'favorites'" class="bg-white rounded-xl p-6 border border-gray-200">
            <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span class="material-symbols-outlined text-red-500">favorite</span>
              My Wishlist
              <span class="text-sm font-normal text-gray-500 ml-2">({{ wishlistStore.count }} items)</span>
            </h2>
            <div v-if="wishlistStore.items.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="product in wishlistStore.items" :key="product.id"
                class="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all group">
                <div class="relative aspect-video bg-gray-100 overflow-hidden">
                  <img :src="product.image" :alt="product.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <button @click="wishlistStore.remove(product.id)"
                    class="absolute top-2 right-2 size-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-red-50 transition-all shadow">
                    <span class="material-symbols-outlined text-red-500 text-lg">favorite</span>
                  </button>
                </div>
                <div class="p-3">
                  <h4 class="font-bold text-gray-900 text-sm line-clamp-1 mb-1">{{ product.name }}</h4>
                  <div class="flex items-center justify-between">
                    <span class="font-black text-primary">₹{{ product.price }}</span>
                    <NuxtLink :to="`/product/${product.slug}`"
                      class="text-xs bg-primary text-white px-3 py-1.5 rounded-lg font-bold hover:opacity-90 transition-all">
                      View
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-16">
              <span class="material-symbols-outlined text-5xl text-gray-300 block mb-3">favorite_border</span>
              <p class="font-bold text-gray-700 mb-2">Your wishlist is empty</p>
              <p class="text-gray-500 text-sm mb-6">Click the ❤️ on any product to save it here</p>
              <NuxtLink to="/products" class="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all">
                Browse Products
              </NuxtLink>
            </div>
          </div>

          <!-- Affiliate Dashboard -->
          <div v-if="activeTab === 'affiliate'">
            <!-- Not applied yet -->
            <div v-if="!affiliateProfile" class="bg-white rounded-xl p-8 border border-gray-200 text-center">
              <div class="size-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span class="material-symbols-outlined text-primary text-4xl">handshake</span>
              </div>
              <h2 class="text-2xl font-black text-gray-900 mb-3">Join the Affiliate Program</h2>
              <p class="text-gray-500 mb-2">Earn <strong class="text-primary">10% commission</strong> on every sale you refer</p>
              <p class="text-gray-400 text-sm mb-8">30-day cookie · Real-time tracking · UPI payouts</p>
              <NuxtLink to="/affiliate" class="bg-primary text-white px-8 py-4 rounded-xl font-black text-lg hover:opacity-90 transition-all inline-block">
                Learn More & Apply →
              </NuxtLink>
            </div>

            <!-- Pending approval -->
            <div v-else-if="affiliateProfile.status === 'pending'" class="bg-white rounded-xl p-8 border border-yellow-200 text-center">
              <div class="size-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="material-symbols-outlined text-yellow-600 text-3xl">hourglass_empty</span>
              </div>
              <h2 class="text-xl font-black text-gray-900 mb-2">Application Under Review</h2>
              <p class="text-gray-500">Your affiliate application is being reviewed. We'll notify you within 3-5 business days.</p>
              <div class="mt-6 inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 px-4 py-2 rounded-full text-sm font-bold text-yellow-700">
                <span class="material-symbols-outlined text-sm">schedule</span>
                Pending Approval
              </div>
            </div>

            <!-- Rejected -->
            <div v-else-if="affiliateProfile.status === 'rejected'" class="bg-white rounded-xl p-8 border border-red-200 text-center">
              <div class="size-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="material-symbols-outlined text-red-500 text-3xl">cancel</span>
              </div>
              <h2 class="text-xl font-black text-gray-900 mb-2">Application Not Approved</h2>
              <p class="text-gray-500">Your application was not approved at this time. Contact support for more information.</p>
            </div>

            <!-- Approved — Full Dashboard -->
            <div v-else-if="affiliateProfile.status === 'approved'" class="space-y-6">
              <!-- Stats -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-white rounded-xl p-5 border border-gray-200 text-center">
                  <div class="text-2xl font-black text-primary">{{ affiliateStats?.total_clicks || 0 }}</div>
                  <div class="text-xs text-gray-500 mt-1">Total Clicks</div>
                </div>
                <div class="bg-white rounded-xl p-5 border border-gray-200 text-center">
                  <div class="text-2xl font-black text-green-600">{{ affiliateStats?.total_sales || 0 }}</div>
                  <div class="text-xs text-gray-500 mt-1">Conversions</div>
                </div>
                <div class="bg-white rounded-xl p-5 border border-gray-200 text-center">
                  <div class="text-2xl font-black text-purple-600">₹{{ affiliateStats?.total_earned || 0 }}</div>
                  <div class="text-xs text-gray-500 mt-1">Total Earned</div>
                </div>
                <div class="bg-gradient-to-br from-primary to-purple-600 rounded-xl p-5 text-center text-white">
                  <div class="text-2xl font-black">₹{{ affiliateStats?.pending_payout || 0 }}</div>
                  <div class="text-xs text-white/80 mt-1">Pending Payout</div>
                </div>
              </div>

              <!-- Referral Code & Link Generator -->
              <div class="bg-white rounded-xl p-6 border border-gray-200">
                <h3 class="font-black text-gray-900 mb-4 flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary">link</span>
                  Your Affiliate Links
                </h3>
                <div class="mb-4">
                  <label class="block text-sm font-bold text-gray-700 mb-2">Your Referral Code</label>
                  <div class="flex gap-2">
                    <div class="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-mono font-bold text-primary text-lg">
                      {{ affiliateProfile.code }}
                    </div>
                    <button @click="copyLink(affiliateProfile.code)"
                      class="bg-primary text-white px-4 py-3 rounded-xl font-bold hover:opacity-90 transition-all flex items-center gap-2">
                      <span class="material-symbols-outlined text-lg">content_copy</span>
                      Copy
                    </button>
                  </div>
                </div>
                <div class="mb-4">
                  <label class="block text-sm font-bold text-gray-700 mb-2">Generate Product Link</label>
                  <div class="flex gap-2">
                    <input v-model="affiliateLinkProduct" type="text" placeholder="Product slug (e.g. premium-logo-bundle) or leave empty for homepage"
                      class="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary outline-none transition-all text-sm" />
                    <button @click="generateAffiliateLink"
                      class="bg-primary text-white px-4 py-3 rounded-xl font-bold hover:opacity-90 transition-all whitespace-nowrap">
                      Generate
                    </button>
                  </div>
                </div>
                <div v-if="affiliateLinkUrl" class="mt-3">
                  <label class="block text-sm font-bold text-gray-700 mb-2">Your Affiliate Link</label>
                  <div class="flex gap-2">
                    <div class="flex-1 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm font-mono text-green-700 break-all">
                      {{ affiliateLinkUrl }}
                    </div>
                    <button @click="copyLink(affiliateLinkUrl)"
                      class="bg-green-600 text-white px-4 py-3 rounded-xl font-bold hover:opacity-90 transition-all flex items-center gap-2 flex-shrink-0">
                      <span class="material-symbols-outlined text-lg">content_copy</span>
                      Copy
                    </button>
                  </div>
                  <div id="copy-feedback" style="display:none" class="text-green-600 text-sm font-bold mt-2">✓ Copied to clipboard!</div>
                </div>
              </div>

              <!-- Commission Rate -->
              <div class="bg-gradient-to-r from-primary/5 to-purple-50 rounded-xl p-5 border border-primary/20 flex items-center justify-between">
                <div>
                  <div class="font-black text-gray-900">Your Commission Rate</div>
                  <div class="text-sm text-gray-500">Applied to all sales through your links</div>
                </div>
                <div class="text-4xl font-black text-primary">{{ affiliateProfile.commission_rate }}%</div>
              </div>

              <!-- Recent Conversions -->
              <div class="bg-white rounded-xl p-6 border border-gray-200">
                <h3 class="font-black text-gray-900 mb-4">Recent Conversions</h3>
                <div v-if="affiliateStats?.recent_conversions?.length" class="space-y-3">
                  <div v-for="conv in affiliateStats.recent_conversions" :key="conv._id"
                    class="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <div class="text-sm font-bold text-gray-900">Order #{{ conv.order_id }}</div>
                      <div class="text-xs text-gray-500">{{ new Date(conv.created_at).toLocaleDateString('en-IN') }}</div>
                    </div>
                    <div class="text-right">
                      <div class="font-black text-green-600">+₹{{ conv.commission }}</div>
                      <div class="text-xs text-gray-400">₹{{ conv.order_total }} sale</div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center py-8 text-gray-400">
                  <span class="material-symbols-outlined text-3xl block mb-2">receipt_long</span>
                  No conversions yet. Start sharing your links!
                </div>
              </div>

              <!-- Payout Info -->
              <div class="bg-white rounded-xl p-6 border border-gray-200">
                <h3 class="font-black text-gray-900 mb-3">Payout Progress</h3>
                <!-- Progress bar -->
                <div class="mb-4">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm text-gray-600">₹{{ affiliateStats?.pending_payout || 0 }} earned</span>
                    <span class="text-sm font-black" :class="payoutProgress >= 100 ? 'text-green-600' : 'text-primary'">
                      {{ payoutProgress }}% {{ payoutProgress >= 100 ? '✓ Ready!' : '' }}
                    </span>
                  </div>
                  <div class="bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      class="h-3 rounded-full transition-all duration-500"
                      :class="payoutProgress >= 100 ? 'bg-green-500' : 'bg-primary'"
                      :style="`width: ${Math.min(100, payoutProgress)}%`"
                    ></div>
                  </div>
                  <div class="flex justify-between text-xs text-gray-400 mt-1">
                    <span>₹0</span>
                    <span>Target: ₹{{ affiliateProfile?.payout_target || 1000 }}</span>
                  </div>
                </div>
                <p v-if="payoutProgress >= 100" class="text-green-600 text-sm font-bold bg-green-50 p-3 rounded-lg mb-3">
                  🎉 You've reached your payout target! Email affiliate@digikraft.shop with your UPI ID to request payment.
                </p>
                <p v-else class="text-gray-500 text-sm mb-4">
                  ₹{{ Math.max(0, (affiliateProfile?.payout_target || 1000) - (affiliateStats?.pending_payout || 0)) }} more needed to reach payout target
                </p>
                <!-- Payment details -->
                <div class="border-t border-gray-100 pt-4">
                  <h4 class="font-bold text-gray-900 mb-3 text-sm">Your Payment Details</h4>
                  <div class="space-y-3">
                    <div>
                      <label class="block text-xs font-bold text-gray-600 mb-1">UPI ID</label>
                      <input v-model="paymentDetails.upi_id" type="text" placeholder="yourname@upi or phone@paytm"
                        class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-gray-600 mb-1">Bank Details (optional)</label>
                      <textarea v-model="paymentDetails.bank_details" rows="2" placeholder="Account number, IFSC, Bank name..."
                        class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-primary outline-none resize-none"></textarea>
                    </div>
                    <button @click="savePaymentDetails" class="w-full bg-primary text-white py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-all">
                      Save Payment Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Settings -->
          <div v-if="activeTab === 'settings'" class="bg-white rounded-xl p-6 border border-gray-200">
            <h2 class="text-xl font-bold text-gray-900 mb-6">Account Settings</h2>
            <form class="space-y-6">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                <input 
                  type="text" 
                  :value="authStore.user?.name"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                <input 
                  type="email" 
                  :value="authStore.user?.email"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">New Password</label>
                <input 
                  type="password" 
                  placeholder="Leave blank to keep current password"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                />
              </div>
              <button 
                type="submit"
                class="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all"
              >
                Save Changes
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useCartStore } from '~/stores/cart'
import { useWishlistStore } from '~/stores/wishlist'

const authStore = useAuthStore()
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()
const config = useRuntimeConfig()
const route = useRoute()

const activeTab = ref(route.query.tab as string || 'dashboard')

watch(() => route.query.tab, (tab) => {
  if (tab) activeTab.value = tab as string
})

// Affiliate data
const affiliateProfile = ref<any>(null)
const affiliateStats = ref<any>(null)
const affiliateLinkProduct = ref('')
const affiliateLinkUrl = ref('')
const affiliateApplying = ref(false)

const loadAffiliateData = async () => {
  if (!authStore.token) return
  try {
    const res = await $fetch<any>(`${config.public.apiBase}/v1/affiliate/me`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    if (res.success) {
      affiliateProfile.value = res.data
      // Pre-fill payment details
      paymentDetails.value.upi_id = res.data.upi_id || ''
      paymentDetails.value.bank_details = res.data.bank_details || ''
      if (res.data.status === 'approved') {
        const statsRes = await $fetch<any>(`${config.public.apiBase}/v1/affiliate/stats`, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        })
        if (statsRes.success) affiliateStats.value = statsRes.data
      }
    }
  } catch {}
}

const generateAffiliateLink = async () => {
  if (!affiliateProfile.value || affiliateProfile.value.status !== 'approved') return
  try {
    const res = await $fetch<any>(`${config.public.apiBase}/v1/affiliate/links`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: { product_slug: affiliateLinkProduct.value || undefined }
    })
    if (res.success) affiliateLinkUrl.value = res.data.affiliate_link
  } catch {}
}

const copyLink = (text: string) => {
  navigator.clipboard.writeText(text)
  const el = document.getElementById('copy-feedback')
  if (el) { el.style.display = 'block'; setTimeout(() => { el.style.display = 'none' }, 2000) }
}

// Payout progress
const payoutProgress = computed(() => {
  const pending = affiliateStats.value?.pending_payout || 0
  const target = affiliateProfile.value?.payout_target || 1000
  return Math.min(100, Math.round((pending / target) * 100))
})

// Payment details
const paymentDetails = ref({ upi_id: '', bank_details: '' })

const savePaymentDetails = async () => {
  try {
    await $fetch<any>(`${config.public.apiBase}/v1/affiliate/me/payment`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: paymentDetails.value
    })
    alert('Payment details saved!')
  } catch {}
}

watch(() => route.query.tab, (tab) => {
  if (tab) activeTab.value = tab as string
})

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'purchases', label: 'My Purchases', icon: 'shopping_bag' },
  { id: 'downloads', label: 'My Downloads', icon: 'download' },
  { id: 'favorites', label: 'Wishlist', icon: 'favorite' },
  { id: 'affiliate', label: 'Affiliate', icon: 'handshake' },
  { id: 'settings', label: 'Settings', icon: 'settings' }
]

// Real data from backend
const recentOrders = ref<any[]>([])
const userStats = ref({ orders: 0, downloads: 0, spent: 0 })

const loadUserData = async () => {
  if (!authStore.token) return
  try {
    const res = await $fetch<any>(`${config.public.apiBase}/v1/orders`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    if (res.success) {
      const orders = res.data?.orders || []
      recentOrders.value = orders.slice(0, 5)
      userStats.value.orders = orders.length
      userStats.value.spent = orders.filter((o: any) => o.payment_status === 'paid').reduce((s: number, o: any) => s + (o.total || 0), 0)
    }
  } catch (e) {}

  try {
    const res = await $fetch<any>(`${config.public.apiBase}/downloads`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    if (res.success) {
      userStats.value.downloads = res.data?.length || 0
    }
  } catch (e) {}
}

const formatOrderDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

onMounted(() => {
  if (!authStore.isAuthenticated) {
    navigateTo('/')
    return
  }
  wishlistStore.load()
  loadUserData()
  loadAffiliateData()
})

const handleLogout = () => {
  authStore.logout()
  cartStore.clearCart()
  window.location.replace('/')
}

useHead({ title: 'My Account' })
</script>
