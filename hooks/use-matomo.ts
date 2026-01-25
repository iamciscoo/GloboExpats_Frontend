import { useState, useEffect } from 'react'

interface MatomoData {
  nb_visits?: number
  nb_uniq_visitors?: number
  nb_actions?: number
  sum_visit_length?: number
  bounce_count?: number
  conversion_rate?: number
  [key: string]: any
}

interface UseMatomoAnalyticsOptions {
  method?: string
  period?: string
  date?: string
  idSite?: string
  [key: string]: any
}

export function useMatomo(options: UseMatomoAnalyticsOptions = {}) {
  const { method = 'VisitsSummary.get', period = 'day', date = 'today', idSite = '1' } = options

  const [data, setData] = useState<MatomoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      for (const [key, value] of Object.entries(options)) {
        if (value !== undefined) {
          params.append(key, String(value))
        }
      }

      const response = await fetch(`/api/matomo?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`)
      }

      const result = await response.json()

      // Debug logging
      console.log(`[useMatomo] ${method}:`, {
        hasData: !!result,
        isArray: Array.isArray(result),
        length: Array.isArray(result) ? result.length : 'N/A',
        sample: Array.isArray(result) && result.length > 0 ? result[0] : result,
      })

      // Handle both single object and array responses from Matomo
      // For arrays (like page lists, country lists), return the full array
      // For single objects (like visit summaries), return the object
      if (Array.isArray(result)) {
        setData(result)
      } else if (typeof result === 'object' && result !== null) {
        setData(result)
      } else {
        setData(null)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Analytics fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [JSON.stringify(options)])

  return {
    data,
    loading,
    error,
    refetch: fetchAnalytics,
  }
}
