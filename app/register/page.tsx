"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    personalEmail: "",
    password: "",
    confirmPassword: "",
    organizationEmail: "",
    organization: "",
    position: "",
    location: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validation
    const { firstName, lastName, personalEmail, password, confirmPassword, location } = formData
    if (!firstName || !lastName || !personalEmail || !password || !confirmPassword || !location) {
      setError("Please fill in all required fields.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalEmail)) {
      setError("Please enter a valid personal email address.")
      return
    }
    
    if (formData.organizationEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.organizationEmail)) {
      setError("Please enter a valid organization email address.")
      return
    }

    setIsLoading(true)

    // Simulate API call for registration
    console.log("Submitting registration data:", {
      firstName: formData.firstName,
      lastName: formData.lastName,
      personalEmail: formData.personalEmail,
      organization: formData.organization,
      organizationEmail: formData.organizationEmail,
      position: formData.position,
      location: formData.location,
    })

    setTimeout(() => {
      setIsLoading(false)
      setSuccess("Account created successfully! You are now logged in.")
      // In a real app, you'd handle the session/token here.
      // For demo purposes, we'll set it in localStorage.
      if (typeof window !== "undefined") {
        localStorage.setItem("isLoggedIn", "true")
        localStorage.setItem(
          "userSession",
          JSON.stringify({
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.personalEmail,
          }),
        )
      }
      
      // and then redirect.
      setTimeout(() => {
        // Redirect to home page after successful login
        window.location.href = "/"
      }, 2000)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary via-blue-800 to-cyan-600 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-2xl bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl border border-white/20">
        <CardHeader className="text-center pb-6 pt-8">
          <Link href="/" className="inline-block mx-auto mb-4">
            <div className="text-3xl lg:text-4xl font-bold font-display text-brand-primary">
              Global<span className="text-brand-secondary">Expat</span>
            </div>
          </Link>
          <CardTitle className="text-2xl lg:text-3xl font-bold text-neutral-800">Create Your Expat Account</CardTitle>
          <p className="text-neutral-600 pt-1">Join our global community of professionals.</p>
        </CardHeader>

        <CardContent className="px-6 sm:px-8 pb-8 space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50/80 text-green-900 border-green-200/80">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-neutral-700 font-semibold">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  placeholder="Enter your first name"
                  className="h-11 border-neutral-300 focus:border-brand-secondary focus:ring-brand-secondary/50"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-neutral-700 font-semibold">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  placeholder="Enter your last name"
                  className="h-11 border-neutral-300 focus:border-brand-secondary focus:ring-brand-secondary/50"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="personalEmail" className="text-neutral-700 font-semibold">
                  Personal Email Address (for login)
                </Label>
                <Input
                  id="personalEmail"
                  type="email"
                  placeholder="your.personal@email.com"
                  className="h-11 border-neutral-300 focus:border-brand-secondary focus:ring-brand-secondary/50"
                  value={formData.personalEmail}
                  onChange={(e) => setFormData({ ...formData, personalEmail: e.target.value })}
                  disabled={isLoading}
                  required
                />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="password"
                  className="text-neutral-700 font-semibold"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter a secure password"
                  className="h-11 border-neutral-300 focus:border-brand-secondary focus:ring-brand-secondary/50"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-neutral-700 font-semibold"
                >
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  className="h-11 border-neutral-300 focus:border-brand-secondary focus:ring-brand-secondary/50"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-neutral-200/80">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-neutral-800">Organization Details (Optional)</h3>
                <p className="text-sm text-neutral-600">
                  This will be used for verification to unlock all platform features.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="organizationEmail" className="text-neutral-700 font-semibold flex items-center gap-2">
                  Organization Email Address
                </Label>
                <Input
                  id="organizationEmail"
                  type="email"
                  placeholder="name@organization.com"
                  className="h-11 border-neutral-300 focus:border-brand-secondary focus:ring-brand-secondary/50"
                  value={formData.organizationEmail}
                  onChange={(e) => setFormData({ ...formData, organizationEmail: e.target.value })}
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="organization" className="text-neutral-700 font-semibold flex items-center gap-2">
                    Organization/Agency
                    <Badge className="bg-gray-100 text-gray-800 text-xs py-1 px-2 rounded-full font-medium">
                      Optional
                    </Badge>
                  </Label>
                  <Input
                    id="organization"
                    placeholder="e.g., United Nations"
                    className="h-11 border-neutral-300 focus:border-brand-secondary focus:ring-brand-secondary/50"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position" className="text-neutral-700 font-semibold">
                    Position/Title
                  </Label>
                  <Input
                    id="position"
                    placeholder="e.g., Program Officer"
                    className="h-11 border-neutral-300 focus:border-brand-secondary focus:ring-brand-secondary/50"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-neutral-700 font-semibold">
                Location
              </Label>
              <Select
                value={formData.location}
                onValueChange={(value) => setFormData({ ...formData, location: value })}
                disabled={isLoading}
                required
              >
                <SelectTrigger className="h-11 border-neutral-300 focus:border-brand-secondary focus:ring-brand-secondary/50">
                  <SelectValue placeholder="Select your current location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dar">Dar es Salaam</SelectItem>
                  <SelectItem value="arusha">Arusha</SelectItem>
                  <SelectItem value="mwanza">Mwanza</SelectItem>
                  <SelectItem value="zanzibar">Zanzibar</SelectItem>
                  <SelectItem value="dodoma">Dodoma</SelectItem>
                  <SelectItem value="moru">Morogoro</SelectItem>
                  <SelectItem value="tanga">Tanga</SelectItem>
                  <SelectItem value="kenya">Kenya</SelectItem>
                  <SelectItem value="uganda">Uganda</SelectItem>
                  <SelectItem value="rwanda">Rwanda</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full h-12 text-base font-bold" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </div>
          </form>

          <div className="text-center pt-4">
            <p className="text-sm text-neutral-600">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-brand-primary hover:text-brand-secondary hover:underline">
                Log In
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
