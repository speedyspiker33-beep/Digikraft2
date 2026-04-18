<template>
  <section class="py-24 bg-gradient-to-b from-white to-gray-50 px-6 lg:px-12 relative overflow-hidden">
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-bold text-gray-900 mb-4">
          Explore Our <span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Ecosystem Hubs</span>
        </h2>
        <p class="text-slate-500 max-w-2xl mx-auto">
          Curated collections of premium assets tailored for specific creative workflows
        </p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div 
          v-for="hub in hubs" 
          :key="hub.name"
          class="group relative bg-white p-10 rounded-2xl border-2 border-gray-100 hover:border-primary/30 transition-all duration-500 shadow-sm hover:shadow-2xl cursor-pointer overflow-hidden hover:-translate-y-2"
          @click="navigateTo(hub.href)"
        >
          <!-- Animated Background Gradient -->
          <div :class="['absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500', hub.iconBg]"></div>
          
          <div 
            class="relative size-16 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg"
            :class="hub.iconBg"
          >
            <span class="material-symbols-outlined text-3xl" :class="hub.iconColor">
              {{ hub.icon }}
            </span>
          </div>
          
          <h3 class="relative text-xl font-bold text-gray-900 mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all">
            {{ hub.name }}
          </h3>
          
          <p class="relative text-slate-500 text-sm leading-relaxed mb-8">{{ hub.description }}</p>
          
          <NuxtLink 
            :to="hub.href"
            class="relative flex items-center gap-2 text-xs font-bold uppercase transition-all duration-300 tracking-wider group-hover:scale-105"
            :class="hub.buttonClass"
          >
            Explore Hub 
            <span class="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </NuxtLink>

          <!-- Decorative Element -->
          <div :class="['absolute -bottom-10 -right-10 size-32 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity', hub.iconBg]"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const hubs = [
  {
    name: 'CorelDRAW Hub',
    description: 'Access exclusive brushes, templates, and high-quality vector resources curated specifically for CorelDRAW professionals.',
    icon: 'draw',
    iconBg: 'bg-primary/20 shadow-primary/10',
    iconColor: 'text-primary',
    buttonClass: 'text-gray-900 hover:text-primary',
    href: '/hub/coreldraw'
  },
  {
    name: 'AI Workflow',
    description: 'Supercharge your creative process with AI-driven prompts, training data sets, and automation scripts for top LLMs.',
    icon: 'smart_toy',
    iconBg: 'bg-fuchsia-500/20 shadow-fuchsia-500/10',
    iconColor: 'text-fuchsia-500',
    buttonClass: 'text-gray-900 hover:text-fuchsia-500',
    href: '/hub/ai-workflow'
  },
  {
    name: 'Design Arsenal',
    description: 'The heavy artillery of design. Textures, 3D objects, and motion graphics packages for professional studios.',
    icon: 'category',
    iconBg: 'bg-cyan-500/20 shadow-cyan-500/10',
    iconColor: 'text-cyan-500',
    buttonClass: 'text-gray-900 hover:text-cyan-500',
    href: '/hub/design-arsenal'
  }
]
</script>
