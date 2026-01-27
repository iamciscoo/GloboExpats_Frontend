'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Activity, Clock, Eye, MousePointer, Users } from 'lucide-react'

interface LiveVisitorProps {
  count: number
  loading?: boolean
  lastUpdated?: Date
}

export function LiveVisitorCount({ count, loading, lastUpdated }: LiveVisitorProps) {
  return (
    <div className="relative bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg overflow-hidden">
      {/* Animated background pulse */}
      <div
        className="absolute inset-0 bg-white/10 animate-pulse"
        style={{ animationDuration: '2s' }}
      />

      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
          </span>
          <span className="text-emerald-100 text-sm font-medium">Live Now</span>
        </div>

        {loading ? (
          <div className="h-12 w-20 bg-white/20 rounded animate-pulse" />
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold tracking-tight">{count}</span>
            <span className="text-emerald-100 text-lg">active visitors</span>
          </div>
        )}

        {lastUpdated && (
          <p className="text-emerald-200 text-xs mt-3 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Updated {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>

      <div className="absolute -right-4 -bottom-4 opacity-10">
        <Users className="h-32 w-32" />
      </div>
    </div>
  )
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
  operatingSystem?: string
  deviceType?: string
  referrerType?: string
  referrerName?: string
}

interface RecentVisitsListProps {
  visits: RecentVisit[]
  loading?: boolean
  maxItems?: number
}

export function RecentVisitsList({ visits, loading, maxItems = 8 }: RecentVisitsListProps) {
  const displayVisits = visits.slice(0, maxItems)

  const formatTime = (visit: RecentVisit) => {
    const dateStr = visit.lastActionDateTime || visit.serverDate
    if (!dateStr) return 'Unknown'
    try {
      return new Date(dateStr).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return 'Unknown'
    }
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds || seconds === 0) return '< 1s'
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Recent Visitors</h3>
            <p className="text-sm text-slate-500">Real-time visitor activity</p>
          </div>
          <Activity className="h-5 w-5 text-slate-400" />
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-24" />
                  <div className="h-3 bg-slate-200 rounded w-32" />
                </div>
                <div className="text-right space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-16" />
                  <div className="h-3 bg-slate-200 rounded w-12" />
                </div>
              </div>
            </div>
          ))
        ) : displayVisits.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Eye className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="font-medium">No recent visitors</p>
            <p className="text-sm text-slate-400">Activity will appear here in real-time</p>
          </div>
        ) : (
          displayVisits.map((visit, idx) => (
            <div key={idx} className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs font-bold">
                      {(visit.visitorId || visit.idvisitor || 'A')?.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        Visitor{' '}
                        {(visit.visitorId || visit.idvisitor || 'Anonymous')?.substring(0, 8)}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        {visit.country && <span>{visit.country}</span>}
                        {visit.browser && <span>• {visit.browser}</span>}
                        {visit.deviceType && <span>• {visit.deviceType}</span>}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <div className="flex items-center gap-1 text-sm font-medium text-slate-900">
                    <MousePointer className="h-3 w-3 text-slate-400" />
                    {visit.actions || visit.actionDetails?.length || 0} actions
                  </div>
                  <p className="text-xs text-slate-500">
                    {formatDuration(visit.visitDuration || visit.timeSpent)} • {formatTime(visit)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
