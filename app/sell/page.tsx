'use client'

import { useState, useEffect } from 'react'
import { X, Plus, DollarSign, AlertCircle } from 'lucide-react'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { RouteGuard } from '@/components/route-guard'
import { useAuth } from '@/hooks/use-auth'
import { apiClient } from '@/lib/api'
import { ITEM_CONDITIONS, SELLING_TIPS, EXPAT_LOCATIONS, CURRENCIES } from '@/lib/constants'
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
  isPremium: boolean
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
  isPremium: false,
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
  const { user, isLoggedIn } = useAuth()
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA)
  const [currentStep, setCurrentStep] = useState(1)
  const [errors, setErrors] = useState<string[]>([])
  const [backendCategories, setBackendCategories] = useState<
    Array<{ categoryId: number; categoryName: string }>
  >([])

  // Debug logging
  console.log('🖼️ SELL PAGE - FormData:', {
    imageUrls: formData.imageUrls,
    mainImage: formData.mainImage,
    imagesCount: formData.images.length,
  })
  console.log('🔐 AUTH STATE:', { user: user?.email, isLoggedIn })

  // Fetch categories from backend on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('📋 Fetching categories from backend...')
        const categories = await apiClient.getCategories()
        console.log('📋 Categories fetched:', categories)
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
    console.log('📝 UPDATE FORM DATA:', updates)
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  // Handle real file upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📸 HANDLE IMAGE UPLOAD TRIGGERED')
    const files = event.target.files
    if (!files) {
      console.log('❌ No files selected')
      return
    }

    console.log('📁 Files selected:', files.length)
    const newFiles = Array.from(files)
    const newImageUrls: string[] = []

    newFiles.forEach((file, index) => {
      console.log(`📷 Processing file ${index + 1}:`, {
        name: file.name,
        type: file.type,
        size: file.size,
      })

      // Validate file type
      if (!file.type.startsWith('image/')) {
        console.log('❌ Invalid file type:', file.type)
        setErrors(['Please upload only image files'])
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        console.log('❌ File too large:', file.size)
        setErrors(['Image file size must be less than 5MB'])
        return
      }

      // Create preview URL
      const imageUrl = URL.createObjectURL(file)
      console.log('✅ Created preview URL:', imageUrl)
      newImageUrls.push(imageUrl)
    })

    // Update form data
    const updatedImages = [...formData.images, ...newFiles]
    const updatedImageUrls = [...formData.imageUrls, ...newImageUrls]
    const newMainImage = formData.mainImage || newImageUrls[0] || ''

    console.log('💾 Updating form data:', {
      totalImages: updatedImages.length,
      totalUrls: updatedImageUrls.length,
      newMainImage,
    })

    updateFormData({
      images: updatedImages,
      imageUrls: updatedImageUrls,
      mainImage: newMainImage,
    })

    // Clear the input
    event.target.value = ''
    console.log('🔄 Input cleared')
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
    const newErrors: string[] = []

    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.push('Please enter a title')
        if (!formData.category) newErrors.push('Please select a category')
        if (!formData.condition) newErrors.push('Please select condition')
        if (!formData.location) newErrors.push('Please choose location')
        break
      case 2:
        if (formData.images.length === 0) newErrors.push('Please upload at least one image')
        if (!formData.description.trim()) newErrors.push('Please add description')
        break
      case 3:
        if (!formData.price) newErrors.push('Please set a price')
        break
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 3) {
      setCurrentStep(currentStep + 1)
      setErrors([])
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setErrors([])
    }
  }

  const publishListing = async () => {
    if (!validateStep(3)) return

    try {
      setErrors([])
      console.log('🚀 Starting product creation...')

      // Debug authentication
      console.log('🔐 API Client headers:', apiClient)

      // Validate we have images
      if (formData.images.length === 0) {
        setErrors(['Please upload at least one image for your product'])
        return
      }

      // Find the selected category ID from backend categories
      const selectedCategory = backendCategories.find(
        (cat) =>
          cat.categoryName.toLowerCase() === formData.category.toLowerCase() ||
          cat.categoryId.toString() === formData.category
      )

      if (!selectedCategory) {
        setErrors(['Please select a valid category'])
        return
      }

      const categoryId = selectedCategory.categoryId

      // Transform form data to match backend expectations
      const productData = {
        productName: formData.title.trim(),
        categoryId: categoryId,
        condition: formData.condition,
        location: formData.location,
        productDescription: formData.description.trim(),
        currency: formData.currency,
        askingPrice: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : 0,
        productWarranty: '1 year manufacturer warranty', // Default warranty
      }

      console.log('📦 Product data prepared:', productData)
      console.log('🖼️ Images to upload:', formData.images.length, 'files')

      // Log individual image details
      formData.images.forEach((file, index) => {
        console.log(`📸 Image ${index + 1}:`, {
          name: file.name,
          size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          type: file.type,
        })
      })

      console.log('🚀 FINAL PAYLOAD TO BACKEND:')
      console.log('- Endpoint: POST /api/backend/v1/products/post-product')
      console.log('- Product Data:', JSON.stringify(productData, null, 2))
      console.log(
        '- Image Files:',
        formData.images.map((f) => f.name)
      )
      console.log('- Form Data Structure:', {
        product: JSON.stringify(productData),
        images: formData.images.length + ' files',
      })

      // Call the backend API
      console.log('📤 Sending product creation request...')
      const result = await apiClient.createProduct(productData, formData.images)

      console.log('✅ Product created successfully!')
      console.log('📋 FULL Product creation response:', JSON.stringify(result, null, 2))
      console.log('📋 Product ID:', result.productId)
      console.log('📋 Image IDs:', result.imageIds)

      // CRITICAL CHECK: Verify product ID was returned
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!result.productId && !(result as any).data?.productId) {
        console.error('❌ CRITICAL: No productId in response!')
        console.error('❌ Product may not have been saved to database')
        console.error('❌ Full response:', result)
        alert('⚠️ Warning: Product creation returned no ID. Please check with support.')
      }

      // Store the product ID for verification
      if (result.productId) {
        console.log('🎉 Product successfully created with ID:', result.productId)
        // Wait a moment for backend to process
        await new Promise((resolve) => setTimeout(resolve, 1000))
      } else {
        console.warn('⚠️ Warning: No productId in response. Product may need approval.')
      }

      // Redirect to dashboard with My Listings tab
      console.log('🔄 Redirecting to dashboard...')
      window.location.href = '/expat/dashboard?tab=listings'

      // Reset form
      setFormData(INITIAL_FORM_DATA)
      setCurrentStep(1)
    } catch (error) {
      console.error('❌ Failed to publish listing:', error)
      setErrors([
        error instanceof Error ? error.message : 'Failed to publish listing. Please try again.',
      ])
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
            {errors.length > 0 && (
              <Alert variant="destructive" className="mb-8">
                <AlertCircle className="h-5 w-5" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

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
                  className="w-full sm:w-auto px-8 py-3 text-base bg-[#1E3A8A] hover:bg-[#1e3a8a]/90 text-white order-1 sm:order-2"
                >
                  Publish Listing
                </Button>
              )}
            </div>
          </div>

          <SellingSidebar currentStep={currentStep} />
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
            onValueChange={(value) => updateFormData({ category: value })}
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
          <p className="text-xs text-[#94A3B8] mt-2">
            Upload up to 10 images • Max 5MB per image • JPG, PNG, or WebP
          </p>
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
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <Input
              id="price"
              type="number"
              placeholder="2500000"
              className="pl-12 h-12 sm:h-14 text-base sm:text-lg border-2 border-[#E2E8F0] rounded-xl focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all duration-200 bg-white"
              value={formData.price}
              onChange={(e) => updateFormData({ price: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="originalPrice" className="text-base font-semibold text-neutral-800">
            Original Price
          </Label>
          <div className="relative">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <Input
              id="originalPrice"
              type="number"
              placeholder="3000000"
              className="pl-12 h-12 sm:h-14 text-base sm:text-lg border-2 border-[#E2E8F0] rounded-xl focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all duration-200 bg-white"
              value={formData.originalPrice}
              onChange={(e) => updateFormData({ originalPrice: e.target.value })}
            />
          </div>
        </div>
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
function SellingSidebar({ currentStep }: { currentStep: number }) {
  return (
    <aside className="hidden lg:block lg:col-span-1">
      <div className="sticky top-8 space-y-8">
        <Card className="border border-[#E2E8F0] bg-white rounded-lg">
          <CardHeader className="border-b border-[#E2E8F0] p-4">
            <CardTitle className="text-sm font-semibold text-[#0F172A]">Selling Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-4">
            {SELLING_TIPS.map((tip, index) => (
              <div key={index} className="space-y-2">
                <h4 className="text-base font-bold text-[#0F172A]">{tip.title}</h4>
                <p className="text-sm text-[#64748B] leading-relaxed">{tip.description}</p>
              </div>
            ))}
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
