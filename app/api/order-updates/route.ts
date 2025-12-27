import { NextRequest } from 'next/server'
import { registerConnection, unregisterConnection } from '@/lib/order-notifications'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get('orderId')

  if (!orderId) {
    return new Response('Missing orderId', { status: 400 })
  }

  console.log(`[SSE] Client connected for order: ${orderId}`)

  const stream = new ReadableStream({
    start(controller) {
      // Store this connection
      registerConnection(orderId, controller)

      // Send initial connection message
      const data = `data: ${JSON.stringify({ type: 'connected', orderId })}\n\n`
      controller.enqueue(new TextEncoder().encode(data))

      // Keep-alive ping every 30 seconds
      const keepAlive = setInterval(() => {
        try {
          const ping = `data: ${JSON.stringify({ type: 'ping' })}\n\n`
          controller.enqueue(new TextEncoder().encode(ping))
        } catch {
          console.log(`[SSE] Keep-alive failed for order: ${orderId}, cleaning up`)
          clearInterval(keepAlive)
          unregisterConnection(orderId)
        }
      }, 30000)

      // Cleanup on close
      req.signal.addEventListener('abort', () => {
        console.log(`[SSE] Client disconnected for order: ${orderId}`)
        clearInterval(keepAlive)
        unregisterConnection(orderId)
        try {
          controller.close()
        } catch {
          // Already closed
        }
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
