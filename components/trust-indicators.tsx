import { Shield, Globe, CreditCard, Award } from "lucide-react"

const indicators = [
  {
    icon: Shield,
    title: "Verified Sellers",
    description: "All sellers go through identity verification",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "Protected transactions with buyer guarantee",
  },
  {
    icon: Globe,
    title: "Global Shipping",
    description: "Worldwide delivery with tracking",
  },
  {
    icon: Award,
    title: "Premium Quality",
    description: "Curated items from trusted expat community",
  },
]

export default function TrustIndicators() {
  return (
    <section className="py-8 sm:py-12 bg-white border-b border-slate-200">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {indicators.map((indicator, index) => {
            const IconComponent = indicator.icon
            return (
              <div key={index} className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1 sm:mb-2 text-sm sm:text-base">{indicator.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 px-1">{indicator.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
