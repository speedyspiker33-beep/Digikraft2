// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // ===== PORT RULE: Main Website always runs on port 3001 =====
  devServer: {
    port: 3001
  },

  css: ['~/assets/css/main.css'],

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxt/image',
    '@nuxt/test-utils',
    '@nuxt/content'
  ],

  content: {
    highlight: {
      theme: 'github-dark'
    },
    markdown: {
      toc: {
        depth: 3,
        searchDepth: 3
      }
    }
  },

  app: {
    head: {
      title: 'DigiKraft.shop | Premium Digital Marketplace',
      htmlAttrs: {
        lang: 'en'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'The premier destination for elite digital assets and professional creative resources.' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        // Inter font
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap' },
        // Material Symbols — reliable variable font URL
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap' },
        // Font Awesome as fallback for any missing icons
        { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css' }
      ]
    }
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8080/api',
      strapiUrl: process.env.NUXT_PUBLIC_STRAPI_URL || 'http://localhost:1337',
      strapiApiToken: process.env.STRAPI_API_TOKEN || ''
    }
  },

  typescript: {
    strict: true,
    typeCheck: false
  }
})