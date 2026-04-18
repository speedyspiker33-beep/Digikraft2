<template>
  <div class="min-h-screen bg-gray-50 pt-[150px] pb-8 px-6">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <NuxtLink to="/" class="inline-flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
          <div class="size-10 bg-primary rounded-lg flex items-center justify-center">
            <span class="material-symbols-outlined text-white text-lg">bolt</span>
          </div>
          <span class="text-xl font-bold text-gray-900">DigiKraft</span>
        </NuxtLink>
        <h1 class="text-3xl font-bold text-gray-900">Checkout</h1>
      </div>

      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Checkout Form -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Contact Information -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Email</label>
                <input 
                  v-model="form.email"
                  type="email" 
                  required
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">
                  Phone / WhatsApp
                  <span class="text-red-500 ml-1">*</span>
                </label>
                <input 
                  v-model="form.phone"
                  type="tel" 
                  required
                  class="w-full px-4 py-3 border-2 rounded-lg focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  :class="phoneError ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-primary'"
                  placeholder="+91 9999999999"
                  @blur="validatePhone"
                />
                <p v-if="phoneError" class="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">error</span>
                  {{ phoneError }}
                </p>
                <p v-else class="mt-1 text-xs text-gray-400 flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm" style="font-size:14px">whatsapp</span>
                  We'll use this to send your order updates via WhatsApp
                </p>
              </div>
            </div>
          </div>

          <!-- Billing Information -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Billing Information</h2>
            <div class="space-y-4">
              <div class="grid md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                  <input 
                    v-model="form.firstName"
                    type="text" 
                    required
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  />
                </div>
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                  <input 
                    v-model="form.lastName"
                    type="text" 
                    required
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Address</label>
                <input 
                  v-model="form.address"
                  type="text" 
                  required
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                />
              </div>

              <div class="grid md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2">City</label>
                  <input 
                    v-model="form.city"
                    type="text" 
                    required
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  />
                </div>
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2">State/Province</label>
                  <input 
                    v-model="form.state"
                    type="text" 
                    required
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  />
                </div>
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2">ZIP Code</label>
                  <input 
                    v-model="form.zip"
                    type="text" 
                    required
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Country</label>
                <select 
                  v-model="form.country"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="AU">Australia</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Payment Method -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Payment Method</h2>
            <div class="space-y-4">
              <div 
                v-for="method in paymentMethods.filter(m => m.enabled)" 
                :key="method.id"
                @click="selectedPayment = method.id"
                class="border-2 rounded-lg p-4 cursor-pointer transition-all"
                :class="selectedPayment === method.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'"
              >
                <div class="flex items-center gap-3">
                  <div class="size-5 rounded-full border-2 flex items-center justify-center"
                    :class="selectedPayment === method.id ? 'border-primary' : 'border-gray-300'"
                  >
                    <div v-if="selectedPayment === method.id" class="size-3 bg-primary rounded-full"></div>
                  </div>
                  <span class="material-symbols-outlined text-2xl" :class="selectedPayment === method.id ? 'text-primary' : 'text-gray-400'">
                    {{ method.icon }}
                  </span>
                  <span class="font-bold text-gray-900">{{ method.name }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Place Order Button -->
          <button 
            @click="handleCheckout"
            :disabled="loading"
            class="w-full bg-gradient-to-r from-primary to-blue-700 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span v-if="!loading">Complete Purchase</span>
            <span v-else class="flex items-center gap-2">
              <span class="material-symbols-outlined animate-spin">progress_activity</span>
              Processing...
            </span>
          </button>
        </div>

        <!-- Order Summary -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
            
            <!-- Cart Items -->
            <div class="space-y-4 mb-6 max-h-64 overflow-y-auto">
              <div v-for="item in cartStore.items" :key="item.product.id" class="flex gap-3">
                <img :src="item.product.image" :alt="item.product.name" class="size-16 rounded-lg object-cover" />
                <div class="flex-1 min-w-0">
                  <h3 class="font-bold text-sm text-gray-900 truncate">{{ item.product.name }}</h3>
                  <p class="text-xs text-gray-500">Qty: {{ item.quantity }}</p>
                  <p class="text-sm font-bold text-primary">₹{{ (item.product.price * item.quantity).toFixed(2) }}</p>
                </div>
              </div>
            </div>

            <!-- Totals -->
            <div class="space-y-3 pt-4 border-t border-gray-200">
              <div class="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span class="font-bold">₹{{ cartStore.subtotal.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>Tax</span>
                <span class="font-bold">₹{{ tax.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                <span>Total</span>
                <span class="text-primary">₹{{ total.toFixed(2) }}</span>
              </div>
            </div>

            <!-- Security Badge -->
            <div class="mt-6 pt-6 border-t border-gray-200 flex items-center gap-2 text-sm text-gray-600">
              <span class="material-symbols-outlined text-green-600">lock</span>
              <span>Secure checkout powered by Stripe</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Purchase Success Modal -->
    <CheckoutPurchaseSuccessModal 
      :is-open="showSuccessModal" 
      :order-id="completedOrderId"
      @close="showSuccessModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: false
})

useHead({
  title: 'Checkout',
  meta: [
    { name: 'description', content: 'Complete your purchase on DigiKraft' }
  ]
})

const cartStore = useCartStore()
const authStore = useAuthStore()
const router = useRouter()

// Get auth modal function
const openAuthModal = inject('openAuthModal', (showLogin: boolean) => {})

const form = reactive({
  email: '',
  phone: '',
  firstName: '',
  lastName: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  country: 'US'
})

const phoneError = ref('')

const validatePhone = () => {
  const p = form.phone.trim()
  if (!p) {
    phoneError.value = 'Phone number is required for order updates'
    return false
  }
  if (p.replace(/[^0-9]/g, '').length < 7) {
    phoneError.value = 'Enter a valid phone number'
    return false
  }
  phoneError.value = ''
  return true
}

const selectedPayment = ref('stripe')
const loading = ref(false)
const showSuccessModal = ref(false)
const completedOrderId = ref('')

// Dynamic payment methods — reads from backend settings (configured in admin panel)
const paymentMethods = ref([
  { id: 'stripe', name: 'Credit Card (Stripe)', icon: 'credit_card', enabled: true },
  { id: 'razorpay', name: 'Razorpay', icon: 'payments', enabled: true },
  { id: 'paypal', name: 'PayPal', icon: 'account_balance_wallet', enabled: true },
  { id: 'upi', name: 'UPI / QR Code', icon: 'qr_code', enabled: true },
  { id: 'phonepe', name: 'PhonePe', icon: 'phone', enabled: false },
  { id: 'paytm', name: 'Paytm', icon: 'account_balance_wallet', enabled: false },
])

// Load enabled gateways from backend settings
onMounted(async () => {
  try {
    const config = useRuntimeConfig()
    const res = await $fetch<any>(`${config.public.apiBase}/v1/settings/public`)
    if (res.success && res.data) {
      const s = res.data
      paymentMethods.value = paymentMethods.value.map(m => ({
        ...m,
        enabled: s[`payment_${m.id}_enabled`] !== undefined
          ? s[`payment_${m.id}_enabled`] === 'true'
          : m.enabled
      }))
    }
  } catch (e) {
    // Use defaults if backend unavailable
  }
  if (cartStore.itemCount === 0) {
    router.push('/cart')
  }
})

const tax = computed(() => cartStore.subtotal * 0.1)
const total = computed(() => cartStore.subtotal + tax.value)

const handleCheckout = async () => {
  if (!authStore.isAuthenticated) {
    openAuthModal(true)
    return
  }

  // Validate phone
  if (!validatePhone()) {
    document.querySelector('input[type="tel"]')?.focus()
    return
  }

  loading.value = true
  try {
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Create order in backend
    const config = useRuntimeConfig()
    const items = cartStore.items.map(item => ({
      productId: item.product.id,
      quantity: item.quantity
    }))

    let orderId = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substring(7).toUpperCase()

    if (authStore.token) {
      // Sync phone number to customer profile
      try {
        await $fetch<any>(`${config.public.apiBase}/customer/profile`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${authStore.token}` },
          body: { phone: form.phone.trim() }
        })
      } catch (e) { /* non-blocking */ }

      try {
        const order = await $fetch<any>(`${config.public.apiBase}/v1/orders`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${authStore.token}` },
          body: {
            items,
            payment_method: selectedPayment.value || 'stripe',
            billing_address: {
              first_name: form.firstName,
              last_name: form.lastName,
              address: form.address,
              city: form.city,
              state: form.state,
              zip: form.zip,
              country: form.country
            }
          }
        })
        if (order.success) {
          orderId = order.data.order_number || orderId
          // Trigger order webhook
          $fetch(`${config.public.apiBase.replace('/api', '')}/webhook/order-created`, {
            method: 'POST',
            body: { orderId: order.data.id, orderNumber: orderId, customerEmail: form.email, total: cartStore.total }
          }).catch(() => {})
        }
      } catch (e) {
        console.warn('Order API failed, continuing with local order:', e)
      }
    }

    completedOrderId.value = orderId
    showSuccessModal.value = true
    cartStore.clearCart()
  } catch (error) {
    console.error('Checkout failed:', error)
    alert('Payment failed. Please try again.')
  } finally {
    loading.value = false
  }
}

// Redirect if cart is empty
// Cart redirect handled in the main onMounted above
</script>
