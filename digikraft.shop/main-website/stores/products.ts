import { defineStore } from 'pinia'
import type { Product, Category } from '~/types'

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [] as Product[],
    categories: [] as Category[],
    loading: false,
    error: null as string | null,
    lastFetch: 0,
    filters: {
      category: null as number | null,
      minPrice: null as number | null,
      maxPrice: null as number | null,
      search: ''
    },
    sort: 'trending' as 'trending' | 'latest' | 'price-low' | 'price-high'
  }),

  getters: {
    filteredProducts: (state) => {
      let filtered = [...state.products]
      
      // Filter by category
      if (state.filters.category) {
        filtered = filtered.filter(p => p.categoryId === state.filters.category)
      }
      
      // Filter by price range
      if (state.filters.minPrice !== null) {
        filtered = filtered.filter(p => p.price >= state.filters.minPrice!)
      }
      if (state.filters.maxPrice !== null) {
        filtered = filtered.filter(p => p.price <= state.filters.maxPrice!)
      }
      
      // Filter by search
      if (state.filters.search) {
        const search = state.filters.search.toLowerCase()
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search)
        )
      }
      
      // Sort
      switch (state.sort) {
        case 'latest':
          filtered.sort((a, b) => b.id - a.id)
          break
        case 'price-low':
          filtered.sort((a, b) => a.price - b.price)
          break
        case 'price-high':
          filtered.sort((a, b) => b.price - a.price)
          break
        default:
          // trending - keep original order
          break
      }
      
      return filtered
    }
  },

  actions: {
    async fetchProducts(force = false) {
      // Skip if we have products and not forcing refresh (cache for 5 minutes)
      const now = Date.now()
      if (!force && this.products.length > 0 && (now - this.lastFetch) < 300000) {
        return
      }
      
      this.loading = true
      this.error = null
      
      // Try Backend API first (port 8080)
      try {
        const response = await fetch('http://localhost:8080/api/v1/products?status=published&limit=200')
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data?.products?.length > 0) {
            this.products = result.data.products.map((p: any) => ({
              id: p.id,
              name: p.title || p.name,
              slug: p.slug,
              description: p.description,
              shortDescription: p.short_description,
              price: parseFloat(p.price),
              originalPrice: p.sale_price ? parseFloat(p.sale_price) : undefined,
              image: p.image || p.thumbnail || '',
              images: Array.isArray(p.images) ? p.images : [],
              // Support both formats: category_ids array and categories enriched array
              categoryId: p.categories?.[0]?.id || (Array.isArray(p.category_ids) ? p.category_ids[0] : null) || 1,
              category_ids: Array.isArray(p.category_ids) ? p.category_ids : (p.categories ? p.categories.map((c: any) => c.id) : []),
              categories: p.categories || [],
              category: p.category || '',
              rating: p.rating || 4.5,
              reviewCount: p.review_count || 0,
              sales: p.downloads || 0,
              downloads: p.downloads || 0,
              featured: !!p.featured,
              tags: Array.isArray(p.tags) ? p.tags : [],
              fileFormat: p.file_format,
              fileSize: p.file_size,
              ai_generated: p.ai_generated || false
            }))
            this.loading = false
            this.lastFetch = Date.now()
            return
          }
        }
      } catch (e) {
        console.log('Backend API not available, trying Strapi...')
      }

      // Try Strapi as fallback
      try {
        const config = useRuntimeConfig()
        const strapiUrl = config.public.strapiUrl || 'http://localhost:1337'
        const apiToken = config.public.strapiApiToken
        
        const response = await fetch(`${strapiUrl}/api/products?populate=*`, {
          headers: apiToken ? { Authorization: `Bearer ${apiToken}` } : {}
        })
        if (response.ok) {
          const result = await response.json()
          if (result.data && result.data.length > 0) {
            this.products = result.data.map((p: any) => ({
              id: p.id,
              name: p.title || p.name,
              slug: p.slug,
              description: p.description,
              shortDescription: p.shortDescription,
              price: parseFloat(p.price) || 0,
              originalPrice: p.salePrice ? parseFloat(p.salePrice) : undefined,
              image: p.images?.[0]?.url ? `${strapiUrl}${p.images[0].url}` : '',
              images: p.images?.map((img: any) => `${strapiUrl}${img.url}`) || [],
              categoryId: p.category?.id || 1,
              rating: 4.5,
              reviewCount: 0,
              sales: p.downloads || 0,
              featured: p.featured || false,
              tags: p.tags || [],
              fileFormat: p.fileFormat,
              fileSize: p.fileSize
            }))
            this.loading = false
            this.lastFetch = Date.now()
            return
          }
        }
      } catch (e) {
        console.log('Strapi not available, using mock data')
      }
      
      // Fall back to mock data
      this.products = this.getMockProducts()
      this.loading = false
    },

    async fetchCategories() {
      // Try Backend API first
      try {
        const response = await fetch('http://localhost:8080/api/v1/categories')
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data?.length > 0) {
            this.categories = result.data.map((c: any) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
              description: c.description || '',
              productCount: c.product_count || 0
            }))
            return
          }
        }
      } catch (e) {
        console.log('Backend API not available for categories, trying Strapi...')
      }

      // Try Strapi as fallback
      try {
        const config = useRuntimeConfig()
        const strapiUrl = config.public.strapiUrl || 'http://localhost:1337'
        const apiToken = config.public.strapiApiToken
        
        const response = await fetch(`${strapiUrl}/api/categories?populate=*`, {
          headers: apiToken ? { Authorization: `Bearer ${apiToken}` } : {}
        })
        if (response.ok) {
          const result = await response.json()
          if (result.data && result.data.length > 0) {
            this.categories = result.data.map((c: any) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
              description: c.description || '',
              productCount: 0
            }))
            return
          }
        }
      } catch (e) {
        console.log('Strapi not available for categories')
      }
      
      // Fall back to defaults
      this.categories = [
        { id: 1, name: 'Graphics', slug: 'graphics', description: 'Premium graphics and illustrations', productCount: 18 },
        { id: 2, name: 'Fonts', slug: 'fonts', description: 'Professional typefaces', productCount: 7 },
        { id: 3, name: 'Templates', slug: 'templates', description: 'Ready-to-use templates', productCount: 10 },
        { id: 4, name: '3D Assets', slug: '3d-assets', description: '3D models and icons', productCount: 4 }
      ]
    },

    getMockProducts(): Product[] {
      return [
        // Graphics - Logos & Branding
        {
          id: 1,
          name: 'Premium Logo Bundle',
          slug: 'premium-logo-bundle',
          description: 'Professional logo templates for modern brands with 50+ variations',
          price: 2499,
          originalPrice: 4999,
          image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400',
          categoryId: 1,
          rating: 4.8,
          reviewCount: 234,
          sales: 1250,
          featured: true,
          tags: ['logo', 'branding', 'bundle']
        },
        {
          id: 2,
          name: 'Minimalist Logo Pack',
          slug: 'minimalist-logo-pack',
          description: 'Clean and modern minimalist logo designs',
          price: 1499,
          image: 'https://images.unsplash.com/photo-1634942537034-2531766767d1?w=400',
          categoryId: 1,
          rating: 4.9,
          reviewCount: 456,
          sales: 2100,
          featured: true,
          tags: ['logo', 'minimalist', 'modern']
        },
        {
          id: 3,
          name: 'Vintage Badge Collection',
          slug: 'vintage-badge-collection',
          description: 'Retro-style badges and emblems for authentic branding',
          price: 1799,
          originalPrice: 2999,
          image: 'https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=400',
          categoryId: 1,
          rating: 4.7,
          reviewCount: 189,
          sales: 890,
          featured: false,
          tags: ['vintage', 'badge', 'retro']
        },

        // Graphics - Illustrations
        {
          id: 4,
          name: 'Hand-Drawn Illustration Bundle',
          slug: 'hand-drawn-illustration-bundle',
          description: 'Beautiful hand-drawn illustrations for creative projects',
          price: 2999,
          originalPrice: 5999,
          image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400',
          categoryId: 1,
          rating: 4.9,
          reviewCount: 567,
          sales: 3200,
          featured: true,
          tags: ['illustration', 'hand-drawn', 'creative']
        },
        {
          id: 5,
          name: 'Abstract Shape Library',
          slug: 'abstract-shape-library',
          description: '500+ abstract shapes and geometric elements',
          price: 1299,
          image: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400',
          categoryId: 1,
          rating: 4.6,
          reviewCount: 312,
          sales: 1560,
          featured: false,
          tags: ['abstract', 'shapes', 'geometric']
        },
        {
          id: 6,
          name: 'Character Design Kit',
          slug: 'character-design-kit',
          description: 'Customizable character illustrations with multiple poses',
          price: 3499,
          image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
          categoryId: 1,
          rating: 4.8,
          reviewCount: 423,
          sales: 1890,
          featured: true,
          tags: ['character', 'illustration', 'people']
        },

        // Graphics - Icons
        {
          id: 7,
          name: '3D Icon Mega Pack',
          slug: '3d-icon-mega-pack',
          description: '1000+ stunning 3D icons for modern interfaces',
          price: 3999,
          originalPrice: 7999,
          image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400',
          categoryId: 1,
          rating: 4.9,
          reviewCount: 1234,
          sales: 5600,
          featured: true,
          tags: ['3d', 'icons', 'ui']
        },
        {
          id: 8,
          name: 'Line Icon System',
          slug: 'line-icon-system',
          description: '2000+ vector line icons in multiple styles',
          price: 1999,
          image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400',
          categoryId: 1,
          rating: 4.8,
          reviewCount: 892,
          sales: 4200,
          featured: true,
          tags: ['icons', 'line', 'vector']
        },
        {
          id: 9,
          name: 'Animated Icon Pack',
          slug: 'animated-icon-pack',
          description: 'Smooth animated icons for web and mobile apps',
          price: 2499,
          image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400',
          categoryId: 1,
          rating: 4.7,
          reviewCount: 345,
          sales: 1670,
          featured: false,
          tags: ['animated', 'icons', 'motion']
        },

        // Fonts - Serif
        {
          id: 10,
          name: 'Elegant Serif Font Family',
          slug: 'elegant-serif-font-family',
          description: 'Sophisticated serif typeface with 8 weights',
          price: 2999,
          image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400',
          categoryId: 2,
          rating: 4.9,
          reviewCount: 678,
          sales: 2890,
          featured: true,
          tags: ['serif', 'elegant', 'font']
        },
        {
          id: 11,
          name: 'Vintage Serif Collection',
          slug: 'vintage-serif-collection',
          description: 'Classic vintage serif fonts for retro designs',
          price: 1799,
          originalPrice: 2999,
          image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400',
          categoryId: 2,
          rating: 4.7,
          reviewCount: 234,
          sales: 1450,
          featured: false,
          tags: ['vintage', 'serif', 'retro']
        },

        // Fonts - Sans Serif
        {
          id: 12,
          name: 'Modern Sans Font Bundle',
          slug: 'modern-sans-font-bundle',
          description: 'Contemporary sans serif fonts for digital projects',
          price: 2499,
          image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400',
          categoryId: 2,
          rating: 4.8,
          reviewCount: 512,
          sales: 2340,
          featured: true,
          tags: ['sans-serif', 'modern', 'font']
        },
        {
          id: 13,
          name: 'Geometric Sans Family',
          slug: 'geometric-sans-family',
          description: 'Clean geometric sans serif with multiple weights',
          price: 1999,
          image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
          categoryId: 2,
          rating: 4.9,
          reviewCount: 423,
          sales: 1890,
          featured: true,
          tags: ['geometric', 'sans-serif', 'clean']
        },

        // Fonts - Script & Handwritten
        {
          id: 14,
          name: 'Signature Script Font',
          slug: 'signature-script-font',
          description: 'Elegant handwritten script for luxury branding',
          price: 1499,
          image: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=400',
          categoryId: 2,
          rating: 4.8,
          reviewCount: 345,
          sales: 1670,
          featured: false,
          tags: ['script', 'handwritten', 'signature']
        },
        {
          id: 15,
          name: 'Brush Lettering Pack',
          slug: 'brush-lettering-pack',
          description: 'Authentic brush lettering fonts with natural flow',
          price: 1799,
          originalPrice: 2999,
          image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400',
          categoryId: 2,
          rating: 4.7,
          reviewCount: 267,
          sales: 980,
          featured: false,
          tags: ['brush', 'lettering', 'handwritten']
        },

        // Templates - Web
        {
          id: 16,
          name: 'Landing Page Template Kit',
          slug: 'landing-page-template-kit',
          description: '20 responsive landing page templates',
          price: 4999,
          originalPrice: 9999,
          image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400',
          categoryId: 3,
          rating: 4.9,
          reviewCount: 789,
          sales: 3450,
          featured: true,
          tags: ['landing', 'web', 'template']
        },
        {
          id: 17,
          name: 'Dashboard UI Kit Pro',
          slug: 'dashboard-ui-kit-pro',
          description: 'Complete admin dashboard with 100+ components',
          price: 6999,
          image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f771?w=400',
          categoryId: 3,
          rating: 4.8,
          reviewCount: 567,
          sales: 2100,
          featured: true,
          tags: ['dashboard', 'admin', 'ui-kit']
        },
        {
          id: 18,
          name: 'E-commerce Template Bundle',
          slug: 'ecommerce-template-bundle',
          description: 'Full e-commerce website templates with cart & checkout',
          price: 7999,
          originalPrice: 14999,
          image: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=400',
          categoryId: 3,
          rating: 4.9,
          reviewCount: 892,
          sales: 4200,
          featured: true,
          tags: ['ecommerce', 'shop', 'template']
        },

        // Templates - Social Media
        {
          id: 19,
          name: 'Instagram Story Templates',
          slug: 'instagram-story-templates',
          description: '100+ Instagram story templates for businesses',
          price: 1299,
          image: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400',
          categoryId: 3,
          rating: 4.7,
          reviewCount: 1234,
          sales: 5600,
          featured: true,
          tags: ['instagram', 'social', 'stories']
        },
        {
          id: 20,
          name: 'Social Media Mega Pack',
          slug: 'social-media-mega-pack',
          description: 'Complete social media templates for all platforms',
          price: 2499,
          originalPrice: 4999,
          image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400',
          categoryId: 3,
          rating: 4.8,
          reviewCount: 678,
          sales: 3890,
          featured: true,
          tags: ['social', 'marketing', 'bundle']
        },

        // Templates - Print
        {
          id: 21,
          name: 'Business Card Templates',
          slug: 'business-card-templates',
          description: '50 professional business card designs',
          price: 999,
          image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400',
          categoryId: 3,
          rating: 4.6,
          reviewCount: 345,
          sales: 1670,
          featured: false,
          tags: ['business-card', 'print', 'corporate']
        },
        {
          id: 22,
          name: 'Flyer & Poster Bundle',
          slug: 'flyer-poster-bundle',
          description: 'Marketing flyers and posters for events',
          price: 1799,
          image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400',
          categoryId: 3,
          rating: 4.7,
          reviewCount: 234,
          sales: 1450,
          featured: false,
          tags: ['flyer', 'poster', 'marketing']
        },

        // 3D Assets
        {
          id: 23,
          name: '3D Mockup Collection',
          slug: '3d-mockup-collection',
          description: 'Professional 3D mockups for product presentation',
          price: 3499,
          originalPrice: 6999,
          image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=400',
          categoryId: 4,
          rating: 4.9,
          reviewCount: 512,
          sales: 2340,
          featured: true,
          tags: ['3d', 'mockup', 'presentation']
        },
        {
          id: 24,
          name: 'Device Mockup Bundle',
          slug: 'device-mockup-bundle',
          description: 'iPhone, MacBook, iPad mockups in various angles',
          price: 2999,
          image: 'https://images.unsplash.com/photo-1592286927505-b0c2e0a13e60?w=400',
          categoryId: 4,
          rating: 4.8,
          reviewCount: 423,
          sales: 1890,
          featured: true,
          tags: ['device', 'mockup', 'apple']
        },
        {
          id: 25,
          name: '3D Character Pack',
          slug: '3d-character-pack',
          description: 'Rigged 3D characters for animation projects',
          price: 4999,
          image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
          categoryId: 4,
          rating: 4.7,
          reviewCount: 267,
          sales: 980,
          featured: false,
          tags: ['3d', 'character', 'animation']
        },

        // More Graphics
        {
          id: 26,
          name: 'Gradient Background Pack',
          slug: 'gradient-background-pack',
          description: '500+ premium gradient backgrounds',
          price: 999,
          originalPrice: 1999,
          image: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400',
          categoryId: 1,
          rating: 4.8,
          reviewCount: 892,
          sales: 4200,
          featured: true,
          tags: ['gradient', 'background', 'colors']
        },
        {
          id: 27,
          name: 'Pattern Library Pro',
          slug: 'pattern-library-pro',
          description: 'Seamless patterns for web and print design',
          price: 1499,
          image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400',
          categoryId: 1,
          rating: 4.7,
          reviewCount: 345,
          sales: 1670,
          featured: false,
          tags: ['pattern', 'seamless', 'texture']
        },
        {
          id: 28,
          name: 'Infographic Elements',
          slug: 'infographic-elements',
          description: 'Charts, graphs, and infographic components',
          price: 1799,
          image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
          categoryId: 1,
          rating: 4.9,
          reviewCount: 567,
          sales: 2890,
          featured: true,
          tags: ['infographic', 'charts', 'data']
        },

        // More Templates
        {
          id: 29,
          name: 'Email Template Collection',
          slug: 'email-template-collection',
          description: 'Responsive email templates for marketing campaigns',
          price: 1999,
          image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400',
          categoryId: 3,
          rating: 4.8,
          reviewCount: 423,
          sales: 1890,
          featured: false,
          tags: ['email', 'marketing', 'newsletter']
        },
        {
          id: 30,
          name: 'Presentation Template Bundle',
          slug: 'presentation-template-bundle',
          description: 'PowerPoint & Keynote presentation templates',
          price: 2499,
          originalPrice: 4999,
          image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400',
          categoryId: 3,
          rating: 4.9,
          reviewCount: 678,
          sales: 3200,
          featured: true,
          tags: ['presentation', 'powerpoint', 'keynote']
        },

        // Additional Products
        {
          id: 31,
          name: 'Texture Pack Pro',
          slug: 'texture-pack-pro',
          description: 'High-resolution textures for 3D and design',
          price: 2799,
          image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400',
          categoryId: 4,
          rating: 4.6,
          reviewCount: 234,
          sales: 1450,
          featured: false,
          tags: ['texture', '3d', 'materials']
        },
        {
          id: 32,
          name: 'Watercolor Graphics Bundle',
          slug: 'watercolor-graphics-bundle',
          description: 'Beautiful watercolor illustrations and elements',
          price: 1999,
          image: 'https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=400',
          categoryId: 1,
          rating: 4.8,
          reviewCount: 456,
          sales: 2100,
          featured: false,
          tags: ['watercolor', 'illustration', 'artistic']
        },
        {
          id: 33,
          name: 'Mobile App UI Kit',
          slug: 'mobile-app-ui-kit',
          description: 'Complete mobile app design system',
          price: 3999,
          originalPrice: 7999,
          image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
          categoryId: 3,
          rating: 4.9,
          reviewCount: 789,
          sales: 3450,
          featured: true,
          tags: ['mobile', 'app', 'ui-kit']
        },
        {
          id: 34,
          name: 'Calligraphy Font Collection',
          slug: 'calligraphy-font-collection',
          description: 'Elegant calligraphy fonts for wedding invitations',
          price: 1699,
          image: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=400',
          categoryId: 2,
          rating: 4.7,
          reviewCount: 312,
          sales: 1560,
          featured: false,
          tags: ['calligraphy', 'wedding', 'elegant']
        },
        {
          id: 35,
          name: 'Isometric Illustration Pack',
          slug: 'isometric-illustration-pack',
          description: 'Modern isometric illustrations for tech projects',
          price: 2999,
          image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
          categoryId: 1,
          rating: 4.8,
          reviewCount: 567,
          sales: 2890,
          featured: true,
          tags: ['isometric', 'illustration', 'tech']
        },
        {
          id: 36,
          name: 'Sticker Pack Bundle',
          slug: 'sticker-pack-bundle',
          description: 'Fun stickers for messaging apps and social media',
          price: 799,
          image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400',
          categoryId: 1,
          rating: 4.6,
          reviewCount: 234,
          sales: 1450,
          featured: false,
          tags: ['sticker', 'emoji', 'fun']
        },
        // eCut Plugin — has landing page
        {
          id: 37,
          name: 'eCut Plugin for CorelDRAW',
          slug: 'ecut-plugin',
          description: 'The most powerful CorelDRAW plugin. 50+ pro tools — smart cut lines, nesting, color separation, batch processing and more.',
          price: 2999,
          originalPrice: 5999,
          image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800',
          categoryId: 3,
          rating: 4.9,
          reviewCount: 1247,
          sales: 12000,
          featured: true,
          tags: ['coreldraw', 'plugin', 'tools', 'automation']
        }
      ]
    },

    async fetchProduct(id: number) {
      try {
        const apiBase = 'http://localhost:8080/api'
        const product = await $fetch(`${apiBase}/public/products/${id}`)
        return product as Product
      } catch (error) {
        console.error(error)
        return null
      }
    },

    setFilter(key: keyof typeof this.filters, value: any) {
      this.filters[key] = value as never
    },

    setSort(sort: typeof this.sort) {
      this.sort = sort
    },

    clearFilters() {
      this.filters = {
        category: null,
        minPrice: null,
        maxPrice: null,
        search: ''
      }
    }
  }
})
