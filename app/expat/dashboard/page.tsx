'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Plus,
  Package,
  MessageSquare,
  Eye,
  MapPin,
  DollarSign,
  Edit,
  MoreHorizontal,
  Loader2,
  ShieldCheck,
  Trash2,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  BarChart3,
  Filter,
  ArrowUpDown,
  ShoppingBag,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { apiClient } from '@/lib/api'
import { getFullImageUrl, cleanLocationString } from '@/lib/image-utils'
import { RouteGuard } from '@/components/route-guard'
import PriceDisplay from '@/components/price-display'
import type { CurrencyCode } from '@/lib/currency-types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface UserListing {
  productId: number
  productName: string
  productAskingPrice: number
  productCurrency: string
  productLocation: string
  productImages?: Array<{ imageUrl: string }>
  productStatus?: string
  views?: number
  categoryId?: number
  categoryName?: string
  createdAt?: string
}

interface DashboardStats {
  activeListings: number
  totalViews: number
  totalInquiries: number
  totalRevenue: number
}

export default function ExpatDashboard() {
  return (
    <RouteGuard requireAuth requireVerification="sell" loadingMessage="Loading dashboard...">
      <DashboardContent />
    </RouteGuard>
  )
}

function DashboardContent() {
  const { user } = useAuth()
  const [listings, setListings] = useState<UserListing[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    productId: string | null
    productName: string
  }>({
    isOpen: false,
    productId: null,
    productName: '',
  })
  const [stats, setStats] = useState<DashboardStats>({
    activeListings: 0,
    totalViews: 0,
    totalInquiries: 0,
    totalRevenue: 0,
  })

  // Pagination state for listings
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20 // 5 rows × 4 columns = 20 items per page

  // Filtering and sorting state
  const [categories, setCategories] = useState<Array<{ categoryId: number; categoryName: string }>>(
    []
  )
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')

  // Apply filtering and sorting
  const filteredAndSortedListings = listings
    .filter((listing) => {
      // Category filter
      if (selectedCategory !== 'all' && listing.categoryId?.toString() !== selectedCategory) {
        return false
      }

      // Status filter (frontend only for now)
      if (selectedStatus !== 'all') {
        // TODO: This will be replaced with actual backend status field when implemented
        // For now, we're not filtering by status since backend doesn't support it yet
        // Once backend adds status field, uncomment:
        // if (listing.productStatus !== selectedStatus) return false
      }

      return true
    })
    .sort((a, b) => {
      // Time-based sorting
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0

      if (sortOrder === 'newest') {
        return dateB - dateA // Newest first
      } else {
        return dateA - dateB // Oldest first
      }
    })

  // Pagination calculations (on filtered/sorted list)
  const totalPages = Math.ceil(filteredAndSortedListings.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentListings = filteredAndSortedListings.slice(startIndex, endIndex)

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle page change with scroll to top
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    setTimeout(scrollToTop, 100) // Small delay to ensure content has updated
  }

  // Reset to first page when switching to listings tab or changing filters
  useEffect(() => {
    if (activeTab === 'listings') {
      setCurrentPage(1)
    }
  }, [activeTab, selectedCategory, selectedStatus, sortOrder])

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await apiClient.getCategories()
        setCategories(cats)
      } catch (error) {
        console.error('[Dashboard] Failed to fetch categories:', error)
        setCategories([])
      }
    }
    fetchCategories()
  }, [])

  // Check for tab parameter in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tabParam = urlParams.get('tab')
    if (tabParam && ['overview', 'listings', 'messages', 'analytics'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [])

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // BACKEND NOTE: The /userManagement/user-details endpoint doesn't return numeric userId
        // So we'll match by loggingEmail instead (products should have sellerEmail field)
        const userEmail = user?.email || user?.loggingEmail

        if (!userEmail) {
          if (process.env.NODE_ENV === 'development') {
            console.error('[Dashboard] No user email available for filtering')
          }
          setLoading(false)
          return
        }

        let allProducts: unknown[] = []

        // Use displayItem/newest endpoint - it actually returns products!
        let currentPage = 0
        let hasMore = true

        while (hasMore && currentPage < 10) {
          try {
            // Use getNewestListings instead of getAllProducts
            const productsResponse = await apiClient.getNewestListings(currentPage, 20)
            const response = productsResponse as {
              data?: { content?: unknown[]; last?: boolean } | unknown[]
              content?: unknown[]
            }
            const pageProducts =
              (response.data as { content?: unknown[] })?.content ||
              response.content ||
              (response.data as unknown[]) ||
              []

            // Pagination progress (dev only)
            if (process.env.NODE_ENV === 'development') {
              console.log(
                `[Dashboard] Fetched page ${currentPage}: ${pageProducts.length} products`
              )
            }

            if (pageProducts.length === 0) {
              hasMore = false
            } else {
              allProducts = [...allProducts, ...pageProducts]
              currentPage++

              if (
                (response.data as { last?: boolean })?.last === true ||
                pageProducts.length < 20
              ) {
                hasMore = false
              }
            }
          } catch (error) {
            console.error(`❌ Error fetching page ${currentPage}:`, error)
            hasMore = false
          }
        }

        // Log summary only
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Dashboard] Fetched ${allProducts.length} total products`)
        }

        // Filter products for current user
        // Try multiple matching strategies since backend doesn't provide numeric userId

        const userListings = allProducts.filter((item) => {
          const product = item as Record<string, unknown>
          // Strategy 1: Match by sellerEmail (if available)
          if (product.sellerEmail) {
            const emailMatch = String(product.sellerEmail).toLowerCase() === userEmail.toLowerCase()
            if (emailMatch) {
              return true
            }
          }

          // Strategy 2: Match by sellerName (less secure, but last resort)
          const userFullName = `${user?.firstName} ${user?.lastName}`.trim()
          if (product.sellerName && userFullName) {
            const nameMatch =
              String(product.sellerName).toLowerCase().trim() === userFullName.toLowerCase().trim()
            if (nameMatch) {
              return true
            }
          }

          return false
        }) as unknown[]

        // Log filtering results in development only
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Dashboard] Found ${userListings.length} listings for current user`)
        }

        // Only log detailed debug info in development mode when no products found
        if (
          userListings.length === 0 &&
          allProducts.length > 0 &&
          process.env.NODE_ENV === 'development'
        ) {
          console.log('[Dashboard] No user products found - showing empty state')
          console.log(`   User: ${user?.firstName} ${user?.lastName} (${userEmail})`)
          console.log(`   Total products in database: ${allProducts.length}`)
        }

        // FIXED: Get REAL click counts using the working product-clickCount API
        // DisplayItemsDTO.clickCount is hardcoded to 1, but product-clickCount API returns real data
        if (process.env.NODE_ENV === 'development') {
          console.log(
            `[Dashboard] Getting real click counts for ${userListings.length} user products...`
          )
        }

        const listingsWithRealViews = await Promise.all(
          userListings.map(async (item) => {
            const product = item as Record<string, unknown>
            const productId = product.productId as number

            try {
              // Use the working click count API that returns real data
              const clickData = await apiClient.getProductClickCount(productId)
              const realViews = clickData.clicks || 0

              if (process.env.NODE_ENV === 'development') {
                console.log(
                  `[Dashboard] Product ${productId}: REAL views=${realViews} (was hardcoded=${product.clickCount})`
                )
              }

              return {
                ...product,
                views: realViews,
              }
            } catch (error) {
              // Fallback to hardcoded value if API call fails (e.g., auth issues)
              const fallbackViews = (product.clickCount as number) || 0

              if (process.env.NODE_ENV === 'development') {
                console.warn(
                  `[Dashboard] Product ${productId}: Failed to get real click count, using fallback=${fallbackViews}`,
                  error
                )
              }

              return {
                ...product,
                views: fallbackViews,
              }
            }
          })
        )

        setListings(listingsWithRealViews as UserListing[])

        // Calculate stats from user listings with REAL view counts
        const activeCount = listingsWithRealViews.filter((item) => {
          const p = item as Record<string, unknown>
          return p.productStatus !== 'SOLD'
        }).length
        const totalViewsCount = listingsWithRealViews.reduce((sum: number, item) => {
          const p = item as Record<string, unknown>
          const views = (p.views as number) || 0
          return sum + views
        }, 0)

        setStats({
          activeListings: activeCount,
          totalViews: totalViewsCount,
          totalInquiries: 0, // TODO: Implement inquiries tracking
          totalRevenue: 0, // TODO: Implement revenue tracking
        })
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user])

  // Delete listing function
  const handleDeleteListing = async () => {
    if (!deleteDialog.productId) return

    try {
      console.log('🗑️ Deleting product:', deleteDialog.productId)
      await apiClient.deleteProduct(deleteDialog.productId)

      // Remove from local state
      setListings((prev) =>
        prev.filter((listing) => listing.productId.toString() !== deleteDialog.productId)
      )

      // Close dialog
      setDeleteDialog({ isOpen: false, productId: null, productName: '' })

      console.log('✅ Product deleted successfully')
    } catch (error) {
      console.error('❌ Failed to delete product:', error)
      // TODO: Show error toast
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-[#10B981] hover:bg-[#10B981]/90 text-white'
      case 'sold':
        return 'bg-[#6B7280] hover:bg-[#6B7280]/90 text-white'
      case 'pending':
        return 'bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-white'
      default:
        return 'bg-[#10B981] hover:bg-[#10B981]/90 text-white'
    }
  }

  // Profile completion calculation reserved for future profile progress feature
  // const getProfileCompletion = () => {
  //   let completion = 0
  //   if (user?.organizationEmail) completion += 40
  //   if (user?.backendVerificationStatus === 'VERIFIED') completion += 40
  //   if (user?.aboutMe) completion += 20
  //   return completion
  // }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#1E3A8A]" />
          <span className="text-[#64748B]">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-[#1E3A8A] text-white font-semibold">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-[#0F172A]">
                Welcome back, {user?.firstName || 'User'}!
              </h1>
              <div className="flex items-center mt-1">
                <span className="text-[#64748B]">{user?.organizationEmail || user?.email}</span>
                {user?.backendVerificationStatus === 'VERIFIED' && (
                  <Badge className="ml-2 bg-[#10B981] hover:bg-[#10B981]/90">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 h-11 p-1 bg-gray-100">
            <TabsTrigger
              value="overview"
              className="flex items-center justify-center gap-1 px-2 py-2 text-xs md:text-sm md:gap-2 md:px-3 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-md min-w-0"
            >
              <LayoutDashboard className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <span className="hidden sm:inline truncate">Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="listings"
              className="flex items-center justify-center gap-1 px-2 py-2 text-xs md:text-sm md:gap-2 md:px-3 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-md min-w-0"
            >
              <Package className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <span className="hidden sm:inline truncate">My Listings</span>
            </TabsTrigger>
            <TabsTrigger
              value="messages"
              className="flex items-center justify-center gap-1 px-2 py-2 text-xs md:text-sm md:gap-2 md:px-3 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-md min-w-0"
            >
              <MessageSquare className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <span className="hidden sm:inline truncate">Messages</span>
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="flex items-center justify-center gap-1 px-2 py-2 text-xs md:text-sm md:gap-2 md:px-3 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-md min-w-0"
            >
              <BarChart3 className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <span className="hidden sm:inline truncate">Analytics</span>
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="flex items-center justify-center gap-1 px-2 py-2 text-xs md:text-sm md:gap-2 md:px-3 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-md min-w-0"
            >
              <ShoppingBag className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <span className="hidden sm:inline truncate">Orders</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border border-[#E2E8F0]">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Package className="h-8 w-8 text-[#1E3A8A]" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-[#64748B]">Active Listings</p>
                      <p className="text-2xl font-bold text-[#0F172A]">{stats.activeListings}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-[#E2E8F0]">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Eye className="h-8 w-8 text-[#10B981]" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-[#64748B]">Total Views</p>
                      <p className="text-2xl font-bold text-[#0F172A]">{stats.totalViews}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-[#E2E8F0]">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <MessageSquare className="h-8 w-8 text-[#F59E0B]" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-[#64748B]">Messages</p>
                      <p className="text-2xl font-bold text-[#0F172A]">{stats.totalInquiries}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-[#E2E8F0]">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-[#EF4444]" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-[#64748B]">Revenue</p>
                      <p className="text-2xl font-bold text-[#0F172A]">
                        TZS {stats.totalRevenue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Listings Tab */}
          <TabsContent value="listings" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-semibold text-[#0F172A]">My Listings</h2>
              <Button asChild className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90">
                <Link href="/sell">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Listing
                </Link>
              </Button>
            </div>

            {/* Filters and Sorting */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-5 h-5 text-[#64748B]" />
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.categoryId} value={cat.categoryId.toString()}>
                        {cat.categoryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-5 h-5 text-[#64748B]" />
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <ArrowUpDown className="w-5 h-5 text-[#64748B]" />
                <Select
                  value={sortOrder}
                  onValueChange={(val) => setSortOrder(val as 'newest' | 'oldest')}
                >
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Sort by time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(selectedCategory !== 'all' ||
                selectedStatus !== 'all' ||
                sortOrder !== 'newest') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedCategory('all')
                    setSelectedStatus('all')
                    setSortOrder('newest')
                  }}
                  className="text-[#64748B] hover:text-[#0F172A]"
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Results count */}
            {filteredAndSortedListings.length < listings.length && (
              <div className="text-sm text-[#64748B]">
                Showing {filteredAndSortedListings.length} of {listings.length} listings
              </div>
            )}

            {currentListings.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {currentListings.map((listing) => (
                    <Card
                      key={listing.productId}
                      className="overflow-hidden border border-[#E2E8F0]"
                    >
                      <div className="aspect-video bg-[#F1F5F9] relative">
                        {listing.productImages?.[0]?.imageUrl ? (
                          <Image
                            src={getFullImageUrl(listing.productImages[0].imageUrl)}
                            alt={listing.productName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Package className="w-12 h-12 text-[#CBD5E1]" />
                          </div>
                        )}
                        <Badge
                          className={`absolute top-2 right-2 ${getStatusBadge(listing.productStatus || 'active')}`}
                        >
                          {listing.productStatus || 'active'}
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-[#0F172A] mb-2 truncate">
                          {listing.productName}
                        </h3>
                        <div className="mb-2">
                          <PriceDisplay
                            price={listing.productAskingPrice}
                            originalCurrency={listing.productCurrency as CurrencyCode}
                            size="lg"
                            weight="bold"
                            className="text-[#1E3A8A]"
                            showOriginal
                          />
                        </div>
                        <div className="flex items-center text-sm text-[#64748B] mb-3">
                          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                          <span className="truncate">
                            {cleanLocationString(listing.productLocation)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-[#64748B] mb-4">
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            <span className="font-medium">{listing.views || 0} views</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="flex-1" asChild>
                            <Link href={`/product/${listing.productId}`}>
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Link>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="outline">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/edit-listing/${listing.productId}`}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Listing
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  setDeleteDialog({
                                    isOpen: true,
                                    productId: listing.productId.toString(),
                                    productName: listing.productName,
                                  })
                                }
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Listing
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination Component */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="h-9 w-9 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        // Show first page, last page, current page, and pages around current page
                        const isVisible =
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 2 && page <= currentPage + 2)

                        if (!isVisible) {
                          // Show ellipsis for gaps
                          if (page === currentPage - 3 || page === currentPage + 3) {
                            return (
                              <span key={page} className="px-2 text-gray-500">
                                ...
                              </span>
                            )
                          }
                          return null
                        }

                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className={`h-9 w-9 p-0 ${
                              currentPage === page ? 'bg-[#1E3A8A] hover:bg-[#1E3A8A]/90' : ''
                            }`}
                          >
                            {page}
                          </Button>
                        )
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="h-9 w-9 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Pagination Info */}
                {totalPages > 0 && (
                  <div className="text-center text-sm text-[#64748B] mt-4">
                    Showing {startIndex + 1} to{' '}
                    {Math.min(endIndex, filteredAndSortedListings.length)} of{' '}
                    {filteredAndSortedListings.length} listings
                  </div>
                )}
              </>
            ) : filteredAndSortedListings.length === 0 && listings.length > 0 ? (
              // No results after filtering
              <Card className="border border-[#E2E8F0]">
                <CardContent className="py-12">
                  <div className="text-center">
                    <Filter className="w-16 h-16 text-[#CBD5E1] mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-[#0F172A] mb-2">
                      No listings match your filters
                    </h3>
                    <p className="text-[#64748B] mb-6">
                      Try adjusting your category or sort filters to see more results
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedCategory('all')
                        setSortOrder('newest')
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              // No listings at all
              <Card className="border border-[#E2E8F0]">
                <CardContent className="py-12">
                  <div className="text-center">
                    <Package className="w-16 h-16 text-[#CBD5E1] mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-[#0F172A] mb-2">No listings yet</h3>
                    <p className="text-[#64748B] mb-6">
                      Start selling by creating your first listing
                    </p>
                    <Button asChild className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90">
                      <Link href="/sell">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Listing
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            <Card className="border border-[#E2E8F0]">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-[#0F172A]">
                  Recent Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-[#CBD5E1] mx-auto mb-4" />
                  <p className="text-[#64748B]">No recent messages</p>
                  <Button asChild className="mt-4 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90">
                    <Link href="/messages">View All Messages</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border border-[#E2E8F0]">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-[#0F172A]">
                    Performance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-[#F1F5F9]">
                      <span className="text-sm font-medium text-[#64748B]">Total Listings</span>
                      <span className="text-2xl font-bold text-[#0F172A]">{listings.length}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-[#F1F5F9]">
                      <span className="text-sm font-medium text-[#64748B]">Active Listings</span>
                      <span className="text-2xl font-bold text-[#0F172A]">
                        {stats.activeListings}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-sm font-medium text-[#64748B]">Total Views</span>
                      <span className="text-2xl font-bold text-[#0F172A]">{stats.totalViews}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl font-semibold text-[#0F172A]">Order History</h2>
            </div>

            {/* Empty State - No orders yet */}
            <Card className="border border-[#E2E8F0]">
              <CardContent className="p-12 text-center">
                <ShoppingBag className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-800 mb-2">No Orders Yet</h3>
                <p className="text-neutral-600 mb-6">
                  Your purchase history will appear here once you complete your first order.
                </p>
                <Button asChild className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90">
                  <Link href="/browse">Start Shopping</Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={deleteDialog.isOpen}
          onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, isOpen: open }))}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Listing</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{deleteDialog.productName}&quot;? This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteListing}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
