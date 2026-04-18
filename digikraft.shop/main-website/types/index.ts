// Product Types
export interface Product {
  id: number
  name: string
  slug: string
  description: string
  price: number
  originalPrice?: number
  image: string
  images?: string[]
  categoryId: number
  rating?: number
  reviewCount?: number
  sales?: number
  featured?: boolean
  tags?: string[]
  isDigital?: boolean
  digitalMetadata?: DigitalProductMetadata
  files?: ProductFile[]
  license?: LicenseInfo
  downloadCount?: number
  lastUpdated?: Date
  linked_blog_posts?: any[]
}

export interface DigitalProductMetadata {
  fileSize: string
  totalFiles: number
  fileFormats: string[]
  compatibility: string[]
  includesSourceFiles: boolean
  includesDocumentation: boolean
  updateFrequency: 'lifetime' | 'yearly' | 'none'
  version: string
  lastVersionUpdate?: Date
  demoUrl?: string
  previewImages?: string[]
}

export interface ProductFile {
  id: string
  name: string
  format: string
  size: string
  description: string
}

export interface LicenseInfo {
  type: 'personal' | 'commercial' | 'extended'
  allowsCommercialUse: boolean
  allowsRedistribution: boolean
  allowsResale: boolean
  projectLimit?: number
  description: string
}

// Category Types
export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  productCount?: number
}

// Cart Types
export interface CartItem {
  product: Product
  quantity: number
}

// User Types
export interface User {
  id: number
  name: string
  email: string
  role: 'customer' | 'sub_admin' | 'super_admin'
  avatar?: string
}

// Order Types
export interface Order {
  id: number
  userId: number
  status: 'pending' | 'paid' | 'processing' | 'completed' | 'failed' | 'refunded'
  total: number
  currency: string
  paymentGateway: string
  paymentId: string
  items: CartItem[]
  createdAt: string
}

// Hub Types
export interface Hub {
  id: number
  name: string
  slug: string
  description: string
  icon: string
  iconBg: string
  iconColor: string
  buttonClass: string
}
