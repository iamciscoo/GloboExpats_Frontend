/**
 * Application Constants & Configuration - SIMPLIFIED
 *
 * Centralized constants for the GlobalExpat platform including UI configuration,
 * category definitions, currency settings, and mock data for development.
 */

import {
  Car,
  Home,
  Smartphone,
  Gamepad2,
  Shirt,
  Dumbbell,
  Book,
  Palette,
  Camera,
  Star,
  DollarSign,
  Package,
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
 */
export const CURRENCIES = [
  { code: 'TZS', name: 'Tanzanian Shilling', flag: '🇹🇿' },
  { code: 'KES', name: 'Kenyan Shilling', flag: '🇰🇪' },
  { code: 'UGX', name: 'Ugandan Shilling', flag: '🇺🇬' },
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
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
] as const

/**
 * Top expat locations and markets
 * Primary cities where the platform operates - focused on East Africa region
 */
export const EXPAT_LOCATIONS: Location[] = [
  { value: 'dar-es-salaam', label: '🇹🇿 Dar es Salaam, TZ', country: 'Tanzania' },
  { value: 'nairobi', label: '🇰🇪 Nairobi, KE', country: 'Kenya' },
  { value: 'arusha', label: '🇹🇿 Arusha, TZ', country: 'Tanzania' },
  { value: 'kampala', label: '🇺🇬 Kampala, UG', country: 'Uganda' },
  { value: 'zanzibar', label: '🇹🇿 Zanzibar, TZ', country: 'Tanzania' },
  { value: 'mombasa', label: '🇰🇪 Mombasa, KE', country: 'Kenya' },
  { value: 'kigali', label: '🇷🇼 Kigali, RW', country: 'Rwanda' },
  { value: 'dodoma', label: '🇹🇿 Dodoma, TZ', country: 'Tanzania' },
  { value: 'entebbe', label: '🇺🇬 Entebbe, UG', country: 'Uganda' },
  { value: 'stone-town', label: '🇹🇿 Stone Town, TZ', country: 'Tanzania' },
] as const

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
    category: 'Games & Toys',
    image: '/assets/images/heroes/hero-gaming.jpg',
    title: 'Games & Entertainment',
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
 */
export const CATEGORIES = [
  {
    id: 1,
    name: 'Automotive',
    icon: Car,
    count: '2,847 items',
    slug: 'automotive',
  },
  {
    id: 2,
    name: 'Home & Furniture',
    icon: Home,
    count: '5,234 items',
    slug: 'home-furniture',
  },
  {
    id: 3,
    name: 'Electronics & Tech',
    icon: Smartphone,
    count: '8,921 items',
    slug: 'electronics-tech',
  },
  {
    id: 4,
    name: 'Games & Toys',
    icon: Gamepad2,
    count: '1,456 items',
    slug: 'games-toys',
  },
  {
    id: 5,
    name: 'Fashion & Style',
    icon: Shirt,
    count: '3,678 items',
    slug: 'fashion-style',
  },
  {
    id: 6,
    name: 'Fitness & Sports',
    icon: Dumbbell,
    count: '987 items',
    slug: 'fitness-sports',
  },
  {
    id: 7,
    name: 'Books & Media',
    icon: Book,
    count: '2,134 items',
    slug: 'books-media',
  },
  {
    id: 8,
    name: 'Arts & Crafts',
    icon: Palette,
    count: '756 items',
    slug: 'arts-crafts',
  },
] as const

/**
 * Categories for selling with photo requirements
 * Defines mandatory image types for each category
 */
export const SELLING_CATEGORIES: CategoryWithRequirements[] = [
  {
    value: 'automotive',
    label: 'Automotive',
    imageRequirements: ['main', 'detail'],
  },
  {
    value: 'electronics',
    label: 'Electronics & Tech',
    imageRequirements: ['main', 'detail'],
  },
  {
    value: 'furniture',
    label: 'Home & Furniture',
    imageRequirements: ['main', 'detail'],
  },
  {
    value: 'appliances',
    label: 'Appliances',
    imageRequirements: ['main', 'detail'],
  },
  {
    value: 'books',
    label: 'Books & Media',
    imageRequirements: ['main'],
  },
  {
    value: 'clothing',
    label: 'Clothing & Accessories',
    imageRequirements: ['main', 'detail'],
  },
  {
    value: 'sports',
    label: 'Sports & Fitness',
    imageRequirements: ['main', 'detail'],
  },
  {
    value: 'other',
    label: 'Other',
    imageRequirements: ['main'],
  },
] as const

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
] as const

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
] as const

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
// MOCK DATA FOR DEVELOPMENT - SIMPLIFIED
// ============================================================================

/**
 * Featured listings for homepage and testing
 * Mock data representing various items from expat community members
 */
export const featuredItems = [
  {
    id: 1,
    title: 'MacBook Pro 14" M2',
    price: '3,500,000 TZS',
    originalPrice: '4,200,000 TZS',
    image: '/assets/images/products/macbook-pro.jpg',
    listedBy: 'Sarah M.',
    rating: 4.9,
    reviews: 88,
    location: 'Dar es Salaam, TZ',
    isVerified: true,
    isPremium: true,
    categorySlug: 'electronics-tech',
  },
  {
    id: 2,
    title: 'Toyota Rav4 2021 - Expat Owned',
    price: '85,000,000 TZS',
    originalPrice: '95,000,000 TZS',
    image: '/assets/images/products/bmw-x5.jpg',
    listedBy: 'Michael K.',
    rating: 4.8,
    reviews: 45,
    location: 'Dar es Salaam, TZ',
    isVerified: true,
    isPremium: true,
    categorySlug: 'automotive',
  },
  {
    id: 3,
    title: 'Designer Sofa Set - Imported',
    price: '2,800,000 TZS',
    originalPrice: '3,500,000 TZS',
    image: '/assets/images/products/italian-sofa.jpg',
    listedBy: 'Emma L.',
    rating: 4.7,
    reviews: 56,
    location: 'Arusha, TZ',
    isVerified: true,
    isPremium: false,
    categorySlug: 'home-furniture',
  },
  {
    id: 4,
    title: 'PlayStation 5 + Games Bundle',
    price: '1,800,000 TZS',
    originalPrice: '2,200,000 TZS',
    image: '/assets/images/products/playstation-5.jpg',
    listedBy: 'James R.',
    rating: 4.9,
    reviews: 150,
    location: 'Nairobi, KE',
    isVerified: true,
    isPremium: false,
    categorySlug: 'games-toys',
  },
  {
    id: 5,
    title: 'Samsung 65" 4K TV',
    price: '2,500,000 TZS',
    originalPrice: '3,000,000 TZS',
    image: '/assets/images/products/rolex-watch.jpg',
    listedBy: 'David P.',
    rating: 4.9,
    reviews: 78,
    location: 'Dar es Salaam, TZ',
    isVerified: true,
    isPremium: true,
    categorySlug: 'electronics-tech',
  },
  {
    id: 6,
    title: 'Toyota Land Cruiser Prado 2018',
    price: '150,000,000 TZS',
    originalPrice: '165,000,000 TZS',
    image: '/assets/images/products/mercedes-c-class.jpg',
    listedBy: 'Robert H.',
    rating: 4.8,
    reviews: 32,
    location: 'Arusha, TZ',
    isVerified: true,
    isPremium: true,
    categorySlug: 'automotive',
  },
  {
    id: 7,
    title: 'Herman Miller Aeron Chair',
    price: '1,500,000 TZS',
    originalPrice: '2,000,000 TZS',
    image: '/assets/images/products/herman-miller-chair.jpg',
    listedBy: 'Lisa W.',
    rating: 4.6,
    reviews: 92,
    location: 'Nairobi, KE',
    isVerified: true,
    isPremium: false,
    categorySlug: 'home-furniture',
  },
  {
    id: 8,
    title: 'Canon EOS R5 + Lens Kit',
    price: '7,000,000 TZS',
    originalPrice: '8,500,000 TZS',
    image: '/assets/images/products/canon-camera.jpg',
    listedBy: 'Alex T.',
    rating: 4.9,
    reviews: 156,
    location: 'Kampala, UG',
    isVerified: true,
    isPremium: false,
    categorySlug: 'electronics-tech',
  },
  {
    id: 9,
    title: 'iPad Pro 11" M2 + Accessories',
    price: '2,800,000 TZS',
    originalPrice: '3,400,000 TZS',
    image: '/assets/images/products/ipad-pro.jpg',
    listedBy: 'Maria S.',
    rating: 4.8,
    reviews: 203,
    location: 'Nairobi, KE',
    isVerified: true,
    isPremium: true,
    categorySlug: 'electronics-tech',
  },
  {
    id: 10,
    title: 'Vintage Zanzibar Chest',
    price: '1,200,000 TZS',
    originalPrice: '1,500,000 TZS',
    image: '/assets/images/products/harley-davidson.jpg',
    listedBy: 'John D.',
    rating: 4.7,
    reviews: 34,
    location: 'Zanzibar, TZ',
    isVerified: true,
    isPremium: true,
    categorySlug: 'home-furniture',
  },
  {
    id: 11,
    title: 'KitchenAid Stand Mixer Pro',
    price: '800,000 TZS',
    originalPrice: '1,000,000 TZS',
    image: '/assets/images/products/kitchenaid-mixer.jpg',
    listedBy: 'Sophie B.',
    rating: 4.6,
    reviews: 128,
    location: 'Dar es Salaam, TZ',
    isVerified: true,
    isPremium: false,
    categorySlug: 'appliances',
  },
  {
    id: 12,
    title: 'Mountain Bike - Full Suspension',
    price: '950,000 TZS',
    originalPrice: '1,200,000 TZS',
    image: '/assets/images/products/nintendo-switch.jpg',
    listedBy: 'Tom F.',
    rating: 4.9,
    reviews: 187,
    location: 'Kampala, UG',
    isVerified: true,
    isPremium: false,
    categorySlug: 'sports',
  },
  {
    id: 13,
    title: 'Luxury Apartment Furniture Set',
    price: '4,500,000 TZS',
    originalPrice: '5,200,000 TZS',
    image: '/assets/images/placeholders/pexels-pixabay-38568.jpg',
    listedBy: 'Catherine M.',
    rating: 4.8,
    reviews: 67,
    location: 'Dar es Salaam, TZ',
    isVerified: true,
    isPremium: true,
    categorySlug: 'home-furniture',
  },
  {
    id: 14,
    title: 'Professional Camera Equipment',
    price: '3,200,000 TZS',
    originalPrice: '3,800,000 TZS',
    image: '/assets/images/placeholders/pexels-pixabay-163696.jpg',
    listedBy: 'Daniel C.',
    rating: 4.9,
    reviews: 134,
    location: 'Nairobi, KE',
    isVerified: true,
    isPremium: false,
    categorySlug: 'electronics-tech',
  },
  {
    id: 15,
    title: 'Vintage Wooden Coffee Table',
    price: '850,000 TZS',
    originalPrice: '1,100,000 TZS',
    image: '/assets/images/placeholders/pexels-pixabay-371924.jpg',
    listedBy: 'Peter N.',
    rating: 4.7,
    reviews: 89,
    location: 'Kampala, UG',
    isVerified: true,
    isPremium: false,
    categorySlug: 'home-furniture',
  },
  {
    id: 16,
    title: 'Premium Kitchen Appliance Set',
    price: '2,100,000 TZS',
    originalPrice: '2,500,000 TZS',
    image: '/assets/images/placeholders/pexels-goumbik-669582.jpg',
    listedBy: 'Rachel G.',
    rating: 4.8,
    reviews: 156,
    location: 'Nairobi, KE',
    isVerified: true,
    isPremium: true,
    categorySlug: 'appliances',
  },
  {
    id: 17,
    title: 'Modern Office Desk Setup',
    price: '1,650,000 TZS',
    originalPrice: '2,000,000 TZS',
    image: '/assets/images/placeholders/pexels-heyho-6198655.jpg',
    listedBy: 'Mark J.',
    rating: 4.6,
    reviews: 91,
    location: 'Arusha, TZ',
    isVerified: true,
    isPremium: false,
    categorySlug: 'home-furniture',
  },
  {
    id: 18,
    title: 'Artisan Pottery Collection',
    price: '450,000 TZS',
    originalPrice: '600,000 TZS',
    image: '/assets/images/placeholders/pexels-marleneleppanen-1183266.jpg',
    listedBy: 'Amina H.',
    rating: 4.9,
    reviews: 78,
    location: 'Zanzibar, TZ',
    isVerified: true,
    isPremium: true,
    categorySlug: 'arts-crafts',
  },
  {
    id: 19,
    title: 'Designer Fashion Collection',
    price: '890,000 TZS',
    originalPrice: '1,200,000 TZS',
    image: '/assets/images/placeholders/pexels-jessbaileydesign-788946.jpg',
    listedBy: 'Jessica V.',
    rating: 4.7,
    reviews: 203,
    location: 'Nairobi, KE',
    isVerified: true,
    isPremium: false,
    categorySlug: 'fashion-style',
  },
  {
    id: 20,
    title: 'High-End Audio System',
    price: '3,800,000 TZS',
    originalPrice: '4,500,000 TZS',
    image: '/assets/images/placeholders/pexels-steve-923192.jpg',
    listedBy: 'Chris A.',
    rating: 4.9,
    reviews: 112,
    location: 'Dar es Salaam, TZ',
    isVerified: true,
    isPremium: true,
    categorySlug: 'electronics-tech',
  },
  {
    id: 21,
    title: 'Fitness Equipment Bundle',
    price: '1,200,000 TZS',
    originalPrice: '1,500,000 TZS',
    image: '/assets/images/placeholders/pexels-stasknop-1330638.jpg',
    listedBy: 'Amanda R.',
    rating: 4.8,
    reviews: 145,
    location: 'Kampala, UG',
    isVerified: true,
    isPremium: false,
    categorySlug: 'sports',
  },
  {
    id: 22,
    title: 'Luxury Watch Collection',
    price: '12,500,000 TZS',
    originalPrice: '15,000,000 TZS',
    image: '/assets/images/placeholders/pexels-pixabay-39671.jpg',
    listedBy: 'Richard E.',
    rating: 4.9,
    reviews: 67,
    location: 'Dar es Salaam, TZ',
    isVerified: true,
    isPremium: true,
    categorySlug: 'home-furniture',
  },
  {
    id: 23,
    title: 'Smart Home Technology Kit',
    price: '2,300,000 TZS',
    originalPrice: '2,800,000 TZS',
    image: '/assets/images/placeholders/pexels-mikebirdy-170811.jpg',
    listedBy: 'Nina K.',
    rating: 4.8,
    reviews: 198,
    location: 'Nairobi, KE',
    isVerified: true,
    isPremium: true,
    categorySlug: 'electronics-tech',
  },
  {
    id: 24,
    title: 'Outdoor Adventure Gear',
    price: '1,850,000 TZS',
    originalPrice: '2,200,000 TZS',
    image: '/assets/images/placeholders/pexels-solliefoto-298863.jpg',
    listedBy: 'Steve M.',
    rating: 4.7,
    reviews: 176,
    location: 'Arusha, TZ',
    isVerified: true,
    isPremium: false,
    categorySlug: 'sports',
  },
  {
    id: 25,
    title: 'Premium Skincare Products',
    price: '680,000 TZS',
    originalPrice: '850,000 TZS',
    image: '/assets/images/placeholders/pexels-thought-catalog-317580-2228557.jpg',
    listedBy: 'Grace O.',
    rating: 4.9,
    reviews: 234,
    location: 'Zanzibar, TZ',
    isVerified: true,
    isPremium: true,
    categorySlug: 'home-furniture',
  },
  {
    id: 26,
    title: 'Professional DJ Equipment',
    price: '4,200,000 TZS',
    originalPrice: '5,000,000 TZS',
    image: '/assets/images/placeholders/pexels-stasknop-1579240.jpg',
    listedBy: 'Kevin L.',
    rating: 4.8,
    reviews: 89,
    location: 'Kampala, UG',
    isVerified: true,
    isPremium: false,
    categorySlug: 'electronics-tech',
  },
  {
    id: 27,
    title: 'Sustainable Living Products',
    price: '920,000 TZS',
    originalPrice: '1,200,000 TZS',
    image: '/assets/images/placeholders/pexels-thepaintedsquare-3405456.jpg',
    listedBy: 'Helen T.',
    rating: 4.7,
    reviews: 156,
    location: 'Dar es Salaam, TZ',
    isVerified: true,
    isPremium: true,
    categorySlug: 'home-furniture',
  },
  {
    id: 28,
    title: 'Books & Educational Materials',
    price: '380,000 TZS',
    originalPrice: '500,000 TZS',
    image: '/assets/images/placeholders/pexels-igor-starkov-233202-914388.jpg',
    listedBy: 'Paul W.',
    rating: 4.9,
    reviews: 267,
    location: 'Nairobi, KE',
    isVerified: true,
    isPremium: false,
    categorySlug: 'books-media',
  },
  {
    id: 29,
    title: 'Imported Furniture Set',
    price: '3,400,000 TZS',
    originalPrice: '4,100,000 TZS',
    image: '/assets/images/placeholders/pexels-ron-lach-7859350.jpg',
    listedBy: 'Victoria S.',
    rating: 4.8,
    reviews: 78,
    location: 'Arusha, TZ',
    isVerified: true,
    isPremium: true,
    categorySlug: 'home-furniture',
  },
  {
    id: 30,
    title: 'Gaming Setup Complete',
    price: '2,650,000 TZS',
    originalPrice: '3,200,000 TZS',
    image: '/assets/images/placeholders/pexels-zeleboba-32728404.jpg',
    listedBy: 'Oliver M.',
    rating: 4.9,
    reviews: 189,
    location: 'Kampala, UG',
    isVerified: true,
    isPremium: false,
    categorySlug: 'games-toys',
  },
  {
    id: 31,
    title: 'Handmade Crafts Collection',
    price: '560,000 TZS',
    originalPrice: '750,000 TZS',
    image: '/assets/images/placeholders/pexels-aj-ahamad-767001191-30147878.jpg',
    listedBy: 'Fatima A.',
    rating: 4.8,
    reviews: 145,
    location: 'Zanzibar, TZ',
    isVerified: true,
    isPremium: true,
    categorySlug: 'arts-crafts',
  },
]
