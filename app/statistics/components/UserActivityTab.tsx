'use client'

import React, { useState, useMemo } from 'react'
import {
  User,
  Search,
  Clock,
  Globe,
  Monitor,
  MousePointer,
  Eye,
  Calendar,
  Activity,
  ChevronRight,
  MapPin,
  Smartphone,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  Timer,
} from 'lucide-react'
import { useMatomo } from '@/hooks/use-matomo'

interface UserActivityTabProps {
  period: string
  date: string
}

interface UserData {
  label: string
  nb_visits: number
  nb_actions: number
  [key: string]: unknown
}

interface VisitAction {
  type: string
  url?: string
  pageTitle?: string
  timestamp?: number
  timeSpent?: string
  icon?: string
  [key: string]: unknown
}

interface VisitDetail {
  idVisit: string
  visitIp: string
  visitorId: string
  userId?: string
  visitDuration: number
  visitDurationPretty?: string
  actions: number
  country: string
  countryFlag?: string
  city?: string
  region?: string
  browserName: string
  browserIcon?: string
  operatingSystem: string
  operatingSystemIcon?: string
  deviceType: string
  deviceTypeIcon?: string
  referrerType?: string
  referrerName?: string
  serverTimePretty?: string
  actionDetails?: VisitAction[]
  [key: string]: unknown
}

export default function UserActivityTab({ period, date }: UserActivityTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Fetch users list
  const { data: usersData, loading: loadingUsers } = useMatomo({
    method: 'UserId.getUsers',
    period,
    date,
    filter_limit: '100',
    _key: refreshKey,
  })

  // Fetch selected user's visits using segment
  const { data: userVisits, loading: loadingVisits } = useMatomo({
    method: 'Live.getLastVisitsDetails',
    period,
    date,
    segment: selectedUser ? `userId==${selectedUser}` : undefined,
    filter_limit: '50',
    _key: refreshKey,
  })

  const users = useMemo(() => {
    if (!usersData) return []
    return Array.isArray(usersData) ? (usersData as UserData[]) : []
  }, [usersData])

  const visits = useMemo(() => {
    if (!userVisits || !selectedUser) return []
    return Array.isArray(userVisits) ? (userVisits as VisitDetail[]) : []
  }, [userVisits, selectedUser])

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users
    const term = searchTerm.toLowerCase()
    return users.filter((user: UserData) => user.label && user.label.toLowerCase().includes(term))
  }, [users, searchTerm])

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const handleSelectUser = (userId: string) => {
    setSelectedUser(userId)
  }

  const handleBackToList = () => {
    setSelectedUser(null)
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${mins}m`
  }

  // User List View
  if (!selectedUser) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">User Activity Tracking</h2>
            <p className="text-sm text-slate-500">
              Select a user to view their complete activity history
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loadingUsers}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 ${loadingUsers ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search users by ID or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
        </div>

        {/* Users List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loadingUsers ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
                <RefreshCw className="h-6 w-6 text-slate-400 animate-spin" />
              </div>
              <p className="text-sm text-slate-500">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
                <User className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-900">No users found</p>
              <p className="text-xs text-slate-500 mt-1">
                {searchTerm
                  ? 'Try a different search term'
                  : 'No users with User ID have been tracked yet'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredUsers.map((user: UserData, index: number) => (
                <button
                  key={user.label || index}
                  onClick={() => handleSelectUser(user.label)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold text-sm shadow-sm">
                      {user.label?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                        {user.label || 'Unknown User'}
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Eye className="h-3 w-3" />
                          {user.nb_visits || 0} visits
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <MousePointer className="h-3 w-3" />
                          {user.nb_actions || 0} actions
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Stats Summary */}
        {users.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Total Users
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{users.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Total Visits
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {users.reduce((sum: number, u: UserData) => sum + (u.nb_visits || 0), 0)}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Total Actions
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {users.reduce((sum: number, u: UserData) => sum + (u.nb_actions || 0), 0)}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Avg Actions/User
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {users.length > 0
                  ? Math.round(
                      users.reduce((sum: number, u: UserData) => sum + (u.nb_actions || 0), 0) /
                        users.length
                    )
                  : 0}
              </p>
            </div>
          </div>
        )}
      </div>
    )
  }

  // User Detail View
  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToList}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-lg shadow-lg shadow-blue-500/30">
              {selectedUser?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{selectedUser}</h2>
              <p className="text-sm text-slate-500">
                {visits.length} visit{visits.length !== 1 ? 's' : ''} recorded
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loadingVisits}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 shadow-sm"
        >
          <RefreshCw className={`h-4 w-4 ${loadingVisits ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Visit List */}
      {loadingVisits ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
            <RefreshCw className="h-6 w-6 text-slate-400 animate-spin" />
          </div>
          <p className="text-sm text-slate-500">Loading user activity...</p>
        </div>
      ) : visits.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
            <Activity className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-900">No visits found</p>
          <p className="text-xs text-slate-500 mt-1">
            This user has no recorded visits in the selected time period
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visits.map((visit: VisitDetail, visitIndex: number) => (
            <div
              key={visit.idVisit || visitIndex}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
            >
              {/* Visit Header */}
              <div className="p-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      {visit.serverTimePretty || 'Unknown time'}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Timer className="h-4 w-4 text-slate-400" />
                      {visit.visitDurationPretty || formatDuration(visit.visitDuration || 0)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MousePointer className="h-4 w-4 text-slate-400" />
                      {visit.actions || 0} actions
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {visit.countryFlag && (
                      <img
                        src={visit.countryFlag}
                        alt={visit.country}
                        className="h-4 w-6 object-cover rounded"
                      />
                    )}
                    <span className="text-sm text-slate-600">
                      {[visit.city, visit.region, visit.country].filter(Boolean).join(', ') ||
                        'Unknown location'}
                    </span>
                  </div>
                </div>

                {/* Device Info */}
                <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Monitor className="h-3.5 w-3.5" />
                    {visit.browserName || 'Unknown browser'}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Smartphone className="h-3.5 w-3.5" />
                    {visit.deviceType || 'Unknown device'}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Globe className="h-3.5 w-3.5" />
                    {visit.operatingSystem || 'Unknown OS'}
                  </div>
                  {visit.referrerName && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <ExternalLink className="h-3.5 w-3.5" />
                      From: {visit.referrerName}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Timeline */}
              {visit.actionDetails && visit.actionDetails.length > 0 && (
                <div className="p-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                    Activity Timeline
                  </p>
                  <div className="space-y-2">
                    {visit.actionDetails
                      .slice(0, 10)
                      .map((action: VisitAction, actionIndex: number) => (
                        <div
                          key={actionIndex}
                          className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                            {action.type === 'action' ? (
                              <Eye className="h-4 w-4 text-blue-500" />
                            ) : action.type === 'event' ? (
                              <Activity className="h-4 w-4 text-purple-500" />
                            ) : (
                              <MousePointer className="h-4 w-4 text-slate-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {action.pageTitle || action.url || 'Unknown action'}
                            </p>
                            {action.url && (
                              <p className="text-xs text-slate-500 truncate mt-0.5">{action.url}</p>
                            )}
                            {action.timeSpent && (
                              <p className="text-xs text-slate-400 mt-1">
                                <Clock className="inline h-3 w-3 mr-1" />
                                {action.timeSpent}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    {visit.actionDetails.length > 10 && (
                      <p className="text-xs text-center text-slate-500 py-2">
                        + {visit.actionDetails.length - 10} more actions
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
