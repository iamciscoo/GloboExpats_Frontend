"use client"

import { useState } from "react"
import { X, Plus, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import SellerLayout from "@/components/seller-layout"
import { SELLING_CATEGORIES, ITEM_CONDITIONS, SELLING_TIPS } from "@/lib/constants"
import { getImageTypeLabel } from "@/lib/utils"

export default function SellPage() {
  const [images, setImages] = useState<{ [key: string]: string }>({})
  const [category, setCategory] = useState("")
  const [condition, setCondition] = useState("")
  const [currentStep, setCurrentStep] = useState(1)
  const [errors, setErrors] = useState<string[]>([])

  const selectedCategory = SELLING_CATEGORIES.find((cat) => cat.value === category)
  const requiredImages = selectedCategory?.imageRequirements || []

  const addImage = (type: string) => {
    // Simulate adding an image
    const newImage = `/placeholder.svg?height=200&width=200&text=${type}`
    setImages((prev) => ({ ...prev, [type]: newImage }))
  }

  const removeImage = (type: string) => {
    setImages((prev) => {
      const newImages = { ...prev }
      delete newImages[type]
      return newImages
    })
  }

  const validateStep = (step: number) => {
    const newErrors: string[] = []

    if (step === 1) {
      if (!category) newErrors.push("Please select a category")
      if (!condition) newErrors.push("Please select item condition")
    }

    if (step === 2) {
      // Check if all required images are uploaded
      const missingImages = requiredImages.filter((type) => !images[type])
      if (missingImages.length > 0) {
        newErrors.push(`Missing required images: ${missingImages.join(", ")}`)
      }
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setErrors([])
    }
  }

  const getImageTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      front: "Front View",
      left: "Left Side",
      right: "Right Side",
      interior: "Interior",
      main: "Main Photo",
      screen: "Screen/Display",
      ports: "Ports/Connections",
      detail: "Detail Shot",
      condition: "Condition",
      label: "Product Label",
      cover: "Cover/Front",
      spine: "Spine/Back",
    }
    return labels[type] || type
  }

  const renderStepIndicator = () => (
    <div className="mb-8">
      <ol className="flex items-center w-full">
        {[1, 2, 3].map((step, index) => (
          <li
            key={step}
            className={`flex w-full items-center ${
              index < 2 ? "after:content-[''] after:w-full after:h-1 after:border-b after:border-4 after:inline-block" : ""
            } ${step < currentStep ? "after:border-brand-primary" : "after:border-neutral-200"}`}
          >
            <span
              className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${
                step <= currentStep ? "bg-brand-primary text-white" : "bg-neutral-200 text-neutral-600"
              }`}
            >
              {step}
            </span>
          </li>
        ))}
      </ol>
      <div className="mt-3 grid grid-cols-3 text-center">
        <div className={`font-medium ${currentStep >= 1 ? "text-brand-primary" : "text-neutral-500"}`}>Details</div>
        <div className={`font-medium ${currentStep >= 2 ? "text-brand-primary" : "text-neutral-500"}`}>Photos</div>
        <div className={`font-medium ${currentStep >= 3 ? "text-brand-primary" : "text-neutral-500"}`}>Price & Publish</div>
      </div>
    </div>
  )

  return (
    <SellerLayout>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold font-display text-neutral-800 mb-2">List Your Item</h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Create a new listing for the expert marketplace. A great listing gets more views and sells faster.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            {renderStepIndicator()}
            
            {/* Error Messages */}
            {errors.length > 0 && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Step 1: Item Details */}
            {currentStep === 1 && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Step 1: Item Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-base">Item Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., iPhone 15 Pro Max 256GB"
                      className="h-12 text-lg"
                    />
                     <p className="text-sm text-neutral-500">A clear, concise title attracts more buyers.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-base">Category</Label>
                      <Select onValueChange={setCategory}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select a category" />
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

                    <div className="space-y-2">
                      <Label className="text-base">Condition</Label>
                      <Select onValueChange={setCondition}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          {ITEM_CONDITIONS.map((cond) => (
                            <SelectItem key={cond.value} value={cond.value}>
                              {cond.label} - <span className="text-neutral-500">{cond.description}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

             {/* Step 2: Photos & Description */}
            {currentStep === 2 && (
               <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Step 2: Photos & Description</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                   <div>
                    <Label className="text-base">Upload Photos</Label>
                     <p className="text-sm text-neutral-500 mb-4">High-quality photos are crucial for a quick sale. Please upload all required shots for your category.</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {requiredImages.map((type) => (
                        <div key={type} className="space-y-2">
                          <div className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center relative bg-neutral-50">
                            {images[type] ? (
                              <>
                                <img src={images[type]} alt={type} className="object-cover h-full w-full rounded-md" />
                                <Button
                                  size="icon"
                                  variant="destructive"
                                  className="absolute -top-2 -right-2 h-7 w-7 rounded-full"
                                  onClick={() => removeImage(type)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <Button variant="ghost" onClick={() => addImage(type)}>
                                <Plus className="h-6 w-6 text-neutral-400" />
                              </Button>
                            )}
                          </div>
                          <p className="text-sm font-medium text-center">{getImageTypeLabel(type)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                   <div className="space-y-2">
                    <Label htmlFor="description" className="text-base">Description</Label>
                    <Textarea id="description" rows={6} placeholder="Describe your item in detail. Include any imperfections." />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Pricing & Publish */}
            {currentStep === 3 && (
               <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Step 3: Pricing & Publish</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-base">Asking Price (USD)</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                        <Input id="price" type="number" placeholder="e.g., 999" className="pl-10 h-12 text-lg" />
                      </div>
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="originalPrice" className="text-base">Original Price (Optional)</Label>
                       <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                        <Input id="originalPrice" type="number" placeholder="e.g., 1299" className="pl-10 h-12" />
                      </div>
                    </div>
                  </div>

                   <div className="space-y-4">
                     <div className="flex items-start space-x-3">
                      <Checkbox id="negotiable" className="mt-1" />
                       <div>
                        <Label htmlFor="negotiable" className="font-medium">Price is Negotiable</Label>
                        <p className="text-sm text-neutral-500">Allow buyers to make offers.</p>
                      </div>
                    </div>
                     <div className="flex items-start space-x-3">
                      <Checkbox id="delivery" />
                       <div>
                        <Label htmlFor="delivery" className="font-medium">Offer Delivery</Label>
                        <p className="text-sm text-neutral-500">You can arrange delivery for the buyer.</p>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      You're all set! Review your listing and publish it to the marketplace.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
                Previous
              </Button>
              {currentStep < 3 ? (
                <Button onClick={nextStep}>Next Step</Button>
              ) : (
                <Button className="bg-green-600 hover:bg-green-700">Publish Listing</Button>
              )}
            </div>
          </div>

          {/* Selling Tips */}
          <aside>
            <Card className="bg-neutral-100 border-neutral-200/80 sticky top-24">
              <CardHeader>
                <CardTitle>💡 Pro Selling Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {sellingTips.map((tip, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                        <tip.icon className="w-6 h-6" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-800">{tip.title}</h4>
                      <p className="text-sm text-neutral-600">{tip.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </SellerLayout>
  )
}
