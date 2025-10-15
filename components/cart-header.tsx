/**
 * Cart Header Component
 *
 * Displays cart icon with item count for navigation header
 */

'use client'

import { useCart } from '@/hooks/use-cart'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart } from 'lucide-react'
import Link from 'next/link'

interface CartHeaderProps {
  className?: string
}

export function CartHeader({ className }: CartHeaderProps) {
  const { itemCount } = useCart()

  return (
    <Link href="/cart">
      <Button variant="ghost" size="sm" className={className}>
        <div className="relative">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {itemCount > 99 ? '99+' : itemCount}
            </Badge>
          )}
        </div>
        <span className="sr-only">Shopping cart with {itemCount} items</span>
      </Button>
    </Link>
  )
}
