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
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { apiClient } from '@/lib/api'
import { transformBackendProduct, getFullImageUrl } from '@/lib/image-utils'
import { getInitials } from '@/lib/utils'
import { FeaturedItem } from '@/lib/types'
import PriceDisplay from '@/components/price-display'
import type { CurrencyCode } from '@/lib/currency-types'

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

        // Fetch products to find seller's listings and get sellerId
        let allProducts: unknown[] = []
        let currentPageNum = 0
        const maxPages = 5

        while (currentPageNum < maxPages) {
          const productsResponse = await apiClient.getNewestListings(currentPageNum, 20)
          const response = productsResponse as {
            data?: { content?: unknown[]; last?: boolean } | unknown[]
            content?: unknown[]
          }
          const pageProducts =
            (response.data as { content?: unknown[] })?.content ||
            response.content ||
            (response.data as unknown[]) ||
            []

          if (pageProducts.length === 0) break

          allProducts = [...allProducts, ...pageProducts]

          if ((response.data as { last?: boolean })?.last === true || pageProducts.length < 20) {
            break
          }

          currentPageNum++
        }

        // Find products by this seller
        const sellerProducts = allProducts.filter((item) => {
          const product = item as Record<string, unknown>
          return (
            product.sellerName &&
            String(product.sellerName).toLowerCase() === decodedSellerName.toLowerCase()
          )
        })

        if (sellerProducts.length === 0) {
          setError('Seller not found')
          setLoading(false)
          return
        }

        // Get sellerId from first product
        const firstProduct = sellerProducts[0] as Record<string, unknown>
        const userSellerId = firstProduct.sellerId as number

        console.log('══════════════════════════════════════')
        console.log('📍 Loading Seller Profile')
        console.log('Seller Name from URL:', decodedSellerName)
        console.log('Seller ID from Product:', userSellerId)
        console.log('Total Products Found:', sellerProducts.length)
        console.log('══════════════════════════════════════')

        // TRY to fetch user profile from API
        // We'll attempt multiple endpoints to see if any work
        let userProfile: {
          firstName?: string
          lastName?: string
          profileImageUrl?: string
          location?: string
          organization?: string
          position?: string
          aboutMe?: string
          verificationStatus?: 'VERIFIED' | 'PENDING' | 'REJECTED'
        } | null = null

        try {
          userProfile = await apiClient.getSellerProfile(userSellerId)
          console.log('✅ Successfully fetched seller profile from API:', userProfile)

          // VERIFY the API returned the CORRECT user, not the logged-in user
          // Check if the returned data seems to match this seller
          if (userProfile) {
            console.log('🔍 Verifying API returned correct seller...')
            // If we can verify the name matches, great! Otherwise warn.
            const apiFullName = `${userProfile.firstName} ${userProfile.lastName}`
              .trim()
              .toLowerCase()
            const expectedName = decodedSellerName.toLowerCase()

            if (apiFullName !== expectedName) {
              console.warn(
                '⚠️ API returned different user! Expected:',
                expectedName,
                'Got:',
                apiFullName
              )
              console.warn('⚠️ Discarding API data and using product data instead')
              userProfile = null // Discard wrong data
            } else {
              console.log('✅ API data verified - names match!')
            }
          }
        } catch (profileError) {
          console.warn('⚠️ Could not fetch seller profile from API:', profileError)
          userProfile = null
        }

        // Extract seller details from product data (used as fallback or primary source)
        const productProfileImageUrl =
          firstProduct.sellerProfileImage ||
          firstProduct.sellerProfileImageUrl ||
          firstProduct.profileImageUrl ||
          firstProduct.userProfileImage

        // Calculate stats from products
        const totalReviews = sellerProducts.reduce(
          (acc: number, curr) => acc + (Number((curr as Record<string, unknown>).reviews) || 0),
          0
        )

        const totalRating = sellerProducts.reduce(
          (acc: number, curr) => acc + (Number((curr as Record<string, unknown>).rating) || 0),
          0
        )

        const averageRating = totalReviews > 0 ? totalRating / sellerProducts.length : 0

        // Determine verification status
        const isVerified =
          userProfile?.verificationStatus === 'VERIFIED' ||
          firstProduct.sellerVerified === true ||
          firstProduct.isVerified === true ||
          firstProduct.sellerVerificationStatus === 'VERIFIED' ||
          (sellerProducts.length > 0 && firstProduct.sellerEmail !== undefined)

        // Build seller profile - prioritize API data if available and verified, otherwise use product data
        const sellerProfile: SellerProfile = {
          // Use API first name if available, otherwise extract from product sellerName
          firstName:
            userProfile?.firstName || String(firstProduct.sellerName || '').split(' ')[0] || '',
          // Use API last name if available, otherwise extract from product sellerName
          lastName:
            userProfile?.lastName ||
            String(firstProduct.sellerName || '')
              .split(' ')
              .slice(1)
              .join(' ') ||
            '',
          // Use API profile image if available, otherwise product data
          profileImageUrl: userProfile?.profileImageUrl
            ? getFullImageUrl(userProfile.profileImageUrl)
            : productProfileImageUrl
              ? getFullImageUrl(String(productProfileImageUrl))
              : undefined,
          // Use API location if available, otherwise product data
          location:
            userProfile?.location ||
            (firstProduct.sellerLocation ? String(firstProduct.sellerLocation) : undefined),
          // Use API organization if available, otherwise product data
          organization:
            userProfile?.organization ||
            (firstProduct.sellerOrganization ? String(firstProduct.sellerOrganization) : undefined),
          // Use API position if available, otherwise product data
          position:
            userProfile?.position ||
            (firstProduct.sellerPosition ? String(firstProduct.sellerPosition) : undefined),
          // Use API about me if available, otherwise product data
          aboutMe:
            userProfile?.aboutMe ||
            (firstProduct.sellerAboutMe ? String(firstProduct.sellerAboutMe) : undefined),
          isVerified: isVerified,
          joinedDate: firstProduct.sellerJoinedDate
            ? String(firstProduct.sellerJoinedDate)
            : undefined,
          totalReviews,
          averageRating,
        }

        console.log('📋 Final seller profile:', sellerProfile)

        setSeller(sellerProfile)

        const transformedListings = sellerProducts.map((item) =>
          transformBackendProduct(item as Record<string, unknown>)
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
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" onClick={() => router.back()} className="hover:bg-neutral-100">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-24">
              <Card className="shadow-2xl border-0 rounded-3xl overflow-hidden bg-white">
                <CardContent className="p-8">
                  {/* Avatar */}
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="relative mb-5">
                      <Avatar className="w-36 h-36 border-4 border-neutral-100 shadow-xl ring-4 ring-white">
                        <AvatarImage
                          src={seller.profileImageUrl}
                          alt={sellerFullName}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-cyan-500 text-white text-4xl font-bold">
                          {sellerInitials}
                        </AvatarFallback>
                      </Avatar>
                      {seller.isVerified && (
                        <div className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-lg ring-4 ring-white">
                          <ShieldCheck className="w-7 h-7 text-green-600" />
                        </div>
                      )}
                    </div>

                    <h1 className="text-2xl font-bold text-neutral-900 mb-2">{sellerFullName}</h1>

                    {seller.position && (
                      <div className="flex items-center gap-2 text-neutral-600 mb-1">
                        <Briefcase className="w-4 h-4" />
                        <p className="font-medium">{seller.position}</p>
                      </div>
                    )}

                    {seller.organization && (
                      <div className="flex items-center gap-2 text-neutral-500 mb-4">
                        <Building2 className="w-4 h-4" />
                        <p className="text-sm">{seller.organization}</p>
                      </div>
                    )}
                  </div>

                  {/* Verification Badge */}
                  <div className="mb-6">
                    {seller.isVerified ? (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-green-900 text-sm mb-1">Verified Member</p>
                            <p className="text-xs text-green-700 leading-relaxed">
                              Identity and email verified by our team
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200">
                        <div className="flex items-start gap-3">
                          <Shield className="w-6 h-6 text-neutral-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-neutral-700 text-sm mb-1">New Member</p>
                            <p className="text-xs text-neutral-500 leading-relaxed">
                              Building reputation
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator className="my-6" />

                  {/* Quick Stats */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3 text-neutral-700">
                        <Package className="w-5 h-5 text-neutral-900" />
                        <span className="font-medium">Active listings</span>
                      </div>
                      <span className="font-bold text-neutral-900 text-lg">
                        {sellerListings.length}
                      </span>
                    </div>

                    {seller.totalReviews > 0 && (
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3 text-neutral-700">
                          <Star className="w-5 h-5 text-amber-500" />
                          <span className="font-medium">Reviews</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neutral-900 text-lg">
                            {seller.averageRating.toFixed(1)}
                          </span>
                          <span className="text-sm text-neutral-500">({seller.totalReviews})</span>
                        </div>
                      </div>
                    )}

                    {seller.joinedDate && (
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3 text-neutral-700">
                          <Calendar className="w-5 h-5 text-neutral-900" />
                          <span className="font-medium">Member since</span>
                        </div>
                        <span className="font-bold text-neutral-900 text-lg">
                          {new Date(seller.joinedDate).getFullYear()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Report Button */}
              <div className="mt-6 flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-neutral-500 hover:text-neutral-900 hover:bg-white"
                >
                  <Flag className="w-4 h-4 mr-2" />
                  Report this profile
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-8">
            {/* About Section */}
            <Card className="bg-white shadow-sm border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                  <User className="w-6 h-6" />
                  About {seller.firstName}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {seller.location && (
                    <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl">
                      <MapPin className="w-5 h-5 text-brand-primary" />
                      <div>
                        <p className="text-xs text-neutral-500 mb-0.5">Location</p>
                        <p className="font-semibold text-neutral-900">
                          {formatLocation(seller.location)}
                        </p>
                      </div>
                    </div>
                  )}

                  {seller.joinedDate && (
                    <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl">
                      <Calendar className="w-5 h-5 text-brand-primary" />
                      <div>
                        <p className="text-xs text-neutral-500 mb-0.5">Joined</p>
                        <p className="font-semibold text-neutral-900">
                          {new Date(seller.joinedDate).toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {seller.aboutMe && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-neutral-900 mb-3 text-lg">Bio</h3>
                    <p className="text-neutral-700 leading-relaxed text-base">{seller.aboutMe}</p>
                  </div>
                )}

                {!seller.aboutMe && !seller.location && !seller.joinedDate && (
                  <p className="text-neutral-500 italic">This seller hasn't added details yet.</p>
                )}
              </CardContent>
            </Card>

            <Separator />

            {/* Listings Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                  <Package className="w-6 h-6" />
                  {seller.firstName}'s Listings
                </h2>
                <Badge
                  variant="secondary"
                  className="text-base px-4 py-2 bg-brand-primary text-white hover:bg-brand-primary/90"
                >
                  {sellerListings.length} {sellerListings.length === 1 ? 'Item' : 'Items'}
                </Badge>
              </div>

              {sellerListings.length === 0 ? (
                <Card className="bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-2xl">
                  <CardContent className="p-12 text-center">
                    <Package className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                      No active listings
                    </h3>
                    <p className="text-neutral-600">
                      This seller doesn't have any items listed yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentListings.map((listing) => (
                      <Link key={listing.id} href={`/product/${listing.id}`}>
                        <Card className="group h-full border-0 shadow-md hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden bg-white">
                          <div className="aspect-[4/3] relative bg-neutral-100 overflow-hidden">
                            <Image
                              src={listing.image}
                              alt={listing.title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>

                          <CardContent className="p-5">
                            <h3 className="font-bold text-neutral-900 line-clamp-2 group-hover:text-brand-primary transition-colors text-base mb-3 leading-snug min-h-[3rem]">
                              {listing.title}
                            </h3>

                            <div className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
                              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate">{listing.location}</span>
                            </div>

                            <div className="flex items-center justify-between">
                              <PriceDisplay
                                price={parseFloat(listing.price.replace(/[^0-9.-]+/g, ''))}
                                originalCurrency={'TZS' as CurrencyCode}
                                size="lg"
                                weight="bold"
                                className="text-brand-primary"
                              />
                              <Button
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-brand-primary hover:bg-brand-primary/90 rounded-full px-4"
                              >
                                View
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-10 gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="rounded-full w-11 h-11 border-2 border-neutral-300 hover:border-brand-primary hover:bg-brand-primary/5"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </Button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          onClick={() => handlePageChange(page)}
                          className={`rounded-full w-11 h-11 font-semibold transition-all duration-200 ${
                            currentPage === page
                              ? 'bg-brand-primary text-white hover:bg-brand-primary/90 shadow-lg scale-110'
                              : 'border-2 border-neutral-300 text-neutral-700 hover:border-brand-primary hover:bg-brand-primary/5'
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
                        className="rounded-full w-11 h-11 border-2 border-neutral-300 hover:border-brand-primary hover:bg-brand-primary/5"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
