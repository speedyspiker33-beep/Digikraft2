<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-6 py-12">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-flex items-center gap-2 mb-4">
          <div class="size-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
            <span class="material-symbols-outlined text-white text-2xl">bolt</span>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-gray-900">DigiKraft</h1>
        </NuxtLink>
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
        <p class="text-gray-600">No worries, we'll send you reset instructions</p>
      </div>

      <!-- Reset Card -->
      <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 relative overflow-hidden">
        <!-- Decorative Elements -->
        <div class="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
        <div class="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>

        <form v-if="!submitted" @submit.prevent="handleSubmit" class="relative space-y-6">
          <!-- Email -->
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">mail</span>
              <input 
                v-model="email"
                type="email" 
                required
                class="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit"
            :disabled="loading"
            class="w-full bg-gradient-to-r from-primary to-blue-700 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span v-if="!loading">Send Reset Link</span>
            <span v-else class="flex items-center gap-2">
              <span class="material-symbols-outlined animate-spin">progress_activity</span>
              Sending...
            </span>
          </button>

          <!-- Back to Login -->
          <div class="text-center">
            <NuxtLink to="/login" class="text-sm text-gray-600 hover:text-primary flex items-center justify-center gap-1">
              <span class="material-symbols-outlined text-lg">arrow_back</span>
              Back to Login
            </NuxtLink>
          </div>
        </form>

        <!-- Success Message -->
        <div v-else class="relative text-center py-8">
          <div class="size-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="material-symbols-outlined text-green-600 text-3xl">check_circle</span>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Check Your Email</h3>
          <p class="text-gray-600 mb-6">
            We've sent password reset instructions to<br>
            <span class="font-bold text-gray-900">{{ email }}</span>
          </p>
          <p class="text-sm text-gray-500 mb-6">
            Didn't receive the email? Check your spam folder or
          </p>
          <button 
            @click="handleResend"
            :disabled="resendLoading"
            class="text-primary font-bold hover:text-blue-700 disabled:opacity-50"
          >
            {{ resendLoading ? 'Sending...' : 'Resend Email' }}
          </button>
        </div>
      </div>

      <!-- Help Text -->
      <p class="text-center mt-6 text-sm text-gray-600">
        Need help? 
        <NuxtLink to="/contact" class="font-bold text-primary hover:text-blue-700">
          Contact Support
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

useHead({
  title: 'Forgot Password',
  meta: [
    { name: 'description', content: 'Reset your DigiKraft password' }
  ]
})

const email = ref('')
const loading = ref(false)
const submitted = ref(false)
const resendLoading = ref(false)

const handleSubmit = async () => {
  loading.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    submitted.value = true
  } catch (error) {
    console.error('Failed to send reset email:', error)
  } finally {
    loading.value = false
  }
}

const handleResend = async () => {
  resendLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
  } catch (error) {
    console.error('Failed to resend email:', error)
  } finally {
    resendLoading.value = false
  }
}
</script>
