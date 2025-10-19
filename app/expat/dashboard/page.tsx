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
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { apiClient } from '@/lib/api'
import { getFullImageUrl, cleanLocationString } from '@/lib/image-utils'
import { RouteGuard } from '@/components/route-guard'
import PriceDisplay from '@/components/price-display'
import type { CurrencyCode } from '@/lib/currency-types'

interface UserListing {
  productId: number
  productName: string
  productAskingPrice: number
  productCurrency: string
  productLocation: string
  productImages?: Array<{ imageUrl: string }>
  productStatus?: string
  views?: number
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

        setListings(userListings as UserListing[])

        // Calculate stats from user listings
        const activeCount = userListings.filter((item) => {
          const p = item as Record<string, unknown>
          return p.productStatus !== 'SOLD'
        }).length
        const totalViewsCount = userListings.reduce((sum: number, item) => {
          const p = item as Record<string, unknown>
          return sum + ((p.views as number) || 0)
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
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-[#0F172A]">My Listings</h2>
              <Button asChild className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90">
                <Link href="/sell">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Listing
                </Link>
              </Button>
            </div>

            {listings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <Card key={listing.productId} className="overflow-hidden border border-[#E2E8F0]">
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
                          {listing.views || 0}
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
            ) : (
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
