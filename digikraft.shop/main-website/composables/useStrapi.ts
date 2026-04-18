export interface StrapiProduct {
  id: number
  documentId: string
  name: string
  description: string
  price: number
  compareAtPrice?: number
  images?: {
    url: string
    alternativeText?: string
  }[]
  category?: {
    name: string
    slug: string
  }
  slug: string
  featured: boolean
  inStock: boolean
  createdAt: string
  updatedAt: string
}

export interface StrapiCategory {
  id: number
  documentId: string
  name: string
  slug: string
  description?: string
  image?: {
    url: string
  }
}

export const useStrapi = () => {
  const config = useRuntimeConfig()
  const strapiUrl = config.public.strapiUrl as string
  const apiToken = config.strapiApiToken as string

  const fetchFromStrapi = async <T>(endpoint: string): Promise<T> => {
    const response = await $fetch<T>(`${strapiUrl}/api${endpoint}`, {
      headers: {
        Authorization: `Bearer ${apiToken}`
      }
    })
    return response
  }

  const getProducts = async (params?: {
    populate?: string
    filters?: Record<string, any>
    sort?: string
    pagination?: { page: number; pageSize: number }
  }): Promise<{ data: StrapiProduct[]; meta: any }> => {
    const queryParams = new URLSearchParams()
    
    if (params?.populate) {
      queryParams.append('populate', params.populate)
    }
    if (params?.sort) {
      queryParams.append('sort', params.sort)
    }
    if (params?.pagination) {
      queryParams.append('pagination[page]', params.pagination.page.toString())
      queryParams.append('pagination[pageSize]', params.pagination.pageSize.toString())
    }
    
    const endpoint = `/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return fetchFromStrapi(endpoint)
  }

  const getProductBySlug = async (slug: string): Promise<StrapiProduct | null> => {
    const { data } = await fetchFromStrapi<{ data: StrapiProduct[] }>(
      `/products?filters[slug][$eq]=${slug}&populate=*`
    )
    return data?.[0] || null
  }

  const getFeaturedProducts = async (limit = 4): Promise<StrapiProduct[]> => {
    const { data } = await fetchFromStrapi<{ data: StrapiProduct[] }>(
      `/products?filters[featured][$eq]=true&populate=*&pagination[limit]=${limit}`
    )
    return data || []
  }

  const getCategories = async (): Promise<StrapiCategory[]> => {
    const { data } = await fetchFromStrapi<{ data: StrapiCategory[] }>('/categories?populate=*')
    return data || []
  }

  const getProductsByCategory = async (categorySlug: string): Promise<StrapiProduct[]> => {
    const { data } = await fetchFromStrapi<{ data: StrapiProduct[] }>(
      `/products?filters[category][slug][$eq]=${categorySlug}&populate=*`
    )
    return data || []
  }

  const getImageUrl = (imagePath: string): string => {
    if (!imagePath) return ''
    if (imagePath.startsWith('http')) return imagePath
    return `${strapiUrl}${imagePath}`
  }

  return {
    getProducts,
    getProductBySlug,
    getFeaturedProducts,
    getCategories,
    getProductsByCategory,
    getImageUrl,
    strapiUrl
  }
}
