export const useCategory = () => {
  const activeCategory = useState<string | null>('activeCategory', () => null)
  const activeSubcategories = useState<any[]>('activeSubcategories', () => [])

  const menuCategoriesData: Record<string, { name: string; subcategories: any[] }> = {
    graphics: {
      name: 'Graphics',
      subcategories: [
        { name: 'Logos & Branding', href: '/category/graphics/logos' },
        { name: 'Illustrations', href: '/category/graphics/illustrations' },
        { name: 'Icons', href: '/category/graphics/icons' },
        { name: 'Patterns', href: '/category/graphics/patterns' },
        { name: 'Vectors', href: '/category/graphics/vectors' }
      ]
    },
    fonts: {
      name: 'Fonts',
      subcategories: [
        { name: 'Display Fonts', href: '/category/fonts/display' },
        { name: 'Script & Handwritten', href: '/category/fonts/script' },
        { name: 'Serif Fonts', href: '/category/fonts/serif' },
        { name: 'Sans Serif', href: '/category/fonts/sans-serif' },
        { name: 'Brush Fonts', href: '/category/fonts/brush' }
      ]
    },
    templates: {
      name: 'Templates',
      subcategories: [
        { name: 'Web Templates', href: '/category/templates/web' },
        { name: 'Social Media', href: '/category/templates/social' },
        { name: 'Print Templates', href: '/category/templates/print' },
        { name: 'Presentations', href: '/category/templates/presentations' },
        { name: 'Email Templates', href: '/category/templates/email' }
      ]
    },
    '3d': {
      name: '3D Assets',
      subcategories: [
        { name: '3D Models', href: '/category/3d/models' },
        { name: '3D Icons', href: '/category/3d/icons' },
        { name: 'Mockups', href: '/category/3d/mockups' },
        { name: 'Textures', href: '/category/3d/textures' }
      ]
    }
  }

  const setActiveCategory = (slug: string | null) => {
    activeCategory.value = slug
    if (slug && menuCategoriesData[slug]) {
      activeSubcategories.value = menuCategoriesData[slug].subcategories
    } else {
      activeSubcategories.value = []
    }
  }

  const getCategoryName = (slug: string) => {
    return menuCategoriesData[slug]?.name || slug
  }

  return {
    activeCategory,
    activeSubcategories,
    setActiveCategory,
    getCategoryName,
    menuCategoriesData
  }
}
