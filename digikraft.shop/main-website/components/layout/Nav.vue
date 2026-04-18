<template>
  <nav class="bg-white border-b border-gray-100 px-6 lg:px-12 py-0 flex items-center gap-8 overflow-x-auto whitespace-nowrap scrollbar-hide sticky top-[90px] z-[95] shadow-sm">
    <!-- Home Link -->
    <NuxtLink 
      to="/"
      :class="['text-xs font-bold uppercase tracking-wider transition-colors py-2.5', route.path === '/' ? 'text-primary' : 'text-gray-800 hover:text-primary']"
    >
      Home
    </NuxtLink>

    <!-- Category Links -->
    <NuxtLink 
      to="/category/graphics"
      :class="['text-xs font-bold uppercase tracking-wider transition-colors py-2.5', route.path.includes('/category/graphics') ? 'text-primary' : 'text-gray-800 hover:text-primary']"
    >
      Graphics
    </NuxtLink>
    <NuxtLink 
      to="/category/fonts"
      :class="['text-xs font-bold uppercase tracking-wider transition-colors py-2.5', route.path.includes('/category/fonts') ? 'text-primary' : 'text-gray-800 hover:text-primary']"
    >
      Fonts
    </NuxtLink>
    <NuxtLink 
      to="/category/templates"
      :class="['text-xs font-bold uppercase tracking-wider transition-colors py-2.5', route.path.includes('/category/templates') ? 'text-primary' : 'text-gray-800 hover:text-primary']"
    >
      Templates
    </NuxtLink>
    <NuxtLink 
      to="/category/3d"
      :class="['text-xs font-bold uppercase tracking-wider transition-colors py-2.5', route.path.includes('/category/3d') ? 'text-primary' : 'text-gray-800 hover:text-primary']"
    >
      3D
    </NuxtLink>

    <!-- Hub Links -->
    <NuxtLink 
      to="/hub/coreldraw"
      :class="['text-xs font-bold uppercase tracking-wider transition-colors py-2.5', route.path.startsWith('/hub/coreldraw') ? 'text-primary' : 'text-gray-800 hover:text-primary']"
    >
      CorelDRAW
    </NuxtLink>
    <NuxtLink 
      to="/hub/ai-workflow"
      :class="['text-xs font-bold uppercase tracking-wider transition-colors py-2.5', route.path.startsWith('/hub/ai-workflow') ? 'text-primary' : 'text-gray-800 hover:text-primary']"
    >
      AI Workflow
    </NuxtLink>
    <NuxtLink 
      to="/hub/design-arsenal"
      :class="['text-xs font-bold uppercase tracking-wider transition-colors py-2.5', route.path.startsWith('/hub/design-arsenal') ? 'text-primary' : 'text-gray-800 hover:text-primary']"
    >
      Design Arsenal
    </NuxtLink>

    <!-- Blog Link - Extreme Right -->
    <NuxtLink 
      to="/blog"
      :class="['text-xs font-bold uppercase tracking-wider transition-colors py-2.5 ml-auto', route.path.startsWith('/blog') ? 'text-primary' : 'text-gray-800 hover:text-primary']"
    >
      Blog
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()
</script>
