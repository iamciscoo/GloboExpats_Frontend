import Link from 'next/link'
import { Globe, Users, Shield, Sparkles, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Metadata } from 'next'

const whyJoin = [
  {
    icon: '🌍',
    title: 'Built for Expats, by Expats',
    description:
      'A marketplace designed around the real needs of global citizens starting a new chapter.',
  },
  {
    icon: '🤝',
    title: 'Trust & Safety First',
    description:
      'Every seller is verified, and every transaction is protected for your peace of mind.',
  },
  {
    icon: '🛒',
    title: 'Find What You Miss from Home',
    description:
      "Access authentic products and services you can't find locally, from people who understand your journey.",
  },
  {
    icon: '🚀',
    title: 'Shape the Community',
    description:
      'Be among the first to join, give feedback, and help us build the best expat marketplace together.',
  },
]

const values = [
  {
    icon: Globe,
    title: 'Global Community',
    description:
      'Connecting expats worldwide with trusted sellers and authentic products from home.',
  },
  {
    icon: Shield,
    title: 'Trust & Safety',
    description:
      'Every transaction is protected with our secure payment system and buyer protection guarantee.',
  },
  {
    icon: Users,
    title: 'Expert Sellers',
    description:
      'Our verified sellers are expats who understand your needs and deliver quality products.',
  },
  {
    icon: Sparkles,
    title: 'Enhanced Experience',
    description: 'Curated marketplace with powerful features for both buyers and sellers.',
  },
]

const team = [
  {
    name: 'Sarah Chen',
    role: 'CEO & Founder',
    image: '/images/team-sarah.jpg',
    bio: 'Former expat in 5 countries, passionate about connecting global communities.',
  },
  {
    name: 'Ahmed Hassan',
    role: 'CTO',
    image: '/images/team-ahmed.jpg',
    bio: 'Tech leader with 15 years experience building global marketplaces.',
  },
  {
    name: 'Maria Rodriguez',
    role: 'Head of Trust & Safety',
    image: '/images/team-maria.jpg',
    bio: 'Expert in international e-commerce regulations and user protection.',
  },
  {
    name: 'James Park',
    role: 'VP of Growth',
    image: '/images/team-james.jpg',
    bio: 'Scaling communities and marketplaces across emerging markets.',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-primary to-blue-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Bridging Distances, Connecting Lives
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Globoexpat is the trusted marketplace for expats worldwide, making it easy to buy and
              sell authentic products from home, wherever you are in the world.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" variant="secondary">
                  Join Our Community
                </Button>
              </Link>
              <Link href="/browse">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-black border-white hover:bg-white hover:text-black"
                >
                  Start Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Join Section (Early Stage) */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-neutral-800 mb-4">Why Join Globoexpat?</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              We&apos;re just getting started—here&apos;s what makes our community special from day
              one.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {whyJoin.map((item, idx) => (
              <div
                key={idx}
                className="bg-neutral-50 rounded-xl shadow-sm p-8 flex flex-col items-center text-center"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-semibold text-neutral-800 mb-2">{item.title}</h3>
                <p className="text-neutral-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-neutral-800 mb-4">Our Mission</h2>
              <p className="text-lg text-neutral-600">
                To create a trusted global marketplace that helps expats feel connected to home
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="bg-white shadow-sm">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-neutral-800 mb-4">For Buyers</h3>
                  <p className="text-neutral-600 mb-4">
                    Find authentic products from your home country, connect with verified sellers
                    who understand your needs, and enjoy secure transactions with buyer protection.
                  </p>
                  <ul className="space-y-2 text-neutral-600">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
                      <span>Access to products not available locally</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
                      <span>Verified sellers and authentic products</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
                      <span>Secure payments and buyer protection</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-neutral-800 mb-4">For Sellers</h3>
                  <p className="text-neutral-600 mb-4">
                    Turn your access to local products into a business opportunity. Help fellow
                    expats while building a sustainable income stream.
                  </p>
                  <ul className="space-y-2 text-neutral-600">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
                      <span>Reach a global expat audience</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
                      <span>Easy-to-use seller tools and analytics</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
                      <span>Fair fees and fast payouts</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-800 mb-4">Our Values</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              These core values guide everything we do at Globoexpat
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <Card key={index} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-brand-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-2">{value.title}</h3>
                    <p className="text-neutral-600">{value.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-800 mb-4">Meet Our Team</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              A diverse team of expats and tech experts dedicated to building the best marketplace
              for our community
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {team.map((member, index) => (
              <Card key={index} className="bg-white shadow-sm">
                <CardContent className="p-6 text-center">
                  <div className="w-32 h-32 bg-neutral-200 rounded-full mx-auto mb-4 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center">
                      <Users className="w-16 h-16 text-neutral-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-800">{member.name}</h3>
                  <p className="text-brand-primary font-medium mb-2">{member.role}</p>
                  <p className="text-sm text-neutral-600">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-brand-primary to-blue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Join Globoexpat?</h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Whether you&apos;re looking to buy products from home or start selling to the expat
            community, we&apos;re here to help you succeed.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary">
                Get Started Today
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="text-black border-white hover:bg-white hover:text-black"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export const metadata: Metadata = {
  title: 'About Us - Globoexpat',
  description:
    'Learn about the mission, values and team behind Globoexpat, the trusted marketplace for expats worldwide.',
}
