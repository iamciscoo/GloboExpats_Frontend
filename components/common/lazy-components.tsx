/**
 * =============================================================================
 * Lazy Components - Code Splitting for Performance
 * =============================================================================
 *
 * Dynamic imports for large components to improve initial bundle size
 * and page load performance.
 */

import dynamic from 'next/dynamic'
import { PageSkeleton, DashboardStatsSkeleton, TableSkeleton } from './loading-skeleton'

// Admin dashboard components (lazy loaded)
export const AdminDashboard = dynamic(() => import('@/app/admin/dashboard/page'), {
  loading: () => <PageSkeleton />,
  ssr: false, // Admin features don't need SSR
})

export const ExpatDashboard = dynamic(() => import('@/app/expat/dashboard/page'), {
  loading: () => <DashboardStatsSkeleton />,
  ssr: false,
})

// Chart component (heavy library)
export const Chart = dynamic(
  () => import('@/components/ui/chart').then((mod) => ({ default: mod.Chart })),
  {
    loading: () => <div className="h-64 w-full bg-gray-100 rounded animate-pulse" />,
    ssr: false,
  }
)

// Messages interface (WebSocket heavy)
export const MessagesInterface = dynamic(() => import('@/app/messages/page'), {
  loading: () => <PageSkeleton sidebar={false} />,
  ssr: false,
})

// Notification system (real-time features)
export const NotificationCenter = dynamic(() => import('@/app/notifications/page'), {
  loading: () => <TableSkeleton />,
  ssr: false,
})

// Complex forms (form libraries)
export const AdvancedProductForm = dynamic(
  () => import('@/components/forms/advanced-product-form'),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
)

export const VerificationForm = dynamic(() => import('@/components/forms/verification-form'), {
  loading: () => <PageSkeleton />,
  ssr: false,
})

// Analytics components (chart libraries)
export const AnalyticsDashboard = dynamic(() => import('@/components/analytics/dashboard'), {
  loading: () => <DashboardStatsSkeleton />,
  ssr: false,
})

// Export all lazy components for easy imports
export const LazyComponents = {
  AdminDashboard,
  ExpatDashboard,
  Chart,
  MessagesInterface,
  NotificationCenter,
  AdvancedProductForm,
  VerificationForm,
  AnalyticsDashboard,
}
