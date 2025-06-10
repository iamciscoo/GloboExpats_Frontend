"use client"

import { useState } from "react"
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  MessageCircle,
  Star,
  TrendingUp,
  Package,
  DollarSign,
  BarChart3,
  Search,
  MoreHorizontal,
  Copy,
  Share2,
  Archive,
  RefreshCw,
  Calendar,
  MapPin,
  Shield,
  Crown,
  Settings,
  Download,
  Upload,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import SellerLayout from "@/components/seller-layout"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

const myProducts = [
  {
    id: 1,
    title: "iPhone 15 Pro Max 256GB - Natural Titanium",
    price: "$1,199",
    originalPrice: "$1,299",
    status: "Active",
    views: 234,
    inquiries: 12,
    favorites: 18,
    image: "/images/iphone-15-pro.jpg",
    category: "Electronics",
    condition: "Like New",
    datePosted: "2024-01-15",
    expiresOn: "2024-02-14",
    premium: true,
    featured: true,
  },
  {
    id: 2,
    title: 'MacBook Air M2 13" - Space Gray',
    price: "$999",
    originalPrice: "$1,199",
    status: "Sold",
    views: 156,
    inquiries: 8,
    favorites: 12,
    image: "/images/macbook-pro.jpg",
    category: "Electronics",
    condition: "Excellent",
    datePosted: "2024-01-10",
    soldOn: "2024-01-20",
    premium: false,
    featured: false,
  },
  {
    id: 3,
    title: 'iPad Pro 12.9" 2024 - Silver',
    price: "$899",
    originalPrice: "$1,099",
    status: "Active",
    views: 89,
    inquiries: 5,
    favorites: 7,
    image: "/images/iphone-15-pro.jpg",
    category: "Electronics",
    condition: "Like New",
    datePosted: "2024-01-12",
    expiresOn: "2024-02-11",
    premium: true,
    featured: false,
  },
  {
    id: 4,
    title: "BMW X5 2022 - Expat Owned",
    price: "$45,000",
    originalPrice: "$52,000",
    status: "Active",
    views: 312,
    inquiries: 23,
    favorites: 45,
    image: "/images/bmw-x5.jpg",
    category: "Automotive",
    condition: "Excellent",
    datePosted: "2024-01-08",
    expiresOn: "2024-02-07",
    premium: true,
    featured: true,
  },
  {
    id: 5,
    title: "Designer Italian Sofa Set",
    price: "$1,200",
    originalPrice: "$1,800",
    status: "Pending",
    views: 67,
    inquiries: 4,
    favorites: 9,
    image: "/images/italian-sofa.jpg",
    category: "Furniture",
    condition: "Very Good",
    datePosted: "2024-01-14",
    expiresOn: "2024-02-13",
    premium: false,
    featured: false,
  },
  {
    id: 6,
    title: "PlayStation 5 + Games Bundle",
    price: "$650",
    originalPrice: "$750",
    status: "Draft",
    views: 0,
    inquiries: 0,
    favorites: 0,
    image: "/images/playstation-5.jpg",
    category: "Gaming",
    condition: "Like New",
    datePosted: "2024-01-16",
    premium: false,
    featured: false,
  },
]

const recentMessages = [
  {
    id: 1,
    buyer: "Sarah Mitchell",
    avatar: "/images/seller-avatar-1.jpg",
    product: "iPhone 15 Pro Max",
    message: "Is this still available? Can we meet tomorrow?",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: 2,
    buyer: "Ahmed Hassan",
    avatar: "/images/seller-avatar-2.jpg",
    product: "MacBook Air M2",
    message: "Thanks for the quick delivery!",
    time: "1 day ago",
    unread: false,
  },
  {
    id: 3,
    buyer: "Lisa Wang",
    avatar: "/images/seller-avatar-3.jpg",
    product: "iPad Pro",
    message: "What's the battery health?",
    time: "2 days ago",
    unread: true,
  },
]

const recentOrders = [
  {
    id: "ORD-001",
    buyer: "John D.",
    product: "MacBook Air M2",
    amount: "$999",
    status: "Completed",
    date: "2024-01-15",
  },
  {
    id: "ORD-002",
    buyer: "Maria S.",
    product: "iPhone 14 Pro",
    amount: "$799",
    status: "In Progress",
    date: "2024-01-14",
  },
  {
    id: "ORD-003",
    buyer: "David L.",
    product: "iPad Air",
    amount: "$549",
    status: "Pending",
    date: "2024-01-13",
  },
]

const chartData = [
  { name: 'Jan', earnings: 1200, views: 2400 },
  { name: 'Feb', earnings: 2100, views: 1398 },
  { name: 'Mar', earnings: 980, views: 5800 },
  { name: 'Apr', earnings: 1500, views: 3908 },
  { name: 'May', earnings: 1890, views: 4800 },
  { name: 'Jun', earnings: 2390, views: 3800 },
];

export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])

  const filteredProducts = myProducts.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || product.status.toLowerCase() === statusFilter
    const matchesCategory = categoryFilter === "all" || product.category.toLowerCase() === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  const toggleProductSelection = (productId: number) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    )
  }

  const selectAllProducts = () => {
    setSelectedProducts(filteredProducts.map((p) => p.id))
  }

  const clearSelection = () => {
    setSelectedProducts([])
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800"
      case "sold":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "expired":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const StatCard = ({ title, value, change, icon, changeType, period }) => (
    <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-neutral-600">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-neutral-800">{value}</div>
        <p className="text-xs text-neutral-500 mt-1">
          <span className={`font-semibold ${changeType === "increase" ? "text-green-600" : "text-red-600"}`}>
            {change}
          </span>
          {period}
        </p>
            </CardContent>
          </Card>
  )

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Earnings (30d)"
          value="$3,590"
          change="+12.5%"
          changeType="increase"
          period="vs last month"
          icon={<DollarSign className="h-4 w-4 text-neutral-500" />}
        />
        <StatCard
          title="Active Listings"
          value="12"
          change="-2"
          changeType="decrease"
          period="vs last month"
          icon={<Package className="h-4 w-4 text-neutral-500" />}
        />
        <StatCard
          title="Total Views (30d)"
          value="12,890"
          change="+8.2%"
          changeType="increase"
          period="vs last month"
          icon={<TrendingUp className="h-4 w-4 text-neutral-500" />}
        />
        <StatCard
          title="New Messages (30d)"
          value="42"
          change="+25%"
          changeType="increase"
          period="vs last month"
          icon={<MessageCircle className="h-4 w-4 text-neutral-500" />}
        />
                </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Earnings Chart */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Earnings & Views Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
             <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip
                   contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    border: '1px solid #ccc',
                    borderRadius: '0.5rem',
                  }}
                />
                <Area type="monotone" dataKey="earnings" stroke="#10b981" fillOpacity={1} fill="url(#colorEarnings)" />
                <Area type="monotone" dataKey="views" stroke="#3b82f6" fillOpacity={1} fill="url(#colorViews)" />
              </AreaChart>
            </ResponsiveContainer>
            </CardContent>
          </Card>

        {/* Recent Messages */}
        <Card className="shadow-sm">
                <CardHeader>
            <CardTitle>Recent Messages</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
            {recentMessages.map((msg) => (
              <div key={msg.id} className="flex gap-3">
                <Avatar>
                  <AvatarImage src={msg.avatar} alt={msg.buyer} />
                  <AvatarFallback>{msg.buyer.charAt(0)}</AvatarFallback>
                </Avatar>
                    <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-sm">{msg.buyer}</p>
                      <p className="text-xs text-neutral-500">{msg.product}</p>
                    </div>
                    {msg.unread && <Badge className="bg-blue-500 h-2 w-2 p-0" />}
                  </div>
                  <p className="text-sm text-neutral-600 mt-1 line-clamp-2">{msg.message}</p>
                        </div>
                      </div>
                    ))}
             <Button variant="outline" className="w-full mt-4">View All Messages</Button>
                </CardContent>
              </Card>
            </div>
    </div>
  )

  const renderMyListings = () => (
    <Card className="shadow-sm">
              <CardHeader>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
            <CardTitle>My Listings</CardTitle>
            <p className="text-sm text-neutral-500 mt-1">Manage your active and past listings.</p>
                  </div>
          <div className="flex items-center gap-2">
                    <Input
              placeholder="Search listings..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
                    />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                    </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                <TableHead padding="checkbox">
                  <Checkbox
                    checked={
                      selectedProducts.length > 0 && selectedProducts.length === filteredProducts.length
                    }
                    onCheckedChange={(checked) => (checked ? selectAllProducts() : clearSelection())}
                          />
                        </TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Price</TableHead>
                <TableHead className="hidden lg:table-cell">Views</TableHead>
                <TableHead className="hidden lg:table-cell">Date Posted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell padding="checkbox">
                    <Checkbox
                              checked={selectedProducts.includes(product.id)}
                      onCheckedChange={() => toggleProductSelection(product.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                                <img
                        src={product.image}
                                  alt={product.title}
                        className="w-16 h-16 rounded-md object-cover hidden sm:block"
                      />
                      <div className="font-medium text-neutral-800">{product.title}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                    <Badge variant="outline" className={getStatusColor(product.status)}>
                              {product.status}
                            </Badge>
                          </TableCell>
                  <TableCell className="hidden md:table-cell">{product.price}</TableCell>
                  <TableCell className="hidden lg:table-cell">{product.views}</TableCell>
                  <TableCell className="hidden lg:table-cell">{product.datePosted}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" /> View Listing
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                          <Share2 className="mr-2 h-4 w-4" /> Share
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
  )

   const renderOrders = () => (
    <Card className="shadow-sm">
              <CardHeader>
        <CardTitle>My Orders</CardTitle>
         <p className="text-sm text-neutral-500 mt-1">Track your sales and order status.</p>
              </CardHeader>
              <CardContent>
         <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.buyer}</TableCell>
                        <TableCell>{order.product}</TableCell>
                  <TableCell>{order.amount}</TableCell>
                        <TableCell>
                    <Badge variant="outline" className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{order.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
        </div>
              </CardContent>
            </Card>
  )

  return (
    <SellerLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-800">Seller Dashboard</h1>
            <p className="text-neutral-600 mt-1">Welcome back, TechExpat Dubai!</p>
          </div>
                          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
            <Link href="/sell">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add New Product
              </Button>
            </Link>
                          </div>
                        </div>

        {/* Mobile Tab Navigation */}
        <div className="md:hidden">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="listings">My Listings</SelectItem>
              <SelectItem value="orders">Orders</SelectItem>
              <SelectItem value="messages">Messages</SelectItem>
              <SelectItem value="settings">Settings</SelectItem>
            </SelectContent>
          </Select>
                      </div>
        
        {/* Desktop Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="hidden md:block">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </Tabs>

        <div>
          {activeTab === "overview" && renderOverview()}
          {activeTab === "listings" && renderMyListings()}
          {activeTab === "orders" && renderOrders()}
          {/* Add other tab content here */}
        </div>
      </div>
    </SellerLayout>
  )
}
