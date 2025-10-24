'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CreditCard, AlertCircle, Truck, CheckCircle2, Shield, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/components/ui/use-toast'
import { useCart } from '@/hooks/use-cart'
import { useAuth } from '@/hooks/use-auth'
import { useVerification } from '@/hooks/use-verification'
import {
  processCheckout,
  mapPaymentMethod,
  mapDeliveryMethod,
  formatPhoneNumber,
  getCurrencyFromCountry,
  type CheckoutPayload,
} from '@/lib/checkout-service'
import PriceDisplay from '@/components/price-display'

interface ShippingAddress {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  country: string
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
    description: 'Mobile money payment',
    icon: 'CreditCard',
    popular: true,
  },
  {
    id: 'airtel',
    type: 'mobile',
    name: 'Airtel Money',
    description: 'Airtel mobile money service',
    icon: 'CreditCard',
  },
  {
    id: 'mixx',
    type: 'mobile',
    name: 'Mixx By Yas',
    description: 'Mobile payment solution',
    icon: 'CreditCard',
  },
  {
    id: 'card',
    type: 'card',
    name: 'Credit/Debit Card',
    description: 'Visa, Mastercard, and local cards',
    icon: 'CreditCard',
  },
]

// Simplified East African countries for delivery with flags
const eastAfricanCountries = [
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿', currency: 'TZS', phoneCode: '+255' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', currency: 'KES', phoneCode: '+254' },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬', currency: 'UGX', phoneCode: '+256' },
  { code: 'RW', name: 'Rwanda', flag: '🇷🇼', currency: 'RWF', phoneCode: '+250' },
]

// Major cities for simplified selection with flags
const majorCities = {
  TZ: [
    { name: 'Dar es Salaam', flag: '🇹🇿' },
    { name: 'Dodoma', flag: '🇹🇿' },
    { name: 'Mwanza', flag: '🇹🇿' },
    { name: 'Arusha', flag: '🇹🇿' },
    { name: 'Zanzibar', flag: '🇹🇿' },
    { name: 'Stone Town', flag: '🇹🇿' },
  ],
  KE: [
    { name: 'Nairobi', flag: '🇰🇪' },
    { name: 'Mombasa', flag: '🇰🇪' },
    { name: 'Kisumu', flag: '🇰🇪' },
    { name: 'Nakuru', flag: '🇰🇪' },
  ],
  UG: [
    { name: 'Kampala', flag: '🇺🇬' },
    { name: 'Gulu', flag: '🇺🇬' },
    { name: 'Mbarara', flag: '🇺🇬' },
    { name: 'Jinja', flag: '🇺🇬' },
    { name: 'Entebbe', flag: '🇺🇬' },
  ],
  RW: [{ name: 'Kigali', flag: '🇷🇼' }],
}

export default function CheckoutPage() {
  const router = useRouter()
  const { user, isLoggedIn, isLoading: authLoading } = useAuth()
  const { items, subtotal, clearCart, selectedItems, selectedItemsData, selectedSubtotal } =
    useCart()
  const { checkVerification } = useVerification()
  const { toast } = useToast()

  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [selectedCountry, setSelectedCountry] = useState('TZ') // Default to Tanzania

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: user?.name.split(' ')[0] || '',
    lastName: user?.name.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    country: 'Tanzania',
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
  const selectedCountryData = useMemo(
    () => eastAfricanCountries.find((c) => c.code === selectedCountry),
    [selectedCountry]
  )
  const availableCities = useMemo(
    () => majorCities[selectedCountry as keyof typeof majorCities] || [],
    [selectedCountry]
  )

  // Delivery options with Global Expat branding - memoized for performance
  const shippingOptions = useMemo(
    () => [
      {
        id: 'delivery',
        name: 'Arrange with Us',
        time: '1-2 days',
        price: 0, // Price varies based on location and will be determined later
        description: 'Within city delivery',
        isGloboExpat: true,
        priceDisplay: 'Varies',
      },
      {
        id: 'pickup',
        name: 'Arrange with Seller',
        time: 'Same day',
        price: 0,
        description: 'Meet at agreed location',
        isGloboExpat: false,
        priceDisplay: 'Free',
      },
    ],
    []
  )

  const selectedShippingOption = useMemo(
    () => shippingOptions.find((opt) => opt.id === shippingMethod),
    [shippingOptions, shippingMethod]
  )
  // Delivery cost will be determined separately (currently not charged)
  // const shippingCost = 0
  const totalAmount = checkoutSubtotal // No shipping cost added to checkout total

  // Format currency based on selected country
  const formatPrice = (amount: number) => {
    const currency = selectedCountryData?.currency || 'TZS'
    return `${currency} ${amount.toLocaleString()}`
  }

  // Handler functions - defined before any early returns (Rules of Hooks)
  const handleAddressChange = useCallback((field: keyof ShippingAddress, value: string) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleCountryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryCode = e.target.value
    const country = eastAfricanCountries.find((c) => c.code === countryCode)

    // Batch all state updates together for better performance
    setSelectedCountry(countryCode)
    if (country) {
      setShippingAddress((prev) => ({
        ...prev,
        country: country.name,
        city: '', // Reset city when country changes
      }))
    }
    // Note: Currency display updates automatically via selectedCountryData
    // but doesn't affect cart prices or any stored values
  }, [])

  const handleCityChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setShippingAddress((prev) => ({ ...prev, city: e.target.value }))
  }, [])

  // Comprehensive authentication and verification checks
  useEffect(() => {
    // Set authChecked immediately if conditions are met to avoid loading delay
    if (!authLoading && isLoggedIn && items.length > 0 && selectedItems.length > 0) {
      setAuthChecked(true)
    }

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
    }
  }, [authLoading, isLoggedIn, items.length, selectedItems.length, router, checkVerification])

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep])

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
      // Show processing toast
      toast({
        title: 'Processing Payment',
        description: 'Please wait while we process your payment...',
        variant: 'default',
      })

      // Prepare checkout data for ZenoPay backend
      const checkoutPayload: CheckoutPayload = {
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        emailAddress: shippingAddress.email,
        phoneNumber: formatPhoneNumber(shippingAddress.phone),
        address: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.city, // Using city as state for East African context
        country: shippingAddress.country,
        zipCode: '0000', // Default zip code for East African countries
        deliveryInstructions: shippingAddress.instructions || '',
        deliveryMethod: mapDeliveryMethod(shippingMethod),
        paymentMethod: mapPaymentMethod(selectedPayment),
        agreeToTerms: agreeToTerms,
        totalAmount: totalAmount,
        currency: selectedCountryData?.currency || getCurrencyFromCountry(selectedCountry),
      }

      // Process checkout with ZenoPay
      const checkoutResponse = await processCheckout(checkoutPayload)

      if (!checkoutResponse.success) {
        throw new Error(checkoutResponse.error || 'Payment processing failed')
      }

      // Success toast
      toast({
        title: 'Payment Processing',
        description: checkoutResponse.message || 'Your payment is being processed.',
        variant: 'default',
      })

      // If payment URL is provided, redirect to payment gateway
      if (checkoutResponse.paymentUrl) {
        // Store order details in localStorage for return handling
        localStorage.setItem(
          'pendingOrder',
          JSON.stringify({
            orderId: checkoutResponse.orderId,
            transactionId: checkoutResponse.transactionId,
            totalAmount: totalAmount,
            currency: checkoutPayload.currency,
            items: checkoutItems.map((item) => ({
              productId: item.productId,
              name: item.title,
              quantity: item.quantity,
              price: item.price,
            })),
          })
        )

        // Clear cart before redirecting to payment
        clearCart()

        // Show redirect toast
        toast({
          title: 'Redirecting to Payment',
          description: 'You will be redirected to complete your payment...',
          variant: 'default',
        })

        // Small delay for user to see the toast
        setTimeout(() => {
          window.location.href = checkoutResponse.paymentUrl!
        }, 1500)
        return
      }

      // If no payment URL, payment was processed directly
      // Clear cart after successful checkout
      clearCart()

      // Success toast for direct payment
      toast({
        title: 'Payment Successful!',
        description: 'Your order has been placed successfully.',
        variant: 'default',
      })

      // Redirect to success page with transaction details
      const successUrl = new URL('/checkout/success', window.location.origin)
      if (checkoutResponse.orderId) {
        successUrl.searchParams.set('orderId', checkoutResponse.orderId)
      }
      if (checkoutResponse.transactionId) {
        successUrl.searchParams.set('transactionId', checkoutResponse.transactionId)
      }

      router.push(successUrl.toString())
    } catch (error) {
      console.error('Checkout failed:', error)
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Payment processing failed. Please try again or contact support.'

      setOrderError(errorMessage)

      // Error toast
      toast({
        title: 'Payment Failed',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl">
        {/* Modern Header */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <Link href="/cart">
              <Button
                variant="outline"
                size="sm"
                className="border border-neutral-300 hover:border-brand-primary hover:bg-neutral-50 text-neutral-700 text-xs sm:text-sm"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back to Cart</span>
                <span className="sm:hidden">Cart</span>
              </Button>
            </Link>
            <h1 className="text-lg sm:text-2xl font-semibold text-neutral-900">Checkout</h1>
            <div className="w-16 sm:w-24"></div> {/* Spacer for centering */}
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-2 sm:space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-medium transition-all text-sm sm:text-base ${
                    step <= currentStep
                      ? 'bg-brand-primary text-white'
                      : 'bg-neutral-200 text-neutral-500'
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-8 sm:w-16 h-0.5 mx-1 sm:mx-2 ${
                      step < currentStep ? 'bg-brand-primary' : 'bg-neutral-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Labels */}
          <div className="flex justify-center gap-10 sm:gap-20 mt-3 sm:mt-4">
            <span
              className={`text-xs sm:text-sm font-medium transition-colors ${
                currentStep >= 1 ? 'text-brand-primary' : 'text-neutral-500'
              }`}
            >
              Shipping
            </span>
            <span
              className={`text-xs sm:text-sm font-medium transition-colors ${
                currentStep >= 2 ? 'text-brand-primary' : 'text-neutral-500'
              }`}
            >
              Payment
            </span>
            <span
              className={`text-xs sm:text-sm font-medium transition-colors ${
                currentStep >= 3 ? 'text-brand-primary' : 'text-neutral-500'
              }`}
            >
              Review
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
              <Card className="shadow-sm border border-neutral-200 rounded-xl overflow-hidden">
                <CardHeader className="bg-neutral-50 border-b border-neutral-200 p-6">
                  <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                    <div className="p-2 bg-neutral-100 rounded-lg flex items-center justify-center">
                      <Truck className="w-5 h-5 text-brand-primary" />
                    </div>
                    Delivery Address
                  </CardTitle>
                  <p className="text-neutral-600 mt-2 text-sm">
                    Where should we deliver your items?
                  </p>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium text-neutral-700">
                        First Name *
                      </Label>
                      <Input
                        id="firstName"
                        value={shippingAddress.firstName}
                        onChange={(e) => handleAddressChange('firstName', e.target.value)}
                        placeholder="Enter first name"
                        className="h-10 border-2 border-neutral-300 rounded-lg focus:border-brand-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium text-neutral-700">
                        Last Name *
                      </Label>
                      <Input
                        id="lastName"
                        value={shippingAddress.lastName}
                        onChange={(e) => handleAddressChange('lastName', e.target.value)}
                        placeholder="Enter last name"
                        className="h-10 border-2 border-neutral-300 rounded-lg focus:border-brand-primary"
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
                        placeholder="+255 700 123 456"
                        className="border-2 focus:border-brand-primary"
                      />
                      <p className="text-xs text-neutral-500">
                        Include country code (e.g., +255 for Tanzania, +254 for Kenya)
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <select
                        id="country"
                        value={selectedCountry}
                        onChange={handleCountryChange}
                        className="w-full h-11 px-3 py-2 border-2 border-neutral-200 rounded-md focus:border-brand-primary focus:outline-none bg-white appearance-none cursor-pointer transition-colors"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: 'right 0.5rem center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '1.5em 1.5em',
                          paddingRight: '2.5rem',
                        }}
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
                        onChange={handleCityChange}
                        className="w-full h-11 px-3 py-2 border-2 border-neutral-200 rounded-md focus:border-brand-primary focus:outline-none bg-white appearance-none cursor-pointer transition-colors"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: 'right 0.5rem center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '1.5em 1.5em',
                          paddingRight: '2.5rem',
                        }}
                      >
                        <option value="">Select a city</option>
                        {availableCities.map((city) => (
                          <option key={city.name} value={city.name}>
                            {city.flag} {city.name}
                          </option>
                        ))}
                      </select>
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
                        <label
                          key={option.id}
                          htmlFor={option.id}
                          className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-neutral-50 hover:border-brand-primary/50 transition-all duration-200 ${
                            option.isGloboExpat
                              ? 'bg-gradient-to-r from-brand-primary/5 to-brand-secondary/5 border-brand-primary/30'
                              : ''
                          } ${
                            shippingMethod === option.id
                              ? 'border-brand-primary bg-brand-primary/5'
                              : 'border-neutral-200'
                          }`}
                        >
                          <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div
                                className={`font-medium flex items-center gap-2 ${
                                  option.isGloboExpat ? 'text-brand-primary' : ''
                                }`}
                              >
                                {option.isGloboExpat && (
                                  <span className="inline-flex items-center text-xs font-bold bg-brand-primary text-white px-2 py-0.5 rounded">
                                    Globo<span className="text-brand-secondary">expat</span>
                                  </span>
                                )}
                                {option.name}
                              </div>
                              <div className="text-right">
                                <span
                                  className={`font-semibold text-lg ${option.isGloboExpat ? 'text-brand-primary' : 'text-neutral-600'}`}
                                >
                                  {option.priceDisplay || 'Varies'}
                                </span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-neutral-600 font-medium">{option.time}</p>
                              <p className="text-sm text-neutral-600">{option.description}</p>
                            </div>
                          </div>
                        </label>
                      ))}
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Payment Method */}
            {currentStep === 2 && (
              <Card className="shadow-sm border border-neutral-200 rounded-xl overflow-hidden">
                <CardHeader className="bg-neutral-50 border-b border-neutral-200 p-6">
                  <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                    <div className="p-2 bg-neutral-100 rounded-lg">
                      <CreditCard className="w-5 h-5 text-brand-primary" />
                    </div>
                    Payment Method
                  </CardTitle>
                  <p className="text-neutral-600 mt-2 text-sm">
                    Choose your preferred payment option
                  </p>
                </CardHeader>
                <CardContent className="space-y-3 p-4 sm:p-6">
                  <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        onClick={() => setSelectedPayment(method.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            setSelectedPayment(method.id)
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        className={`relative flex items-center gap-3 sm:gap-4 p-4 sm:p-5 border-2 rounded-xl transition-all duration-300 cursor-pointer ${
                          selectedPayment === method.id
                            ? 'border-brand-primary bg-blue-50/50 shadow-sm'
                            : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                        }`}
                      >
                        <RadioGroupItem
                          value={method.id}
                          id={method.id}
                          className="w-5 h-5 border-2 flex-shrink-0"
                        />
                        {method.type === 'card' && (
                          <div className="p-2 bg-neutral-100 rounded-lg flex-shrink-0">
                            <CreditCard className="w-5 h-5 text-brand-primary" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <Label
                            htmlFor={method.id}
                            className="font-semibold text-neutral-900 cursor-pointer text-base"
                          >
                            {method.name}
                          </Label>
                          <p className="text-sm text-neutral-600 mt-0.5">{method.description}</p>
                        </div>
                        {selectedPayment === method.id && (
                          <div className="flex-shrink-0">
                            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                          </div>
                        )}
                      </div>
                    ))}
                  </RadioGroup>

                  {/* Mobile Money Payment Details */}
                  {(selectedPayment === 'mpesa' ||
                    selectedPayment === 'airtel' ||
                    selectedPayment === 'mixx') && (
                    <div className="p-4 sm:p-6 bg-neutral-50 rounded-xl border border-neutral-200 mt-3">
                      <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-3 sm:mb-4">
                        Mobile Money Details
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
                            className="h-10 border-2 border-neutral-300 rounded-lg focus:border-brand-primary mt-2"
                          />
                          <p className="text-sm text-neutral-700 mt-2">
                            Enter the mobile number registered with{' '}
                            {paymentMethods.find((p) => p.id === selectedPayment)?.name}
                          </p>
                        </div>
                        <div className="bg-white p-3 sm:p-4 rounded-xl border border-neutral-200">
                          <h4 className="font-semibold text-neutral-900 mb-2 text-sm sm:text-base">
                            Payment Instructions
                          </h4>
                          <ul className="space-y-1 text-xs sm:text-sm text-neutral-700">
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
                    <div className="p-4 sm:p-6 bg-neutral-50 rounded-xl border border-neutral-200 mt-3">
                      <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-3 sm:mb-4">
                        Card Details
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
                            className="h-10 border-2 border-neutral-300 rounded-lg focus:border-brand-primary mt-2"
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
                            className="h-10 border-2 border-neutral-300 rounded-lg focus:border-brand-primary mt-2"
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
                              className="h-10 border-2 border-neutral-300 rounded-lg focus:border-brand-primary mt-2"
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
                              className="h-10 border-2 border-neutral-300 rounded-lg focus:border-brand-primary mt-2"
                            />
                          </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border-2 border-neutral-200">
                          <h4 className="font-semibold text-neutral-900 mb-2">Secure Payment</h4>
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
                  <div className="bg-neutral-50 p-4 sm:p-6 rounded-xl border border-neutral-200 mt-3">
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
                        {shippingAddress.city}, {shippingAddress.country}
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
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mt-8 sm:mt-12 p-4 sm:p-6 bg-neutral-50 rounded-xl border border-neutral-200">
              <Button
                variant="outline"
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-100 disabled:opacity-50 rounded-xl order-2 sm:order-1"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                Previous Step
              </Button>

              {currentStep < 3 ? (
                <Button
                  onClick={handleNextStep}
                  disabled={!validateStep(currentStep)}
                  className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-bold bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
                >
                  Continue to {currentStep === 1 ? 'Payment' : 'Review'}
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 ml-2 sm:ml-3 rotate-180" />
                </Button>
              ) : (
                <Button
                  onClick={handlePlaceOrder}
                  disabled={!agreeToTerms || isProcessing}
                  className="w-full sm:w-auto px-10 sm:px-12 py-3 sm:py-4 text-lg sm:text-xl font-bold bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl shadow-xl disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Complete Purchase
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <Card className="shadow-sm border border-neutral-200 rounded-xl overflow-hidden">
                <CardHeader className="bg-neutral-50 border-b border-neutral-200 p-6">
                  <CardTitle className="text-2xl font-semibold text-neutral-900">
                    Order Summary
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="bg-white px-3 py-1 rounded-full border border-neutral-200">
                      <span className="text-sm font-medium text-neutral-700">
                        {checkoutItems.length} {checkoutItems.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    <div className="bg-white px-3 py-1 rounded-full border border-neutral-200">
                      <span className="text-sm font-medium text-neutral-700">
                        {selectedCountryData?.name}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-sm text-blue-800">
                      Prices shown in your selected currency. Payment processed in{' '}
                      <strong>TZS (Tanzanian Shilling)</strong> at checkout.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="flex justify-between text-lg p-3 bg-gray-50 rounded-xl">
                      <span className="font-medium">Subtotal ({checkoutItems.length} items)</span>
                      <span className="font-bold text-neutral-900">
                        <PriceDisplay price={checkoutSubtotal} size="lg" weight="bold" />
                      </span>
                    </div>
                    <div className="flex justify-between text-lg p-3 bg-gray-50 rounded-xl">
                      <span className="font-medium">Delivery ({selectedShippingOption?.name})</span>
                      <span className="font-semibold text-neutral-600">
                        {selectedShippingOption?.priceDisplay || 'Varies'}
                      </span>
                    </div>
                  </div>

                  <Separator className="my-6 border-2" />

                  <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-200">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-800">Total</span>
                      <span className="text-3xl font-bold text-brand-primary">
                        <PriceDisplay price={totalAmount} size="xl" weight="bold" showOriginal />
                      </span>
                    </div>
                  </div>

                  {/* Security Info */}
                  <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-200">
                    <h4 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Secure Payment
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
