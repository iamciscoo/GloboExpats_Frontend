'use client'

import React from 'react'
import {
  Users,
  Eye,
  MousePointer,
  Clock,
  TrendingUp,
  ArrowUpRight,
  Target,
  BarChart3,
} from 'lucide-react'
import StatCard from './StatCard'
import DataTable from './DataTable'
import { BarChart } from './MiniChart'
import ProgressBar from './ProgressBar'

interface VisitsSummary {
  nb_visits?: number
  nb_uniq_visitors?: number
  nb_pageviews?: number
  nb_actions?: number
  bounce_rate?: string
  avg_time_on_site?: number
  nb_actions_per_visit?: number
  max_actions?: number
  nb_users?: number
  [key: string]: any
}

interface PageUrl {
  label: string
  nb_visits?: number
  nb_hits?: number
  nb_uniq_visitors?: number
  bounce_rate?: string
  avg_time_on_page?: number
  exit_rate?: string
  [key: string]: any
}

interface OverviewTabProps {
  visitsSummary: any
  pageUrls: any
  loading?: boolean
}

export default function OverviewTab({
  visitsSummary,
  pageUrls,
  loading = false,
}: OverviewTabProps) {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0m 0s'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}m ${secs}s`
  }

  // Normalize visitsSummary to single object (already normalized by parent)
  const summaryData: VisitsSummary | null = visitsSummary || null
  const pageUrlArray = Array.isArray(pageUrls) ? pageUrls : pageUrls ? [pageUrls] : []

  // Prepare chart data from page URLs
  const chartData = pageUrlArray.slice(0, 7).map((page) => ({
    label: page.label?.split('/').pop() || page.label || 'Unknown',
    value: page.nb_visits || 0,
  }))

  // Prepare progress bar data
  const progressData = pageUrlArray.slice(0, 6).map((page) => ({
    label: page.label || 'Unknown',
    value: page.nb_visits || 0,
  }))

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Visits"
          value={summaryData?.nb_visits || 0}
          subtitle="Sessions tracked"
          icon={Eye}
          variant="primary"
          loading={loading}
        />
        <StatCard
          title="Unique Visitors"
          value={summaryData?.nb_uniq_visitors || 0}
          subtitle="Individual users"
          icon={Users}
          loading={loading}
        />
        <StatCard
          title="Page Views"
          value={summaryData?.nb_actions || summaryData?.nb_pageviews || 0}
          subtitle="Total pages viewed"
          icon={MousePointer}
          loading={loading}
        />
        <StatCard
          title="Avg. Session Duration"
          value={formatDuration(summaryData?.avg_time_on_site)}
          subtitle="Time on site"
          icon={Clock}
          loading={loading}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Bounce Rate"
          value={summaryData?.bounce_rate || '0%'}
          subtitle="Single page visits"
          icon={ArrowUpRight}
          loading={loading}
        />
        <StatCard
          title="Actions per Visit"
          value={summaryData?.nb_actions_per_visit?.toFixed(1) || '0'}
          subtitle="Avg. engagement"
          icon={Target}
          loading={loading}
        />
        <StatCard
          title="Total Actions"
          value={summaryData?.nb_actions || 0}
          subtitle="Clicks, downloads, etc."
          icon={BarChart3}
          loading={loading}
        />
        <StatCard
          title="Returning Users"
          value={summaryData?.nb_users || 0}
          subtitle="Logged in users"
          icon={TrendingUp}
          loading={loading}
        />
      </div>

      {/* Charts and Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Page Views Chart */}
        <BarChart
          data={chartData}
          title="Top Pages by Visits"
          loading={loading}
          height={180}
          color="bg-blue-500"
        />

        {/* Traffic Distribution */}
        <ProgressBar
          items={progressData}
          title="Page Traffic Distribution"
          subtitle="Showing top pages"
          loading={loading}
          maxItems={6}
        />
      </div>

      {/* Top Pages Table */}
      <DataTable
        data={pageUrlArray}
        title="All Pages Performance"
        subtitle="Detailed breakdown of page analytics"
        loading={loading}
        emptyMessage="No page data available for this period"
        maxRows={10}
        showPagination={pageUrlArray.length > 10}
        columns={[
          {
            key: 'label',
            header: 'Page URL',
            render: (item) => (
              <div className="flex items-center gap-2 max-w-[300px]">
                <span className="truncate font-medium text-slate-700" title={item.label}>
                  {item.label}
                </span>
              </div>
            ),
          },
          {
            key: 'nb_visits',
            header: 'Visits',
            align: 'right',
            render: (item) => (
              <span className="font-semibold text-slate-900">
                {item.nb_visits?.toLocaleString() || 0}
              </span>
            ),
          },
          {
            key: 'nb_uniq_visitors',
            header: 'Unique Visitors',
            align: 'right',
            render: (item) => (
              <span className="text-slate-600">{item.nb_uniq_visitors?.toLocaleString() || 0}</span>
            ),
          },
          {
            key: 'bounce_rate',
            header: 'Bounce Rate',
            align: 'right',
            render: (item) => (
              <span
                className={`font-medium ${
                  parseFloat(item.bounce_rate || '0') > 70
                    ? 'text-red-600'
                    : parseFloat(item.bounce_rate || '0') > 40
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                }`}
              >
                {item.bounce_rate || '—'}
              </span>
            ),
          },
          {
            key: 'avg_time_on_page',
            header: 'Avg. Time',
            align: 'right',
            render: (item) => (
              <span className="text-slate-600">{formatDuration(item.avg_time_on_page)}</span>
            ),
          },
        ]}
      />
    </div>
  )
}
