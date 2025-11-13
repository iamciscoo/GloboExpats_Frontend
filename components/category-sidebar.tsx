'use client'

import Link from 'next/link'
import { CATEGORIES } from '@/lib/constants'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import AdminSection from '@/components/admin-section'

export default function CategorySidebar() {
  const { isLoggedIn } = useAuth()

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 min-h-screen sticky top-16 overflow-hidden">
      <div className="h-screen flex flex-col">
        {/* Unified Expat Dashboard Section */}
        <div className="p-4 border-b border-slate-100">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-brand-primary/20 shadow-futuristic">
            <CardContent className="p-4">
              {isLoggedIn ? (
                <div className="space-y-3">
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-800 text-base mb-2">Expat Dashboard</h3>
                    <p className="text-xs text-gray-600">
                      Manage your listings, profile & community connections
                    </p>
                  </div>

                  {/* Quick Actions Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      asChild
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 h-auto"
                    >
                      <Link href="/sell" className="flex flex-col items-center gap-1">
                        <Plus className="w-3 h-3" />
                        <span>New Listing</span>
                      </Link>
                    </Button>

                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="border-blue-200 hover:bg-blue-50 text-blue-700 text-xs py-2 h-auto"
                    >
                      <Link
                        href="/expat/dashboard?tab=listings"
                        className="flex flex-col items-center gap-1"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                        <span>My Listings</span>
                      </Link>
                    </Button>
                  </div>

                  {/* Full Dashboard Link */}
                  <Button
                    asChild
                    size="sm"
                    variant="ghost"
                    className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs"
                  >
                    <Link href="/expat/dashboard">View Full Dashboard →</Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-base mb-2">
                      Join Expat Community
                    </h3>
                    <p className="text-xs text-gray-600">
                      Connect, trade & build relationships with expats worldwide
                    </p>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    className="w-full bg-gradient-to-r from-brand-primary to-brand-accent hover:from-blue-800 hover:to-cyan-600 text-white"
                  >
                    <Link href="/register">Join Community</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Admin Section - Only visible to admin users */}
        <AdminSection />

        {/* Categories Section with Custom Scroll */}
        <div className="flex-1 flex flex-col px-4 py-2 min-h-0">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex-shrink-0">Categories</h2>
          <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <div className="space-y-2 pr-2 pb-4">
              {CATEGORIES.map((category) => {
                const IconComponent = category.icon
                return (
                  <Link
                    key={category.id}
                    href={`/browse?category=${category.slug}`}
                    className="block"
                  >
                    <Card className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-slate-50 border-slate-100 mr-1">
                      <CardContent className="p-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                            <IconComponent className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-slate-900 group-hover:text-blue-900 transition-colors">
                              {category.name}
                            </h3>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
