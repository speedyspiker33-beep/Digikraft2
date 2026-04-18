// ===== SITE CONFIG COMPOSABLE =====
// Reads configuration set by the admin panel (localStorage: dk_site_config)
// Also syncs with backend settings for cross-browser persistence

export const useSiteConfig = () => {
  const config = useRuntimeConfig()

  function getDefaults() {
    return {
      // TopBar
      topbar: {
        enabled: true,
        announcement: '',
        announcementEnabled: false,
        announcementColor: '#6366f1',
        socialLinks: {
          whatsapp: 'https://wa.me/1234567890',
          instagram: 'https://instagram.com/digikraft',
          youtube: 'https://youtube.com/@digikraft',
          telegram: 'https://t.me/digikraft',
          facebook: '',
          twitter: ''
        },
        navLinks: [
          { label: 'Guides', href: '/blog?category=guides', enabled: true },
          { label: 'About', href: '/about', enabled: true },
          { label: 'Help', href: '/help', enabled: true },
          { label: 'FAQ', href: '/faq', enabled: true },
          { label: 'Ticket', href: '/ticket', enabled: true },
        ]
      },
      // Right Sidebar
      rightSidebar: {
        enabled: true,
        sections: {
          tools: { enabled: true, title: 'Tools' },
          hotOffers: { enabled: true, title: 'Hot Offers' },
          trending: { enabled: true, title: 'Trending Now' },
          blogFeed: { enabled: true, title: 'Latest Articles' },
          newsletter: { enabled: true, title: 'Stay Updated' },
          promo: { enabled: false, title: 'Special Offer' }
        },
        hotOffers: [
          { id: '1', title: 'Premium UI Kit Bundle', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop', originalPrice: 4999, salePrice: 2499, discount: 50, link: '/products' },
          { id: '2', title: 'Modern Icon Set Collection', image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=300&fit=crop', originalPrice: 2999, salePrice: 1499, discount: 50, link: '/products' }
        ],
        trending: [
          { id: '1', title: 'Minimalist Logo Templates', image: 'https://images.unsplash.com/photo-1634942537034-2531766767d1?w=200&h=200&fit=crop', rating: 4.8, sales: '2.3k', link: '/products' },
          { id: '2', title: 'Social Media Graphics Pack', image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=200&fit=crop', rating: 4.9, sales: '1.8k', link: '/products' },
          { id: '3', title: 'Vintage Font Collection', image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=200&h=200&fit=crop', rating: 4.7, sales: '1.5k', link: '/products' }
        ],
        blogFeed: [],
        promo: { title: 'Special Offer', description: '', image: '', link: '', buttonText: 'Shop Now', bgColor: '#6366f1' }
      },
      // Homepage sections
      homepage: {
        heroEnabled: true,
        heroTitle: 'Featured',
        heroTitleAccent: 'Graphics',
        featuredEnabled: true,
        hubCardsEnabled: true,
        newsletterEnabled: true,
        announcementBannerEnabled: false,
        announcementBannerText: '🎉 Special Sale — 50% off all products!',
        announcementBannerColor: '#6366f1',
        announcementBannerLink: '/products'
      },
      // Blog
      blog: {
        articles: []
      },
      // Branding
      branding: {
        siteName: 'DigiKraft',
        tagline: 'Premium Digital Marketplace',
        primaryColor: '#6366f1',
        logoUrl: '',
        faviconUrl: ''
      }
    }
  }

  const getConfig = () => {
    if (typeof localStorage === 'undefined') return getDefaults()
    try {
      const stored = localStorage.getItem('dk_site_config')
      if (!stored) return getDefaults()
      // Deep merge: defaults first, then stored values override
      const parsed = JSON.parse(stored)
      return deepMergeConfig(getDefaults(), parsed)
    } catch { return getDefaults() }
  }

  // Deep merge helper — stored values override defaults, preserving nested structure
  function deepMergeConfig(defaults: any, overrides: any): any {
    const out = { ...defaults }
    for (const k in overrides) {
      if (overrides[k] && typeof overrides[k] === 'object' && !Array.isArray(overrides[k]) && defaults[k] && typeof defaults[k] === 'object') {
        out[k] = deepMergeConfig(defaults[k], overrides[k])
      } else {
        out[k] = overrides[k]
      }
    }
    return out
  }

  // Reactive config ref — initialized from localStorage
  const siteConfig = ref(getConfig())

  // Load from backend (cross-origin sync: admin panel on :3000 → backend → main website on :3001)
  const loadFromBackend = async () => {
    try {
      const res = await $fetch<any>(`${config.public.apiBase}/v1/settings/public`)
      if (res.success && res.data) {
        const s = res.data
        // Full site_config JSON stored by admin panel — use as source of truth
        if (s.site_config) {
          try {
            const backendCfg = JSON.parse(s.site_config)
            const merged = deepMergeConfig(getDefaults(), backendCfg)
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem('dk_site_config', JSON.stringify(merged))
            }
            siteConfig.value = merged
            return merged
          } catch (e) {}
        }
        // Fallback: apply individual settings fields only
        const current = getConfig()
        if (s.site_name) {
          if (!current.branding) current.branding = {}
          current.branding.siteName = s.site_name
          current.branding.tagline = s.site_tagline || current.branding.tagline
        }
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('dk_site_config', JSON.stringify(current))
        }
        siteConfig.value = current
        return current
      }
    } catch (e) {
      // Backend not available — use localStorage config silently
    }
    return getConfig()
  }

  // Refresh config from localStorage (call after admin saves on same origin)
  const refresh = () => { siteConfig.value = getConfig() }

  return { config: siteConfig, refresh, getDefaults, loadFromBackend }
}
