"use client"

import { useState } from "react"
import { Bell, CheckCircle2, Clock, Archive, AlertCircle, MessageCircle, Package, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import Breadcrumb from "@/components/breadcrumb"

// Sample notifications data
const notifications = [
  {
    id: 1,
    type: "admin_message",
    title: "Action Required: Update Your Listing",
    message:
      "Your listing 'iPhone 15 Pro Max' has been active for 14 days. Please update the status or it may be archived.",
    timestamp: "2024-05-23T10:30:00Z",
    isRead: false,
    sender: {
      name: "Admin",
      avatar: "/images/seller-avatar-1.jpg",
    },
    itemId: 1,
    itemTitle: "iPhone 15 Pro Max 256GB - Natural Titanium",
    itemImage: "/images/iphone-15-pro.jpg",
  },
  {
    id: 2,
    type: "buyer_message",
    title: "New Message from Sarah",
    message: "Hi, is the MacBook still available? I'm interested in buying it.",
    timestamp: "2024-05-22T15:45:00Z",
    isRead: true,
    sender: {
      name: "Sarah Mitchell",
      avatar: "/images/seller-avatar-2.jpg",
    },
    itemId: 2,
    itemTitle: 'MacBook Air M2 13" - Space Gray',
    itemImage: "/images/macbook-pro.jpg",
  },
  {
    id: 3,
    type: "item_update",
    title: "Item Sold",
    message: "Congratulations! Your item 'Herman Miller Aeron Chair' has been marked as sold.",
    timestamp: "2024-05-21T09:15:00Z",
    isRead: true,
    itemId: 3,
    itemTitle: "Herman Miller Aeron Chair - Size B",
    itemImage: "/images/herman-miller-chair.jpg",
  },
  {
    id: 4,
    type: "admin_message",
    title: "Final Notice: Update Your Listing",
    message:
      "This is the final notice for your listing 'BMW X5 2022'. Please update the status within 3 days or it will be archived.",
    timestamp: "2024-05-20T14:20:00Z",
    isRead: false,
    sender: {
      name: "Admin",
      avatar: "/images/seller-avatar-1.jpg",
    },
    itemId: 4,
    itemTitle: "BMW X5 2022 - Expat Owned",
    itemImage: "/images/bmw-x5.jpg",
  },
  {
    id: 5,
    type: "buyer_message",
    title: "New Message from Ahmed",
    message: "Hello, I'd like to know more about the condition of the iPad Pro. Does it have any scratches?",
    timestamp: "2024-05-19T11:10:00Z",
    isRead: true,
    sender: {
      name: "Ahmed Hassan",
      avatar: "/images/seller-avatar-3.jpg",
    },
    itemId: 5,
    itemTitle: 'iPad Pro 12.9" 2024 - Silver',
    itemImage: "/images/iphone-15-pro.jpg",
  },
  {
    id: 6,
    type: "system",
    title: "Account Verified",
    message: "Your account has been verified as an expert buyer. You can now contact sellers directly.",
    timestamp: "2024-05-18T08:30:00Z",
    isRead: true,
  },
  {
    id: 7,
    type: "item_update",
    title: "Item Archived",
    message: "Your listing 'Canon EOS R5' has been archived due to inactivity. You can restore it from your dashboard.",
    timestamp: "2024-05-17T16:45:00Z",
    isRead: false,
    itemId: 6,
    itemTitle: "Canon EOS R5 + 24-70mm Lens Kit",
    itemImage: "/images/canon-camera.jpg",
  },
]

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = diffInMs / (1000 * 60 * 60)
    const diffInDays = diffInHours / 24

    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "admin_message":
        return <AlertCircle className="h-5 w-5 text-amber-500" />
      case "buyer_message":
        return <MessageCircle className="h-5 w-5 text-blue-500" />
      case "item_update":
        return <Package className="h-5 w-5 text-green-500" />
      case "system":
        return <Bell className="h-5 w-5 text-purple-500" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return !notification.isRead
    if (activeTab === "admin") return notification.type === "admin_message"
    if (activeTab === "messages") return notification.type === "buyer_message"
    if (activeTab === "updates") return notification.type === "item_update" || notification.type === "system"
    return true
  })

  const toggleNotificationSelection = (notificationId: number) => {
    setSelectedNotifications((prev) =>
      prev.includes(notificationId) ? prev.filter((id) => id !== notificationId) : [...prev, notificationId],
    )
  }

  const selectAllNotifications = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([])
    } else {
      setSelectedNotifications(filteredNotifications.map((n) => n.id))
    }
  }

  const markSelectedAsRead = () => {
    // In a real app, this would update the read status in the backend
    console.log(`Marking notifications as read: ${selectedNotifications.join(", ")}`)
    setSelectedNotifications([])
  }

  const deleteSelected = () => {
    // In a real app, this would delete the notifications in the backend
    console.log(`Deleting notifications: ${selectedNotifications.join(", ")}`)
    setSelectedNotifications([])
  }

  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="bg-brand-primary">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white font-display">Notifications</h1>
              <p className="text-neutral-200 mt-1">Stay updated with messages, listing updates, and important alerts.</p>
            </div>
            <div className="flex gap-2 self-end sm:self-center">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white hover:text-brand-primary">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button className="bg-brand-secondary hover:bg-amber-500 text-brand-primary font-semibold">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark All as Read
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters */}
          <aside className="lg:col-span-1">
            <Card className="shadow-sm sticky top-24">
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs
                  orientation="vertical"
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-1 h-auto">
                    <TabsTrigger value="all" className="justify-start py-2">All Notifications</TabsTrigger>
                    <TabsTrigger value="unread" className="justify-start py-2">Unread</TabsTrigger>
                    <TabsTrigger value="messages" className="justify-start py-2">Messages</TabsTrigger>
                    <TabsTrigger value="admin" className="justify-start py-2">Admin Alerts</TabsTrigger>
                    <TabsTrigger value="updates" className="justify-start py-2">Item Updates</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>
          </aside>

          {/* Notifications List */}
          <div className="lg:col-span-3">
            {/* Bulk Actions */}
            {selectedNotifications.length > 0 && (
              <div className="flex items-center gap-4 p-3 bg-neutral-100 border rounded-lg mb-6">
                <span className="text-sm font-medium">
                  {selectedNotifications.length} notification{selectedNotifications.length > 1 ? "s" : ""} selected
                </span>
                <div className="flex gap-2">
                  <Button size="sm" onClick={markSelectedAsRead}>
                    Mark as Read
                  </Button>
                  <Button size="sm" variant="outline">
                    Archive
                  </Button>
                  <Button size="sm" variant="destructive" onClick={deleteSelected}>
                    Delete
                  </Button>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setSelectedNotifications([])} className="ml-auto">
                  Clear
                </Button>
              </div>
            )}

            <div className="space-y-4">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`transition-all duration-300 shadow-sm hover:shadow-md ${
                      !notification.isRead ? "bg-blue-50/50 border-blue-200" : "bg-white"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 pt-1">
                          <Checkbox
                            checked={selectedNotifications.includes(notification.id)}
                            onCheckedChange={() => toggleNotificationSelection(notification.id)}
                          />
                        </div>
                        <div className="flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-neutral-800">{notification.title}</h3>
                            <span className="text-xs text-neutral-500">{formatDate(notification.timestamp)}</span>
                          </div>
                          <p className="text-sm text-neutral-600 mt-1">{notification.message}</p>
                          {notification.itemTitle && (
                             <div className="mt-3 flex items-center gap-3 bg-neutral-100/70 p-2 rounded-md">
                              <img
                                src={notification.itemImage}
                                alt={notification.itemTitle}
                                className="w-10 h-10 rounded-md object-cover"
                              />
                              <div className="text-sm">
                                <span className="text-neutral-500">Related Item:</span>{" "}
                                <span className="font-medium text-neutral-700">{notification.itemTitle}</span>
                              </div>
                            </div>
                          )}
                        </div>
                         {!notification.isRead && (
                          <div className="flex-shrink-0 pt-1">
                            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" title="Unread"></div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-16">
                  <Bell className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-neutral-800">No Notifications</h3>
                  <p className="text-neutral-600">You're all caught up!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
