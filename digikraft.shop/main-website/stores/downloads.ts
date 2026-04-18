import { defineStore } from 'pinia'

export interface DownloadFile {
  id: string
  name: string
  format: string
  size: string
  version: string
  uploadDate: Date
}

export interface LicenseInfo {
  type: 'personal' | 'commercial' | 'extended'
  allowsCommercialUse: boolean
  allowsRedistribution: boolean
  allowsResale: boolean
  projectLimit?: number
  description: string
}

export interface UserDownload {
  id: string
  productId: string
  productName: string
  productImage: string
  productSlug: string
  purchaseDate: Date
  orderId: string
  orderNumber: string
  downloadCount: number
  lastDownloadDate?: Date
  files: DownloadFile[]
  license: LicenseInfo
}

export const useDownloadsStore = defineStore('downloads', {
  state: () => ({
    userDownloads: [] as UserDownload[],
    loading: false,
    error: null as string | null,
    pagination: {
      page: 1,
      limit: 12,
      total: 0,
      hasMore: false
    }
  }),

  getters: {
    downloadCount: (state) => state.userDownloads.length,
    
    recentDownloads: (state) => {
      return [...state.userDownloads]
        .sort((a, b) => b.purchaseDate.getTime() - a.purchaseDate.getTime())
        .slice(0, 6)
    }
  },

  actions: {
    async fetchUserDownloads(page = 1) {
      this.loading = true
      this.error = null
      
      try {
        const config = useRuntimeConfig()
        const authStore = useAuthStore()
        
        if (!authStore.token) {
          this.userDownloads = this.getMockDownloads()
          return
        }

        const response = await $fetch<any>(`${config.public.apiBase}/downloads`, {
          params: { page, limit: this.pagination.limit },
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        })
        
        this.userDownloads = response.data
        this.pagination = response.pagination
      } catch (error: any) {
        console.error('Failed to fetch downloads:', error)
        this.error = error.message
        // Use mock data for development
        this.userDownloads = this.getMockDownloads()
      } finally {
        this.loading = false
      }
    },

    async generateDownloadLink(downloadId: string, fileId: string) {
      try {
        const config = useRuntimeConfig()
        const authStore = useAuthStore()
        
        const response = await $fetch<any>(
          `${config.public.apiBase}/downloads/${downloadId}/files/${fileId}/url`,
          {
            headers: {
              Authorization: `Bearer ${authStore.token}`
            }
          }
        )
        
        // Open download URL in new tab
        if (response.data?.url) {
          window.open(response.data.url, '_blank')
        }
        
        // Refresh downloads to update count
        await this.fetchUserDownloads()
        
        return response.data
      } catch (error: any) {
        console.error('Failed to generate download link:', error)
        throw error
      }
    },

    getMockDownloads(): UserDownload[] {
      return [
        {
          id: '1',
          productId: '1',
          productName: 'Premium Logo Bundle',
          productImage: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400',
          productSlug: 'premium-logo-bundle',
          purchaseDate: new Date('2024-01-15'),
          orderId: 'ORD-001',
          orderNumber: 'ORD-20240115-00001',
          downloadCount: 3,
          lastDownloadDate: new Date('2024-01-20'),
          files: [
            {
              id: 'f1',
              name: 'logo-bundle.zip',
              format: 'ZIP',
              size: '45 MB',
              version: '1.0.0',
              uploadDate: new Date('2024-01-10')
            },
            {
              id: 'f2',
              name: 'documentation.pdf',
              format: 'PDF',
              size: '2 MB',
              version: '1.0.0',
              uploadDate: new Date('2024-01-10')
            }
          ],
          license: {
            type: 'commercial',
            allowsCommercialUse: true,
            allowsRedistribution: false,
            allowsResale: false,
            description: 'Use in unlimited commercial projects'
          }
        },
        {
          id: '2',
          productId: '7',
          productName: '3D Icon Mega Pack',
          productImage: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400',
          productSlug: '3d-icon-mega-pack',
          purchaseDate: new Date('2024-01-10'),
          orderId: 'ORD-002',
          orderNumber: 'ORD-20240110-00002',
          downloadCount: 5,
          lastDownloadDate: new Date('2024-01-18'),
          files: [
            {
              id: 'f3',
              name: '3d-icons-pack.zip',
              format: 'ZIP',
              size: '120 MB',
              version: '2.1.0',
              uploadDate: new Date('2024-01-05')
            }
          ],
          license: {
            type: 'extended',
            allowsCommercialUse: true,
            allowsRedistribution: true,
            allowsResale: false,
            projectLimit: undefined,
            description: 'Extended commercial license with redistribution rights'
          }
        }
      ]
    }
  }
})
