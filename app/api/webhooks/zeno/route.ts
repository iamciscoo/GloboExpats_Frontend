import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

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

  logger.info('[Webhook:Zeno] 🔔 Webhook endpoint activated', {
    requestId,
    timestamp: new Date().toISOString(),
    url: req.url,
    method: req.method,
    headers: Object.fromEntries(req.headers.entries()),
  })

  try {
    // Parse request body
    logger.info('[Webhook:Zeno] 📥 Parsing request body...', { requestId })
    const payload = (await req.json()) as ZenoWebhookPayload

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
    logger.info('[Webhook:Zeno] ✅ Validating payload...', { requestId })
    if (!isPayloadValid(payload)) {
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
    logger.info('[Webhook:Zeno] 💳 Payment status analysis', {
      requestId,
      ...statusInfo,
    })

    // TODO: Persist payment update to database, notify the user, and advance checkout to the next stage
    logger.warn('[Webhook:Zeno] ⚠️ TODO: Database persistence not implemented', {
      requestId,
      orderId: payload.orderId,
      action: 'Payment status update needs to be persisted to database',
    })

    const processingTime = Date.now() - startTime
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
