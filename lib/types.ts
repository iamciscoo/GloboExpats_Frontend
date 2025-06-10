import { LucideIcon } from "lucide-react"

export interface User {
  name: string
  email: string
  avatar: string
  isVerified?: boolean
  isAdmin?: boolean
}

export interface CarouselItem {
  id: string
  category: string
  image: string
}

export interface Category {
  id: string
  name: string
  icon: React.ElementType
  slug: string
}

export interface TrustIndicator {
  color: string
  text: string
}

export interface Currency {
  code: string
  name: string
}

export interface ListingItem {
  id: number
  title: string
  price: number
  currency: string
  image: string
  seller: {
    name: string
    avatar: string
    verified: boolean
  }
  category: string
  location: string
  featured?: boolean
}

export interface FeaturedItem {
  id: number
  title: string
  price: string
  originalPrice?: string
  image: string
  seller: string
  rating: number
  reviews: number
  location: string
  isVerified: boolean
  isPremium: boolean
  premiumLabel?: string
}

// Messaging system types
export interface Conversation {
  id: number
  name: string
  avatar: string
  lastMessage: string
  time: string
  unread: number
  product: string
  online: boolean
}

export interface Message {
  sender: string
  text: string
  time: string
}

export interface Product {
  name: string
  price: string
  condition: string
  image: string
}

export interface ChatData {
  product: Partial<Product>
  messages: Message[]
}

export interface MessagesData {
  [key: number]: ChatData
}

// Seller/Product management types
export interface ProductListing {
  id: number
  title: string
  price: string
  originalPrice?: string
  status: 'Active' | 'Sold' | 'Pending' | 'Draft' | 'Expired'
  views: number
  inquiries: number
  favorites: number
  image: string
  category: string
  condition: string
  datePosted: string
  expiresOn?: string
  soldOn?: string
  premium: boolean
  featured: boolean
}

export interface Order {
  id: string
  buyer: string
  product: string
  amount: string
  status: 'Completed' | 'In Progress' | 'Pending' | 'Cancelled'
  date: string
}

export interface Review {
  id: number
  buyer: string
  rating: number
  comment: string
  date: string
  product: string
}

export interface Notification {
  id: number
  type: 'message' | 'order' | 'review' | 'payment' | 'system'
  title: string
  message: string
  time: string
  read: boolean
  actionUrl?: string
}

// Category and selling types
export interface CategoryWithRequirements {
  value: string
  label: string
  imageRequirements: string[]
}

export interface ItemCondition {
  value: string
  label: string
  description: string
}

export interface SellingTip {
  icon: React.ComponentType
  title: string
  description: string
}

// Location and language types
export interface Location {
  value: string
  label: string
  country?: string
}

export interface Language {
  code: string
  name: string
  nativeName?: string
}

// Premium plan types
export interface PremiumPlan {
  id: string
  name: string
  price: string
  period: string
  description: string
  features: string[]
  popular?: boolean
  color: string
}

// Chart data types
export interface ChartDataPoint {
  name: string
  earnings: number
  views: number
}

// Filter types
export interface PriceRange {
  min: number
  max: number
}

export interface FilterOptions {
  category?: string
  location?: string
  priceRange?: PriceRange
  condition?: string
  sellerType?: string[]
}

// Admin types
export interface OverdueItem {
  id: number
  title: string
  seller: {
    name: string
    email: string
    avatar?: string
  }
  listedDate: string
  notifications: number
  price: string
  category: string
}

export interface ArchivedItem extends OverdueItem {
  archivedDate: string
  reason: string
} 