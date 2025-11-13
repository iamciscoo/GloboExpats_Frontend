/**
 * Step-Specific Tips and Guidance
 *
 * Dynamic tips that change based on the current step in the listing creation process.
 * Each step provides relevant, actionable guidance to help users create better listings.
 */

import {
  Camera,
  Star,
  DollarSign,
  Package,
  FileText,
  Eye,
  Clock,
  CheckCircle,
  TrendingUp,
  MessageCircle,
  Shield,
  Zap,
} from 'lucide-react'

export interface StepTip {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}

export interface StepTipsConfig {
  step: number
  stepName: string
  tips: StepTip[]
}

/**
 * Step-specific tips that provide contextual guidance
 */
export const STEP_TIPS: StepTipsConfig[] = [
  {
    step: 1,
    stepName: 'Basic Details',
    tips: [
      {
        icon: FileText,
        title: 'Descriptive Titles Win',
        description:
          'Include brand, model, and key features. "MacBook Pro 14" M2 256GB" gets 4x more clicks than "Laptop for sale".',
      },
      {
        icon: Star,
        title: 'Category Matters',
        description:
          'Choose the most specific category. It helps buyers find your item faster and shows relevant search results.',
      },
      {
        icon: Eye,
        title: 'Location Visibility',
        description:
          'Your location helps buyers estimate pickup/delivery. Items in popular expat areas get 2x more inquiries.',
      },
      {
        icon: CheckCircle,
        title: 'Honest Condition',
        description:
          'Be truthful about condition. "Good" condition with honest description builds trust and reduces returns.',
      },
    ],
  },
  {
    step: 2,
    stepName: 'Photos & Description',
    tips: [
      {
        icon: Camera,
        title: 'Photo Quality = Sales',
        description:
          'Use natural light and multiple angles. Items with 5+ clear photos sell 3x faster than single-photo listings.',
      },
      {
        icon: Zap,
        title: 'Show Key Features',
        description:
          'Highlight unique features, original packaging, accessories included. Close-ups of important details boost confidence.',
      },
      {
        icon: FileText,
        title: 'Complete Descriptions',
        description:
          'Include purchase date, usage patterns, reason for selling. Detailed descriptions reduce questions and speed up sales.',
      },
      {
        icon: Shield,
        title: 'Build Trust',
        description:
          'Mention any warranties, original receipts, or service history. Transparency leads to better offers and quicker sales.',
      },
    ],
  },
  {
    step: 3,
    stepName: 'Pricing & Publish',
    tips: [
      {
        icon: DollarSign,
        title: 'Smart Pricing Strategy',
        description:
          'Research similar items first. Price 10-15% higher than your minimum to leave room for buyer offers.',
      },
      {
        icon: TrendingUp,
        title: 'Original Price Value',
        description:
          'Show original purchase price when higher. It demonstrates value and helps justify your asking price to buyers.',
      },
      {
        icon: Clock,
        title: 'Timing Matters',
        description:
          'List during peak hours (6-9 PM weekdays). Items posted at optimal times get 40% more views in first 24 hours.',
      },
      {
        icon: MessageCircle,
        title: 'Be Ready to Respond',
        description:
          'Quick responses (within 2 hours) increase sale probability by 60%. Set up notifications for faster replies.',
      },
    ],
  },
]

/**
 * Get tips for a specific step
 */
export function getStepTips(step: number): StepTip[] {
  const stepConfig = STEP_TIPS.find((config) => config.step === step)
  return stepConfig?.tips || []
}

/**
 * Get step name for display
 */
export function getStepName(step: number): string {
  const stepConfig = STEP_TIPS.find((config) => config.step === step)
  return stepConfig?.stepName || `Step ${step}`
}

/**
 * Category-specific additional tips that can be shown when relevant
 */
export const CATEGORY_TIPS: Record<string, StepTip[]> = {
  Vehicles: [
    {
      icon: Package,
      title: 'Vehicle Documentation',
      description:
        'Include photos of registration, service records, and any recent maintenance. Complete paperwork builds buyer confidence.',
    },
    {
      icon: Eye,
      title: 'Interior & Exterior',
      description:
        'Show dashboard, seats, engine bay, and any wear/damage. Honest disclosure prevents disputes and speeds negotiations.',
    },
  ],
  Electronics: [
    {
      icon: Zap,
      title: 'Working Condition',
      description:
        'Include screenshots showing the device working. Test all functions and mention any issues upfront (Scratches, dents, Battery percentage e.t.c).',
    },
    {
      icon: Package,
      title: 'Original Accessories',
      description:
        'List all included accessories (chargers, cables, cases). Original boxes and manuals add significant value.',
    },
  ],
  'Real Estate': [
    {
      icon: Camera,
      title: 'Virtual Tour Quality',
      description:
        'Include photos of all rooms, outdoor spaces, and neighborhood. Virtual tours get 5x more serious inquiries.',
    },
    {
      icon: FileText,
      title: 'Property Details',
      description:
        'Mention utilities, internet quality, security features, and nearby amenities important to expats.',
    },
  ],
}

/**
 * Get category-specific tips when applicable
 */
export function getCategoryTips(categoryName: string): StepTip[] {
  return CATEGORY_TIPS[categoryName] || []
}
