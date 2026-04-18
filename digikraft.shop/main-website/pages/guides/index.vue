<template>
  <div class="container mx-auto px-4 py-12">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-bold mb-4">Help & Guides</h1>
      <p class="text-gray-600 mb-12">Everything you need to know about using DigiKraft.shop</p>

      <div class="grid gap-6">
        <NuxtLink
          v-for="guide in guides"
          :key="guide._path"
          :to="guide._path"
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all group"
        >
          <div class="flex items-start gap-4">
            <span class="material-symbols-outlined text-primary text-3xl">
              {{ guide.icon || 'article' }}
            </span>
            <div class="flex-1">
              <h2 class="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                {{ guide.title }}
              </h2>
              <p class="text-gray-600">{{ guide.description }}</p>
            </div>
            <span class="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">
              arrow_forward
            </span>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { getAllGuides } = useGuides()
const guides = await getAllGuides()

useHead({
  title: 'Help & Guides - DigiKraft.shop',
  meta: [
    { name: 'description', content: 'Everything you need to know about using DigiKraft.shop' }
  ]
})
</script>
