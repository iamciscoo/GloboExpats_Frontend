/**
 * Error handling utilities for the Globoexpat application
 */

// Error types for different contexts
export enum ErrorType {
  AUTHENTICATION = 'AUTHENTICATION',
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  PERMISSION = 'PERMISSION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  type: ErrorType
  message: string
  code?: string | number
  details?: unknown
  timestamp: Date
  userMessage?: string
}

export class CustomError extends Error implements AppError {
  public type: ErrorType
  public code?: string | number
  public details?: unknown
  public timestamp: Date
  public userMessage?: string

  constructor(
    type: ErrorType,
    message: string,
    code?: string | number,
    details?: unknown,
    userMessage?: string
  ) {
    super(message)
    this.type = type
    this.code = code
    this.details = details
    this.timestamp = new Date()
    this.userMessage = userMessage
    this.name = 'CustomError'
  }
}

// Error factory functions
export const createAuthError = (message: string, details?: unknown): CustomError =>
  new CustomError(
    ErrorType.AUTHENTICATION,
    message,
    'AUTH_ERROR',
    details,
    'Authentication failed. Please try logging in again.'
  )

export const createNetworkError = (message: string, details?: unknown): CustomError =>
  new CustomError(
    ErrorType.NETWORK,
    message,
    'NETWORK_ERROR',
    details,
    'Network error. Please check your connection and try again.'
  )

export const createValidationError = (message: string, details?: unknown): CustomError =>
  new CustomError(
    ErrorType.VALIDATION,
    message,
    'VALIDATION_ERROR',
    details,
    'Please check your input and try again.'
  )

export const createPermissionError = (message: string, details?: unknown): CustomError =>
  new CustomError(
    ErrorType.PERMISSION,
    message,
    'PERMISSION_ERROR',
    details,
    "You don't have permission to perform this action."
  )

export const createNotFoundError = (message: string, details?: unknown): CustomError =>
  new CustomError(
    ErrorType.NOT_FOUND,
    message,
    'NOT_FOUND_ERROR',
    details,
    'The requested resource was not found.'
  )

export const createServerError = (message: string, details?: unknown): CustomError =>
  new CustomError(
    ErrorType.SERVER,
    message,
    'SERVER_ERROR',
    details,
    'Server error. Please try again later.'
  )

// Error processing utilities
export const processError = (error: unknown): AppError => {
  if (error instanceof CustomError) {
    return error
  }

  if (error instanceof Error) {
    // Handle known error patterns
    if (error.message.includes('fetch')) {
      return createNetworkError(error.message, { originalError: error })
    }

    if (error.message.includes('unauthorized') || error.message.includes('401')) {
      return createAuthError(error.message, { originalError: error })
    }

    if (error.message.includes('forbidden') || error.message.includes('403')) {
      return createPermissionError(error.message, { originalError: error })
    }

    if (error.message.includes('not found') || error.message.includes('404')) {
      return createNotFoundError(error.message, { originalError: error })
    }

    // Generic error
    return new CustomError(
      ErrorType.UNKNOWN,
      error.message,
      'UNKNOWN_ERROR',
      { originalError: error },
      'An unexpected error occurred. Please try again.'
    )
  }

  // Handle non-Error objects
  return new CustomError(
    ErrorType.UNKNOWN,
    String(error),
    'UNKNOWN_ERROR',
    { originalError: error },
    'An unexpected error occurred. Please try again.'
  )
}

// Error logging utility
export const logError = (error: AppError, context?: string): void => {
  const logData = {
    type: error.type,
    message: error.message,
    code: error.code,
    timestamp: error.timestamp,
    context,
    details: error.details,
  }

  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('Application Error:', logData)
  }

  // In production, you might want to send to a logging service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Implement production logging (e.g., Sentry, LogRocket, etc.)
    console.error('Production Error:', logData)
  }
}

// Error display utilities
export const getErrorMessage = (error: AppError | unknown): string => {
  const processedError = error instanceof CustomError ? error : processError(error)
  return processedError.userMessage || processedError.message
}

export const getErrorTitle = (errorType: ErrorType): string => {
  switch (errorType) {
    case ErrorType.AUTHENTICATION:
      return 'Authentication Error'
    case ErrorType.NETWORK:
      return 'Connection Error'
    case ErrorType.VALIDATION:
      return 'Validation Error'
    case ErrorType.PERMISSION:
      return 'Permission Denied'
    case ErrorType.NOT_FOUND:
      return 'Not Found'
    case ErrorType.SERVER:
      return 'Server Error'
    case ErrorType.CLIENT:
      return 'Client Error'
    default:
      return 'Unexpected Error'
  }
}

// Retry utilities
export interface RetryOptions {
  maxRetries: number
  delay: number
  backoff?: boolean
}

export const withRetry = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions = { maxRetries: 3, delay: 1000 }
): Promise<T> => {
  let lastError: unknown

  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      if (attempt === options.maxRetries) {
        break
      }

      // Calculate delay with optional backoff
      const delay = options.backoff ? options.delay * Math.pow(2, attempt) : options.delay

      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw processError(lastError)
}

// Error boundary helpers (for use with React error boundaries)
export const createErrorBoundaryInfo = (
  error: Error,
  errorInfo: { componentStack?: string | null }
) => ({
  error: processError(error),
  componentStack: errorInfo.componentStack,
  timestamp: new Date(),
})
