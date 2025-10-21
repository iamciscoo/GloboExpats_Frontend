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

// Chart components can be lazy loaded when needed in the future

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

// Export all lazy components for easy imports
export const LazyComponents = {
  AdminDashboard,
  ExpatDashboard,
  MessagesInterface,
  NotificationCenter,
}

/**
 * Future lazy loading opportunities:
 * - Advanced product forms
 * - Verification forms
 * - Analytics dashboards
 * - Chart components
 *
 * Add these as dynamic imports when the components are created
 */
