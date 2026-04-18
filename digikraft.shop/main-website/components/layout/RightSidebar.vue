<template>
  <aside v-if="cfg.rightSidebar.enabled" class="w-[260px] shrink-0 space-y-4 hidden lg:block overflow-hidden">

    <!-- ANNOUNCEMENT PROMO BANNER (admin controlled) -->
    <div v-if="cfg.rightSidebar.sections.promo.enabled && cfg.rightSidebar.promo?.title && cfg.rightSidebar.promo?.description"
      class="rounded-xl shadow-sm p-4 text-white overflow-hidden"
      :style="`background:${cfg.rightSidebar.promo.bgColor||'#6366f1'}`">
      <div v-if="cfg.rightSidebar.promo.image" class="mb-3 rounded-lg overflow-hidden">
        <img :src="cfg.rightSidebar.promo.image" class="w-full h-24 object-cover" />
      </div>
      <h3 class="text-sm font-bold mb-1 truncate">{{ cfg.rightSidebar.promo.title }}</h3>
      <p v-if="cfg.rightSidebar.promo.description" class="text-xs opacity-90 mb-3 line-clamp-2">{{ cfg.rightSidebar.promo.description }}</p>
      <NuxtLink v-if="cfg.rightSidebar.promo.link" :to="cfg.rightSidebar.promo.link"
        class="block text-center bg-white/20 hover:bg-white/30 border border-white/30 text-white font-bold py-1.5 rounded-lg text-xs transition-all">
        {{ cfg.rightSidebar.promo.buttonText || 'Shop Now' }}
      </NuxtLink>
    </div>

    <!-- Tools Section -->
    <div v-if="cfg.rightSidebar.sections.tools.enabled" class="bg-white rounded-xl border border-gray-100 p-4">
      <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
        <span class="material-symbols-outlined text-primary" style="font-size:14px">construction</span>
        {{ cfg.rightSidebar.sections.tools.title || 'Tools' }}
      </h3>
      <div class="grid grid-cols-2 gap-2">
        <NuxtLink to="/tools/cdr-converter" class="flex flex-col items-center gap-1 p-2.5 rounded-lg bg-gray-50 hover:bg-primary/10 transition-colors">
          <span class="material-symbols-outlined text-gray-500" style="font-size:20px">swap_horiz</span>
          <span class="text-xs font-medium text-gray-600 text-center leading-tight">CDR Converter</span>
        </NuxtLink>
        <NuxtLink to="/tools/unicode-converter" class="flex flex-col items-center gap-1 p-2.5 rounded-lg bg-gray-50 hover:bg-primary/10 transition-colors">
          <span class="material-symbols-outlined text-gray-500" style="font-size:20px">text_fields</span>
          <span class="text-xs font-medium text-gray-600 text-center leading-tight">Unicode</span>
        </NuxtLink>
        <NuxtLink to="/tools/find-font" class="flex flex-col items-center gap-1 p-2.5 rounded-lg bg-gray-50 hover:bg-primary/10 transition-colors">
          <span class="material-symbols-outlined text-gray-500" style="font-size:20px">font_download</span>
          <span class="text-xs font-medium text-gray-600 text-center leading-tight">Find Font</span>
        </NuxtLink>
        <NuxtLink to="/coming-soon" class="flex flex-col items-center gap-1 p-2.5 rounded-lg bg-gray-50 hover:bg-primary/10 transition-colors">
          <span class="material-symbols-outlined text-gray-500" style="font-size:20px">palette</span>
          <span class="text-xs font-medium text-gray-600 text-center leading-tight">Color Canvas</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Hot Offers (admin controlled) -->
    <div v-if="cfg.rightSidebar.sections.hotOffers.enabled && cfg.rightSidebar.hotOffers?.length"
      class="bg-white rounded-xl border border-gray-100 p-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
          <span class="material-symbols-outlined text-red-500" style="font-size:14px">local_fire_department</span>
          {{ cfg.rightSidebar.sections.hotOffers.title || 'Hot Offers' }}
        </h3>
        <span class="text-xs text-red-500 font-semibold">Limited!</span>
      </div>
      <div class="space-y-3">
        <NuxtLink v-for="offer in cfg.rightSidebar.hotOffers" :key="offer.id"
          :to="offer.link || '/products'" class="group block">
          <div class="relative rounded-lg overflow-hidden mb-1.5">
            <img :src="offer.image" :alt="offer.title" class="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300" />
            <div class="absolute top-1.5 right-1.5 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
              {{ offer.discount }}% OFF
            </div>
          </div>
          <h4 class="text-xs font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">{{ offer.title }}</h4>
          <div class="flex items-center gap-1.5 mt-0.5">
            <span class="text-xs text-gray-400 line-through">₹{{ offer.originalPrice }}</span>
            <span class="text-xs font-bold text-red-500">₹{{ offer.salePrice }}</span>
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- Trending Items (admin controlled) -->
    <div v-if="cfg.rightSidebar.sections.trending.enabled && cfg.rightSidebar.trending?.length"
      class="bg-white rounded-xl border border-gray-100 p-4">
      <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5 mb-3">
        <span class="material-symbols-outlined text-primary" style="font-size:14px">trending_up</span>
        {{ cfg.rightSidebar.sections.trending.title || 'Trending Now' }}
      </h3>
      <div class="space-y-3">
        <NuxtLink v-for="item in cfg.rightSidebar.trending" :key="item.id"
          :to="item.link || '/products'" class="flex gap-2.5 group">
          <img :src="item.image" :alt="item.title"
            class="w-14 h-14 rounded-lg object-cover flex-shrink-0 group-hover:opacity-90 transition-opacity" />
          <div class="flex-1 min-w-0">
            <h4 class="text-xs font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug">{{ item.title }}</h4>
            <div class="flex items-center gap-1 mt-1">
              <span class="material-symbols-outlined text-yellow-400" style="font-size:12px">star</span>
              <span class="text-xs text-gray-600">{{ item.rating }}</span>
              <span class="text-xs text-gray-400 truncate">({{ item.sales }})</span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- Blog Feed (admin controlled articles) -->
    <div v-if="cfg.rightSidebar.sections.blogFeed.enabled && allBlogPosts.length"
      class="bg-white rounded-xl border border-gray-100 p-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
          <span class="material-symbols-outlined text-purple-500" style="font-size:14px">article</span>
          {{ cfg.rightSidebar.sections.blogFeed.title || 'Latest Articles' }}
        </h3>
        <NuxtLink to="/blog" class="text-xs text-primary font-semibold hover:underline">View all</NuxtLink>
      </div>
      <div class="space-y-3">
        <NuxtLink v-for="post in allBlogPosts.slice(0,3)" :key="post.id"
          :to="post.link || `/blog/${post.slug}`" class="group block">
          <div v-if="post.image" class="rounded-lg overflow-hidden mb-1.5">
            <img :src="post.image" :alt="post.title" class="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
          <h4 class="text-xs font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-0.5">{{ post.title }}</h4>
          <p class="text-xs text-gray-400">{{ formatRelativeDate(post.date) }}</p>
        </NuxtLink>
      </div>
    </div>

    <!-- Newsletter Mini -->
    <div v-if="cfg.rightSidebar.sections.newsletter.enabled"
      class="bg-gradient-to-br from-primary to-blue-700 rounded-xl p-4 text-white overflow-hidden">
      <div class="flex items-center gap-2 mb-2">
        <span class="material-symbols-outlined flex-shrink-0" style="font-size:16px">mail</span>
        <h3 class="text-sm font-bold truncate">{{ cfg.rightSidebar.sections.newsletter.title || 'Stay Updated' }}</h3>
      </div>
      <p class="text-xs opacity-80 mb-3">Get exclusive deals &amp; updates</p>
      <div class="flex gap-2">
        <input
          type="email"
          placeholder="Your email"
          class="min-w-0 flex-1 px-2.5 py-2 rounded-lg text-xs text-gray-900 outline-none placeholder-gray-400"
        />
        <button class="flex-shrink-0 bg-white text-primary w-8 h-8 rounded-lg font-bold hover:shadow-lg transition-all flex items-center justify-center">
          <span class="material-symbols-outlined" style="font-size:16px">send</span>
        </button>
      </div>
    </div>

  </aside>
</template>

<script setup lang="ts">
const { config } = useSiteConfig()
const cfg = config

const allBlogPosts = computed(() => {
  return cfg.value.blog?.articles || []
})

const formatRelativeDate = (date: string) => {
  if (!date) return ''
  const now = new Date()
  const postDate = new Date(date)
  const diffDays = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}
</script>
