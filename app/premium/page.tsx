import { Check, Crown, Star, Zap, Shield, TrendingUp, Users, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const plans = [
  {
    name: "Basic Seller",
    price: "Free",
    period: "",
    description: "Perfect for occasional sellers",
    features: [
      "Up to 5 active listings",
      "Basic seller profile",
      "Standard customer support",
      "Basic analytics",
      "7-day listing duration",
    ],
    notIncluded: ["Priority listing placement", "Advanced analytics", "Premium badges", "Extended listing duration"],
    buttonText: "Current Plan",
    buttonVariant: "outline" as const,
    popular: false,
  },
  {
    name: "Premium Seller",
    price: "$29",
    period: "/month",
    description: "For serious sellers who want to grow",
    features: [
      "Unlimited active listings",
      "Priority listing placement",
      "Premium seller badge",
      "Advanced analytics & insights",
      "30-day listing duration",
      "Featured in search results",
      "Priority customer support",
      "Social media promotion",
    ],
    notIncluded: ["Dedicated account manager", "Custom branding options"],
    buttonText: "Upgrade to Premium",
    buttonVariant: "default" as const,
    popular: true,
  },
  {
    name: "VIP Seller",
    price: "$99",
    period: "/month",
    description: "For professional sellers and businesses",
    features: [
      "Everything in Premium",
      "VIP seller badge & verification",
      "Dedicated account manager",
      "Custom store branding",
      "90-day listing duration",
      "Homepage featured placement",
      "24/7 priority support",
      "Marketing campaign assistance",
      "Bulk listing tools",
      "API access for integrations",
    ],
    notIncluded: [],
    buttonText: "Go VIP",
    buttonVariant: "default" as const,
    popular: false,
  },
]

const benefits = [
  {
    icon: TrendingUp,
    title: "Increase Your Sales",
    description: "Premium listings get 3x more views and 2x more inquiries than basic listings.",
  },
  {
    icon: Crown,
    title: "Premium Badge Recognition",
    description: "Stand out with verified premium badges that build trust with buyers.",
  },
  {
    icon: Zap,
    title: "Priority Placement",
    description: "Your listings appear first in search results and category pages.",
  },
  {
    icon: Shield,
    title: "Enhanced Trust & Security",
    description: "Advanced verification and seller protection for peace of mind.",
  },
  {
    icon: Users,
    title: "Dedicated Support",
    description: "Get priority customer support and dedicated account management.",
  },
  {
    icon: Headphones,
    title: "Marketing Support",
    description: "Professional marketing assistance to optimize your listings.",
  },
]

export default function PremiumPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-cyan-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="h-8 w-8 text-amber-400" />
            <h1 className="text-5xl font-bold">Premium Membership</h1>
          </div>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Unlock the full potential of your expat marketplace experience with premium features designed for serious
            sellers
          </p>
          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-400" />
              <span>10,000+ Premium Sellers</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <span>3x More Sales</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-400" />
              <span>Verified & Trusted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Why Go Premium?</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Join thousands of successful expat sellers who've upgraded their marketplace experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center">
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-3">{benefit.title}</h3>
                    <p className="text-slate-600">{benefit.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Choose Your Plan</h2>
            <p className="text-xl text-slate-600">Select the perfect plan for your selling needs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative ${plan.popular ? "border-2 border-amber-400 shadow-xl scale-105" : "border-slate-200"}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black font-semibold px-4 py-1">
                    Most Popular
                  </Badge>
                )}

                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold text-slate-900">{plan.name}</CardTitle>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                    <span className="text-slate-600">{plan.period}</span>
                  </div>
                  <p className="text-slate-600">{plan.description}</p>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-slate-700">{feature}</span>
                      </div>
                    ))}
                    {plan.notIncluded.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-3 opacity-50">
                        <div className="h-5 w-5 flex-shrink-0"></div>
                        <span className="text-slate-500 line-through">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    className={`w-full py-3 ${
                      plan.buttonVariant === "default"
                        ? "bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                        : "border-slate-300 text-slate-700"
                    }`}
                    variant={plan.buttonVariant}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-slate-600 mb-4">
              All plans include our standard seller protection and secure payment processing
            </p>
            <p className="text-sm text-slate-500">Cancel anytime • No setup fees • 30-day money-back guarantee</p>
          </div>
        </div>
      </div>

      {/* Success Stories */}
      <div className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Success Stories</h2>
            <p className="text-xl text-slate-600">See how premium membership transformed these sellers' businesses</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                location: "Singapore",
                avatar: "/images/seller-avatar-1.jpg",
                story:
                  "Upgraded to Premium and saw 300% increase in sales within the first month. The priority placement really works!",
                sales: "$15,000+ monthly",
              },
              {
                name: "Ahmed Al-Rashid",
                location: "Dubai, UAE",
                avatar: "/images/seller-avatar-2.jpg",
                story:
                  "VIP membership gave me the tools to scale my electronics business. The dedicated support is incredible.",
                sales: "$45,000+ monthly",
              },
              {
                name: "Maria Rodriguez",
                location: "London, UK",
                avatar: "/images/seller-avatar-3.jpg",
                story: "Premium badges built instant trust with buyers. My furniture sales doubled in just 6 weeks.",
                sales: "$8,500+ monthly",
              },
            ].map((story, index) => (
              <Card key={index} className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <img src={story.avatar || "/placeholder.svg"} alt={story.name} className="w-12 h-12 rounded-full" />
                    <div>
                      <h3 className="font-semibold text-slate-900">{story.name}</h3>
                      <p className="text-sm text-slate-600">{story.location}</p>
                    </div>
                  </div>
                  <p className="text-slate-700 mb-4">"{story.story}"</p>
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Badge className="bg-green-100 text-green-800">{story.sales}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-blue-900 to-cyan-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Boost Your Sales?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of successful expat sellers who've upgraded to premium
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8 py-3 text-lg">
              Start Premium Trial
            </Button>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-900 px-8 py-3 text-lg"
            >
              Compare Plans
            </Button>
          </div>
          <p className="text-sm text-white/80 mt-4">14-day free trial • No credit card required</p>
        </div>
      </div>
    </div>
  )
}
