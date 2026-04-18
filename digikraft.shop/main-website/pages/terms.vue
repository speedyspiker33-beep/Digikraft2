<template>
  <div class="min-h-screen bg-gray-50 py-12 px-6">
    <div class="max-w-4xl mx-auto">
      <div class="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
        <p class="text-gray-600 mb-8">Last updated: {{ lastUpdated }}</p>

        <div class="prose prose-lg max-w-none">
          <section v-for="section in sections" :key="section.title" class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">{{ section.title }}</h2>
            <div class="space-y-4 text-gray-600 leading-relaxed">
              <p v-for="(paragraph, index) in section.content" :key="index">
                {{ paragraph }}
              </p>
            </div>
          </section>
        </div>

        <div class="mt-12 pt-8 border-t border-gray-200">
          <p class="text-gray-600 mb-4">
            If you have any questions about these Terms of Service, please contact us at:
          </p>
          <p class="text-primary font-bold">legal@digikraft.shop</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Terms of Service',
  meta: [
    { name: 'description', content: 'Read DigiKraft\'s Terms of Service to understand your rights and responsibilities when using our platform.' }
  ]
})

const lastUpdated = 'January 1, 2024'

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: [
      'By accessing and using DigiKraft.shop, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use our service.',
      'We reserve the right to update and change the Terms of Service from time to time without notice. Any new features that augment or enhance the current service shall be subject to the Terms of Service.'
    ]
  },
  {
    title: '2. Account Terms',
    content: [
      'You must be 18 years or older to use this service. You are responsible for maintaining the security of your account and password. DigiKraft cannot and will not be liable for any loss or damage from your failure to comply with this security obligation.',
      'You are responsible for all content posted and activity that occurs under your account. You may not use the service for any illegal or unauthorized purpose.'
    ]
  },
  {
    title: '3. License and Ownership',
    content: [
      'When you purchase a digital asset from DigiKraft, you are granted a non-exclusive, non-transferable license to use the asset according to the license type purchased (Personal, Commercial, or Extended).',
      'All digital assets remain the intellectual property of their respective creators. You do not acquire ownership of any asset, only the right to use it according to the license terms.',
      'You may not resell, redistribute, or share the original files with others. Each license is for a single user or entity.'
    ]
  },
  {
    title: '4. Payment Terms',
    content: [
      'All fees are exclusive of all taxes, levies, or duties imposed by taxing authorities. You are responsible for payment of all such taxes, levies, or duties.',
      'Refunds are processed according to our refund policy. Digital products are generally non-refundable once downloaded, except in cases of technical issues or misrepresentation.',
      'We accept payment through PayPal, Stripe, and Razorpay. All payment information is processed securely and we do not store credit card details.'
    ]
  },
  {
    title: '5. Prohibited Uses',
    content: [
      'You may not use our service to: violate any laws, infringe on intellectual property rights, transmit malware or harmful code, engage in fraudulent activity, or harass other users.',
      'We reserve the right to refuse service, terminate accounts, or remove content at our sole discretion without notice or liability.'
    ]
  },
  {
    title: '6. Limitation of Liability',
    content: [
      'DigiKraft shall not be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of or inability to use the service.',
      'We do not guarantee that the service will be uninterrupted, timely, secure, or error-free. We are not responsible for any damage to your computer system or loss of data.'
    ]
  },
  {
    title: '7. Seller Terms',
    content: [
      'If you sell digital assets on DigiKraft, you warrant that you own all rights to the content you upload and that it does not infringe on any third-party rights.',
      'DigiKraft takes a commission on each sale as outlined in the seller agreement. Payments are processed monthly for balances over the minimum threshold.',
      'We reserve the right to remove any content that violates our quality standards or terms of service.'
    ]
  },
  {
    title: '8. Termination',
    content: [
      'We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including breach of these Terms.',
      'Upon termination, your right to use the service will immediately cease. All provisions of the Terms which by their nature should survive termination shall survive.'
    ]
  },
  {
    title: '9. Governing Law',
    content: [
      'These Terms shall be governed by the laws of the jurisdiction in which DigiKraft operates, without regard to its conflict of law provisions.',
      'Any disputes arising from these Terms or your use of the service shall be resolved through binding arbitration.'
    ]
  },
  {
    title: '10. Contact Information',
    content: [
      'For any questions about these Terms of Service, please contact us at legal@digikraft.shop or through our contact page.'
    ]
  }
]
</script>
