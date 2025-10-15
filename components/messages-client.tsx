'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Search, MoreHorizontal, Paperclip, Send } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { getInitials } from '@/lib/utils'
import type { Conversation, Message, ChatData, MessagesData } from '@/lib/types'

const conversations: Conversation[] = [
  {
    id: 1,
    name: 'Sarah Mitchell',
    avatar: '/images/seller-avatar-1.jpg',
    lastMessage: 'Is the iPhone still available?',
    time: '2 min ago',
    unread: 2,
    product: 'iPhone 15 Pro Max',
    online: true,
  },
  {
    id: 2,
    name: 'Ahmed Hassan',
    avatar: '/images/seller-avatar-2.jpg',
    lastMessage: 'Thanks for the quick delivery!',
    time: '1 hour ago',
    unread: 0,
    product: 'MacBook Air M2',
    online: false,
  },
  {
    id: 3,
    name: 'Lisa Wang',
    avatar: '/images/seller-avatar-3.jpg',
    lastMessage: "What's the battery health?",
    time: '3 hours ago',
    unread: 1,
    product: 'iPad Pro 12.9"',
    online: true,
  },
  {
    id: 4,
    name: 'David Rodriguez',
    avatar: '/images/seller-avatar-4.jpg',
    lastMessage: 'Can we meet tomorrow at 3 PM?',
    time: '1 day ago',
    unread: 0,
    product: 'Gaming Setup',
    online: false,
  },
]

const messagesData: MessagesData = {
  1: {
    product: {
      name: 'iPhone 15 Pro Max',
      price: '$1,199',
      condition: 'Like New',
      image: '/images/items/iphone.jpg',
    },
    messages: [
      {
        sender: 'Sarah Mitchell',
        text: "Hi! I'm interested in your iPhone 15 Pro Max. Is it still available?",
        time: '10:30 AM',
      },
      {
        sender: 'me',
        text: "Yes, it's still available! It's in excellent condition, barely used for 2 months.",
        time: '10:32 AM',
      },
      {
        sender: 'Sarah Mitchell',
        text: 'Great! Can you tell me more about the battery health and any scratches?',
        time: '10:35 AM',
      },
      {
        sender: 'me',
        text: "Battery health is at 98%, and there are no visible scratches. I've kept it in a case with a screen protector since day one.",
        time: '10:37 AM',
      },
      {
        sender: 'Sarah Mitchell',
        text: 'Perfect! Would it be possible to meet somewhere in Dubai?',
        time: '10:45 AM',
      },
    ],
    isLoading: false,
    error: null,
  },
  2: {
    product: {
      name: 'MacBook Air M2',
      price: '$950',
      condition: 'Excellent',
      image: '/images/items/macbook.jpg',
    },
    messages: [
      { sender: 'Ahmed Hassan', text: 'Thanks for the quick delivery!', time: '1 hour ago' },
      { sender: 'me', text: "You're welcome! Enjoy the new MacBook.", time: '1 hour ago' },
    ],
    isLoading: false,
    error: null,
  },
  3: {
    product: {
      name: 'iPad Pro 12.9"',
      price: '$800',
      condition: 'Good',
      image: '/images/items/ipad.jpg',
    },
    messages: [{ sender: 'Lisa Wang', text: "What's the battery health?", time: '3 hours ago' }],
    isLoading: false,
    error: null,
  },
  4: {
    product: {
      name: 'Gaming Setup',
      price: '$2,500',
      condition: 'Used',
      image: '/images/items/gaming-setup.jpg',
    },
    messages: [
      { sender: 'David Rodriguez', text: 'Can we meet tomorrow at 3 PM?', time: '1 day ago' },
    ],
    isLoading: false,
    error: null,
  },
}

export function MessagesClient() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation>(conversations[0])
  const conversationId =
    typeof selectedConversation.id === 'number'
      ? selectedConversation.id
      : parseInt(String(selectedConversation.id))
  const activeChat: ChatData = messagesData[conversationId] || {
    product: {},
    messages: [],
    isLoading: false,
    error: null,
  }

  return (
    <Card className="h-[calc(100vh-6rem)] md:h-[calc(100vh-6rem)] overflow-hidden shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 h-full">
        <div className="col-span-1 flex flex-col border-r h-full">
          <div className="p-4 border-b flex-shrink-0">
            <h2 className="text-2xl font-bold">Messages</h2>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input placeholder="Search conversations..." className="pl-10" />
            </div>
          </div>
          <ScrollArea className="flex-1 h-0">
            <div className="p-2 space-y-2">
              {conversations.map((convo) => (
                <button
                  key={convo.id}
                  className={`w-full text-left p-3 rounded-lg flex items-start gap-4 transition-colors mb-2 ${
                    selectedConversation.id === convo.id
                      ? 'bg-blue-100/60'
                      : 'hover:bg-neutral-100/80'
                  }`}
                  onClick={() => setSelectedConversation(convo)}
                >
                  <div className="relative">
                    <Avatar className="w-12 h-12 border">
                      <AvatarImage src={convo.avatar} alt={convo.name} />
                      <AvatarFallback>{getInitials(convo.name)}</AvatarFallback>
                    </Avatar>
                    {convo.online && (
                      <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 flex items-start justify-between">
                    <div className="truncate pr-4">
                      <h3 className="font-semibold truncate">{convo.name}</h3>
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {convo.lastMessage}
                      </p>
                      <p className="text-xs text-blue-600 font-medium mt-1 truncate">
                        Re: {convo.product}
                      </p>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0">
                      <p className="text-xs text-muted-foreground whitespace-nowrap">
                        {convo.time}
                      </p>
                      {convo.unread > 0 && (
                        <Badge className="bg-blue-500 text-white w-5 h-5 flex items-center justify-center p-0 mt-2">
                          {convo.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="col-span-2 flex flex-col h-full min-h-0">
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
            <div className="ml-3">
              <h3 className="font-semibold">{selectedConversation.name}</h3>
              {selectedConversation.online && <p className="text-xs text-green-600">Online now</p>}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
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
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{activeChat.product.name}</h4>
                      <p className="text-lg font-bold text-blue-600">{activeChat.product.price}</p>
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
                    <Avatar className="w-8 h-8 border">
                      <AvatarImage
                        src={selectedConversation.avatar}
                        alt={selectedConversation.name}
                      />
                      <AvatarFallback>{getInitials(selectedConversation.name)}</AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    <div
                      className={`max-w-xs md:max-w-md p-3 rounded-2xl ${
                        message.sender === 'me'
                          ? 'bg-blue-500 text-white rounded-br-none'
                          : 'bg-white text-neutral-800 border rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                    </div>
                    <p
                      className={`text-xs mt-1.5 ${
                        message.sender === 'me' ? 'text-right' : 'text-left'
                      } text-neutral-500`}
                    >
                      {message.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t bg-white flex-shrink-0">
            <div className="relative">
              <Input placeholder="Type a message..." className="pr-24 h-12" />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                <Button variant="ghost" size="icon">
                  <Paperclip className="w-5 h-5" />
                </Button>
                <Button className="ml-2">
                  <Send className="w-5 h-5 mr-2" />
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
