"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import CategorySidebar from "@/components/category-sidebar"

export default function MobileSidebarToggle() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="lg:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-20 left-2 sm:left-4 z-40 bg-white shadow-lg border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-full"
          >
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="sr-only">Toggle categories menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-slate-900">Categories</h2>
            <SheetClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-5 w-5" />
              </Button>
            </SheetClose>
          </div>
          <div className="overflow-y-auto">
            <CategorySidebar />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
} 