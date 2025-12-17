'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Info,
  Banknote,
  Handshake,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { FlagDisplay } from '@/components/ui/flag-display'
import { useCart } from '@/hooks/use-cart'
import { useAuth } from '@/hooks/use-auth'
import { useUserProfile } from '@/hooks/use-user-profile'
import { useVerification } from '@/hooks/use-verification'
import PriceDisplay from '@/components/price-display'
import { toast } from '@/components/ui/use-toast'
import { api, type MobileCheckoutPayload } from '@/lib/api'

interface ShippingAddress {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  state?: string
  zip?: string
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
// Enhanced payment methods for East African mobile money priority
const paymentMethods: PaymentMethod[] = [
  {
    id: 'cod',
    type: 'cash',
    name: 'Cash on Delivery',
    description: 'Pay when you receive your order',
    icon: 'Banknote',
    popular: true,
  },
  {
    id: 'meetup',
    type: 'cash',
    name: 'Meet in Person',
    description: 'Pay the seller directly when you meet',
    icon: 'Handshake',
    popular: true,
  },
  {
    id: 'mpesa',
    type: 'mobile',
    name: 'M-Pesa',
    description: 'Instant STK push to your Safaricom line',
    icon: 'CreditCard',
  },
  {
    id: 'airtel',
    type: 'mobile',
    name: 'Airtel Money',
    description: 'Secure Airtel Money payment',
    icon: 'CreditCard',
  },
  {
    id: 'mixx',
    type: 'mobile',
    name: 'Mixx By Yas',
    description: 'Pay via Mixx mobile wallet',
    icon: 'CreditCard',
  },
  {
    id: 'card',
    type: 'card',
    name: 'Credit/Debit Card',
    description: 'Coming Soon',
    icon: 'CreditCard',
  },
]

const mobilePaymentMethodIds = ['mpesa', 'airtel', 'mixx']

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
  const { userProfile } = useUserProfile()
  const { items, subtotal, selectedItems, selectedItemsData, selectedSubtotal } = useCart()
  const { checkVerification } = useVerification()

  // Check verification on page load
  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      if (!checkVerification('buy')) {
        toast({
          title: 'Verification Required',
          description:
            'Please verify your account to proceed with checkout. Visit your account settings to complete verification.',
          variant: 'default',
        })
        router.push('/account/verification')
        return
      }
    }
  }, [authLoading, isLoggedIn, checkVerification, router])

  // Auto-fill phone number from user profile if available
  useEffect(() => {
    if (userProfile?.phoneNumber) {
      setShippingAddress((prev) => {
        // Only update if phone is empty
        if (!prev.phone) {
          return {
            ...prev,
            phone: userProfile.phoneNumber || '',
          }
        }
        return prev
      })
    }
  }, [userProfile])

  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
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
    state: '',
    zip: '',
    instructions: '',
  })

  const [selectedPayment, setSelectedPayment] = useState('')
  const [sellerDetails, setSellerDetails] = useState<{
    id: string
    name: string
    email?: string
    phone?: string
    verified?: boolean
  } | null>(null)
  const [_loadingSeller, setLoadingSeller] = useState(false)
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
        time: 'Varies depending on city logistics',
        price: 0, // Price varies based on location and will be determined later
        description: 'Within city delivery',
        isGloboExpat: true,
        priceDisplay: 'Varies',
      },
      {
        id: 'pickup',
        name: 'Arrange with Seller',
        time: 'Any day as agreed with seller',
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

  // Fetch seller details when shipping method is 'pickup'
  useEffect(() => {
    const fetchSellerDetails = async () => {
      if (shippingMethod === 'pickup' && checkoutItems.length > 0) {
        // For simulation: Use mock seller data instead of API call
        const sellerId = checkoutItems[0].expatId
        if (sellerId) {
          setLoadingSeller(true)
          try {
            // Simulate delay
            await new Promise((resolve) => setTimeout(resolve, 500))

            // Mock seller data - realistic East African details
            setSellerDetails({
              id: sellerId,
              name: 'John Mwangi',
              email: 'john.mwangi@globoexpats.com',
              phone: '+255 712 345 678',
              verified: true,
            })
          } catch (error) {
            console.error('Failed to fetch seller details:', error)
          } finally {
            setLoadingSeller(false)
          }
        }
      } else {
        setSellerDetails(null)
      }
    }

    fetchSellerDetails()
  }, [shippingMethod, checkoutItems])

  // Filter payment methods based on shipping selection
  const availablePaymentMethods = useMemo(() => {
    if (shippingMethod === 'delivery') {
      // Arrange with Us -> Cash on Delivery or Mobile Money
      return paymentMethods.filter(
        (m) => m.id === 'cod' || mobilePaymentMethodIds.includes(m.id) || m.id === 'card'
      )
    } else if (shippingMethod === 'pickup') {
      // Arrange with Seller -> Meet in Person or Mobile Money
      return paymentMethods.filter(
        (m) => m.id === 'meetup' || mobilePaymentMethodIds.includes(m.id) || m.id === 'card'
      )
    }
    return paymentMethods
  }, [shippingMethod])

  // Auto-select the appropriate payment method
  useEffect(() => {
    if (shippingMethod === 'delivery') {
      setSelectedPayment('cod')
    } else if (shippingMethod === 'pickup') {
      setSelectedPayment('meetup')
    }
  }, [shippingMethod])
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

  const handleCountryChange = useCallback((countryCode: string) => {
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

  const handleCityChange = useCallback((city: string) => {
    setShippingAddress((prev) => ({ ...prev, city }))
  }, [])

  // Comprehensive authentication and verification checks
  useEffect(() => {
    // Only check auth once it's loaded
    if (!authLoading) {
      if (!isLoggedIn) {
        toast({
          title: 'Login Required',
          description:
            'Please login to proceed with checkout or create an account to complete your purchase!',
          variant: 'default',
        })
        router.push('/')
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
  if (authLoading) {
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
      if (mobilePaymentMethodIds.includes(selectedPayment)) {
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

      // No validation needed for Cash on Delivery or Meet in Person
      if (['cod', 'meetup'].includes(selectedPayment)) {
        return true
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
      const isMobilePayment = mobilePaymentMethodIds.includes(selectedPayment)
      const paymentLabel =
        paymentMethods.find((m) => m.id === selectedPayment)?.name || 'Cash on Delivery'

      let checkoutItemsPayload: { productId: number; quantity: number }[] = []

      let orderId = ''
      let mobileReference: string | undefined
      let mobileStatus: string | undefined
      let mobileMessage: string | undefined

      if (isMobilePayment) {
        checkoutItemsPayload = checkoutItems.reduce<{ productId: number; quantity: number }[]>(
          (acc, item) => {
            const rawId =
              typeof item.productId === 'number' ? item.productId : Number(item.productId)
            const fallbackId = Number(item.id)
            const productIdValue = Number.isFinite(rawId) ? rawId : fallbackId

            if (!Number.isFinite(productIdValue)) {
              console.warn('[Checkout] Skipping item without numeric productId', item)
              return acc
            }

            acc.push({
              productId: productIdValue,
              quantity: Math.max(1, item.quantity || 1),
            })

            return acc
          },
          []
        )

        if (checkoutItemsPayload.length === 0) {
          throw new Error(
            'Unable to prepare checkout items. Please refresh your cart and try again.'
          )
        }

        const mobilePayload: MobileCheckoutPayload = {
          buyDetails: {
            firstName: shippingAddress.firstName,
            lastName: shippingAddress.lastName,
            emailAddress: shippingAddress.email,
            phoneNumber: paymentDetails.mobileNumber || shippingAddress.phone,
            address: shippingAddress.address,
            city: shippingAddress.city,
            state: shippingAddress.state || '',
            country: shippingAddress.country,
            zipCode: shippingAddress.zip || '',
            deliveryInstructions: shippingAddress.instructions || '',
            deliveryMethod: shippingMethod,
            paymentMethod: paymentLabel,
            agreeToTerms,
            totalAmount: Number(checkoutSubtotal.toFixed(2)),
            currency: selectedCountryData?.currency || 'TZS',
          },
          items: checkoutItemsPayload,
        }

        const mobileResponse = await api.checkout.mobilePay(mobilePayload)

        // Check if the response indicates a pending/in-progress payment request
        const isPendingPayment =
          mobileResponse.message?.toLowerCase().includes('in progress') ||
          mobileResponse.message?.toLowerCase().includes('callback') ||
          mobileResponse.data?.status?.toLowerCase().includes('pending')

        // Treat pending as success for mobile payments (STK push initiated)
        if (!mobileResponse.success && !isPendingPayment) {
          throw new Error(mobileResponse.message || 'Unable to initiate mobile payment.')
        }

        orderId =
          mobileResponse.data?.orderId ||
          mobileResponse.data?.transactionId ||
          mobileResponse.data?.checkoutRequestId ||
          `MP-${Date.now()}`

        mobileReference =
          mobileResponse.data?.checkoutRequestId || mobileResponse.data?.transactionId
        mobileStatus = mobileResponse.data?.status
        mobileMessage = mobileResponse.data?.message || mobileResponse.message

        toast({
          title: 'Confirm payment on your phone',
          description:
            mobileMessage ||
            'We sent an STK push to your device. Approve the prompt to complete your payment.',
        })
      } else {
        // Simulate API call delay for offline payment methods
        await new Promise((resolve) => setTimeout(resolve, 2000))
        orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      }

      // Store order data in localStorage BEFORE clearing cart
      const orderData = {
        id: orderId,
        status: isMobilePayment ? 'pending_payment' : 'confirmed',
        date: new Date().toISOString(),
        estimatedDelivery:
          shippingMethod === 'delivery'
            ? 'Varies depending on city logistics'
            : 'Any day as agreed with seller',
        total: checkoutSubtotal,
        currency: selectedCountryData?.currency || 'TZS',
        paymentMethod: paymentLabel,
        paymentStatus: isMobilePayment ? 'Awaiting mobile confirmation' : 'Pay on delivery/pickup',
        items: checkoutItems.map((item) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          seller: 'Verified Seller', // This would come from backend
          sellerVerified: true,
        })),
        shippingAddress: {
          name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
          address: shippingAddress.address,
          city: shippingAddress.city,
          country: shippingAddress.country,
          state: shippingAddress.state,
          zip: shippingAddress.zip,
          phone: shippingAddress.phone,
          email: shippingAddress.email,
        },
        shippingMethod,
        // Notification timestamps
        notifications: {
          sellerNotified: true,
          sellerNotifiedAt: new Date().toISOString(),
          buyerNotified: true,
          teamNotified: shippingMethod === 'delivery',
        },
        // Expected contact timeframe
        expectedContactTime: shippingMethod === 'delivery' ? 'within 24 hours' : 'within 2-4 hours',
        // Seller details only for pickup method
        sellerDetails:
          shippingMethod === 'pickup' && sellerDetails
            ? {
                name: sellerDetails.name || 'John Doe',
                email: sellerDetails.email || 'seller@globoexpats.com',
                phone: sellerDetails.phone || '+255 712 345 678',
                notified: true,
              }
            : shippingMethod === 'delivery'
              ? {
                  notified: true,
                  message: 'Seller has been notified. Our team will coordinate directly.',
                }
              : undefined,
        mobilePayment: isMobilePayment
          ? {
              reference: mobileReference,
              status: mobileStatus || 'pending',
              provider: paymentLabel,
              phoneNumber: paymentDetails.mobileNumber || shippingAddress.phone,
              message: mobileMessage,
            }
          : undefined,
      }

      // Store in localStorage for success page to retrieve
      localStorage.setItem(`order_${orderId}`, JSON.stringify(orderData))
      localStorage.setItem('lastOrderId', orderId)

      // Mark that cart should be cleared (success page will handle this)
      localStorage.setItem('clearCartAfterOrder', 'true')

      // Seamless SPA navigation to success page; cart clears after success loads
      router.push(`/checkout/success?orderId=${orderId}`)
    } catch (error) {
      console.error('Order failed:', error)
      setOrderError(
        error instanceof Error ? error.message : 'Failed to process order. Please try again.'
      )
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
          <div className="flex items-start justify-center">
            {[
              { number: 1, label: 'Shipping' },
              { number: 2, label: 'Payment' },
              { number: 3, label: 'Review' },
              { number: 4, label: 'Complete' },
            ].map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  {/* Circle */}
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-medium transition-all text-sm sm:text-base ${
                      step.number <= currentStep
                        ? 'bg-brand-primary text-white'
                        : 'bg-neutral-200 text-neutral-500'
                    }`}
                  >
                    {step.number}
                  </div>
                  {/* Label */}
                  <span
                    className={`mt-3 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                      currentStep >= step.number ? 'text-brand-primary' : 'text-neutral-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {/* Connecting Line */}
                {index < 3 && (
                  <div
                    className={`w-8 sm:w-16 h-0.5 mx-1 sm:mx-2 mb-6 ${
                      step.number < currentStep ? 'bg-brand-primary' : 'bg-neutral-200'
                    }`}
                  />
                )}
              </div>
            ))}
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
                      <Select value={selectedCountry} onValueChange={handleCountryChange}>
                        <SelectTrigger className="w-full h-11 border-2 border-neutral-200 rounded-md focus:border-brand-primary">
                          <SelectValue>
                            {selectedCountry && (
                              <span className="flex items-center gap-2">
                                {(() => {
                                  const country = eastAfricanCountries.find(
                                    (c) => c.code === selectedCountry
                                  )
                                  if (!country) return selectedCountry
                                  return (
                                    <>
                                      <FlagDisplay
                                        emoji={country.flag}
                                        fallback={country.code}
                                        countryName={country.name}
                                        variant="minimal"
                                      />
                                      <span>{country.name}</span>
                                    </>
                                  )
                                })()}
                              </span>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {eastAfricanCountries.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              <span className="flex items-center gap-2">
                                <FlagDisplay
                                  emoji={country.flag}
                                  fallback={country.code}
                                  countryName={country.name}
                                  variant="dropdown"
                                />
                                <span>{country.name}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Select value={shippingAddress.city} onValueChange={handleCityChange}>
                        <SelectTrigger className="w-full h-11 border-2 border-neutral-200 rounded-md focus:border-brand-primary">
                          <SelectValue placeholder="Choose city" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCities.map((city) => (
                            <SelectItem key={city.name} value={city.name}>
                              <span className="flex items-center gap-2">
                                <FlagDisplay
                                  emoji={city.flag}
                                  fallback={selectedCountry}
                                  countryName={shippingAddress.country || 'City'}
                                  variant="dropdown"
                                />
                                <span>{city.name}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="state">State / Region</Label>
                      <Input
                        id="state"
                        value={shippingAddress.state}
                        onChange={(e) => handleAddressChange('state', e.target.value)}
                        placeholder="Region, state or province"
                        className="border-2 focus:border-brand-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">Postal / ZIP Code</Label>
                      <Input
                        id="zip"
                        value={shippingAddress.zip}
                        onChange={(e) => handleAddressChange('zip', e.target.value)}
                        placeholder="e.g., 14111"
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
                    {/* Recommended Options */}
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-neutral-500 mb-3 uppercase tracking-wider">
                        Recommended
                      </h3>
                      <div className="space-y-3">
                        {availablePaymentMethods
                          .filter((m) => m.type === 'cash')
                          .map((method) => (
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
                              {method.icon === 'Banknote' && (
                                <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                                  <Banknote className="w-5 h-5 text-green-700" />
                                </div>
                              )}
                              {method.icon === 'Handshake' && (
                                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                                  <Handshake className="w-5 h-5 text-blue-700" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <Label
                                  htmlFor={method.id}
                                  className="font-semibold text-base text-neutral-900 cursor-pointer"
                                >
                                  {method.name}
                                </Label>
                                <p className="text-sm text-neutral-600 mt-0.5">
                                  {method.description}
                                </p>
                              </div>
                              {selectedPayment === method.id && (
                                <div className="flex-shrink-0">
                                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Other Options (Accordion) */}
                    <Accordion
                      type="single"
                      collapsible
                      className="w-full border border-neutral-200 rounded-xl overflow-hidden bg-white"
                    >
                      <AccordionItem
                        value="mobile-money"
                        className="border-b border-neutral-200 last:border-0"
                      >
                        <AccordionTrigger className="px-4 py-3 hover:bg-neutral-50 hover:no-underline">
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-neutral-100 rounded-md">
                              <CreditCard className="w-4 h-4 text-neutral-500" />
                            </div>
                            <span className="font-medium text-neutral-700">Mobile Money</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4 pt-0">
                          <div className="space-y-3 mt-2">
                            {availablePaymentMethods
                              .filter((m) => m.type === 'mobile')
                              .map((method) => (
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
                                  className={`relative flex items-center gap-3 p-3 border-2 rounded-lg transition-all duration-200 cursor-pointer ${
                                    selectedPayment === method.id
                                      ? 'border-brand-primary bg-blue-50/50 shadow-sm'
                                      : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                                  }`}
                                >
                                  <RadioGroupItem
                                    value={method.id}
                                    id={method.id}
                                    className="w-4 h-4 border-2 flex-shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <Label
                                      htmlFor={method.id}
                                      className="font-medium text-sm text-neutral-900"
                                    >
                                      {method.name}
                                    </Label>
                                    <p className="text-xs text-neutral-600 mt-1">
                                      {method.description}
                                    </p>
                                  </div>
                                  {selectedPayment === method.id && (
                                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                                  )}
                                </div>
                              ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="card-payment" className="border-b-0">
                        <AccordionTrigger className="px-4 py-3 hover:bg-neutral-50 hover:no-underline">
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-neutral-100 rounded-md">
                              <CreditCard className="w-4 h-4 text-neutral-500" />
                            </div>
                            <span className="font-medium text-neutral-700">Credit/Debit Card</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full ml-2">
                              Coming Soon
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4 pt-0">
                          <div className="space-y-3 mt-2">
                            {availablePaymentMethods
                              .filter((m) => m.type === 'card')
                              .map((method) => (
                                <div
                                  key={method.id}
                                  className="relative flex items-center gap-3 p-3 border border-neutral-200 rounded-lg opacity-60 cursor-not-allowed bg-neutral-50"
                                >
                                  <RadioGroupItem
                                    value={method.id}
                                    id={method.id}
                                    disabled
                                    className="w-4 h-4 border-2 flex-shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <Label
                                      htmlFor={method.id}
                                      className="font-medium text-sm text-neutral-500"
                                    >
                                      {method.name}
                                    </Label>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </RadioGroup>

                  {/* Mobile Money Payment Details */}
                  {mobilePaymentMethodIds.includes(selectedPayment) && (
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
                  {/* Order Confirmation Summary (shown first) */}
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      After Order Confirmation
                    </h4>

                    {shippingMethod === 'delivery' ? (
                      <p className="text-sm text-blue-800">
                        Our team will contact you shortly to finalize payment and delivery
                        arrangements. All details will be provided after you complete your order.
                      </p>
                    ) : (
                      <p className="text-sm text-blue-800">
                        Seller contact information will be provided after order confirmation. You'll
                        be able to arrange a meeting location and time directly with the seller.
                      </p>
                    )}
                  </div>
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

                  {/* Delivery Method Summary */}
                  <div>
                    <h4 className="font-medium mb-2">Delivery Method</h4>
                    <p className="text-sm text-neutral-600">{selectedShippingOption?.name}</p>
                  </div>

                  <Separator />

                  <Separator />

                  {/* Items Summary */}
                  <div>
                    <h4 className="font-medium mb-4">Order Items ({checkoutItems.length})</h4>
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
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
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-100 disabled:opacity-50 rounded-full order-2 sm:order-1"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                Previous Step
              </Button>

              {currentStep < 3 ? (
                <Button
                  onClick={handleNextStep}
                  disabled={!validateStep(currentStep)}
                  className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-bold bg-brand-primary hover:bg-brand-primary/90 text-white rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
                >
                  Continue to {currentStep === 1 ? 'Payment' : 'Review'}
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 ml-2 sm:ml-3 rotate-180" />
                </Button>
              ) : (
                <Button
                  onClick={handlePlaceOrder}
                  disabled={!agreeToTerms || isProcessing}
                  className="w-full sm:w-auto px-10 sm:px-12 py-3 sm:py-4 text-lg sm:text-xl font-bold bg-brand-primary hover:bg-brand-primary/90 text-white rounded-full shadow-xl disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
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
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
