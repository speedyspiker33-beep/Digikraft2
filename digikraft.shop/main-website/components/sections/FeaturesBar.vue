<template>
  <section class="py-16 border-y border-gray-100 bg-white">
    <div class="max-w-7xl mx-auto px-6 lg:px-12">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-12">
        <div 
          v-for="feature in features" 
          :key="feature.title"
          class="flex items-center gap-4 group"
        >
          <div class="size-10 rounded-full border border-gray-100 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all-300">
            <span class="material-symbols-outlined">{{ feature.icon }}</span>
          </div>
          <div>
            <p class="text-gray-900 font-bold text-sm">{{ feature.title }}</p>
            <p class="text-slate-500 text-xs">{{ feature.subtitle }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const features = [
  { icon: 'bolt', title: 'Instant Delivery', subtitle: 'Immediate download' },
  { icon: 'verified_user', title: 'Secure Payments', subtitle: 'SSL Encryption' },
  { icon: 'update', title: 'Lifetime Updates', subtitle: 'Always fresh' },
  { icon: 'support_agent', title: '24/7 Support', subtitle: 'Live expert help' }
]
</script>
