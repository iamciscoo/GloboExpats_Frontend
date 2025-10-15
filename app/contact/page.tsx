'use client'

import { useState } from 'react'
import { Mail, MessageSquare, Phone, MapPin, Clock, Send, Loader2, HelpCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'

const contactReasons = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'support', label: 'Technical Support' },
  { value: 'seller', label: 'Become a Seller' },
  { value: 'report', label: 'Report an Issue' },
  { value: 'partnership', label: 'Partnership Opportunity' },
  { value: 'press', label: 'Press Inquiry' },
]

const offices = [
  {
    location: 'Dubai, UAE',
    address: 'Dubai Internet City, Building 3, Office 301',
    phone: '+971 4 123 4567',
    hours: 'Sun-Thu: 9:00 AM - 6:00 PM GST',
  },
  {
    location: 'Singapore',
    address: 'One Raffles Place, Tower 2, Level 20',
    phone: '+65 6234 5678',
    hours: 'Mon-Fri: 9:00 AM - 6:00 PM SGT',
  },
  {
    location: 'London, UK',
    address: "123 King's Cross, London WC1X 8RA",
    phone: '+44 20 1234 5678',
    hours: 'Mon-Fri: 9:00 AM - 5:00 PM GMT',
  },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    reason: '',
    subject: '',
    message: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    if (!formData.reason) newErrors.reason = 'Please select a reason'
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required'
    if (!formData.message.trim()) newErrors.message = 'Message is required'
    else if (formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: 'Message sent successfully!',
        description: "We'll get back to you within 24-48 hours.",
      })
      // Reset form
      setFormData({
        name: '',
        email: '',
        reason: '',
        subject: '',
        message: '',
      })
    }, 2000)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-primary to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
            <p className="text-xl text-blue-100">
              Have questions? We&apos;re here to help and would love to hear from you.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we&apos;ll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="John Doe"
                        className={errors.name ? 'border-red-500' : ''}
                      />
                      {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="john@example.com"
                        className={errors.email ? 'border-red-500' : ''}
                      />
                      {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason for Contact *</Label>
                    <Select
                      value={formData.reason}
                      onValueChange={(value) => handleChange('reason', value)}
                    >
                      <SelectTrigger className={errors.reason ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                      <SelectContent>
                        {contactReasons.map((reason) => (
                          <SelectItem key={reason.value} value={reason.value}>
                            {reason.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.reason && <p className="text-sm text-red-500">{errors.reason}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                      placeholder="Brief description of your inquiry"
                      className={errors.subject ? 'border-red-500' : ''}
                    />
                    {errors.subject && <p className="text-sm text-red-500">{errors.subject}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      placeholder="Tell us more about how we can help you..."
                      rows={6}
                      className={errors.message ? 'border-red-500' : ''}
                    />
                    {errors.message && <p className="text-sm text-red-500">{errors.message}</p>}
                  </div>

                  <Button type="submit" size="lg" className="w-full md:w-auto" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Quick Contact */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Quick Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-brand-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-neutral-800">Email</p>
                    <a
                      href="mailto:support@globalexpat.com"
                      className="text-brand-primary hover:underline"
                    >
                      support@globalexpat.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-brand-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-neutral-800">Phone</p>
                    <p className="text-neutral-600">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-brand-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-neutral-800">Response Time</p>
                    <p className="text-neutral-600">24-48 hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQs */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600 mb-4">
                  Before contacting us, you might find your answer in our:
                </p>
                <div className="space-y-2">
                  <a href="/help" className="block text-brand-primary hover:underline">
                    → Help Center
                  </a>
                  <a href="/help#faq" className="block text-brand-primary hover:underline">
                    → Frequently Asked Questions
                  </a>
                  <a href="/help#shipping" className="block text-brand-primary hover:underline">
                    → Shipping Information
                  </a>
                  <a href="/help#returns" className="block text-brand-primary hover:underline">
                    → Returns & Refunds
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Follow Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600 mb-4">
                  Stay connected and get updates on social media
                </p>
                <div className="flex gap-4">
                  <Button variant="outline" size="icon">
                    <span className="sr-only">Facebook</span>f
                  </Button>
                  <Button variant="outline" size="icon">
                    <span className="sr-only">Twitter</span>X
                  </Button>
                  <Button variant="outline" size="icon">
                    <span className="sr-only">Instagram</span>i
                  </Button>
                  <Button variant="outline" size="icon">
                    <span className="sr-only">LinkedIn</span>
                    in
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Office Locations */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-neutral-800 mb-6">Our Offices</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {offices.map((office, index) => (
              <Card key={index} className="bg-white shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-brand-primary mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-neutral-800 mb-2">{office.location}</h3>
                      <p className="text-sm text-neutral-600 mb-1">{office.address}</p>
                      <p className="text-sm text-neutral-600 mb-1">{office.phone}</p>
                      <p className="text-sm text-neutral-600">{office.hours}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
