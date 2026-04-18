<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    @click="handleClose"
  >
    <div 
      class="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      @click.stop
    >
      <!-- Success Icon -->
      <div class="text-center mb-6">
        <div class="size-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="material-symbols-outlined text-green-600 text-5xl">check_circle</span>
        </div>
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Purchase Successful!</h2>
        <p class="text-gray-600">Order #{{ orderConfirmation?.orderNumber }}</p>
      </div>
      
      <!-- Download Links -->
      <div v-if="orderConfirmation?.downloadLinks?.length" class="mb-8">
        <h3 class="text-xl font-bold text-gray-900 mb-4">Your Downloads</h3>
        <div class="space-y-3">
          <div 
            v-for="link in orderConfirmation.downloadLinks" 
            :key="link.productId"
            class="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all"
          >
            <div class="flex items-center gap-4">
              <div class="flex-1">
                <h4 class="font-bold text-gray-900 mb-1">{{ link.productName }}</h4>
                <p class="text-sm text-gray-500">{{ link.fileSize }}</p>
              </div>
              <button 
                @click="handleDownload(link.url)" 
                class="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-all flex items-center gap-2 group"
              >
                <span class="material-symbols-outlined group-hover:scale-110 transition-transform">download</span>
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Order Summary -->
      <div class="bg-gray-50 rounded-xl p-6 mb-6">
        <h3 class="font-bold text-gray-900 mb-4">Order Summary</h3>
        <div class="space-y-3">
          <div 
            v-for="item in orderConfirmation?.items" 
            :key="item.productId"
            class="flex items-center justify-between"
          >
            <span class="text-gray-700">{{ item.productName }}</span>
            <span class="font-bold text-gray-900">₹{{ item.price }}</span>
          </div>
          <div class="pt-3 border-t border-gray-200 flex items-center justify-between">
            <span class="font-bold text-gray-900">Total</span>
            <span class="font-bold text-primary text-xl">₹{{ orderConfirmation?.total }}</span>
          </div>
        </div>
      </div>
      
      <!-- Expiration Notice -->
      <div class="bg-blue-50 rounded-xl p-4 mb-6 flex items-start gap-3">
        <span class="material-symbols-outlined text-blue-600 shrink-0">info</span>
        <p class="text-sm text-gray-700">
          Download links expire in 24 hours. You can always access your purchases in 
          <NuxtLink to="/account?tab=downloads" class="text-primary font-bold hover:underline">
            My Downloads
          </NuxtLink>
        </p>
      </div>
      
      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-3">
        <button 
          @click="navigateToDownloads" 
          class="flex-1 bg-primary text-white py-4 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
        >
          <span class="material-symbols-outlined">folder</span>
          Go to My Downloads
        </button>
        <button 
          @click="handleClose" 
          class="flex-1 bg-white border-2 border-gray-300 text-gray-900 py-4 rounded-xl font-bold hover:border-primary hover:text-primary transition-all"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface DownloadLink {
  productId: string
  productName: string
  url: string
  expiresAt: Date
  fileSize: string
}

interface PurchasedItem {
  productId: string
  productName: string
  productImage: string
  price: number
}

interface OrderConfirmation {
  orderId: string
  orderNumber: string
  purchaseDate: Date
  items: PurchasedItem[]
  total: number
  downloadLinks: DownloadLink[]
}

interface Props {
  isOpen: boolean
  orderId: string
}

const props = defineProps<Props>()
const emit = defineEmits(['close'])

const orderConfirmation = ref<OrderConfirmation | null>(null)

const fetchOrderConfirmation = async () => {
  try {
    const config = useRuntimeConfig()
    const response = await $fetch(`${config.public.apiBase}/orders/${props.orderId}/confirmation`)
    orderConfirmation.value = response.data
  } catch (error) {
    console.error('Failed to fetch order confirmation:', error)
    // Mock data for development
    orderConfirmation.value = {
      orderId: props.orderId,
      orderNumber: 'ORD-20240120-00001',
      purchaseDate: new Date(),
      items: [
        {
          productId: '1',
          productName: 'Premium Logo Bundle',
          productImage: '',
          price: 2499
        }
      ],
      total: 2499,
      downloadLinks: [
        {
          productId: '1',
          productName: 'Premium Logo Bundle',
          url: '#',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          fileSize: '45 MB'
        }
      ]
    }
  }
}

const handleDownload = (url: string) => {
  window.open(url, '_blank')
}

const navigateToDownloads = () => {
  navigateTo('/account?tab=downloads')
  emit('close')
}

const handleClose = () => {
  emit('close')
}

watch(() => props.isOpen, (isOpen) => {
  if (isOpen && props.orderId) {
    fetchOrderConfirmation()
  }
})
</script>
