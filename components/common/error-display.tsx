/**
 * =============================================================================
 * ErrorDisplay - Reusable Error State Components
 * =============================================================================
 *
 * Centralized error display components to maintain consistency across
 * the application and provide better user experience.
 */

import { AlertTriangle, RefreshCw, Home, Bug, Wifi, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ErrorType, type AppError } from '@/lib/error-handling'

interface ErrorDisplayProps {
  error: AppError | Error | string
  title?: string
  showRetry?: boolean
  showHome?: boolean
  showReport?: boolean
  onRetry?: () => void
  onGoHome?: () => void
  onReport?: () => void
  className?: string
  variant?: 'alert' | 'card' | 'page'
}

/**
 * Get appropriate icon for error type
 */
function getErrorIcon(errorType?: ErrorType) {
  switch (errorType) {
    case ErrorType.NETWORK:
      return Wifi
    case ErrorType.AUTHENTICATION:
    case ErrorType.PERMISSION:
      return ShieldAlert
    default:
      return AlertTriangle
  }
}

/**
 * Get user-friendly error title
 */
function getErrorTitle(error: AppError | Error | string): string {
  if (typeof error === 'string') return 'Error'
  if ('type' in error) {
    switch (error.type) {
      case ErrorType.NETWORK:
        return 'Connection Error'
      case ErrorType.AUTHENTICATION:
        return 'Authentication Required'
      case ErrorType.PERMISSION:
        return 'Access Denied'
      case ErrorType.NOT_FOUND:
        return 'Not Found'
      case ErrorType.VALIDATION:
        return 'Invalid Input'
      case ErrorType.SERVER:
        return 'Server Error'
      default:
        return 'Something went wrong'
    }
  }
  return 'Unexpected Error'
}

/**
 * Get user-friendly error message
 */
function getErrorMessage(error: AppError | Error | string): string {
  if (typeof error === 'string') return error
  if ('userMessage' in error && error.userMessage) return error.userMessage
  if ('message' in error) return error.message
  return 'An unexpected error occurred. Please try again.'
}

/**
 * Get error type from error object
 */
function getErrorType(error: AppError | Error | string): ErrorType | undefined {
  if (typeof error === 'object' && 'type' in error) {
    return error.type
  }
  return undefined
}

/**
 * Alert variant for inline error display
 */
export function ErrorAlert({
  error,
  title,
  showRetry = false,
  onRetry,
  className,
}: Pick<ErrorDisplayProps, 'error' | 'title' | 'showRetry' | 'onRetry' | 'className'>) {
  const errorType = getErrorType(error)
  const Icon = getErrorIcon(errorType)

  return (
    <Alert variant="destructive" className={className}>
      <Icon className="h-4 w-4" />
      <AlertTitle>{title || getErrorTitle(error)}</AlertTitle>
      <AlertDescription className="mt-2">
        {getErrorMessage(error)}
        {showRetry && onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="mt-3">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}

/**
 * Card variant for section error display
 */
export function ErrorCard({
  error,
  title,
  showRetry = true,
  showReport = false,
  onRetry,
  onReport,
  className,
}: Pick<
  ErrorDisplayProps,
  'error' | 'title' | 'showRetry' | 'showReport' | 'onRetry' | 'onReport' | 'className'
>) {
  const errorType = getErrorType(error)
  const Icon = getErrorIcon(errorType)

  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <Icon className="h-6 w-6 text-red-600" />
        </div>
        <CardTitle className="text-red-900">{title || getErrorTitle(error)}</CardTitle>
        <CardDescription className="text-red-700">{getErrorMessage(error)}</CardDescription>
      </CardHeader>
      {(showRetry || showReport) && (
        <CardContent className="flex gap-2 justify-center">
          {showRetry && onRetry && (
            <Button variant="outline" onClick={onRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
          {showReport && onReport && (
            <Button variant="ghost" onClick={onReport}>
              <Bug className="h-4 w-4 mr-2" />
              Report Issue
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  )
}

/**
 * Full page error display
 */
export function ErrorPage({
  error,
  title,
  showRetry = true,
  showHome = true,
  showReport = false,
  onRetry,
  onGoHome,
  onReport,
  className,
}: ErrorDisplayProps) {
  const errorType = getErrorType(error)
  const Icon = getErrorIcon(errorType)

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome()
    } else {
      window.location.href = '/'
    }
  }

  return (
    <div className={`min-h-screen bg-neutral-50 flex items-center justify-center p-4 ${className}`}>
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <Icon className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-900">{title || getErrorTitle(error)}</CardTitle>
          <CardDescription className="text-red-700 text-base">
            {getErrorMessage(error)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {showRetry && onRetry && (
            <Button className="w-full" onClick={onRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
          {showHome && (
            <Button variant="outline" className="w-full" onClick={handleGoHome}>
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          )}
          {showReport && onReport && (
            <Button variant="ghost" className="w-full" onClick={onReport}>
              <Bug className="h-4 w-4 mr-2" />
              Report This Issue
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Main ErrorDisplay component that renders different variants
 */
export function ErrorDisplay({ variant = 'alert', ...props }: ErrorDisplayProps) {
  switch (variant) {
    case 'card':
      return <ErrorCard {...props} />
    case 'page':
      return <ErrorPage {...props} />
    default:
      return <ErrorAlert {...props} />
  }
}

/**
 * Network error specific component
 */
export function NetworkErrorDisplay({
  onRetry,
  className,
}: {
  onRetry?: () => void
  className?: string
}) {
  return (
    <ErrorAlert
      error="Unable to connect to the server. Please check your internet connection."
      title="Connection Problem"
      showRetry={!!onRetry}
      onRetry={onRetry}
      className={className}
    />
  )
}

/**
 * Permission error specific component
 */
export function PermissionErrorDisplay({
  message = "You don't have permission to access this resource.",
  className,
}: {
  message?: string
  onGoHome?: () => void
  className?: string
}) {
  return (
    <ErrorCard
      error={message}
      title="Access Denied"
      showRetry={false}
      showReport={false}
      className={className}
    />
  )
}

/**
 * Not found error specific component
 */
export function NotFoundErrorDisplay({
  resource = 'page',
  onGoHome,
  className,
}: {
  resource?: string
  onGoHome?: () => void
  className?: string
}) {
  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome()
    } else {
      window.location.href = '/'
    }
  }

  return (
    <ErrorPage
      error={`The ${resource} you're looking for could not be found.`}
      title="Not Found"
      showRetry={false}
      showHome={true}
      onGoHome={handleGoHome}
      className={className}
    />
  )
}

/**
 * Verification required error component
 */
export function VerificationRequiredDisplay({
  message = 'Please verify your email to access this feature.',
  onVerify,
  className,
}: {
  message?: string
  onVerify?: () => void
  className?: string
}) {
  const handleVerify = () => {
    if (onVerify) {
      onVerify()
    } else {
      window.location.href = '/account/verification'
    }
  }

  return (
    <Alert className={`border-amber-200 bg-amber-50 ${className}`}>
      <ShieldAlert className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-900">Verification Required</AlertTitle>
      <AlertDescription className="mt-2 text-amber-800">
        {message}
        <div className="mt-3">
          <Button onClick={handleVerify} className="bg-amber-600 hover:bg-amber-700 text-white">
            Verify Now
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
