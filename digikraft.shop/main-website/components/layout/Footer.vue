<template>
  <footer class="bg-white pt-24 pb-12 px-6 lg:px-12 border-t border-gray-100">
    <div class="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
      <!-- Brand -->
      <div>
        <div class="flex items-center gap-2 mb-8">
          <div class="size-6 bg-primary rounded-md flex items-center justify-center">
            <span class="material-symbols-outlined text-white text-[14px]">bolt</span>
          </div>
          <h3 class="text-gray-900 font-bold uppercase text-xs tracking-widest">DigiKraft</h3>
        </div>
        <p class="text-slate-500 text-sm leading-relaxed mb-8">
          The premier destination for elite digital assets and professional creative resources.
        </p>
        <div class="flex items-center gap-4">
          <a 
            v-for="social in socials" 
            :key="social.icon" 
            :href="social.href"
            class="size-10 border border-gray-100 rounded-lg flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary/20 transition-all-300"
          >
            <span class="material-symbols-outlined text-lg">{{ social.icon }}</span>
          </a>
        </div>
      </div>

      <!-- Links -->
      <div v-for="section in footerSections" :key="section.title">
        <h4 class="text-gray-900 font-bold mb-8 uppercase text-xs tracking-widest">{{ section.title }}</h4>
        <ul class="space-y-4 text-sm text-slate-500">
          <li v-for="link in section.links" :key="link.name">
            <NuxtLink :to="link.href" class="hover:text-primary transition-all-300">
              {{ link.name }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>

    <div class="max-w-7xl mx-auto pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8">
      <p class="text-slate-600 text-[10px] uppercase font-bold tracking-widest">
        © 2024 DigiKraft.shop - All rights reserved.
      </p>
      <div class="flex items-center gap-6 opacity-40 text-gray-400">
        <span class="material-symbols-outlined text-3xl">payments</span>
        <span class="material-symbols-outlined text-3xl">credit_card</span>
        <span class="material-symbols-outlined text-3xl">account_balance_wallet</span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const socials = [
  { icon: 'public', href: '#' },
  { icon: 'alternate_email', href: '#' },
  { icon: 'campaign', href: '#' }
]

const footerSections = [
  {
    title: 'Shop',
    links: [
      { name: 'Browse All', href: '/products' },
      { name: 'Featured Items', href: '/featured' },
      { name: 'New Releases', href: '/new' },
      { name: 'Hub Exclusive', href: '/hubs' }
    ]
  },
  {
    title: 'Support',
    links: [
      { name: 'Help Center', href: '/help' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Licensing', href: '/licensing' },
      { name: 'Privacy Policy', href: '/privacy' }
    ]
  },
  {
    title: 'Account',
    links: [
      { name: 'My Dashboard', href: '/account' },
      { name: 'Purchases', href: '/purchases' },
      { name: 'DigiProfile', href: '/digiprofile' },
      { name: 'Become a Seller', href: '/sell' },
      { name: 'Affiliate Program', href: '/affiliate' }
    ]
  }
]
</script>
