/**
 * MINIMAL CONFIG - Only 3 Modules
 */
export const MODULES = {
  dashboard: { enabled: true, label: 'Dashboard', icon: 'fa-dashboard', order: 1 },
  products: { enabled: true, label: 'Products', icon: 'fa-box', order: 2 },
  orders: { enabled: true, label: 'Orders', icon: 'fa-shopping-cart', order: 3 },
  digiProfile: { enabled: true, label: 'DigiProfile', icon: 'fa-id-card', order: 4 }
};

export const getActiveModules = () => {
  return Object.entries(MODULES).filter(([_, c]) => c.enabled).sort(([,a], [,b]) => a.order - b.order);
};
