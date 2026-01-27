'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface ProgressItem {
  label: string
  value: number
  color?: string
  icon?: React.ReactNode
}

interface ProgressBarProps {
  items: ProgressItem[]
  title?: string
  subtitle?: string
  loading?: boolean
  showPercentage?: boolean
  maxItems?: number
  className?: string
}

const defaultColors = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-cyan-500',
  'bg-orange-500',
  'bg-indigo-500',
]

export default function ProgressBar({
  items,
  title,
  subtitle,
  loading = false,
  showPercentage = true,
  maxItems = 5,
  className,
}: ProgressBarProps) {
  const displayItems = items.slice(0, maxItems)
  const total = items.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className={cn('bg-white rounded-xl border border-slate-200 shadow-sm p-6', className)}>
      {(title || subtitle) && (
        <div className="mb-5">
          {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2 animate-pulse">
              <div className="flex justify-between">
                <div className="h-4 bg-slate-200 rounded w-24" />
                <div className="h-4 bg-slate-200 rounded w-12" />
              </div>
              <div className="h-2 bg-slate-200 rounded-full" />
            </div>
          ))}
        </div>
      ) : displayItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-slate-500">
          <svg
            className="h-10 w-10 text-slate-300 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <p className="text-sm font-medium">No data available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayItems.map((item, idx) => {
            const percentage = total > 0 ? (item.value / total) * 100 : 0
            const color = item.color || defaultColors[idx % defaultColors.length]

            return (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <span className="font-medium text-slate-700 truncate max-w-[180px]">
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="font-semibold">{item.value.toLocaleString()}</span>
                    {showPercentage && (
                      <span className="text-slate-400 text-xs">({percentage.toFixed(1)}%)</span>
                    )}
                  </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', color)}
                    style={{ width: `${Math.max(percentage, 1)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {items.length > maxItems && (
        <p className="text-xs text-slate-400 mt-4 text-center">
          +{items.length - maxItems} more items
        </p>
      )}
    </div>
  )
}
