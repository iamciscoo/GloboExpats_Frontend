'use client'

import React from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createErrorBoundaryInfo, getErrorMessage, getErrorTitle } from '@/lib/error-handling'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  errorId: string | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  level?: 'page' | 'component' | 'feature'
  name?: string
}

interface ErrorFallbackProps {
  error: Error | null
  errorInfo: React.ErrorInfo | null
  resetError: () => void
  level: 'page' | 'component' | 'feature'
  name?: string
}

// Default error fallback component - reserved for future error handling features
const _DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  resetError,
  level,
  name,
}) => {
  const errorMessage = error ? getErrorMessage(error) : 'An unexpected error occurred'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const errorTitle = error ? getErrorTitle((error as any).type) : 'Something went wrong'

  const handleReportError = () => {
    if (error && errorInfo) {
      const errorDetails = createErrorBoundaryInfo(error, errorInfo)
      console.log('Error report:', errorDetails)
      // In a real app, you would send this to your error reporting service
    }
  }

  const handleRefresh = () => {
    if (level === 'page') {
      window.location.reload()
    } else {
      resetError()
    }
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  if (level === 'component') {
    return (
      <Alert className="my-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {name ? `The ${name} component` : 'This component'} encountered an error.
          <Button variant="link" className="h-auto p-0 ml-1" onClick={resetError}>
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (level === 'feature') {
    return (
      <Card className="mx-auto max-w-md my-8">
        <CardHeader className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
          <CardTitle>Feature Unavailable</CardTitle>
          <CardDescription>
            {name ? `The ${name} feature` : 'This feature'} is temporarily unavailable.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 justify-center">
            <Button onClick={resetError} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={handleGoHome} variant="default" size="sm">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Page level error
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <CardTitle className="text-2xl">{errorTitle}</CardTitle>
          <CardDescription className="text-base">{errorMessage}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {process.env.NODE_ENV === 'development' && error && (
            <Alert variant="destructive">
              <Bug className="h-4 w-4" />
              <AlertDescription className="font-mono text-xs whitespace-pre-wrap">
                {error.stack}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-2">
            <Button onClick={handleRefresh} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Page
            </Button>
            <Button onClick={handleGoHome} variant="outline" className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Go to Homepage
            </Button>
            <Button onClick={handleReportError} variant="ghost" size="sm" className="w-full">
              <Bug className="h-4 w-4 mr-2" />
              Report This Issue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    return {
      hasError: true,
      error,
      errorId,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      errorInfo,
    })

    console.error('Error caught by boundary:', error, errorInfo)
    console.error('🐛 Error Stack:', error.stack)
    console.error('🎯 Component Stack:', errorInfo.componentStack)

    // Check if this is the review object rendering error
    if (error.message.includes('Objects are not valid as a React child')) {
      console.error('🔍 REVIEW OBJECT ERROR DETECTED!')
      console.error(
        '🔍 This error is likely caused by rendering a review object directly instead of its properties'
      )
      console.error(
        '🔍 Look for code that renders objects with keys: reviewId, reviewerName, reviewText, formattedCreatedAt'
      )
    }

    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    })
  }

  render() {
    if (this.state.hasError) {
      const level = this.props.level || 'page'
      const name = this.props.name

      if (level === 'component') {
        return (
          <Alert className="my-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {name ? `The ${name} component` : 'This component'} encountered an error.
              <Button variant="link" className="h-auto p-0 ml-1" onClick={this.resetError}>
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        )
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <Card className="max-w-lg w-full">
            <CardHeader className="text-center">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <CardTitle className="text-2xl">Something went wrong</CardTitle>
              <CardDescription className="text-base">
                An unexpected error occurred. Please try refreshing the page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-2">
                <Button onClick={() => window.location.reload()} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Page
                </Button>
                <Button
                  onClick={() => (window.location.href = '/')}
                  variant="outline"
                  className="w-full"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go to Homepage
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}

// Hook for manually triggering error boundary
export function useErrorHandler() {
  return React.useCallback((error: Error) => {
    // This will trigger the error boundary
    throw error
  }, [])
}

// Component-level error boundary for smaller components
export const ComponentErrorBoundary: React.FC<{
  children: React.ReactNode
  name?: string
}> = ({ children, name }) => (
  <ErrorBoundary level="component" name={name}>
    {children}
  </ErrorBoundary>
)

// Feature-level error boundary for larger features
export const FeatureErrorBoundary: React.FC<{
  children: React.ReactNode
  name?: string
}> = ({ children, name }) => (
  <ErrorBoundary level="feature" name={name}>
    {children}
  </ErrorBoundary>
)
