"use client"

import { useState } from "react"
import { Upload, FileText, Shield, MapPin, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

const categories = [
  "Automotive",
  "Home & Furniture",
  "Electronics & Tech",
  "Games & Toys",
  "Fashion & Style",
  "Fitness & Sports",
  "Books & Media",
  "Arts & Crafts",
]

const languages = ["English", "Arabic", "Hindi", "Urdu", "French", "German", "Spanish", "Mandarin"]

export default function SellerRegisterPage() {
  const [businessType, setBusinessType] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const toggleLanguage = (language: string) => {
    setSelectedLanguages((prev) => (prev.includes(language) ? prev.filter((l) => l !== language) : [...prev, language]))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-600 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-4xl font-bold text-white mb-2">
              Global<span className="text-amber-400">Expat</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Become a Premium Seller</h1>
            <p className="text-xl text-white/90">Join thousands of verified sellers in our global marketplace</p>
          </div>

          <Card className="bg-white shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl text-blue-900">Seller Registration</CardTitle>
              <p className="text-slate-600">Complete your profile to start selling premium items</p>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Business Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Store className="h-6 w-6 text-blue-900" />
                  <h3 className="text-xl font-semibold text-slate-900">Business Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business/Store Name</Label>
                    <Input id="businessName" placeholder="Enter your business name" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type</Label>
                    <Select value={businessType} onValueChange={setBusinessType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individual Seller</SelectItem>
                        <SelectItem value="company">Company</SelectItem>
                        <SelectItem value="ngo">NGO/Non-Profit</SelectItem>
                        <SelectItem value="embassy">Embassy/Government</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registrationNumber">Registration Number (Optional)</Label>
                    <Input id="registrationNumber" placeholder="Business registration number" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxId">Tax ID (Optional)</Label>
                    <Input id="taxId" placeholder="Tax identification number" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessDescription">Business Description</Label>
                  <Textarea
                    id="businessDescription"
                    placeholder="Describe your business and what you sell..."
                    rows={4}
                  />
                </div>
              </div>

              {/* Verification Documents */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-6 w-6 text-blue-900" />
                  <h3 className="text-xl font-semibold text-slate-900">Verification Documents</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>ID/Passport</Label>
                    <div className="border-2 border-dashed border-cyan-300 rounded-lg p-6 text-center hover:border-cyan-400 transition-colors cursor-pointer">
                      <Upload className="h-8 w-8 text-cyan-500 mx-auto mb-2" />
                      <p className="text-sm text-slate-600">Upload ID or Passport</p>
                      <p className="text-xs text-slate-500">PNG, JPG up to 5MB</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Business License</Label>
                    <div className="border-2 border-dashed border-cyan-300 rounded-lg p-6 text-center hover:border-cyan-400 transition-colors cursor-pointer">
                      <FileText className="h-8 w-8 text-cyan-500 mx-auto mb-2" />
                      <p className="text-sm text-slate-600">Upload Business License</p>
                      <p className="text-xs text-slate-500">PNG, JPG, PDF up to 5MB</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Proof of Address</Label>
                    <div className="border-2 border-dashed border-cyan-300 rounded-lg p-6 text-center hover:border-cyan-400 transition-colors cursor-pointer">
                      <FileText className="h-8 w-8 text-cyan-500 mx-auto mb-2" />
                      <p className="text-sm text-slate-600">Upload Proof of Address</p>
                      <p className="text-xs text-slate-500">Utility bill, bank statement</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location & Contact */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-6 w-6 text-blue-900" />
                  <h3 className="text-xl font-semibold text-slate-900">Location & Contact</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ae">United Arab Emirates</SelectItem>
                        <SelectItem value="sg">Singapore</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                        <SelectItem value="au">Australia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="Enter your city" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="+971 50 123 4567" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp Number</Label>
                    <div className="flex items-center space-x-2">
                      <Input id="whatsapp" placeholder="+971 50 123 4567" />
                      <div className="flex items-center space-x-2">
                        <Checkbox id="samePhone" />
                        <Label htmlFor="samePhone" className="text-sm">
                          Same as phone
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Store Preferences */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Store className="h-6 w-6 text-blue-900" />
                  <h3 className="text-xl font-semibold text-slate-900">Store Preferences</h3>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="storeName">Store Display Name</Label>
                    <Input id="storeName" placeholder="How your store will appear to buyers" />
                  </div>

                  <div className="space-y-3">
                    <Label>Categories You'll Sell In</Label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <Badge
                          key={category}
                          variant={selectedCategories.includes(category) ? "default" : "outline"}
                          className={`cursor-pointer transition-colors ${
                            selectedCategories.includes(category) ? "bg-cyan-500 hover:bg-cyan-600" : "hover:bg-cyan-50"
                          }`}
                          onClick={() => toggleCategory(category)}
                        >
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Languages You Speak</Label>
                    <div className="flex flex-wrap gap-2">
                      {languages.map((language) => (
                        <Badge
                          key={language}
                          variant={selectedLanguages.includes(language) ? "default" : "outline"}
                          className={`cursor-pointer transition-colors ${
                            selectedLanguages.includes(language)
                              ? "bg-green-500 hover:bg-green-600"
                              : "hover:bg-green-50"
                          }`}
                          onClick={() => toggleLanguage(language)}
                        >
                          {language}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms and Submit */}
              <div className="space-y-6">
                <div className="flex items-start space-x-2">
                  <Checkbox id="sellerTerms" className="mt-1" />
                  <Label htmlFor="sellerTerms" className="text-sm text-slate-600 leading-relaxed">
                    I agree to the Seller Terms of Service, understand the verification process may take 2-5 business
                    days, and commit to maintaining high-quality listings and customer service standards.
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox id="premiumInterest" className="mt-1" />
                  <Label htmlFor="premiumInterest" className="text-sm text-slate-600 leading-relaxed">
                    I'm interested in Premium Seller benefits (priority listing, advanced analytics, dedicated support)
                  </Label>
                </div>

                <Button className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold py-4 text-lg">
                  Submit for Review
                </Button>

                <div className="text-center text-sm text-slate-600">
                  <p>Your application will be reviewed within 2-5 business days.</p>
                  <p>You'll receive an email notification once approved.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
