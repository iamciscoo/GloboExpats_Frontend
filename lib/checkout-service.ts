/**
 * =============================================================================
 * CHECKOUT SERVICE - Backend Integration for ZenoPay Checkout
 * =============================================================================
 *
 * Handles checkout operations with the backend payment gateway.
 * Provides type-safe methods for processing payments and managing checkout flow.
 *
 * Backend Endpoint:
 * - POST /api/v1/checkout/zenoPayCheckOut - Process payment through ZenoPay
 *
 * Usage:
 * ```tsx
 * import { processCheckout } from '@/lib/checkout-service'
 *
 * const result = await processCheckout({
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   emailAddress: 'john@example.com',
 *   // ... other required fields
 * })
 * ```
 */

import { apiClient } from './api'
import { logger } from './logger'

/**
 * Checkout payload interface matching backend requirements
 */
export interface CheckoutPayload {
  firstName: string
  lastName: string
  emailAddress: string
  phoneNumber: string
  address: string
  city: string
  state: string
  country: string
  zipCode: string
  deliveryInstructions: string
  deliveryMethod: string
  paymentMethod: string
  agreeToTerms: boolean
  totalAmount: number
  currency: string
}

/**
 * Checkout response interface from backend
 */
export interface CheckoutResponse {
  success: boolean
  transactionId?: string
  paymentUrl?: string
  orderId?: string
  message?: string
  error?: string
}

/**
 * Processes checkout with ZenoPay payment gateway
 * @param checkoutData - Complete checkout information
 * @returns Promise resolving to checkout response
 */
export async function processCheckout(checkoutData: CheckoutPayload): Promise<CheckoutResponse> {
  try {
    logger.debug('[CHECKOUT] Starting ZenoPay checkout process', {
      email: checkoutData.emailAddress,
      amount: checkoutData.totalAmount,
      currency: checkoutData.currency,
      paymentMethod: checkoutData.paymentMethod,
    })

    // Validate required fields
    validateCheckoutData(checkoutData)

    // Call backend checkout endpoint
    const response = await apiClient.zenoPayCheckout(checkoutData)

    // Backend may return data directly or wrapped in response.data
    // Handle both cases like other services
    const responseData: CheckoutResponse =
      'data' in response && response.data
        ? (response.data as CheckoutResponse)
        : (response as CheckoutResponse)

    logger.debug('[CHECKOUT] ZenoPay checkout response received', {
      success: responseData?.success || false,
      hasTransactionId: !!responseData?.transactionId,
      hasPaymentUrl: !!responseData?.paymentUrl,
    })

    // Transform response to standard format
    const checkoutResponse: CheckoutResponse = {
      success: responseData?.success || false,
      transactionId: responseData?.transactionId,
      paymentUrl: responseData?.paymentUrl,
      orderId: responseData?.orderId,
      message: responseData?.message,
      error: responseData?.error,
    }

    if (!checkoutResponse.success) {
      throw new Error(checkoutResponse.error || 'Checkout failed')
    }

    return checkoutResponse
  } catch (error) {
    logger.error('[CHECKOUT] ZenoPay checkout failed', error)

    // Return structured error response
    const errorMessage = error instanceof Error ? error.message : 'Unknown checkout error'

    return {
      success: false,
      error: errorMessage,
      message: 'Payment processing failed. Please try again or contact support.',
    }
  }
}

/**
 * Validates checkout data before sending to backend
 * @param data - Checkout payload to validate
 * @throws Error if validation fails
 */
function validateCheckoutData(data: CheckoutPayload): void {
  const requiredFields: (keyof CheckoutPayload)[] = [
    'firstName',
    'lastName',
    'emailAddress',
    'phoneNumber',
    'address',
    'city',
    'country',
    'paymentMethod',
    'totalAmount',
    'currency',
  ]

  const missingFields: string[] = []

  for (const field of requiredFields) {
    const value = data[field]
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      missingFields.push(field)
    }
  }

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(data.emailAddress)) {
    throw new Error('Invalid email address format')
  }

  // Validate phone number (basic validation)
  if (data.phoneNumber.length < 10) {
    throw new Error('Phone number must be at least 10 digits')
  }

  // Validate amount
  if (data.totalAmount <= 0) {
    throw new Error('Total amount must be greater than 0')
  }

  // Validate terms agreement
  if (!data.agreeToTerms) {
    throw new Error('You must agree to the terms and conditions')
  }
}

/**
 * Maps frontend payment method IDs to backend expected values
 * @param frontendPaymentMethod - Payment method ID from frontend
 * @returns Backend-compatible payment method string
 */
export function mapPaymentMethod(frontendPaymentMethod: string): string {
  const paymentMethodMap: Record<string, string> = {
    mpesa: 'mobile',
    airtel: 'mobile',
    mixx: 'mobile',
    card: 'card',
    bank: 'bank',
    cash: 'cash',
  }

  return paymentMethodMap[frontendPaymentMethod] || 'mobile'
}

/**
 * Maps frontend delivery method to backend expected values
 * @param frontendDeliveryMethod - Delivery method ID from frontend
 * @returns Backend-compatible delivery method string
 */
export function mapDeliveryMethod(frontendDeliveryMethod: string): string {
  const deliveryMethodMap: Record<string, string> = {
    delivery: 'delivery',
    pickup: 'pickup',
    express: 'express',
  }

  return deliveryMethodMap[frontendDeliveryMethod] || 'delivery'
}

/**
 * Formats phone number for backend (removes spaces and special characters)
 * @param phoneNumber - Raw phone number input
 * @returns Cleaned phone number
 */
export function formatPhoneNumber(phoneNumber: string): string {
  return phoneNumber.replace(/[\s\-()]/g, '')
}

/**
 * Gets currency code from country code
 * @param countryCode - Country code (e.g., 'TZ', 'KE')
 * @returns Currency code (e.g., 'TZS', 'KES')
 */
export function getCurrencyFromCountry(countryCode: string): string {
  const currencyMap: Record<string, string> = {
    TZ: 'TZS',
    KE: 'KES',
    UG: 'UGX',
    RW: 'RWF',
  }

  return currencyMap[countryCode] || 'TZS'
}
