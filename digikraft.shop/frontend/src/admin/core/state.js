// ============================================================
// CORE STATE - Shared across all modules
// ============================================================
export const State = {
  page: 'dashboard',
  subpage: null,

  get products() { return JSON.parse(localStorage.getItem('dk_products') || '[]'); },
  set products(v) { localStorage.setItem('dk_products', JSON.stringify(v)); },

  get orders() { return JSON.parse(localStorage.getItem('dk_orders') || '[]'); },
  set orders(v) { localStorage.setItem('dk_orders', JSON.stringify(v)); },

  get customers() { return JSON.parse(localStorage.getItem('dk_customers') || '[]'); },
  set customers(v) { localStorage.setItem('dk_customers', JSON.stringify(v)); },

  get categories() { return JSON.parse(localStorage.getItem('dk_categories') || '["Graphics","Fonts","Templates","UI Kits","Icons","3D Assets","Mockups","Patterns"]'); },
  set categories(v) { localStorage.setItem('dk_categories', JSON.stringify(v)); },

  get coupons() { return JSON.parse(localStorage.getItem('dk_coupons') || '[]'); },
  set coupons(v) { localStorage.setItem('dk_coupons', JSON.stringify(v)); },

  get settings() { return JSON.parse(localStorage.getItem('dk_settings') || '{}'); },
  set settings(v) { localStorage.setItem('dk_settings', JSON.stringify(v)); },

  get media() { return JSON.parse(localStorage.getItem('dk_media') || '[]'); },
  set media(v) { localStorage.setItem('dk_media', JSON.stringify(v)); },
};

export const STRAPI_URL = 'http://localhost:1337';
export const API_URL = 'http://localhost:8080/api';
export const STRAPI_TOKEN = 'f139ab7e08ecbad3a0a0810941244fbd9d99730e1d3ecc233c2a0806fd81e3c63327afd70387b1bfe0f2ae130dfb4f33f32e7e48888f102c5848a8e3c39b4341b2e7264bb95f4306e5b6d9b6ad950b011f8ae460209b07a238842cdaa94ae0b5ea931c60932198463ecd9d6836808c7778f4e577d2cc6e0f9ee8e0ecc7f3a963';
