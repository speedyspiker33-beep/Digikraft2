/**
 * MINIMAL WORKING ADMIN PANEL
 * Shows only Dashboard, Products, Orders
 */
import { createApp } from 'vue';

const app = createApp({
  data() {
    return {
      modules: [
        { name: 'dashboard', label: 'Dashboard', icon: 'fa-dashboard' },
        { name: 'products', label: 'Products', icon: 'fa-box' },
        { name: 'orders', label: 'Orders', icon: 'fa-shopping-cart' }
      ],
      currentModule: null
    };
  },
  methods: {
    openModule(name) {
      this.currentModule = name;
      console.log('Module:', name, 'opened');
    }
  },
  template: `
    <div style="font-family: Inter; background: #111827; color: white; min-height: 100vh;">
      <header style="background: #1f2937; padding: 16px; border-bottom: 1px solid #374151;">
        <h1 style="margin: 0; color: #6366f1;">DAdmin</h1>
      </header>
      <div style="display: flex;">
        <aside style="width: 260px; background: #1f2937; padding: 20px; border-right: 1px solid #374151;">
          <h3 style="margin: 0 0 20px 0; color: #9ca3af; text-transform: uppercase; font-size: 13px;">Modules</h3>
          <div style="display:flex; flex-direction: column; gap: 8px;">
            <div v-for="m in modules" :key="m.name" 
                 @click="openModule(m.name)"
                 style="padding: 12px; border-radius: 8px; cursor: pointer; transition: all 0.2s;"
                 :style="{background: currentModule === m.name ? '#3730a3' : 'transparent'}">
              <i :class="'fas ' + m.icon" style="margin-right: 12px; width: 16px;"></i>
              <span style="font-weight: 500;">{{ m.label }}</span>
            </div>
          </div>
        </aside>
        <main style="flex: 1; padding: 40px;">
          <h2 v-if="!currentModule" style="margin: 0; color: #9ca3af;">Select a module</h2>
          <h2 v-else style="margin: 0;">Module: {{ currentModule }}</h2>
        </main>
      </div>
    </div>
  `
});

console.log('✅ Minimal admin panel starting...');
app.mount('#app');
console.log('✅ Mounted');
