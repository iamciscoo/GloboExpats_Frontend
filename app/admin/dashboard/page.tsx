'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Archive,
  Bell,
  Clock,
  Filter,
  MoreHorizontal,
  Package,
  Search,
  Settings,
  Shield,
  Users,
  AlertTriangle,
  CheckCircle2,
  X,
  Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { RouteGuard } from '@/components/route-guard'

// Sample data for overdue items
const overdueItems = [
  {
    id: 1,
    title: 'iPhone 15 Pro Max 256GB - Natural Titanium',
    category: 'Electronics',
    seller: {
      name: 'John Smith',
      email: 'john.smith@undp.com',
      avatar: '/images/seller-avatar-1.jpg',
    },
    listingDate: '2024-05-10',
    daysListed: 14,
    notificationsSent: 1,
    price: '$1,199',
    status: 'Active',
  },
  {
    id: 2,
    title: 'BMW X5 2022 - Expat Owned',
    category: 'Automotive',
    seller: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@un.org',
      avatar: '/images/seller-avatar-2.jpg',
    },
    listingDate: '2024-05-08',
    daysListed: 16,
    notificationsSent: 2,
    price: '$45,000',
    status: 'Active',
  },
  {
    id: 3,
    title: 'Designer Italian Sofa Set',
    category: 'Furniture',
    seller: {
      name: 'Michael Wong',
      email: 'michael.wong@who.int',
      avatar: '/images/seller-avatar-3.jpg',
    },
    listingDate: '2024-05-05',
    daysListed: 19,
    notificationsSent: 2,
    price: '$1,200',
    status: 'Active',
  },
  {
    id: 4,
    title: 'MacBook Pro 16" M3 Max - Perfect for Professionals',
    category: 'Electronics',
    seller: {
      name: 'Emma Davis',
      email: 'emma.davis@embassy.gov',
      avatar: '/images/seller-avatar-1.jpg',
    },
    listingDate: '2024-05-01',
    daysListed: 23,
    notificationsSent: 3,
    price: '$2,899',
    status: 'Active',
  },
]

// Sample data for recently archived items
const archivedItems = [
  {
    id: 5,
    title: 'Herman Miller Aeron Chair - Size B',
    category: 'Furniture',
    seller: {
      name: 'David Lee',
      email: 'david.lee@unicef.org',
      avatar: '/images/seller-avatar-2.jpg',
    },
    listingDate: '2024-04-15',
    archivedDate: '2024-05-10',
    notificationsSent: 3,
    price: '$450',
    status: 'Archived',
  },
  {
    id: 6,
    title: 'Canon EOS R5 + 24-70mm Lens Kit',
    category: 'Electronics',
    seller: {
      name: 'Lisa Wang',
      email: 'lisa.wang@un.org',
      avatar: '/images/seller-avatar-3.jpg',
    },
    listingDate: '2024-04-18',
    archivedDate: '2024-05-12',
    notificationsSent: 3,
    price: '$2,200',
    status: 'Archived',
  },
]

// Sample data for allowed domains
const allowedDomains = [
  { id: 1, domain: 'undp.com' },
  { id: 2, domain: 'un.org' },
  { id: 3, domain: 'embassy.gov' },
  { id: 4, domain: 'who.int' },
  { id: 5, domain: 'unicef.org' },
]

export default function AdminDashboardPage() {
  return (
    <RouteGuard requireAuth requireAdmin loadingMessage="Verifying admin access...">
      <AdminDashboardContent />
    </RouteGuard>
  )
}

function AdminDashboardContent() {
  const [activeTab, setActiveTab] = useState('overdue')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedItem, setSelectedItem] = useState<(typeof overdueItems)[0] | null>(null)
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)
  const [newDomain, setNewDomain] = useState('')
  const [localAllowedDomains, setLocalAllowedDomains] = useState(allowedDomains)

  const filteredOverdueItems = overdueItems.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === 'all' || item.category.toLowerCase() === selectedCategory.toLowerCase()
    return matchesSearch && matchesCategory
  })

  const handleSendNotification = () => {
    if (!selectedItem) return
    // In a real app, this would send the notification to the backend
    console.log(`Sending notification to item ${selectedItem.id}: ${notificationMessage}`)
    setIsNotificationDialogOpen(false)

    // Update the notification count in the UI
    // In a real implementation, this would update the state
    // const updatedItems = overdueItems.map((item) => {
    //   if (item.id === selectedItem.id) {
    //     return {
    //       ...item,
    //       notificationsSent: item.notificationsSent + 1,
    //     }
    //   }
    //   return item
    // })

    // Reset form
    setNotificationMessage('')
    setSelectedItem(null)
  }

  const handleArchiveItem = () => {
    if (!selectedItem) return
    // In a real app, this would send the archive request to the backend
    console.log(`Archiving item ${selectedItem.id}`)
    setIsArchiveDialogOpen(false)
    setSelectedItem(null)
  }

  const handleAddDomain = () => {
    if (newDomain && !localAllowedDomains.some((d) => d.domain === newDomain)) {
      setLocalAllowedDomains([
        ...localAllowedDomains,
        { id: localAllowedDomains.length + 1, domain: newDomain },
      ])
      setNewDomain('')
    }
  }

  const handleRemoveDomain = (domainId: number) => {
    setLocalAllowedDomains(localAllowedDomains.filter((d) => d.id !== domainId))
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-cyan-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-white/80 mt-2">
                Manage listings, monitor overdue items, and maintain the marketplace
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white hover:text-blue-900"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
                <Shield className="w-4 h-4 mr-2" />
                Admin Actions
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Overdue Items</p>
                  <p className="text-3xl font-bold text-amber-600">{overdueItems.length}</p>
                  <p className="text-sm text-slate-600">Require attention</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Archived Items</p>
                  <p className="text-3xl font-bold text-blue-600">{archivedItems.length}</p>
                  <p className="text-sm text-slate-600">Last 30 days</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Archive className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Listings</p>
                  <p className="text-3xl font-bold text-green-600">124</p>
                  <p className="text-sm text-slate-600">Currently live</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Verified Users</p>
                  <p className="text-3xl font-bold text-cyan-600">87</p>
                  <p className="text-sm text-slate-600">From allowed domains</p>
                </div>
                <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-cyan-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overdue">Overdue Items</TabsTrigger>
            <TabsTrigger value="archived">Archived Items</TabsTrigger>
            <TabsTrigger value="domains">Allowed Domains</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overdue" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Overdue Items (Listed for 14+ days)
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters and Search */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="automotive">Automotive</SelectItem>
                      <SelectItem value="furniture">Furniture</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    More Filters
                  </Button>
                </div>

                {/* Items Table */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Seller</TableHead>
                        <TableHead>Listed</TableHead>
                        <TableHead>Notifications</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOverdueItems.map((item) => (
                        <TableRow key={item.id} className="hover:bg-slate-50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Image
                                src="/images/iphone-15-pro.jpg"
                                alt={item.title}
                                width={48}
                                height={48}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                              <div>
                                <p className="font-medium text-slate-900 line-clamp-1">
                                  {item.title}
                                </p>
                                <Badge variant="outline" className="text-xs mt-1">
                                  {item.category}
                                </Badge>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={item.seller.avatar || '/placeholder.svg'} />
                                <AvatarFallback>
                                  {item.seller.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{item.seller.name}</p>
                                <p className="text-xs text-slate-500">{item.seller.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm">{item.listingDate}</span>
                              <span className="text-xs text-amber-600 font-medium">
                                {item.daysListed} days ago
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                item.notificationsSent === 0
                                  ? 'bg-slate-100 text-slate-800'
                                  : item.notificationsSent === 1
                                    ? 'bg-blue-100 text-blue-800'
                                    : item.notificationsSent === 2
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-red-100 text-red-800'
                              }
                            >
                              {item.notificationsSent} of 3 sent
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-amber-600">{item.price}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Dialog
                                open={isNotificationDialogOpen && selectedItem?.id === item.id}
                                onOpenChange={(open) => {
                                  setIsNotificationDialogOpen(open)
                                  if (!open) setSelectedItem(null)
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedItem(item)}
                                    disabled={item.notificationsSent >= 3}
                                  >
                                    <Bell className="w-4 h-4 mr-1" />
                                    Notify
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Send Notification to Seller</DialogTitle>
                                    <DialogDescription>
                                      This will send a notification to {item.seller.name} about
                                      their listing &quot;{item.title}&quot;.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <p className="text-sm font-medium">
                                        Notification #{item.notificationsSent + 1} of 3
                                      </p>
                                      <Textarea
                                        placeholder="Enter your message to the seller..."
                                        value={notificationMessage}
                                        onChange={(e) => setNotificationMessage(e.target.value)}
                                        className="min-h-32"
                                        defaultValue={`Dear ${item.seller.name},\n\nYour listing "${item.title}" has been active for ${item.daysListed} days. Please update the status of this item or it may be archived.\n\nThank you,\nGloboexpat Admin Team`}
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button
                                      variant="outline"
                                      onClick={() => setIsNotificationDialogOpen(false)}
                                    >
                                      Cancel
                                    </Button>
                                    <Button onClick={handleSendNotification}>
                                      Send Notification
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>

                              <Dialog
                                open={isArchiveDialogOpen && selectedItem?.id === item.id}
                                onOpenChange={(open) => {
                                  setIsArchiveDialogOpen(open)
                                  if (!open) setSelectedItem(null)
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedItem(item)}
                                    disabled={item.notificationsSent < 3}
                                  >
                                    <Archive className="w-4 h-4 mr-1" />
                                    Archive
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Archive Item</DialogTitle>
                                    <DialogDescription>
                                      This will archive the listing &quot;{item.title}&quot; as the
                                      seller has not responded to 3 notifications.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="py-4">
                                    <p className="text-sm text-slate-700">
                                      The item will be removed from active listings and the seller
                                      will be notified. This action cannot be undone.
                                    </p>
                                  </div>
                                  <DialogFooter>
                                    <Button
                                      variant="outline"
                                      onClick={() => setIsArchiveDialogOpen(false)}
                                    >
                                      Cancel
                                    </Button>
                                    <Button variant="destructive" onClick={handleArchiveItem}>
                                      Archive Item
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                  <DropdownMenuItem>Contact Seller</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    Remove Listing
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {filteredOverdueItems.length === 0 && (
                  <div className="text-center py-12">
                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      No overdue items found
                    </h3>
                    <p className="text-slate-600">
                      {searchQuery || selectedCategory !== 'all'
                        ? 'Try adjusting your filters or search terms.'
                        : 'All items are up to date. No action required.'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="archived" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Archive className="h-5 w-5" />
                  Recently Archived Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Listed Date</TableHead>
                      <TableHead>Archived Date</TableHead>
                      <TableHead>Notifications</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {archivedItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Image
                              src="/images/herman-miller-chair.jpg"
                              alt={item.title}
                              width={48}
                              height={48}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                            <div>
                              <p className="font-medium text-slate-900 line-clamp-1">
                                {item.title}
                              </p>
                              <Badge variant="outline" className="text-xs mt-1">
                                {item.category}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={item.seller.avatar || '/placeholder.svg'} />
                              <AvatarFallback>
                                {item.seller.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{item.seller.name}</p>
                              <p className="text-xs text-slate-500">{item.seller.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{item.listingDate}</TableCell>
                        <TableCell>{item.archivedDate}</TableCell>
                        <TableCell>
                          <Badge className="bg-red-100 text-red-800">
                            {item.notificationsSent} sent
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-amber-600">{item.price}</span>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            Restore
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="domains" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Allowed Email Domains
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Input
                        placeholder="Add new domain (e.g., organization.org)"
                        value={newDomain}
                        onChange={(e) => setNewDomain(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleAddDomain}>Add Domain</Button>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Domain</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {localAllowedDomains.map((domain) => (
                          <TableRow key={domain.id}>
                            <TableCell>
                              <div className="font-medium">@{domain.domain}</div>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-green-100 text-green-800">Active</Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600"
                                onClick={() => handleRemoveDomain(domain.id)}
                              >
                                <X className="w-4 h-4 mr-1" />
                                Remove
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
                    <p className="text-sm">
                      <strong>Note:</strong> Only users with email addresses from these domains will
                      be verified as buyers and able to contact sellers.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Listings by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>Electronics</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">42</span>
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: '42%' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                        <span>Automotive</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">28</span>
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: '28%' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Furniture</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">35</span>
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: '35%' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span>Other</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">19</span>
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: '19%' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Total Users</span>
                      <span className="font-semibold">124</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Verified Buyers</span>
                      <span className="font-semibold">87</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Active Sellers</span>
                      <span className="font-semibold">56</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>New Users (Last 30 Days)</span>
                      <span className="font-semibold">23</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-slate-500">
                  <Calendar className="w-16 h-16 mb-4" />
                  <p>Monthly activity chart would be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
