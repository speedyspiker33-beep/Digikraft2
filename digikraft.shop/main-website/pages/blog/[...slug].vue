<template>
  <div class="container mx-auto px-4 py-12">
    <article v-if="page" class="max-w-3xl mx-auto">
      <!-- Header -->
      <header class="mb-8">
        <NuxtLink to="/blog" class="text-primary hover:underline mb-4 inline-block">
          ← Back to Blog
        </NuxtLink>
        <h1 class="text-4xl font-bold mb-4">{{ page.title }}</h1>
        <div class="flex items-center gap-4 text-gray-600">
          <span>{{ formatDate(page.date) }}</span>
          <span>•</span>
          <span>{{ page.category }}</span>
          <span>•</span>
          <span>By {{ page.author }}</span>
        </div>
      </header>

      <!-- Featured Image -->
      <img 
        v-if="page.image"
        :src="page.image" 
        :alt="page.title" 
        class="w-full h-96 object-cover rounded-xl mb-8"
      />

      <!-- Content -->
      <div class="prose prose-lg max-w-none">
        <ContentRenderer :value="page" />
      </div>

      <!-- Tags -->
      <div v-if="page.tags" class="mt-12 pt-8 border-t">
        <h3 class="font-bold mb-4">Tags</h3>
        <div class="flex flex-wrap gap-2">
          <span 
            v-for="tag in page.tags" 
            :key="tag"
            class="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm"
          >
            {{ tag }}
          </span>
        </div>
      </div>
    </article>
    <div v-else class="max-w-3xl mx-auto text-center py-12">
      <h1 class="text-2xl font-bold mb-4">Post Not Found</h1>
      <NuxtLink to="/blog" class="text-primary hover:underline">
        ← Back to Blog
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { getPost } = useBlog()

const page = await getPost(route.params.slug as string)

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

useHead({
  title: `${page.value?.title} - DigiKraft.shop`,
  meta: [
    { name: 'description', content: page.value?.description }
  ]
})
</script>

<style>
.prose {
  @apply text-gray-700;
}

.prose h2 {
  @apply text-2xl font-bold mt-8 mb-4;
}

.prose h3 {
  @apply text-xl font-bold mt-6 mb-3;
}

.prose p {
  @apply mb-4 leading-relaxed;
}

.prose ul, .prose ol {
  @apply mb-4 ml-6;
}

.prose li {
  @apply mb-2;
}

.prose a {
  @apply text-primary hover:underline;
}
</style>
