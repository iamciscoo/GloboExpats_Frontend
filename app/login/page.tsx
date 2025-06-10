"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Mail, Lock, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!email || !password) {
      setError("Please enter your email and password.")
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.")
      return
    }

    setIsLoading(true)

    // Simulate API call to log in
    // In a real app, you would verify credentials against a database.
    // For this demo, we'll just check for non-empty fields and show success.
    setTimeout(() => {
      setIsLoading(false)

      // Dummy check
      if (email === "user@example.com" && password === "password") {
         // Set login state in localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("isLoggedIn", "true")
          localStorage.setItem(
            "userSession",
            JSON.stringify({
              name: "John Doe", // In a real app, get this from the API
              email: email,
            }),
          )
        }
        setSuccess("Login successful! Redirecting to the homepage...")
        setTimeout(() => {
          window.location.href = "/"
        }, 1500)
      } else {
         // Generic success for any other login for demo purposes
         setSuccess("Login successful! Redirecting to the homepage...")
         setTimeout(() => {
            window.location.href = "/"
          }, 1500)
      }
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary via-blue-800 to-cyan-600 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl border border-white/20">
        <CardHeader className="text-center pb-6 pt-8">
          <Link href="/" className="inline-block mx-auto mb-4">
            <div className="text-3xl lg:text-4xl font-bold font-display text-brand-primary">
              Global<span className="text-brand-secondary">Expat</span>
            </div>
          </Link>
          <CardTitle className="text-2xl lg:text-3xl font-bold text-neutral-800">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-neutral-600 pt-1">
            Sign in to access your account.
          </CardDescription>
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

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-neutral-700 font-semibold">
                Personal Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.personal@email.com"
                  className="pl-11 h-12 text-base border-neutral-300 focus:border-brand-secondary focus:ring-brand-secondary/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-neutral-700 font-semibold">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-11 h-12 text-base border-neutral-300 focus:border-brand-secondary focus:ring-brand-secondary/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-bold"
              disabled={isLoading}
            >
              {isLoading ? "Logging In..." : "Log In"}
            </Button>
          </form>

          <div className="text-center pt-4">
            <p className="text-sm text-neutral-600">
              Don't have an account?{" "}
              <Link href="/register" className="font-semibold text-brand-primary hover:text-brand-secondary hover:underline">
                Register Now
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
