<template>
  <div class="container mx-auto px-6 py-8">
    <div class="max-w-2xl mx-auto">
      <div class="text-center mb-8">
        <div class="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span class="material-symbols-outlined text-4xl text-primary">swap_horiz</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">CDR Converter</h1>
        <p class="text-gray-600">Convert CorelDRAW files to SVG, PNG, PDF, AI</p>
      </div>

      <!-- Upload Area -->
      <div 
        class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer"
        :class="{ 'border-primary bg-primary/5': isDragging }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
      >
        <input 
          type="file" 
          ref="fileInput"
          accept=".cdr"
          class="hidden"
          @change="handleFileSelect"
        />
        <span class="material-symbols-outlined text-5xl text-gray-400 mb-4">upload_file</span>
        <p class="text-gray-700 font-medium mb-1">Drop CDR file here or click to browse</p>
        <p class="text-xs text-gray-500">Maximum file size: 50MB</p>
      </div>

      <!-- Selected File -->
      <div v-if="selectedFile" class="mt-4 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-gray-500">description</span>
          <div>
            <p class="text-sm font-medium text-gray-700">{{ selectedFile.name }}</p>
            <p class="text-xs text-gray-500">{{ formatFileSize(selectedFile.size) }}</p>
          </div>
        </div>
        <button @click="selectedFile = null" class="text-gray-400 hover:text-red-500">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <!-- Convert Options -->
      <div class="mt-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Convert to:</label>
        <div class="grid grid-cols-4 gap-2">
          <button 
            v-for="format in formats" 
            :key="format.value"
            @click="selectedFormat = format.value"
            class="p-3 rounded-lg border-2 transition-all text-center"
            :class="selectedFormat === format.value ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 hover:border-gray-300'"
          >
            <span class="material-symbols-outlined text-xl">{{ format.icon }}</span>
            <p class="text-xs font-medium mt-1">{{ format.label }}</p>
          </button>
        </div>
      </div>

      <!-- Convert Button -->
      <button 
        @click="convertFile"
        :disabled="!selectedFile || isConverting"
        class="w-full mt-6 bg-primary text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="isConverting" class="flex items-center justify-center gap-2">
          <span class="material-symbols-outlined animate-spin">sync</span>
          Converting...
        </span>
        <span v-else>Convert Now</span>
      </button>

      <!-- Download -->
      <div v-if="downloadUrl" class="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-green-600">check_circle</span>
            <div>
              <p class="text-sm font-medium text-green-700">Conversion Complete!</p>
              <p class="text-xs text-green-600">Your file is ready to download</p>
            </div>
          </div>
          <a :href="downloadUrl" download class="px-4 py-2 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700">
            Download
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)
const isDragging = ref(false)
const isConverting = ref(false)
const downloadUrl = ref('')
const selectedFormat = ref('svg')

const formats = [
  { value: 'svg', label: 'SVG', icon: 'image' },
  { value: 'png', label: 'PNG', icon: 'image' },
  { value: 'pdf', label: 'PDF', icon: 'picture_as_pdf' },
  { value: 'ai', label: 'AI', icon: 'auto_awesome' }
]

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files?.[0]) {
    selectedFile.value = target.files[0]
  }
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  if (event.dataTransfer?.files?.[0]) {
    selectedFile.value = event.dataTransfer.files[0]
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const convertFile = async () => {
  if (!selectedFile.value) return
  
  isConverting.value = true
  downloadUrl.value = ''
  
  try {
    // Step 1: Upload file
    const uploadFormData = new FormData()
    uploadFormData.append('file', selectedFile.value)
    
    const uploadResponse = await fetch('http://localhost:5000/upload', {
      method: 'POST',
      body: uploadFormData
    })
    
    if (!uploadResponse.ok) throw new Error('Upload failed')
    
    const uploadData = await uploadResponse.json()
    
    // Step 2: Convert file
    const convertResponse = await fetch('http://localhost:5000/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job_id: uploadData.job_id,
        filename: uploadData.filename,
        format: selectedFormat.value
      })
    })
    
    if (!convertResponse.ok) throw new Error('Conversion failed')
    
    const convertData = await convertResponse.json()
    
    // Step 3: Set download URL
    downloadUrl.value = 'http://localhost:5000' + convertData.download_url
    
  } catch (error) {
    console.error('Conversion error:', error)
    alert('Conversion failed. Please try again.')
  } finally {
    isConverting.value = false
  }
}

useHead({
  title: 'CDR Converter - DigiKraft Tools'
})
</script>
