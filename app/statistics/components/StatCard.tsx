'use client'

import React from 'react'
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  trend?: {
    value: number
    label: string
  }
  loading?: boolean
  className?: string
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
}

const variantStyles = {
  default: 'bg-white border-slate-200',
  primary: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-600',
  success: 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-emerald-600',
  warning: 'bg-gradient-to-br from-amber-500 to-amber-600 text-white border-amber-600',
  danger: 'bg-gradient-to-br from-red-500 to-red-600 text-white border-red-600',
}

const textStyles = {
  default: {
    title: 'text-slate-500',
    value: 'text-slate-900',
    subtitle: 'text-slate-400',
  },
  primary: {
    title: 'text-blue-100',
    value: 'text-white',
    subtitle: 'text-blue-200',
  },
  success: {
    title: 'text-emerald-100',
    value: 'text-white',
    subtitle: 'text-emerald-200',
  },
  warning: {
    title: 'text-amber-100',
    value: 'text-white',
    subtitle: 'text-amber-200',
  },
  danger: {
    title: 'text-red-100',
    value: 'text-white',
    subtitle: 'text-red-200',
  },
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  loading = false,
  className,
  variant = 'default',
}: StatCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null
    if (trend.value > 0) return <TrendingUp className="h-3 w-3" />
    if (trend.value < 0) return <TrendingDown className="h-3 w-3" />
    return <Minus className="h-3 w-3" />
  }

  const getTrendColor = () => {
    if (!trend) return ''
    if (variant !== 'default') return 'text-white/80'
    if (trend.value > 0) return 'text-emerald-600'
    if (trend.value < 0) return 'text-red-600'
    return 'text-slate-500'
  }

  return (
    <div
      className={cn(
        'relative rounded-xl border p-6 shadow-sm transition-all duration-200 hover:shadow-md',
        variantStyles[variant],
        className
      )}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl backdrop-blur-sm">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
        </div>
      )}

      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className={cn('text-sm font-medium', textStyles[variant].title)}>{title}</p>
          <p className={cn('text-3xl font-bold tracking-tight', textStyles[variant].value)}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {(subtitle || trend) && (
            <div className="flex items-center gap-2">
              {trend && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 text-xs font-medium',
                    getTrendColor()
                  )}
                >
                  {getTrendIcon()}
                  {Math.abs(trend.value)}%
                </span>
              )}
              {subtitle && (
                <span className={cn('text-xs', textStyles[variant].subtitle)}>{subtitle}</span>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              'rounded-lg p-2.5',
              variant === 'default' ? 'bg-slate-100' : 'bg-white/20'
            )}
          >
            <Icon
              className={cn('h-5 w-5', variant === 'default' ? 'text-slate-600' : 'text-white')}
            />
          </div>
        )}
      </div>
    </div>
  )
}
