<template>
  <teleport to="body">
    <div class="modal-overlay" @click="handleOverlayClick">
      <div class="modal-container" :class="size" @click.stop>
        <!-- Header -->
        <div class="modal-header">
          <h3 class="modal-title">
            <slot name="title">{{ title }}</slot>
          </h3>
          <button class="modal-close" @click="close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <!-- Body -->
        <div class="modal-body">
          <slot></slot>
        </div>
        
        <!-- Footer -->
        <div class="modal-footer">
          <slot name="footer">
            <button class="btn btn-secondary" @click="close">Cancel</button>
            <button class="btn btn-primary" @click="confirm">{{ confirmText }}</button>
          </slot>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'medium', // small, medium, large, full
    validator: (value) => ['small', 'medium', 'large', 'full'].includes(value)
  },
  confirmText: {
    type: String,
    default: 'Confirm'
  },
  closeOnOverlay: {
    type: Boolean,
    default: true
  },
  closeOnEscape: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['close', 'confirm']);

function close() {
  emit('close');
}

function confirm() {
  emit('confirm');
}

function handleOverlayClick() {
  if (props.closeOnOverlay) {
    close();
  }
}

function handleKeydown(e) {
  if (e.key === 'Escape' && props.closeOnEscape) {
    close();
  }
}

onMounted(() => {
  document.body.style.overflow = 'hidden';
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.body.style.overflow = '';
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-container {
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 500px;
}

.modal-container.small {
  max-width: 400px;
}

.modal-container.large {
  max-width: 800px;
}

.modal-container.full {
  max-width: 95vw;
  max-height: 95vh;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.modal-close {
  background: none;
  border: none;
  font-size: 16px;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.modal-close:hover {
  color: var(--text-primary);
  background: var(--hover-bg);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  color: var(--text-primary);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 10px;
  }
  
  .modal-container {
    max-width: 100vw !important;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 16px 20px;
  }
}
</style>
