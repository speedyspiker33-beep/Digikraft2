<template>
  <Teleport to="body">
    <Transition name="fade">
      <div 
        v-if="isOpen" 
        class="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4"
        @click.self="close"
      >
        <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
          <button @click="close" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <span class="material-symbols-outlined">close</span>
          </button>
          
          <!-- Login Form -->
          <div v-if="isLogin">
            <h2 class="text-2xl font-bold mb-2">Welcome Back</h2>
            <p class="text-gray-500 mb-6">Sign in to your account</p>
            
            <form @submit.prevent="handleLogin">
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input v-model="loginForm.email" type="email" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
              </div>
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input v-model="loginForm.password" type="password" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
              </div>
              <button type="submit" class="w-full bg-primary text-white py-2.5 rounded-lg font-semibold hover:opacity-90 transition">
                Sign In
              </button>
            </form>
            
            <p class="text-center mt-4 text-gray-600">
              Don't have an account? 
              <button @click="isLogin = false" class="text-primary font-semibold">Sign up</button>
            </p>
          </div>
          
          <!-- Register Form -->
          <div v-else>
            <h2 class="text-2xl font-bold mb-2">Create Account</h2>
            <p class="text-gray-500 mb-6">Join DigiKraft today</p>
            
            <form @submit.prevent="handleRegister">
              <div class="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input v-model="registerForm.firstName" type="text" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input v-model="registerForm.lastName" type="text" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                </div>
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input v-model="registerForm.email" type="email" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input v-model="registerForm.password" type="password" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
              </div>
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input v-model="registerForm.confirmPassword" type="password" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
              </div>
              <button type="submit" class="w-full bg-primary text-white py-2.5 rounded-lg font-semibold hover:opacity-90 transition">
                Create Account
              </button>
            </form>
            
            <p class="text-center mt-4 text-gray-600">
              Already have an account? 
              <button @click="isLogin = true" class="text-primary font-semibold">Sign in</button>
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const isOpen = ref(false)
const isLogin = ref(true)

const loginForm = ref({ email: '', password: '' })
const registerForm = ref({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' })

const open = (showLogin = true) => {
  isLogin.value = showLogin
  isOpen.value = true
}

const close = () => {
  isOpen.value = false
}

const handleLogin = async () => {
  await authStore.login(loginForm.value.email, loginForm.value.password)
  close()
  loginForm.value = { email: '', password: '' }
}

const handleRegister = async () => {
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    alert('Passwords do not match!')
    return
  }
  await authStore.register(
    `${registerForm.value.firstName} ${registerForm.value.lastName}`,
    registerForm.value.email,
    registerForm.value.password
  )
  close()
  registerForm.value = { firstName: '', lastName: '', email: '', password: '', confirmPassword: '' }
}

defineExpose({ open, close })
</script>
