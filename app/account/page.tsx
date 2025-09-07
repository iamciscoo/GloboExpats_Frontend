'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  User,
  Package,
  Heart,
  MapPin,
  CreditCard,
  Settings,
  History,
  Shield,
  ChevronRight,
  Bell,
  Download,
  MessageCircle,
  ShoppingBag,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/components/ui/use-toast'

const accountMenuItems = [
  {
    id: 'orders',
    label: 'My Orders',
    icon: Package,
    href: '/account/orders',
    description: 'Track, return, or buy things again',
    count: 12,
  },
  {
    id: 'wishlist',
    label: 'Wishlist',
    icon: Heart,
    href: '/account/wishlist',
    description: 'View your saved items',
    count: 8,
  },
  {
    id: 'addresses',
    label: 'Addresses',
    icon: MapPin,
    href: '/account/addresses',
    description: 'Edit addresses for orders and gifts',
    count: 2,
  },
  {
    id: 'payment',
    label: 'Payment Methods',
    icon: CreditCard,
    href: '/account/payment-methods',
    description: 'Edit or add payment methods',
    count: 3,
  },
  {
    id: 'settings',
    label: 'Account Settings',
    icon: Settings,
    href: '/account/settings',
    description: 'Login & security, notifications',
  },
  {
    id: 'verification',
    label: 'Expat Verification',
    icon: Shield,
    href: '/account/verification',
    description: 'Verify your expat status',
  },
]

const recentOrders = [
  {
    id: 'ORD-2024-001',
    date: 'March 15, 2024',
    total: '$299.99',
    status: 'Delivered',
    items: 2,
    image: '/images/iphone-15-pro.jpg',
    seller: 'TechExpat Dubai',
    product: 'iPhone 15 Pro Max',
  },
  {
    id: 'ORD-2024-002',
    date: 'March 10, 2024',
    total: '$149.99',
    status: 'In Transit',
    items: 1,
    image: '/images/macbook-air.jpg',
    seller: 'ElectroWorld',
    product: 'MacBook Air M2',
  },
  {
    id: 'ORD-2024-003',
    date: 'February 28, 2024',
    total: '$89.99',
    status: 'Delivered',
    items: 1,
    image: '/images/sony-headphones.jpg',
    seller: 'AudioExperts',
    product: 'Sony WH-1000XM5',
  },
]

const accountStats = [
  {
    label: 'Total Orders',
    value: 12,
    href: '/account/orders',
    icon: Package,
    color: 'text-blue-600',
  },
  {
    label: 'Wishlist Items',
    value: 8,
    href: '/account/wishlist',
    icon: Heart,
    color: 'text-red-600',
  },
  {
    label: 'Reviews Written',
    value: 3,
    href: '/account/orders?tab=reviews',
    icon: MessageCircle,
    color: 'text-green-600',
  },
  {
    label: 'Saved Addresses',
    value: 2,
    href: '/account/addresses',
    icon: MapPin,
    color: 'text-purple-600',
  },
]

export default function AccountDashboard() {
  const { user, isVerifiedBuyer, isLoading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState(accountStats)
  const { toast } = useToast()

  // Simulate loading account data
  useEffect(() => {
    const loadAccountData = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setStats(accountStats)
      } catch (error) {
        toast({
          title: 'Error loading account data',
          description: 'Some information may not be up to date.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (!authLoading) {
      loadAccountData()
    }
  }, [authLoading, toast])

  if (authLoading || isLoading) {
    return <AccountSkeleton />
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">My Account</h1>
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
                    <AvatarFallback className="text-lg">
                      {user?.name?.charAt(0) || 'U'}
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

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                  <Link href="/messages" className="w-full">
                    <Button size="sm" variant="outline" className="w-full">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Messages</span>
                      <span className="sm:hidden">Msg</span>
                    </Button>
                  </Link>
                  <Link href="/notifications" className="w-full">
                    <Button size="sm" variant="outline" className="w-full">
                      <Bell className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Alerts</span>
                      <span className="sm:hidden">Alert</span>
                    </Button>
                  </Link>
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                  {accountMenuItems.map((item) => {
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
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                  {accountMenuItems.map((item) => {
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
                  <Link href="/account/orders">
                    <Button variant="outline" size="sm">
                      View All Orders
                    </Button>
                  </Link>
                </div>

                {recentOrders.map((order) => (
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
                          <h4 className="font-medium text-neutral-800 truncate">{order.product}</h4>
                          <p className="text-sm text-neutral-600 truncate">
                            Sold by: {order.seller}
                          </p>
                          <p className="text-sm text-neutral-600">{order.items} items</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-brand-primary text-lg">{order.total}</p>
                          <div className="flex gap-2 mt-2">
                            <Link href={`/account/orders/${order.id}`}>
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
                ))}
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <Card className="bg-white shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-center">
                      <CardTitle>Recent Activity</CardTitle>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 hover:bg-neutral-50 rounded-lg">
                        <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
                          <History className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-800 truncate">
                            Viewed iPhone 15 Pro Max
                          </p>
                          <p className="text-xs text-neutral-600">2 hours ago</p>
                        </div>
                        <Link href="/product/1">
                          <Button variant="ghost" size="sm" className="flex-shrink-0">
                            View Item
                          </Button>
                        </Link>
                      </div>
                      <div className="flex items-start gap-3 p-3 hover:bg-neutral-50 rounded-lg">
                        <div className="p-2 bg-green-100 rounded-full flex-shrink-0">
                          <Package className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-800 truncate">
                            Order #ORD-2024-001 delivered
                          </p>
                          <p className="text-xs text-neutral-600">3 days ago</p>
                        </div>
                        <Link href="/account/orders/ORD-2024-001">
                          <Button variant="ghost" size="sm" className="flex-shrink-0">
                            View Order
                          </Button>
                        </Link>
                      </div>
                      <div className="flex items-start gap-3 p-3 hover:bg-neutral-50 rounded-lg">
                        <div className="p-2 bg-purple-100 rounded-full flex-shrink-0">
                          <Heart className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-800 truncate">
                            Added MacBook Air to wishlist
                          </p>
                          <p className="text-xs text-neutral-600">1 week ago</p>
                        </div>
                        <Link href="/account/wishlist">
                          <Button variant="ghost" size="sm" className="flex-shrink-0">
                            View Wishlist
                          </Button>
                        </Link>
                      </div>
                      <div className="flex items-start gap-3 p-3 hover:bg-neutral-50 rounded-lg">
                        <div className="p-2 bg-yellow-100 rounded-full flex-shrink-0">
                          <MessageCircle className="w-4 h-4 text-yellow-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-800 truncate">
                            Left review for Sony headphones
                          </p>
                          <p className="text-xs text-neutral-600">2 weeks ago</p>
                        </div>
                        <Link href="/product/3">
                          <Button variant="ghost" size="sm" className="flex-shrink-0">
                            View Review
                          </Button>
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
