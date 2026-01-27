'use client'

import { useState, useCallback, useMemo } from 'react'
import { useMatomo } from '@/hooks/use-matomo'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  LayoutDashboard,
  Users,
  Monitor,
  FileText,
  Zap,
  Calendar,
  RefreshCw,
  AlertCircle,
  BarChart3,
  UserCircle,
} from 'lucide-react'

import OverviewTab from './components/OverviewTab'
import AudienceTab from './components/AudienceTab'
import TechnologyTab from './components/TechnologyTab'
import ContentTabComponent from './components/ContentTabComponent'
import RealtimeTab from './components/RealtimeTab'
import UserActivityTab from './components/UserActivityTab'

// Utility to normalize Matomo data - handles both flat arrays and date-keyed objects
function normalizeData(data: any): any[] {
  if (!data) return []
  if (Array.isArray(data)) return data
  // Handle date-keyed object (e.g., { "2026-01-21": [...], "2026-01-22": [...] })
  if (typeof data === 'object') {
    const values = Object.values(data)
    // Check if values are arrays (date-keyed format)
    if (values.length > 0 && Array.isArray(values[0])) {
      // Flatten and aggregate by label
      const aggregated: Record<string, any> = {}
      values.forEach((arr: any) => {
        if (Array.isArray(arr)) {
          arr.forEach((item: any) => {
            const key = item.label || 'Unknown'
            if (!aggregated[key]) {
              aggregated[key] = { ...item }
            } else {
              // Sum numeric values
              aggregated[key].nb_visits = (aggregated[key].nb_visits || 0) + (item.nb_visits || 0)
              aggregated[key].nb_uniq_visitors = (aggregated[key].nb_uniq_visitors || 0) + (item.nb_uniq_visitors || 0)
              aggregated[key].nb_actions = (aggregated[key].nb_actions || 0) + (parseInt(item.nb_actions) || 0)
              aggregated[key].nb_hits = (aggregated[key].nb_hits || 0) + (item.nb_hits || 0)
            }
          })
        }
      })
      return Object.values(aggregated).sort((a: any, b: any) => (b.nb_visits || 0) - (a.nb_visits || 0))
    }
    // Single object (like VisitsSummary.get for single day)
    return [data]
  }
  return []
}

// Utility to normalize summary data (single object or date-keyed)
function normalizeSummary(data: any): any {
  if (!data) return null
  if (Array.isArray(data)) return data[0] || null
  if (typeof data === 'object') {
    const keys = Object.keys(data)
    // Check if it looks like date keys
    if (keys.length > 0 && /^\d{4}-\d{2}-\d{2}$/.test(keys[0])) {
      // Aggregate all date values
      const aggregated: any = {}
      keys.forEach((dateKey) => {
        const dayData = data[dateKey]
        if (dayData && typeof dayData === 'object' && !Array.isArray(dayData)) {
          Object.keys(dayData).forEach((field) => {
            if (typeof dayData[field] === 'number') {
              aggregated[field] = (aggregated[field] || 0) + dayData[field]
            } else if (typeof dayData[field] === 'string' && !aggregated[field]) {
              aggregated[field] = dayData[field]
            }
          })
        }
      })
      // Calculate averages for rate fields
      if (aggregated.bounce_count && aggregated.nb_visits) {
        aggregated.bounce_rate = Math.round((aggregated.bounce_count / aggregated.nb_visits) * 100) + '%'
      }
      if (aggregated.sum_visit_length && aggregated.nb_visits) {
        aggregated.avg_time_on_site = Math.round(aggregated.sum_visit_length / aggregated.nb_visits)
      }
      if (aggregated.nb_actions && aggregated.nb_visits) {
        aggregated.nb_actions_per_visit = Math.round((aggregated.nb_actions / aggregated.nb_visits) * 10) / 10
      }
      return aggregated
    }
    // Already a single object
    return data
  }
  return null
}

type Period = 'day' | 'week' | 'month' | 'year'
type DateRange = 'today' | 'yesterday' | 'last7' | 'last30' | 'lastMonth' | 'lastYear'

const periodOptions: { value: Period; label: string }[] = [
  { value: 'day', label: 'Daily' },
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
  { value: 'year', label: 'Yearly' },
]

const dateRangeOptions: { value: DateRange; label: string; description: string }[] = [
  { value: 'today', label: 'Today', description: 'Current day' },
  { value: 'yesterday', label: 'Yesterday', description: 'Previous day' },
  { value: 'last7', label: 'Last 7 Days', description: 'Past week' },
  { value: 'last30', label: 'Last 30 Days', description: 'Past month' },
  { value: 'lastMonth', label: 'Last Month', description: 'Previous month' },
  { value: 'lastYear', label: 'Last Year', description: 'Previous year' },
]

export default function StatisticsPage() {
  const [period, setPeriod] = useState<Period>('day')
  const [dateRange, setDateRange] = useState<DateRange>('last7')
  const [activeTab, setActiveTab] = useState('overview')
  const [refreshKey, setRefreshKey] = useState(0)

  const getMatomoDate = useCallback((range: DateRange): string => {
    const dateMap: Record<DateRange, string> = {
      today: 'today',
      yesterday: 'yesterday',
      last7: 'last7',
      last30: 'last30',
      lastMonth: 'lastMonth',
      lastYear: 'lastYear',
    }
    return dateMap[range]
  }, [])

  // Create stable options objects
  const matomoDate = useMemo(() => getMatomoDate(dateRange), [dateRange, getMatomoDate])

  // Core analytics data
  const {
    data: visitsSummary,
    loading: loadingVisits,
    error: errorVisits,
    refetch: refetchVisits,
  } = useMatomo({
    method: 'VisitsSummary.get',
    period,
    date: matomoDate,
    _key: refreshKey,
  })

  const {
    data: pageUrls,
    loading: loadingPages,
    error: errorPages,
    refetch: refetchPages,
  } = useMatomo({
    method: 'Actions.getPageUrls',
    period,
    date: matomoDate,
    filter_limit: '50',
    _key: refreshKey,
  })

  // Audience data
  const {
    data: countries,
    loading: loadingCountries,
    refetch: refetchCountries,
  } = useMatomo({
    method: 'UserCountry.getCountry',
    period,
    date: matomoDate,
    filter_limit: '50',
    _key: refreshKey,
  })

  const {
    data: continents,
    loading: loadingContinents,
    refetch: refetchContinents,
  } = useMatomo({
    method: 'UserCountry.getContinent',
    period,
    date: matomoDate,
    _key: refreshKey,
  })

  const {
    data: cities,
    loading: loadingCities,
    refetch: refetchCities,
  } = useMatomo({
    method: 'UserCountry.getCity',
    period,
    date: matomoDate,
    filter_limit: '30',
    _key: refreshKey,
  })

  const {
    data: languages,
    loading: loadingLanguages,
    refetch: refetchLanguages,
  } = useMatomo({
    method: 'UserLanguage.getLanguage',
    period,
    date: matomoDate,
    _key: refreshKey,
  })

  // Technology data
  const {
    data: deviceTypes,
    loading: loadingDeviceTypes,
    refetch: refetchDevices,
  } = useMatomo({
    method: 'DevicesDetection.getType',
    period,
    date: matomoDate,
    _key: refreshKey,
  })

  const {
    data: browsers,
    loading: loadingBrowsers,
    refetch: refetchBrowsers,
  } = useMatomo({
    method: 'DevicesDetection.getBrowsers',
    period,
    date: matomoDate,
    filter_limit: '20',
    _key: refreshKey,
  })

  const {
    data: operatingSystems,
    loading: loadingOS,
    refetch: refetchOS,
  } = useMatomo({
    method: 'DevicesDetection.getOsVersions',
    period,
    date: matomoDate,
    filter_limit: '20',
    _key: refreshKey,
  })

  // Content data
  const {
    data: pageTitles,
    loading: loadingPageTitles,
    refetch: refetchTitles,
  } = useMatomo({
    method: 'Actions.getPageTitles',
    period,
    date: matomoDate,
    filter_limit: '50',
    _key: refreshKey,
  })

  const {
    data: entryPages,
    loading: loadingEntryPages,
    refetch: refetchEntry,
  } = useMatomo({
    method: 'Actions.getEntryPageUrls',
    period,
    date: matomoDate,
    filter_limit: '30',
    _key: refreshKey,
  })

  const {
    data: exitPages,
    loading: loadingExitPages,
    refetch: refetchExit,
  } = useMatomo({
    method: 'Actions.getExitPageUrls',
    period,
    date: matomoDate,
    filter_limit: '30',
    _key: refreshKey,
  })

  // Real-time data
  const {
    data: liveVisitors,
    loading: loadingLive,
    refetch: refetchLive,
  } = useMatomo({
    method: 'Live.getCounters',
    lastMinutes: '30',
    _key: refreshKey,
  })

  const {
    data: recentVisits,
    loading: loadingRecent,
    refetch: refetchRecent,
  } = useMatomo({
    method: 'Live.getLastVisitsDetails',
    period: 'day',
    date: 'today',
    filter_limit: '20',
    _key: refreshKey,
  })

  // Loading states by tab
  const overviewLoading = loadingVisits || loadingPages
  const audienceLoading = loadingCountries || loadingContinents || loadingCities || loadingLanguages
  const technologyLoading = loadingDeviceTypes || loadingBrowsers || loadingOS
  const contentLoading = loadingPageTitles || loadingEntryPages || loadingExitPages
  const realtimeLoading = loadingLive || loadingRecent

  const isLoading =
    overviewLoading || audienceLoading || technologyLoading || contentLoading || realtimeLoading
  const hasError = errorVisits || errorPages

  // Refresh handlers
  const handleRefreshAll = useCallback(() => {
    setRefreshKey((prev) => prev + 1)
  }, [])

  const handleRefreshRealtime = useCallback(() => {
    refetchLive()
    refetchRecent()
  }, [refetchLive, refetchRecent])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                    Analytics Dashboard
                  </h1>
                  <p className="text-sm text-slate-500 hidden sm:block">
                    Track your site performance and user activity
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefreshAll}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 shadow-sm"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1">
              <span className="block text-sm font-medium text-slate-700 mb-2">
                <Calendar className="inline-block h-4 w-4 mr-1.5 text-slate-400" />
                Time Period
              </span>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Time period selection">
                {periodOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setPeriod(option.value)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      period === option.value
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1">
              <label htmlFor="date-range" className="block text-sm font-medium text-slate-700 mb-2">
                Date Range
              </label>
              <select
                id="date-range"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as DateRange)}
                className="w-full sm:w-auto px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              >
                {dateRangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span
                className={`h-2 w-2 rounded-full ${isLoading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}
              />
              {isLoading ? 'Loading...' : 'Data ready'}
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {hasError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-red-800">Error Loading Analytics Data</h3>
                <p className="text-sm text-red-700 mt-1">{errorVisits || errorPages}</p>
                <p className="text-xs text-red-600 mt-2">
                  Make sure MATOMO_TOKEN and MATOMO_SITE_ID environment variables are configured
                  correctly.
                </p>
                <button
                  onClick={handleRefreshAll}
                  className="mt-3 text-sm font-medium text-red-700 hover:text-red-800 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-1.5">
            <TabsList className="grid w-full grid-cols-6 gap-1 bg-transparent">
              <TabsTrigger
                value="overview"
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-blue-500/30 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-purple-500/30 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                <UserCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Users</span>
              </TabsTrigger>
              <TabsTrigger
                value="audience"
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-blue-500/30 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Audience</span>
              </TabsTrigger>
              <TabsTrigger
                value="technology"
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-blue-500/30 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                <Monitor className="h-4 w-4" />
                <span className="hidden sm:inline">Technology</span>
              </TabsTrigger>
              <TabsTrigger
                value="content"
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-blue-500/30 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Content</span>
              </TabsTrigger>
              <TabsTrigger
                value="realtime"
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-emerald-500/30 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                <Zap className="h-4 w-4" />
                <span className="hidden sm:inline">Real-time</span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Contents */}
          <TabsContent value="overview" className="mt-6">
            <OverviewTab
              visitsSummary={normalizeSummary(visitsSummary)}
              pageUrls={normalizeData(pageUrls)}
              loading={overviewLoading}
            />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <UserActivityTab period={period} date={matomoDate} />
          </TabsContent>

          <TabsContent value="audience" className="mt-6">
            <AudienceTab
              countries={normalizeData(countries)}
              continents={normalizeData(continents)}
              cities={normalizeData(cities)}
              languages={normalizeData(languages)}
              loading={audienceLoading}
            />
          </TabsContent>

          <TabsContent value="technology" className="mt-6">
            <TechnologyTab
              deviceTypes={normalizeData(deviceTypes)}
              browsers={normalizeData(browsers)}
              operatingSystems={normalizeData(operatingSystems)}
              loading={technologyLoading}
            />
          </TabsContent>

          <TabsContent value="content" className="mt-6">
            <ContentTabComponent
              pageTitles={normalizeData(pageTitles)}
              entryPages={normalizeData(entryPages)}
              exitPages={normalizeData(exitPages)}
              loading={contentLoading}
            />
          </TabsContent>

          <TabsContent value="realtime" className="mt-6">
            <RealtimeTab
              liveVisitors={liveVisitors}
              recentVisits={recentVisits}
              loading={realtimeLoading}
              onRefresh={handleRefreshRealtime}
            />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>Powered by Matomo Analytics • Data updates every 30 seconds for real-time stats</p>
        </div>
      </div>
    </div>
  )
}
