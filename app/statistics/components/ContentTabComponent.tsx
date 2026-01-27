'use client'

import React from 'react'
import { FileText, LogIn, LogOut, TrendingUp, ArrowRight, ArrowLeft, Eye } from 'lucide-react'
import DataTable from './DataTable'
import ProgressBar from './ProgressBar'
import StatCard from './StatCard'

interface PageData {
  label: string
  nb_visits?: number
  nb_hits?: number
  nb_uniq_visitors?: number
  entry_nb_visits?: number
  exit_nb_visits?: number
  bounce_rate?: string
  avg_time_on_page?: number
  exit_rate?: string
  [key: string]: any
}

interface ContentTabProps {
  pageTitles: any
  entryPages: any
  exitPages: any
  loading?: boolean
}

export default function ContentTabComponent({
  pageTitles,
  entryPages,
  exitPages,
  loading = false,
}: ContentTabProps) {
  const pageTitlesArray = Array.isArray(pageTitles) ? pageTitles : pageTitles ? [pageTitles] : []
  const entryPagesArray = Array.isArray(entryPages) ? entryPages : entryPages ? [entryPages] : []
  const exitPagesArray = Array.isArray(exitPages) ? exitPages : exitPages ? [exitPages] : []

  // Calculate summary stats
  const totalPageViews = pageTitlesArray.reduce((sum, p) => sum + (p.nb_visits || 0), 0)
  const topPageTitle = pageTitlesArray[0]?.label || 'N/A'
  const topEntryPage = entryPagesArray[0]?.label || 'N/A'
  const topExitPage = exitPagesArray[0]?.label || 'N/A'

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Page Titles"
          value={pageTitlesArray.length}
          subtitle="Unique pages tracked"
          icon={FileText}
          variant="primary"
          loading={loading}
        />
        <StatCard
          title="Total Views"
          value={totalPageViews}
          subtitle="Across all pages"
          icon={Eye}
          loading={loading}
        />
        <StatCard
          title="Entry Points"
          value={entryPagesArray.length}
          subtitle="Landing pages"
          icon={LogIn}
          loading={loading}
        />
        <StatCard
          title="Exit Points"
          value={exitPagesArray.length}
          subtitle="Pages where users leave"
          icon={LogOut}
          loading={loading}
        />
      </div>

      {/* Top Content Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Top Page</span>
          </div>
          <p className="text-lg font-semibold text-slate-900 truncate" title={topPageTitle}>
            {topPageTitle}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            {pageTitlesArray[0]?.nb_visits?.toLocaleString() || 0} views
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <ArrowRight className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Top Entry Page</span>
          </div>
          <p className="text-lg font-semibold text-slate-900 truncate" title={topEntryPage}>
            {topEntryPage}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            {entryPagesArray[0]?.nb_visits?.toLocaleString() || 0} entries
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Top Exit Page</span>
          </div>
          <p className="text-lg font-semibold text-slate-900 truncate" title={topExitPage}>
            {topExitPage}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            {exitPagesArray[0]?.nb_visits?.toLocaleString() || 0} exits
          </p>
        </div>
      </div>

      {/* Progress Bars Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ProgressBar
          items={pageTitlesArray.slice(0, 6).map((p) => ({
            label: p.label || 'Unknown',
            value: p.nb_visits || 0,
          }))}
          title="Top Page Titles"
          subtitle="Most viewed content"
          loading={loading}
          maxItems={6}
        />

        <ProgressBar
          items={entryPagesArray.slice(0, 6).map((p) => ({
            label: p.label || 'Unknown',
            value: p.nb_visits || 0,
            color: 'bg-blue-500',
          }))}
          title="Entry Pages"
          subtitle="Where visitors land"
          loading={loading}
          maxItems={6}
        />

        <ProgressBar
          items={exitPagesArray.slice(0, 6).map((p) => ({
            label: p.label || 'Unknown',
            value: p.nb_visits || 0,
            color: 'bg-red-500',
          }))}
          title="Exit Pages"
          subtitle="Where visitors leave"
          loading={loading}
          maxItems={6}
        />
      </div>

      {/* Detailed Tables */}
      <DataTable
        data={pageTitlesArray}
        title="All Page Titles"
        subtitle="Complete content performance breakdown"
        loading={loading}
        emptyMessage="No page title data available"
        maxRows={15}
        showPagination={pageTitlesArray.length > 15}
        columns={[
          {
            key: 'label',
            header: 'Page Title',
            render: (item) => (
              <div className="flex items-center gap-2 max-w-[350px]">
                <FileText className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <span className="font-medium text-slate-700 truncate" title={item.label}>
                  {item.label}
                </span>
              </div>
            ),
          },
          {
            key: 'nb_visits',
            header: 'Views',
            align: 'right',
            render: (item) => (
              <span className="font-semibold text-slate-900">
                {item.nb_visits?.toLocaleString() || 0}
              </span>
            ),
          },
          {
            key: 'nb_uniq_visitors',
            header: 'Unique',
            align: 'right',
            render: (item) => (
              <span className="text-slate-600">{item.nb_uniq_visitors?.toLocaleString() || 0}</span>
            ),
          },
          {
            key: 'bounce_rate',
            header: 'Bounce',
            align: 'right',
            render: (item) => {
              const rate = parseFloat(item.bounce_rate || '0')
              return (
                <span
                  className={`font-medium ${
                    rate > 70 ? 'text-red-600' : rate > 40 ? 'text-amber-600' : 'text-emerald-600'
                  }`}
                >
                  {item.bounce_rate || '—'}
                </span>
              )
            },
          },
        ]}
      />

      {/* Entry & Exit Tables Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DataTable
          data={entryPagesArray}
          title="Entry Pages"
          subtitle="Where visitors first arrive"
          loading={loading}
          emptyMessage="No entry page data"
          maxRows={10}
          showPagination={entryPagesArray.length > 10}
          columns={[
            {
              key: 'label',
              header: 'Page URL',
              render: (item) => (
                <div className="flex items-center gap-2 max-w-[200px]">
                  <LogIn className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <span className="font-medium text-slate-700 truncate" title={item.label}>
                    {item.label}
                  </span>
                </div>
              ),
            },
            {
              key: 'nb_visits',
              header: 'Entries',
              align: 'right',
              render: (item) => (
                <span className="font-semibold text-slate-900">
                  {item.nb_visits?.toLocaleString() || 0}
                </span>
              ),
            },
          ]}
        />

        <DataTable
          data={exitPagesArray}
          title="Exit Pages"
          subtitle="Where visitors leave"
          loading={loading}
          emptyMessage="No exit page data"
          maxRows={10}
          showPagination={exitPagesArray.length > 10}
          columns={[
            {
              key: 'label',
              header: 'Page URL',
              render: (item) => (
                <div className="flex items-center gap-2 max-w-[200px]">
                  <LogOut className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <span className="font-medium text-slate-700 truncate" title={item.label}>
                    {item.label}
                  </span>
                </div>
              ),
            },
            {
              key: 'nb_visits',
              header: 'Exits',
              align: 'right',
              render: (item) => (
                <span className="font-semibold text-slate-900">
                  {item.nb_visits?.toLocaleString() || 0}
                </span>
              ),
            },
          ]}
        />
      </div>
    </div>
  )
}
