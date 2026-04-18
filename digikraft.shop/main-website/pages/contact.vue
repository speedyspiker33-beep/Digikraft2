<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-6">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h1>
        <p class="text-xl text-gray-600">We'd love to hear from you. Send us a message!</p>
      </div>

      <div class="grid lg:grid-cols-2 gap-12">
        <!-- Contact Form -->
        <div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Your Name</label>
              <input 
                v-model="form.name"
                type="text" 
                required
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
              <input 
                v-model="form.email"
                type="email" 
                required
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Subject</label>
              <select 
                v-model="form.subject"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
              >
                <option value="">Select a subject</option>
                <option value="general">General Inquiry</option>
                <option value="support">Technical Support</option>
                <option value="sales">Sales Question</option>
                <option value="partnership">Partnership Opportunity</option>
                <option value="feedback">Feedback</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Message</label>
              <textarea 
                v-model="form.message"
                required
                rows="6"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none"
                placeholder="Tell us how we can help..."
              ></textarea>
            </div>

            <button 
              type="submit"
              :disabled="loading"
              class="w-full bg-gradient-to-r from-primary to-blue-700 text-white py-4 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="!loading">Send Message</span>
              <span v-else class="flex items-center justify-center gap-2">
                <span class="material-symbols-outlined animate-spin">progress_activity</span>
                Sending...
              </span>
            </button>

            <p v-if="success" class="text-green-600 text-center font-bold">Message sent successfully!</p>
          </form>
        </div>

        <!-- Contact Info -->
        <div class="space-y-8">
          <div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
            <div class="space-y-6">
              <div v-for="info in contactInfo" :key="info.title" class="flex items-start gap-4">
                <div class="size-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span class="material-symbols-outlined text-primary">{{ info.icon }}</span>
                </div>
                <div>
                  <h3 class="font-bold text-gray-900 mb-1">{{ info.title }}</h3>
                  <p class="text-gray-600">{{ info.value }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Business Hours</h2>
            <div class="space-y-3 text-gray-600">
              <div class="flex justify-between">
                <span>Monday - Friday</span>
                <span class="font-bold">9:00 AM - 6:00 PM</span>
              </div>
              <div class="flex justify-between">
                <span>Saturday</span>
                <span class="font-bold">10:00 AM - 4:00 PM</span>
              </div>
              <div class="flex justify-between">
                <span>Sunday</span>
                <span class="font-bold">Closed</span>
              </div>
            </div>
          </div>

          <div class="bg-gradient-to-br from-primary to-blue-700 rounded-2xl shadow-xl p-8 text-white">
            <h2 class="text-2xl font-bold mb-4">Need Immediate Help?</h2>
            <p class="mb-6 opacity-90">Check out our comprehensive help center for instant answers</p>
            <NuxtLink 
              to="/help" 
              class="inline-block bg-white text-primary px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all"
            >
              Visit Help Center
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Contact Us',
  meta: [
    { name: 'description', content: 'Get in touch with DigiKraft. We\'re here to help with any questions or concerns.' }
  ]
})

const form = reactive({
  name: '',
  email: '',
  subject: '',
  message: ''
})

const loading = ref(false)
const success = ref(false)

const contactInfo = [
  { icon: 'mail', title: 'Email', value: 'support@digikraft.shop' },
  { icon: 'phone', title: 'Phone', value: '+1 (555) 123-4567' },
  { icon: 'location_on', title: 'Address', value: '123 Creative Street, Design City, DC 12345' },
  { icon: 'schedule', title: 'Response Time', value: 'Within 24 hours' }
]

const handleSubmit = async () => {
  loading.value = true
  success.value = false
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    success.value = true
    form.name = ''
    form.email = ''
    form.subject = ''
    form.message = ''
  } catch (error) {
    console.error('Failed to send message:', error)
  } finally {
    loading.value = false
  }
}
</script>
