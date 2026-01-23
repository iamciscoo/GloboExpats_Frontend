// Store active SSE connections for order updates
const connections = new Map<string, ReadableStreamDefaultController>()

/**
 * Register a new SSE connection for an order
 */
export function registerConnection(orderId: string, controller: ReadableStreamDefaultController) {
  connections.set(orderId, controller)
  console.log(`[SSE] Registered connection for order: ${orderId}`)
  console.log(`[SSE] Total active connections: ${connections.size}`)
}

/**
 * Remove a connection when client disconnects
 */
export function unregisterConnection(orderId: string) {
  connections.delete(orderId)
  console.log(`[SSE] Unregistered connection for order: ${orderId}`)
  console.log(`[SSE] Total active connections: ${connections.size}`)
}

/**
 * Send notification to a specific order's SSE connection
 */
export function notifyOrder(orderId: string, data: unknown): boolean {
  const controller = connections.get(orderId)
  if (controller) {
    try {
      const message = `data: ${JSON.stringify(data)}\n\n`
      controller.enqueue(new TextEncoder().encode(message))
      console.log(`[SSE] Sent notification for order: ${orderId}`, data)
      return true
    } catch (error) {
      console.error(`[SSE] Failed to send notification for order: ${orderId}`, error)
      connections.delete(orderId)
      return false
    }
  } else {
    console.log(`[SSE] No active connection for order: ${orderId}`)
    return false
  }
}

/**
 * Get count of active connections
 */
export function getActiveConnectionsCount(): number {
  return connections.size
}
