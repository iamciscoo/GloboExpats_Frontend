'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CreditCard, AlertCircle, Truck, CheckCircle2, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useCart } from '@/hooks/use-cart'
import { useAuth } from '@/hooks/use-auth'
import { useVerification } from '@/hooks/use-verification'

interface ShippingAddress {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  postalCode: string
  instructions?: string
}

interface PaymentMethod {
  id: string
  type: 'card' | 'mobile' | 'bank' | 'cash'
  name: string
  description: string
  icon: string
  popular?: boolean
}

// Enhanced payment methods for East African mobile money priority
const paymentMethods: PaymentMethod[] = [
  {
    id: 'mpesa',
    type: 'mobile',
    name: 'M-Pesa',
    description: 'Most popular mobile money in Kenya',
    icon: '📱',
    popular: true,
  },
  {
    id: 'airtel',
    type: 'mobile',
    name: 'Airtel Money',
    description: 'Airtel mobile money service',
    icon: '💰',
  },
  {
    id: 'mixx',
    type: 'mobile',
    name: 'Mixx By Yas',
    description: 'Yas mobile payment solution',
    icon: '🔥',
  },
  {
    id: 'card',
    type: 'card',
    name: 'Credit/Debit Card',
    description: 'Visa, Mastercard, and local cards',
    icon: '💳',
  },
]

// Simplified East African countries for startup launch
const eastAfricanCountries = [
  { code: 'KE', name: 'Kenya', currency: 'KES', flag: '🇰🇪', phoneCode: '+254' },
  { code: 'TZ', name: 'Tanzania', currency: 'TZS', flag: '🇹🇿', phoneCode: '+255' },
  { code: 'UG', name: 'Uganda', currency: 'UGX', flag: '🇺🇬', phoneCode: '+256' },
]

// Major cities for simplified selection
const majorCities = {
  KE: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'],
  TZ: ['Dar es Salaam', 'Dodoma', 'Mwanza', 'Arusha'],
  UG: ['Kampala', 'Gulu', 'Mbarara', 'Jinja'],
}

export default function CheckoutPage() {
  const router = useRouter()
  const { user, isLoggedIn, isLoading: authLoading } = useAuth()
  const { items, subtotal, clearCart, selectedItems, selectedItemsData, selectedSubtotal } =
    useCart()
  const { checkVerification } = useVerification()

  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [selectedCountry, setSelectedCountry] = useState('KE') // Default to Kenya

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: user?.name.split(' ')[0] || '',
    lastName: user?.name.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    country: 'Kenya',
    postalCode: '',
    instructions: '',
  })

  const [selectedPayment, setSelectedPayment] = useState('mpesa')
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [shippingMethod, setShippingMethod] = useState('delivery')

  // Payment details state
  const [paymentDetails, setPaymentDetails] = useState({
    mobileNumber: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  })

  // Use selected items for checkout calculations
  const checkoutItems = selectedItemsData.length > 0 ? selectedItemsData : items
  const checkoutSubtotal = selectedItemsData.length > 0 ? selectedSubtotal : subtotal
  const selectedCountryData = eastAfricanCountries.find((c) => c.code === selectedCountry)
  const availableCities = majorCities[selectedCountry as keyof typeof majorCities] || []

  // Simplified shipping for local startup
  const shippingOptions = [
    {
      id: 'delivery',
      name: 'Local Delivery',
      time: '1-2 days',
      price: 500,
      description: 'Within city delivery',
      icon: '🚚',
    },
    {
      id: 'pickup',
      name: 'Meet Seller',
      time: 'Same day',
      price: 0,
      description: 'Meet at agreed location',
      icon: '🤝',
    },
  ]

  const selectedShippingOption = shippingOptions.find((opt) => opt.id === shippingMethod)
  const shippingCost = selectedShippingOption?.price || 0
  const totalAmount = checkoutSubtotal + shippingCost

  // Format currency based on selected country
  const formatPrice = (amount: number) => {
    const currency = selectedCountryData?.currency || 'KES'
    return `${currency} ${amount.toLocaleString()}`
  }

  // Comprehensive authentication and verification checks
  useEffect(() => {
    if (!authLoading) {
      if (!isLoggedIn) {
        router.push('/login?redirect=/checkout')
        return
      }

      if (items.length === 0) {
        router.push('/cart')
        return
      }

      if (selectedItems.length === 0 && items.length > 0) {
        router.push('/cart?error=no-items-selected')
        return
      }

      if (!checkVerification('buy')) {
        return
      }

      setAuthChecked(true)
    }
  }, [authLoading, isLoggedIn, items.length, selectedItems.length, router, checkVerification])

  // Show loading state while checking authentication
  if (authLoading || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center bg-white p-12 rounded-3xl shadow-futuristic border border-neutral-200">
          <div className="w-20 h-20 border-6 border-neutral-400 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Preparing Your Checkout</h2>
          <p className="text-gray-600 text-lg">Setting up secure payment...</p>
        </div>
      </div>
    )
  }

  // Don't render if user doesn't have access
  if (!isLoggedIn || items.length === 0 || selectedItems.length === 0) {
    return null
  }

  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }))
  }

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode)
    const country = eastAfricanCountries.find((c) => c.code === countryCode)
    handleAddressChange('country', country?.name || '')
    handleAddressChange('city', '') // Reset city when country changes
  }

  const validateStep = (step: number) => {
    if (step === 1) {
      return (
        shippingAddress.firstName &&
        shippingAddress.lastName &&
        shippingAddress.email &&
        shippingAddress.phone &&
        shippingAddress.address &&
        shippingAddress.city &&
        shippingAddress.country
      )
    }
    if (step === 2) {
      const hasPaymentMethod = selectedPayment && agreeToTerms

      if (!hasPaymentMethod) return false

      // Validate mobile money payment details
      if (['mpesa', 'airtel', 'mixx'].includes(selectedPayment)) {
        return paymentDetails.mobileNumber.trim() !== ''
      }

      // Validate card payment details
      if (selectedPayment === 'card') {
        return (
          paymentDetails.cardNumber.trim() !== '' &&
          paymentDetails.cardholderName.trim() !== '' &&
          paymentDetails.expiryDate.trim() !== '' &&
          paymentDetails.cvv.trim() !== ''
        )
      }

      return true
    }
    return true
  }

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3))
    }
  }

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handlePlaceOrder = async () => {
    if (!validateStep(2) || !agreeToTerms) return

    setIsProcessing(true)
    setOrderError(null)

    try {
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

      const orderData = {
        id: orderId,
        status: 'confirmed',
        date: new Date().toISOString(),
        estimatedDelivery: shippingMethod === 'pickup' ? 'Same day pickup' : '1-2 business days',
        total: totalAmount,
        currency: selectedCountryData?.currency || 'KES',
        paymentMethod: paymentMethods.find((p) => p.id === selectedPayment)?.name || 'Unknown',
        items: checkoutItems.map((item) => ({
          id: item.id,
          title: item.title,
          price: item.price * item.quantity,
          quantity: item.quantity,
          image: item.image,
          seller: item.expatName,
          sellerVerified: item.verified,
        })),
        shippingAddress: {
          name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
          address: shippingAddress.address,
          city: shippingAddress.city,
          country: shippingAddress.country,
        },
        tracking: {
          enabled: shippingMethod === 'delivery',
          number: shippingMethod === 'delivery' ? `TRK${Date.now()}` : undefined,
        },
        shippingMethod,
        shippingCost,
      }

      localStorage.setItem(`order_${orderId}`, JSON.stringify(orderData))
      await new Promise((resolve) => setTimeout(resolve, 2000))

      clearCart()
      router.push(`/checkout/success?orderId=${orderId}`)
    } catch (error) {
      console.error('Order failed:', error)
      setOrderError('Failed to process order. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Modern Header */}
        <div className="bg-surface-elevated rounded-3xl shadow-futuristic border border-neutral-200 p-10 mb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/cart">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-neutral-300 hover:border-brand-primary hover:bg-brand-primary/5 text-neutral-700 hover:text-brand-primary rounded-2xl px-6 py-3 font-semibold transition-all duration-300"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Cart
                </Button>
              </Link>
            </div>
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-6">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center font-semibold transition-all duration-200 ${
                        step <= currentStep
                          ? 'bg-brand-primary text-white'
                          : 'bg-neutral-200 text-neutral-500'
                      }`}
                    >
                      {step}
                    </div>
                    {step < 3 && (
                      <div
                        className={`w-12 h-1 mx-3 rounded-full transition-all duration-200 ${
                          step < currentStep ? 'bg-brand-primary' : 'bg-neutral-200'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-8 space-x-24 text-lg">
            <span
              className={`font-display font-bold transition-all duration-300 ${currentStep >= 1 ? 'text-brand-primary text-xl' : 'text-neutral-500'}`}
            >
              🚚 Shipping Details
            </span>
            <span
              className={`font-display font-bold transition-all duration-300 ${currentStep >= 2 ? 'text-brand-primary text-xl' : 'text-neutral-500'}`}
            >
              💳 Payment Method
            </span>
            <span
              className={`font-display font-bold transition-all duration-300 ${currentStep >= 3 ? 'text-brand-primary text-xl' : 'text-neutral-500'}`}
            >
              ✅ Confirm Order
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Error Display */}
            {orderError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{orderError}</AlertDescription>
              </Alert>
            )}

            {/* Step 1: Shipping Address */}
            {currentStep === 1 && (
              <Card className="shadow-futuristic border border-neutral-200 rounded-3xl overflow-hidden">
                <CardHeader className="bg-neutral-50 border-b border-neutral-200 text-neutral-900 p-8">
                  <CardTitle className="flex items-center gap-4 text-3xl font-display font-bold">
                    <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center">
                      <Truck className="w-7 h-7 text-brand-primary" />
                    </div>
                    Shipping Address
                  </CardTitle>
                  <p className="text-neutral-600 mt-3 text-lg">
                    Where should we deliver your items?
                  </p>
                </CardHeader>
                <CardContent className="space-y-10 p-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <Label htmlFor="firstName" className="text-lg font-semibold text-neutral-800">
                        First Name *
                      </Label>
                      <Input
                        id="firstName"
                        value={shippingAddress.firstName}
                        onChange={(e) => handleAddressChange('firstName', e.target.value)}
                        placeholder="Enter first name"
                        className="h-14 text-lg border-2 border-neutral-300 rounded-2xl focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all duration-300 bg-surface-elevated"
                      />
                    </div>
                    <div className="space-y-4">
                      <Label htmlFor="lastName" className="text-lg font-semibold text-neutral-800">
                        Last Name *
                      </Label>
                      <Input
                        id="lastName"
                        value={shippingAddress.lastName}
                        onChange={(e) => handleAddressChange('lastName', e.target.value)}
                        placeholder="Enter last name"
                        className="h-14 text-lg border-2 border-neutral-300 rounded-2xl focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all duration-300 bg-surface-elevated"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={shippingAddress.email}
                        onChange={(e) => handleAddressChange('email', e.target.value)}
                        placeholder="your@email.com"
                        className="border-2 focus:border-brand-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={shippingAddress.phone}
                        onChange={(e) => handleAddressChange('phone', e.target.value)}
                        placeholder="+254 700 123 456"
                        className="border-2 focus:border-brand-primary"
                      />
                      <p className="text-xs text-neutral-500">
                        Include country code (e.g., +254 for Kenya, +255 for Tanzania)
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      value={shippingAddress.address}
                      onChange={(e) => handleAddressChange('address', e.target.value)}
                      placeholder="Building name, street, area/estate"
                      className="border-2 focus:border-brand-primary"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <select
                        id="country"
                        value={selectedCountry}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-neutral-200 rounded-md focus:border-brand-primary focus:outline-none"
                      >
                        {eastAfricanCountries.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.flag} {country.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <select
                        id="city"
                        value={shippingAddress.city}
                        onChange={(e) => handleAddressChange('city', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-neutral-200 rounded-md focus:border-brand-primary focus:outline-none"
                      >
                        <option value="">Select a city</option>
                        {availableCities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        value={shippingAddress.postalCode}
                        onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                        placeholder="00100"
                        className="border-2 focus:border-brand-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instructions">Delivery Instructions (Optional)</Label>
                    <Textarea
                      id="instructions"
                      value={shippingAddress.instructions}
                      onChange={(e) => handleAddressChange('instructions', e.target.value)}
                      placeholder="Any special delivery instructions..."
                      rows={3}
                    />
                  </div>

                  {/* Shipping Options */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Delivery Method</Label>
                    <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                      {shippingOptions.map((option) => (
                        <div
                          key={option.id}
                          className="flex items-start space-x-3 p-4 border-2 rounded-lg hover:bg-neutral-50 hover:border-brand-primary/50 transition-all duration-200"
                        >
                          <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <Label
                                htmlFor={option.id}
                                className="font-medium cursor-pointer flex items-center gap-2"
                              >
                                <span className="text-xl">{option.icon}</span>
                                {option.name}
                              </Label>
                              <div className="text-right">
                                <span className="font-semibold text-lg">
                                  {option.price === 0
                                    ? 'Free'
                                    : `${selectedCountryData?.currency || 'KES'} ${option.price.toLocaleString()}`}
                                </span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-neutral-600 font-medium">{option.time}</p>
                              <p className="text-sm text-neutral-600">{option.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Payment Method */}
            {currentStep === 2 && (
              <Card className="shadow-futuristic border border-neutral-200 rounded-3xl overflow-hidden">
                <CardHeader className="bg-neutral-50 border-b border-neutral-200 pb-6">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-neutral-100 rounded-lg">
                      <CreditCard className="w-6 h-6 text-brand-primary" />
                    </div>
                    Payment Method
                  </CardTitle>
                  <p className="text-neutral-600 mt-2">Choose your preferred payment option</p>
                </CardHeader>
                <CardContent className="space-y-8 p-8">
                  <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`relative flex items-center space-x-4 p-6 border-2 rounded-2xl transition-all duration-300 cursor-pointer ${
                          selectedPayment === method.id
                            ? 'border-brand-primary bg-neutral-50 shadow-sm'
                            : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                        }`}
                      >
                        <RadioGroupItem
                          value={method.id}
                          id={method.id}
                          className="w-5 h-5 border-2"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <div className="text-3xl flex-shrink-0">{method.icon}</div>
                            <div className="min-w-0">
                              <Label
                                htmlFor={method.id}
                                className="font-semibold text-neutral-900 cursor-pointer"
                              >
                                {method.name}
                              </Label>
                              <p className="text-sm text-neutral-600">{method.description}</p>
                            </div>
                          </div>
                        </div>
                        {selectedPayment === method.id && (
                          <div className="absolute top-3 right-3">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                          </div>
                        )}
                      </div>
                    ))}
                  </RadioGroup>

                  {/* Mobile Money Payment Details */}
                  {(selectedPayment === 'mpesa' ||
                    selectedPayment === 'airtel' ||
                    selectedPayment === 'mixx') && (
                    <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-200 mt-6">
                      <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                        📱 Mobile Money Details
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <Label
                            htmlFor="mobileNumber"
                            className="text-base font-semibold text-gray-700"
                          >
                            Mobile Number *
                          </Label>
                          <Input
                            id="mobileNumber"
                            type="tel"
                            value={paymentDetails.mobileNumber}
                            onChange={(e) =>
                              setPaymentDetails((prev) => ({
                                ...prev,
                                mobileNumber: e.target.value,
                              }))
                            }
                            placeholder={selectedCountryData?.phoneCode + ' 700 123 456'}
                            className="h-12 text-lg border-2 border-neutral-300 rounded-xl focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-200 mt-2"
                          />
                          <p className="text-sm text-neutral-700 mt-2">
                            📞 Enter the mobile number registered with{' '}
                            {paymentMethods.find((p) => p.id === selectedPayment)?.name}
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border-2 border-neutral-200">
                          <h4 className="font-semibold text-neutral-900 mb-2">
                            💡 Payment Instructions:
                          </h4>
                          <ul className="space-y-1 text-sm text-neutral-700">
                            <li>• You'll receive a payment prompt on your phone</li>
                            <li>• Enter your mobile money PIN to complete payment</li>
                            <li>• Payment confirmation will be sent via SMS</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Credit/Debit Card Payment Details */}
                  {selectedPayment === 'card' && (
                    <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-200 mt-6">
                      <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                        💳 Card Details
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <Label
                            htmlFor="cardholderName"
                            className="text-base font-semibold text-gray-700"
                          >
                            Cardholder Name *
                          </Label>
                          <Input
                            id="cardholderName"
                            value={paymentDetails.cardholderName}
                            onChange={(e) =>
                              setPaymentDetails((prev) => ({
                                ...prev,
                                cardholderName: e.target.value,
                              }))
                            }
                            placeholder="John Doe"
                            className="h-12 text-lg border-2 border-neutral-300 rounded-xl focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-200 mt-2"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="cardNumber"
                            className="text-base font-semibold text-gray-700"
                          >
                            Card Number *
                          </Label>
                          <Input
                            id="cardNumber"
                            value={paymentDetails.cardNumber}
                            onChange={(e) =>
                              setPaymentDetails((prev) => ({ ...prev, cardNumber: e.target.value }))
                            }
                            placeholder="1234 5678 9012 3456"
                            className="h-12 text-lg border-2 border-neutral-300 rounded-xl focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-200 mt-2"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label
                              htmlFor="expiryDate"
                              className="text-base font-semibold text-gray-700"
                            >
                              Expiry Date *
                            </Label>
                            <Input
                              id="expiryDate"
                              value={paymentDetails.expiryDate}
                              onChange={(e) =>
                                setPaymentDetails((prev) => ({
                                  ...prev,
                                  expiryDate: e.target.value,
                                }))
                              }
                              placeholder="MM/YY"
                              className="h-12 text-lg border-2 border-neutral-300 rounded-xl focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-200 mt-2"
                            />
                          </div>
                          <div>
                            <Label htmlFor="cvv" className="text-base font-semibold text-gray-700">
                              CVV *
                            </Label>
                            <Input
                              id="cvv"
                              value={paymentDetails.cvv}
                              onChange={(e) =>
                                setPaymentDetails((prev) => ({ ...prev, cvv: e.target.value }))
                              }
                              placeholder="123"
                              className="h-12 text-lg border-2 border-neutral-300 rounded-xl focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-200 mt-2"
                            />
                          </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border-2 border-neutral-200">
                          <h4 className="font-semibold text-neutral-900 mb-2">
                            🔒 Secure Payment:
                          </h4>
                          <ul className="space-y-1 text-sm text-neutral-700">
                            <li>• Your card details are encrypted and secure</li>
                            <li>• We accept Visa, Mastercard, and local bank cards</li>
                            <li>• Payment is processed by our secure payment partner</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Terms and Conditions */}
                  <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-200 mt-6">
                    <div className="flex items-start space-x-4">
                      <Checkbox
                        id="terms"
                        checked={agreeToTerms}
                        onCheckedChange={(checked) => setAgreeToTerms(!!checked)}
                        className="mt-1 w-5 h-5"
                      />
                      <div className="text-base">
                        <Label htmlFor="terms" className="cursor-pointer font-medium">
                          I agree to the{' '}
                          <Link
                            href="/terms"
                            className="text-brand-primary hover:text-brand-primary/80 underline font-semibold"
                          >
                            Terms & Conditions
                          </Link>{' '}
                          and{' '}
                          <Link
                            href="/privacy"
                            className="text-brand-primary hover:text-brand-primary/80 underline font-semibold"
                          >
                            Privacy Policy
                          </Link>
                        </Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Review Order */}
            {currentStep === 3 && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Review Your Order
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Shipping Summary */}
                  <div>
                    <h4 className="font-medium mb-2">Shipping Address</h4>
                    <div className="text-sm text-neutral-600 space-y-1">
                      <p>
                        {shippingAddress.firstName} {shippingAddress.lastName}
                      </p>
                      <p>{shippingAddress.address}</p>
                      <p>
                        {shippingAddress.city}, {shippingAddress.country}{' '}
                        {shippingAddress.postalCode}
                      </p>
                      <p>{shippingAddress.phone}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Payment Summary */}
                  <div>
                    <h4 className="font-medium mb-2">Payment Method</h4>
                    <p className="text-sm text-neutral-600">
                      {paymentMethods.find((m) => m.id === selectedPayment)?.name}
                    </p>
                  </div>

                  <Separator />

                  {/* Items Summary */}
                  <div>
                    <h4 className="font-medium mb-4">Order Items ({checkoutItems.length})</h4>
                    <div className="space-y-3">
                      {checkoutItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-3 border rounded-lg"
                        >
                          <div className="relative w-16 h-16 bg-neutral-100 rounded overflow-hidden">
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-sm line-clamp-1">{item.title}</h5>
                            <p className="text-xs text-neutral-500">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-12 p-6 bg-neutral-50 rounded-2xl border border-neutral-200">
              <Button
                variant="outline"
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                size="lg"
                className="px-8 py-4 text-lg font-semibold border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-100 disabled:opacity-50 rounded-xl"
              >
                <ArrowLeft className="w-5 h-5 mr-3" />
                Previous Step
              </Button>

              {currentStep < 3 ? (
                <Button
                  onClick={handleNextStep}
                  disabled={!validateStep(currentStep)}
                  size="lg"
                  className="px-10 py-4 text-lg font-bold bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to {currentStep === 1 ? 'Payment' : 'Review'}
                  <ArrowLeft className="w-5 h-5 ml-3 rotate-180" />
                </Button>
              ) : (
                <Button
                  onClick={handlePlaceOrder}
                  disabled={!agreeToTerms || isProcessing}
                  size="lg"
                  className="px-12 py-4 text-xl font-bold bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 mr-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      🎉 Complete Purchase
                      <CheckCircle2 className="w-6 h-6 ml-3" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <Card className="shadow-futuristic border border-neutral-200 rounded-3xl overflow-hidden">
                <CardHeader className="bg-neutral-50 border-b border-neutral-200 p-6">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-neutral-100 rounded-full">
                      <span className="text-2xl">🛒</span>
                    </div>
                    Order Summary
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="bg-white px-3 py-1 rounded-full border-2 border-neutral-200">
                      <span className="text-sm font-bold text-neutral-700">
                        {checkoutItems.length} item{checkoutItems.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="bg-white px-3 py-1 rounded-full border-2 border-neutral-200">
                      <span className="text-sm font-bold text-neutral-700">
                        {selectedCountryData?.flag} {selectedCountryData?.name}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between text-lg p-3 bg-gray-50 rounded-xl">
                      <span className="font-medium">Subtotal ({checkoutItems.length} items)</span>
                      <span className="font-bold text-neutral-900">
                        {formatPrice(checkoutSubtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg p-3 bg-gray-50 rounded-xl">
                      <span className="flex items-center gap-2 font-medium">
                        <span className="text-xl">{selectedShippingOption?.icon}</span>
                        Shipping ({selectedShippingOption?.name})
                      </span>
                      <span className="font-bold text-neutral-900">
                        {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
                      </span>
                    </div>
                  </div>

                  <Separator className="my-6 border-2" />

                  <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-200">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-800">Total</span>
                      <span className="text-3xl font-bold text-brand-primary">
                        {formatPrice(totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Security Info */}
                  <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-200">
                    <h4 className="font-bold text-neutral-900 mb-4 text-lg flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      🔐 Secure Payment
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-neutral-700">
                        <div className="w-2 h-2 bg-brand-primary rounded-full"></div>
                        <span className="font-medium">SSL encrypted transactions</span>
                      </div>
                      <div className="flex items-center gap-3 text-neutral-700">
                        <div className="w-2 h-2 bg-brand-primary rounded-full"></div>
                        <span className="font-medium">Buyer protection guarantee</span>
                      </div>
                      <div className="flex items-center gap-3 text-neutral-700">
                        <div className="w-2 h-2 bg-brand-primary rounded-full"></div>
                        <span className="font-medium">Verified seller network</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
