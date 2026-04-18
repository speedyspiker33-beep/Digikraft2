<template>
  <div class="container mx-auto px-6 py-8">
    <div class="max-w-2xl mx-auto text-center py-20">
      <div class="size-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <span class="material-symbols-outlined text-5xl text-primary">construction</span>
      </div>
      <h1 class="text-3xl font-bold text-gray-900 mb-4">Coming Soon</h1>
      <p class="text-gray-600 mb-8">We're working on this page. Check back soon!</p>
      <NuxtLink 
        to="/"
        class="inline-block bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
      >
        Go Home
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Coming Soon - DigiKraft'
})
</script>
