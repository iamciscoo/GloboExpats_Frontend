// Core types for the expat marketplace platform

/**
 * =============================================================================
 * CORE APPLICATION TYPES - SIMPLIFIED
 * =============================================================================
 * Base types used throughout the application for error handling, loading states,
 * and common data structures.
 */

// Base error types for consistent error handling
export interface ApiError {
  message: string
  code: string | number
}

// Loading state pattern used across all async operations
export interface LoadingState {
  isLoading: boolean
  error: ApiError | null
}

/**
 * =============================================================================
 * USER & AUTHENTICATION TYPES - SIMPLIFIED
 * =============================================================================
 */

/**
 * User preferences for personalization
 */
export interface UserPreferences {
  currency: string
  language: string
  theme?: 'light' | 'dark' | 'system'
  notifications?: {
    email: boolean
    push: boolean
    sms: boolean
  }
}

/**
 * Comprehensive verification status for users
 * Clarifies different verification requirements and states
 */
export interface VerificationStatus {
  /** Overall account verification status - true when user can access all features */
  isFullyVerified: boolean

  /** Identity verification (passport, ID documents) */
  isIdentityVerified: boolean

  /** Organization email verification status */
  isOrganizationEmailVerified: boolean

  /** Whether user can buy items (requires organization email at minimum) */
  canBuy: boolean

  /** Whether user can list items (requires full verification) */
  canList: boolean

  /** Whether user can contact other expats */
  canContact: boolean

  /** Current verification step user is on */
  currentStep: 'identity' | 'organization' | 'complete' | null

  /** Any pending verification actions */
  pendingActions: ('upload_documents' | 'verify_email' | 'admin_review')[]
}

// Simplified User interface with essential information only
export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  createdAt: Date
  preferences?: UserPreferences

  // Simplified verification - use VerificationStatus for detailed info
  /** @deprecated Use verificationStatus instead */
  isVerified?: boolean

  /** Comprehensive verification status */
  verificationStatus: VerificationStatus

  /** Organization email (separate from personal email) */
  organizationEmail?: string

  /** How the user signed up (for different verification flows) */
  signupMethod?: 'email' | 'google' | 'facebook' | 'apple'

  /** User role */
  role: 'user' | 'admin' | 'moderator'
}

/**
 * =============================================================================
 * UI & DISPLAY TYPES
 * =============================================================================
 */

// Carousel item configuration
export interface CarouselItem {
  id: string
  category: string
  image: string
  alt?: string
  title?: string
  onClick?: () => void
}

// Category hierarchy and organization
export interface Category {
  id: string
  name: string
  icon: React.ElementType
  slug: string
  description?: string
  isActive?: boolean
}

// Currency support for international users
export interface Currency {
  code: string
  name: string
  symbol?: string
  flag?: string
}

/**
 * =============================================================================
 * MARKETPLACE LISTING TYPES - SIMPLIFIED
 * =============================================================================
 */

// Simplified listing item with essential properties only
export interface ListingItem extends LoadingState {
  id: number
  title: string
  price: number
  currency: string
  image: string
  images?: string[]
  listedBy: ExpatInfo
  category: string
  location: string
  condition?: ItemCondition
  description?: string
  views?: number
  likes?: number
  status?: ListingStatus
}

// Simplified expat information
export interface ExpatInfo {
  id: string
  name: string
  avatar?: string
  verified: boolean
  rating?: number
}

// Listing status enumeration
export type ListingStatus = 'active' | 'sold' | 'pending' | 'draft' | 'expired'

// Simplified featured item for homepage display
export interface FeaturedItem {
  id: number
  title: string
  price: string
  originalPrice?: string
  image: string
  images?: string[]
  listedBy: string
  rating: number
  reviews: number
  location: string
  isVerified: boolean
  isPremium: boolean
}

/**
 * =============================================================================
 * MESSAGING & COMMUNICATION TYPES - SIMPLIFIED
 * =============================================================================
 */

// Simplified conversation thread
export interface Conversation extends LoadingState {
  id: number
  name: string
  avatar?: string
  lastMessage: string
  time: string
  unread: number
  product: string
  online: boolean
}

// Simplified message structure
export interface Message {
  id?: string
  sender: string
  text: string
  time: string
}

// Simplified chat conversation data
export interface ChatData extends LoadingState {
  product: Partial<Product>
  messages: Message[]
}

// Messages data structure
export interface MessagesData {
  [key: number]: ChatData
}

/**
 * =============================================================================
 * PRODUCT & INVENTORY TYPES - SIMPLIFIED
 * =============================================================================
 */

// Simplified product information
export interface Product extends LoadingState {
  id?: string
  name: string
  price: string
  condition: string
  image: string
  images?: string[]
  description?: string
}

/**
 * =============================================================================
 * EXPAT LISTING MANAGEMENT TYPES - SIMPLIFIED
 * =============================================================================
 */

// Simplified product listing for expat management
export interface ProductListing extends LoadingState {
  id: number
  title: string
  price: string
  originalPrice?: string
  status: ListingStatus
  views: number
  inquiries: number
  favorites: number
  image: string
  images?: string[]
  category: string
  condition: string
  datePosted: string
  premium: boolean
}

/**
 * =============================================================================
 * ORDER & TRANSACTION TYPES - SIMPLIFIED
 * =============================================================================
 */

// Simplified order information
export interface Order extends LoadingState {
  id: string
  buyer: BuyerInfo
  listedBy: ExpatInfo
  product: OrderProduct
  amount: string
  currency: string
  status: OrderStatus
  date: string
}

// Buyer information for orders
export interface BuyerInfo {
  id: string
  name: string
  avatar?: string
  verified: boolean
}

// Product information within orders
export interface OrderProduct {
  id: string
  title: string
  image: string
  quantity: number
  price: number
}

// Order status progression
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled'

/**
 * =============================================================================
 * REVIEW & RATING TYPES - SIMPLIFIED
 * =============================================================================
 */

// Simplified review structure
export interface Review extends LoadingState {
  id: number
  buyer: BuyerInfo
  listedBy: ExpatInfo
  rating: number
  comment: string
  date: string
  product: string
  productId: string
}

/**
 * =============================================================================
 * NOTIFICATION TYPES - SIMPLIFIED
 * =============================================================================
 */

// Simplified notification structure
export interface Notification extends LoadingState {
  id: number
  type: NotificationType
  title: string
  message: string
  time: string
  read: boolean
  actionUrl?: string
}

export type NotificationType = 'message' | 'order' | 'review' | 'payment' | 'system'

/**
 * =============================================================================
 * SELLING & CATEGORY TYPES
 * =============================================================================
 */

// Category with basic requirements
export interface CategoryWithRequirements {
  value: string
  label: string
  imageRequirements: string[]
}

// Item condition definitions
export interface ItemCondition {
  value: string
  label: string
  description: string
}

// Selling tips for users
export interface SellingTip {
  icon: React.ComponentType
  title: string
  description: string
}

/**
 * =============================================================================
 * LOCATION & LANGUAGE TYPES
 * =============================================================================
 */

// Location information
export interface Location {
  value: string
  label: string
  country?: string
}

// Language support
export interface Language {
  code: string
  name: string
  nativeName?: string
}

/**
 * =============================================================================
 * SEARCH & FILTERING TYPES - SIMPLIFIED
 * =============================================================================
 */

// Simplified price range
export interface PriceRange {
  min: number
  max: number
  currency?: string
}

// Simplified filter options
export interface FilterOptions {
  category?: string
  location?: string
  priceRange?: PriceRange
  condition?: string
  verified?: boolean
  sortBy?: SortOption
  sortOrder?: 'asc' | 'desc'
}

// Basic sort option
export interface SortOption {
  value: string
  label: string
}

// Simplified search filters
export interface SearchFilters {
  query: string
  category?: string
  location?: string
  priceRange?: PriceRange
  condition?: string[]
}

// Basic pagination
export interface PaginationInfo {
  page: number
  limit: number
  total: number
  hasNext: boolean
  hasPrev: boolean
}

// Search result structure
export interface SearchResult<T> {
  items: T[]
  pagination: PaginationInfo
  filters: SearchFilters
}

/**
 * =============================================================================
 * API RESPONSE TYPES - SIMPLIFIED
 * =============================================================================
 */

// Simple API response wrapper
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  errors?: ApiError[]
}

/**
 * =============================================================================
 * EXPAT & PROFILE TYPES - ENHANCED
 * =============================================================================
 */

// Enhanced expat information with profile data
export interface ExpatProfile {
  id: string
  name: string
  email: string
  avatar?: string
  verified: boolean
  rating: number
  reviewCount: number
  responseTime: string
  location: string
  memberSince: string
  totalListings: number
  completedTransactions: number
  bio?: string
  website?: string
  specialties?: string[]
  languages?: string[]
  verificationBadges: {
    identity: boolean
    email: boolean
    phone: boolean
    address: boolean
  }
  socialLinks?: {
    linkedin?: string
    facebook?: string
    twitter?: string
  }
  businessInfo?: {
    type: 'individual' | 'company' | 'organization'
    companyName?: string
    vatNumber?: string
    businessLicense?: string
  }
}

// Enhanced expat info for product displays
export interface ExpatInfo {
  id: string
  name: string
  avatar?: string
  verified: boolean
  rating?: number
  reviewCount?: number
  location?: string
  responseTime?: string
  profileSlug?: string // URL-friendly identifier
}

// Profile viewing permissions
export interface ProfileViewingRights {
  canViewProfile: boolean
  canViewContactInfo: boolean
  canViewFullHistory: boolean
  canSendMessage: boolean
  reason?: string // If access is denied
}
