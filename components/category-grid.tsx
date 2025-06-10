import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CATEGORIES } from "@/lib/constants"

export default function CategoryGrid() {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Shop by Category</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Discover premium items across all categories, curated for the global expat community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((category) => {
            const IconComponent = category.icon
            return (
              <Card
                key={category.id}
                className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/20 hover:-translate-y-1 bg-white border-slate-200"
              >
                <CardContent className="p-6 text-center">
                  <div className="relative mb-4">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <Badge className={`absolute -top-2 -right-2 ${category.badgeColor} text-white text-xs`}>
                      {category.badge}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-blue-900 transition-colors">
                    {category.name}
                  </h3>

                  <p className="text-sm text-slate-500">{category.count}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
