import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, MoreHorizontal } from 'lucide-react'
import Image from 'next/image'
import { getInitials } from '@/lib/utils'
import type { Conversation, ChatData } from '@/lib/types'

interface ChatWindowProps {
  conversation: Conversation
  chat: ChatData
}

export const ChatWindow = ({ conversation, chat }: ChatWindowProps) => (
  <div className="col-span-2 flex flex-col h-full min-h-0">
    <div className="flex items-center p-4 border-b bg-white flex-shrink-0">
      <div className="relative">
        <Avatar className="w-10 h-10 border">
          <AvatarImage src={conversation.avatar} alt={conversation.name} />
          <AvatarFallback>{getInitials(conversation.name)}</AvatarFallback>
        </Avatar>
        {conversation.online && (
          <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white" />
        )}
      </div>
      <div className="ml-3 flex-1">
        <h3 className="font-semibold">{conversation.name}</h3>
        {conversation.online ? (
          <p className="text-xs text-green-600">Online now • Text messaging</p>
        ) : (
          <p className="text-xs text-gray-500">Text messaging only</p>
        )}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </div>
    </div>

    {/* Messages */}
    <ScrollArea className="flex-1 p-4 space-y-4 bg-gray-50/30">
      {chat.messages.map((msg, index) => (
        <div
          key={index}
          className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} mb-4`}
        >
          <div
            className={`max-w-xs md:max-w-md p-4 rounded-2xl text-sm leading-relaxed shadow-sm transition-all duration-200 ${
              msg.sender === 'me'
                ? 'bg-blue-500 text-white rounded-br-md'
                : 'bg-white text-neutral-800 border rounded-bl-md'
            }`}
          >
            {msg.text}
            <div className="text-xs opacity-70 mt-2">{msg.time || 'now'}</div>
          </div>
        </div>
      ))}
    </ScrollArea>

    {/* Product */}
    {chat.product?.name && (
      <div className="border-t p-4 flex items-center gap-4 bg-blue-50/50">
        <Image
          src={chat.product.image || '/placeholder.svg'}
          alt={chat.product.name}
          width={64}
          height={64}
          className="rounded-lg object-cover w-16 h-16 border-2 border-white shadow-sm"
        />
        <div className="flex-1">
          <h4 className="font-semibold text-sm text-gray-900">{chat.product.name}</h4>
          <p className="text-xs text-gray-600 mt-1">{chat.product.condition}</p>
        </div>
        <Badge className="bg-green-100 text-green-800 font-semibold">{chat.product.price}</Badge>
      </div>
    )}

    {/* Simplified Input */}
    <div className="p-4 border-t flex items-center gap-3 bg-white">
      <Input
        placeholder="💬 Type your message..."
        className="flex-1 h-12 rounded-full border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
      />
      <Button
        size="icon"
        className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg"
      >
        <Send className="w-5 h-5 text-white" />
      </Button>
    </div>
  </div>
)
