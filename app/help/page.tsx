'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Search,
  ChevronDown,
  ChevronRight,
  ShoppingCart,
  Package,
  CreditCard,
  Truck,
  Shield,
  Users,
  MessageCircle,
  HelpCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqCategories = [
  {
    id: 'buying',
    title: 'Buying',
    icon: ShoppingCart,
    questions: [
      {
        question: 'How do I place an order?',
        answer:
          "To place an order, browse products, add items to your cart, and proceed to checkout. You'll need to create an account or log in, provide shipping information, and complete payment.",
      },
      {
        question: 'What payment methods are accepted?',
        answer:
          'We accept major credit cards (Visa, Mastercard, American Express), debit cards, and digital payment methods like PayPal. All payments are processed securely.',
      },
      {
        question: 'Is my payment information secure?',
        answer:
          'Yes, all payment information is encrypted and processed through secure payment gateways. We never store your credit card details on our servers.',
      },
      {
        question: 'Can I buy from sellers in other countries?',
        answer:
          "Yes! Globoexpat connects buyers and sellers worldwide. Check the seller's shipping policies for international delivery options and costs.",
      },
    ],
  },
  {
    id: 'selling',
    title: 'Selling',
    icon: Package,
    questions: [
      {
        question: 'How do I become a seller?',
        answer:
          "Click 'Become a Seller' and complete the registration process. You'll need to verify your identity, set up payment methods, and agree to our seller terms.",
      },
      {
        question: 'What are the seller fees?',
        answer:
          'Globoexpat charges a commission of 8-12% on successful sales, depending on your seller tier. Experienced sellers enjoy lower fees and additional benefits.',
      },
      {
        question: 'How do I list a product?',
        answer:
          "From your seller dashboard, click 'Add Product', fill in the details including title, description, price, and photos. Make sure to select appropriate categories.",
      },
      {
        question: 'When do I get paid?',
        answer:
          'Payments are processed within 3-5 business days after the buyer confirms receipt of the item. Funds are transferred to your linked bank account or digital wallet.',
      },
    ],
  },
  {
    id: 'shipping',
    title: 'Shipping & Delivery',
    icon: Truck,
    questions: [
      {
        question: 'How long does shipping take?',
        answer:
          'Shipping times vary by seller location and destination. Domestic shipping typically takes 3-7 days, while international shipping can take 7-21 days.',
      },
      {
        question: 'How can I track my order?',
        answer:
          "Once shipped, you'll receive a tracking number via email. You can also track orders from your account dashboard under 'My Orders'.",
      },
      {
        question: "What if my item doesn't arrive?",
        answer:
          "If your item doesn't arrive within the estimated timeframe, contact the seller first. If unresolved, open a dispute through our Resolution Center.",
      },
      {
        question: 'Do sellers ship internationally?',
        answer:
          'Many sellers offer international shipping. Check the product listing for shipping options or contact the seller directly for specific destinations.',
      },
    ],
  },
  {
    id: 'returns',
    title: 'Returns & Refunds',
    icon: CreditCard,
    questions: [
      {
        question: 'What is the return policy?',
        answer:
          'Each seller sets their own return policy. Check the product listing for specific return terms. Most sellers offer 7-30 day return windows.',
      },
      {
        question: 'How do I request a return?',
        answer:
          "Go to your order history, select the item, and click 'Request Return'. Follow the prompts and communicate with the seller to arrange the return.",
      },
      {
        question: 'When will I receive my refund?',
        answer:
          'Refunds are processed within 5-10 business days after the seller receives and inspects the returned item. The time to appear in your account depends on your payment method.',
      },
      {
        question: "What if the seller doesn't respond?",
        answer:
          "If a seller doesn't respond within 48 hours, escalate the issue through our Resolution Center. Our support team will help mediate.",
      },
    ],
  },
  {
    id: 'safety',
    title: 'Trust & Safety',
    icon: Shield,
    questions: [
      {
        question: 'How does buyer protection work?',
        answer:
          "Our buyer protection covers you if items don't arrive, arrive damaged, or significantly differ from the description. File a claim within 30 days of purchase.",
      },
      {
        question: 'How are sellers verified?',
        answer:
          'Sellers undergo identity verification, and established sellers can earn verification badges based on their sales history, ratings, and compliance record.',
      },
      {
        question: 'What should I do if I suspect fraud?',
        answer:
          "Report suspicious activity immediately through the 'Report' button on listings or profiles. Our Trust & Safety team investigates all reports.",
      },
      {
        question: 'Is my personal information safe?',
        answer:
          'We use industry-standard encryption and security measures to protect your data. Read our Privacy Policy for detailed information about data handling.',
      },
    ],
  },
  {
    id: 'account',
    title: 'Account & Profile',
    icon: Users,
    questions: [
      {
        question: 'How do I reset my password?',
        answer:
          "Click 'Forgot Password' on the login page. Enter your email, and we'll send instructions to reset your password.",
      },
      {
        question: 'Can I change my email address?',
        answer:
          "Yes, go to Account Settings > Personal Information. You'll need to verify the new email address before the change takes effect.",
      },
      {
        question: 'How do I delete my account?',
        answer:
          'Go to Account Settings > Privacy > Delete Account. Note that this action is permanent and cannot be undone. Complete any pending transactions first.',
      },
      {
        question: 'What are the benefits of verification?',
        answer:
          'Verified users enjoy higher trust scores, better visibility in search results, access to advanced features, and priority customer support.',
      },
    ],
  },
]

const popularTopics = [
  { title: 'Getting Started Guide', href: '/help/getting-started', icon: HelpCircle },
  { title: 'Seller Handbook', href: '/help/seller-guide', icon: Package },
  { title: 'Shipping Calculator', href: '/help/shipping-calculator', icon: Truck },
  { title: 'Safety Tips', href: '/help/safety', icon: Shield },
]

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Filter FAQs based on search
  const filteredCategories = faqCategories
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (q) =>
          q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.questions.length > 0)

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-primary to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">How can we help you?</h1>
            <p className="text-xl text-blue-100 mb-8">
              Search our help center or browse categories below
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-neutral-800 bg-white rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Popular Topics */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-neutral-800 mb-6">Popular Topics</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularTopics.map((topic, index) => {
              const Icon = topic.icon
              return (
                <Link key={index} href={topic.href}>
                  <Card className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-primary/10 rounded-lg">
                          <Icon className="w-5 h-5 text-brand-primary" />
                        </div>
                        <h3 className="font-semibold text-neutral-800">{topic.title}</h3>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Category Navigation */}
          <div className="lg:col-span-1">
            <Card className="bg-white shadow-sm sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1 p-4">
                  {faqCategories.map((category) => {
                    const Icon = category.icon
                    return (
                      <button
                        key={category.id}
                        onClick={() =>
                          setSelectedCategory(selectedCategory === category.id ? null : category.id)
                        }
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-brand-primary text-white'
                            : 'hover:bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{category.title}</span>
                      </button>
                    )
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3">
            {searchQuery && (
              <p className="text-sm text-neutral-600 mb-4">Showing results for "{searchQuery}"</p>
            )}

            <div className="space-y-6">
              {(selectedCategory
                ? filteredCategories.filter((c) => c.id === selectedCategory)
                : filteredCategories
              ).map((category) => {
                const Icon = category.icon
                return (
                  <Card key={category.id} className="bg-white shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-brand-primary" />
                        {category.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        {category.questions.map((faq, index) => (
                          <AccordionItem key={index} value={`${category.id}-${index}`}>
                            <AccordionTrigger className="text-left">
                              {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-neutral-600">
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {filteredCategories.length === 0 && (
              <Card className="bg-white shadow-sm">
                <CardContent className="p-12 text-center">
                  <HelpCircle className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-800 mb-2">No results found</h3>
                  <p className="text-neutral-600 mb-4">
                    Try searching with different keywords or browse our categories
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedCategory(null)
                    }}
                  >
                    Clear search
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Still Need Help */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-br from-brand-primary to-blue-700 text-white">
            <CardContent className="p-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Still need help?</h2>
              <p className="text-blue-100 mb-6">Our support team is here to assist you</p>
              <div className="flex gap-4 justify-center">
                <Link href="/contact">
                  <Button variant="secondary" size="lg">
                    Contact Support
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-white border-white hover:bg-white hover:text-brand-primary"
                >
                  Live Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
