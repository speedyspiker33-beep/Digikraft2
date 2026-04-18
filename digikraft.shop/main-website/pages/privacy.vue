<template>
  <div class="min-h-screen bg-gray-50 py-12 px-6">
    <div class="max-w-4xl mx-auto">
      <div class="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p class="text-gray-600 mb-8">Last updated: {{ lastUpdated }}</p>

        <div class="prose prose-lg max-w-none">
          <section v-for="section in sections" :key="section.title" class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">{{ section.title }}</h2>
            <div class="space-y-4 text-gray-600 leading-relaxed">
              <p v-for="(paragraph, index) in section.content" :key="index">
                {{ paragraph }}
              </p>
              <ul v-if="section.list" class="list-disc pl-6 space-y-2">
                <li v-for="(item, index) in section.list" :key="index">{{ item }}</li>
              </ul>
            </div>
          </section>
        </div>

        <div class="mt-12 pt-8 border-t border-gray-200">
          <p class="text-gray-600 mb-4">
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <p class="text-primary font-bold">privacy@digikraft.shop</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Privacy Policy',
  meta: [
    { name: 'description', content: 'Learn how DigiKraft collects, uses, and protects your personal information.' }
  ]
})

const lastUpdated = 'January 1, 2024'

const sections = [
  {
    title: '1. Information We Collect',
    content: [
      'We collect information you provide directly to us when you create an account, make a purchase, or contact us for support.'
    ],
    list: [
      'Personal information: name, email address, billing address',
      'Payment information: processed securely through third-party payment processors',
      'Usage data: pages visited, products viewed, search queries',
      'Device information: IP address, browser type, operating system',
      'Cookies and tracking technologies for analytics and personalization'
    ]
  },
  {
    title: '2. How We Use Your Information',
    content: [
      'We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.'
    ],
    list: [
      'Process and fulfill your orders',
      'Send you order confirmations and updates',
      'Respond to your comments and questions',
      'Send marketing communications (with your consent)',
      'Detect and prevent fraud and abuse',
      'Analyze usage patterns to improve our service',
      'Comply with legal obligations'
    ]
  },
  {
    title: '3. Information Sharing',
    content: [
      'We do not sell your personal information to third parties. We may share your information in the following circumstances:'
    ],
    list: [
      'With service providers who help us operate our business (payment processors, hosting providers, analytics services)',
      'With sellers when you purchase their products',
      'When required by law or to protect our rights',
      'In connection with a business transfer or acquisition',
      'With your consent or at your direction'
    ]
  },
  {
    title: '4. Data Security',
    content: [
      'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.',
      'All payment transactions are processed through secure, PCI-compliant payment gateways. We do not store credit card information on our servers.',
      'However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.'
    ]
  },
  {
    title: '5. Cookies and Tracking',
    content: [
      'We use cookies and similar tracking technologies to track activity on our service and hold certain information. Cookies are files with small amounts of data that are sent to your browser.',
      'You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.'
    ]
  },
  {
    title: '6. Your Rights',
    content: [
      'Depending on your location, you may have certain rights regarding your personal information:'
    ],
    list: [
      'Access: Request a copy of the personal information we hold about you',
      'Correction: Request correction of inaccurate or incomplete information',
      'Deletion: Request deletion of your personal information',
      'Portability: Request transfer of your data to another service',
      'Opt-out: Unsubscribe from marketing communications',
      'Object: Object to processing of your personal information'
    ]
  },
  {
    title: '7. Data Retention',
    content: [
      'We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law.',
      'When you delete your account, we will delete or anonymize your personal information within 30 days, except where we are required to retain it for legal or regulatory purposes.'
    ]
  },
  {
    title: '8. Children\'s Privacy',
    content: [
      'Our service is not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18.',
      'If you are a parent or guardian and believe your child has provided us with personal information, please contact us so we can delete it.'
    ]
  },
  {
    title: '9. International Data Transfers',
    content: [
      'Your information may be transferred to and maintained on servers located outside of your country where data protection laws may differ.',
      'We take appropriate safeguards to ensure your personal information remains protected in accordance with this Privacy Policy.'
    ]
  },
  {
    title: '10. Changes to This Policy',
    content: [
      'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.',
      'You are advised to review this Privacy Policy periodically for any changes. Changes are effective when posted on this page.'
    ]
  },
  {
    title: '11. Contact Us',
    content: [
      'If you have any questions about this Privacy Policy or our data practices, please contact us at privacy@digikraft.shop or through our contact page.'
    ]
  }
]
</script>
