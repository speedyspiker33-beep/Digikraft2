<!-- Main App Vue Component -->
<template>
  <div id="app">
    <template v-if="loading">
      <div class="loading-screen">
        <div class="loader">
          <i class="fas fa-spinner fa-spin"></i>
          <h2>Loading Admin Panel...</h2>
          <p>Initializing modules...</p>
        </div>
      </div>
    </template>
    
    <template v-else>
      <DashboardLayout
        :modules="activeModules"
        :currentModule="currentModule"
        :user="user"
        @change-module="navigateToModule"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { MODULES, getActiveModules } from './config.js';
import { app } from './core/app.js';
import DashboardLayout from './shared/components/DashboardLayout.vue';

const loading = ref(true);
const currentModule = ref(null);
const user = ref({ name: 'Admin', email: 'admin@digikraft.shop' });

const activeModules = computed(() => {
  return getActiveModules().map(([name, config]) => ({
    name,
    ...config
  }));
});

onMounted(async () => {
  console.log('🚀 App.vue mounted, initializing...');
  try {
    await app.init();
    
    // Auto-navigate to first module
    if (activeModules.value.length > 0) {
      navigateToModule(activeModules.value[0].name);
    }
    
    loading.value = false;
    console.log('✅ App.vue fully loaded');
    
  } catch (error) {
    console.error('❌ App initialization failed:', error);
    loading.value = false;
  }
});

function navigateToModule(moduleName) {
  currentModule.value = moduleName;
  app.navigateToModule(moduleName, '/');
}
</script>

<style>
.loading-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: var(--bg-primary);
}

.loader {
  text-align: center;
}

.loader i {
  font-size: 48px;
  color: var(--primary);
  margin-bottom: 16px;
}
</style>
