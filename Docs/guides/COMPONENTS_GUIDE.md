# Component Architecture Guide

This guide provides comprehensive documentation for developers working with the Expat Marketplace frontend components.

## 📋 Table of Contents

- [🏗️ Component Architecture](#️-component-architecture)
- [🎨 UI Components](#-ui-components)
- [🔗 Component Integration](#-component-integration)
- [📱 Responsive Design](#-responsive-design)
- [♿ Accessibility](#-accessibility)
- [🧪 Testing Components](#-testing-components)

## 🏗️ Component Architecture

### Component Hierarchy

```
app/
├── layout.tsx                    # Root layout with providers
├── page.tsx                      # Homepage
├── (auth)/                       # Authentication pages group
├── account/                      # User account pages
├── admin/                        # Admin dashboard pages
└── seller/                       # Seller dashboard pages

components/
├── ui/                          # Reusable UI components (Shadcn/ui)
│   ├── button.tsx               # Button component
│   ├── card.tsx                 # Card layouts
│   ├── form.tsx                 # Form components
│   ├── dialog.tsx               # Modal dialogs
│   └── ...
├── header/                      # Header-specific components
│   ├── navigation.tsx           # Main navigation
│   ├── profile-dropdown.tsx     # User profile menu
│   ├── auth-buttons.tsx         # Login/register buttons
│   └── mobile-menu.tsx          # Mobile navigation
├── account/                     # Account management components
├── messages/                    # Messaging system components
├── header.tsx                   # Main header component
├── footer.tsx                   # Main footer component
└── breadcrumb.tsx              # Navigation breadcrumbs
```

### Component Types

1. **Page Components**: Server components by default (in `app/` directory)
2. **Layout Components**: Wrap multiple pages (layouts)
3. **UI Components**: Reusable interface elements
4. **Feature Components**: Business logic components
5. **Provider Components**: Context providers for state management

## 🎨 UI Components

### Button Component

**Location**: `components/ui/button.tsx`

```tsx
import { Button } from '@/components/ui/button'

// Basic usage
<Button>Click me</Button>

// Variants
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon</Button>

// With icons
<Button>
  <Plus className="mr-2 h-4 w-4" />
  Add Item
</Button>

// Loading state
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Please wait
</Button>
```

### Card Component

**Location**: `components/ui/card.tsx`

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

;<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Form Components

**Location**: `components/ui/form.tsx`, `input.tsx`, `label.tsx`

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const LoginForm = () => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Handle form submission
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter your email" {...field} />
              </FormControl>
              <FormDescription>We'll never share your email with anyone else.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Enter your password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Sign In
        </Button>
      </form>
    </Form>
  )
}
```

### Dialog Component

**Location**: `components/ui/dialog.tsx`

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

;<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Open Dialog</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Edit profile</DialogTitle>
      <DialogDescription>
        Make changes to your profile here. Click save when you're done.
      </DialogDescription>
    </DialogHeader>
    <div className="grid gap-4 py-4">{/* Dialog content */}</div>
    <DialogFooter>
      <Button type="submit">Save changes</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## 🔗 Component Integration

### Server vs Client Components

#### Server Components (Default)

Use for:

- Static content
- Data fetching
- SEO-optimized pages
- Components without interactivity

```tsx
// app/listings/page.tsx - Server Component
import { getListings } from '@/lib/api'

export default async function ListingsPage() {
  // Fetch data on the server
  const listings = await getListings()

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Listings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  )
}
```

#### Client Components

Use for:

- Interactive elements
- State management
- Event handlers
- Browser APIs

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export const InteractiveComponent = () => {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>Count: {count}</p>
      <Button onClick={() => setCount(count + 1)}>Increment</Button>
    </div>
  )
}
```

### API Integration in Components

```tsx
'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { ListingItem } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface ListingsGridProps {
  category?: string
  limit?: number
}

export const ListingsGrid = ({ category, limit = 12 }: ListingsGridProps) => {
  const [listings, setListings] = useState<ListingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get('/listings', {
          params: { category, limit },
        })
        setListings(response.data.listings)
      } catch (err) {
        setError('Failed to load listings')
        console.error('Error fetching listings:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [category, limit])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: limit }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-48 w-full mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  )
}
```

### State Management Patterns

#### Using React Context

```tsx
// providers/listing-provider.tsx
'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { ListingItem, FilterOptions } from '@/lib/types'

interface ListingContextType {
  listings: ListingItem[]
  filters: FilterOptions
  loading: boolean
  updateFilters: (filters: Partial<FilterOptions>) => void
  refreshListings: () => Promise<void>
}

const ListingContext = createContext<ListingContextType | undefined>(undefined)

export const ListingProvider = ({ children }: { children: ReactNode }) => {
  const [listings, setListings] = useState<ListingItem[]>([])
  const [filters, setFilters] = useState<FilterOptions>({})
  const [loading, setLoading] = useState(false)

  const updateFilters = (newFilters: Partial<FilterOptions>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const refreshListings = async () => {
    // Fetch logic here
  }

  return (
    <ListingContext.Provider
      value={{
        listings,
        filters,
        loading,
        updateFilters,
        refreshListings,
      }}
    >
      {children}
    </ListingContext.Provider>
  )
}

export const useListings = () => {
  const context = useContext(ListingContext)
  if (!context) {
    throw new Error('useListings must be used within ListingProvider')
  }
  return context
}
```

## 📱 Responsive Design

### Responsive Patterns

```tsx
// Mobile-first responsive design
<div className="
  grid
  grid-cols-1          // 1 column on mobile
  sm:grid-cols-2       // 2 columns on small screens (640px+)
  md:grid-cols-3       // 3 columns on medium screens (768px+)
  lg:grid-cols-4       // 4 columns on large screens (1024px+)
  xl:grid-cols-5       // 5 columns on extra large screens (1280px+)
  gap-4                // Gap between items
">
  {items.map(item => <ItemCard key={item.id} item={item} />)}
</div>

// Responsive typography
<h1 className="
  text-2xl           // 24px on mobile
  sm:text-3xl        // 30px on small screens
  md:text-4xl        // 36px on medium screens
  lg:text-5xl        // 48px on large screens
  font-bold
">
  Responsive Heading
</h1>

// Responsive padding/margins
<div className="
  p-4              // 16px padding on mobile
  sm:p-6           // 24px padding on small screens
  lg:p-8           // 32px padding on large screens
">
  Content
</div>
```

### Mobile Navigation Example

```tsx
'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

export const MobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <div className="flex flex-col space-y-4 mt-8">
          <a href="/browse" className="text-lg font-medium">
            Browse
          </a>
          <a href="/sell" className="text-lg font-medium">
            Sell
          </a>
          <a href="/account" className="text-lg font-medium">
            Account
          </a>
          <a href="/help" className="text-lg font-medium">
            Help
          </a>
        </div>
      </SheetContent>
    </Sheet>
  )
}
```

## ♿ Accessibility

### Accessibility Best Practices

```tsx
// Proper ARIA labels and roles
<Button
  aria-label="Add item to cart"
  aria-describedby="cart-description"
  role="button"
>
  <Plus className="h-4 w-4" />
  <span className="sr-only">Add to cart</span>
</Button>

// Keyboard navigation
<div
  tabIndex={0}
  role="button"
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick()
    }
  }}
  onClick={handleClick}
  className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
>
  Interactive Element
</div>

// Form accessibility
<div>
  <Label htmlFor="email" className="required">
    Email Address
  </Label>
  <Input
    id="email"
    type="email"
    required
    aria-describedby="email-error"
    aria-invalid={!!errors.email}
  />
  {errors.email && (
    <p id="email-error" role="alert" className="text-destructive text-sm mt-1">
      {errors.email.message}
    </p>
  )}
</div>
```

### Screen Reader Support

```tsx
// Loading states
{
  loading && (
    <div role="status" aria-live="polite">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="sr-only">Loading...</span>
    </div>
  )
}

// Status updates
const [status, setStatus] = useState('')

return (
  <div>
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {status}
    </div>
    <Button
      onClick={() => {
        handleSave()
        setStatus('Changes saved successfully')
      }}
    >
      Save
    </Button>
  </div>
)
```

## 🧪 Testing Components

### Unit Testing Example

```tsx
// components/ui/__tests__/button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies variant classes correctly', () => {
    render(<Button variant="destructive">Delete</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-destructive')
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

### Integration Testing

```tsx
// components/__tests__/listings-grid.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { ListingsGrid } from '../listings-grid'

const server = setupServer(
  rest.get('/api/listings', (req, res, ctx) => {
    return res(
      ctx.json({
        data: {
          listings: [
            {
              id: 1,
              title: 'Test Listing',
              price: 100,
              currency: 'USD',
            },
          ],
        },
      })
    )
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('ListingsGrid', () => {
  it('displays listings after loading', async () => {
    render(<ListingsGrid />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Test Listing')).toBeInTheDocument()
    })
  })
})
```

### Component Development Checklist

- [ ] Component follows TypeScript interface patterns
- [ ] Responsive design implemented with Tailwind breakpoints
- [ ] Accessibility attributes added (ARIA labels, roles, etc.)
- [ ] Error states handled gracefully
- [ ] Loading states implemented
- [ ] Unit tests written
- [ ] Props properly typed
- [ ] Default values provided where appropriate
- [ ] Component documented with JSDoc comments
- [ ] Storybook story created (if applicable)

### Best Practices Summary

1. **Composition over Inheritance**: Use composition patterns for flexible components
2. **Props Interface**: Always define TypeScript interfaces for props
3. **Error Boundaries**: Wrap components in error boundaries
4. **Performance**: Use React.memo for expensive components
5. **Accessibility**: Always include proper ARIA attributes
6. **Testing**: Write tests for all interactive components
7. **Documentation**: Document complex components with examples
8. **Consistency**: Follow established patterns in the codebase

---

**For more detailed examples, check:**

- `components/ui/` directory for UI component implementations
- `app/` directory for page component examples
- `__tests__/` directories for testing patterns
