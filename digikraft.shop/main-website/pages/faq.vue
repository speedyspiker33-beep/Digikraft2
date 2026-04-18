<template>
  <div class="container mx-auto px-6 py-8">
    <div class="max-w-3xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h1>
      <p class="text-gray-600 mb-8">Find answers to common questions about DigiKraft</p>

      <div class="space-y-4">
        <div v-for="(faq, index) in faqs" :key="index" class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button 
            @click="toggleFaq(index)"
            class="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <span class="font-medium text-gray-900">{{ faq.question }}</span>
            <span class="material-symbols-outlined text-gray-500 transition-transform" :class="{ 'rotate-180': openFaq === index }">
              expand_more
            </span>
          </button>
          <div v-if="openFaq === index" class="px-6 pb-4 text-gray-600 text-sm">
            {{ faq.answer }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const openFaq = ref<number | null>(null)

const toggleFaq = (index: number) => {
  openFaq.value = openFaq.value === index ? null : index
}

const faqs = [
  {
    question: 'How do I purchase digital assets?',
    answer: 'Browse our marketplace, add items to your cart, and checkout securely. You can pay using credit cards, UPI, or other payment methods. After purchase, download your files instantly from your account.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept credit/debit cards, UPI, PayPal, and bank transfers. All payments are processed securely through our payment partners.'
  },
  {
    question: 'Can I get a refund?',
    answer: 'Yes, we offer a 7-day refund policy for most products. If you\'re not satisfied, contact our support team within 7 days of purchase.'
  },
  {
    question: 'How do I download my purchased files?',
    answer: 'Go to your Account > Purchases, find the order, and click the download button. Files are available for download for 30 days after purchase.'
  },
  {
    question: 'What file formats are included?',
    answer: 'Most products include multiple formats (AI, EPS, PSD, SVG, PNG, JPEG). Check the product description for specific file formats included.'
  },
  {
    question: 'Can I use purchased assets for commercial projects?',
    answer: 'Yes! Most assets include commercial license. Check the product\'s licensing terms for specific usage rights.'
  }
]

useHead({
  title: 'FAQ - DigiKraft',
  meta: [
    {
      name: 'description',
      content: 'Frequently asked questions about DigiKraft digital marketplace.'
    }
  ]
})
</script>
