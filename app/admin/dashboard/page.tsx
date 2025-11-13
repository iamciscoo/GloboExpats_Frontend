'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { RouteGuard } from '@/components/route-guard'
import {
  LayoutDashboard,
  Users,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Filter,
  ShoppingCart,
} from 'lucide-react'

export default function AdminDashboardPage() {
  return (
    <RouteGuard requireAdmin loadingMessage="Verifying admin access...">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <LayoutDashboard className="h-8 w-8" />
            Admin Dashboard
          </h1>
          <p className="text-slate-600">Platform management and administration</p>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 gap-1">
            <TabsTrigger
              value="overview"
              className="flex items-center gap-1 px-2 py-2 text-xs md:text-sm md:gap-2 md:px-4"
            >
              <LayoutDashboard className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="flex items-center gap-1 px-2 py-2 text-xs md:text-sm md:gap-2 md:px-4"
            >
              <Users className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger
              value="listings"
              className="flex items-center gap-1 px-2 py-2 text-xs md:text-sm md:gap-2 md:px-4"
            >
              <Package className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Listings</span>
            </TabsTrigger>
            <TabsTrigger
              value="verification"
              className="flex items-center gap-1 px-2 py-2 text-xs md:text-sm md:gap-2 md:px-4"
            >
              <CheckCircle className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Verification</span>
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="flex items-center gap-1 px-2 py-2 text-xs md:text-sm md:gap-2 md:px-4"
            >
              <ShoppingCart className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <Card>
                <CardContent className="p-3 md:p-4">
                  <div className="space-y-2">
                    <p className="text-xs md:text-sm font-medium text-gray-600">Total Users</p>
                    <div className="flex items-baseline justify-between">
                      <p className="text-lg md:text-2xl font-bold text-gray-900">0</p>
                      <Badge className="bg-gray-100 text-gray-700 text-xs px-2 py-1 hidden md:inline-flex">
                        No Data
                      </Badge>
                    </div>
                    <div className="md:hidden">
                      <Badge className="bg-gray-100 text-gray-700 text-xs px-2 py-1">No Data</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 md:p-4">
                  <div className="space-y-2">
                    <p className="text-xs md:text-sm font-medium text-gray-600">Active Listings</p>
                    <div className="flex items-baseline justify-between">
                      <p className="text-lg md:text-2xl font-bold text-gray-900">0</p>
                      <Badge className="bg-gray-100 text-gray-700 text-xs px-2 py-1 hidden md:inline-flex">
                        No Data
                      </Badge>
                    </div>
                    <div className="md:hidden">
                      <Badge className="bg-gray-100 text-gray-700 text-xs px-2 py-1">No Data</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 md:p-4">
                  <div className="space-y-2">
                    <p className="text-xs md:text-sm font-medium text-gray-600">
                      Pending Verifications
                    </p>
                    <div className="flex items-baseline justify-between">
                      <p className="text-lg md:text-2xl font-bold text-gray-900">0</p>
                      <Badge className="bg-gray-100 text-gray-700 text-xs px-2 py-1 hidden md:inline-flex">
                        No Data
                      </Badge>
                    </div>
                    <div className="md:hidden">
                      <Badge className="bg-gray-100 text-gray-700 text-xs px-2 py-1">No Data</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 md:p-4">
                  <div className="space-y-2">
                    <p className="text-xs md:text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <div className="flex items-baseline justify-between">
                      <p className="text-lg md:text-2xl font-bold text-gray-900">$0</p>
                      <Badge className="bg-gray-100 text-gray-700 text-xs px-2 py-1 hidden md:inline-flex">
                        No Data
                      </Badge>
                    </div>
                    <div className="md:hidden">
                      <Badge className="bg-gray-100 text-gray-700 text-xs px-2 py-1">No Data</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search users..." className="pl-10" />
                  </div>
                </div>
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>User management interface will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Listings Tab */}
          <TabsContent value="listings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Listings Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search listings..." className="pl-10" />
                  </div>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Listings management interface will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verification Tab */}
          <TabsContent value="verification" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  User Verifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="p-4 text-center">
                      <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                      <p className="font-semibold">0 Pending</p>
                    </CardContent>
                  </Card>
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4 text-center">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="font-semibold">0 Verified</p>
                    </CardContent>
                  </Card>
                  <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4 text-center">
                      <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                      <p className="font-semibold">0 Rejected</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Verification queue will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Order Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4 text-center">
                      <ShoppingCart className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="font-semibold">0 Total Orders</p>
                      <p className="text-xs text-blue-600">This month</p>
                    </CardContent>
                  </Card>
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4 text-center">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="font-semibold">0 Completed</p>
                      <p className="text-xs text-green-600">Successful transactions</p>
                    </CardContent>
                  </Card>
                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="p-4 text-center">
                      <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                      <p className="font-semibold">0 Pending</p>
                      <p className="text-xs text-yellow-600">Awaiting processing</p>
                    </CardContent>
                  </Card>
                  <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4 text-center">
                      <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                      <p className="font-semibold">0 Cancelled</p>
                      <p className="text-xs text-red-600">Refund processed</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Order management interface will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RouteGuard>
  )
}
