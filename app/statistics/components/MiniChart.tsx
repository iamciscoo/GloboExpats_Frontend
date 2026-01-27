'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface DataPoint {
  label: string
  value: number
}

interface MiniChartProps {
  data: DataPoint[]
  title?: string
  loading?: boolean
  height?: number
  className?: string
  color?: string
}

export function BarChart({
  data,
  title,
  loading,
  height = 120,
  className,
  color = 'bg-blue-500',
}: MiniChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className={cn('bg-white rounded-xl border border-slate-200 shadow-sm p-6', className)}>
      {title && <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>}

      {loading ? (
        <div className="flex items-end justify-between gap-2" style={{ height }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-slate-200 rounded-t animate-pulse"
              style={{ height: `${30 + Math.random() * 70}%` }}
            />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center text-slate-400" style={{ height }}>
          No data
        </div>
      ) : (
        <div className="flex items-end justify-between gap-1.5" style={{ height }}>
          {data.map((point, idx) => {
            const barHeight = (point.value / maxValue) * 100
            return (
              <div key={idx} className="flex-1 flex flex-col items-center group">
                <div className="w-full relative">
                  <div
                    className={cn(
                      'w-full rounded-t transition-all duration-300 hover:opacity-80',
                      color
                    )}
                    style={{
                      height: `${Math.max(barHeight, 2)}%`,
                      minHeight: '4px',
                    }}
                  />
                  {/* Tooltip */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                    {point.value.toLocaleString()}
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 mt-1.5 truncate w-full text-center">
                  {point.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

interface DonutChartProps {
  data: DataPoint[]
  title?: string
  loading?: boolean
  size?: number
  className?: string
  colors?: string[]
}

const defaultDonutColors = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
]

export function DonutChart({
  data,
  title,
  loading,
  size = 160,
  className,
  colors = defaultDonutColors,
}: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  const radius = size / 2 - 20
  const circumference = 2 * Math.PI * radius

  let cumulativePercentage = 0

  return (
    <div className={cn('bg-white rounded-xl border border-slate-200 shadow-sm p-6', className)}>
      {title && <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>}

      {loading ? (
        <div className="flex items-center justify-center" style={{ height: size }}>
          <div className="h-24 w-24 rounded-full border-8 border-slate-200 animate-pulse" />
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center text-slate-400" style={{ height: size }}>
          No data
        </div>
      ) : (
        <div className="flex items-center gap-6">
          <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
              {data.map((point, idx) => {
                const percentage = (point.value / total) * 100
                const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`
                const strokeDashoffset = -(cumulativePercentage / 100) * circumference
                cumulativePercentage += percentage

                return (
                  <circle
                    key={idx}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={colors[idx % colors.length]}
                    strokeWidth={20}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-500"
                  />
                )
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-900">{total.toLocaleString()}</span>
              <span className="text-xs text-slate-500">Total</span>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            {data.slice(0, 5).map((point, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: colors[idx % colors.length] }}
                  />
                  <span className="text-slate-600 truncate max-w-[120px]">{point.label}</span>
                </div>
                <span className="font-medium text-slate-900">{point.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
