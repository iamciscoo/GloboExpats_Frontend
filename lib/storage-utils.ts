/**
 * =============================================================================
 * Storage Utilities - Optimized localStorage Management
 * =============================================================================
 * 
 * Provides debounced and throttled storage operations to prevent aggressive
 * writes that can cause performance issues and delays in UI updates.
 * 
 * Key Features:
 * - Debounced writes (batches multiple updates)
 * - Error handling with fallback
 * - Type-safe operations
 * - Memory cache for reads
 */

// Debounce timers for different storage keys
const debounceTimers: Map<string, NodeJS.Timeout> = new Map()

// Memory cache for frequently accessed values
const memoryCache: Map<string, { value: any; timestamp: number }> = new Map()

// Cache TTL in milliseconds (5 seconds)
const CACHE_TTL = 5000

/**
 * Debounced localStorage setter
 * Batches multiple rapid updates to prevent excessive writes
 * 
 * @param key - Storage key
 * @param value - Value to store
 * @param delay - Debounce delay in ms (default: 300ms)
 */
export function setItemDebounced(key: string, value: any, delay: number = 300): void {
  // Clear existing timer for this key
  const existingTimer = debounceTimers.get(key)
  if (existingTimer) {
    clearTimeout(existingTimer)
  }

  // Update memory cache immediately for reads
  memoryCache.set(key, { value, timestamp: Date.now() })

  // Set new debounced timer
  const timer = setTimeout(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      debounceTimers.delete(key)
    } catch (error) {
      console.error(`Failed to write to localStorage (key: ${key}):`, error)
    }
  }, delay)

  debounceTimers.set(key, timer)
}

/**
 * Get item from localStorage with memory cache fallback
 * 
 * @param key - Storage key
 * @returns Parsed value or null
 */
export function getItem<T = any>(key: string): T | null {
  try {
    // Check memory cache first
    const cached = memoryCache.get(key)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.value as T
    }

    // Read from localStorage
    const item = localStorage.getItem(key)
    if (!item) return null

    const parsed = JSON.parse(item) as T
    
    // Update memory cache
    memoryCache.set(key, { value: parsed, timestamp: Date.now() })
    
    return parsed
  } catch (error) {
    console.error(`Failed to read from localStorage (key: ${key}):`, error)
    return null
  }
}

/**
 * Remove item from localStorage and memory cache
 * 
 * @param key - Storage key
 */
export function removeItem(key: string): void {
  try {
    // Clear any pending writes
    const timer = debounceTimers.get(key)
    if (timer) {
      clearTimeout(timer)
      debounceTimers.delete(key)
    }

    // Remove from cache
    memoryCache.delete(key)

    // Remove from localStorage
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Failed to remove from localStorage (key: ${key}):`, error)
  }
}

/**
 * Flush all pending writes immediately
 * Useful before critical operations like logout or page unload
 */
export function flushPendingWrites(): void {
  debounceTimers.forEach((timer, key) => {
    clearTimeout(timer)
    
    const cached = memoryCache.get(key)
    if (cached) {
      try {
        localStorage.setItem(key, JSON.stringify(cached.value))
      } catch (error) {
        console.error(`Failed to flush write for key ${key}:`, error)
      }
    }
  })
  
  debounceTimers.clear()
}

/**
 * Clear memory cache (useful for testing or memory management)
 */
export function clearCache(): void {
  memoryCache.clear()
}

/**
 * Set item immediately without debouncing
 * Use sparingly for critical data that must be persisted immediately
 * 
 * @param key - Storage key
 * @param value - Value to store
 */
export function setItemImmediate(key: string, value: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    memoryCache.set(key, { value, timestamp: Date.now() })
  } catch (error) {
    console.error(`Failed to write immediately to localStorage (key: ${key}):`, error)
  }
}

// Flush pending writes before page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', flushPendingWrites)
}
