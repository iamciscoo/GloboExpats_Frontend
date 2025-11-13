/**
 * Admin Utility Functions
 * Provides helper functions for checking admin permissions and roles
 */

import type { User } from '@/lib/types'

/**
 * Check if user has admin role
 * @param user - Current user object
 * @returns True if user is an admin
 */
export function isAdmin(user: User | null): boolean {
  if (!user) return false

  // Check computed role field
  if (user.role === 'admin') return true

  // Check roles array from backend
  if (user.roles?.some((role) => role.roleName === 'ADMIN')) return true

  return false
}

/**
 * Check if user can access admin features
 * @param user - Current user object
 * @returns True if user can access admin panel
 */
export function canAccessAdmin(user: User | null): boolean {
  return isAdmin(user)
}

/**
 * Admin navigation items configuration
 */
export const ADMIN_NAVIGATION = [
  {
    id: 'dashboard',
    name: 'Admin Dashboard',
    href: '/admin/dashboard',
    icon: 'LayoutDashboard',
    description: 'Overview, analytics, and system monitoring',
  },
  {
    id: 'users',
    name: 'User Management',
    href: '/admin/users',
    icon: 'Users',
    description: 'Manage users, roles, and permissions',
  },
  {
    id: 'listings',
    name: 'Listings Management',
    href: '/admin/listings',
    icon: 'Package',
    description: 'Moderate listings, handle reports',
  },
  {
    id: 'verification',
    name: 'Verifications',
    href: '/admin/verification',
    icon: 'Shield',
    description: 'Review user verification requests',
  },
  {
    id: 'reports',
    name: 'Reports & Analytics',
    href: '/admin/reports',
    icon: 'BarChart3',
    description: 'Platform analytics and reporting',
  },
  {
    id: 'settings',
    name: 'System Settings',
    href: '/admin/settings',
    icon: 'Settings',
    description: 'Configure platform settings',
  },
] as const
