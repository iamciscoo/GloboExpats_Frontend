'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Heart,
  ShoppingCart,
  Trash2,
  Share2,
  Bell,
  TrendingDown,
  ChevronRight,
  Filter,
  SortAsc,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/use-toast'

// Mock wishlist data
const mockWishlistItems = [
  {
    id: 1,
    productId: 101,
    name: 'iPhone 15 Pro Max 256GB',
    price: '$1,199',
    originalPrice: '$1,299',
    image: '/images/iphone-15-pro.jpg',
    seller: 'TechExpat Dubai',
    inStock: true,
    dateAdded: '2024-03-10',
    priceDropped: true,
    discount: 8,
  },
  {
    id: 2,
    productId: 102,
    name: 'MacBook Air M2 13-inch',
    price: '$999',
    originalPrice: '$1,099',
    image: '/images/macbook-air.jpg',
    seller: 'ElectroWorld',
    inStock: true,
    dateAdded: '2024-03-08',
    priceDropped: false,
    discount: 9,
  },
  {
    id: 3,
    productId: 103,
    name: 'Sony WH-1000XM5 Headphones',
    price: '$349',
    originalPrice: null,
    image: '/images/sony-headphones.jpg',
    seller: 'AudioExperts',
    inStock: false,
    dateAdded: '2024-03-05',
    priceDropped: false,
    discount: 0,
  },
  {
    id: 4,
    productId: 104,
    name: 'iPad Pro 11-inch M2',
    price: '$799',
    originalPrice: '$899',
    image: '/images/ipad-pro.jpg',
    seller: 'TechExpat Dubai',
    inStock: true,
    dateAdded: '2024-03-01',
    priceDropped: true,
    discount: 11,
  },
]

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState(mockWishlistItems)
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [sortBy, setSortBy] = useState('date-added')
  const [filterBy, setFilterBy] = useState('all')
  const { toast } = useToast()

  // Sort items
  const sortedItems = [...wishlistItems].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return (
          parseFloat(a.price.replace('$', '').replace(',', '')) -
          parseFloat(b.price.replace('$', '').replace(',', ''))
        )
      case 'price-high':
        return (
          parseFloat(b.price.replace('$', '').replace(',', '')) -
          parseFloat(a.price.replace('$', '').replace(',', ''))
        )
      case 'name':
        return a.name.localeCompare(b.name)
      case 'date-added':
      default:
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
    }
  })

  // Filter items
  const filteredItems = sortedItems.filter((item) => {
    switch (filterBy) {
      case 'in-stock':
        return item.inStock
      case 'price-dropped':
        return item.priceDropped
      case 'out-of-stock':
        return !item.inStock
      default:
        return true
    }
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredItems.map((item) => item.id))
    } else {
      setSelectedItems([])
    }
  }

  const handleSelectItem = (itemId: number, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId])
    } else {
      setSelectedItems(selectedItems.filter((id) => id !== itemId))
    }
  }

  const handleRemoveSelected = () => {
    setWishlistItems(wishlistItems.filter((item) => !selectedItems.includes(item.id)))
    setSelectedItems([])
    toast({
      title: 'Items removed',
      description: `${selectedItems.length} items removed from your wishlist`,
    })
  }

  const handleAddToCart = (itemId: number) => {
    const item = wishlistItems.find((i) => i.id === itemId)
    if (item) {
      toast({
        title: 'Added to cart',
        description: `${item.name} has been added to your cart`,
      })
    }
  }

  const handleRemoveItem = (itemId: number) => {
    setWishlistItems(wishlistItems.filter((item) => item.id !== itemId))
    toast({
      title: 'Item removed',
      description: 'Item has been removed from your wishlist',
    })
  }

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
            <span className="text-neutral-800">Wishlist</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-neutral-800">My Wishlist</h1>
              <p className="text-neutral-600 mt-1">{filteredItems.length} items saved</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Share List
              </Button>
              {selectedItems.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Selected ({selectedItems.length})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove items from wishlist?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove {selectedItems.length} items from your
                        wishlist? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleRemoveSelected}>
                        Remove Items
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </div>

        {/* Filters and Sort */}
        <Card className="bg-white shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center gap-2 flex-1">
                <Checkbox
                  checked={
                    selectedItems.length === filteredItems.length && filteredItems.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-neutral-600">Select all</span>
              </div>

              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                  <SelectItem value="price-dropped">Price Dropped</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48">
                  <SortAsc className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-added">Date Added</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Wishlist Items */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <Card key={item.id} className="bg-white shadow-sm overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="flex items-start">
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                        className="mt-1"
                      />
                    </div>

                    <Link href={`/product/${item.productId}`} className="flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={96}
                        height={96}
                        className="w-24 h-24 object-cover rounded-lg hover:opacity-90 transition-opacity"
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <Link href={`/product/${item.productId}`}>
                            <h3 className="font-semibold text-neutral-800 hover:text-brand-primary transition-colors">
                              {item.name}
                            </h3>
                          </Link>
                          <p className="text-sm text-neutral-600">Sold by {item.seller}</p>

                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-lg font-bold text-brand-primary">
                              {item.price}
                            </span>
                            {item.originalPrice && (
                              <>
                                <span className="text-sm text-neutral-500 line-through">
                                  {item.originalPrice}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="text-green-600 border-green-200"
                                >
                                  {item.discount}% off
                                </Badge>
                              </>
                            )}
                          </div>

                          {item.priceDropped && (
                            <div className="flex items-center gap-1 mt-1">
                              <TrendingDown className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-green-600 font-medium">
                                Price dropped!
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 mt-3">
                            {item.inStock ? (
                              <Button
                                size="sm"
                                onClick={() => handleAddToCart(item.id)}
                                className="bg-brand-primary hover:bg-blue-700"
                              >
                                <ShoppingCart className="w-4 h-4 mr-1" />
                                Add to Cart
                              </Button>
                            ) : (
                              <>
                                <Badge variant="outline" className="text-red-600 border-red-200">
                                  Out of Stock
                                </Badge>
                                <Button size="sm" variant="outline">
                                  <Bell className="w-4 h-4 mr-1" />
                                  Notify Me
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white shadow-sm">
            <CardContent className="p-12 text-center">
              <Heart className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                Your wishlist is empty
              </h3>
              <p className="text-neutral-600 mb-4">
                Save items you&apos;re interested in to view them later
              </p>
              <Link href="/browse">
                <Button>Start Browsing</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
