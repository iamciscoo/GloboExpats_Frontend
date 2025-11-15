'use client'

import Link from 'next/link'
import { LayoutDashboard } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { isAdmin } from '@/lib/admin-utils'

export default function AdminSection() {
  const { user, isLoggedIn } = useAuth()

  // Don't render if user is not logged in or not admin
  if (!isLoggedIn || !isAdmin(user)) {
    return null
  }

  return (
    <div className="p-4 border-b border-slate-100">
      <Card className="bg-blue-50 border-blue-200/50 shadow-sm">
        <CardContent className="p-3">
          <div className="space-y-2">
            {/* Header */}
            <div className="flex items-center gap-2">
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">Admin Panel</h3>
                <p className="text-xs text-gray-600">Platform management & moderation</p>
              </div>
            </div>

            {/* Admin Dashboard Button */}
            <Button
              asChild
              size="sm"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 h-auto"
            >
              <Link href="/admin/dashboard" className="flex items-center justify-center gap-1">
                <LayoutDashboard className="w-3 h-3" />
                <span>Admin Dashboard</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
