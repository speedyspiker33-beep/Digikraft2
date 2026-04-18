<template>
  <div class="my-downloads">
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">My Downloads</h2>
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search purchases..."
            class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
          />
        </div>
        <select 
          v-model="sortBy" 
          class="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all bg-white"
        >
          <option value="recent">Most Recent</option>
          <option value="name">Name A-Z</option>
          <option value="downloads">Most Downloaded</option>
        </select>
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-if="downloadsStore.loading" class="text-center py-12">
      <div class="inline-block size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p class="mt-4 text-gray-600">Loading your downloads...</p>
    </div>

    <!-- Downloads Grid -->
    <div v-else-if="filteredDownloads.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div 
        v-for="download in filteredDownloads" 
        :key="download.id"
        class="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
      >
        <!-- Product Image -->
        <div class="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 overflow-hidden">
          <img 
            :src="download.productImage" 
            :alt="download.productName"
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
        
        <!-- Card Content -->
        <div class="p-6 space-y-4">
          <div>
            <h3 class="font-bold text-gray-900 text-lg mb-2 group-hover:text-primary transition-colors">
              {{ download.productName }}
            </h3>
            <p class="text-sm text-gray-500">
              Purchased {{ formatDate(download.purchaseDate) }}
            </p>
          </div>
          
          <!-- Stats -->
          <div class="flex items-center gap-4 text-sm text-gray-600">
            <span class="flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">folder</span>
              {{ download.files.length }} files
            </span>
            <span class="flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">download</span>
              {{ download.downloadCount }} downloads
            </span>
          </div>
          
          <!-- Download Buttons -->
          <div class="space-y-2">
            <button 
              v-for="file in download.files" 
              :key="file.id"
              @click="handleDownload(download.id, file.id)"
              class="w-full bg-primary text-white py-3 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group/btn"
            >
              <span class="material-symbols-outlined text-lg group-hover/btn:scale-110 transition-transform">download</span>
              {{ file.name }} ({{ file.size }})
            </button>
          </div>
          
          <!-- License Info -->
          <div class="pt-4 border-t border-gray-100">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-sm">
                <span class="material-symbols-outlined text-primary text-lg">verified</span>
                <span class="font-medium text-gray-900">{{ download.license.type }} License</span>
              </div>
              <button 
                @click="showLicenseDetails(download)" 
                class="text-sm text-primary hover:underline font-medium"
              >
                View Details
              </button>
            </div>
          </div>
          
          <!-- Order Reference -->
          <p class="text-xs text-gray-500">
            Order #{{ download.orderNumber }}
          </p>
        </div>
      </div>
    </div>
    
    <!-- Empty State -->
    <div v-else class="text-center py-16">
      <div class="size-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <span class="material-symbols-outlined text-gray-400 text-5xl">download</span>
      </div>
      <h3 class="text-2xl font-bold text-gray-900 mb-2">No downloads yet</h3>
      <p class="text-gray-600 mb-6">Your purchased digital products will appear here</p>
      <NuxtLink 
        to="/products" 
        class="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all"
      >
        Browse Products
        <span class="material-symbols-outlined">arrow_forward</span>
      </NuxtLink>
    </div>

    <!-- License Details Modal -->
    <div 
      v-if="selectedDownload" 
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click="selectedDownload = null"
    >
      <div 
        class="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold text-gray-900">License Details</h3>
          <button 
            @click="selectedDownload = null"
            class="size-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="space-y-6">
          <div>
            <h4 class="font-bold text-gray-900 mb-2">{{ selectedDownload.productName }}</h4>
            <p class="text-sm text-gray-500">{{ selectedDownload.license.type }} License</p>
          </div>

          <div class="bg-gray-50 rounded-xl p-6">
            <h5 class="font-bold text-gray-900 mb-4">What you can do:</h5>
            <div class="space-y-3">
              <div v-if="selectedDownload.license.allowsCommercialUse" class="flex items-start gap-3">
                <span class="material-symbols-outlined text-green-600">check_circle</span>
                <span class="text-gray-700">Use in commercial projects</span>
              </div>
              <div class="flex items-start gap-3">
                <span class="material-symbols-outlined text-green-600">check_circle</span>
                <span class="text-gray-700">Modify and customize</span>
              </div>
              <div class="flex items-start gap-3">
                <span class="material-symbols-outlined text-green-600">check_circle</span>
                <span class="text-gray-700">Use for client work</span>
              </div>
              <div v-if="selectedDownload.license.allowsRedistribution" class="flex items-start gap-3">
                <span class="material-symbols-outlined text-green-600">check_circle</span>
                <span class="text-gray-700">Redistribute in projects</span>
              </div>
            </div>
          </div>

          <div class="bg-red-50 rounded-xl p-6">
            <h5 class="font-bold text-gray-900 mb-4">Restrictions:</h5>
            <div class="space-y-3">
              <div v-if="!selectedDownload.license.allowsResale" class="flex items-start gap-3">
                <span class="material-symbols-outlined text-red-600">cancel</span>
                <span class="text-gray-700">Cannot resell as-is</span>
              </div>
              <div class="flex items-start gap-3">
                <span class="material-symbols-outlined text-red-600">cancel</span>
                <span class="text-gray-700">Cannot share with non-purchasers</span>
              </div>
            </div>
          </div>

          <p class="text-sm text-gray-600">
            {{ selectedDownload.license.description }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDownloadsStore } from '~/stores/downloads'
import type { UserDownload } from '~/stores/downloads'

const downloadsStore = useDownloadsStore()

const searchQuery = ref('')
const sortBy = ref('recent')
const selectedDownload = ref<UserDownload | null>(null)

const filteredDownloads = computed(() => {
  let filtered = [...downloadsStore.userDownloads]
  
  // Search filter
  if (searchQuery.value) {
    const search = searchQuery.value.toLowerCase()
    filtered = filtered.filter(d => 
      d.productName.toLowerCase().includes(search)
    )
  }
  
  // Sort
  if (sortBy.value === 'recent') {
    filtered.sort((a, b) => 
      b.purchaseDate.getTime() - a.purchaseDate.getTime()
    )
  } else if (sortBy.value === 'name') {
    filtered.sort((a, b) => 
      a.productName.localeCompare(b.productName)
    )
  } else if (sortBy.value === 'downloads') {
    filtered.sort((a, b) => 
      b.downloadCount - a.downloadCount
    )
  }
  
  return filtered
})

const handleDownload = async (downloadId: string, fileId: string) => {
  try {
    await downloadsStore.generateDownloadLink(downloadId, fileId)
  } catch (error) {
    console.error('Download failed:', error)
    alert('Failed to generate download link. Please try again.')
  }
}

const showLicenseDetails = (download: UserDownload) => {
  selectedDownload.value = download
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

onMounted(async () => {
  await downloadsStore.fetchUserDownloads()
})
</script>
