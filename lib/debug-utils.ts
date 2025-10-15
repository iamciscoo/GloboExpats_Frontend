/**
 * Debug utilities for catching problematic object rendering
 */

// Helper to safely render any value in JSX
export function safeRender(value: unknown, fallback: string = '[Object]'): string {
  if (value === null || value === undefined) {
    return String(value)
  }

  if (typeof value === 'object') {
    console.warn('🚨 [SAFE-RENDER] Attempting to render object directly:', value)

    // Check if it's a review object
    const obj = value as Record<string, unknown>
    if (obj.reviewId || obj.reviewerName || obj.reviewText || obj.formattedCreatedAt) {
      console.error(
        '🚨 [SAFE-RENDER] REVIEW OBJECT DETECTED! Use specific properties instead of whole object:',
        value
      )
    }

    return fallback
  }

  return String(value)
}

// Helper to check if a value is safe to render in React
export function isSafeToRender(value: unknown): boolean {
  return typeof value !== 'object' || value === null || Array.isArray(value)
}

// Helper to extract safe string from review object
export function extractReviewText(review: unknown): string {
  if (typeof review === 'object' && review !== null) {
    const obj = review as Record<string, unknown>
    return String(obj.reviewText || obj.text || obj.content || '[Review text not available]')
  }
  return String(review)
}

// Helper to extract safe string from any object
export function extractDisplayText(obj: unknown, preferredKey?: string): string {
  if (typeof obj !== 'object' || obj === null) {
    return String(obj)
  }

  const record = obj as Record<string, unknown>

  if (preferredKey && record[preferredKey]) {
    return String(record[preferredKey])
  }

  // Common display keys to try
  const displayKeys = ['text', 'title', 'name', 'description', 'content', 'value']

  for (const key of displayKeys) {
    if (record[key] && typeof record[key] === 'string') {
      return record[key] as string
    }
  }

  // If all else fails, show object keys
  return `[Object with keys: ${Object.keys(record).join(', ')}]`
}
