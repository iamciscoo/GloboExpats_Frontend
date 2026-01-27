import { useState, useEffect, useCallback } from 'react'

interface MatomoData {
  nb_visits?: number
  nb_uniq_visitors?: number
  nb_actions?: number
  nb_pageviews?: number
  sum_visit_length?: number
  bounce_count?: number
  bounce_rate?: string
  avg_time_on_site?: number
  nb_actions_per_visit?: number
  conversion_rate?: number
  [key: string]: any
}

interface UseMatomoAnalyticsOptions {
  method?: string
  period?: string
  date?: string
  idSite?: string
  filter_limit?: string
  lastMinutes?: string
  _key?: number // For forcing refetch
  [key: string]: any
}

export function useMatomo(options: UseMatomoAnalyticsOptions = {}) {
  const {
    method = 'VisitsSummary.get',
    period = 'day',
    date = 'today',
    idSite = '1',
    _key, // Extract _key to not send it to API
    ...restOptions
  } = options

  const [data, setData] = useState<MatomoData | MatomoData[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      params.append('method', method)
      params.append('period', period)
      params.append('date', date)
      params.append('idSite', idSite)
      
      // Add any additional options (excluding _key)
      for (const [key, value] of Object.entries(restOptions)) {
        if (value !== undefined && key !== '_key') {
          params.append(key, String(value))
        }
      }

      const response = await fetch(`/api/matomo?${params.toString()}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to fetch analytics: ${response.statusText}`)
      }

      const result = await response.json()
      
      // Handle Matomo error responses
      if (result && typeof result === 'object' && result.result === 'error') {
        throw new Error(result.message || 'Matomo API error')
      }
      
      // Handle both single object and array responses from Matomo
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
      console.error('[useMatomo] Error:', { method, error: err })
    } finally {
      setLoading(false)
    }
  }, [method, period, date, idSite, JSON.stringify(restOptions)])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics, _key])

  return {
    data,
    loading,
    error,
    refetch: fetchAnalytics,
  }
}
