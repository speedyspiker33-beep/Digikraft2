<template>
  <div class="container mx-auto px-6 py-8">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Submit a Ticket</h1>
      <p class="text-gray-600 mb-8">Tell us about your requirements - custom designs, plugins, macros, or any customization work</p>

      <form @submit.prevent="submitTicket" class="space-y-6">
        <!-- Contact Details -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Contact Details</h2>
          
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input 
                v-model="form.name"
                type="text" 
                required
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="Your name"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input 
                v-model="form.email"
                type="email" 
                required
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="your@email.com"
              />
            </div>
          </div>
          
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
            <input 
              v-model="form.phone"
              type="tel" 
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="+91 9876543210"
            />
          </div>
        </div>

        <!-- Requirements -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Your Requirements</h2>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Service Type *</label>
              <select 
                v-model="form.serviceType"
                required
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="">Select a service</option>
                <option value="custom-design">Custom Design</option>
                <option value="plugin-development">Plugin Development</option>
                <option value="macro-automation">Macro / Automation</option>
                <option value="template-customization">Template Customization</option>
                <option value="integration">API / Integration</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Project Title *</label>
              <input 
                v-model="form.title"
                type="text" 
                required
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="Brief title for your project"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Detailed Description *</label>
              <textarea 
                v-model="form.description"
                required
                rows="8"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                placeholder="Describe your requirements in detail:
- What do you need?
- What is the purpose?
- Any specific features?
- Timeline or deadline?
- Budget range (if any)"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Attachments (optional)</label>
              <input 
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.zip"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-primary outline-none"
              />
              <p class="text-xs text-gray-500 mt-1">Max 10MB. Images, PDF, DOC, ZIP</p>
            </div>
          </div>
        </div>

        <!-- Budget & Timeline -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Budget & Timeline</h2>
          
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Budget Range</label>
              <select 
                v-model="form.budget"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="">Select budget</option>
                <option value="under-1000">Under ₹1,000</option>
                <option value="1000-5000">₹1,000 - ₹5,000</option>
                <option value="5000-10000">₹5,000 - ₹10,000</option>
                <option value="10000-25000">₹10,000 - ₹25,000</option>
                <option value="25000+">₹25,000+</option>
                <option value="discuss">Let's Discuss</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Expected Timeline</label>
              <select 
                v-model="form.timeline"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="">Select timeline</option>
                <option value="urgent">Urgent (1-3 days)</option>
                <option value="normal">Normal (1-2 weeks)</option>
                <option value="flexible">Flexible (2-4 weeks)</option>
                <option value="long-term">Long-term project</option>
              </select>
            </div>
          </div>
        </div>

        <button 
          type="submit"
          class="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
        >
          Submit Ticket
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const form = reactive({
  name: '',
  email: '',
  phone: '',
  serviceType: '',
  title: '',
  description: '',
  budget: '',
  timeline: ''
})

const submitTicket = () => {
  console.log('Ticket submitted:', form)
  alert('Thank you! Your ticket has been submitted. We will contact you within 24-48 hours.')
}

useHead({
  title: 'Submit Ticket - DigiKraft',
  meta: [
    {
      name: 'description',
      content: 'Submit a ticket for custom design, plugin development, macro automation and more.'
    }
  ]
})
</script>
