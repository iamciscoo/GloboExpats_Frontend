import { Star, MapPin, Shield, Crown, Heart, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { featuredItems, type FeaturedItem } from "@/lib/constants"

export default function FeaturedListings() {
  return (
    <section className="py-16 bg-neutral-100">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4 font-display">
            Featured Premium Listings
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Hand-picked premium items from verified sellers in the expat community
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featuredItems.map((item: FeaturedItem) => (
            <Card
              key={item.id}
              className={`group relative overflow-hidden rounded-lg shadow-card hover:shadow-card-hover transition-all duration-300 ${
                item.isPremium ? "border-2 border-brand-secondary bg-gradient-to-br from-white to-amber-50" : "bg-white"
              }`}
            >
              <CardContent className="p-0">
                {/* Image and Action Buttons */}
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {/* Action buttons overlay */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button size="icon" variant="outline" className="h-9 w-9 bg-white/80 backdrop-blur-sm hover:bg-white">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-9 w-9 bg-white/80 backdrop-blur-sm hover:bg-white">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {item.isPremium && (
                      <Badge className="bg-brand-secondary text-brand-primary font-semibold">
                        <Crown className="w-3 h-3 mr-1" />
                        {item.premiumLabel || "Premium"}
                      </Badge>
                    )}
                    {item.isVerified && (
                      <Badge className="bg-status-success text-white">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold font-display text-lg text-neutral-900 mb-2 line-clamp-2 group-hover:text-brand-primary transition-colors">
                    {item.title}
                  </h3>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-2xl font-bold text-brand-primary">{item.price}</span>
                    {item.originalPrice && (
                      <span className="text-sm text-neutral-500 line-through">{item.originalPrice}</span>
                    )}
                  </div>

                  {/* Rating and Seller */}
                  <div className="flex items-center justify-between mb-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-medium">{item.rating}</span>
                      <span className="text-neutral-500">({item.reviews} reviews)</span>
                    </div>
                    <span className="text-neutral-600 font-medium truncate">{item.seller}</span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 mb-4 text-sm text-neutral-600">
                    <MapPin className="w-4 h-4 text-neutral-400" />
                    <span>{item.location}</span>
                  </div>

                  <Button className="w-full bg-brand-primary hover:bg-blue-800 text-white font-semibold">
                    Contact Seller
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            variant="outline"
            className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white px-8 py-3 transition-all duration-300"
          >
            View All Featured Items
          </Button>
        </div>
      </div>
    </section>
  )
}
