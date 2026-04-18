<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
    <!-- Story Section - Compact -->
    <section class="py-8 px-6">
      <div class="max-w-4xl mx-auto">
        <div class="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Our Story</h2>
          <div class="space-y-3 text-gray-600 text-sm leading-relaxed">
            <p>
              Founded in 2024, DigiKraft was born from a simple vision: to create a marketplace where designers, 
              developers, and creative professionals can find premium digital assets that elevate their work.
            </p>
            <p>
              We believe that great design shouldn't be limited by access to quality resources. That's why we've 
              built a platform that connects talented creators with professionals who need their work.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Values Section - Compact -->
    <section class="py-6 px-6 bg-white">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-xl font-bold text-gray-900 mb-4 text-center">Our Values</h2>
        <div class="grid md:grid-cols-3 gap-4">
          <div v-for="value in values" :key="value.title" class="text-center p-4 rounded-lg hover:bg-gray-50 transition-all">
            <div class="size-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <span class="material-symbols-outlined text-primary text-xl">{{ value.icon }}</span>
            </div>
            <h3 class="text-base font-bold text-gray-900 mb-2">{{ value.title }}</h3>
            <p class="text-xs text-gray-600">{{ value.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Team Section - Compact -->
    <section class="py-6 px-6">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-xl font-bold text-gray-900 mb-4 text-center">Meet the Team</h2>
        <div class="grid md:grid-cols-4 gap-4">
          <div v-for="member in team" :key="member.name" class="text-center">
            <div class="size-16 bg-gradient-to-br from-primary to-purple-500 rounded-full mx-auto mb-2 flex items-center justify-center">
              <span class="material-symbols-outlined text-white text-2xl">person</span>
            </div>
            <h3 class="font-bold text-gray-900 text-sm mb-1">{{ member.name }}</h3>
            <p class="text-xs text-primary mb-1">{{ member.role }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section - Compact -->
    <section class="py-6 px-6 bg-gradient-to-r from-primary to-blue-700">
      <div class="max-w-4xl mx-auto text-center text-white">
        <h2 class="text-lg font-bold mb-2">Join Our Community</h2>
        <NuxtLink 
          to="/register" 
          class="inline-block bg-white text-primary px-6 py-2 rounded-lg font-medium text-sm hover:shadow-lg transition-all"
        >
          Get Started
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'About Us',
  meta: [
    { name: 'description', content: 'Learn about DigiKraft - your premier destination for elite digital assets and professional creative resources' }
  ]
})

const values = [
  {
    icon: 'verified',
    title: 'Quality First',
    description: 'Every asset is carefully curated to meet professional standards'
  },
  {
    icon: 'groups',
    title: 'Community Driven',
    description: 'Built by creators, for creators, fostering collaboration and growth'
  },
  {
    icon: 'bolt',
    title: 'Innovation',
    description: 'Constantly evolving with the latest design trends and technologies'
  }
]

const team = [
  { name: 'Sarah Johnson', role: 'CEO & Founder', bio: 'Visionary leader with 15 years in digital design' },
  { name: 'Michael Chen', role: 'CTO', bio: 'Tech innovator building scalable platforms' },
  { name: 'Emma Davis', role: 'Head of Design', bio: 'Creative director with award-winning portfolio' },
  { name: 'James Wilson', role: 'Community Manager', bio: 'Connecting creators worldwide' }
]
</script>
