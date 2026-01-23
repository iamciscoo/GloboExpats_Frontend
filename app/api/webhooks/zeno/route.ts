import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { notifyOrder } from '@/lib/order-notifications'

export const runtime = 'nodejs'

interface ZenoWebhookPayload {
  paymentStatus?: string
  orderId?: string
  transactionId?: string
  reference?: string
  amount?: number
  currency?: string
  metadata?: Record<string, unknown>
}

function isPayloadValid(
  payload: ZenoWebhookPayload
): payload is ZenoWebhookPayload & Required<Pick<ZenoWebhookPayload, 'paymentStatus'>> {
  return Boolean(payload.paymentStatus)
}

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const requestId = `webhook_${startTime}_${Math.random().toString(36).substring(7)}`

  console.log('='.repeat(80))
  console.log('[Webhook:Zeno] 🔔 WEBHOOK ACTIVATED')
  console.log('Request ID:', requestId)
  console.log('Timestamp:', new Date().toISOString())
  console.log('URL:', req.url)
  console.log('Method:', req.method)
  console.log('='.repeat(80))

  logger.info('[Webhook:Zeno] 🔔 Webhook endpoint activated', {
    requestId,
    timestamp: new Date().toISOString(),
    url: req.url,
    method: req.method,
    headers: Object.fromEntries(req.headers.entries()),
  })

  try {
    // Parse request body
    console.log('[Webhook:Zeno] 📥 Parsing request body...')
    logger.info('[Webhook:Zeno] 📥 Parsing request body...', { requestId })
    const payload = (await req.json()) as ZenoWebhookPayload

    console.log('[Webhook:Zeno] 📦 RAW PAYLOAD:')
    console.log(JSON.stringify(payload, null, 2))
    console.log('Payload Keys:', Object.keys(payload))
    console.log('Payment Status:', payload.paymentStatus)
    console.log('Order ID:', payload.orderId)
    console.log('Transaction ID:', payload.transactionId)
    console.log('Reference:', payload.reference)
    console.log('Amount:', payload.amount)
    console.log('Currency:', payload.currency)

    // Log raw payload with detailed structure
    logger.info('[Webhook:Zeno] 📦 Raw payload received', {
      requestId,
      payload: JSON.stringify(payload, null, 2),
      payloadKeys: Object.keys(payload),
      paymentStatus: payload.paymentStatus,
      orderId: payload.orderId,
      transactionId: payload.transactionId,
      reference: payload.reference,
      hasPaymentStatus: Boolean(payload.paymentStatus),
      hasOrderId: Boolean(payload.orderId),
      payloadSize: JSON.stringify(payload).length,
    })

    // Validate payload
    console.log('[Webhook:Zeno] ✅ Validating payload...')
    logger.info('[Webhook:Zeno] ✅ Validating payload...', { requestId })
    if (!isPayloadValid(payload)) {
      console.error('[Webhook:Zeno] ❌ VALIDATION FAILED!')
      console.error('Reason: paymentStatus is missing, null, or empty')
      console.error('Received fields:', Object.keys(payload))
      console.error('Payload:', payload)

      logger.error('[Webhook:Zeno] ❌ Validation failed - missing paymentStatus', {
        requestId,
        payload,
        reason: 'paymentStatus field is missing, null, or empty',
        receivedFields: Object.keys(payload),
      })
      return NextResponse.json(
        { success: false, message: 'paymentStatus is required' },
        { status: 400 }
      )
    }

    console.log('[Webhook:Zeno] ✅ PAYLOAD VALIDATED SUCCESSFULLY')
    logger.info('[Webhook:Zeno] ✅ Payload validated successfully', {
      requestId,
      orderId: payload.orderId,
      paymentStatus: payload.paymentStatus,
      reference: payload.reference,
      currency: payload.currency,
      amount: payload.amount,
      transactionId: payload.transactionId,
    })

    // Log payment status details
    const statusInfo = {
      status: payload.paymentStatus,
      isCompleted: payload.paymentStatus?.toUpperCase() === 'COMPLETED',
      isFailed: payload.paymentStatus?.toUpperCase() === 'FAILED',
      isPending: payload.paymentStatus?.toUpperCase() === 'PENDING',
    }
    console.log('[Webhook:Zeno] 💳 PAYMENT STATUS ANALYSIS:')
    console.log('  Status:', statusInfo.status)
    console.log('  Is Completed:', statusInfo.isCompleted)
    console.log('  Is Failed:', statusInfo.isFailed)
    console.log('  Is Pending:', statusInfo.isPending)

    logger.info('[Webhook:Zeno] 💳 Payment status analysis', {
      requestId,
      ...statusInfo,
    })

    // Send real-time notification to client
    if (payload.orderId) {
      console.log('[Webhook:Zeno] 📡 Sending real-time notification to client...')
      const notified = notifyOrder(payload.orderId, {
        type: 'payment_update',
        orderId: payload.orderId,
        paymentStatus: payload.paymentStatus,
        reference: payload.reference,
        transactionId: payload.transactionId,
        amount: payload.amount,
        currency: payload.currency,
        timestamp: new Date().toISOString(),
      })

      if (notified) {
        console.log('[Webhook:Zeno] ✅ Client notification sent successfully')
      } else {
        console.log('[Webhook:Zeno] ⚠️ No active client connection found for this order')
      }
    }

    // TODO: Persist payment update to database, notify the user, and advance checkout to the next stage
    console.warn('[Webhook:Zeno] ⚠️ TODO: Database persistence not implemented')
    console.warn('  Order ID:', payload.orderId)
    console.warn('  Action needed: Persist payment status to database')

    logger.warn('[Webhook:Zeno] ⚠️ TODO: Database persistence not implemented', {
      requestId,
      orderId: payload.orderId,
      action: 'Payment status update needs to be persisted to database',
    })

    const processingTime = Date.now() - startTime
    console.log('[Webhook:Zeno] ✅ WEBHOOK PROCESSED SUCCESSFULLY')
    console.log('  Processing Time:', processingTime, 'ms')
    console.log('  Order ID:', payload.orderId)
    console.log('  Payment Status:', payload.paymentStatus)
    console.log('='.repeat(80))

    logger.info('[Webhook:Zeno] ✅ Webhook processed successfully', {
      requestId,
      orderId: payload.orderId,
      paymentStatus: payload.paymentStatus,
      processingTimeMs: processingTime,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'Payment notification received successfully',
      orderId: payload.orderId,
      requestId,
      processingTimeMs: processingTime,
    })
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('='.repeat(80))
    console.error('[Webhook:Zeno] 💥 CRITICAL ERROR IN WEBHOOK HANDLER')
    console.error('Request ID:', requestId)
    console.error('Error Type:', error?.constructor?.name)
    console.error('Error Message:', error instanceof Error ? error.message : String(error))
    console.error('Error Stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('Processing Time:', processingTime, 'ms')
    console.error('='.repeat(80))

    logger.error('[Webhook:Zeno] 💥 Critical error in webhook handler', {
      requestId,
      error: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      errorType: error?.constructor?.name,
      processingTimeMs: processingTime,
      timestamp: new Date().toISOString(),
    })
    return NextResponse.json(
      {
        success: false,
        message: 'Webhook processing failed',
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
