<template>
  <div :class="containerClass">
    <!-- Product Card Skeleton -->
    <div v-if="type === 'product-card'" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <!-- Image Skeleton -->
      <div class="aspect-square bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse"></div>
      
      <!-- Content Skeleton -->
      <div class="p-4 space-y-3">
        <!-- Title -->
        <div class="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse"></div>
        <div class="h-4 w-3/4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse"></div>
        
        <!-- Rating -->
        <div class="flex gap-1">
          <div v-for="i in 5" :key="i" class="w-4 h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse"></div>
        </div>
        
        <!-- Price -->
        <div class="flex justify-between items-end">
          <div class="h-6 w-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse"></div>
          <div class="h-4 w-16 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>

    <!-- Text Skeleton -->
    <div v-else-if="type === 'text'" class="space-y-2">
      <div v-for="i in lines" :key="i" class="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse" :style="{ width: i === lines ? '60%' : '100%' }"></div>
    </div>

    <!-- Heading Skeleton -->
    <div v-else-if="type === 'heading'" class="space-y-2">
      <div class="h-8 w-1/2 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse"></div>
      <div class="h-4 w-3/4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse"></div>
    </div>

    <!-- Image Skeleton -->
    <div v-else-if="type === 'image'" class="bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse" :style="{ aspectRatio: aspectRatio }"></div>

    <!-- Button Skeleton -->
    <div v-else-if="type === 'button'" class="h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-pulse"></div>

    <!-- Grid Skeleton -->
    <div v-else-if="type === 'grid'" class="grid gap-4" :style="{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }">
      <div v-for="i in count" :key="i" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="aspect-square bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse"></div>
        <div class="p-4 space-y-3">
          <div class="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse"></div>
          <div class="h-4 w-3/4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse"></div>
          <div class="h-6 w-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  type?: 'product-card' | 'text' | 'heading' | 'image' | 'button' | 'grid'
  lines?: number
  count?: number
  columns?: number
  aspectRatio?: string
  containerClass?: string
}>(), {
  type: 'text',
  lines: 3,
  count: 6,
  columns: 3,
  aspectRatio: '1',
  containerClass: ''
})
</script>

<style scoped>
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
