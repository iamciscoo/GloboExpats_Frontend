'use client'

import React, { useEffect, useState } from 'react'
import { RefreshCw, Zap } from 'lucide-react'
import { LiveVisitorCount, RecentVisitsList } from './LiveIndicator'
import StatCard from './StatCard'
import DataTable from './DataTable'

interface LiveCounter {
  visits?: number
  nb_visits?: number
  actions?: number
  visitors?: number
  visitsConverted?: number
}

interface RecentVisit {
  visitorId?: string
  idvisitor?: string
  lastActionDateTime?: string
  serverDate?: string
  actions?: number
  actionDetails?: any[]
  visitDuration?: number
  timeSpent?: number
  country?: string
  countryCode?: string
  browser?: string
  browserName?: string
  operatingSystem?: string
  operatingSystemName?: string
  deviceType?: string
  referrerType?: string
  referrerName?: string
  referrerUrl?: string
  userId?: string
  goalConversions?: number
}

interface RealtimeTabProps {
  liveVisitors: any
  recentVisits: any
  loading?: boolean
  onRefresh?: () => void
}

export default function RealtimeTab({
  liveVisitors,
  recentVisits,
  loading = false,
  onRefresh,
}: RealtimeTabProps) {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Extract live count - handle different response formats
  const getLiveCount = () => {
    if (!liveVisitors) return 0
    if (Array.isArray(liveVisitors)) {
      // Matomo returns array for Live.getCounters
      const counter = liveVisitors[0]
      return counter?.visits || counter?.nb_visits || counter?.visitors || 0
    }
    return liveVisitors.visits || liveVisitors.nb_visits || liveVisitors.visitors || 0
  }

  const getLiveActions = () => {
    if (!liveVisitors) return 0
    if (Array.isArray(liveVisitors)) {
      return liveVisitors[0]?.actions || 0
    }
    return liveVisitors.actions || 0
  }

  const recentVisitsArray = Array.isArray(recentVisits)
    ? recentVisits
    : recentVisits
      ? [recentVisits]
      : []

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && onRefresh) {
      const interval = setInterval(() => {
        onRefresh()
        setLastUpdated(new Date())
      }, 30000) // Refresh every 30 seconds

      return () => clearInterval(interval)
    }
  }, [autoRefresh, onRefresh])

  // Calculate stats from recent visits
  const totalActions = recentVisitsArray.reduce(
    (sum, v) => sum + (v.actions || v.actionDetails?.length || 0),
    0
  )
  const avgDuration =
    recentVisitsArray.length > 0
      ? Math.round(
          recentVisitsArray.reduce((sum, v) => sum + (v.visitDuration || v.timeSpent || 0), 0) /
            recentVisitsArray.length
        )
      : 0

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-emerald-500" />
          <h2 className="text-lg font-semibold text-slate-900">Real-time Analytics</h2>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Auto-refresh
          </label>
          <button
            onClick={() => {
              onRefresh?.()
              setLastUpdated(new Date())
            }}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Live Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="md:col-span-2 lg:col-span-1">
          <LiveVisitorCount count={getLiveCount()} loading={loading} lastUpdated={lastUpdated} />
        </div>

        <StatCard
          title="Live Actions"
          value={getLiveActions()}
          subtitle="In last 30 minutes"
          variant="warning"
          loading={loading}
        />

        <StatCard
          title="Recent Visitors"
          value={recentVisitsArray.length}
          subtitle="In this period"
          loading={loading}
        />

        <StatCard
          title="Avg. Session"
          value={formatDuration(avgDuration)}
          subtitle="Recent visits"
          loading={loading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Visitors List */}
        <RecentVisitsList
          visits={recentVisitsArray.map((v) => ({
            ...v,
            browser: v.browserName || v.browser,
            operatingSystem: v.operatingSystemName || v.operatingSystem,
          }))}
          loading={loading}
          maxItems={8}
        />

        {/* Detailed Visitor Table */}
        <DataTable
          data={recentVisitsArray}
          title="Visitor Details"
          subtitle="Recent visitor information"
          loading={loading}
          emptyMessage="No recent visitors"
          maxRows={8}
          columns={[
            {
              key: 'visitorId',
              header: 'Visitor',
              render: (item) => (
                <span className="font-mono text-xs text-slate-600">
                  {(item.visitorId || item.idvisitor || item.userId || 'Anonymous')?.substring(
                    0,
                    10
                  )}
                </span>
              ),
            },
            {
              key: 'country',
              header: 'Location',
              render: (item) => (
                <span className="text-slate-600 text-sm">{item.country || 'Unknown'}</span>
              ),
            },
            {
              key: 'actions',
              header: 'Actions',
              align: 'center',
              render: (item) => (
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                  {item.actions || item.actionDetails?.length || 0}
                </span>
              ),
            },
            {
              key: 'referrer',
              header: 'Source',
              render: (item) => (
                <span
                  className="text-slate-600 text-sm truncate max-w-[100px]"
                  title={item.referrerName || item.referrerUrl}
                >
                  {item.referrerName || item.referrerType || 'Direct'}
                </span>
              ),
            },
          ]}
        />
      </div>

      {/* Full Details Table */}
      <DataTable
        data={recentVisitsArray}
        title="Complete Visit Log"
        subtitle="Full details of recent visitor sessions"
        loading={loading}
        emptyMessage="No visitor data available"
        maxRows={15}
        showPagination={recentVisitsArray.length > 15}
        columns={[
          {
            key: 'time',
            header: 'Time',
            render: (item) => {
              const dateStr = item.lastActionDateTime || item.serverDate
              if (!dateStr) return '—'
              try {
                return new Date(dateStr).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })
              } catch {
                return '—'
              }
            },
          },
          {
            key: 'visitor',
            header: 'Visitor ID',
            render: (item) => (
              <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                {(item.visitorId || item.idvisitor || 'Anonymous')?.substring(0, 12)}
              </span>
            ),
          },
          {
            key: 'country',
            header: 'Country',
          },
          {
            key: 'browser',
            header: 'Browser',
            render: (item) => item.browserName || item.browser || '—',
          },
          {
            key: 'device',
            header: 'Device',
            render: (item) => item.deviceType || '—',
          },
          {
            key: 'actions',
            header: 'Actions',
            align: 'center',
            render: (item) => (
              <span className="font-semibold">
                {item.actions || item.actionDetails?.length || 0}
              </span>
            ),
          },
          {
            key: 'duration',
            header: 'Duration',
            align: 'right',
            render: (item) => formatDuration(item.visitDuration || item.timeSpent || 0),
          },
        ]}
      />
    </div>
  )
}
