<template>
  <section class="py-24 px-6 lg:px-12">
    <div class="max-w-5xl mx-auto bg-gray-50 p-12 lg:p-20 rounded-3xl border border-gray-100 relative overflow-hidden">
      <div class="relative z-10 max-w-xl">
        <h2 class="text-4xl font-bold text-gray-900 mb-6">
          Stay in <br/>the loop.
        </h2>
        <p class="text-slate-400 mb-10 text-lg leading-relaxed">
          Be the first to hear about new hub drops, exclusive sales, and design trends from the DigiKraft community.
        </p>
        
        <form @submit.prevent="subscribe" class="flex flex-col sm:flex-row gap-4">
          <input 
            v-model="email"
            type="email" 
            class="flex-1 bg-white border-gray-200 rounded-lg px-6 py-4 text-gray-900 focus:ring-primary focus:border-primary transition-all-300" 
            placeholder="Your professional email"
            required
          />
          <button 
            type="submit"
            :disabled="loading"
            class="bg-primary text-white font-bold px-10 py-4 rounded-lg hover:bg-blue-700 transition-all-300 disabled:opacity-50"
          >
            {{ loading ? 'Subscribing...' : 'Subscribe' }}
          </button>
        </form>
        
        <p class="mt-4 text-[10px] text-slate-500 font-medium uppercase tracking-widest">
          No spam. Only craft. unsubscribe anytime.
        </p>
        
        <div v-if="message" :class="['mt-4 text-sm', messageType === 'success' ? 'text-green-600' : 'text-red-600']">
          {{ message }}
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const email = ref('')
const loading = ref(false)
const message = ref('')
const messageType = ref('')

const subscribe = async () => {
  loading.value = true
  message.value = ''
  
  try {
    const config = useRuntimeConfig()
    await $fetch(`${config.public.apiBase}/public/newsletter`, {
      method: 'POST',
      body: { email: email.value }
    })
    
    message.value = 'Successfully subscribed!'
    messageType.value = 'success'
    email.value = ''
  } catch (error) {
    message.value = 'Something went wrong. Please try again.'
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}
</script>
