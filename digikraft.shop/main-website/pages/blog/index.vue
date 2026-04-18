<template>
  <div class="container mx-auto px-4 py-6">
    <div class="max-w-4xl mx-auto">
      <!-- Articles Grid -->
      <div v-if="posts && posts.length > 0" class="grid gap-6">
        <article 
          v-for="post in posts" 
          :key="post._path"
          class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
        >
          <NuxtLink :to="post._path" class="block">
            <img 
              :src="post.image" 
              :alt="post.title" 
              class="w-full h-64 object-cover"
            />
            <div class="p-6">
              <div class="flex items-center gap-4 text-sm text-gray-500 mb-3">
                <span>{{ formatDate(post.date) }}</span>
                <span>•</span>
                <span>{{ post.category }}</span>
              </div>
              <h2 class="text-2xl font-bold mb-3 hover:text-primary transition-colors">
                {{ post.title }}
              </h2>
              <p class="text-gray-600 mb-4">{{ post.description }}</p>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="tag in post.tags" 
                  :key="tag"
                  class="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </NuxtLink>
        </article>
      </div>

      <div v-else class="text-center py-12">
        <p class="text-gray-500 text-lg">No blog posts found. Check back soon!</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: []  // Disable auth middleware for blog
})

const { getAllPosts } = useBlog()
const posts = await getAllPosts()

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

useHead({
  title: 'Blog & Articles - DigiKraft.shop',
  meta: [
    { name: 'description', content: 'Design tips, trends, and inspiration for creative professionals' }
  ]
})
</script>
