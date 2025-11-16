'use client'

import { useState, useEffect } from 'react'
import { X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { RouteGuard } from '@/components/route-guard'
import { apiClient } from '@/lib/api'
import { ITEM_CONDITIONS, EXPAT_LOCATIONS, CURRENCIES } from '@/lib/constants'
import { CURRENCIES as CURRENCY_CONFIG } from '@/lib/currency-converter'
import { getCategoryFields } from '@/lib/category-fields'
import { getStepTips, getCategoryTips, getStepName } from '@/lib/step-tips'
import { useToast } from '@/components/ui/use-toast'
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
  categoryFields: Record<string, string> // Dynamic fields based on category
}

const INITIAL_FORM_DATA: FormData = {
  images: [],
  imageUrls: [],
  mainImage: '',
  title: '',
  category: '',
  condition: '',
  location: '',
  description: '',
  price: '',
  originalPrice: '',
  currency: 'TZS',
  warranty: '',
  categoryFields: {},
}

const STEP_TITLES = ['Basic Details', 'Photos & Description', 'Pricing & Publish']

export default function SellPage() {
  return (
    <RouteGuard
      requireAuth
      requireVerification="sell"
      loadingMessage="Verifying seller permissions..."
    >
      <SellPageContent />
    </RouteGuard>
  )
}

function SellPageContent() {
  const { toast } = useToast()
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA)
  const [currentStep, setCurrentStep] = useState(1)
  const [isPublishing, setIsPublishing] = useState(false)
  const [backendCategories, setBackendCategories] = useState<
    Array<{ categoryId: number; categoryName: string }>
  >([])

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    window.scrollTo(0, 0) // Fallback
  }, [])

  // Fetch categories from backend on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await apiClient.getCategories()
        setBackendCategories(categories)
      } catch (error) {
        console.error('❌ Failed to fetch categories:', error)
        // Fallback to empty array if backend fails
        setBackendCategories([])
      }
    }
    fetchCategories()
  }, [])

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  // Handle real file upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) {
      return
    }

    const newFiles = Array.from(files)
    const validFiles: File[] = []
    const newImageUrls: string[] = []

    // Show processing toast
    toast({
      title: '📸 Processing Images',
      description: `Processing ${newFiles.length} image${newFiles.length > 1 ? 's' : ''}...`,
    })

    // Validate all files first
    for (const file of newFiles) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: '🖼️ Image Files Only',
          description: 'Please upload JPG or PNG images to showcase your item!',
        })
        continue
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: '📦 File Too Large',
          description: `${file.name} is too large. Please use images under 10MB!`,
        })
        continue
      }

      validFiles.push(file)
    }

    // Check total file size before adding new files
    const currentSize = formData.images.reduce((sum, file) => sum + file.size, 0)
    const newFilesSize = validFiles.reduce((sum, file) => sum + file.size, 0)
    const totalSize = currentSize + newFilesSize

    if (totalSize > 100 * 1024 * 1024) {
      // 100MB limit
      const totalSizeMB = (totalSize / 1024 / 1024).toFixed(1)
      toast({
        title: '📦 Upload Size Limit',
        description: `Total file size (${totalSizeMB}MB) would exceed the 100MB upload limit. Please use smaller images or fewer images.`,
        variant: 'destructive',
      })
      return
    }

    // Create preview URLs asynchronously to avoid blocking UI
    // Use requestAnimationFrame to allow UI to update between operations
    for (const file of validFiles) {
      await new Promise((resolve) => requestAnimationFrame(resolve))
      const imageUrl = URL.createObjectURL(file)
      newImageUrls.push(imageUrl)
    }

    // Update form data
    const updatedImages = [...formData.images, ...validFiles]
    const updatedImageUrls = [...formData.imageUrls, ...newImageUrls]
    const newMainImage = formData.mainImage || newImageUrls[0] || ''

    updateFormData({
      images: updatedImages,
      imageUrls: updatedImageUrls,
      mainImage: newMainImage,
    })

    // Show success toast
    toast({
      title: '✅ Images Added',
      description: `Successfully added ${validFiles.length} image${validFiles.length > 1 ? 's' : ''}!`,
      variant: 'default',
    })

    // Clear the input
    event.target.value = ''
  }

  const removeImage = (index: number) => {
    const imageUrl = formData.imageUrls[index]

    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(imageUrl)

    const updatedImages = formData.images.filter((_, i) => i !== index)
    const updatedImageUrls = formData.imageUrls.filter((_, i) => i !== index)

    // If removing main image, set new main image
    let newMainImage = formData.mainImage
    if (imageUrl === formData.mainImage) {
      newMainImage = updatedImageUrls[0] || ''
    }

    updateFormData({
      images: updatedImages,
      imageUrls: updatedImageUrls,
      mainImage: newMainImage,
    })
  }

  const setMainImage = (imageUrl: string) => {
    updateFormData({ mainImage: imageUrl })
  }

  const validateStep = (step: number) => {
    let errorMessage = ''

    switch (step) {
      case 1:
        if (!formData.title.trim()) {
          errorMessage = 'Please enter a title for your item'
        } else if (!formData.category) {
          errorMessage = 'Please select a category'
        } else if (!formData.condition) {
          errorMessage = 'Please select the item condition'
        } else if (!formData.location) {
          errorMessage = 'Please choose a location'
        }
        break
      case 2:
        if (formData.images.length === 0) {
          errorMessage = 'Please upload at least one image'
        } else if (!formData.description.trim()) {
          errorMessage = 'Please add a description'
        }
        break
      case 3:
        if (!formData.price) {
          errorMessage = 'Please set a price for your item'
        }
        break
    }

    if (errorMessage) {
      toast({
        title: '📝 Almost There!',
        description: errorMessage,
      })
      return false
    }

    return true
  }

  const scrollToTop = () => {
    // Use instant scroll for better mobile experience
    window.scrollTo({ top: 0, behavior: 'instant' })
    // Fallback for older browsers
    window.scrollTo(0, 0)
  }

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 3) {
      setCurrentStep(currentStep + 1)
      scrollToTop()
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      scrollToTop()
    }
  }

  // Normalize UI condition values to backend enum
  // Backend supports: NEW, LIKE_NEW, USED (others mapped to USED)
  const normalizeConditionForBackend = (cond: string): string => {
    const c = (cond || '').toLowerCase()
    if (c === 'new') return 'NEW'
    if (c === 'like-new') return 'LIKE_NEW'
    // Map all other granular states to USED
    return 'USED'
  }

  // Format description with category fields
  const formatDescriptionWithCategoryFields = (
    description: string,
    categoryFields: Record<string, string>,
    category: string
  ): string => {
    let enhancedDescription = description

    // Add category fields as structured data if they exist
    if (Object.keys(categoryFields).length > 0) {
      const fields = getCategoryFields(category)
      const nonEmptyFields = Object.entries(categoryFields).filter(
        ([_, value]) => value.trim() !== ''
      )

      if (nonEmptyFields.length > 0) {
        enhancedDescription += '\n\n--- SPECIFICATIONS ---\n'

        nonEmptyFields.forEach(([fieldKey, value]) => {
          const fieldConfig = fields.find((f) => f.key === fieldKey)
          const label = fieldConfig?.label || fieldKey
          enhancedDescription += `${label}: ${value}\n`
        })
      }
    }

    return enhancedDescription
  }

  const publishListing = async () => {
    // Validate all steps before publishing
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      return
    }

    try {
      setIsPublishing(true)

      // Double-check we have images (should be caught by validation)
      if (formData.images.length === 0) {
        toast({
          title: '📸 Photos Needed',
          description: 'Add at least one photo to showcase your item to buyers!',
        })
        setIsPublishing(false)
        return
      }

      // Find the selected category ID from backend categories
      const selectedCategory = backendCategories.find(
        (cat) =>
          cat.categoryName.toLowerCase() === formData.category.toLowerCase() ||
          cat.categoryId.toString() === formData.category
      )

      if (!selectedCategory) {
        toast({
          title: '🏷️ Category Required',
          description: 'Please choose a category to help buyers find your item!',
        })
        setIsPublishing(false)
        return
      }

      const categoryId = selectedCategory.categoryId

      // Enforce backend limit of max 30 images
      const MAX_IMAGES = 30
      let selectedImages = [...formData.images]
      if (selectedImages.length > MAX_IMAGES) {
        toast({
          title: '📸 Too many photos',
          description: `Backend allows up to ${MAX_IMAGES} images. Extra images will be ignored.`,
        })
        selectedImages = selectedImages.slice(0, MAX_IMAGES)
      }

      // Find the main image index among imageUrls
      const mainImageIndex = formData.mainImage ? formData.imageUrls.indexOf(formData.mainImage) : 0

      // Reorder images array to put main image first
      const reorderedImages = [...selectedImages]
      if (mainImageIndex > 0 && mainImageIndex < reorderedImages.length) {
        const [mainImage] = reorderedImages.splice(mainImageIndex, 1)
        reorderedImages.unshift(mainImage)
      }

      // Convert prices from selected currency to TZS (base currency)
      const enteredCurrency = formData.currency as 'TZS' | 'USD' | 'KES' | 'UGX'
      const conversionRate = CURRENCY_CONFIG[enteredCurrency].exchangeRate

      // If user entered in USD/KES/UGX, divide by exchange rate to get TZS
      // If already in TZS, no conversion needed (rate = 1)
      const parsedAsking = parseFloat(String(formData.price).replace(/[^0-9.]/g, ''))
      const parsedOriginal = formData.originalPrice
        ? parseFloat(String(formData.originalPrice).replace(/[^0-9.]/g, ''))
        : 0

      const askingPriceInTZS = (isNaN(parsedAsking) ? 0 : parsedAsking) / conversionRate
      const originalPriceInTZS = (isNaN(parsedOriginal) ? 0 : parsedOriginal) / conversionRate

      // Transform form data to match backend expectations
      // Always store in TZS (base currency)
      const enhancedDescription = formatDescriptionWithCategoryFields(
        formData.description.trim(),
        formData.categoryFields,
        formData.category
      )

      const sanitizeLocationForBackend = (loc: string): string => {
        if (!loc) return ''
        // Remove emojis and non-ASCII (e.g., flags), trim extra spaces
        return loc.replace(/[^\x20-\x7E]/g, '').trim()
      }

      const productData = {
        productName: formData.title.trim(),
        categoryId: categoryId,
        condition: normalizeConditionForBackend(formData.condition),
        location: sanitizeLocationForBackend(formData.location),
        productDescription: enhancedDescription,
        currency: 'TZS', // Always store as TZS in backend
        askingPrice: Math.round(askingPriceInTZS), // Round to nearest shilling
        originalPrice: Math.round(originalPriceInTZS),
        productWarranty: formData.warranty.trim() || 'No warranty', // Use form data or default
      }

      // Call the backend API with reordered images (main image first)
      interface ProductCreationResult {
        productId: number
        message?: string
      }
      let result: ProductCreationResult

      // Check if we have many images and implement batch upload if needed
      if (reorderedImages.length > 10) {
        console.warn(`[Sell] Many images (${reorderedImages.length}) - implementing batch approach`)

        let createdProductId: number | null = null

        try {
          // First, create product with first batch of images (including main image)
          const firstBatch = reorderedImages.slice(0, 5) // First 5 images including main
          console.log(`[Sell] Creating product with first batch: ${firstBatch.length} images`)

          result = await apiClient.createProduct(productData, firstBatch)
          createdProductId = result.productId

          if (!createdProductId) {
            throw new Error('Product creation failed: No product ID returned')
          }

          console.log(`[Sell] Product created with ID: ${createdProductId}`)

          // If successful and we have more images, add them in batches using update
          if (reorderedImages.length > 5) {
            const remainingImages = reorderedImages.slice(5)
            console.log(`[Sell] Adding remaining ${remainingImages.length} images in batches`)

            // Split remaining images into smaller batches
            const batchSize = 5
            for (let i = 0; i < remainingImages.length; i += batchSize) {
              const batch = remainingImages.slice(i, i + batchSize)
              const batchNumber = Math.floor(i / batchSize) + 1

              console.log(`[Sell] Adding batch ${batchNumber}: ${batch.length} images`)

              try {
                await apiClient.updateProduct(createdProductId.toString(), {}, batch)
                console.log(`[Sell] ✅ Successfully added batch ${batchNumber}`)
              } catch (batchError) {
                console.error(`[Sell] ❌ Failed to add batch ${batchNumber}:`, batchError)
                // Don't continue - stop on first failure to trigger rollback
                throw new Error(
                  `Failed to upload batch ${batchNumber} of ${Math.ceil(remainingImages.length / batchSize)}. ` +
                    `${batchError instanceof Error ? batchError.message : 'Unknown error'}`
                )
              }
            }
          }

          console.log('[Sell] ✅ All batches uploaded successfully')
        } catch (batchUploadError) {
          // Rollback: Delete the partially created product
          if (createdProductId) {
            console.warn(
              `[Sell] 🔄 Rolling back product creation (ID: ${createdProductId}) due to batch upload failure`
            )

            try {
              await apiClient.deleteProduct(createdProductId.toString())
              console.log('[Sell] ✅ Product successfully rolled back (deleted)')

              toast({
                title: '❌ Upload Failed',
                description:
                  'Some images failed to upload. The listing was not created. Please try with fewer images or smaller file sizes.',
                variant: 'destructive',
                duration: 8000,
              })
            } catch (deleteError) {
              console.error('[Sell] ❌ Rollback failed - could not delete product:', deleteError)

              toast({
                title: '⚠️ Partial Upload',
                description: `Product was created (ID: ${createdProductId}) but some images failed. Please edit the listing to add missing images.`,
                variant: 'destructive',
                duration: 10000,
              })
            }
          }

          // Re-throw the error to be caught by outer catch block
          throw batchUploadError
        }
      } else {
        // Normal single request for 10 or fewer images
        console.log(
          `[Sell] Creating product with ${reorderedImages.length} images in single request`
        )
        result = await apiClient.createProduct(productData, reorderedImages)
      }

      // CRITICAL CHECK: Verify product ID was returned
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!result.productId && !(result as any).data?.productId) {
        console.error('❌ CRITICAL: No productId in response!')
        console.error('❌ Product may not have been saved to database')
        console.error('❌ Full response:', JSON.stringify(result, null, 2))

        // Show user-friendly toast instead of alert
        toast({
          title: '⚠️ Listing May Need Review',
          description:
            'Your listing was submitted but confirmation was not received. Please check "My Listings" to verify it was created.',
          variant: 'destructive',
          duration: 10000, // 10 seconds
        })

        // Still redirect but with warning parameter
        await new Promise((resolve) => setTimeout(resolve, 3000))
        window.location.href = '/expat/dashboard?tab=listings&warning=check-status'
        return
      }

      // Store the product ID for verification
      if (result.productId) {
        // Show success toast
        toast({
          title: '✅ Listing Published!',
          description: `Your item "${formData.title}" has been successfully listed on the marketplace.`,
          variant: 'default',
        })

        // Wait a moment for user to see the toast
        await new Promise((resolve) => setTimeout(resolve, 1500))
      } else {
        console.warn('⚠️ Warning: No productId in response. Product may need approval.')

        // Show warning toast
        toast({
          title: '⚠️ Listing Submitted',
          description: 'Your listing has been submitted and is pending review.',
          variant: 'default',
        })

        await new Promise((resolve) => setTimeout(resolve, 1500))
      }

      // Redirect to dashboard with My Listings tab
      window.location.href = '/expat/dashboard?tab=listings'

      // Reset form
      setFormData(INITIAL_FORM_DATA)
      setCurrentStep(1)
    } catch (error) {
      console.error('❌ Failed to publish listing:', error)
      let errorMessage = 'Failed to publish listing. Please try again.'

      if (error instanceof Error) {
        if (
          error.message.includes('multipart servlet request') ||
          error.message.includes('Failed to parse multipart')
        ) {
          errorMessage = `Upload failed due to image processing issues. Try with fewer images (max 10) or smaller file sizes (max 10MB each).`
        } else if (error.message.includes('images')) {
          errorMessage = error.message
        } else {
          errorMessage = error.message
        }
      }

      // Show error toast
      toast({
        title: '❌ Publishing Failed',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] py-6 sm:py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-[#0F172A] tracking-tight mb-3 sm:mb-4">
            List Your Item
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-[#475569] max-w-2xl mx-auto px-4">
            Create a professional listing and reach thousands of potential buyers in our global
            expat community
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-10 sm:mb-12">
          <div className="flex items-center justify-center max-w-3xl mx-auto px-4">
            {[1, 2, 3].map((step, index) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center w-full">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm sm:text-base font-semibold transition-all duration-300 ${
                      step === currentStep
                        ? 'bg-[#1E3A8A] text-white shadow-md'
                        : step < currentStep
                          ? 'bg-[#1E3A8A] text-white'
                          : 'bg-[#F1F5F9] text-[#94A3B8] border-2 border-[#E2E8F0]'
                    }`}
                  >
                    {step}
                  </div>
                  <span
                    className={`mt-2 text-xs sm:text-sm font-medium transition-all duration-300 text-center ${
                      step <= currentStep ? 'text-[#0F172A]' : 'text-[#94A3B8]'
                    }`}
                  >
                    {STEP_TITLES[step - 1]}
                  </span>
                </div>
                {index < 2 && (
                  <div className="flex-1 h-0.5 mx-2 sm:mx-4 mb-8">
                    <div
                      className={`h-full transition-all duration-300 ${
                        step < currentStep ? 'bg-[#1E3A8A]' : 'bg-[#E2E8F0]'
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <StepContent
              currentStep={currentStep}
              formData={formData}
              updateFormData={updateFormData}
              handleImageUpload={handleImageUpload}
              removeImage={removeImage}
              setMainImage={setMainImage}
              backendCategories={backendCategories}
            />

            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8 sm:mt-12">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 h-auto text-base sm:text-lg order-2 sm:order-1"
              >
                Previous
              </Button>
              {currentStep < 3 ? (
                <Button
                  onClick={nextStep}
                  className="w-full sm:w-auto px-8 py-3 text-base bg-[#1E3A8A] hover:bg-[#1e3a8a]/90 text-white order-1 sm:order-2"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  onClick={publishListing}
                  disabled={isPublishing}
                  className="w-full sm:w-auto px-8 py-3 text-base bg-[#1E3A8A] hover:bg-[#1e3a8a]/90 text-white order-1 sm:order-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isPublishing ? (
                    <span className="flex items-center gap-2">
                      Publishing
                      <span className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></span>
                      </span>
                    </span>
                  ) : (
                    'Publish Listing'
                  )}
                </Button>
              )}
            </div>
          </div>

          <SellingSidebar currentStep={currentStep} selectedCategory={formData.category} />
        </div>
      </div>
    </div>
  )
}

// Extracted step content component
function StepContent({
  currentStep,
  formData,
  updateFormData,
  handleImageUpload,
  removeImage,
  setMainImage,
  backendCategories,
}: {
  currentStep: number
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  removeImage: (index: number) => void
  setMainImage: (imageUrl: string) => void
  backendCategories: Array<{ categoryId: number; categoryName: string }>
}) {
  const stepConfig = {
    1: {
      title: 'Basic Item Details',
      description: 'Tell us about your item. The more details, the better!',
    },
    2: {
      title: 'Photos & Description',
      description: 'Great photos sell faster! Add multiple angles.',
    },
    3: {
      title: 'Pricing & Options',
      description: 'Set a competitive price and choose listing options.',
    },
  }

  const config = stepConfig[currentStep as keyof typeof stepConfig]

  return (
    <Card className="shadow-lg border-2 border-[#E2E8F0] bg-white rounded-xl sm:rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-[#E2E8F0] p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center text-sm font-semibold">
            {currentStep}
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl font-semibold text-[#0F172A] mb-1">
              {config.title}
            </CardTitle>
            <p className="text-sm text-[#475569]">{config.description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 sm:space-y-8 lg:space-y-10 p-4 sm:p-6 lg:p-10">
        {currentStep === 1 && (
          <Step1Content
            formData={formData}
            updateFormData={updateFormData}
            backendCategories={backendCategories}
          />
        )}
        {currentStep === 2 && (
          <Step2Content
            formData={formData}
            updateFormData={updateFormData}
            handleImageUpload={handleImageUpload}
            removeImage={removeImage}
            setMainImage={setMainImage}
          />
        )}
        {currentStep === 3 && <Step3Content formData={formData} updateFormData={updateFormData} />}
      </CardContent>
    </Card>
  )
}

// Step 1: Basic Details
function Step1Content({
  formData,
  updateFormData,
  backendCategories,
}: {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
  backendCategories: Array<{ categoryId: number; categoryName: string }>
}) {
  return (
    <>
      <div className="space-y-2 sm:space-y-3">
        <Label htmlFor="title" className="text-sm sm:text-base font-semibold text-neutral-800">
          Item Title *
        </Label>
        <Input
          id="title"
          placeholder="e.g., MacBook Pro 14″ M2, iPhone 15 Pro Max"
          className="h-12 sm:h-14 text-base sm:text-lg border-2 border-[#E2E8F0] rounded-xl focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all duration-200 bg-white"
          value={formData.title}
          onChange={(e) => updateFormData({ title: e.target.value })}
        />
        <p className="text-xs sm:text-sm text-neutral-500">
          Include brand, model, and key features
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
        <div className="space-y-3">
          <Label className="text-base font-semibold text-neutral-800">Category *</Label>
          <Select
            onValueChange={(value) => {
              // Clear category fields when category changes
              updateFormData({ category: value, categoryFields: {} })
            }}
            value={formData.category}
          >
            <SelectTrigger className="h-12 sm:h-14 border-2 border-[#E2E8F0] rounded-xl focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 bg-white">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {backendCategories.length > 0 ? (
                backendCategories
                  .filter((cat) => cat.categoryName.toLowerCase() !== 'jobs')
                  .map((cat) => (
                    <SelectItem key={cat.categoryId} value={cat.categoryName}>
                      {cat.categoryName}
                    </SelectItem>
                  ))
              ) : (
                <SelectItem disabled value="loading">
                  Loading categories...
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-semibold text-neutral-800">Condition *</Label>
          <Select
            onValueChange={(value) => updateFormData({ condition: value })}
            value={formData.condition}
          >
            <SelectTrigger className="h-12 sm:h-14 border-2 border-[#E2E8F0] rounded-xl focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 bg-white">
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              {ITEM_CONDITIONS.map((cond) => (
                <SelectItem key={cond.value} value={cond.value}>
                  {cond.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-base font-semibold text-neutral-800">Location *</Label>
        <Select
          onValueChange={(value) => updateFormData({ location: value })}
          value={formData.location}
        >
          <SelectTrigger className="h-12 sm:h-14 border-2 border-[#E2E8F0] rounded-xl focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 bg-white">
            <SelectValue placeholder="Select your location" />
          </SelectTrigger>
          <SelectContent>
            {EXPAT_LOCATIONS.map((loc) => (
              <SelectItem key={loc.value} value={loc.label}>
                {loc.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  )
}

// Dynamic Category Fields Component
function CategorySpecificFields({
  category,
  categoryFields,
  updateFormData,
}: {
  category: string
  categoryFields: Record<string, string>
  updateFormData: (updates: Partial<FormData>) => void
}) {
  const fields = getCategoryFields(category)

  if (!category || fields.length === 0) {
    return null
  }

  const updateCategoryField = (fieldKey: string, value: string) => {
    const newCategoryFields = { ...categoryFields, [fieldKey]: value }
    updateFormData({ categoryFields: newCategoryFields })
  }

  return (
    <div className="space-y-6 border-t border-[#E2E8F0] pt-6">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-[#1E3A8A] rounded-full"></div>
        <h3 className="text-lg font-semibold text-[#0F172A]">{category} Details</h3>
        <Badge variant="secondary" className="ml-2 text-xs">
          {fields.filter((f) => f.required).length} required
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {fields.map((field) => (
          <div key={field.key} className="space-y-3">
            <Label className="text-sm sm:text-base font-semibold text-neutral-800">
              {field.label} {field.required && '*'}
            </Label>

            {field.type === 'select' ? (
              <Select
                onValueChange={(value) => updateCategoryField(field.key, value)}
                value={categoryFields[field.key] || ''}
              >
                <SelectTrigger className="h-11 sm:h-12 border-2 border-[#E2E8F0] rounded-xl focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 bg-white">
                  <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : field.type === 'textarea' ? (
              <Textarea
                placeholder={field.placeholder}
                className="border-2 border-[#E2E8F0] rounded-xl focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 bg-white resize-none"
                value={categoryFields[field.key] || ''}
                onChange={(e) => updateCategoryField(field.key, e.target.value)}
                maxLength={field.maxLength}
                rows={3}
              />
            ) : (
              <Input
                type={field.type}
                placeholder={field.placeholder}
                className="h-11 sm:h-12 border-2 border-[#E2E8F0] rounded-xl focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 bg-white"
                value={categoryFields[field.key] || ''}
                onChange={(e) => updateCategoryField(field.key, e.target.value)}
                maxLength={field.maxLength}
                min={field.min}
                max={field.max}
                step={field.step}
              />
            )}

            {field.maxLength && field.type !== 'number' && (
              <p className="text-xs text-neutral-500">
                {(categoryFields[field.key] || '').length}/{field.maxLength}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          <strong>Tip:</strong> Adding detailed {category.toLowerCase()} specifications helps buyers
          find exactly what they're looking for and increases your chances of a quick sale.
        </p>
      </div>
    </div>
  )
}

// Step 2: Photos & Description
function Step2Content({
  formData,
  updateFormData,
  handleImageUpload,
  removeImage,
  setMainImage,
}: {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  removeImage: (index: number) => void
  setMainImage: (imageUrl: string) => void
}) {
  return (
    <>
      <div>
        <Label className="text-base font-semibold text-neutral-800 mb-4 block">
          Upload Photos *
        </Label>

        {/* File Input */}
        <div className="mb-6">
          <input
            type="file"
            id="image-upload"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <label
            htmlFor="image-upload"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E3A8A] text-white text-sm rounded-lg hover:bg-[#1E3A8A]/90 cursor-pointer transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Images
          </label>
          <div className="text-xs text-[#94A3B8] mt-2 space-y-1">
            <p>Upload up to 50 images • Max 10MB per image • JPG, PNG, or WebP</p>
            {formData.images.length > 0 && (
              <p className="font-medium">
                Total size:{' '}
                {(formData.images.reduce((sum, file) => sum + file.size, 0) / 1024 / 1024).toFixed(
                  1
                )}
                MB / 100MB
              </p>
            )}
          </div>
        </div>

        {/* Image Preview Grid */}
        {formData.imageUrls.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {formData.imageUrls.map((imageUrl, index) => (
              <div key={index} className="relative aspect-square group">
                <Image
                  src={imageUrl}
                  alt={`Upload ${index + 1}`}
                  fill
                  className="object-cover rounded-lg border-2 border-[#E2E8F0]"
                />

                {/* Remove Button */}
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-8 w-8 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 hover:bg-red-700"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>

                {/* Main Image Badge */}
                {imageUrl === formData.mainImage && (
                  <Badge className="absolute bottom-2 left-2 bg-[#1E3A8A] text-white border-0">
                    Main Photo
                  </Badge>
                )}

                {/* Set as Main Button */}
                {imageUrl !== formData.mainImage && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white text-[#0F172A] text-xs"
                    onClick={() => setMainImage(imageUrl)}
                  >
                    Set Main
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Upload Placeholder */}
        {formData.imageUrls.length === 0 && (
          <div className="border-2 border-dashed border-[#E2E8F0] rounded-lg p-8 text-center bg-[#F8FAFB]">
            <p className="text-sm text-[#64748B] mb-1">No images uploaded</p>
            <p className="text-xs text-[#94A3B8]">
              Click &quot;Add Images&quot; to upload photos of your item
            </p>
          </div>
        )}
      </div>
      <div className="space-y-3">
        <Label htmlFor="description" className="text-base font-semibold text-neutral-800">
          Item Description *
        </Label>
        <Textarea
          id="description"
          placeholder="Describe your item in detail. Include condition, features, reason for selling, etc."
          className="min-h-32 text-base border-2 border-[#E2E8F0] rounded-xl focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all duration-200 bg-white resize-none"
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          maxLength={500}
        />
        <p className="text-sm text-neutral-500">{formData.description.length}/500 characters</p>
      </div>

      {/* Dynamic Category-Specific Fields */}
      <CategorySpecificFields
        category={formData.category}
        categoryFields={formData.categoryFields}
        updateFormData={updateFormData}
      />
    </>
  )
}

// Step 3: Pricing
function Step3Content({
  formData,
  updateFormData,
}: {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
}) {
  return (
    <>
      <div className="space-y-3">
        <Label className="text-base font-semibold text-neutral-800">Currency</Label>
        <Select
          value={formData.currency}
          onValueChange={(value) => updateFormData({ currency: value })}
        >
          <SelectTrigger className="h-12 sm:h-14 border-2 border-[#E2E8F0] rounded-xl focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CURRENCIES.map((curr) => (
              <SelectItem key={curr.code} value={curr.code}>
                {curr.flag} {curr.code} - {curr.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
        <div className="space-y-3">
          <Label htmlFor="price" className="text-base font-semibold text-neutral-800">
            Asking Price * ({formData.currency})
          </Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-medium text-neutral-500">
              {formData.currency === 'TZS'
                ? 'TSh'
                : formData.currency === 'USD'
                  ? '$'
                  : formData.currency === 'KES'
                    ? 'KSh'
                    : 'USh'}
            </span>
            <Input
              id="price"
              type="number"
              placeholder={
                formData.currency === 'TZS'
                  ? '2,500,000'
                  : formData.currency === 'USD'
                    ? '1,000'
                    : formData.currency === 'KES'
                      ? '131,250'
                      : '3,700,000'
              }
              className="pl-16 h-12 sm:h-14 text-base sm:text-lg border-2 border-[#E2E8F0] rounded-xl focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all duration-200 bg-white"
              value={formData.price}
              onChange={(e) => updateFormData({ price: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="originalPrice" className="text-base font-semibold text-neutral-800">
            Original Price{' '}
            <span className="text-sm font-normal text-neutral-500">
              (Optional - can be left blank)
            </span>
          </Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-medium text-neutral-500">
              {formData.currency === 'TZS'
                ? 'TSh'
                : formData.currency === 'USD'
                  ? '$'
                  : formData.currency === 'KES'
                    ? 'KSh'
                    : 'USh'}
            </span>
            <Input
              id="originalPrice"
              type="number"
              placeholder={
                formData.currency === 'TZS'
                  ? '3,000,000'
                  : formData.currency === 'USD'
                    ? '1,200'
                    : formData.currency === 'KES'
                      ? '157,500'
                      : '4,440,000'
              }
              className="pl-16 h-12 sm:h-14 text-base sm:text-lg border-2 border-[#E2E8F0] rounded-xl focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all duration-200 bg-white"
              value={formData.originalPrice}
              onChange={(e) => updateFormData({ originalPrice: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="warranty" className="text-base font-semibold text-neutral-800">
          Warranty Information{' '}
          <span className="text-sm font-normal text-neutral-500">(Optional)</span>
        </Label>
        <Input
          id="warranty"
          type="text"
          placeholder="e.g., 1 year manufacturer warranty, 6 months seller warranty"
          className="h-12 sm:h-14 text-base border-2 border-[#E2E8F0] rounded-xl focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all duration-200 bg-white"
          value={formData.warranty}
          onChange={(e) => {
            // Allow only alphanumeric, spaces, hyphens, commas, and common warranty terms
            const sanitized = e.target.value.replace(/[^a-zA-Z0-9\s\-,./()]/g, '')
            updateFormData({ warranty: sanitized })
          }}
          maxLength={100}
        />
        <p className="text-xs sm:text-sm text-neutral-500">
          {formData.warranty.length}/100 • Specify warranty details if applicable (e.g., remaining
          manufacturer warranty, seller guarantee)
        </p>
      </div>

      <div className="bg-[#F8FAFB] border border-[#E2E8F0] rounded-lg p-6">
        <h3 className="text-base font-semibold text-[#0F172A] mb-2">Review & Publish</h3>
        <p className="text-sm text-[#475569]">
          Your listing will be published immediately and visible to buyers on the marketplace.
        </p>
      </div>
    </>
  )
}

// Sidebar component
function SellingSidebar({
  currentStep,
  selectedCategory,
}: {
  currentStep: number
  selectedCategory?: string
}) {
  const stepTips = getStepTips(currentStep)
  const categoryTips = selectedCategory ? getCategoryTips(selectedCategory) : []
  const stepName = getStepName(currentStep)

  return (
    <aside className="hidden lg:block lg:col-span-1">
      <div className="sticky top-8 space-y-6">
        <Card className="border border-[#E2E8F0] bg-white rounded-lg">
          <CardHeader className="border-b border-[#E2E8F0] p-4">
            <CardTitle className="text-sm font-semibold text-[#0F172A]">{stepName} Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 p-4">
            {stepTips.map((tip, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1E3A8A]/10 flex items-center justify-center">
                    <tip.icon className="w-3 h-3 text-[#1E3A8A]" />
                  </div>
                  <h4 className="text-sm font-bold text-[#0F172A]">{tip.title}</h4>
                </div>
                <p className="text-xs text-[#64748B] leading-relaxed pl-8">{tip.description}</p>
              </div>
            ))}

            {/* Category-specific tips */}
            {categoryTips.length > 0 && (
              <>
                <div className="border-t border-[#E2E8F0] pt-4 mt-4">
                  <h5 className="text-xs font-semibold text-[#1E3A8A] mb-3 uppercase tracking-wider">
                    {selectedCategory} Specific
                  </h5>
                </div>
                {categoryTips.map((tip, index) => (
                  <div key={`category-${index}`} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                        <tip.icon className="w-3 h-3 text-amber-600" />
                      </div>
                      <h4 className="text-sm font-bold text-[#0F172A]">{tip.title}</h4>
                    </div>
                    <p className="text-xs text-[#64748B] leading-relaxed pl-8">{tip.description}</p>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border border-[#E2E8F0] bg-white rounded-lg">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#64748B]">Progress</span>
                <span className="text-xs font-semibold text-[#0F172A]">
                  Step {currentStep} of 3
                </span>
              </div>
              <div className="w-full bg-[#F1F5F9] rounded-full h-1.5">
                <div
                  className="bg-[#1E3A8A] h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  )
}
