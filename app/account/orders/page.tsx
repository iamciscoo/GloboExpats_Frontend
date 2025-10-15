'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  ChevronRight,
  Calendar,
  Search,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Mock order data
const orders = [
  {
    id: 'ORD-2024-001',
    date: '2024-03-15',
    total: '$299.99',
    status: 'delivered',
    estimatedDelivery: '2024-03-20',
    items: [
      {
        id: 1,
        name: 'iPhone 15 Pro Max',
        price: '$199.99',
        quantity: 1,
        image: '/images/iphone-15-pro.jpg',
        seller: 'TechExpat Dubai',
      },
      {
        id: 2,
        name: 'Apple AirPods Pro',
        price: '$99.99',
        quantity: 1,
        image: '/images/airpods-pro.jpg',
        seller: 'TechExpat Dubai',
      },
    ],
    trackingNumber: 'AE123456789',
    shippingAddress: '123 Palm Street, Dubai Marina, Dubai, UAE',
  },
  {
    id: 'ORD-2024-002',
    date: '2024-03-10',
    total: '$149.99',
    status: 'in-transit',
    estimatedDelivery: '2024-03-25',
    items: [
      {
        id: 3,
        name: 'MacBook Air M2',
        price: '$149.99',
        quantity: 1,
        image: '/images/macbook-air.jpg',
        seller: 'ElectroWorld',
      },
    ],
    trackingNumber: 'AE987654321',
    shippingAddress: '456 Sheikh Zayed Road, Dubai, UAE',
  },
  {
    id: 'ORD-2024-003',
    date: '2024-03-05',
    total: '$89.99',
    status: 'processing',
    estimatedDelivery: '2024-03-28',
    items: [
      {
        id: 4,
        name: 'Sony WH-1000XM5',
        price: '$89.99',
        quantity: 1,
        image: '/images/sony-headphones.jpg',
        seller: 'AudioExperts',
      },
    ],
    trackingNumber: 'Pending',
    shippingAddress: '789 JBR Walk, Dubai, UAE',
  },
]

const statusConfig = {
  delivered: {
    label: 'Delivered',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800',
    iconColor: 'text-green-600',
  },
  'in-transit': {
    label: 'In Transit',
    icon: Truck,
    color: 'bg-blue-100 text-blue-800',
    iconColor: 'text-blue-600',
  },
  processing: {
    label: 'Processing',
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800',
    iconColor: 'text-yellow-600',
  },
  cancelled: {
    label: 'Cancelled',
    icon: AlertCircle,
    color: 'bg-red-100 text-red-800',
    iconColor: 'text-red-600',
  },
}

export default function OrderHistory() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')

  // Filter orders based on search and filters
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter

    // Simple date filter logic (you'd implement proper date comparison)
    const matchesDate = dateFilter === 'all' || true

    return matchesSearch && matchesStatus && matchesDate
  })

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-neutral-600 mb-4">
            <Link href="/account" className="hover:text-brand-primary">
              My Account
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-neutral-800">Order History</span>
          </div>
          <h1 className="text-3xl font-bold text-neutral-800">Your Orders</h1>
        </div>

        {/* Filters */}
        <Card className="bg-white shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <Input
                  placeholder="Search orders by ID or product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="in-transit">In Transit</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Filter */}
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="6months">Last 6 months</SelectItem>
                  <SelectItem value="year">This year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Order Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Total Orders</p>
                  <p className="text-2xl font-bold text-neutral-800">12</p>
                </div>
                <Package className="w-8 h-8 text-brand-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Delivered</p>
                  <p className="text-2xl font-bold text-green-600">8</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">In Transit</p>
                  <p className="text-2xl font-bold text-blue-600">3</p>
                </div>
                <Truck className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Processing</p>
                  <p className="text-2xl font-bold text-yellow-600">1</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const status = statusConfig[order.status as keyof typeof statusConfig]
            const StatusIcon = status.icon

            return (
              <Card key={order.id} className="bg-white shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  {/* Order Header */}
                  <div className="bg-neutral-50 px-6 py-4 border-b">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-neutral-800">{order.id}</h3>
                            <Badge className={status.color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-neutral-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Ordered: {new Date(order.date).toLocaleDateString()}
                            </span>
                            <span>Total: {order.total}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          Invoice
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              More Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>Track Package</DropdownMenuItem>
                            <DropdownMenuItem>Contact Seller</DropdownMenuItem>
                            <DropdownMenuItem>Request Return</DropdownMenuItem>
                            <DropdownMenuItem>Buy Again</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex gap-4">
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-neutral-800">{item.name}</h4>
                            <p className="text-sm text-neutral-600">Sold by: {item.seller}</p>
                            <p className="text-sm text-neutral-600">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-neutral-800">{item.price}</p>
                            <Button
                              variant="link"
                              size="sm"
                              className="text-brand-primary p-0 h-auto"
                            >
                              Write a review
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Tracking Info */}
                    {order.status !== 'processing' && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-neutral-600">
                              Tracking:{' '}
                              <span className="font-medium text-neutral-800">
                                {order.trackingNumber}
                              </span>
                            </p>
                            <p className="text-sm text-neutral-600">
                              Est. Delivery:{' '}
                              <span className="font-medium text-neutral-800">
                                {new Date(order.estimatedDelivery).toLocaleDateString()}
                              </span>
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Track Package
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <Card className="bg-white shadow-sm">
            <CardContent className="p-12 text-center">
              <Package className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">No orders found</h3>
              <p className="text-neutral-600 mb-4">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : "You haven't placed any orders yet"}
              </p>
              <Link href="/browse">
                <Button>Start Shopping</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
