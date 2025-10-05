import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/**
 * Hook for tracking component render performance
 */
export function useRenderTracker(componentName: string, enabled = false) {
  const renderCount = useRef(0)
  const startTime = useRef<number>(0)

  useEffect(() => {
    if (enabled && process.env.NODE_ENV === 'development') {
      renderCount.current += 1
      const endTime = performance.now()

      if (startTime.current > 0) {
        const renderTime = endTime - startTime.current
        // ...existing code...
      }

      startTime.current = endTime
    }
  })

  return {
    renderCount: renderCount.current,
    reset: () => {
      renderCount.current = 0
    },
  }
}

/**
 * Hook for lazy loading components with Intersection Observer
 */
export function useLazyLoad(options?: IntersectionObserverInit) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoaded) {
          setIsVisible(true)
          setIsLoaded(true)
          observer.unobserve(element)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [isLoaded, options])

  return {
    elementRef,
    isVisible,
    isLoaded,
  }
}

/**
 * Hook for debounced values with configurable delay
 */
export function useDebounced<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook for throttled values
 */
export function useThrottled<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState(value)
  const lastRan = useRef(Date.now())

  useEffect(() => {
    const handler = setTimeout(
      () => {
        if (Date.now() - lastRan.current >= delay) {
          setThrottledValue(value)
          lastRan.current = Date.now()
        }
      },
      delay - (Date.now() - lastRan.current)
    )

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return throttledValue
}

/**
 * Hook for memoizing expensive calculations
 */
export function useExpensiveCalculation<T, P extends any[]>(
  calculateFn: (...args: P) => T,
  dependencies: P
): T {
  return useMemo(() => calculateFn(...dependencies), dependencies)
}

/**
 * Hook for managing virtual scrolling performance
 */
export function useVirtualScrolling<T>(items: T[], itemHeight: number, containerHeight: number) {
  const [scrollTop, setScrollTop] = useState(0)

  const startIndex = Math.floor(scrollTop / itemHeight)
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length - 1
  )

  const visibleItems = useMemo(
    () => items.slice(startIndex, endIndex + 1),
    [items, startIndex, endIndex]
  )

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return {
    visibleItems,
    startIndex,
    endIndex,
    handleScroll,
    totalHeight: items.length * itemHeight,
    offsetY: startIndex * itemHeight,
  }
}

/**
 * Hook for monitoring memory usage (dev only)
 */
export function useMemoryMonitor(enabled = false) {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize?: number
    totalJSHeapSize?: number
    jsHeapSizeLimit?: number
  }>({})

  useEffect(() => {
    if (!enabled || process.env.NODE_ENV !== 'development') return

    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        setMemoryInfo({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        })
      }
    }

    const interval = setInterval(updateMemoryInfo, 1000)
    updateMemoryInfo()

    return () => clearInterval(interval)
  }, [enabled])

  return memoryInfo
}

/**
 * Hook for prefetching data
 */
export function usePrefetch<T>(fetchFn: () => Promise<T>, shouldPrefetch: boolean = true) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const hasPrefetched = useRef(false)

  const prefetch = useCallback(async () => {
    if (hasPrefetched.current) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await fetchFn()
      setData(result)
      hasPrefetched.current = true
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Prefetch failed'))
    } finally {
      setIsLoading(false)
    }
  }, [fetchFn])

  useEffect(() => {
    if (shouldPrefetch) {
      prefetch()
    }
  }, [shouldPrefetch, prefetch])

  return {
    data,
    isLoading,
    error,
    prefetch,
    isPrefetched: hasPrefetched.current,
  }
}

/**
 * Hook for managing component lifecycle performance
 */
export function useComponentLifecycle(componentName: string, enabled = false) {
  const mountTime = useRef<number>(0)
  const updateCount = useRef(0)

  useEffect(() => {
    if (enabled && process.env.NODE_ENV === 'development') {
      mountTime.current = performance.now()
  // ...existing code...

      return () => {
        const unmountTime = performance.now()
        const totalLifetime = unmountTime - mountTime.current
        // ...existing code...
      }
    }
  }, [componentName, enabled])

  useEffect(() => {
    if (enabled && process.env.NODE_ENV === 'development') {
      updateCount.current += 1
    }
  })

  return {
    mountTime: mountTime.current,
    updateCount: updateCount.current,
  }
}

/**
 * Hook for batching state updates
 */
export function useBatchedUpdates<T>(initialState: T) {
  const [state, setState] = useState(initialState)
  const pendingUpdates = useRef<Partial<T>[]>([])
  const timeoutRef = useRef<NodeJS.Timeout>()

  const batchUpdate = useCallback((update: Partial<T>) => {
    pendingUpdates.current.push(update)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      const updates = pendingUpdates.current
      pendingUpdates.current = []

      setState((prevState) => {
        let newState = { ...prevState }
        for (const update of updates) {
          newState = { ...newState, ...update }
        }
        return newState
      })
    }, 0)
  }, [])

  const forceFlush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    const updates = pendingUpdates.current
    pendingUpdates.current = []

    setState((prevState) => {
      let newState = { ...prevState }
      for (const update of updates) {
        newState = { ...newState, ...update }
      }
      return newState
    })
  }, [])

  return {
    state,
    batchUpdate,
    forceFlush,
  }
}
