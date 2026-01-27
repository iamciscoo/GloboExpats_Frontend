'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react'

interface Column<T> {
  key: keyof T | string
  header: string
  render?: (item: T, index: number) => React.ReactNode
  align?: 'left' | 'center' | 'right'
  width?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  title?: string
  subtitle?: string
  loading?: boolean
  emptyMessage?: string
  maxRows?: number
  showPagination?: boolean
  className?: string
}

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  title,
  subtitle,
  loading = false,
  emptyMessage = 'No data available',
  maxRows = 10,
  showPagination = false,
  className,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = React.useState(1)
  const totalPages = Math.ceil(data.length / maxRows)

  const displayData = showPagination
    ? data.slice((currentPage - 1) * maxRows, currentPage * maxRows)
    : data.slice(0, maxRows)

  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center':
        return 'text-center'
      case 'right':
        return 'text-right'
      default:
        return 'text-left'
    }
  }

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden',
        className
      )}
    >
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      )}

      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
              <p className="text-sm text-slate-500">Loading data...</p>
            </div>
          </div>
        ) : !data || data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <svg
              className="h-12 w-12 text-slate-300 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-sm font-medium">{emptyMessage}</p>
            <p className="text-xs text-slate-400 mt-1">Data will appear here once available</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {columns.map((col, idx) => (
                  <th
                    key={String(col.key)}
                    className={cn(
                      'px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider',
                      getAlignClass(col.align),
                      col.width
                    )}
                  >
                    <span className="inline-flex items-center gap-1">{col.header}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayData.map((item, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-slate-50/50 transition-colors">
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className={cn('px-4 py-3 text-sm', getAlignClass(col.align), col.width)}
                    >
                      {col.render
                        ? col.render(item, rowIdx)
                        : (item[col.key as keyof T]?.toLocaleString?.() ??
                          item[col.key as keyof T] ??
                          '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50/50">
          <p className="text-sm text-slate-500">
            Showing {(currentPage - 1) * maxRows + 1} to{' '}
            {Math.min(currentPage * maxRows, data.length)} of {data.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-slate-600 min-w-[80px] text-center">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
