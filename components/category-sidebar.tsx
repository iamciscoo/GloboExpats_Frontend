import Link from "next/link"
import { CATEGORIES } from "@/lib/constants"
import { Card, CardContent } from "@/components/ui/card"

export default function CategorySidebar() {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-screen sticky top-16 lg:block">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 lg:block hidden">Categories</h2>
        <div className="space-y-2">
          {CATEGORIES.map((category) => {
            const IconComponent = category.icon
            return (
              <Link 
                key={category.id} 
                href={`/category/${category.slug}`}
                className="block"
              >
                <Card className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-slate-50 border-slate-100">
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                        <IconComponent className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-slate-900 group-hover:text-blue-900 transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-xs text-slate-500">{category.count}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </aside>
  )
} 