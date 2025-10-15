'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Shield, AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface VerificationPopupProps {
  isOpen: boolean
  onClose: () => void
  action: 'buy' | 'sell' | 'contact'
}

export function VerificationPopup({ isOpen, onClose, action }: VerificationPopupProps) {
  const router = useRouter()

  const actionMessages = {
    buy: 'make purchases',
    sell: 'list items for sale',
    contact: 'contact sellers',
  }

  const handleVerification = () => {
    router.push('/account/verification')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-6 w-6 text-brand-primary" />
            Expat Verification Required
          </DialogTitle>
          <DialogDescription className="text-base">
            To ensure a trusted community, verification is required to {actionMessages[action]}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="bg-amber-50 text-amber-900 border-amber-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Only verified expats can {actionMessages[action]} on our platform.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <h4 className="font-medium text-neutral-900">Verification requires:</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-neutral-600">
              <li>Valid passport or residence permit</li>
              <li>Proof of address in current country</li>
              <li>Employment or study documentation</li>
              <li>Brief verification call</li>
            </ul>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Maybe Later
            </Button>
            <Button className="bg-brand-primary hover:bg-blue-700" onClick={handleVerification}>
              Start Verification
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
