<template>
  <div class="space-y-6">
    <!-- Progress Indicator -->
    <div class="flex items-center justify-between mb-8">
      <div 
        v-for="(step, idx) in steps"
        :key="step"
        class="flex flex-col items-center flex-1"
      >
        <div 
          :class="[
            'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-all',
            currentStep > idx ? 'bg-green-500 text-white' : 
            currentStep === idx ? 'bg-primary text-white ring-4 ring-primary/20' : 
            'bg-gray-200 text-gray-600'
          ]"
        >
          {{ currentStep > idx ? '✓' : idx + 1 }}
        </div>
        <span class="text-xs font-medium text-gray-600 text-center">{{ step }}</span>
      </div>
    </div>

    <!-- Step 1: Shipping -->
    <div v-if="currentStep === 0" class="space-y-4">
      <h3 class="text-lg font-bold text-gray-900">Shipping Address</h3>
      
      <!-- Quick Address Selection -->
      <div v-if="savedAddresses.length > 0" class="space-y-2">
        <label v-for="addr in savedAddresses" :key="addr.id" class="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors" :class="selectedAddress === addr.id ? 'border-primary bg-primary/5' : ''">
          <input 
            type="radio" 
            :value="addr.id"
            v-model="selectedAddress"
            class="mt-1"
          />
          <div class="flex-1">
            <p class="font-medium text-gray-900">{{ addr.name }}</p>
            <p class="text-sm text-gray-600">{{ addr.street }}</p>
            <p class="text-sm text-gray-600">{{ addr.city }}, {{ addr.state }} {{ addr.zip }}</p>
          </div>
        </label>
        <button 
          @click="showAddressForm = !showAddressForm"
          class="w-full text-primary font-medium py-2 text-sm"
        >
          + Add New Address
        </button>
      </div>

      <!-- Address Form -->
      <div v-if="showAddressForm || savedAddresses.length === 0" class="space-y-3">
        <input 
          v-model="form.name"
          type="text" 
          placeholder="Full Name"
          class="w-full border border-gray-200 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <input 
          v-model="form.email"
          type="email" 
          placeholder="Email"
          class="w-full border border-gray-200 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <input 
          v-model="form.phone"
          type="tel" 
          placeholder="Phone Number"
          class="w-full border border-gray-200 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <input 
          v-model="form.street"
          type="text" 
          placeholder="Street Address"
          class="w-full border border-gray-200 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <div class="grid grid-cols-2 gap-3">
          <input 
            v-model="form.city"
            type="text" 
            placeholder="City"
            class="border border-gray-200 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <input 
            v-model="form.state"
            type="text" 
            placeholder="State"
            class="border border-gray-200 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <input 
          v-model="form.zip"
          type="text" 
          placeholder="ZIP Code"
          class="w-full border border-gray-200 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <button 
        @click="nextStep"
        class="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
      >
        Continue to Payment
      </button>
    </div>

    <!-- Step 2: Payment -->
    <div v-if="currentStep === 1" class="space-y-4">
      <h3 class="text-lg font-bold text-gray-900">Payment Method</h3>

      <!-- Apple Pay / Google Pay -->
      <div class="space-y-2">
        <button 
          @click="paymentMethod = 'apple'"
          class="w-full border-2 rounded-lg px-4 py-3 font-bold transition-all flex items-center justify-center gap-2"
          :class="paymentMethod === 'apple' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'"
        >
          <span class="material-symbols-outlined">apple</span>
          Apple Pay
        </button>
        <button 
          @click="paymentMethod = 'google'"
          class="w-full border-2 rounded-lg px-4 py-3 font-bold transition-all flex items-center justify-center gap-2"
          :class="paymentMethod === 'google' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'"
        >
          <span class="material-symbols-outlined">google</span>
          Google Pay
        </button>
      </div>

      <!-- Card Payment -->
      <div class="border-t border-gray-200 pt-4">
        <button 
          @click="paymentMethod = 'card'"
          class="w-full border-2 rounded-lg px-4 py-3 font-bold transition-all flex items-center justify-center gap-2 mb-4"
          :class="paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'"
        >
          <span class="material-symbols-outlined">credit_card</span>
          Credit/Debit Card
        </button>

        <div v-if="paymentMethod === 'card'" class="space-y-3">
          <input 
            v-model="cardForm.number"
            type="text" 
            placeholder="Card Number"
            maxlength="19"
            class="w-full border border-gray-200 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <input 
            v-model="cardForm.name"
            type="text" 
            placeholder="Cardholder Name"
            class="w-full border border-gray-200 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <div class="grid grid-cols-2 gap-3">
            <input 
              v-model="cardForm.expiry"
              type="text" 
              placeholder="MM/YY"
              maxlength="5"
              class="border border-gray-200 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <input 
              v-model="cardForm.cvc"
              type="text" 
              placeholder="CVC"
              maxlength="4"
              class="border border-gray-200 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div class="flex gap-3 pt-4">
        <button 
          @click="prevStep"
          class="flex-1 border border-gray-200 text-gray-900 py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button 
          @click="nextStep"
          class="flex-1 bg-primary text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
        >
          Review Order
        </button>
      </div>
    </div>

    <!-- Step 3: Review -->
    <div v-if="currentStep === 2" class="space-y-4">
      <h3 class="text-lg font-bold text-gray-900">Order Review</h3>

      <!-- Order Summary -->
      <div class="bg-gray-50 rounded-lg p-4 space-y-3">
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">Subtotal</span>
          <span class="font-medium">{{ formatPrice(subtotal) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">Tax</span>
          <span class="font-medium">{{ formatPrice(tax) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">Shipping</span>
          <span class="font-medium">{{ shipping === 0 ? 'Free' : formatPrice(shipping) }}</span>
        </div>
        <div class="border-t border-gray-200 pt-3 flex justify-between">
          <span class="font-bold">Total</span>
          <span class="text-xl font-bold text-primary">{{ formatPrice(total) }}</span>
        </div>
      </div>

      <!-- Shipping Address -->
      <div class="border border-gray-200 rounded-lg p-4">
        <h4 class="font-bold text-gray-900 mb-2">Shipping To</h4>
        <p class="text-sm text-gray-600">{{ form.name }}</p>
        <p class="text-sm text-gray-600">{{ form.street }}</p>
        <p class="text-sm text-gray-600">{{ form.city }}, {{ form.state }} {{ form.zip }}</p>
      </div>

      <!-- Payment Method -->
      <div class="border border-gray-200 rounded-lg p-4">
        <h4 class="font-bold text-gray-900 mb-2">Payment Method</h4>
        <p class="text-sm text-gray-600">
          {{ paymentMethod === 'apple' ? 'Apple Pay' : paymentMethod === 'google' ? 'Google Pay' : 'Credit Card' }}
        </p>
      </div>

      <!-- Terms -->
      <label class="flex items-start gap-3">
        <input 
          type="checkbox" 
          v-model="agreedToTerms"
          class="mt-1"
        />
        <span class="text-xs text-gray-600">
          I agree to the <NuxtLink to="/terms" class="text-primary hover:underline">Terms of Service</NuxtLink> and <NuxtLink to="/privacy" class="text-primary hover:underline">Privacy Policy</NuxtLink>
        </span>
      </label>

      <div class="flex gap-3 pt-4">
        <button 
          @click="prevStep"
          class="flex-1 border border-gray-200 text-gray-900 py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button 
          @click="completeCheckout"
          :disabled="!agreedToTerms || isProcessing"
          class="flex-1 bg-primary text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span v-if="isProcessing" class="material-symbols-outlined animate-spin">hourglass_empty</span>
          {{ isProcessing ? 'Processing...' : 'Complete Purchase' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { formatPrice } = useCurrency()

const currentStep = ref(0)
const steps = ['Shipping', 'Payment', 'Review']

const selectedAddress = ref<string | null>(null)
const showAddressForm = ref(false)
const paymentMethod = ref('apple')
const agreedToTerms = ref(false)
const isProcessing = ref(false)

const form = ref({
  name: '',
  email: '',
  phone: '',
  street: '',
  city: '',
  state: '',
  zip: ''
})

const cardForm = ref({
  number: '',
  name: '',
  expiry: '',
  cvc: ''
})

const savedAddresses = [
  {
    id: '1',
    name: 'Home',
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zip: '10001'
  }
]

const subtotal = ref(299.99)
const tax = computed(() => subtotal.value * 0.1)
const shipping = ref(0)
const total = computed(() => subtotal.value + tax.value + shipping.value)

const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const completeCheckout = async () => {
  isProcessing.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    // Navigate to success page
    navigateTo('/checkout/success')
  } catch (error) {
    console.error('Checkout error:', error)
  } finally {
    isProcessing.value = false
  }
}
</script>

<style scoped>
input[type="text"],
input[type="email"],
input[type="tel"] {
  font-size: 16px; /* Prevent zoom on iOS */
}
</style>
