'use client'

import { useState } from 'react'
import { X, Plus, DollarSign, AlertCircle, CheckCircle2, Camera, Sparkles } from 'lucide-react'
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
import {
  SELLING_CATEGORIES,
  ITEM_CONDITIONS,
  SELLING_TIPS,
  EXPAT_LOCATIONS,
  CURRENCIES,
} from '@/lib/constants'
import Image from 'next/image'

interface FormData {
  images: string[]
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
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA)
  const [currentStep, setCurrentStep] = useState(1)
  const [errors, setErrors] = useState<string[]>([])

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  const addImage = (type: string) => {
    const newImageUrl = `/placeholder.svg?height=400&width=400&text=${type}`
    if (type === 'main') {
      updateFormData({ mainImage: newImageUrl })
    }
    if (!formData.images.includes(newImageUrl)) {
      updateFormData({ images: [...formData.images, newImageUrl] })
    }
  }

  const removeImage = (imageUrl: string) => {
    if (imageUrl === formData.mainImage) {
      updateFormData({ mainImage: '' })
    }
    updateFormData({ images: formData.images.filter((img) => img !== imageUrl) })
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
        if (!formData.mainImage) newErrors.push('Please upload at least one image')
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

    const payload = {
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim(),
      price: `${parseFloat(formData.price).toLocaleString()} ${formData.currency}`,
      originalPrice: formData.originalPrice
        ? `${parseFloat(formData.originalPrice).toLocaleString()} ${formData.currency}`
        : undefined,
    }

    try {
      // TODO: Replace with actual API call
      console.log('Publishing listing:', payload)
      alert('Listing published successfully!')
    } catch (error) {
      console.error('Failed to publish listing:', error)
      setErrors(['Failed to publish listing. Please try again.'])
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-surface-secondary to-neutral-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-accent rounded-3xl flex items-center justify-center shadow-futuristic">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-6xl font-display font-bold bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent tracking-tight">
              List Your Item
            </h1>
          </div>
          <p className="text-2xl text-neutral-600 max-w-3xl mx-auto font-medium">
            Create a professional listing and reach thousands of potential buyers in our global
            expat community
          </p>
        </div>

        {/* Modern Step Indicator */}
        <div className="mb-16">
          <div className="flex items-center justify-between max-w-3xl mx-auto mb-10">
            {[1, 2, 3].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-20 h-20 rounded-3xl flex items-center justify-center text-xl font-display font-bold transition-all duration-500 transform ${
                      step <= currentStep
                        ? 'bg-gradient-to-br from-brand-primary to-brand-accent text-white shadow-futuristic scale-110'
                        : 'bg-surface-elevated text-neutral-400 border-2 border-neutral-300 shadow-card'
                    }`}
                  >
                    {step < currentStep ? <CheckCircle2 className="h-8 w-8" /> : step}
                  </div>
                  <span
                    className={`mt-4 text-lg font-display font-semibold transition-all duration-300 ${
                      step <= currentStep ? 'text-brand-primary' : 'text-neutral-500'
                    }`}
                  >
                    {STEP_TITLES[step - 1]}
                  </span>
                </div>
                {index < 2 && (
                  <div
                    className={`w-32 h-3 mx-8 rounded-full transition-all duration-500 ${
                      step < currentStep
                        ? 'bg-gradient-to-r from-brand-primary to-brand-accent shadow-card'
                        : 'bg-neutral-200'
                    }`}
                  />
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
              addImage={addImage}
              removeImage={removeImage}
            />

            <div className="flex justify-between mt-12">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-8 py-3 h-auto text-lg"
              >
                Previous
              </Button>
              {currentStep < 3 ? (
                <Button
                  onClick={nextStep}
                  className="px-8 py-3 h-auto text-lg bg-gradient-to-r from-brand-primary to-brand-accent hover:from-blue-800 hover:to-cyan-600"
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  onClick={publishListing}
                  className="px-8 py-3 h-auto text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
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
  addImage,
  removeImage,
}: {
  currentStep: number
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
  addImage: (type: string) => void
  removeImage: (imageUrl: string) => void
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
    <Card className="shadow-futuristic border border-neutral-200 bg-surface-elevated rounded-3xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-brand-primary to-brand-accent text-white p-8">
        <CardTitle className="flex items-center gap-4 text-3xl font-display font-bold">
          <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center text-lg font-bold">
            {currentStep}
          </div>
          {config.title}
        </CardTitle>
        <p className="text-white/90 mt-3 text-lg">{config.description}</p>
      </CardHeader>
      <CardContent className="space-y-10 p-10">
        {currentStep === 1 && <Step1Content formData={formData} updateFormData={updateFormData} />}
        {currentStep === 2 && (
          <Step2Content
            formData={formData}
            updateFormData={updateFormData}
            addImage={addImage}
            removeImage={removeImage}
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
}: {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
}) {
  return (
    <>
      <div className="space-y-3">
        <Label htmlFor="title" className="text-base font-semibold text-neutral-800">
          Item Title *
        </Label>
        <Input
          id="title"
          placeholder="e.g., MacBook Pro 14″ M2, iPhone 15 Pro Max"
          className="h-14 text-lg border-2 border-neutral-300 rounded-2xl focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all duration-300 bg-surface-elevated"
          value={formData.title}
          onChange={(e) => updateFormData({ title: e.target.value })}
        />
        <p className="text-sm text-neutral-500">Include brand, model, and key features</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <Label className="text-base font-semibold text-neutral-800">Category *</Label>
          <Select
            onValueChange={(value) => updateFormData({ category: value })}
            value={formData.category}
          >
            <SelectTrigger className="h-14 border-2 border-neutral-300 rounded-2xl focus:border-brand-primary bg-surface-elevated">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {SELLING_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-semibold text-neutral-800">Condition *</Label>
          <Select
            onValueChange={(value) => updateFormData({ condition: value })}
            value={formData.condition}
          >
            <SelectTrigger className="h-14 border-2 border-neutral-300 rounded-2xl focus:border-brand-primary bg-surface-elevated">
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
          <SelectTrigger className="h-14 border-2 border-neutral-300 rounded-2xl focus:border-brand-primary bg-surface-elevated">
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
  addImage,
  removeImage,
}: {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
  addImage: (type: string) => void
  removeImage: (imageUrl: string) => void
}) {
  return (
    <>
      <div>
        <Label className="text-base font-semibold text-neutral-800 mb-4 block">
          Upload Photos *
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="col-span-2 aspect-square border-2 border-dashed border-blue-300 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-colors cursor-pointer group">
            {formData.mainImage ? (
              <div className="relative w-full h-full">
                <Image
                  src={formData.mainImage}
                  alt="Main"
                  fill
                  className="object-cover rounded-lg"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-8 w-8 rounded-full shadow-lg"
                  onClick={() => removeImage(formData.mainImage)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Badge className="absolute bottom-2 left-2 bg-blue-600 text-white">
                  Main Photo
                </Badge>
              </div>
            ) : (
              <Button
                variant="ghost"
                onClick={() => addImage('main')}
                className="h-full w-full flex-col gap-3 hover:bg-transparent"
              >
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Camera className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-center">
                  <span className="font-medium text-blue-600">Main Photo</span>
                  <p className="text-xs text-neutral-500 mt-1">Required</p>
                </div>
              </Button>
            )}
          </div>

          {[1, 2, 3, 4].map((num) => (
            <div
              key={num}
              className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group"
            >
              <Button
                variant="ghost"
                onClick={() => addImage(`detail-${num}`)}
                className="h-full w-full flex-col gap-2 hover:bg-transparent"
              >
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center group-hover:bg-gray-300 transition-colors">
                  <Plus className="h-4 w-4 text-gray-600" />
                </div>
                <span className="text-xs text-gray-500">Add Photo</span>
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="description" className="text-base font-semibold text-neutral-800">
          Description *
        </Label>
        <Textarea
          id="description"
          rows={8}
          placeholder="Describe your item in detail..."
          className="text-base border-2 border-neutral-300 rounded-2xl focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all duration-300 resize-none bg-surface-elevated"
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
        />
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
          <SelectTrigger className="h-14 border-2 border-neutral-300 rounded-2xl focus:border-brand-primary bg-surface-elevated">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
              className="pl-12 h-14 text-lg border-2 border-neutral-300 rounded-2xl focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all duration-300 bg-surface-elevated"
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
              className="pl-12 h-14 text-lg border-2 border-neutral-300 rounded-2xl focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all duration-300 bg-surface-elevated"
              value={formData.originalPrice}
              onChange={(e) => updateFormData({ originalPrice: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-status-success/10 to-brand-primary/10 border-2 border-status-success/20 rounded-2xl p-8 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle2 className="h-8 w-8 text-status-success" />
          <h3 className="text-xl font-display font-bold text-neutral-900">Ready to Publish!</h3>
        </div>
        <p className="text-neutral-700 text-lg">
          Your listing will be reviewed and go live within a few minutes.
        </p>
      </div>
    </>
  )
}

// Sidebar component
function SellingSidebar({ currentStep }: { currentStep: number }) {
  return (
    <aside className="lg:col-span-1">
      <div className="sticky top-8 space-y-8">
        <Card className="border border-neutral-200 bg-white rounded-lg overflow-hidden">
          <CardHeader className="bg-brand-primary text-white p-4">
            <CardTitle className="text-white flex items-center gap-2 text-lg font-semibold">
              💡 Pro Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {SELLING_TIPS.map((tip, index) => {
              const Icon = tip.icon
              return (
                <div key={index} className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-1">{tip.title}</h4>
                    <p className="text-neutral-600 text-sm">{tip.description}</p>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card className="border border-neutral-200 bg-white rounded-lg">
          <CardContent className="p-6">
            <h3 className="font-semibold text-neutral-900 mb-4 text-lg">Your Progress</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-neutral-600">Completion</span>
                <span className="font-semibold text-brand-primary">
                  {Math.round((currentStep / 3) * 100)}%
                </span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div
                  className="bg-brand-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                />
              </div>
              <p className="text-neutral-500 text-sm">Step {currentStep} of 3 completed</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  )
}
