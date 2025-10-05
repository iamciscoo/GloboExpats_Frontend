/**
 * User Profile Management Hook
 *
 * Manages the current user's profile data, integrating with the seller profile system.
 * Provides consistent profile data for account settings and seller profile views.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { getSellerProfileByName, SELLER_PROFILES } from '@/lib/seller-data'
import { SellerProfile, User } from '@/lib/types'

export interface UserProfileMethods {
  userProfile: User | null
  sellerProfile: SellerProfile | null
  isLoading: boolean
  error: string | null

  // Profile management methods
  updateProfile: (updates: Partial<User>) => Promise<void>
  updateBasicInfo: (basicInfo: {
    name: string
    email: string
    organizationEmail?: string
  }) => Promise<void>

  // Utility methods
  getDisplayName: () => string
  getProfileSlug: () => string
  canEditProfile: () => boolean
  isSeller: () => boolean
}

export function useUserProfile(): UserProfileMethods {
  const { user, isLoggedIn, updateUser } = useAuth()
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize profile data
  useEffect(() => {
    const initializeProfile = async () => {
      if (!isLoggedIn || !user) {
        setUserProfile(null)
        setSellerProfile(null)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // Try to find existing seller profile
        const existingSeller = getSellerProfileByName(user.name)

        if (existingSeller) {
          setSellerProfile(existingSeller)
        }

        setUserProfile(user)
      } catch (err) {
        console.error('Failed to initialize user profile:', err)
        setError('Failed to load profile data')
      } finally {
        setIsLoading(false)
      }
    }

    initializeProfile()
  }, [isLoggedIn, user])

  // Update profile data
  const updateProfile = useCallback(
    async (updates: Partial<User>) => {
      if (!userProfile) {
        throw new Error('No profile to update')
      }

      try {
        setError(null)
        const updatedProfile = { ...userProfile, ...updates }

        // Update local state
        setUserProfile(updatedProfile)

        // Update auth user data
        updateUser(updatedProfile)

        // TODO: Save to backend API
  // ...existing code...
      } catch (err) {
        console.error('Failed to update profile:', err)
        setError('Failed to update profile')
        throw err
      }
    },
    [userProfile, updateUser]
  )

  // Update basic information
  const updateBasicInfo = useCallback(
    async (basicInfo: { name: string; email: string; organizationEmail?: string }) => {
      const updates: Partial<User> = {
        name: basicInfo.name,
        email: basicInfo.email,
        organizationEmail: basicInfo.organizationEmail,
      }

      await updateProfile(updates)
    },
    [updateProfile]
  )

  // Utility methods
  const getDisplayName = useCallback(() => {
    return userProfile?.name || user?.name || 'Unknown User'
  }, [userProfile, user])

  const getProfileSlug = useCallback(() => {
    if (sellerProfile) {
      return sellerProfile.id
    }
    // Generate slug from name if no seller profile
    return (
      userProfile?.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim() || 'user'
    )
  }, [sellerProfile, userProfile])

  const canEditProfile = useCallback(() => {
    return isLoggedIn && !!userProfile
  }, [isLoggedIn, userProfile])

  const isSeller = useCallback(() => {
    return !!sellerProfile
  }, [sellerProfile])

  return {
    userProfile,
    sellerProfile,
    isLoading,
    error,
    updateProfile,
    updateBasicInfo,
    getDisplayName,
    getProfileSlug,
    canEditProfile,
    isSeller,
  }
}
