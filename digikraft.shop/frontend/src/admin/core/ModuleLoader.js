/**
 * MODULE LOADER
 * Dynamically loads and manages admin panel modules
 */

import { MODULES, getActiveModules } from '../config.js';

class ModuleLoader {
  constructor() {
    this.modules = new Map();
    this.loadPromise = null;
  }

  /**
   * Initialize and load all enabled modules
   */
  async init() {
    console.log('🔧 ModuleLoader: Initializing modules...');
    
    const activeModules = getActiveModules();
    console.log(`📦 Found ${activeModules.length} active modules`);
    
    // Load each module dynamically
    for (const [moduleName, config] of activeModules) {
      try {
        console.log(`⏳ Loading module: ${moduleName}`);
        const module = await this.loadModule(moduleName);
        this.modules.set(moduleName, { module, config });
        console.log(`✅ Loaded: ${moduleName}`);
      } catch (error) {
        console.error(`❌ Failed to load module: ${moduleName}`, error);
        // Continue loading other modules
      }
    }

    console.log(`✅ ModuleLoader: ${this.modules.size} modules loaded successfully`);
  }

  /**
   * Dynamically import a module - isolated loading
   */
  async loadModule(moduleName) {
    // Each module exports: routes, components, api, store
    const modulePath = `../modules/${moduleName}/index.js`;
    
    try {
      const module = await import(modulePath);
      return module.default || module;
    } catch (error) {
      console.warn(`⚠️  Module not found or failed to load: ${moduleName}`);
      console.warn(`   Path attempted: ${modulePath}`);
      throw error;
    }
  }

  /**
   * Get loaded module by name
   */
  getModule(moduleName) {
    return this.modules.get(moduleName);
  }

  /**
   * Get all loaded modules
   */
  getAllModules() {
    return this.modules;
  }

  /**
   * Check if module is loaded and enabled
   */
  isModuleEnabled(moduleName) {
    return this.modules.has(moduleName) && MODULES[moduleName]?.enabled;
  }

  /**
   * Enable a module at runtime (requires app reload)
   */
  enableModule(moduleName) {
    if (MODULES[moduleName]) {
      MODULES[moduleName].enabled = true;
      console.log(`🟢 Module enabled: ${moduleName} (requires reload)`);
    }
  }

  /**
   * Disable a module at runtime
   */
  disableModule(moduleName) {
    if (MODULES[moduleName]) {
      MODULES[moduleName].enabled = false;
      this.modules.delete(moduleName);
      console.log(`🔴 Module disabled: ${moduleName}`);
    }
  }

  /**
   * Get navigation items for sidebar
   */
  getNavigationItems() {
    const navItems = [];
    
    for (const [moduleName, { config }] of this.modules) {
      navItems.push({
        name: moduleName,
        label: config.label,
        icon: config.icon,
        order: config.order,
        path: `/${moduleName}`,
        features: config.features || []
      });
    }

    // Sort by order
    return navItems.sort((a, b) => a.order - b.order);
  }

  /**
   * Get routes for Vue Router
   */
  getRoutes() {
    const routes = [];
    
    for (const [moduleName, { module, config }] of this.modules) {
      if (module.routes) {
        // Prefix routes with module name
        const prefixedRoutes = module.routes.map(route => ({
          ...route,
          path: `/${moduleName}${route.path}`,
          meta: {
            ...route.meta,
            module: moduleName,
            requiresAuth: true
          }
        }));
        routes.push(...prefixedRoutes);
      }
    }

    return routes;
  }

  /**
   * Register module components globally or locally
   */
  registerComponents(app) {
    for (const [moduleName, { module }] of this.modules) {
      if (module.components) {
        Object.entries(module.components).forEach(([name, component]) => {
          // Register with prefixed name to avoid conflicts
          const componentName = `Module${this.pascalCase(moduleName)}${this.pascalCase(name)}`;
          app.component(componentName, component);
        });
      }
    }
  }

  // Helper: Convert kebab-case to PascalCase
  pascalCase(str) {
    return str.replace(/[-_]+/g, ' ')
              .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
                return word.toUpperCase();
              })
              .replace(/\s+/g, '');
  }
}

// Create singleton instance
export const moduleLoader = new ModuleLoader();
