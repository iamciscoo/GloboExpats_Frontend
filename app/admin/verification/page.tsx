'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, FileText, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { RouteGuard } from '@/components/route-guard'

export default function AdminVerificationPage() {
  return (
    <RouteGuard requireAdmin loadingMessage="Verifying admin access...">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle className="h-6 w-6" />
              User Verifications
            </h1>
            <p className="text-gray-600">Review and manage user verification requests</p>
          </div>
          <Button className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Verification Guidelines
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="space-y-2">
                <p className="text-xs md:text-sm font-medium text-gray-600">Pending Requests</p>
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
                <p className="text-xs md:text-sm font-medium text-gray-600">Verified Users</p>
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
                <p className="text-xs md:text-sm font-medium text-gray-600">Rejected</p>
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
                <p className="text-xs md:text-sm font-medium text-gray-600">Avg. Review Time</p>
                <div className="flex items-baseline justify-between">
                  <p className="text-lg md:text-2xl font-bold text-gray-900">0h</p>
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-4" />
              <h3 className="font-semibold text-yellow-900 mb-2">Pending Reviews</h3>
              <p className="text-sm text-yellow-700 mb-4">
                0 verification requests awaiting review
              </p>
              <Button
                variant="outline"
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
              >
                Review Pending
              </Button>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6 text-center">
              <FileText className="h-8 w-8 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-blue-900 mb-2">Document Review</h3>
              <p className="text-sm text-blue-700 mb-4">Check uploaded documents</p>
              <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                Review Documents
              </Button>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-green-900 mb-2">Recent Approvals</h3>
              <p className="text-sm text-green-700 mb-4">View recently verified users</p>
              <Button
                variant="outline"
                className="border-green-300 text-green-700 hover:bg-green-100"
              >
                View Approved
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Verification Queue */}
        <Card>
          <CardHeader>
            <CardTitle>Verification Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by user name, email, or organization..."
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Filter by Status
              </Button>
            </div>

            <div className="text-center py-12 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Verification Management Interface</p>
              <p>This page will display the verification queue with review tools.</p>
              <p className="text-sm mt-4">
                Connect this to your backend verification API to populate data.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </RouteGuard>
  )
}
