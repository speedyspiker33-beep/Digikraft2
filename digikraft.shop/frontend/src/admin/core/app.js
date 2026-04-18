/**
 * UNIVERSAL ADMIN PANEL - CORE APP
 * Modular architecture with dynamic module loading
 */

import { moduleLoader } from './ModuleLoader.js';

export class AdminApp {
  constructor() {
    this.version = '2.0.0';
    this.config = {
      apiBase: '/api/admin',
      theme: 'light',
      debug: true
    };
    
    // Core managers
    this.moduleLoader = moduleLoader;

    // State
    this.modules = new Map();
    this.user = null;
    this.ready = false;
  }

  async init() {
    console.log(`🚀 Admin Panel v${this.version} Initializing...`);
    
    try {
      // Load modules dynamically
      await this.moduleLoader.init();
      this.syncModules();
      
      // Initialize UI
      this.initUI();
      
      // Setup event listeners
      this.setupEventListeners();
      
      console.log('✅ Admin Panel fully initialized');
      this.ready = true;
      return true;
      
    } catch (error) {
      console.error('❌ Admin panel initialization failed:', error);
      return false;
    }
  }

  syncModules() {
    const loadedModules = this.moduleLoader.getAllModules();
    
    for (const [name, { module, config }] of loadedModules) {
      this.modules.set(name, {
        name,
        ...config,
        instance: module,
        routes: module.routes || [],
        components: module.components || {}
      });
    }
  }

  initUI() {
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      const savedTheme = localStorage.getItem('admin_theme') || 'light';
      themeToggle.checked = savedTheme === 'dark';
      themeToggle.addEventListener('change', (e) => {
        const isDark = e.target.checked;
        document.body.classList.toggle('dark-theme', isDark);
        localStorage.setItem('admin_theme', isDark ? 'dark' : 'light');
      });
    }

    // Mobile menu
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (menuToggle && sidebar) {
      menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
      });
    }
  }

  setupEventListeners() {
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        document.getElementById('sidebar')?.classList.remove('active');
      }
    });
  }
}

export const app = new AdminApp();
export default AdminApp;
