'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Search, MoreHorizontal, Send, Info, ChevronLeft } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/components/ui/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getInitials } from '@/lib/utils'
import { RouteGuard } from '@/components/route-guard'
import type { Conversation, Message, Product, ChatData, MessagesData } from '@/lib/types'

const conversations: Conversation[] = [
  {
    id: 1,
    name: 'Sarah Mitchell',
    avatar: '/images/expat-avatar-1.jpg',
    lastMessage: 'Is the iPhone still available?',
    time: '2 min ago',
    unread: 2,
    product: 'iPhone 15 Pro Max',
    online: true,
    participants: [],
    isLoading: false,
    error: null,
  },
  {
    id: 2,
    name: 'Ahmed Hassan',
    avatar: '/images/expat-avatar-2.jpg',
    lastMessage: 'Thanks for the quick delivery!',
    time: '1 hour ago',
    unread: 0,
    product: 'MacBook Air M2',
    online: false,
    participants: [],
    isLoading: false,
    error: null,
  },
  {
    id: 3,
    name: 'Lisa Wang',
    avatar: '/images/expat-avatar-3.jpg',
    lastMessage: "What's the battery health?",
    time: '3 hours ago',
    unread: 1,
    product: 'iPad Pro 12.9"',
    online: true,
    participants: [],
    isLoading: false,
    error: null,
  },
  {
    id: 4,
    name: 'David Rodriguez',
    avatar: '/images/expat-avatar-4.jpg',
    lastMessage: 'Can we meet tomorrow at 3 PM?',
    time: '1 day ago',
    unread: 0,
    product: 'Gaming Setup',
    online: false,
    participants: [],
    isLoading: false,
    error: null,
  },
]

const messagesData: MessagesData = {
  1: {
    product: {
      name: 'iPhone 15 Pro Max',
      price: '$1,199',
      condition: 'Like New',
      image: '/images/iphone-15-pro.jpg',
    },
    messages: [
      {
        id: '1',
        sender: 'Sarah Mitchell',
        text: "Hi! I'm interested in your iPhone 15 Pro Max. Is it still available?",
        time: '10:30 AM',
        type: 'text',
        status: 'read',
      },
      {
        id: '2',
        sender: 'me',
        text: "Yes, it's still available! It's in excellent condition, barely used for 2 months.",
        time: '10:32 AM',
        type: 'text',
        status: 'read',
      },
      {
        id: '3',
        sender: 'Sarah Mitchell',
        text: 'Great! Can you tell me more about the battery health and any scratches?',
        time: '10:35 AM',
        type: 'text',
        status: 'read',
      },
      {
        id: '4',
        sender: 'me',
        text: "Battery health is at 98%, and there are no visible scratches. I've kept it in a case with a screen protector since day one.",
        time: '10:37 AM',
        type: 'text',
        status: 'read',
      },
      {
        id: '5',
        sender: 'Sarah Mitchell',
        text: 'Perfect! Would it be possible to meet somewhere in Dubai?',
        time: '10:45 AM',
        type: 'text',
        status: 'read',
      },
    ],
    participants: [],
    isLoading: false,
    error: null,
  },
  2: {
    product: {
      name: 'MacBook Air M2',
      price: '$950',
      condition: 'Excellent',
      image: '/images/macbook-air.jpg',
    },
    messages: [
      {
        id: '6',
        sender: 'Ahmed Hassan',
        text: 'Thanks for the quick delivery!',
        time: '1 hour ago',
        type: 'text',
        status: 'read',
      },
      {
        id: '7',
        sender: 'me',
        text: "You're welcome! Enjoy the new MacBook.",
        time: '1 hour ago',
        type: 'text',
        status: 'read',
      },
    ],
    participants: [],
    isLoading: false,
    error: null,
  },
  3: {
    product: {
      name: 'iPad Pro 12.9"',
      price: '$800',
      condition: 'Good',
      image: '/images/ipad-pro.jpg',
    },
    messages: [
      {
        id: '8',
        sender: 'Lisa Wang',
        text: "What's the battery health?",
        time: '3 hours ago',
        type: 'text',
        status: 'read',
      },
    ],
    participants: [],
    isLoading: false,
    error: null,
  },
  4: {
    product: {
      name: 'Gaming Setup',
      price: '$2,500',
      condition: 'Used',
      image: '/images/gaming-setup.jpg',
    },
    messages: [
      {
        id: '9',
        sender: 'David Rodriguez',
        text: 'Can we meet tomorrow at 3 PM?',
        time: '1 day ago',
        type: 'text',
        status: 'read',
      },
    ],
    participants: [],
    isLoading: false,
    error: null,
  },
}

export default function MessagesPage() {
  return (
    <RouteGuard
      requireAuth
      requireVerification="contact"
      loadingMessage="Checking messaging permissions..."
    >
      <MessagesPageContent />
    </RouteGuard>
  )
}

function MessagesPageContent() {
  const searchParams = useSearchParams()
  const [selectedConversation, setSelectedConversation] = useState<Conversation>(conversations[0])
  const [allConversations, setAllConversations] = useState<Conversation[]>(conversations)
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isMobileView, setIsMobileView] = useState(false)
  const [showConversationList, setShowConversationList] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Handle new contact expat flow and notification links
  useEffect(() => {
    const expat = searchParams.get('expat')
    const product = searchParams.get('product')

    if (expat && product) {
      // Check if conversation already exists (improved matching)
      const existingConvo = allConversations.find(
        (conv) =>
          (conv.name === expat || conv.name.toLowerCase().includes(expat.toLowerCase())) &&
          (conv.product === product || conv.product.toLowerCase().includes(product.toLowerCase()))
      )

      if (!existingConvo) {
        // Create new conversation
        const newConvo: Conversation = {
          id: allConversations.length + 1,
          name: expat,
          avatar: '/images/expat-avatar-1.jpg',
          lastMessage: 'Start your conversation...',
          time: 'now',
          unread: 0,
          product: product,
          online: true,
          participants: [],
          isLoading: false,
          error: null,
        }

        const updatedConversations = [newConvo, ...allConversations]
        setAllConversations(updatedConversations)
        setSelectedConversation(newConvo)
      } else {
        setSelectedConversation(existingConvo)

        // Mark conversation as read when accessed from notification
        if (existingConvo.unread > 0) {
          setAllConversations((prev) =>
            prev.map((conv) => (conv.id === existingConvo.id ? { ...conv, unread: 0 } : conv))
          )
        }
      }
    } else if (expat) {
      // Handle case where only expat is specified (from some notifications)
      const existingConvo = allConversations.find(
        (conv) => conv.name === expat || conv.name.toLowerCase().includes(expat.toLowerCase())
      )

      if (existingConvo) {
        setSelectedConversation(existingConvo)

        // Mark as read when accessed from notification
        if (existingConvo.unread > 0) {
          setAllConversations((prev) =>
            prev.map((conv) => (conv.id === existingConvo.id ? { ...conv, unread: 0 } : conv))
          )
        }
      } else {
        // Show toast if conversation not found
        toast({
          title: 'Conversation not found',
          description: `Could not find conversation with ${expat}`,
          variant: 'destructive',
        })
      }
    }
  }, [searchParams, allConversations, toast])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [selectedConversation.id])

  // Handle mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setShowConversationList(true)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const activeChat: ChatData = messagesData[selectedConversation.id] || {
    product: {
      name: selectedConversation.product || '',
      price: 'Contact for price',
      condition: 'Ask seller',
      image: '/placeholder.svg',
    },
    messages: [],
  }

  // Filter conversations based on search
  const filteredConversations = allConversations.filter(
    (conv) =>
      conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    try {
      // Simulate sending message
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Add message to conversation (in real app, this would be handled by backend)
      const messageToAdd = {
        id: Date.now().toString(),
        sender: 'me',
        text: newMessage.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text' as const,
        status: 'sent' as const,
      }

      // Update messages data (this would be managed by state management in real app)
      messagesData[selectedConversation.id] = {
        ...messagesData[selectedConversation.id],
        messages: [...(messagesData[selectedConversation.id]?.messages || []), messageToAdd],
      }

      // Update last message in conversation list
      setAllConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversation.id
            ? { ...conv, lastMessage: newMessage.trim(), time: 'now' }
            : conv
        )
      )

      setNewMessage('')
      toast({
        title: 'Message sent',
        description: 'Your message has been delivered.',
      })
    } catch (error) {
      toast({
        title: 'Failed to send',
        description: 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    if (isMobileView) {
      setShowConversationList(false)
    }
  }

  const handleBackToList = () => {
    setShowConversationList(true)
  }

  if (isMobileView && !showConversationList) {
    // Mobile chat view
    return (
      <div className="container mx-auto mt-4 mb-4 px-4 max-w-7xl">
        <Card className="h-[85vh] max-h-[900px] min-h-[600px] overflow-hidden shadow-lg">
          <div className="flex flex-col h-full">
            {/* Mobile Header */}
            <div className="flex items-center p-4 border-b bg-white flex-shrink-0">
              <Button variant="ghost" size="sm" onClick={handleBackToList} className="mr-2">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="relative">
                <Avatar className="w-10 h-10 border">
                  <AvatarImage src={selectedConversation.avatar} alt={selectedConversation.name} />
                  <AvatarFallback>{getInitials(selectedConversation.name)}</AvatarFallback>
                </Avatar>
                {selectedConversation.online && (
                  <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white" />
                )}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{selectedConversation.name}</h3>
                {selectedConversation.online && (
                  <p className="text-xs text-green-600">Online now</p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Info className="mr-2 h-4 w-4" />
                      Contact Info
                    </DropdownMenuItem>
                    <DropdownMenuItem>Block User</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      Delete Conversation
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 bg-neutral-50/30 min-h-0">
              <div className="flex flex-col gap-4 p-4 min-h-full">
                {/* Product Card */}
                {activeChat.product && activeChat.product.name && (
                  <div className="bg-white rounded-lg border p-3 mx-auto max-w-sm shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {activeChat.product.image && (
                          <Image
                            src={activeChat.product.image}
                            alt={activeChat.product.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">
                          {activeChat.product.name}
                        </h4>
                        <p className="text-lg font-bold text-blue-600">
                          {activeChat.product.price}
                        </p>
                        <p className="text-xs text-gray-500">
                          Condition: {activeChat.product.condition}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeChat.messages.map((message: Message, index: number) => (
                  <div
                    key={index}
                    className={`flex items-end gap-2 ${
                      message.sender === 'me' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.sender !== 'me' && (
                      <Avatar className="w-6 h-6 border flex-shrink-0">
                        <AvatarImage
                          src={selectedConversation.avatar}
                          alt={selectedConversation.name}
                        />
                        <AvatarFallback className="text-xs">
                          {getInitials(selectedConversation.name)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="max-w-[80%]">
                      <div
                        className={`p-3 rounded-2xl text-sm ${
                          message.sender === 'me'
                            ? 'bg-blue-500 text-white rounded-br-none'
                            : 'bg-white text-neutral-800 border rounded-bl-none'
                        }`}
                      >
                        <p className="break-words">{message.text}</p>
                      </div>
                      <div
                        className={`flex items-center gap-1 mt-1 text-xs text-muted-foreground ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                      >
                        <span>{message.time}</span>
                        {message.sender === 'me' && (
                          <span
                            className={`ml-1 ${message.status === 'read' ? 'text-blue-500' : 'text-gray-400'}`}
                          >
                            {message.status === 'read' ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
                    </div>
                    {message.sender === 'me' && (
                      <Avatar className="w-6 h-6 border flex-shrink-0">
                        <AvatarImage src="/images/user-avatar.png" alt="My Avatar" />
                        <AvatarFallback className="text-xs">ME</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6 border">
                      <AvatarImage
                        src={selectedConversation.avatar}
                        alt={selectedConversation.name}
                      />
                      <AvatarFallback className="text-xs">
                        {getInitials(selectedConversation.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-white text-neutral-600 p-3 rounded-2xl rounded-bl-none text-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0.1s' }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0.2s' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t bg-white flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Input
                    ref={inputRef}
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isSending}
                    className="pr-12 py-3 h-12 rounded-full border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSending}
                  className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 flex-shrink-0"
                >
                  <Send className="w-5 h-5 text-white" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto mt-4 mb-4 px-4 max-w-7xl">
      <Card className="h-[85vh] max-h-[900px] min-h-[600px] overflow-hidden shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 h-full">
          {/* Conversations List */}
          <div
            className={`${isMobileView && !showConversationList ? 'hidden' : 'block'} col-span-1 flex flex-col border-r h-full`}
          >
            <div className="p-4 border-b flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Messages</h2>
                <Link href="/account">
                  <Button variant="ghost" size="sm">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <ScrollArea className="flex-1 min-h-0">
              <div className="p-2 space-y-2">
                {filteredConversations.map((convo) => (
                  <button
                    key={convo.id}
                    className={`w-full text-left p-3 rounded-lg flex items-start gap-3 transition-colors mb-2 ${
                      selectedConversation.id === convo.id
                        ? 'bg-blue-100/60'
                        : 'hover:bg-neutral-100/80'
                    }`}
                    onClick={() => handleConversationSelect(convo)}
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar className="w-12 h-12 border">
                        <AvatarImage src={convo.avatar} alt={convo.name} />
                        <AvatarFallback>{getInitials(convo.name)}</AvatarFallback>
                      </Avatar>
                      {convo.online && (
                        <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold truncate">{convo.name}</h3>
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            {convo.lastMessage}
                          </p>
                          <p className="text-xs text-blue-600 font-medium mt-1 truncate">
                            Re: {convo.product}
                          </p>
                        </div>
                        <div className="flex flex-col items-end ml-2 flex-shrink-0">
                          <p className="text-xs text-muted-foreground whitespace-nowrap">
                            {convo.time}
                          </p>
                          {convo.unread > 0 && (
                            <Badge className="bg-blue-500 text-white w-5 h-5 flex items-center justify-center p-0 mt-1 text-xs">
                              {convo.unread}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}

                {filteredConversations.length === 0 && (
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground">No conversations found</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Area - Desktop */}
          <div
            className={`${isMobileView && !showConversationList ? 'hidden' : 'hidden md:flex'} col-span-2 flex-col h-full min-h-0`}
          >
            <div className="flex items-center p-4 border-b bg-white flex-shrink-0">
              <div className="relative">
                <Avatar className="w-10 h-10 border">
                  <AvatarImage src={selectedConversation.avatar} alt={selectedConversation.name} />
                  <AvatarFallback>{getInitials(selectedConversation.name)}</AvatarFallback>
                </Avatar>
                {selectedConversation.online && (
                  <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white" />
                )}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <h3 className="font-semibold truncate">{selectedConversation.name}</h3>
                {selectedConversation.online && (
                  <p className="text-xs text-green-600">Online now</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Info className="mr-2 h-4 w-4" />
                      Contact Info
                    </DropdownMenuItem>
                    <DropdownMenuItem>Block User</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      Delete Conversation
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <ScrollArea className="flex-1 bg-neutral-50/30 min-h-0">
              <div className="flex flex-col gap-4 p-6 min-h-full">
                {/* Product Card */}
                {activeChat.product && activeChat.product.name && (
                  <div className="bg-white rounded-lg border p-4 mx-auto max-w-md shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {activeChat.product.image && (
                          <Image
                            src={activeChat.product.image}
                            alt={activeChat.product.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">
                          {activeChat.product.name}
                        </h4>
                        <p className="text-lg font-bold text-blue-600">
                          {activeChat.product.price}
                        </p>
                        <p className="text-xs text-gray-500">
                          Condition: {activeChat.product.condition}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeChat.messages.map((message: Message, index: number) => (
                  <div
                    key={index}
                    className={`flex items-end gap-3 ${
                      message.sender === 'me' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.sender !== 'me' && (
                      <Avatar className="w-8 h-8 border flex-shrink-0">
                        <AvatarImage
                          src={selectedConversation.avatar}
                          alt={selectedConversation.name}
                        />
                        <AvatarFallback>{getInitials(selectedConversation.name)}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className="max-w-[70%]">
                      <div
                        className={`p-3 rounded-2xl ${
                          message.sender === 'me'
                            ? 'bg-blue-500 text-white rounded-br-none'
                            : 'bg-white text-neutral-800 border rounded-bl-none'
                        }`}
                      >
                        <p className="break-words">{message.text}</p>
                      </div>
                      <div
                        className={`flex items-center gap-1 mt-1 text-xs text-muted-foreground ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                      >
                        <span>{message.time}</span>
                        {message.sender === 'me' && (
                          <span
                            className={`ml-1 ${message.status === 'read' ? 'text-blue-500' : 'text-gray-400'}`}
                          >
                            {message.status === 'read' ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
                    </div>
                    {message.sender === 'me' && (
                      <Avatar className="w-8 h-8 border flex-shrink-0">
                        <AvatarImage src="/images/user-avatar.png" alt="My Avatar" />
                        <AvatarFallback>ME</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8 border">
                      <AvatarImage
                        src={selectedConversation.avatar}
                        alt={selectedConversation.name}
                      />
                      <AvatarFallback>{getInitials(selectedConversation.name)}</AvatarFallback>
                    </Avatar>
                    <div className="bg-white text-neutral-600 p-3 rounded-2xl rounded-bl-none">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0.1s' }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0.2s' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t bg-white flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Input
                    ref={inputRef}
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isSending}
                    className="pr-12 py-3 h-12 rounded-full border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSending}
                  className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 flex-shrink-0"
                >
                  <Send className="w-5 h-5 text-white" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
