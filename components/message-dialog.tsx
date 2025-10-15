'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send } from 'lucide-react'

interface MessageDialogProps {
  isOpen: boolean
  onClose: () => void
  sellerName: string
  productTitle: string
}

export default function MessageDialog({
  isOpen,
  onClose,
  sellerName,
  productTitle,
}: MessageDialogProps) {
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  const handleSend = async () => {
    if (!message.trim()) return
    setIsSending(true)
    // Simulate API call
    setTimeout(() => {
      setIsSending(false)
      setMessage('')
      onClose()
    }, 1000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Message {sellerName}</DialogTitle>
          <DialogDescription>
            Let the seller know you&apos;re interested in &quot;{productTitle}&quot;. Describe your
            query below.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          placeholder="Hi, is this item still available? …"
        />

        <div className="flex justify-end pt-4">
          <Button onClick={handleSend} disabled={isSending || message.trim() === ''}>
            <Send className="w-4 h-4 mr-2" />
            {isSending ? 'Sending…' : 'Send'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
