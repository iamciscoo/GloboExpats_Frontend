'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Settings, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { RouteGuard } from '@/components/route-guard'

export default function AdminUsersPage() {
  return (
    <RouteGuard requireAdmin loadingMessage="Verifying admin access...">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-6 w-6" />
              User Management
            </h1>
            <p className="text-gray-600">Manage users, roles, and permissions</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="space-y-2">
                <p className="text-xs md:text-sm font-medium text-gray-600">Total Users</p>
                <div className="flex items-baseline justify-between">
                  <p className="text-lg md:text-2xl font-bold text-gray-900">0</p>
                  <Badge className="bg-gray-100 text-gray-700 text-xs px-2 py-1 hidden md:inline-flex">
                    No Data
                  </Badge>
                </div>
                <div className="md:hidden">
                  <Badge className="bg-gray-100 text-gray-700 text-xs px-2 py-1">No Data</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="space-y-2">
                <p className="text-xs md:text-sm font-medium text-gray-600">Active Users</p>
                <div className="flex items-baseline justify-between">
                  <p className="text-lg md:text-2xl font-bold text-gray-900">0</p>
                  <Badge className="bg-gray-100 text-gray-700 text-xs px-2 py-1 hidden md:inline-flex">
                    No Data
                  </Badge>
                </div>
                <div className="md:hidden">
                  <Badge className="bg-gray-100 text-gray-700 text-xs px-2 py-1">No Data</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="space-y-2">
                <p className="text-xs md:text-sm font-medium text-gray-600">
                  Pending Verifications
                </p>
                <div className="flex items-baseline justify-between">
                  <p className="text-lg md:text-2xl font-bold text-gray-900">0</p>
                  <Badge className="bg-gray-100 text-gray-700 text-xs px-2 py-1 hidden md:inline-flex">
                    No Data
                  </Badge>
                </div>
                <div className="md:hidden">
                  <Badge className="bg-gray-100 text-gray-700 text-xs px-2 py-1">No Data</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="space-y-2">
                <p className="text-xs md:text-sm font-medium text-gray-600">Blocked Users</p>
                <div className="flex items-baseline justify-between">
                  <p className="text-lg md:text-2xl font-bold text-gray-900">0</p>
                  <Badge className="bg-gray-100 text-gray-700 text-xs px-2 py-1 hidden md:inline-flex">
                    No Data
                  </Badge>
                </div>
                <div className="md:hidden">
                  <Badge className="bg-gray-100 text-gray-700 text-xs px-2 py-1">No Data</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>User List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users by name, email, or organization..."
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Filters
              </Button>
            </div>

            <div className="text-center py-12 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">User Management Interface</p>
              <p>This page will display the user list, roles, and management tools.</p>
              <p className="text-sm mt-4">
                Connect this to your backend user management API to populate data.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </RouteGuard>
  )
}
