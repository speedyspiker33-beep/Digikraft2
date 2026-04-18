<template>
  <div class="container mx-auto px-4 py-12">
    <article v-if="page" class="max-w-3xl mx-auto">
      <NuxtLink to="/guides" class="text-primary hover:underline mb-4 inline-block">
        ← Back to Guides
      </NuxtLink>
      
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div class="flex items-center gap-3 mb-6">
          <span class="material-symbols-outlined text-primary text-4xl">
            {{ page.icon || 'article' }}
          </span>
          <h1 class="text-3xl font-bold">{{ page.title }}</h1>
        </div>

        <div class="prose prose-lg max-w-none">
          <ContentRenderer :value="page" />
        </div>
      </div>
    </article>
    <div v-else class="max-w-3xl mx-auto text-center py-12">
      <h1 class="text-2xl font-bold mb-4">Guide Not Found</h1>
      <NuxtLink to="/guides" class="text-primary hover:underline">
        ← Back to Guides
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { getGuide } = useGuides()

const page = await getGuide(route.params.slug as string)

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

.prose ul {
  @apply mb-4 ml-6 list-disc;
}

.prose ol {
  @apply mb-4 ml-6 list-decimal;
}

.prose li {
  @apply mb-2;
}

.prose a {
  @apply text-primary hover:underline;
}

.prose table {
  @apply w-full border-collapse mb-6;
}

.prose th {
  @apply bg-gray-100 p-3 text-left font-bold border border-gray-200;
}

.prose td {
  @apply p-3 border border-gray-200;
}
</style>
