/**
 * Application Constants & Configuration - SIMPLIFIED
 *
 * Centralized constants for the Globoexpats platform including UI configuration,
 * category definitions, currency settings, and mock data for development.
 */

import {
  Car,
  Home,
  Smartphone,
  Shirt,
  Dumbbell,
  Book,
  Camera,
  Star,
  DollarSign,
  Package,
  Palette,
  Sprout,
} from 'lucide-react'
import type {
  CategoryWithRequirements,
  ItemCondition,
  SellingTip,
  Language,
  Location,
} from './types'

// ============================================================================
// CURRENCY & LOCALIZATION
// ============================================================================

/**
 * Supported currencies for the platform
 * Includes regional currencies for East Africa and international options
 * countryCode is used for SVG flag rendering to ensure cross-browser compatibility
 */
export const CURRENCIES = [
  { code: 'TZS', name: 'Tanzanian Shilling', countryCode: 'TZ', flag: '🇹🇿' },
  { code: 'KES', name: 'Kenyan Shilling', countryCode: 'KE', flag: '🇰🇪' },
  { code: 'UGX', name: 'Ugandan Shilling', countryCode: 'UG', flag: '🇺🇬' },
  { code: 'USD', name: 'US Dollar', countryCode: 'US', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', countryCode: 'EU', flag: '🇪🇺' },
  { code: 'JPY', name: 'Japanese Yen', countryCode: 'JP', flag: '🇯🇵' },
  { code: 'KRW', name: 'Korean Won', countryCode: 'KR', flag: '🇰🇷' },
  { code: 'CNY', name: 'Chinese Yuan', countryCode: 'CN', flag: '🇨🇳' },
] as const

/**
 * Supported languages with native names
 * Covers major expat communities in East Africa
 */
export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'zh', name: 'Mandarin', nativeName: '中文' },
]

/**
 * Top expat locations and markets
 * Primary cities where the platform operates - focused on East Africa region
 * countryCode is used for SVG flag rendering to ensure cross-browser compatibility
 */
export const EXPAT_LOCATIONS: Location[] = [
  { value: 'dar-es-salaam', label: 'Dar es Salaam, TZ', country: 'Tanzania', countryCode: 'TZ' },
  { value: 'nairobi', label: 'Nairobi, KE', country: 'Kenya', countryCode: 'KE' },
  { value: 'arusha', label: 'Arusha, TZ', country: 'Tanzania', countryCode: 'TZ' },
  { value: 'kampala', label: 'Kampala, UG', country: 'Uganda', countryCode: 'UG' },
  { value: 'zanzibar', label: 'Zanzibar, TZ', country: 'Tanzania', countryCode: 'TZ' },
  { value: 'mombasa', label: 'Mombasa, KE', country: 'Kenya', countryCode: 'KE' },
  { value: 'kigali', label: 'Kigali, RW', country: 'Rwanda', countryCode: 'RW' },
  { value: 'dodoma', label: 'Dodoma, TZ', country: 'Tanzania', countryCode: 'TZ' },
  { value: 'entebbe', label: 'Entebbe, UG', country: 'Uganda', countryCode: 'UG' },
  { value: 'stone-town', label: 'Stone Town, TZ', country: 'Tanzania', countryCode: 'TZ' },
  { value: 'mwanza', label: 'Mwanza, TZ', country: 'Tanzania', countryCode: 'TZ' },
  { value: 'kisumu', label: 'Kisumu, KE', country: 'Kenya', countryCode: 'KE' },
  { value: 'nakuru', label: 'Nakuru, KE', country: 'Kenya', countryCode: 'KE' },
  { value: 'gulu', label: 'Gulu, UG', country: 'Uganda', countryCode: 'UG' },
  { value: 'mbarara', label: 'Mbarara, UG', country: 'Uganda', countryCode: 'UG' },
  { value: 'jinja', label: 'Jinja, UG', country: 'Uganda', countryCode: 'UG' },
]

// ============================================================================
// HOMEPAGE & HERO CONTENT
// ============================================================================

/**
 * Hero carousel items for homepage
 * Featured content showcasing major categories
 */
export const CAROUSEL_ITEMS = [
  {
    id: 1,
    category: 'Vehicles',
    image: '/assets/images/heroes/hero-automotive.jpg',
    title: 'Top Vehicles for Expats',
  },
  {
    id: 2,
    category: 'Furniture',
    image: '/assets/images/heroes/hero-furniture.jpg',
    title: 'Luxury Home Furniture',
  },
  {
    id: 3,
    category: 'Electronics',
    image: '/assets/images/heroes/hero-electronics.jpg',
    title: 'Latest Tech & Electronics',
  },
  {
    id: 4,
    category: 'Clothing',
    image: '/assets/images/heroes/hero-gaming.jpg',
    title: 'Fashion & Clothing',
  },
] as const

/**
 * Trust indicators displayed on homepage
 * Build confidence in the platform's reliability
 */
export const TRUST_INDICATORS = [
  { text: 'Verified Sellers', color: 'bg-green-400' },
  { text: 'Secure Payments', color: 'bg-green-400' },
  { text: 'Regional Shipping', color: 'bg-green-400' },
  { text: 'Community Trusted', color: 'bg-green-400' },
] as const

// ============================================================================
// CATEGORY SYSTEM - SIMPLIFIED
// ============================================================================

/**
 * Main product categories with metadata
 * Used for navigation, filtering, and organization
 * ALIGNED WITH BACKEND CATEGORIES
 */
export const CATEGORIES = [
  {
    id: 1,
    name: 'Electronics',
    icon: Smartphone,
    count: '8,921 items',
    slug: 'electronics',
  },
  {
    id: 2,
    name: 'Furniture',
    icon: Home,
    count: '5,234 items',
    slug: 'furniture',
  },
  {
    id: 3,
    name: 'Clothing',
    icon: Shirt,
    count: '3,678 items',
    slug: 'clothing',
  },
  {
    id: 4,
    name: 'Vehicles',
    icon: Car,
    count: '2,847 items',
    slug: 'vehicles',
  },
  {
    id: 5,
    name: 'Real Estate',
    icon: Home,
    count: '1,234 items',
    slug: 'real-estate',
  },
  {
    id: 6,
    name: 'Books & Media',
    icon: Book,
    count: '2,134 items',
    slug: 'books-media',
  },
  {
    id: 7,
    name: 'Sports & Outdoors',
    icon: Dumbbell,
    count: '987 items',
    slug: 'sports-outdoors',
  },
  {
    id: 8,
    name: 'Home Appliances',
    icon: Package,
    count: '1,567 items',
    slug: 'home-appliances',
  },
  {
    id: 9,
    name: 'Beauty & Health',
    icon: Star,
    count: '892 items',
    slug: 'beauty-health',
  },
  {
    id: 10,
    name: 'Garden & Outdoors',
    icon: Sprout,
    count: '432 items',
    slug: 'garden-outdoors',
  },
  {
    id: 11,
    name: 'Art & Crafts',
    icon: Palette,
    count: '321 items',
    slug: 'art-crafts',
  },
] as const

/**
 * Categories for selling with photo requirements
 * Defines mandatory image types for each category
 * ALIGNED WITH BACKEND CATEGORIES
 */
export const SELLING_CATEGORIES: CategoryWithRequirements[] = [
  {
    value: 'electronics',
    label: 'Electronics',
    imageRequirements: ['main', 'detail'],
  },
  {
    value: 'furniture',
    label: 'Furniture',
    imageRequirements: ['main', 'detail'],
  },
  {
    value: 'clothing',
    label: 'Clothing',
    imageRequirements: ['main', 'detail'],
  },
  {
    value: 'vehicles',
    label: 'Vehicles',
    imageRequirements: ['main', 'detail'],
  },
  {
    value: 'real-estate',
    label: 'Real Estate',
    imageRequirements: ['main', 'detail'],
  },
  {
    value: 'books-media',
    label: 'Books & Media',
    imageRequirements: ['main'],
  },
  {
    value: 'sports-outdoors',
    label: 'Sports & Outdoors',
    imageRequirements: ['main', 'detail'],
  },
  {
    value: 'home-appliances',
    label: 'Home Appliances',
    imageRequirements: ['main', 'detail'],
  },
  {
    value: 'beauty-health',
    label: 'Beauty & Health',
    imageRequirements: ['main'],
  },
  {
    value: 'garden-outdoors',
    label: 'Garden & Outdoors',
    imageRequirements: ['main', 'detail'],
  },
  {
    value: 'art-crafts',
    label: 'Art & Crafts',
    imageRequirements: ['main', 'detail'],
  },
]

// ============================================================================
// PRODUCT CONDITIONS & SELLING GUIDANCE - SIMPLIFIED
// ============================================================================

/**
 * Available item conditions with descriptions
 * Helps expats accurately describe item condition
 */
export const ITEM_CONDITIONS: ItemCondition[] = [
  { value: 'new', label: 'New', description: 'Brand new, never used' },
  { value: 'like-new', label: 'Like New', description: 'Used once or twice, excellent condition' },
  { value: 'excellent', label: 'Excellent', description: 'Lightly used, very good condition' },
  { value: 'very-good', label: 'Very Good', description: 'Used with minor signs of wear' },
  { value: 'good', label: 'Good', description: 'Used with normal signs of wear' },
  { value: 'fair', label: 'Fair', description: 'Heavily used but functional' },
]

/**
 * Selling tips for new users
 * Guidance to help create better listings
 */
export const SELLING_TIPS: SellingTip[] = [
  {
    icon: Camera,
    title: 'Take Great Photos',
    description: 'Use natural lighting and multiple angles. High-quality photos get 3x more views.',
  },
  {
    icon: Star,
    title: 'Write Detailed Descriptions',
    description: 'Include brand, model, condition, and reason for selling. Be honest and thorough.',
  },
  {
    icon: DollarSign,
    title: 'Price Competitively',
    description:
      'Research similar items and price fairly. Consider the condition and market demand.',
  },
  {
    icon: Package,
    title: 'Fast Response',
    description:
      'Reply to inquiries quickly. Responsive expats connect better with interested buyers.',
  },
]

// ============================================================================
// UI CONFIGURATION - SIMPLIFIED
// ============================================================================

/**
 * Sorting options for product listings
 * Available filter and sort methods
 */
export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'rating', label: 'Highest Rated' },
] as const

/**
 * Status colors for listings and orders
 * Consistent color scheme across the platform
 */
export const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  sold: 'bg-blue-100 text-blue-800',
  pending: 'bg-yellow-100 text-yellow-800',
  draft: 'bg-gray-100 text-gray-800',
  expired: 'bg-red-100 text-red-800',
} as const

// ============================================================================
// USER & AUTHENTICATION - SIMPLIFIED
// ============================================================================

/**
 * Default user information for development
 * Used when no real user data is available
 */
export const DEFAULT_USER = {
  name: 'Dr. Sarah M.',
  email: 'sarah.mitchell@un.org',
  avatar: '/assets/images/avatars/user-avatar.png',
} as const

// ============================================================================
// NOTE: Mock data removed - use backend API endpoints instead
// ============================================================================
// For featured products, use: GET /api/v1/displayItem/top-picks
// For newest listings, use: GET /api/v1/displayItem/newest
// For all products, use: GET /api/v1/products/get-all-products
