<template>
  <div class="min-h-screen bg-gray-950 text-white">

    <!-- STICKY HEADER -->
    <header class="sticky top-0 z-50 bg-gray-950/95 backdrop-blur border-b border-white/10">
      <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <NuxtLink to="/" class="text-xl font-black">Digi<span class="text-indigo-400">Kraft</span></NuxtLink>
        <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
          <a href="#features" class="hover:text-white transition-colors">Features</a>
          <a href="#demo" class="hover:text-white transition-colors">Demo</a>
          <a href="#testimonials" class="hover:text-white transition-colors">Reviews</a>
          <a href="#faq" class="hover:text-white transition-colors">FAQ</a>
        </nav>
        <a href="#buy" class="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg font-bold text-sm transition-all hover:scale-105 shadow-lg shadow-indigo-500/30">
          Get eCut Now
        </a>
      </div>
    </header>

    <!-- HERO -->
    <section class="relative overflow-hidden py-24 px-6">
      <div class="absolute inset-0 bg-gradient-to-br from-indigo-900/50 via-purple-900/30 to-gray-950"></div>
      <div class="absolute top-20 left-10 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl"></div>
      <div class="relative max-w-7xl mx-auto">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div class="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold px-4 py-2 rounded-full mb-6">
              ⚡ #1 CorelDRAW Plugin for Designers
            </div>
            <h1 class="text-5xl lg:text-6xl font-black leading-tight mb-6">
              eCut Plugin
              <span class="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Supercharge Your CorelDRAW</span>
            </h1>
            <p class="text-xl text-gray-300 leading-relaxed mb-8">
              The most powerful plugin for CorelDRAW. Automate repetitive tasks, create complex designs in seconds, and boost your productivity by 10x with 50+ professional tools.
            </p>
            <div class="flex flex-wrap gap-4 mb-10">
              <a href="#buy" class="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-2xl shadow-indigo-500/30 flex items-center gap-2">
                🛒 Get eCut — ₹2,999
              </a>
              <a href="#demo" class="border border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:bg-white/5 flex items-center gap-2">
                ▶ Watch Demo
              </a>
            </div>
            <div class="flex flex-wrap gap-8">
              <div class="text-center"><div class="text-3xl font-black text-white">50+</div><div class="text-xs text-gray-400">Pro Tools</div></div>
              <div class="text-center"><div class="text-3xl font-black text-white">12k+</div><div class="text-xs text-gray-400">Happy Users</div></div>
              <div class="text-center"><div class="text-3xl font-black text-white">4.9★</div><div class="text-xs text-gray-400">Rating</div></div>
              <div class="text-center"><div class="text-3xl font-black text-white">10x</div><div class="text-xs text-gray-400">Faster</div></div>
            </div>
          </div>
          <!-- Hero Video -->
          <div class="relative">
            <div class="relative rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/20 border border-white/10">
              <div class="aspect-video bg-gray-800 flex items-center justify-center">
                <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0" class="w-full h-full" frameborder="0" allowfullscreen></iframe>
              </div>
            </div>
            <div class="absolute -bottom-4 -right-4 bg-green-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">✓ Works with CorelDRAW X7+</div>
          </div>
        </div>
      </div>
    </section>

    <!-- TRUST BAR -->
    <div class="bg-gray-900/80 border-y border-white/10 py-6 px-6">
      <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400">
        <span class="flex items-center gap-2"><span class="text-green-400">✓</span> Instant Download</span>
        <span class="flex items-center gap-2"><span class="text-green-400">✓</span> Lifetime License</span>
        <span class="flex items-center gap-2"><span class="text-green-400">✓</span> Free Updates</span>
        <span class="flex items-center gap-2"><span class="text-green-400">✓</span> 24/7 Support</span>
        <span class="flex items-center gap-2"><span class="text-green-400">✓</span> 30-Day Money Back</span>
        <span class="flex items-center gap-2"><span class="text-green-400">✓</span> Works Offline</span>
      </div>
    </div>

    <!-- FEATURES -->
    <section id="features" class="py-24 px-6">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <div class="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold px-4 py-2 rounded-full mb-4">🔧 FEATURES</div>
          <h2 class="text-4xl lg:text-5xl font-black mb-4">Everything You Need</h2>
          <p class="text-gray-400 text-lg max-w-2xl mx-auto">50+ professional tools packed into one powerful plugin</p>
        </div>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="feat in features" :key="feat.title" class="bg-gray-800/60 border border-white/10 rounded-2xl p-6 hover:border-indigo-500/50 hover:bg-gray-800 transition-all group cursor-default">
            <div class="text-3xl mb-4">{{ feat.icon }}</div>
            <h3 class="text-lg font-bold mb-2 group-hover:text-indigo-300 transition-colors">{{ feat.title }}</h3>
            <p class="text-gray-400 text-sm leading-relaxed">{{ feat.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- DEMO VIDEO -->
    <section id="demo" class="py-24 px-6 bg-gray-900/50">
      <div class="max-w-5xl mx-auto text-center">
        <div class="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold px-4 py-2 rounded-full mb-6">▶ FULL DEMO VIDEO</div>
        <h2 class="text-4xl lg:text-5xl font-black mb-4">See eCut In Action</h2>
        <p class="text-gray-400 text-lg mb-10">Watch how eCut transforms your CorelDRAW workflow in real-time</p>
        <div class="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10">
          <div class="aspect-video bg-gray-800">
            <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0" class="w-full h-full" frameborder="0" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
          </div>
        </div>
        <p class="text-gray-500 text-sm mt-4">Full tutorial · 15 minutes · No fluff</p>
      </div>
    </section>

    <!-- SCREENSHOTS -->
    <section class="py-24 px-6">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-4xl font-black mb-4">Screenshots</h2>
          <p class="text-gray-400">Real screenshots from eCut Plugin</p>
        </div>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="(shot, i) in screenshots" :key="i" @click="lightboxImg=shot.url" class="relative rounded-xl overflow-hidden border border-white/10 cursor-pointer group hover:border-indigo-500/50 transition-all">
            <img :src="shot.url" :alt="shot.caption" class="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500 bg-gray-800" />
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
              <span class="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity">🔍</span>
            </div>
            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-sm font-medium">{{ shot.caption }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section class="py-24 px-6 bg-gray-900/50">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-14">
          <h2 class="text-4xl font-black mb-4">How It Works</h2>
          <p class="text-gray-400">Get started in 3 simple steps</p>
        </div>
        <div class="space-y-6">
          <div v-for="(step, i) in steps" :key="i" class="flex gap-6 items-start bg-gray-800/40 border border-white/10 rounded-2xl p-6 hover:border-indigo-500/30 transition-all">
            <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center font-black text-2xl flex-shrink-0 shadow-lg shadow-indigo-500/30">{{ i+1 }}</div>
            <div>
              <h3 class="text-xl font-bold mb-2">{{ step.title }}</h3>
              <p class="text-gray-400 leading-relaxed">{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- TESTIMONIALS -->
    <section id="testimonials" class="py-24 px-6">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-14">
          <div class="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 text-xs font-bold px-4 py-2 rounded-full mb-4">⭐ REVIEWS</div>
          <h2 class="text-4xl font-black mb-4">12,000+ Happy Designers</h2>
          <p class="text-gray-400">Real reviews from real users</p>
        </div>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="t in testimonials" :key="t.name" class="bg-gray-800/60 border border-white/10 rounded-2xl p-6 hover:border-yellow-500/30 transition-all">
            <div class="flex items-center gap-1 mb-4">
              <span v-for="s in 5" :key="s" class="text-yellow-400 text-lg">★</span>
            </div>
            <p class="text-gray-300 text-sm leading-relaxed mb-6">"{{ t.text }}"</p>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-sm flex-shrink-0">{{ t.name[0] }}</div>
              <div>
                <div class="font-bold text-sm">{{ t.name }}</div>
                <div class="text-xs text-gray-400">{{ t.role }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section id="faq" class="py-24 px-6 bg-gray-900/50">
      <div class="max-w-3xl mx-auto">
        <div class="text-center mb-14">
          <h2 class="text-4xl font-black mb-4">Frequently Asked Questions</h2>
        </div>
        <div class="space-y-3">
          <div v-for="(item, i) in faq" :key="i" class="bg-gray-800/60 border border-white/10 rounded-xl overflow-hidden">
            <button @click="openFaq = openFaq===i ? null : i" class="w-full flex items-center justify-between p-5 text-left hover:bg-gray-700/40 transition-colors">
              <span class="font-bold">{{ item.q }}</span>
              <span class="text-indigo-400 text-xl transition-transform duration-300" :class="openFaq===i?'rotate-45':''">+</span>
            </button>
            <div v-if="openFaq===i" class="px-5 pb-5 text-gray-400 text-sm leading-relaxed border-t border-white/10 pt-4">{{ item.a }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- BUY SECTION -->
    <section id="buy" class="py-24 px-6 bg-gradient-to-br from-indigo-900/50 to-purple-900/30">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-5xl font-black mb-4">Get eCut Plugin Today</h2>
        <p class="text-gray-300 text-xl mb-12">One-time payment · Lifetime license · Instant download</p>
        <div class="bg-gray-800/80 border border-indigo-500/30 rounded-3xl p-10 shadow-2xl shadow-indigo-500/10 max-w-lg mx-auto">
          <div class="text-gray-400 line-through text-2xl mb-1">₹5,999</div>
          <div class="text-6xl font-black text-white mb-1">₹2,999</div>
          <div class="inline-block bg-green-500/20 text-green-400 text-sm font-bold px-4 py-1 rounded-full mb-8">Save ₹3,000 (50% OFF) · Limited Time</div>
          <ul class="text-left space-y-3 mb-8">
            <li v-for="inc in includes" :key="inc" class="flex items-center gap-3 text-sm">
              <span class="text-green-400 text-lg flex-shrink-0">✓</span>
              <span class="text-gray-300">{{ inc }}</span>
            </li>
          </ul>
          <NuxtLink to="/product/ecut-plugin" class="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-5 rounded-2xl font-black text-xl transition-all hover:scale-105 shadow-2xl shadow-indigo-500/30 mb-4 text-center">
            🛒 Buy eCut Now — ₹2,999
          </NuxtLink>
          <p class="text-xs text-gray-500">30-day money back guarantee · Secure payment · Instant download</p>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="py-10 px-6 border-t border-white/10 text-center text-gray-500 text-sm">
      <NuxtLink to="/" class="text-white font-black text-lg mb-2 block">Digi<span class="text-indigo-400">Kraft</span></NuxtLink>
      <p>© {{ new Date().getFullYear() }} DigiKraft.shop · All rights reserved</p>
      <div class="flex justify-center gap-4 mt-3">
        <NuxtLink to="/terms" class="hover:text-white transition-colors">Terms</NuxtLink>
        <NuxtLink to="/privacy" class="hover:text-white transition-colors">Privacy</NuxtLink>
        <NuxtLink to="/contact" class="hover:text-white transition-colors">Contact</NuxtLink>
      </div>
    </footer>

    <!-- LIGHTBOX -->
    <div v-if="lightboxImg" @click="lightboxImg=null" class="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 cursor-pointer">
      <img :src="lightboxImg" class="max-w-full max-h-full rounded-xl shadow-2xl" @click.stop />
      <button @click="lightboxImg=null" class="absolute top-4 right-4 text-white text-3xl hover:text-gray-300">×</button>
    </div>

  </div>
</template>

<script setup lang="ts">
const openFaq = ref<number|null>(null)
const lightboxImg = ref<string|null>(null)

const features = [
  { icon: '✂️', title: 'Smart Cut Lines', desc: 'Automatically generate perfect cut lines for vinyl cutting, laser cutting, and CNC machines with one click.' },
  { icon: '📐', title: 'Nesting & Layout', desc: 'Optimize material usage with intelligent nesting algorithms. Save up to 40% on material costs.' },
  { icon: '🔤', title: 'Text on Path Pro', desc: 'Advanced text-on-path tools with spacing control, flip, and multi-line support.' },
  { icon: '🎨', title: 'Color Separation', desc: 'Professional color separation for screen printing, spot colors, and multi-layer designs.' },
  { icon: '📏', title: 'Measurement Tools', desc: 'Precise measurement, dimension lines, and scale tools for technical drawings.' },
  { icon: '🔄', title: 'Batch Processing', desc: 'Process hundreds of files automatically. Apply effects, resize, export — all in one go.' },
  { icon: '🖼️', title: 'Image Vectorizer', desc: 'Convert raster images to clean vector paths with AI-powered tracing technology.' },
  { icon: '📦', title: 'Box & Package Maker', desc: 'Create packaging templates, boxes, and die-cut layouts with built-in templates.' },
  { icon: '⚡', title: 'One-Click Actions', desc: 'Assign any action to keyboard shortcuts. Automate your most-used workflows.' },
]

const screenshots = [
  { url: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&h=450&fit=crop', caption: 'Smart Cut Lines Tool' },
  { url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&h=450&fit=crop', caption: 'Nesting & Layout Panel' },
  { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=450&fit=crop', caption: 'Color Separation Module' },
  { url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&h=450&fit=crop', caption: 'Batch Processing Interface' },
  { url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=450&fit=crop', caption: 'Text on Path Pro' },
  { url: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&h=450&fit=crop', caption: 'Box & Package Maker' },
]

const steps = [
  { title: 'Purchase & Download', desc: 'Complete your purchase and instantly download the eCut installer file. No waiting, no delays.' },
  { title: 'Install in CorelDRAW', desc: 'Run the installer and eCut automatically integrates into your CorelDRAW toolbar. Takes less than 2 minutes.' },
  { title: 'Start Creating Faster', desc: 'Access all 50+ tools from the eCut panel. Your workflow will never be the same again.' },
]

const testimonials = [
  { name: 'Rahul Sharma', role: 'Vinyl Cutter, Mumbai', rating: 5, text: 'eCut completely transformed my vinyl cutting business. The nesting tool alone saves me 2 hours every day. Best investment I ever made.' },
  { name: 'Priya Patel', role: 'Graphic Designer, Ahmedabad', rating: 5, text: 'The color separation feature is incredible. I used to spend 30 minutes on each job, now it takes 2 minutes. My clients love the results.' },
  { name: 'Amit Kumar', role: 'Sign Maker, Delhi', rating: 5, text: 'I was skeptical at first but eCut exceeded all my expectations. The cut line generator is perfect for my laser cutter.' },
  { name: 'Sneha Reddy', role: 'Packaging Designer, Hyderabad', rating: 5, text: 'The box maker template library is amazing. I create professional packaging designs in minutes now.' },
  { name: 'Vikram Singh', role: 'Screen Printer, Jaipur', rating: 5, text: 'Color separation used to be my biggest bottleneck. eCut solved it completely. Highly recommended!' },
  { name: 'Meera Nair', role: 'Freelance Designer, Kochi', rating: 5, text: 'The batch processing feature is a game changer. I process 200+ files overnight automatically. Incredible tool.' },
]

const faq = [
  { q: 'Which versions of CorelDRAW does eCut support?', a: 'eCut works with CorelDRAW X7, X8, 2017, 2018, 2019, 2020, 2021, 2022, 2023, and 2024. Both 32-bit and 64-bit versions are supported.' },
  { q: 'Is this a one-time payment or subscription?', a: 'eCut is a one-time payment with a lifetime license. You pay once and use it forever, including all future updates.' },
  { q: 'What happens after I purchase?', a: 'You will receive an instant download link via email. The installer is straightforward and takes less than 2 minutes to set up.' },
  { q: 'Do I get free updates?', a: 'Yes! All updates are completely free for life. We regularly add new tools and improve existing ones based on user feedback.' },
  { q: 'What if eCut doesn\'t work for me?', a: 'We offer a 30-day money-back guarantee. If you\'re not satisfied for any reason, contact us and we\'ll refund you immediately.' },
  { q: 'Is there a trial version available?', a: 'We don\'t offer a trial, but our demo videos show every feature in detail. Plus, our 30-day guarantee means zero risk.' },
]

const includes = [
  'eCut Plugin — Full Version (50+ tools)',
  'Lifetime License — Use on 2 computers',
  'Free Updates Forever',
  'Installation Guide & Video Tutorials',
  'Priority Email Support',
  '30-Day Money Back Guarantee',
]

useHead({
  title: 'eCut Plugin for CorelDRAW — 50+ Pro Tools | DigiKraft',
  meta: [
    { name: 'description', content: 'The most powerful CorelDRAW plugin. Smart cut lines, nesting, color separation, batch processing and 50+ professional tools. One-time payment, lifetime license.' }
  ]
})
</script>
