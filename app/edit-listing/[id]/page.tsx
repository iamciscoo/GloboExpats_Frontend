'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RouteGuard } from '@/components/route-guard'
import { useAuth } from '@/hooks/use-auth'
import { apiClient } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { ITEM_CONDITIONS, EXPAT_LOCATIONS, CURRENCIES } from '@/lib/constants'
import { getFullImageUrl } from '@/lib/image-utils'
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react'

interface FormData {
  productName: string
  categoryId: number
  condition: string
  location: string
  productDescription: string
  currency: string
  askingPrice: string
  originalPrice: string
  productWarranty: string
}

export default function EditListingPage() {
  return (
    <RouteGuard requireAuth requireVerification="sell" loadingMessage="Loading listing editor...">
      <EditListingContent />
    </RouteGuard>
  )
}

function EditListingContent() {
  useAuth() // Auth context available if needed
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [product, setProduct] = useState<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [categories, setCategories] = useState<any[]>([])

  const [formData, setFormData] = useState<FormData>({
    productName: '',
    categoryId: 0,
    condition: '',
    location: '',
    productDescription: '',
    currency: 'TZS',
    askingPrice: '',
    originalPrice: '',
    productWarranty: '',
  })

  // Fetch product data and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch product details and categories in parallel
        const [productResponse, categoriesResponse] = await Promise.all([
          apiClient.getProductForEdit(productId),
          apiClient.getCategories(),
        ])

        console.log('Product data:', productResponse)
        setProduct(productResponse)
        setCategories(categoriesResponse)

        // Pre-populate form with existing data
        const product = productResponse as Record<string, unknown>
        setFormData({
          productName: String(product.productName || ''),
          categoryId: Number(product.categoryId || 0),
          condition: String(product.productCondition || ''),
          location: String(product.productLocation || ''),
          productDescription: String(product.productDescription || ''),
          currency: String(product.productCurrency || 'TZS'),
          askingPrice: String(product.productAskingPrice || ''),
          originalPrice: String(product.productOriginalPrice || ''),
          productWarranty: String(product.productWarranty || '1 year manufacturer warranty'),
        })
      } catch (error) {
        console.error('Failed to load product:', error)
        setErrors(['Failed to load product data. Please try again.'])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [productId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])

    // Validation
    const newErrors = []
    if (!formData.productName.trim()) newErrors.push('Product name is required')
    if (!formData.categoryId) newErrors.push('Category is required')
    if (!formData.condition) newErrors.push('Condition is required')
    if (!formData.location) newErrors.push('Location is required')
    if (!formData.productDescription.trim()) newErrors.push('Description is required')
    if (!formData.askingPrice || isNaN(Number(formData.askingPrice))) {
      newErrors.push('Valid asking price is required')
    }

    if (newErrors.length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      setSaving(true)

      const updateData = {
        productName: formData.productName.trim(),
        categoryId: formData.categoryId,
        condition: formData.condition,
        location: formData.location,
        productDescription: formData.productDescription.trim(),
        currency: formData.currency,
        askingPrice: parseFloat(formData.askingPrice),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : 0,
        productWarranty: formData.productWarranty,
      }

      console.log('Updating product with data:', updateData)

      const result = await apiClient.updateProduct(productId, updateData)

      console.log('✅ Product updated successfully!', result)

      // Show success toast
      toast({
        title: 'Success!',
        description: 'Your listing has been updated successfully.',
        variant: 'default',
      })

      // Redirect back to dashboard after a brief delay
      setTimeout(() => {
        router.push('/expat/dashboard?tab=listings')
      }, 1000)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('❌ Failed to update product:', error)
      const errorMessage = error?.message || 'Failed to update listing. Please try again.'
      setErrors([errorMessage])

      // Show error toast
      toast({
        title: 'Update Failed',
        description: errorMessage,
        variant: 'destructive',
      })

      // Show more details in console for debugging
      if (error?.response) {
        console.error('Error response:', error.response)
      }
      if (error?.status) {
        console.error('Error status:', error.status)
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#1E3A8A]" />
            <span className="ml-2 text-[#64748B]">Loading listing...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Alert variant="destructive" className="mt-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Product not found or you don&apos;t have permission to edit it.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Edit Listing</h1>
            <p className="text-[#64748B]">Update your product information</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Errors */}
          {errors.length > 0 && (
            <Alert variant="destructive">
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

          {/* Product Images Preview */}
          {product.productImages && product.productImages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Current Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {product.productImages.map((image: any, index: number) => (
                    <div
                      key={index}
                      className="aspect-square bg-gray-100 rounded-lg overflow-hidden"
                    >
                      <Image
                        src={getFullImageUrl(image.imageUrl)}
                        alt={`Product image ${index + 1}`}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-[#64748B] mt-4">
                  Image editing is not yet available. Contact support if you need to update images.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="productName">Product Name</Label>
                <Input
                  id="productName"
                  value={formData.productName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, productName: e.target.value }))
                  }
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.categoryId.toString()}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, categoryId: parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.categoryId} value={category.categoryId.toString()}>
                        {category.categoryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="condition">Condition</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, condition: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {ITEM_CONDITIONS.map((condition) => (
                      <SelectItem key={condition.value} value={condition.value}>
                        {condition.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, location: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPAT_LOCATIONS.map((location) => (
                      <SelectItem key={location.value} value={location.label}>
                        {location.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.productDescription}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, productDescription: e.target.value }))
                  }
                  placeholder="Describe your product..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="askingPrice">Asking Price</Label>
                <Input
                  id="askingPrice"
                  type="number"
                  value={formData.askingPrice}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, askingPrice: e.target.value }))
                  }
                  placeholder="Enter asking price"
                />
              </div>

              <div>
                <Label htmlFor="originalPrice">Original Price (Optional)</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, originalPrice: e.target.value }))
                  }
                  placeholder="Enter original price"
                />
              </div>

              <div>
                <Label htmlFor="warranty">Warranty</Label>
                <Input
                  id="warranty"
                  value={formData.productWarranty}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, productWarranty: e.target.value }))
                  }
                  placeholder="e.g., 1 year manufacturer warranty"
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Listing'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
