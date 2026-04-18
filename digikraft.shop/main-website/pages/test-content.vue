<template>
  <div class="container mx-auto px-4 py-12">
    <h1 class="text-3xl font-bold mb-8">Content Test Page</h1>
    
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-xl font-bold mb-4">All Content (any path)</h2>
      <pre class="bg-gray-100 p-4 rounded overflow-auto text-xs">{{ JSON.stringify(allContent, null, 2) }}</pre>
    </div>

    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-xl font-bold mb-4">Blog Content (blog path)</h2>
      <pre class="bg-gray-100 p-4 rounded overflow-auto text-xs">{{ JSON.stringify(blogContent, null, 2) }}</pre>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-bold mb-4">Stats</h2>
      <p class="text-lg">All Content: {{ allContent?.length || 0 }} items</p>
      <p class="text-lg">Blog Content: {{ blogContent?.length || 0 }} posts</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: []
})

// Query ALL content
const { data: allContent } = await useAsyncData('test-all', () =>
  queryContent().find()
)

// Query blog specifically
const { data: blogContent } = await useAsyncData('test-blog', () =>
  queryContent('blog').find()
)
</script>
