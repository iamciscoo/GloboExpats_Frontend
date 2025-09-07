'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Bell,
  CheckCircle2,
  Clock,
  Archive,
  AlertCircle,
  MessageCircle,
  Package,
  Settings,
  ChevronRight,
  Trash2,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'
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
import { RouteGuard } from '@/components/route-guard'
import { useNotifications } from '@/hooks/use-notifications'
import { useVerification } from '@/hooks/use-verification'
import { VerificationPopup } from '@/components/verification-popup'

// Sample notifications data
const notifications = [
  {
    id: 1,
    type: 'admin_message',
    title: 'Action Required: Update Your Listing',
    message:
      "Your listing 'iPhone 15 Pro Max' has been active for 14 days. Please update the status or it may be archived.",
    timestamp: '2024-05-23T10:30:00Z',
    isRead: false,
    sender: {
      name: 'Admin',
      avatar: '/images/seller-avatar-1.jpg',
    },
    itemId: 1,
    itemTitle: 'iPhone 15 Pro Max 256GB - Natural Titanium',
    itemImage: '/images/iphone-15-pro.jpg',
    actionUrl: '/expat/dashboard',
  },
  {
    id: 2,
    type: 'buyer_message',
    title: 'New Message from Sarah',
    message: "Hi, is the MacBook still available? I'm interested in buying it.",
    timestamp: '2024-05-22T15:45:00Z',
    isRead: true,
    sender: {
      name: 'Sarah Mitchell',
      avatar: '/images/seller-avatar-2.jpg',
    },
    itemId: 2,
    itemTitle: 'MacBook Air M2 13" - Space Gray',
    itemImage: '/images/macbook-pro.jpg',
    actionUrl: '/messages?seller=Sarah Mitchell&product=MacBook Air M2',
  },
  {
    id: 3,
    type: 'item_update',
    title: 'Item Sold',
    message: "Congratulations! Your item 'Herman Miller Aeron Chair' has been marked as sold.",
    timestamp: '2024-05-21T09:15:00Z',
    isRead: true,
    itemId: 3,
    itemTitle: 'Herman Miller Aeron Chair - Size B',
    itemImage: '/images/herman-miller-chair.jpg',
    actionUrl: '/expat/dashboard',
  },
  {
    id: 4,
    type: 'admin_message',
    title: 'Final Notice: Update Your Listing',
    message:
      "This is the final notice for your listing 'BMW X5 2022'. Please update the status within 3 days or it will be archived.",
    timestamp: '2024-05-20T14:20:00Z',
    isRead: false,
    sender: {
      name: 'Admin',
      avatar: '/images/seller-avatar-1.jpg',
    },
    itemId: 4,
    itemTitle: 'BMW X5 2022 - Expat Owned',
    itemImage: '/images/bmw-x5.jpg',
    actionUrl: '/expat/dashboard',
  },
  {
    id: 5,
    type: 'buyer_message',
    title: 'New Message from Ahmed',
    message:
      "Hello, I'd like to know more about the condition of the iPad Pro. Does it have any scratches?",
    timestamp: '2024-05-19T11:10:00Z',
    isRead: true,
    sender: {
      name: 'Ahmed Hassan',
      avatar: '/images/seller-avatar-3.jpg',
    },
    itemId: 5,
    itemTitle: 'iPad Pro 12.9" 2024 - Silver',
    itemImage: '/images/iphone-15-pro.jpg',
    actionUrl: '/messages?seller=Ahmed Hassan&product=iPad Pro 12.9"',
  },
  {
    id: 6,
    type: 'system',
    title: 'Account Verified',
    message:
      'Your account has been verified as an expert buyer. You can now contact sellers directly.',
    timestamp: '2024-05-18T08:30:00Z',
    isRead: true,
    actionUrl: '/account/verification',
  },
  {
    id: 7,
    type: 'item_update',
    title: 'Item Archived',
    message:
      "Your listing 'Canon EOS R5' has been archived due to inactivity. You can restore it from your dashboard.",
    timestamp: '2024-05-17T16:45:00Z',
    isRead: false,
    itemId: 6,
    itemTitle: 'Canon EOS R5 + 24-70mm Lens Kit',
    itemImage: '/images/canon-camera.jpg',
    actionUrl: '/expat/dashboard',
  },
]

export default function NotificationsPage() {
  return (
    <RouteGuard requireAuth loadingMessage="Loading notifications...">
      <NotificationsPageContent />
    </RouteGuard>
  )
}

function NotificationsPageContent() {
  const { toast } = useToast()
  const { notificationCounts, markNotificationAsRead, markAllNotificationsAsRead } =
    useNotifications()
  const { checkVerification, isVerificationPopupOpen, currentAction, closeVerificationPopup } =
    useVerification()
  const [activeTab, setActiveTab] = useState('all')
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)

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
      case 'admin_message':
        return <AlertCircle className="h-5 w-5 text-amber-500" />
      case 'buyer_message':
        return <MessageCircle className="h-5 w-5 text-blue-500" />
      case 'item_update':
        return <Package className="h-5 w-5 text-green-500" />
      case 'system':
        return <Bell className="h-5 w-5 text-purple-500" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === 'all') return true
    if (activeTab === 'unread') return !notification.isRead
    if (activeTab === 'admin') return notification.type === 'admin_message'
    if (activeTab === 'messages') return notification.type === 'buyer_message'
    if (activeTab === 'updates')
      return notification.type === 'item_update' || notification.type === 'system'
    return true
  })

  const toggleNotificationSelection = (notificationId: number) => {
    setSelectedNotifications((prev) =>
      prev.includes(notificationId)
        ? prev.filter((id) => id !== notificationId)
        : [...prev, notificationId]
    )
  }

  const selectAllNotifications = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([])
    } else {
      setSelectedNotifications(filteredNotifications.map((n) => n.id))
    }
  }

  const markSelectedAsRead = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: 'Marked as read',
        description: `${selectedNotifications.length} notifications marked as read.`,
      })
      setSelectedNotifications([])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark notifications as read. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteSelected = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: 'Notifications deleted',
        description: `${selectedNotifications.length} notifications deleted.`,
      })
      setSelectedNotifications([])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete notifications. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const markAllAsRead = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: 'All notifications marked as read',
        description: 'All your notifications have been marked as read.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Keyboard navigation handler
  const handleKeyDown = (event: React.KeyboardEvent, notificationId: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggleNotificationSelection(notificationId)
    }
  }

  /**
   * Handle notification action with verification check
   */
  const handleNotificationAction = (
    actionUrl: string,
    action: 'contact' | 'buy' | 'sell' = 'contact'
  ) => {
    if (checkVerification(action)) {
      window.location.href = actionUrl
    }
    // If verification fails, popup will be shown automatically
  }

  /**
   * Handle marking notification as read and navigate
   */
  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markNotificationAsRead(notification.id)
    }

    if (notification.actionUrl) {
      // Determine required verification based on notification type
      const action = notification.type === 'buyer_message' ? 'contact' : 'buy'
      handleNotificationAction(notification.actionUrl, action)
    }
  }

  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="bg-brand-primary">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white font-display">Notifications</h1>
              <p className="text-neutral-200 mt-1">
                Stay updated with messages, listing updates, and important alerts.
              </p>
            </div>
            <div className="flex gap-2 self-end sm:self-center">
              <Link href="/account/settings">
                <Button
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white hover:text-brand-primary"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Button
                className="bg-brand-secondary hover:bg-amber-500 text-brand-primary font-semibold"
                onClick={markAllAsRead}
                disabled={isLoading}
              >
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
                    <TabsTrigger value="all" className="justify-start py-2">
                      All Notifications
                    </TabsTrigger>
                    <TabsTrigger value="unread" className="justify-start py-2">
                      Unread
                    </TabsTrigger>
                    <TabsTrigger value="messages" className="justify-start py-2">
                      Messages
                    </TabsTrigger>
                    <TabsTrigger value="admin" className="justify-start py-2">
                      Admin Alerts
                    </TabsTrigger>
                    <TabsTrigger value="updates" className="justify-start py-2">
                      Item Updates
                    </TabsTrigger>
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
                  {selectedNotifications.length} notification
                  {selectedNotifications.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <Button size="sm" onClick={markSelectedAsRead} disabled={isLoading}>
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Mark as Read
                  </Button>
                  <Button size="sm" variant="outline" disabled={isLoading}>
                    <Archive className="w-4 h-4 mr-1" />
                    Archive
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive" disabled={isLoading}>
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete notifications?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {selectedNotifications.length}{' '}
                          notifications? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={deleteSelected}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedNotifications([])}
                  className="ml-auto"
                  disabled={isLoading}
                >
                  Clear
                </Button>
              </div>
            )}

            <div className="space-y-4">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer ${
                      !notification.isRead ? 'bg-blue-50/50 border-blue-200' : 'bg-white'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 pt-1">
                          <Checkbox
                            checked={selectedNotifications.includes(notification.id)}
                            onCheckedChange={() => toggleNotificationSelection(notification.id)}
                            onKeyDown={(e) => handleKeyDown(e, notification.id)}
                          />
                        </div>
                        <div className="flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-neutral-800">{notification.title}</h3>
                            <span className="text-xs text-neutral-500">
                              {formatDate(notification.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-600 mt-1">{notification.message}</p>

                          {/* Action Buttons */}
                          <div className="flex gap-2 mt-3">
                            {notification.actionUrl && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleNotificationClick(notification)}
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                View
                              </Button>
                            )}
                            {notification.type === 'buyer_message' && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleNotificationAction(
                                    notification.actionUrl || '/messages',
                                    'contact'
                                  )
                                }
                              >
                                <MessageCircle className="w-3 h-3 mr-1" />
                                Reply
                              </Button>
                            )}
                          </div>

                          {notification.itemTitle && (
                            <div className="mt-3 flex items-center gap-3 bg-neutral-100/70 p-2 rounded-md">
                              <img
                                src={notification.itemImage}
                                alt={notification.itemTitle}
                                className="w-10 h-10 rounded-md object-cover"
                              />
                              <div className="text-sm">
                                <span className="text-neutral-500">Related Item:</span>{' '}
                                <Link
                                  href={`/product/${notification.itemId}`}
                                  className="font-medium text-neutral-700 hover:text-brand-primary"
                                >
                                  {notification.itemTitle}
                                </Link>
                              </div>
                            </div>
                          )}
                        </div>
                        {!notification.isRead && (
                          <div className="flex-shrink-0 pt-1">
                            <div
                              className="w-2.5 h-2.5 bg-blue-500 rounded-full"
                              title="Unread"
                            ></div>
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

      {/* Verification Popup */}
      {isVerificationPopupOpen && (
        <VerificationPopup
          isOpen={isVerificationPopupOpen}
          onClose={closeVerificationPopup}
          action={currentAction!}
        />
      )}
    </div>
  )
}
