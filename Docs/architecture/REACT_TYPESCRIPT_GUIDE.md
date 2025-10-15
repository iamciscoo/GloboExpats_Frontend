# React & TypeScript Architecture Guide

## Overview

This document explains the React and TypeScript patterns, architecture decisions, and best practices used in the GlobalExpat Marketplace frontend application. It serves as a comprehensive guide for understanding how the components, hooks, and providers work together.

## Table of Contents

1. [Project Structure](#project-structure)
2. [TypeScript Patterns](#typescript-patterns)
3. [React Architecture](#react-architecture)
4. [State Management](#state-management)
5. [Component Patterns](#component-patterns)
6. [Custom Hooks](#custom-hooks)
7. [Performance Optimization](#performance-optimization)
8. [Error Handling](#error-handling)
9. [Testing Patterns](#testing-patterns)
10. [Best Practices](#best-practices)

## Project Structure

### Next.js 14 App Router Architecture

```
app/
├── layout.tsx              # Root layout with providers
├── page.tsx               # Homepage component
├── login/
│   └── page.tsx          # Authentication pages
├── account/
│   ├── page.tsx          # Account dashboard
│   └── settings/
│       └── page.tsx      # Nested routes
└── globals.css           # Global styles

components/
├── ui/                   # Reusable UI components
│   ├── button.tsx
│   ├── card.tsx
│   └── ...
├── header.tsx           # Application header
├── footer.tsx           # Application footer
└── ...

hooks/                   # Custom React hooks
├── use-auth.ts         # Authentication logic
├── use-cart.ts         # Shopping cart logic
└── ...

providers/              # React Context providers
├── auth-provider.tsx   # Authentication state
├── cart-provider.tsx   # Shopping cart state
└── ...

lib/                    # Utility functions and types
├── types.ts           # TypeScript type definitions
├── api.ts             # API client functions
├── utils.ts           # Helper utilities
└── constants.ts       # Application constants
```

### File Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`)
- **Pages**: lowercase with hyphens (`user-profile/page.tsx`)
- **Hooks**: camelCase with "use" prefix (`useUserProfile.ts`)
- **Utilities**: camelCase (`validateEmail.ts`)
- **Types**: PascalCase interfaces/types in `types.ts`

## TypeScript Patterns

### Interface Definitions

We use interfaces for defining component props and data structures:

```typescript
// ✅ Good: Clear interface with documentation
interface UserProfileProps {
  /** User object containing profile information */
  user: User
  /** Whether the profile is in edit mode */
  isEditing?: boolean
  /** Callback when profile is updated */
  onUpdate?: (user: User) => void
}

// ✅ Good: Extending base interfaces
interface AdminUser extends User {
  permissions: Permission[]
  lastLogin: Date
}
```

### Type Guards

Type guards ensure type safety at runtime:

```typescript
// Type guard for user authentication
export const isAuthenticatedUser = (user: any): user is User => {
  return (
    user &&
    typeof user.id === 'string' &&
    typeof user.email === 'string' &&
    typeof user.name === 'string' &&
    user.email.length > 0
  )
}

// Usage in components
if (isAuthenticatedUser(user)) {
  // TypeScript knows user is of type User here
  console.log(user.email)
}
```

### Generic Types

We use generics for reusable components and functions:

```typescript
// Generic API response type
interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

// Generic hook for API calls
function useApiData<T>(endpoint: string): ApiResponse<T> {
  // Implementation
}
```

### Utility Types

Leveraging TypeScript's utility types for flexibility:

```typescript
// Creating types from existing interfaces
type CreateUserData = Omit<User, 'id' | 'createdAt'>
type UserUpdateData = Partial<Pick<User, 'name' | 'email' | 'avatar'>>

// Usage in functions
const createUser = (userData: CreateUserData): Promise<User> => {
  // Implementation
}
```

## React Architecture

### Component Hierarchy

```
App Layout (layout.tsx)
├── AuthProvider
│   ├── CartProvider
│   │   ├── Header
│   │   │   ├── Logo
│   │   │   ├── Navigation
│   │   │   ├── SearchBar
│   │   │   └── UserActions
│   │   ├── Main Content (pages)
│   │   └── Footer
│   └── Toaster (notifications)
└── Error Boundaries
```

### Server vs Client Components

#### Server Components (Default)

```typescript
// app/products/page.tsx
// ✅ Server component - runs on server, can access backend directly
async function ProductsPage() {
  const products = await fetch('http://localhost:8000/api/products')

  return (
    <div>
      <h1>Products</h1>
      <ProductList products={products} />
    </div>
  )
}
```

#### Client Components

```typescript
// components/search-bar.tsx
'use client' // ✅ Client directive for interactivity

import { useState } from 'react'

export function SearchBar() {
  const [query, setQuery] = useState('')

  const handleSearch = (e: FormEvent) => {
    // Interactive logic runs in browser
  }

  return (
    <form onSubmit={handleSearch}>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
      />
    </form>
  )
}
```

## State Management

### Context Pattern

We use React Context for global state management:

```typescript
// providers/auth-provider.tsx
interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  login: (userData: Partial<User>) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoggedIn: false,
    isLoading: true,
    error: null,
  })

  // Memoized context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    ...authState,
    login,
    logout,
  }), [authState, login, logout])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
```

### Local State Management

For component-specific state, we use `useState` and `useReducer`:

```typescript
// Simple state
const [isLoading, setIsLoading] = useState(false)

// Complex state with useReducer
type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' }

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'ADD_ITEM':
      return [...state, action.payload]
    case 'REMOVE_ITEM':
      return state.filter((item) => item.id !== action.payload)
    case 'CLEAR_CART':
      return []
    default:
      return state
  }
}

const [cartItems, dispatch] = useReducer(cartReducer, [])
```

## Component Patterns

### Compound Components

```typescript
// Card compound component pattern
interface CardProps {
  children: ReactNode
  className?: string
}

function Card({ children, className }: CardProps) {
  return (
    <div className={cn('border rounded-lg', className)}>
      {children}
    </div>
  )
}

function CardHeader({ children }: { children: ReactNode }) {
  return <div className="p-4 border-b">{children}</div>
}

function CardContent({ children }: { children: ReactNode }) {
  return <div className="p-4">{children}</div>
}

// Export as compound component
Card.Header = CardHeader
Card.Content = CardContent

export { Card }

// Usage
<Card>
  <Card.Header>
    <h2>Product Details</h2>
  </Card.Header>
  <Card.Content>
    <p>Product description here...</p>
  </Card.Content>
</Card>
```

### Render Props Pattern

```typescript
interface DataFetcherProps<T> {
  url: string
  children: (data: T | null, loading: boolean, error: string | null) => ReactNode
}

function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData(url).then(setData).catch(setError).finally(() => setLoading(false))
  }, [url])

  return <>{children(data, loading, error)}</>
}

// Usage
<DataFetcher<Product[]> url="/api/products">
  {(products, loading, error) => {
    if (loading) return <Spinner />
    if (error) return <ErrorMessage error={error} />
    return <ProductList products={products} />
  }}
</DataFetcher>
```

### Higher-Order Components (HOCs)

```typescript
// HOC for authentication requirement
function withAuth<P extends object>(Component: ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isLoggedIn, user } = useAuth()

    if (!isLoggedIn) {
      return <LoginPrompt />
    }

    return <Component {...props} user={user} />
  }
}

// Usage
const ProtectedProfile = withAuth(UserProfile)
```

## Custom Hooks

### Data Fetching Hook

```typescript
interface UseApiOptions {
  enabled?: boolean
  refetchInterval?: number
}

function useApi<T>(
  endpoint: string,
  options: UseApiOptions = {}
): {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
} {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get<T>(endpoint)
      setData(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  useEffect(() => {
    if (options.enabled !== false) {
      fetchData()
    }
  }, [fetchData, options.enabled])

  // Polling
  useEffect(() => {
    if (options.refetchInterval) {
      const interval = setInterval(fetchData, options.refetchInterval)
      return () => clearInterval(interval)
    }
  }, [fetchData, options.refetchInterval])

  return { data, loading, error, refetch: fetchData }
}
```

### Form Management Hook

```typescript
interface UseFormOptions<T> {
  initialValues: T
  validate?: (values: T) => Partial<Record<keyof T, string>>
  onSubmit: (values: T) => Promise<void> | void
}

function useForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (name: keyof T) => (value: T[keyof T]) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // Validation
    if (validate) {
      const validationErrors = validate(values)
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors)
        return
      }
    }

    try {
      setIsSubmitting(true)
      await onSubmit(values)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setValues,
    setErrors,
  }
}
```

## Performance Optimization

### Memoization

```typescript
// ✅ Memoize expensive calculations
const expensiveCalculation = useMemo(() => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0)
}, [items])

// ✅ Memoize callbacks to prevent child re-renders
const handleItemClick = useCallback((itemId: string) => {
  onItemSelect(itemId)
}, [onItemSelect])

// ✅ Memoize components
const ProductCard = memo(({ product, onSelect }: ProductCardProps) => {
  return (
    <div onClick={() => onSelect(product.id)}>
      {product.title}
    </div>
  )
})
```

### Code Splitting

```typescript
// ✅ Lazy load components
const AdminDashboard = lazy(() => import('./AdminDashboard'))
const UserProfile = lazy(() => import('./UserProfile'))

// ✅ Use Suspense for loading states
<Suspense fallback={<LoadingSpinner />}>
  <AdminDashboard />
</Suspense>
```

### Virtual Scrolling for Large Lists

```typescript
// Using react-window for large datasets
import { FixedSizeList as List } from 'react-window'

const ProductList = ({ products }: { products: Product[] }) => (
  <List
    height={600}
    itemCount={products.length}
    itemSize={120}
    itemData={products}
  >
    {({ index, style, data }) => (
      <div style={style}>
        <ProductCard product={data[index]} />
      </div>
    )}
  </List>
)
```

## Error Handling

### Error Boundaries

```typescript
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ComponentType<{ error: Error }> },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo)
    // Send to error reporting service
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error!} />
    }

    return this.props.children
  }
}
```

### Error Hook

```typescript
function useErrorHandler() {
  const [error, setError] = useState<string | null>(null)

  const handleError = useCallback((error: unknown) => {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred'
    setError(message)
    console.error('Error caught by error handler:', error)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return { error, handleError, clearError }
}
```

## Testing Patterns

### Component Testing

```typescript
// __tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../Button'

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies correct variant styles', () => {
    render(<Button variant="destructive">Delete</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-destructive')
  })
})
```

### Hook Testing

```typescript
// __tests__/useAuth.test.ts
import { renderHook, act } from '@testing-library/react'
import { useAuth } from '../useAuth'
import { AuthProvider } from '../AuthProvider'

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

describe('useAuth Hook', () => {
  it('should login user successfully', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.login({
        email: 'test@example.com',
        name: 'Test User'
      })
    })

    expect(result.current.isLoggedIn).toBe(true)
    expect(result.current.user?.email).toBe('test@example.com')
  })
})
```

## Best Practices

### Component Design

```typescript
// ✅ Do: Single Responsibility Principle
function UserAvatar({ user, size = 'md' }: UserAvatarProps) {
  return (
    <img
      src={user.avatar || '/default-avatar.png'}
      alt={`${user.name}'s avatar`}
      className={cn('rounded-full', sizeClasses[size])}
    />
  )
}

// ❌ Don't: Too many responsibilities
function UserCard({ user }: UserCardProps) {
  // Handles avatar, contact info, actions, etc.
  // Should be split into smaller components
}
```

### Props Design

```typescript
// ✅ Do: Clear, specific prop types
interface ProductCardProps {
  product: Product
  isSelected?: boolean
  onSelect?: (productId: string) => void
  showActions?: boolean
  variant?: 'compact' | 'detailed'
}

// ❌ Don't: Generic or unclear props
interface ProductCardProps {
  data: any
  config: object
  handlers: Record<string, Function>
}
```

### State Management

```typescript
// ✅ Do: Keep state as close to where it's used as possible
function ProductFilter() {
  const [filters, setFilters] = useState<FilterState>({})
  // Filter state only used in this component
}

// ✅ Do: Use global state for truly global data
function App() {
  return (
    <AuthProvider> {/* Global user state */}
      <CartProvider> {/* Global cart state */}
        <Routes />
      </CartProvider>
    </AuthProvider>
  )
}
```

### Type Safety

```typescript
// ✅ Do: Use strict TypeScript settings
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}

// ✅ Do: Use branded types for IDs
type UserId = string & { readonly brand: unique symbol }
type ProductId = string & { readonly brand: unique symbol }

// ✅ Do: Use const assertions for literal types
const themes = ['light', 'dark'] as const
type Theme = typeof themes[number] // 'light' | 'dark'
```

## Conclusion

This React and TypeScript architecture provides:

1. **Type Safety**: Comprehensive TypeScript usage prevents runtime errors
2. **Scalability**: Clear patterns for component composition and state management
3. **Performance**: Optimization strategies for large applications
4. **Maintainability**: Consistent patterns and clear separation of concerns
5. **Developer Experience**: Rich tooling support and clear error messages

By following these patterns and practices, the GlobalExpat Marketplace maintains high code quality while remaining flexible for future enhancements.
