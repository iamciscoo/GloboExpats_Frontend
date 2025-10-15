import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CATEGORIES } from '@/lib/constants'

export default function CategoryGrid() {
  return (
    <section className="py-16 px-4" aria-labelledby="category-heading">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 id="category-heading" className="text-4xl font-bold text-slate-900 mb-4">
            Shop by Category
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Discover great deals across all categories, curated for the global expat community
          </p>
        </div>

        <nav role="navigation" aria-label="Product categories">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CATEGORIES.map((category) => {
              const IconComponent = category.icon
              return (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 rounded-lg"
                  aria-label={`Browse ${category.name} - ${category.count}`}
                >
                  <Card className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/20 hover:-translate-y-1 bg-white border-slate-200 h-full">
                    <CardContent className="p-6 text-center">
                      <div className="relative mb-4">
                        <div
                          className="w-16 h-16 mx-auto bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                          aria-hidden="true"
                        >
                          <IconComponent className="h-8 w-8 text-white" />
                        </div>
                        <Badge
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          className={`absolute -top-2 -right-2 ${(category as any).badgeColor || 'bg-blue-500'} text-white text-xs`}
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          aria-label={`${(category as any).badge} badge`}
                        >
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {(category as any).badge}
                        </Badge>
                      </div>

                      <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-blue-900 transition-colors">
                        {category.name}
                      </h3>

                      <p
                        className="text-sm text-slate-500"
                        aria-label={`${category.count} available`}
                      >
                        {category.count}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </section>
  )
}
