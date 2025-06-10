import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Package, DollarSign, MessageCircle, User, Settings, Bell, LifeBuoy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const navItems = [
    { href: "/seller/dashboard", label: "Dashboard", icon: Home },
    { href: "/seller/listings", label: "Listings", icon: Package },
    { href: "/seller/orders", label: "Orders", icon: DollarSign },
    { href: "/seller/settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 bg-white border-r border-neutral-200 p-6">
          <div className="flex flex-col h-full">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link key={item.label} href={item.href}>
                  <Button
                    variant={pathname === item.href ? "secondary" : "ghost"}
                    className="w-full justify-start text-base"
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>
            <div className="mt-auto">
               <Card className="bg-neutral-50">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Need Help?</h3>
                  <p className="text-sm text-neutral-600 mb-4">
                    Our support team is here to assist you.
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <LifeBuoy className="mr-2 h-4 w-4" /> Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
} 