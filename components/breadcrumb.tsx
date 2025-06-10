"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"

export default function Breadcrumb() {
  const pathname = usePathname()
  const pathSegments = pathname.split('/').filter(segment => segment)

  if (pathSegments.length === 0) {
    return null
  }

  return (
    <nav aria-label="Breadcrumb" className="bg-neutral-100">
      <div className="container mx-auto px-4">
        <ol className="flex items-center space-x-2 py-2 text-sm text-neutral-600">
          <li>
            <Link href="/" className="hover:text-brand-primary">
              Home
            </Link>
          </li>
          {pathSegments.map((segment, index) => {
            const href = `/${pathSegments.slice(0, index + 1).join('/')}`
            const isLast = index === pathSegments.length - 1
            const name = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')

            return (
              <li key={href} className="flex items-center space-x-2">
                <ChevronRight className="h-4 w-4 text-neutral-400" />
                {isLast ? (
                  <span className="font-semibold text-neutral-800">{name}</span>
                ) : (
                  <Link href={href} className="hover:text-brand-primary">
                    {name}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
} 