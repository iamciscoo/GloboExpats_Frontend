'use client'

import { useState } from 'react'
import { Menu, Plus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Card, CardContent } from '@/components/ui/card'
import { CATEGORIES } from '@/lib/constants'
import { useAuth } from '@/hooks/use-auth'
import AdminSection from '@/components/admin-section'

export default function MobileSidebarToggle() {
  const [isOpen, setIsOpen] = useState(false)
  const { isLoggedIn } = useAuth()

  return (
    <div className="lg:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-[76px] left-2 sm:left-4 z-40 bg-transparent hover:bg-white/80 shadow-lg border border-slate-200 text-slate-700 rounded-full w-9 h-9 backdrop-blur-sm"
          >
            <Menu className="h-4 w-4" />
            <span className="sr-only">Toggle categories menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-[280px] sm:w-80 p-0 flex flex-col top-[64px] h-[calc(100vh-64px)] md:top-0 md:h-screen z-50"
          hideOverlay={true}
        >
          <SheetHeader className="p-4 border-b flex-shrink-0">
            <SheetTitle className="text-lg font-semibold text-slate-900">Categories</SheetTitle>
            <SheetDescription className="sr-only">Browse products by category</SheetDescription>
          </SheetHeader>
          <div className="overflow-y-auto flex-1">
            {/* Unified Expat Dashboard Section */}
            <div className="p-4 border-b border-slate-100">
              <Card className="bg-blue-50 border-blue-200/50 shadow-sm">
                <CardContent className="p-4">
                  {isLoggedIn ? (
                    <div className="space-y-3">
                      <div className="text-center">
                        <h3 className="font-semibold text-gray-800 text-base mb-2">
                          Expat Dashboard
                        </h3>
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
                          onClick={() => setIsOpen(false)}
                        >
                          <Link href="/sell" className="flex flex-col items-center gap-1">
                            <Plus className="w-3 h-3" />
                            <span>New Listing</span>
                          </Link>
                        </Button>

                        <Button
                          asChild
                          variant="outline"
                          className="border-blue-200 hover:bg-blue-50 text-blue-700 text-xs py-2 h-auto"
                          onClick={() => setIsOpen(false)}
                        >
                          <Link
                            href="/expat/dashboard"
                            className="flex flex-col items-center gap-1"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
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
                        onClick={() => setIsOpen(false)}
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
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => setIsOpen(false)}
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

            {/* Categories Section */}
            <div className="p-4">
              <div className="space-y-2">
                {CATEGORIES.map((category) => {
                  const IconComponent = category.icon
                  return (
                    <Link
                      key={category.id}
                      href={`/browse?category=${category.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="block"
                    >
                      <Card className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-slate-50 border-slate-100">
                        <CardContent className="p-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
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
        </SheetContent>
      </Sheet>
    </div>
  )
}
