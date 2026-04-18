<template>
  <div class="product-tabs">
    <!-- Tab Navigation -->
    <div class="border-b border-gray-200 mb-8">
      <div class="flex gap-8 overflow-x-auto">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'pb-4 px-2 font-bold transition-all whitespace-nowrap flex items-center gap-2',
            activeTab === tab.id 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-gray-500 hover:text-gray-700'
          ]"
        >
          <span class="material-symbols-outlined text-sm">{{ tab.icon }}</span>
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="min-h-[400px]">
      <!-- Description Tab -->
      <div v-if="activeTab === 'description'" class="prose max-w-none">
        <div class="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-200">
          <h3 class="text-2xl font-bold text-gray-900 mb-6">Product Description</h3>
          <p class="text-gray-600 leading-relaxed text-lg mb-6">{{ product.description }}</p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div class="bg-white rounded-xl p-6 border border-gray-200">
              <h4 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span class="material-symbols-outlined text-primary">info</span>
                Key Features
              </h4>
              <ul class="space-y-2 text-gray-600">
                <li class="flex items-center gap-2">
                  <span class="text-primary">•</span> High-quality digital assets
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-primary">•</span> Easy to customize and use
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-primary">•</span> Professional grade quality
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-primary">•</span> Regular updates included
                </li>
              </ul>
            </div>
            
            <div class="bg-white rounded-xl p-6 border border-gray-200">
              <h4 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span class="material-symbols-outlined text-primary">description</span>
                File Details
              </h4>
              <ul class="space-y-2 text-gray-600">
                <li v-if="product.digitalMetadata?.fileFormats" class="flex items-center gap-2">
                  <span class="text-primary">•</span> Formats: {{ product.digitalMetadata.fileFormats.join(', ') }}
                </li>
                <li v-if="product.digitalMetadata?.fileSize" class="flex items-center gap-2">
                  <span class="text-primary">•</span> Size: {{ product.digitalMetadata.fileSize }}
                </li>
                <li v-if="product.digitalMetadata?.totalFiles" class="flex items-center gap-2">
                  <span class="text-primary">•</span> {{ product.digitalMetadata.totalFiles }} files included
                </li>
                <li v-if="product.digitalMetadata?.includesDocumentation" class="flex items-center gap-2">
                  <span class="text-primary">•</span> Documentation included
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Files Tab -->
      <div v-if="activeTab === 'files'" class="space-y-4">
        <div class="bg-gradient-to-br from-primary/5 to-blue-50 rounded-2xl p-8 border border-primary/20">
          <h3 class="text-2xl font-bold text-gray-900 mb-6">Included Files</h3>
          <p class="text-gray-600 mb-6">
            This product includes {{ product.digitalMetadata?.totalFiles || 'multiple' }} files 
            totaling {{ product.digitalMetadata?.fileSize || '~50 MB' }}
          </p>
          
          <div class="space-y-3">
            <div 
              v-for="(format, index) in product.digitalMetadata?.fileFormats || ['ZIP', 'PDF']" 
              :key="index"
              class="bg-white rounded-xl p-4 border border-gray-200 flex items-center gap-4"
            >
              <div class="size-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <span class="material-symbols-outlined text-primary">description</span>
              </div>
              <div class="flex-1">
                <h4 class="font-bold text-gray-900">{{ format }} Files</h4>
                <p class="text-sm text-gray-500">High-quality {{ format }} format</p>
              </div>
              <span class="text-sm font-medium text-gray-600">Available after purchase</span>
            </div>
          </div>
        </div>

        <div v-if="product.digitalMetadata?.includesSourceFiles" class="bg-white rounded-xl p-6 border border-gray-200">
          <div class="flex items-start gap-3">
            <div class="size-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-green-600">check_circle</span>
            </div>
            <div>
              <h4 class="font-bold text-gray-900 mb-2">Source Files Included</h4>
              <p class="text-gray-600">Editable source files are included so you can customize everything to your needs.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Reviews Tab -->
      <div v-if="activeTab === 'reviews'" class="space-y-6">
        <!-- Rating Summary -->
        <div class="bg-gradient-to-br from-primary/5 to-blue-50 rounded-2xl p-8 border border-primary/20">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="text-center">
              <div class="text-6xl font-bold text-primary mb-2">{{ product.rating }}</div>
              <div class="flex items-center justify-center gap-1 mb-2">
                <span v-for="i in 5" :key="i" class="text-yellow-400 text-2xl">★</span>
              </div>
              <p class="text-gray-600">Based on {{ product.reviewCount }} reviews</p>
            </div>
            
            <div class="space-y-2">
              <div v-for="star in [5,4,3,2,1]" :key="star" class="flex items-center gap-3">
                <span class="text-sm font-medium text-gray-700 w-12">{{ star }} star</span>
                <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div class="h-full bg-yellow-400 rounded-full" :style="{ width: `${star * 20}%` }"></div>
                </div>
                <span class="text-sm text-gray-500 w-12 text-right">{{ star * 20 }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Individual Reviews -->
        <div class="space-y-4">
          <h3 class="text-2xl font-bold text-gray-900">Customer Reviews</h3>
          <div v-for="i in 3" :key="i" class="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all">
            <div class="flex items-start gap-4">
              <div class="size-12 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                U{{ i }}
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-bold text-gray-900">User {{ i }}</h4>
                  <span class="text-sm text-gray-500">{{ i * 2 }} days ago</span>
                </div>
                <div class="flex items-center gap-1 mb-3">
                  <span v-for="j in 5" :key="j" class="text-yellow-400">★</span>
                </div>
                <p class="text-gray-600 leading-relaxed">Great product! Highly recommended for professional use. The quality is outstanding and the files are well-organized.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- License Tab -->
      <div v-if="activeTab === 'license'" class="space-y-6">
        <div class="bg-gradient-to-br from-primary/5 to-blue-50 rounded-2xl p-8 border border-primary/20">
          <div class="flex items-start gap-4 mb-6">
            <div class="size-16 bg-primary/20 rounded-xl flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-primary text-3xl">verified</span>
            </div>
            <div>
              <h3 class="text-2xl font-bold text-gray-900 mb-2">
                {{ product.license?.type || 'Commercial' }} License
              </h3>
              <p class="text-gray-600">
                {{ product.license?.description || 'Use in unlimited personal and commercial projects' }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-white rounded-xl p-4 border border-gray-200">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-green-600">check_circle</span>
                <span class="font-medium text-gray-900">Commercial Use Allowed</span>
              </div>
            </div>
            <div class="bg-white rounded-xl p-4 border border-gray-200">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-green-600">check_circle</span>
                <span class="font-medium text-gray-900">Unlimited Projects</span>
              </div>
            </div>
            <div class="bg-white rounded-xl p-4 border border-gray-200">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-green-600">check_circle</span>
                <span class="font-medium text-gray-900">Lifetime Updates</span>
              </div>
            </div>
            <div class="bg-white rounded-xl p-4 border border-gray-200">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-green-600">check_circle</span>
                <span class="font-medium text-gray-900">No Attribution Required</span>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl p-6 border border-gray-200">
          <h4 class="font-bold text-gray-900 mb-4">License Terms</h4>
          <div class="space-y-3 text-gray-600">
            <p>✓ Use in personal and commercial projects</p>
            <p>✓ Modify and customize as needed</p>
            <p>✓ Use for client work</p>
            <p>✗ Resell or redistribute as-is</p>
            <p>✗ Share with others who haven't purchased</p>
          </div>
        </div>
      </div>

      <!-- Specifications Tab -->
      <div v-if="activeTab === 'specs'" class="bg-white rounded-2xl p-8 border border-gray-200">
        <h3 class="text-2xl font-bold text-gray-900 mb-6">Technical Specifications</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div class="flex items-center justify-between py-3 border-b border-gray-100">
              <span class="text-gray-600">File Type</span>
              <span class="font-bold text-gray-900">Digital Download</span>
            </div>
            <div class="flex items-center justify-between py-3 border-b border-gray-100">
              <span class="text-gray-600">File Size</span>
              <span class="font-bold text-gray-900">{{ product.digitalMetadata?.fileSize || '~50 MB' }}</span>
            </div>
            <div class="flex items-center justify-between py-3 border-b border-gray-100">
              <span class="text-gray-600">File Formats</span>
              <span class="font-bold text-gray-900">{{ product.digitalMetadata?.fileFormats?.join(', ') || 'Multiple' }}</span>
            </div>
            <div class="flex items-center justify-between py-3 border-b border-gray-100">
              <span class="text-gray-600">Compatibility</span>
              <span class="font-bold text-gray-900">{{ product.digitalMetadata?.compatibility?.join(', ') || 'All Platforms' }}</span>
            </div>
          </div>
          <div class="space-y-4">
            <div class="flex items-center justify-between py-3 border-b border-gray-100">
              <span class="text-gray-600">License Type</span>
              <span class="font-bold text-gray-900">{{ product.license?.type || 'Commercial' }}</span>
            </div>
            <div class="flex items-center justify-between py-3 border-b border-gray-100">
              <span class="text-gray-600">Updates</span>
              <span class="font-bold text-primary">{{ product.digitalMetadata?.updateFrequency || 'Lifetime' }}</span>
            </div>
            <div class="flex items-center justify-between py-3 border-b border-gray-100">
              <span class="text-gray-600">Version</span>
              <span class="font-bold text-gray-900">{{ product.digitalMetadata?.version || '1.0.0' }}</span>
            </div>
            <div class="flex items-center justify-between py-3 border-b border-gray-100">
              <span class="text-gray-600">Support</span>
              <span class="font-bold text-gray-900">24/7</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Articles Tab -->
      <div v-if="activeTab === 'articles'" class="space-y-6">
        <div class="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
          <h3 class="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <span class="material-symbols-outlined text-primary">article</span>
            Related Articles & Guides
          </h3>
          <p class="text-gray-500 text-sm mb-6">Tutorials, guides and articles related to this product</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <NuxtLink
              v-for="post in product.linked_blog_posts"
              :key="post.slug"
              :to="`/blog/${post.slug}`"
              class="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              <div v-if="post.image" class="aspect-video overflow-hidden">
                <img :src="post.image" :alt="post.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
              </div>
              <div v-else class="aspect-video bg-gradient-to-br from-primary/10 to-purple-100 flex items-center justify-center">
                <span class="material-symbols-outlined text-5xl text-primary/40">article</span>
              </div>
              <div class="p-5 flex flex-col flex-1">
                <div class="flex items-center gap-2 mb-3">
                  <span v-if="post.category" class="px-2.5 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">{{ post.category }}</span>
                  <span v-if="post.read_time" class="text-xs text-gray-400 flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm">schedule</span>
                    {{ post.read_time }} min read
                  </span>
                </div>
                <h4 class="font-bold text-gray-900 text-base leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {{ post.title }}
                </h4>
                <p v-if="post.excerpt" class="text-sm text-gray-500 leading-relaxed line-clamp-2 flex-1">{{ post.excerpt }}</p>
                <div class="mt-4 flex items-center gap-1 text-primary text-sm font-bold">
                  Read Article
                  <span class="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types'

interface Props {
  product: Product
}

const props = defineProps<Props>()

const activeTab = ref('description')

const tabs = computed(() => {
  const base = [
    { id: 'description', label: 'Description', icon: 'description' },
    { id: 'files', label: 'Files', icon: 'folder' },
    { id: 'reviews', label: 'Reviews', icon: 'star' },
    { id: 'license', label: 'License', icon: 'verified' },
    { id: 'specs', label: 'Specifications', icon: 'info' }
  ]
  if (props.product?.linked_blog_posts?.length) {
    base.push({ id: 'articles', label: `Articles (${props.product.linked_blog_posts.length})`, icon: 'article' })
  }
  return base
})
</script>
