<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-6">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
        <p class="text-xl text-gray-600 mb-8">Find answers to common questions</p>
        
        <!-- Search -->
        <div class="max-w-2xl mx-auto">
          <div class="relative">
            <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Search for help..."
              class="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <!-- Quick Links -->
      <div class="grid md:grid-cols-3 gap-6 mb-12">
        <NuxtLink 
          v-for="link in quickLinks" 
          :key="link.title"
          :to="link.href"
          class="bg-white rounded-xl p-6 border border-gray-100 hover:border-primary hover:shadow-lg transition-all group"
        >
          <div class="size-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <span class="material-symbols-outlined text-primary text-2xl">{{ link.icon }}</span>
          </div>
          <h3 class="font-bold text-gray-900 mb-2">{{ link.title }}</h3>
          <p class="text-sm text-gray-600">{{ link.description }}</p>
        </NuxtLink>
      </div>

      <!-- FAQ Categories -->
      <div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h2 class="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
        
        <div class="space-y-6">
          <div v-for="category in faqCategories" :key="category.name" class="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
            <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">{{ category.icon }}</span>
              {{ category.name }}
            </h3>
            
            <div class="space-y-3">
              <div 
                v-for="(faq, index) in category.faqs" 
                :key="index"
                class="border border-gray-100 rounded-lg overflow-hidden"
              >
                <button 
                  @click="toggleFaq(category.name + index)"
                  class="w-full px-4 py-3 text-left font-bold text-gray-900 hover:bg-gray-50 transition-all flex items-center justify-between"
                >
                  <span>{{ faq.question }}</span>
                  <span class="material-symbols-outlined transition-transform" :class="{ 'rotate-180': openFaq === category.name + index }">
                    expand_more
                  </span>
                </button>
                <div 
                  v-show="openFaq === category.name + index"
                  class="px-4 py-3 bg-gray-50 text-gray-600 border-t border-gray-100"
                >
                  {{ faq.answer }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Support -->
      <div class="mt-12 bg-gradient-to-r from-primary to-blue-700 rounded-2xl shadow-xl p-8 text-white text-center">
        <h2 class="text-2xl font-bold mb-4">Still Need Help?</h2>
        <p class="text-lg mb-6 opacity-90">Our support team is here to assist you</p>
        <NuxtLink 
          to="/contact" 
          class="inline-block bg-white text-primary px-8 py-4 rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all"
        >
          Contact Support
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Help Center',
  meta: [
    { name: 'description', content: 'Find answers to common questions about DigiKraft. Browse our FAQ or contact support.' }
  ]
})

const searchQuery = ref('')
const openFaq = ref<string | null>(null)

const quickLinks = [
  {
    icon: 'shopping_cart',
    title: 'Orders & Purchases',
    description: 'Track orders, download files, and manage purchases',
    href: '/account'
  },
  {
    icon: 'credit_card',
    title: 'Payments & Billing',
    description: 'Payment methods, refunds, and billing questions',
    href: '/help#payments'
  },
  {
    icon: 'description',
    title: 'Licenses & Usage',
    description: 'Understand license types and usage rights',
    href: '/help#licenses'
  }
]

const faqCategories = [
  {
    name: 'Getting Started',
    icon: 'rocket_launch',
    faqs: [
      {
        question: 'How do I create an account?',
        answer: 'Click the "Register" button in the top right corner, fill in your details, and verify your email address. You can also sign up using Google or GitHub for faster registration.'
      },
      {
        question: 'Is it free to browse and download free assets?',
        answer: 'Yes! Creating an account is completely free, and you can browse all products and download free assets without any charges. You only pay when purchasing premium products.'
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards, PayPal, and various local payment methods through our secure payment processors (Stripe and Razorpay).'
      }
    ]
  },
  {
    name: 'Purchasing & Downloads',
    icon: 'download',
    faqs: [
      {
        question: 'How do I download my purchased products?',
        answer: 'After purchase, you can download products from your account dashboard under the "Downloads" tab. You\'ll also receive an email with download links. Downloads are available indefinitely.'
      },
      {
        question: 'Can I re-download products I\'ve purchased?',
        answer: 'Yes! All your purchases are stored in your account and can be re-downloaded at any time. We also provide updated versions of products when available.'
      },
      {
        question: 'What if my download fails or the file is corrupted?',
        answer: 'If you experience download issues, try using a different browser or contact our support team. We\'ll provide alternative download methods or re-send the files.'
      }
    ]
  },
  {
    name: 'Licenses & Usage Rights',
    icon: 'gavel',
    faqs: [
      {
        question: 'What\'s the difference between Personal and Commercial licenses?',
        answer: 'Personal licenses are for non-commercial projects only. Commercial licenses allow you to use the assets in client work and commercial projects. Extended licenses include additional rights like resale in physical products.'
      },
      {
        question: 'Can I use assets in multiple projects?',
        answer: 'Yes! Once you purchase a license, you can use the asset in unlimited projects according to your license type. Each license is per user, not per project.'
      },
      {
        question: 'Can I share purchased assets with my team?',
        answer: 'No, licenses are per user. If multiple team members need to use an asset, each person needs their own license. We offer team licenses for organizations.'
      }
    ]
  },
  {
    name: 'Refunds & Returns',
    icon: 'currency_exchange',
    faqs: [
      {
        question: 'What is your refund policy?',
        answer: 'We offer refunds within 30 days of purchase if the product has technical issues, doesn\'t match the description, or if you haven\'t downloaded it yet. Digital products are generally non-refundable once downloaded.'
      },
      {
        question: 'How long does a refund take?',
        answer: 'Refunds are processed within 5-7 business days and will appear in your original payment method. You\'ll receive an email confirmation once the refund is processed.'
      }
    ]
  },
  {
    name: 'Selling on DigiKraft',
    icon: 'storefront',
    faqs: [
      {
        question: 'How do I become a seller?',
        answer: 'Click "Become a Seller" in the footer, fill out the application form, and submit your portfolio. Our team reviews applications within 3-5 business days.'
      },
      {
        question: 'What commission does DigiKraft take?',
        answer: 'We take a 30% commission on each sale. This covers payment processing, hosting, marketing, and customer support. You keep 70% of each sale.'
      },
      {
        question: 'When do I get paid?',
        answer: 'Payments are processed monthly for balances over $50. You can choose between PayPal, bank transfer, or other supported payment methods.'
      }
    ]
  }
]

const toggleFaq = (id: string) => {
  openFaq.value = openFaq.value === id ? null : id
}
</script>
