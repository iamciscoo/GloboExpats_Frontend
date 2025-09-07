'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  Package, 
  MessageSquare, 
  Settings, 
  TrendingUp, 
  Eye, 
  Heart,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Star,
  Edit,
  Trash2,
  MoreHorizontal
} from 'lucide-react'

// Mock data for demonstration
const mockListings = [
  {
    id: '1',
    title: 'MacBook Pro 13" M2',
    price: 1200,
    status: 'active',
    views: 45,
    likes: 8,
    messages: 3,
    location: 'Berlin, Germany',
    createdAt: '2024-01-15',
    image: '/images/macbook-pro.jpg'
  },
  {
    id: '2',
    title: 'Vintage Leather Sofa',
    price: 450,
    status: 'sold',
    views: 23,
    likes: 5,
    messages: 7,
    location: 'Amsterdam, Netherlands',
    createdAt: '2024-01-10',
    image: '/images/leather-sofa.jpg'
  },
  {
    id: '3',
    title: 'Professional Camera Kit',
    price: 800,
    status: 'pending',
    views: 67,
    likes: 12,
    messages: 9,
    location: 'Barcelona, Spain',
    createdAt: '2024-01-20',
    image: '/images/camera-kit.jpg'
  }
]

const mockStats = {
  totalListings: 12,
  activeListings: 8,
  totalViews: 234,
  totalMessages: 45,
  totalSales: 3,
  totalRevenue: 2150
}

const mockProfile = {
  name: 'Sarah Johnson',
  location: 'Berlin, Germany',
  joinedDate: '2023-06-15',
  rating: 4.8,
  totalReviews: 24,
  verificationStatus: 'verified',
  profileCompletion: 85
}

export default function ExpatDashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      sold: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-gray-100 text-gray-800'
    }
    return variants[status as keyof typeof variants] || variants.active
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-brand-primary to-brand-accent rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {mockProfile.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{mockProfile.name}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {mockProfile.location}
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1 text-yellow-500" />
                    {mockProfile.rating} ({mockProfile.totalReviews} reviews)
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {mockProfile.verificationStatus}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/sell">
                  <Plus className="w-4 h-4 mr-2" />
                  New Listing
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/account">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Package className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Listings</p>
                      <p className="text-2xl font-bold text-gray-900">{mockStats.activeListings}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Eye className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Views</p>
                      <p className="text-2xl font-bold text-gray-900">{mockStats.totalViews}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <MessageSquare className="w-8 h-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Messages</p>
                      <p className="text-2xl font-bold text-gray-900">{mockStats.totalMessages}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="w-8 h-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">${mockStats.totalRevenue}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Listings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockListings.slice(0, 3).map((listing) => (
                      <div key={listing.id} className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{listing.title}</p>
                          <p className="text-sm text-gray-600">${listing.price}</p>
                        </div>
                        <Badge className={getStatusBadge(listing.status)}>
                          {listing.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Profile Completion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Profile Progress</span>
                      <span className="text-sm text-gray-600">{mockProfile.profileCompletion}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${mockProfile.profileCompletion}%` }}
                      ></div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-green-600">
                        <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                        Profile photo added
                      </div>
                      <div className="flex items-center text-green-600">
                        <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                        Identity verified
                      </div>
                      <div className="flex items-center text-gray-400">
                        <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                        Add bio description
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Listings Tab */}
          <TabsContent value="listings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">My Listings</h2>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/sell">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Listing
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockListings.map((listing) => (
                <Card key={listing.id} className="overflow-hidden">
                  <div className="aspect-video bg-gray-200 relative">
                    <Badge 
                      className={`absolute top-2 right-2 ${getStatusBadge(listing.status)}`}
                    >
                      {listing.status}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{listing.title}</h3>
                    <p className="text-lg font-bold text-blue-600 mb-2">${listing.price}</p>
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      {listing.location}
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {listing.views}
                      </div>
                      <div className="flex items-center">
                        <Heart className="w-4 h-4 mr-1" />
                        {listing.likes}
                      </div>
                      <div className="flex items-center">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        {listing.messages}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Boost
                      </Button>
                      <Button size="sm" variant="outline">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No recent messages</p>
                  <Button asChild className="mt-4">
                    <Link href="/messages">View All Messages</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Listings</span>
                      <span className="text-2xl font-bold">{mockStats.totalListings}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Conversion Rate</span>
                      <span className="text-2xl font-bold">25%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Avg. Response Time</span>
                      <span className="text-2xl font-bold">2h</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Electronics</span>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Furniture</span>
                      <span className="text-sm font-medium">30%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Fashion</span>
                      <span className="text-sm font-medium">25%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
