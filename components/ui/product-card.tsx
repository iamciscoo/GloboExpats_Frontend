import Image from "next/image"
import { Star, MapPin, Shield, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { FeaturedItem } from "@/lib/types"

interface ProductCardProps {
  product: FeaturedItem
  viewMode?: "grid" | "list"
  className?: string
  onContactSeller?: (productId: number) => void
  onViewDetails?: (productId: number) => void
}

export function ProductCard({ 
  product, 
  viewMode = "grid", 
  className,
  onContactSeller,
  onViewDetails 
}: ProductCardProps) {
  const handleContactSeller = () => {
    onContactSeller?.(product.id)
  }

  const handleViewDetails = () => {
    onViewDetails?.(product.id)
  }

  return (
    <Card
      className={cn(
        "group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
        product.isPremium
          ? "border-2 border-amber-400 bg-gradient-to-br from-white to-amber-50"
          : "bg-white border-slate-200",
        className
      )}
      onClick={handleViewDetails}
    >
      <CardContent className="p-0">
        <div className={viewMode === "list" ? "flex" : ""}>
          {/* Image */}
          <div
            className={cn(
              "relative overflow-hidden",
              viewMode === "list" 
                ? "w-48 flex-shrink-0" 
                : "rounded-t-lg"
            )}
          >
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.title}
              width={viewMode === "list" ? 192 : 300}
              height={viewMode === "list" ? 192 : 200}
              className={cn(
                "object-cover group-hover:scale-105 transition-transform duration-300",
                viewMode === "list" 
                  ? "w-full h-full" 
                  : "w-full h-48"
              )}
            />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {product.isPremium && (
                <Badge className="bg-amber-500 text-black font-semibold flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  {product.premiumLabel || "Premium"}
                </Badge>
              )}
              {product.isVerified && (
                <Badge className="bg-green-500 text-white flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Verified
                </Badge>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-4 flex-1">
            <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-900 transition-colors">
              {product.title}
            </h3>

            {/* Price */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl font-bold text-amber-600">{product.price}</span>
              {product.originalPrice && (
                <span className="text-sm text-slate-500 line-through">{product.originalPrice}</span>
              )}
            </div>

            {/* Seller Info */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-medium">{product.rating}</span>
                <span className="text-sm text-slate-500">({product.reviews})</span>
              </div>
              <span className="text-sm text-slate-600 truncate">{product.seller}</span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-1 mb-4">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-600">{product.location}</span>
            </div>

            {/* Action Button */}
            <Button 
              className="w-full bg-blue-900 hover:bg-blue-800 text-white"
              onClick={(e) => {
                e.stopPropagation()
                handleContactSeller()
              }}
            >
              Contact Seller
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 