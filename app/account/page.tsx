'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Package, Settings, History, Shield, ChevronRight, HelpCircle, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { useAccountStats } from '@/hooks/use-account-stats'
import { useTutorial } from '@/providers/tutorial-provider'
import { getInitials } from '@/lib/utils'

const accountMenuItems = [
  {
    id: 'orders',
    label: 'My Orders',
    icon: Package,
    href: '/expat/dashboard?tab=orders',
    description: 'View your purchase history',
    count: 0,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/account/settings',
    description: 'Profile & security',
  },
  {
    id: 'verification',
    label: 'Email Verification',
    icon: Shield,
    href: '/account/verification',
    description: 'Verify your email address',
  },
]

interface Order {
  id: string
  date: string
  status: string
  image: string
  product: string
  seller: string
  items: number
  total: number
}

const recentOrders: Order[] = [] // Empty array - no placeholder orders

const _accountStats = [
  {
    label: 'Total Orders',
    value: 0,
    href: '/expat/dashboard?tab=orders',
    icon: Package,
    color: 'text-blue-600',
  },
  {
    label: 'Reviews Written',
    value: 0,
    href: '/expat/dashboard?tab=orders',
    icon: Star,
    color: 'text-green-600',
  },
]

export default function AccountDashboard() {
  const { user, isVerifiedBuyer, isLoading: authLoading } = useAuth()
  useRouter() // Router available if needed
  const [activeTab, setActiveTab] = useState('overview')
  const { stats: backendStats, isLoading: statsLoading, error: statsError } = useAccountStats()
  const { toast } = useToast()
  const { startTutorial } = useTutorial()

  // Compute dynamic stats from backend data
  const stats = [
    {
      label: 'Total Orders',
      value: backendStats?.totalOrders ?? 0,
      href: '/expat/dashboard?tab=orders',
      icon: Package,
      color: 'text-blue-600',
    },
    {
      label: 'Reviews Written',
      value: backendStats?.reviewsWritten ?? 0,
      href: '/expat/dashboard?tab=orders',
      icon: Star,
      color: 'text-green-600',
    },
  ]

  // Update menu items with dynamic counts
  const dynamicMenuItems = accountMenuItems.map((item) => {
    if (item.id === 'orders') {
      return { ...item, count: backendStats?.totalOrders ?? item.count }
    }
    if (item.id === 'wishlist') {
      return { ...item, count: backendStats?.wishlistItems ?? item.count }
    }
    return item
  })

  // Show error toast if stats failed to load
  useEffect(() => {
    if (statsError) {
      toast({
        title: 'Error loading account data',
        description: 'Some information may not be up to date.',
        variant: 'destructive',
      })
    }
  }, [statsError, toast])

  if (authLoading || statsLoading) {
    return <AccountSkeleton />
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6" data-tutorial="account-header">
          <h1 className="text-3xl font-bold text-neutral-800 mb-1">My Account</h1>
          <p className="text-neutral-600">Manage your account settings and view your activity</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                {/* User Info */}
                <div className="flex flex-col items-center text-center mb-6">
                  <Avatar className="w-20 h-20 mb-4">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="bg-brand-secondary text-brand-primary text-lg font-bold">
                      {getInitials(user?.name || '')}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="font-semibold text-lg text-neutral-800 truncate w-full">
                    {user?.name || 'User'}
                  </h2>
                  <p className="text-sm text-neutral-600 truncate w-full">{user?.email}</p>
                  {isVerifiedBuyer && (
                    <Badge className="mt-2 bg-green-100 text-green-800">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified Buyer
                    </Badge>
                  )}
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                  {dynamicMenuItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        className="flex items-center justify-between gap-2 px-3 py-3 rounded-lg hover:bg-neutral-100 transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Icon className="w-5 h-5 text-neutral-600 group-hover:text-brand-primary flex-shrink-0" />
                          <span className="text-sm font-medium text-neutral-700 group-hover:text-neutral-900 truncate">
                            {item.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {item.count && (
                            <Badge
                              variant="secondary"
                              className="bg-neutral-100 text-neutral-600 text-xs"
                            >
                              {item.count}
                            </Badge>
                          )}
                          <ChevronRight className="w-4 h-4 text-neutral-400" />
                        </div>
                      </Link>
                    )
                  })}
                </nav>

                {/* Tutorial Button */}
                <div className="mt-4 pt-4 border-t border-neutral-100">
                  <Button
                    onClick={startTutorial}
                    variant="outline"
                    size="sm"
                    className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300 text-blue-700 font-medium"
                  >
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Platform Tutorial
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6 h-12">
                <TabsTrigger value="overview" className="text-sm">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="orders" className="text-sm">
                  Recent Orders
                </TabsTrigger>
                <TabsTrigger value="activity" className="text-sm">
                  Activity
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Account Stats */}
                <Card className="bg-white shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle>Account Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      {stats.map((stat) => {
                        const Icon = stat.icon
                        return (
                          <Link key={stat.label} href={stat.href} className="block">
                            <div className="text-center p-4 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer group">
                              <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center group-hover:bg-neutral-200 transition-colors">
                                <Icon className={`w-6 h-6 ${stat.color}`} />
                              </div>
                              <p className="text-2xl font-bold text-brand-primary mb-1">
                                {stat.value}
                              </p>
                              <p className="text-xs text-neutral-600 leading-tight">{stat.label}</p>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dynamicMenuItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link key={item.id} href={item.href} className="block">
                        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="p-2 bg-brand-primary/10 rounded-lg flex-shrink-0">
                                    <Icon className="w-5 h-5 text-brand-primary" />
                                  </div>
                                  <div className="min-w-0">
                                    <h3 className="font-semibold text-neutral-800 truncate">
                                      {item.label}
                                    </h3>
                                    {item.count && (
                                      <Badge variant="secondary" className="mt-1 text-xs">
                                        {item.count} items
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <p className="text-sm text-neutral-600 line-clamp-2">
                                  {item.description}
                                </p>
                              </div>
                              <ChevronRight className="w-5 h-5 text-neutral-400 flex-shrink-0 ml-2" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              </TabsContent>

              <TabsContent value="orders" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Recent Orders</h3>
                  <Link href="/expat/dashboard?tab=orders">
                    <Button variant="outline" size="sm">
                      View All Orders
                    </Button>
                  </Link>
                </div>

                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <Card
                      key={order.id}
                      className="bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-neutral-800 truncate">{order.id}</h3>
                            <p className="text-sm text-neutral-600">Placed on {order.date}</p>
                          </div>
                          <Badge
                            variant={order.status === 'Delivered' ? 'default' : 'outline'}
                            className={
                              order.status === 'Delivered'
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'In Transit'
                                  ? 'bg-blue-100 text-blue-800'
                                  : ''
                            }
                          >
                            {order.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <Image
                            src={order.image}
                            alt="Order item"
                            width={64}
                            height={64}
                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-neutral-800 truncate">
                              {order.product}
                            </h4>
                            <p className="text-sm text-neutral-600 truncate">
                              Sold by: {order.seller}
                            </p>
                            <p className="text-sm text-neutral-600">{order.items} items</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-semibold text-brand-primary text-lg">
                              {order.total}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Link href={`/expat/dashboard?tab=orders`}>
                                <Button variant="outline" size="sm">
                                  View Details
                                </Button>
                              </Link>
                              {order.status === 'Delivered' && (
                                <Button variant="ghost" size="sm">
                                  Buy Again
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="bg-white shadow-sm">
                    <CardContent className="p-8 text-center">
                      <Package className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-neutral-800 mb-2">No orders yet</h3>
                      <p className="text-neutral-600 mb-4">
                        Start shopping to see your orders here
                      </p>
                      <Link href="/browse">
                        <Button>Browse Products</Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <Card className="bg-white shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center">
                      <div className="max-w-md mx-auto bg-neutral-50 rounded-full p-8 text-center">
                        <History className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                          No activity yet
                        </h3>
                        <p className="text-neutral-600 mb-4">
                          Your recent activity will appear here as you browse and shop
                        </p>
                        <Link href="/browse">
                          <Button variant="outline">Start Browsing</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

const AccountSkeleton = () => (
  <div className="min-h-screen bg-neutral-50">
    <div className="bg-white border-b">
      <div className="container mx-auto px-4 py-3">
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <Skeleton className="w-24 h-24 rounded-full mb-4" />
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="bg-white shadow-sm">
                <CardContent className="p-6 text-center">
                  <Skeleton className="w-12 h-12 rounded-full mx-auto mb-2" />
                  <Skeleton className="h-8 w-16 mx-auto mb-1" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-white shadow-sm">
                <CardContent className="p-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
)
