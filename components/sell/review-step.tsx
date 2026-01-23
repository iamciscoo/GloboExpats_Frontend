'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CountryFlag } from '@/components/country-flag'
import { getCategoryFields } from '@/lib/category-fields'
import { ITEM_CONDITIONS, CURRENCIES } from '@/lib/constants'
import {
  MapPin,
  Package,
  FileText,
  DollarSign,
  Shield,
  Image as ImageIcon,
  CheckCircle,
  Edit3,
  Star,
} from 'lucide-react'
import Image from 'next/image'

interface FormData {
  images: File[]
  imageUrls: string[]
  mainImage: string
  title: string
  category: string
  condition: string
  location: string
  description: string
  price: string
  originalPrice: string
  currency: string
  warranty: string
  quantity: string
  categoryFields: Record<string, string>
}

interface ReviewStepProps {
  formData: FormData
  backendCategories: Array<{ categoryId: number; categoryName: string }>
  onEditStep: (step: number) => void
}

// Helper to format currency display
const formatPrice = (price: string, currency: string): string => {
  if (!price) return 'Not set'
  const symbol =
    currency === 'TZS' ? 'TSh' : currency === 'USD' ? '$' : currency === 'KES' ? 'KSh' : 'USh'
  const formattedValue = new Intl.NumberFormat('en-US').format(parseFloat(price) || 0)
  return `${symbol} ${formattedValue}`
}

// Helper to get condition label
const getConditionLabel = (condition: string): string => {
  const found = ITEM_CONDITIONS.find((c) => c.value.toLowerCase() === condition.toLowerCase())
  return found?.label || condition
}

// Helper to get currency info
const getCurrencyInfo = (code: string) => {
  return CURRENCIES.find((c) => c.code === code)
}

export function ReviewStep({ formData, backendCategories, onEditStep }: ReviewStepProps) {
  const categoryFields = getCategoryFields(formData.category)
  const filledCategoryFields = Object.entries(formData.categoryFields).filter(
    ([_, value]) => value.trim() !== ''
  )
  const currencyInfo = getCurrencyInfo(formData.currency)

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="font-semibold text-emerald-800">Ready to Publish!</h3>
          <p className="text-sm text-emerald-600">
            Review your listing details below. Click &quot;Edit&quot; to make changes.
          </p>
        </div>
      </div>

      {/* Basic Details Section */}
      <ReviewSection
        title="Basic Details"
        icon={Package}
        stepNumber={1}
        onEdit={() => onEditStep(1)}
      >
        <div className="space-y-4">
          <ReviewField label="Item Title" value={formData.title} />
          <ReviewField
            label="Category"
            value={
              backendCategories.find(
                (cat) =>
                  cat.categoryName.toLowerCase() === formData.category.toLowerCase() ||
                  cat.categoryId.toString() === formData.category
              )?.categoryName || formData.category
            }
          />
          <ReviewField label="Condition" value={getConditionLabel(formData.condition)} />
          <ReviewField label="Location" value={formData.location} icon={MapPin} />
          {formData.quantity && (
            <ReviewField label="Available Quantity" value={formData.quantity} />
          )}
        </div>

        {/* Category-specific fields */}
        {filledCategoryFields.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
            <h4 className="text-sm font-semibold text-[#475569] mb-3">
              {formData.category} Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filledCategoryFields.map(([key, value]) => {
                const fieldConfig = categoryFields.find((f) => f.key === key)
                return (
                  <ReviewField key={key} label={fieldConfig?.label || key} value={value} small />
                )
              })}
            </div>
          </div>
        )}
      </ReviewSection>

      {/* Photos & Description Section */}
      <ReviewSection
        title="Photos & Description"
        icon={ImageIcon}
        stepNumber={2}
        onEdit={() => onEditStep(2)}
      >
        {/* Photo Gallery Preview */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-[#475569]">
            <ImageIcon className="w-4 h-4" />
            <span className="font-medium">{formData.images.length} Photos</span>
            {formData.mainImage && (
              <Badge variant="outline" className="text-xs">
                <Star className="w-3 h-3 mr-1" />
                Main image selected
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {formData.imageUrls.slice(0, 6).map((url, index) => (
              <div
                key={index}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                  url === formData.mainImage
                    ? 'border-[#1E3A8A] ring-2 ring-[#1E3A8A]/20'
                    : 'border-[#E2E8F0]'
                }`}
              >
                <Image src={url} alt={`Preview ${index + 1}`} fill className="object-cover" />
                {url === formData.mainImage && (
                  <div className="absolute bottom-0 left-0 right-0 bg-[#1E3A8A] text-white text-[10px] text-center py-0.5">
                    Main
                  </div>
                )}
              </div>
            ))}
            {formData.imageUrls.length > 6 && (
              <div className="aspect-square rounded-lg border-2 border-[#E2E8F0] bg-[#F8FAFB] flex items-center justify-center">
                <span className="text-sm font-semibold text-[#475569]">
                  +{formData.imageUrls.length - 6}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Description Preview */}
        <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
          <h4 className="text-sm font-semibold text-[#475569] mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Description
          </h4>
          <div className="bg-[#F8FAFB] rounded-lg p-4 max-h-40 overflow-y-auto">
            <p className="text-sm text-[#0F172A] whitespace-pre-wrap leading-relaxed">
              {formData.description || 'No description provided'}
            </p>
          </div>
        </div>
      </ReviewSection>

      {/* Pricing Section */}
      <ReviewSection title="Pricing" icon={DollarSign} stepNumber={3} onEdit={() => onEditStep(3)}>
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-[#475569]">Currency:</span>
            {currencyInfo && (
              <span className="flex items-center gap-2">
                <CountryFlag countryCode={currencyInfo.countryCode} size="sm" />
                <span className="font-medium text-[#0F172A]">
                  {currencyInfo.code} - {currencyInfo.name}
                </span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#1E3A8A]/5 rounded-xl p-4 border border-[#1E3A8A]/10">
              <div className="text-xs font-medium text-[#475569] mb-1">Asking Price</div>
              <div className="text-xl sm:text-2xl font-bold text-[#1E3A8A]">
                {formatPrice(formData.price, formData.currency)}
              </div>
            </div>

            {formData.originalPrice && (
              <div className="bg-[#F8FAFB] rounded-xl p-4 border border-[#E2E8F0]">
                <div className="text-xs font-medium text-[#475569] mb-1">Original Price</div>
                <div className="text-xl sm:text-2xl font-semibold text-[#64748B] line-through">
                  {formatPrice(formData.originalPrice, formData.currency)}
                </div>
              </div>
            )}
          </div>

          {formData.warranty && (
            <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-amber-800">Warranty</div>
                <div className="text-sm text-amber-700">{formData.warranty}</div>
              </div>
            </div>
          )}
        </div>
      </ReviewSection>

      {/* Final Note */}
      <div className="bg-[#F8FAFB] border border-[#E2E8F0] rounded-xl p-4 sm:p-6">
        <h3 className="text-base font-semibold text-[#0F172A] mb-2">Ready to Go Live?</h3>
        <p className="text-sm text-[#475569]">
          Your listing will be published immediately and visible to thousands of potential buyers in
          our global expat community. You can edit or remove your listing at any time from your
          dashboard.
        </p>
      </div>
    </div>
  )
}

// Review Section Component
function ReviewSection({
  title,
  icon: Icon,
  stepNumber,
  onEdit,
  children,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  stepNumber: number
  onEdit: () => void
  children: React.ReactNode
}) {
  return (
    <Card className="border border-[#E2E8F0] bg-white rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#E2E8F0] bg-[#F8FAFB]">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center text-sm font-semibold">
            {stepNumber}
          </div>
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-[#475569]" />
            <h3 className="font-semibold text-[#0F172A]">{title}</h3>
          </div>
        </div>
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 text-sm font-medium text-[#1E3A8A] hover:text-[#1E3A8A]/80 transition-colors px-3 py-1.5 rounded-lg hover:bg-[#1E3A8A]/5"
        >
          <Edit3 className="w-4 h-4" />
          Edit
        </button>
      </div>
      <CardContent className="p-4 sm:p-6">{children}</CardContent>
    </Card>
  )
}

// Review Field Component
function ReviewField({
  label,
  value,
  icon: Icon,
  small = false,
}: {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
  small?: boolean
}) {
  return (
    <div className={small ? 'space-y-0.5' : 'space-y-1'}>
      <dt className={`font-medium text-[#475569] ${small ? 'text-xs' : 'text-sm'}`}>{label}</dt>
      <dd
        className={`text-[#0F172A] flex items-center gap-2 ${small ? 'text-sm' : 'text-base font-medium'}`}
      >
        {Icon && <Icon className="w-4 h-4 text-[#64748B]" />}
        {value || <span className="text-[#94A3B8] italic">Not provided</span>}
      </dd>
    </div>
  )
}
