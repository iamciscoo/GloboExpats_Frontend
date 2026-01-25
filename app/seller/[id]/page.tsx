'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  Shield,
  MapPin,
  Calendar,
  Star,
  Package,
  Loader2,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ShieldCheck,
  Flag,
  Briefcase,
  Building2,
  User,
  MoreHorizontal,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from '@/components/ui/use-toast'
import { apiClient } from '@/lib/api'
import { transformBackendProduct, getFullImageUrl } from '@/lib/image-utils'
import { getInitials } from '@/lib/utils'
import { FeaturedItem } from '@/lib/types'
import PriceDisplay from '@/components/price-display'
import type { CurrencyCode } from '@/lib/currency-types'
import { ProductCard } from '@/components/ui/product-card'

interface SellerProfile {
  firstName: string
  lastName: string
  aboutMe?: string
  organization?: string
  position?: string
  location?: string
  profileImageUrl?: string
  isVerified: boolean
  joinedDate?: string
  totalReviews: number
  averageRating: number
}

const ITEMS_PER_PAGE = 12

const getCountryFlag = (location: string): string => {
  const loc = location.toLowerCase()
  if (
    loc.includes('tz') ||
    loc.includes('tanzania') ||
    loc.includes('dar') ||
    loc.includes('zanzibar') ||
    loc.includes('dodoma') ||
    loc.includes('arusha')
  )
    return '🇹🇿'
  if (
    loc.includes('ke') ||
    loc.includes('kenya') ||
    loc.includes('nairobi') ||
    loc.includes('mombasa')
  )
    return '🇰🇪'
  if (loc.includes('ug') || loc.includes('uganda') || loc.includes('kampala')) return '🇺🇬'
  if (loc.includes('rw') || loc.includes('rwanda') || loc.includes('kigali')) return '🇷🇼'
  if (loc.includes('bi') || loc.includes('burundi') || loc.includes('bujumbura')) return '🇧🇮'
  return '🌍'
}

const formatLocation = (location: string): string => {
  if (!location) return ''

  // Handle common cities to ensure nice formatting
  let formatted = location.toLowerCase()
  if (formatted.includes('dar-es-salaam') || formatted.includes('dar es salaam')) {
    formatted = 'Dar es Salaam, Tanzania'
  } else if (formatted === 'zanzibar') {
    formatted = 'Zanzibar, Tanzania'
  } else if (formatted === 'arusha') {
    formatted = 'Arusha, Tanzania'
  } else if (formatted === 'dodoma') {
    formatted = 'Dodoma, Tanzania'
  } else if (formatted === 'mombasa') {
    formatted = 'Mombasa, Kenya'
  } else if (formatted === 'nairobi') {
    formatted = 'Nairobi, Kenya'
  } else {
    // Generic title case
    formatted = location
      .split(/[\s-]+/) // Split by space or hyphen
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  const flag = getCountryFlag(location)
  return `${flag} ${formatted}`
}

export default function SellerProfilePage() {
  const params = useParams()
  const router = useRouter()
  const sellerId = params?.id as string

  const [seller, setSeller] = useState<SellerProfile | null>(null)
  const [sellerListings, setSellerListings] = useState<FeaturedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchSellerProfile = async () => {
      if (!sellerId) return

      try {
        setLoading(true)
        setError(null)

        const decodedSellerName = decodeURIComponent(sellerId)
        const isNumericId = !isNaN(Number(decodedSellerName))
        let userSellerId: number | null = isNumericId ? Number(decodedSellerName) : null
        let sellerProducts: any[] = []

        console.log('══════════════════════════════════════')
        console.log('📍 Loading Seller Profile')
        console.log('Seller ID/Name from URL:', decodedSellerName)
        console.log('Is Numeric ID:', isNumericId)

        // Step 1: Find products or verify seller
        if (isNumericId && userSellerId) {
          // If we have a numeric ID, we can try to get the profile directly
          try {
            const profile = await apiClient.getSellerProfile(userSellerId)
            if (profile) {
              console.log('✅ Found profile by numeric ID:', profile)
              // Also fetch some products for this seller to get their name if profile doesn't have it fully
              const productsResponse = await apiClient.filterProducts({
                sellerName: `${profile.firstName} ${profile.lastName}`.trim()
              })
              const responseData = (productsResponse as any)?.data?.content || (productsResponse as any)?.content || []
              sellerProducts = responseData
            }
          } catch (e) {
            console.warn('⚠️ Could not find profile by numeric ID, falling back to name search')
            userSellerId = null
          }
        }

        // Step 2: Search by name if we don't have a verified ID yet
        if (!userSellerId) {
          console.log('🔍 Searching for products by seller name:', decodedSellerName)
          const productsResponse = await apiClient.filterProducts({
            sellerName: decodedSellerName
          })

          const responseData = (productsResponse as any)?.data?.content || (productsResponse as any)?.content || []

          if (responseData.length > 0) {
            sellerProducts = responseData
            const firstProduct = sellerProducts[0]
            userSellerId = firstProduct.sellerId || firstProduct.userId
            console.log('✅ Found seller ID from products:', userSellerId)
          } else {
            console.log('❓ No products found for this name, trying newest listings scan...')
            // Fallback: Scan newest listings (existing logic)
            let allProducts: any[] = []
            let currentPageNum = 0
            const maxPages = 3

            while (currentPageNum < maxPages) {
              const productsResponse = await apiClient.getNewestListings(currentPageNum, 20)
              const response = productsResponse as any
              const pageProducts = response?.data?.content || response?.content || response?.data || []

              if (pageProducts.length === 0) break
              allProducts = [...allProducts, ...pageProducts]
              if (response?.data?.last === true || pageProducts.length < 20) break
              currentPageNum++
            }

            sellerProducts = allProducts.filter((item) => {
              const product = item as Record<string, any>
              return (
                product.sellerName &&
                String(product.sellerName).toLowerCase() === decodedSellerName.toLowerCase()
              )
            })

            if (sellerProducts.length > 0) {
              const firstProduct = sellerProducts[0]
              userSellerId = firstProduct.sellerId || firstProduct.userId
              console.log('✅ Found seller ID from newest listings scan:', userSellerId)
            }
          }
        }

        if (!userSellerId && sellerProducts.length === 0) {
          // One final attempt: Maybe the ID is actually a name but we can't find products
          // In some cases, we might have a name but no products. 
          // But getSellerProfile NEEDS a numeric ID.
          setError('Seller not found')
          setLoading(false)
          return
        }

        // Step 3: Fetch full profile with the ID we found
        let userProfile: any = null
        if (userSellerId) {
          try {
            userProfile = await apiClient.getSellerProfile(userSellerId)
            console.log('✅ Successfully fetched seller profile:', userProfile)
          } catch (profileError) {
            console.warn('⚠️ Could not fetch seller profile from API:', profileError)
          }
        }

        // Step 4: Combine data
        const firstProduct = sellerProducts[0] || {}

        // Extract seller details from product data
        const productProfileImageUrl =
          firstProduct.sellerProfileImage ||
          firstProduct.sellerProfileImageUrl ||
          firstProduct.profileImageUrl ||
          firstProduct.userProfileImage

        // Calculate stats
        const totalReviews = sellerProducts.reduce(
          (acc: number, curr) => acc + (Number(curr.reviews) || 0),
          0
        )
        const totalRating = sellerProducts.reduce(
          (acc: number, curr) => acc + (Number(curr.rating) || 0),
          0
        )
        const averageRating = sellerProducts.length > 0 ? totalRating / sellerProducts.length : 0

        // Determine verification status
        const isVerified =
          userProfile?.verificationStatus === 'VERIFIED' ||
          firstProduct.sellerVerified === true ||
          firstProduct.isVerified === true ||
          firstProduct.sellerVerificationStatus === 'VERIFIED'

        // Build final seller profile
        const finalSeller: SellerProfile = {
          firstName: userProfile?.firstName || firstProduct.sellerName?.split(' ')[0] || decodedSellerName.split(' ')[0] || 'Seller',
          lastName: userProfile?.lastName || firstProduct.sellerName?.split(' ').slice(1).join(' ') || '',
          profileImageUrl: userProfile?.profileImageUrl
            ? getFullImageUrl(userProfile.profileImageUrl)
            : productProfileImageUrl
              ? getFullImageUrl(String(productProfileImageUrl))
              : undefined,
          location: userProfile?.location || firstProduct.sellerLocation || firstProduct.location,
          organization: userProfile?.organization || firstProduct.sellerOrganization,
          position: userProfile?.position || firstProduct.sellerPosition,
          aboutMe: userProfile?.aboutMe || firstProduct.sellerAboutMe,
          isVerified: isVerified,
          joinedDate: firstProduct.sellerJoinedDate || userProfile?.createdAt,
          totalReviews,
          averageRating,
        }

        console.log('📋 Final combined seller profile:', finalSeller)
        setSeller(finalSeller)

        const transformedListings = sellerProducts.map((item) =>
          transformBackendProduct(item)
        )
        setSellerListings(transformedListings)
      } catch (err) {
        console.error('Failed to fetch seller profile:', err)
        setError('Failed to load seller profile')
      } finally {
        setLoading(false)
      }
    }

    fetchSellerProfile()
  }, [sellerId])

  // Pagination
  const totalPages = Math.ceil(sellerListings.length / ITEMS_PER_PAGE)
  const currentListings = sellerListings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
          <span className="text-neutral-600 font-medium">Loading seller profile...</span>
        </div>
      </div>
    )
  }

  if (error || !seller) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-xl border-0 rounded-3xl">
          <CardContent className="p-10">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-3">Profile Not Found</h2>
            <p className="text-neutral-600 mb-8 text-lg">
              {error || "We couldn't find the seller you're looking for."}
            </p>
            <Button onClick={() => router.back()} className="w-full h-12 text-base" size="lg">
              <ChevronLeft className="w-5 h-5 mr-2" />
              Return to Previous Page
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const sellerFullName = `${seller.firstName} ${seller.lastName}`.trim()
  const sellerInitials = getInitials(sellerFullName)

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Hero Banner / Header */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-brand-primary to-blue-600 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-neutral-50 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10">
          <Button
            variant="secondary"
            onClick={() => router.back()}
            className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Profile Summary */}
          <div className="lg:col-span-4 xl:col-span-3">
            <Card className="shadow-2xl border-0 rounded-3xl overflow-hidden bg-white/95 backdrop-blur-sm sticky top-24">
              <div className="absolute top-6 right-6 z-30">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-neutral-100">
                      <MoreHorizontal className="w-6 h-6 text-neutral-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-neutral-100">
                    <DropdownMenuItem className="rounded-xl py-3 cursor-pointer">
                      <Flag className="w-4 h-4 mr-3 text-neutral-500" />
                      Report Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-xl py-3 cursor-pointer" onClick={() => {
                      navigator.clipboard.writeText(window.location.href)
                      toast({ title: "Link Copied", description: "Seller profile link copied to clipboard." })
                    }}>
                      <Briefcase className="w-4 h-4 mr-3 text-neutral-500" />
                      Share Profile
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardContent className="p-0">
                {/* Profile Top Info */}
                <div className="p-8 pb-6 flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-brand-primary/10 blur-2xl rounded-full scale-110"></div>
                    <Avatar className="w-40 h-40 border-8 border-white shadow-2xl relative z-10">
                      <AvatarImage
                        src={seller.profileImageUrl}
                        alt={sellerFullName}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-brand-primary to-blue-400 text-white text-5xl font-bold">
                        {sellerInitials}
                      </AvatarFallback>
                    </Avatar>
                    {seller.isVerified && (
                      <div className="absolute bottom-2 right-2 bg-emerald-500 p-2.5 rounded-full shadow-lg ring-4 ring-white z-20" title="Verified Seller">
                        <ShieldCheck className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>

                  <h1 className="text-3xl font-extrabold text-neutral-900 mb-1">{sellerFullName}</h1>

                  {seller.position && (
                    <p className="text-brand-primary font-semibold mb-4 tracking-wide uppercase text-xs">
                      {seller.position}
                    </p>
                  )}

                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {seller.isVerified && (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200 px-3 py-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                        Verified
                      </Badge>
                    )}
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1 font-semibold">
                      {sellerListings.length} Listings
                    </Badge>
                  </div>

                  {seller.organization && (
                    <div className="flex items-center gap-2 text-neutral-600 bg-neutral-50 px-4 py-2 rounded-full mb-2">
                      <Building2 className="w-4 h-4 text-neutral-400" />
                      <span className="text-sm font-medium">{seller.organization}</span>
                    </div>
                  )}

                  {seller.location && (
                    <div className="flex items-center gap-2 text-neutral-600 mb-4">
                      <MapPin className="w-4 h-4 text-neutral-400" />
                      <span className="text-sm font-medium">{formatLocation(seller.location)}</span>
                    </div>
                  )}
                </div>

                <Separator className="opacity-50" />

                {/* Seller Stats */}
                <div className="p-8 space-y-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500 font-medium">Member Since</span>
                    <span className="text-neutral-900 font-bold">
                      {seller.joinedDate ? new Date(seller.joinedDate).getFullYear() : '2024'}
                    </span>
                  </div>

                  {seller.totalReviews > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500 font-medium">Success Rating</span>
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="text-neutral-900 font-bold">
                          {seller.averageRating.toFixed(1)}
                        </span>
                        <span className="text-neutral-400">({seller.totalReviews})</span>
                      </div>
                    </div>
                  )}

                  <div className="pt-4">
                    <Button className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl h-12 font-bold shadow-lg shadow-brand-primary/20">
                      Message Seller
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-neutral-400 hover:text-red-500 hover:bg-red-50 text-xs mt-2"
                  >
                    <Flag className="w-3.5 h-3.5 mr-2" />
                    Report Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - About & Listings */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-8">
            {/* About Section */}
            <Card className="bg-white shadow-xl border-0 rounded-3xl overflow-hidden">
              <div className="bg-neutral-50/50 px-8 py-5 border-b border-neutral-100">
                <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-3">
                  <User className="w-5 h-5 text-brand-primary" />
                  About the Seller
                </h2>
              </div>
              <CardContent className="p-8">
                {seller.aboutMe ? (
                  <p className="text-neutral-700 leading-relaxed text-lg italic">
                    &ldquo;{seller.aboutMe}&rdquo;
                  </p>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-neutral-400">
                    <User className="w-12 h-12 mb-3 opacity-20" />
                    <p>This seller hasn&apos;t shared a bio yet.</p>
                  </div>
                )}

                {/* Note: loggingEmail, organizationalEmail, whatsAppPhoneNumber, passportVerificationStatus are explicitly hidden here */}
              </CardContent>
            </Card>

            {/* Listings Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-neutral-900 uppercase tracking-tighter">
                  Seller Showcase
                </h2>
                <p className="text-neutral-500">Explore items available from {seller.firstName}</p>
              </div>
              <div className="h-px flex-1 bg-neutral-200 hidden md:block mx-8 opacity-50" />
              <Badge className="bg-brand-primary text-white text-lg px-4 py-1.5 rounded-full self-start md:self-auto shadow-lg shadow-brand-primary/20">
                {sellerListings.length} {sellerListings.length === 1 ? 'Product' : 'Products'}
              </Badge>
            </div>

            {/* Listings Grid */}
            {sellerListings.length === 0 ? (
              <Card className="bg-neutral-50/50 border-2 border-dashed border-neutral-200 rounded-3xl">
                <CardContent className="p-16 text-center">
                  <Package className="w-20 h-20 text-neutral-200 mx-auto mb-6" />
                  <h3 className="text-xl font-bold text-neutral-800 mb-2">No Active Listings</h3>
                  <p className="text-neutral-500 max-w-sm mx-auto">
                    Looks like this seller doesn&apos;t have any active items at the moment.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                  {currentListings.map((listing) => (
                    <ProductCard
                      key={listing.id}
                      product={listing}
                      className="hover:translate-y-[-8px] transition-all duration-500"
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center pt-8 gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="rounded-2xl w-12 h-12 border-2 border-neutral-200 hover:border-brand-primary hover:text-brand-primary bg-white shadow-sm"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        onClick={() => handlePageChange(page)}
                        className={`rounded-2xl w-12 h-12 font-bold transition-all duration-300 ${currentPage === page
                          ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/30 scale-110'
                          : 'border-2 border-neutral-200 text-neutral-600 bg-white hover:border-brand-primary/50'
                          }`}
                      >
                        {page}
                      </Button>
                    ))}

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="rounded-2xl w-12 h-12 border-2 border-neutral-200 hover:border-brand-primary hover:text-brand-primary bg-white shadow-sm"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
