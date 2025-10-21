'use client'

import React from 'react'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  className?: string
}

/**
 * Revamped section header with brand-inspired decorative underline
 * Features dual-color accent (blue + orange) matching Globoexpats branding
 */
export default function SectionHeader({ title, subtitle, className = '' }: SectionHeaderProps) {
  return (
    <div className={`mb-6 sm:mb-8 lg:mb-10 ${className}`}>
      {/* Title with improved typography */}
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-neutral-900 tracking-tight mb-3 sm:mb-3">
        {title}
      </h2>

      {/* Decorative underline with brand colors - inspired by Globoexpats palette */}
      <div className="flex items-center gap-2 sm:gap-2 mb-3 sm:mb-3">
        {/* Primary blue line */}
        <div className="h-1 sm:h-1 w-12 sm:w-16 bg-gradient-to-r from-brand-primary to-brand-primary/80 rounded-full" />

        {/* Accent dot */}
        <div className="w-1.5 sm:w-1.5 h-1.5 sm:h-1.5 rounded-full bg-brand-secondary" />

        {/* Secondary orange line */}
        <div className="h-1 sm:h-1 w-8 sm:w-12 bg-gradient-to-r from-brand-secondary to-brand-secondary/70 rounded-full" />
      </div>

      {/* Subtitle with improved contrast */}
      {subtitle && (
        <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  )
}
