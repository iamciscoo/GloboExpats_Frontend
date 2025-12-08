/**
 * Platform Tutorial - Comprehensive multi-page onboarding tour using driver.js
 */

'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { driver, DriveStep, Config } from 'driver.js'
import 'driver.js/dist/driver.css'
import '@/styles/tutorial.css'
import { useTutorial } from '@/providers/tutorial-provider'
import { useUserProfile } from '@/hooks/use-user-profile'
import { useAuth } from '@/hooks/use-auth'

export function PlatformTutorial() {
  const { isOpen, startTutorial, closeTutorial } = useTutorial()
  const { userProfile, isLoading } = useUserProfile()
  const { isLoggedIn } = useAuth()
  const driverObj = useRef<ReturnType<typeof driver> | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const isNavigatingRef = useRef(false)

  // Check if user's email is verified
  const isEmailVerified = userProfile?.verificationStatus?.isOrganizationEmailVerified ?? false

  // Check for saved navigation state on mount
  useEffect(() => {
    const isNavigating = sessionStorage.getItem('tutorial-navigating')
    if (isNavigating === 'true' && !isOpen) {
      console.log('🔄 restoring tutorial state after refresh/navigation')
      startTutorial()
    }
  }, [startTutorial, isOpen])

  // Helper to show loading state in popover
  const showLoadingFeedback = useCallback(() => {
    const popover = document.querySelector('.driver-popover.globoexpats-tour-popover')
    if (popover) {
      // Add loading class for fixed positioning
      popover.classList.add('driver-popover-loading')

      const title = popover.querySelector('.driver-popover-title')
      const description = popover.querySelector('.driver-popover-description')
      const footer = popover.querySelector('.driver-popover-footer')

      if (title) title.innerHTML = 'Navigating...'
      if (description) {
        description.innerHTML = `
          <div class="driver-popover-loading-container">
            <div class="driver-popover-spinner"></div>
            <div class="driver-popover-loading-text">Loading next page...</div>
          </div>
        `
      }
      if (footer) (footer as HTMLElement).style.display = 'none'
    }
  }, [])

  // Tutorial steps that adapt based on user authentication and verification status
  const getTutorialSteps = useCallback((): DriveStep[] => {
    // For NON-LOGGED-IN users - encourage sign up and show platform overview
    if (!isLoggedIn) {
      return [
        // Welcome Introduction
        {
          popover: {
            title: 'Welcome to Globoexpats! 🌍',
            description:
              "The trusted marketplace for the expat community. Discover quality secondhand items from verified sellers, or list your own products to reach thousands of expats. Let's explore what you can do here!",
            onNextClick: () => {
              driverObj.current?.moveNext()
            },
          },
        },

        // Browse without login
        {
          element: '[data-tutorial="logo"]',
          popover: {
            title: 'Browse the Marketplace 🏪',
            description:
              'You can browse all available listings without an account - explore furniture, electronics, vehicles, and more from the expat community.',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '[data-tutorial="search"]',
          popover: {
            title: 'Search Products 🔍',
            description:
              'Use the search bar to find specific items. Try searching for "furniture", "laptop", or any product you need.',
            side: 'bottom',
            align: 'center',
          },
        },

        // Sign up prompt
        {
          popover: {
            title: 'Want to Buy or Sell? 🛍️',
            description:
              "To purchase items or list your own products, you'll need to create a free account. It only takes a minute!",
            onNextClick: () => {
              driverObj.current?.moveNext()
            },
          },
        },

        // Benefits of signing up
        {
          popover: {
            title: 'What You Get with an Account ✨',
            description:
              '✅ Browse and purchase quality items\n✅ List your own products for sale\n✅ Track orders and manage listings\n✅ Build your reputation in the community\n\nReady to get started?',
            onNextClick: () => {
              showLoadingFeedback()
              isNavigatingRef.current = true
              sessionStorage.setItem('tutorial-step', '5')
              sessionStorage.setItem('tutorial-navigating', 'true')
              setTimeout(() => {
                router.push('/register')
              }, 150)
            },
          },
        },

        // Registration page
        {
          popover: {
            title: 'Create Your Account 📝',
            description:
              "Sign up with your email or Google account to join the Globoexpats community. After registration, you'll verify your organization email to unlock buying features.",
            onNextClick: () => {
              driverObj.current?.moveNext()
            },
          },
        },
        {
          element: 'form',
          popover: {
            title: 'Quick Registration Steps 🚀',
            description:
              '1️⃣ Enter your name and email\n2️⃣ Create a secure password\n3️⃣ Or use "Sign in with Google" for faster signup\n\nAfter registering, you\'ll verify your work email to start buying. Complete identity verification to start selling!',
            side: 'top',
            align: 'center',
            onNextClick: () => {
              closeTutorial()
            },
          },
        },
      ]
    }

    // For UNVERIFIED users - prioritize email verification
    if (!isEmailVerified) {
      return [
        // Introduction emphasizing verification
        {
          popover: {
            title: 'Welcome to Globoexpats! 🌍',
            description:
              "Welcome to Globoexpats! 🌍\n\nBefore exploring the full marketplace, let's complete your email verification. This unlocks all features including buying and selling. We'll guide you through the quick verification process first!",
            onNextClick: () => {
              driverObj.current?.moveNext()
            },
          },
        },

        // Quick overview of key UI elements
        {
          element: '[data-tutorial="logo"]',
          popover: {
            title: 'Homepage Navigation',
            description: 'This is your homepage - you can always return here to browse listings.',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '[data-tutorial="profile-dropdown"]',
          popover: {
            title: 'Your Account Menu 👤',
            description:
              "⚠️ Notice: Some features are locked until you verify your email. Let's complete that now to unlock full access!",
            side: 'bottom',
            align: 'end',
            onNextClick: () => {
              showLoadingFeedback()
              isNavigatingRef.current = true
              sessionStorage.setItem('tutorial-step', '3')
              sessionStorage.setItem('tutorial-navigating', 'true')
              setTimeout(() => {
                router.push('/account/verification')
              }, 150)
            },
          },
        },

        // Verification Page
        {
          popover: {
            title: 'Email Verification Page 📧',
            description:
              "Here you can verify your organization email to unlock all platform features.\n\n✨ After verification, you'll be able to:\n• Browse and purchase items\n• List your own products\n• Access all marketplace features\n\nLet's complete this now!",
            onNextClick: () => {
              driverObj.current?.moveNext()
            },
          },
        },
        {
          element: 'form',
          popover: {
            title: 'Verification Steps 🔐',
            description:
              '1️⃣ Enter your work/organization email (not Gmail, Yahoo, etc.)\n2️⃣ Click "Send Verification Code"\n3️⃣ Check your email for the 6-digit code\n4️⃣ Enter the code and verify\n\nOnce verified, come back and restart the tutorial to see the full platform tour!',
            side: 'top',
            align: 'center',
            onNextClick: () => {
              closeTutorial()
            },
          },
        },
      ]
    }

    // For VERIFIED users - comprehensive platform tour
    return [
      // Homepage - Introduction
      {
        popover: {
          title: 'Welcome to Globoexpats! 🌍',
          description:
            "The trusted marketplace for the expat community. This comprehensive tour will guide you through every feature of the platform - from browsing to buying, selling, and managing your account. Let's get started!",
          onNextClick: () => {
            driverObj.current?.moveNext()
          },
        },
      },

      // Homepage - Navigation
      {
        element: '[data-tutorial="logo"]',
        popover: {
          title: 'Homepage Navigation',
          description:
            'Click the Globoexpats logo anytime to return to the homepage and discover new listings. This is your starting point for browsing the marketplace.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '[data-tutorial="search"]',
        popover: {
          title: 'Search Products 🔍',
          description:
            'Find exactly what you need by searching for products by name, category, brand, or keywords. Our smart search helps you discover items quickly.',
          side: 'bottom',
          align: 'center',
        },
      },
      {
        element: '[data-tutorial="cart"]',
        popover: {
          title: 'Shopping Cart 🛒',
          description:
            "Your shopping cart holds items you're interested in purchasing. Add products here and checkout when ready. The badge shows your cart item count.",
          side: 'bottom',
          align: 'end',
        },
      },

      {
        element: '[data-tutorial="notifications"]',
        popover: {
          title: 'Notifications 🔔',
          description:
            'Stay updated on order status, new messages, price changes, and important account activities. Never miss an update!',
          side: 'bottom',
          align: 'end',
        },
      },
      {
        element: '[data-tutorial="profile-dropdown"]',
        popover: {
          title: 'Account Menu 👤',
          description:
            'Access your account dashboard, settings, verification status, and more. You can also restart this tutorial anytime from here.',
          side: 'bottom',
          align: 'end',
          onNextClick: () => {
            // Show loading state
            showLoadingFeedback()

            // Save current step and navigate
            isNavigatingRef.current = true
            sessionStorage.setItem('tutorial-step', '6')
            sessionStorage.setItem('tutorial-navigating', 'true')

            // Small delay to show feedback before navigation starts
            setTimeout(() => {
              router.push('/browse')
            }, 150)
          },
        },
      },

      // Browse Page
      {
        popover: {
          title: 'Browse Marketplace 🛍️',
          description:
            "Now we're on the Browse page where you can explore all available products. Let's see how to filter and find what you need.",
          onNextClick: () => {
            driverObj.current?.moveNext()
          },
          onPrevClick: () => {
            showLoadingFeedback()
            isNavigatingRef.current = true
            sessionStorage.setItem('tutorial-step', '5')
            sessionStorage.setItem('tutorial-navigating', 'true')
            setTimeout(() => {
              router.push('/')
            }, 150)
          },
        },
      },
      {
        element: 'aside',
        popover: {
          title: 'Filter by Category 📂',
          description:
            'Use the category filters on the left to narrow down your search. Browse by Electronics, Furniture, Vehicles, Real Estate, and more.',
          side: 'right',
          align: 'start',
        },
      },
      {
        element: '[role="combobox"]',
        popover: {
          title: 'Sort & View Options 📊',
          description:
            'Sort products by price, date, or popularity. Switch between grid and list views for your preferred browsing experience.',
          side: 'bottom',
          align: 'start',
          onNextClick: () => {
            // Show loading state
            showLoadingFeedback()

            // Save current step and navigate
            isNavigatingRef.current = true
            sessionStorage.setItem('tutorial-step', '9')
            sessionStorage.setItem('tutorial-navigating', 'true')

            setTimeout(() => {
              router.push('/sell')
            }, 150)
          },
        },
      },

      // Sell Page
      {
        popover: {
          title: 'Create a Listing 💰',
          description:
            'Welcome to the listing creation page! Here you can sell your items to the expat community. The process is simple and guided step-by-step.',
          onNextClick: () => {
            driverObj.current?.moveNext()
          },
          onPrevClick: () => {
            showLoadingFeedback()
            isNavigatingRef.current = true
            sessionStorage.setItem('tutorial-step', '8')
            sessionStorage.setItem('tutorial-navigating', 'true')
            setTimeout(() => {
              router.push('/browse')
            }, 150)
          },
        },
      },
      {
        element: 'form',
        popover: {
          title: 'Three-Step Listing Process 📝',
          description:
            'Creating a listing is easy:\n\n1️⃣ Basic Details - Title, category, condition, location\n2️⃣ Photos & Description - Upload images and describe your item\n3️⃣ Pricing & Publish - Set price and publish your listing\n\nAll listings are reviewed by our team to ensure quality.',
          side: 'top',
          align: 'center',
          onNextClick: () => {
            // Show loading state
            showLoadingFeedback()

            // Save current step and navigate
            isNavigatingRef.current = true
            sessionStorage.setItem('tutorial-step', '11')
            sessionStorage.setItem('tutorial-navigating', 'true')

            setTimeout(() => {
              router.push('/expat/dashboard')
            }, 150)
          },
        },
      },

      // My Space / Dashboard
      {
        element: '[data-tutorial="my-space-header"]',
        popover: {
          title: 'My Space Dashboard 🚀',
          description:
            'This is your command center! Manage your listings, view analytics, check orders, and handle messages all in one place.',
          onNextClick: () => {
            driverObj.current?.moveNext()
          },
          onPrevClick: () => {
            showLoadingFeedback()
            isNavigatingRef.current = true
            sessionStorage.setItem('tutorial-step', '10')
            sessionStorage.setItem('tutorial-navigating', 'true')
            setTimeout(() => {
              router.push('/sell')
            }, 150)
          },
        },
      },
      {
        element: '[data-tutorial="dashboard-tabs"]',
        popover: {
          title: 'Dashboard Tools 🛠️',
          description:
            'Switch between Overview, My Listings, Analytics, and Orders using these tabs.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '[data-tutorial="dashboard-listings-tab"]',
        popover: {
          title: 'Manage Listings 📦',
          description:
            'View, edit, or delete your active listings. Check their status and performance at a glance.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '[data-tutorial="dashboard-analytics-tab"]',
        popover: {
          title: 'Track Performance 📈',
          description:
            'See how your listings are performing with view counts and engagement metrics.',
          side: 'bottom',
          align: 'start',
          onNextClick: () => {
            // Show loading state
            showLoadingFeedback()

            // Save current step and navigate
            isNavigatingRef.current = true
            sessionStorage.setItem('tutorial-step', '15')
            sessionStorage.setItem('tutorial-navigating', 'true')

            setTimeout(() => {
              router.push('/account')
            }, 150)
          },
        },
      },

      // Account Settings
      {
        element: '[data-tutorial="account-header"]',
        popover: {
          title: 'Account Settings ⚙️',
          description:
            'Here you can manage your personal profile, security settings, and verification status.',
          onNextClick: () => {
            driverObj.current?.moveNext()
          },
          onPrevClick: () => {
            showLoadingFeedback()
            isNavigatingRef.current = true
            sessionStorage.setItem('tutorial-step', '14')
            sessionStorage.setItem('tutorial-navigating', 'true')
            setTimeout(() => {
              router.push('/expat/dashboard')
            }, 150)
          },
        },
      },
      {
        element: 'a[href="/account/settings"]',
        popover: {
          title: 'Profile & Security 🔒',
          description: 'Update your password and personal details.',
          side: 'right',
          align: 'start',
        },
      },
      {
        element: 'a[href="/account/verification"]',
        popover: {
          title: 'Get Verified ✅',
          description:
            'Complete your verification to build trust and unlock all platform features.',
          side: 'right',
          align: 'start',
          onNextClick: () => {
            // Show loading state
            showLoadingFeedback()

            // Save current step and navigate
            isNavigatingRef.current = true
            sessionStorage.setItem('tutorial-step', '18')
            sessionStorage.setItem('tutorial-navigating', 'true')

            setTimeout(() => {
              router.push('/')
            }, 150)
          },
        },
      },

      // Final Step - Back on Homepage
      {
        popover: {
          title: 'Welcome Back Home! 🏠',
          description:
            "You're now back on the homepage and ready to explore! 🚀\n\nYou've mastered the essentials:\n✅ Finding products & deals\n✅ Selling your own items\n✅ Managing your Space\n\nThe entire platform is now open for you. Happy exploring!",
          onNextClick: () => {
            closeTutorial()
          },
          onPrevClick: () => {
            showLoadingFeedback()
            isNavigatingRef.current = true
            sessionStorage.setItem('tutorial-step', '17')
            sessionStorage.setItem('tutorial-navigating', 'true')
            setTimeout(() => {
              router.push('/account')
            }, 150)
          },
        },
      },
    ]
  }, [isLoggedIn, isEmailVerified, router, closeTutorial, showLoadingFeedback])

  const createDriverConfig = useCallback((): Config => {
    const steps = getTutorialSteps()
    return {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      steps: steps,
      onDestroyed: () => {
        // Don't close if we are navigating to another page
        if (isNavigatingRef.current) {
          console.log('🧭 Navigation detected, keeping tutorial open')
          return
        }

        closeTutorial()
        // Clean up saved state
        sessionStorage.removeItem('tutorial-step')
        sessionStorage.removeItem('tutorial-navigating')
      },
      onDestroyStarted: () => {
        if (!isNavigatingRef.current) {
          closeTutorial()
        }
      },
      onHighlightStarted: (element, step, options) => {
        const activeIndex = options.state?.activeIndex ?? 0
        console.log(`📍 Tutorial at step ${activeIndex + 1}/${steps.length}`)
      },
      popoverClass: 'globoexpats-tour-popover',
      progressText: 'Step {{current}} of {{total}}',
      nextBtnText: 'Next →',
      prevBtnText: '← Previous',
      doneBtnText: 'Finish Tour',
      allowClose: true,
      smoothScroll: true,
      animate: true,
    }
  }, [getTutorialSteps, closeTutorial])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Wait for user profile to load to ensure correct verification status
    if (isLoading) return

    // If driver already exists but verification status changed, destroy and recreate
    if (driverObj.current) {
      driverObj.current.destroy()
      driverObj.current = null
    }

    driverObj.current = driver(createDriverConfig())
    console.log('✨ Tutorial driver initialized')

    return () => {
      // Only destroy on component unmount
      if (driverObj.current && !isOpen) {
        driverObj.current.destroy()
        driverObj.current = null
      }
    }
  }, [isLoading, isEmailVerified, createDriverConfig, isOpen])

  // Handle tutorial resumption after navigation
  useEffect(() => {
    const isNavigating = sessionStorage.getItem('tutorial-navigating')
    const savedStep = sessionStorage.getItem('tutorial-step')

    if (isOpen && isNavigating === 'true' && savedStep) {
      // Set navigating flag to prevent closeTutorial from being triggered by destroy()
      isNavigatingRef.current = true

      // Wait for page to fully load and elements to be ready
      // Reduced delay for better efficiency while still safe
      const timer = setTimeout(() => {
        const stepIndex = parseInt(savedStep, 10)
        console.log(`🔄 Resuming tutorial at step ${stepIndex + 1} on ${pathname}`)

        // Force re-initialization of driver to ensure it binds to new DOM
        if (driverObj.current) {
          try {
            driverObj.current.destroy()
          } catch (e) {
            console.error('Error destroying driver:', e)
          }
        }

        driverObj.current = driver(createDriverConfig())

        // Drive to the next step
        driverObj.current.drive(stepIndex)

        // Reset navigation flags after tutorial has resumed
        // Small delay to ensure onDestroyed isn't triggered during startup
        setTimeout(() => {
          sessionStorage.removeItem('tutorial-navigating')
          isNavigatingRef.current = false
        }, 500)
      }, 500) // Reduced from 2500ms to 500ms for faster loading

      return () => clearTimeout(timer)
    }
  }, [isOpen, pathname, createDriverConfig])

  useEffect(() => {
    if (isOpen && driverObj.current) {
      // Check if we're resuming from navigation
      const isNavigating = sessionStorage.getItem('tutorial-navigating')

      if (isNavigating !== 'true') {
        // Start from beginning
        console.log('🎬 Starting tutorial from beginning')
        driverObj.current.drive(0)
        // Clear any saved state
        sessionStorage.removeItem('tutorial-step')
      }
    } else if (!isOpen && driverObj.current) {
      try {
        driverObj.current.destroy()
      } catch (e) {
        console.error('Error destroying driver instance:', e)
      }

      // Force remove overlay if it persists
      const overlay = document.getElementById('driver-page-overlay')
      if (overlay) {
        overlay.remove()
      }
      document.body.classList.remove('driver-active', 'driver-fade', 'driver-simple')

      // Clear saved state when tutorial is closed
      sessionStorage.removeItem('tutorial-step')
      sessionStorage.removeItem('tutorial-navigating')
    }
  }, [isOpen])

  return null
}
