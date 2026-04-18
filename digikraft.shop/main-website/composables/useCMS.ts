// Composable for fetching CMS data from Strapi
export const useCMS = () => {
  const strapiUrl = 'http://localhost:1337'

  // Fetch site settings
  const useSiteSettings = async () => {
    const { data } = await useFetch<{ data: { attributes: Record<string, unknown> } }>(
      `${strapiUrl}/api/site-setting`,
      { params: { populate: '*' } }
    )
    return computed(() => data.value?.data?.attributes || {})
  }

  // Fetch sidebar widgets
  const useSidebarWidgets = async (position: 'left' | 'right') => {
    const { data } = await useFetch<{ data: unknown[] }>(`${strapiUrl}/api/sidebar-widgets`, {
      params: {
        'filters[position][$eq]': position,
        'filters[isActive][$eq]': true,
        'populate': '*',
        'sort': 'order:asc'
      }
    })
    return computed(() => data.value?.data || [])
  }

  // Fetch homepage sections
  const useHomepageSections = async () => {
    const { data } = await useFetch<{ data: unknown[] }>(`${strapiUrl}/api/homepage-sections`, {
      params: {
        'filters[isActive][$eq]': true,
        'populate': '*',
        'sort': 'order:asc'
      }
    })
    return computed(() => data.value?.data || [])
  }

  // Fetch active marketing banners
  const useMarketingBanners = async (position?: string) => {
    const now = new Date().toISOString()
    const params: Record<string, unknown> = {
      'filters[isActive][$eq]': true,
      'filters[$or][0][startDate][$null]': true,
      'filters[$or][1][startDate][$lte]': now,
      'filters[$or][2][endDate][$null]': true,
      'filters[$or][3][endDate][$gte]': now,
      'populate': '*',
      'sort': 'order:asc'
    }
    
    if (position) {
      params['filters[position][$eq]'] = position
    }

    const { data } = await useFetch<{ data: unknown[] }>(`${strapiUrl}/api/marketing-banners`, { params })
    return computed(() => data.value?.data || [])
  }

  // Fetch blog posts
  const useBlogPosts = async (category?: string, limit?: number) => {
    const params: Record<string, unknown> = {
      'populate': '*',
      'sort': 'createdAt:desc'
    }
    
    if (category) {
      params['filters[category][$eq]'] = category
    }
    
    if (limit) {
      params['pagination[limit]'] = limit
    }

    const { data } = await useFetch<{ data: unknown[] }>(`${strapiUrl}/api/blog-posts`, { params })
    return computed(() => data.value?.data || [])
  }

  // Fetch single blog post by slug
  const useBlogPost = async (slug: string) => {
    const { data } = await useFetch<{ data: Array<{ attributes: Record<string, unknown> }> }>(
      `${strapiUrl}/api/blog-posts`,
      {
        params: {
          'filters[slug][$eq]': slug,
          'populate': '*'
        }
      }
    )
    return computed(() => data.value?.data?.[0]?.attributes || null)
  }

  // Fetch navigation menu
  const useNavigationMenu = async (position: string) => {
    const { data } = await useFetch<{ data: unknown[] }>(`${strapiUrl}/api/navigation-menus`, {
      params: {
        'filters[position][$eq]': position,
        'filters[isActive][$eq]': true,
        'populate': '*',
        'sort': 'order:asc'
      }
    })
    return computed(() => data.value?.data || [])
  }

  // Helper to get image URL
  const getImageUrl = (image: { data?: { attributes?: { url?: string } }; url?: string } | null | undefined) => {
    if (!image) return ''
    const url = image.data?.attributes?.url || image.url
    return url?.startsWith('http') ? url : `${strapiUrl}${url}`
  }

  return {
    useSiteSettings,
    useSidebarWidgets,
    useHomepageSections,
    useMarketingBanners,
    useBlogPosts,
    useBlogPost,
    useNavigationMenu,
    getImageUrl
  }
}
