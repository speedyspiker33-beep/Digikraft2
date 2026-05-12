<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      <Transition
        v-for="toast in toasts"
        :key="toast.id"
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 translate-x-full"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 translate-x-full"
      >
        <div 
          :class="[
            'px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 pointer-events-auto max-w-sm',
            toast.type === 'success' ? 'bg-green-500 text-white' :
            toast.type === 'error' ? 'bg-red-500 text-white' :
            toast.type === 'warning' ? 'bg-yellow-500 text-white' :
            'bg-blue-500 text-white'
          ]"
        >
          <span class="material-symbols-outlined text-xl">
            {{ 
              toast.type === 'success' ? 'check_circle' :
              toast.type === 'error' ? 'error' :
              toast.type === 'warning' ? 'warning' :
              'info'
            }}
          </span>
          <span class="text-sm font-medium">{{ toast.message }}</span>
          <button 
            @click="removeToast(toast.id)"
            class="ml-auto text-white/80 hover:text-white"
          >
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

const toasts = ref<Toast[]>([])
let toastId = 0

const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration = 3000) => {
  const id = `toast-${toastId++}`
  const toast: Toast = { id, message, type, duration }
  
  toasts.value.push(toast)
  
  if (duration > 0) {
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }
}

const removeToast = (id: string) => {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

// Provide to all child components
provide('showToast', showToast)
</script>

<style scoped>
/* Smooth animations */
</style>
