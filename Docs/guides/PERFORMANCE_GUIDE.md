# Performance Optimization Guide

Comprehensive guide for optimizing the Expat Marketplace frontend for maximum performance and user experience.

## 📋 Table of Contents

- [🚀 Build Performance](#-build-performance)
- [⚡ Runtime Performance](#-runtime-performance)
- [📱 Core Web Vitals](#-core-web-vitals)
- [🎯 Bundle Optimization](#-bundle-optimization)
- [📊 Monitoring & Analytics](#-monitoring--analytics)
- [🔧 Development Tools](#-development-tools)

## 🚀 Build Performance

### Current Optimizations

1. **Next.js 14 App Router**: Leveraging latest performance features
2. **Turbo Mode**: Enabled for faster development builds
3. **Package Import Optimization**: Tree shaking for UI libraries
4. **Code Splitting**: Automatic route-based splitting
5. **Bundle Analysis**: Integrated bundle analyzer

### Build Scripts

```bash
# Development with Turbo (fastest)
npm run dev:turbo

# Standard development
npm run dev

# Production build with analysis
npm run build:analyze

# Production build
npm run build:production

# Clean build artifacts
npm run clean
```

### Webpack Optimizations

Key optimizations in `next.config.mjs`:

```javascript
// Optimized chunk splitting
splitChunks: {
  cacheGroups: {
    vendor: { /* Third-party libraries */ },
    radix: { /* UI components */ },
    lucide: { /* Icons */ },
    common: { /* Shared code */ }
  }
}

// Package optimization
experimental: {
  optimizePackageImports: [
    'lucide-react',
    '@radix-ui/react-*'
  ]
}
```

## ⚡ Runtime Performance

### React Optimizations

#### Server Components (Default)

Most components are server components for optimal performance:

```tsx
// ✅ Server Component (default in app directory)
export default async function ProductPage() {
  const product = await getProduct() // Server-side data fetching
  return <ProductDisplay product={product} />
}
```

#### Client Components (Selective)

Only when interactivity is required:

```tsx
'use client'

// ✅ Client component for interactivity
export const AddToCartButton = ({ productId }) => {
  const [loading, setLoading] = useState(false)
  // Interactive logic here
}
```

#### Component Memoization

```tsx
// ✅ Memoize expensive components
const ProductCard = React.memo(({ product }) => {
  return (
    <Card>
      <CardContent>{product.title}</CardContent>
    </Card>
  )
})

// ✅ Memoize with custom comparison
const UserProfile = React.memo(
  ({ user }) => {
    // Component logic
  },
  (prevProps, nextProps) => {
    return prevProps.user.id === nextProps.user.id
  }
)
```

#### Hook Optimizations

```tsx
// ✅ Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return calculateExpensiveValue(data)
}, [data])

// ✅ Memoize callback functions
const handleSubmit = useCallback(async (formData) => {
  await submitForm(formData)
}, [])

// ✅ Debounce search input
const debouncedSearch = useMemo(() => debounce((query) => setSearchQuery(query), 300), [])
```

### Image Optimization

```tsx
import Image from 'next/image'

// ✅ Optimized image loading
<Image
  src="/product-image.jpg"
  alt="Product description"
  width={300}
  height={200}
  priority={isAboveFold} // For above-fold images
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
  sizes="(max-width: 768px) 100vw, 50vw"
/>

// ✅ Lazy loading for below-fold images
<Image
  src="/product-gallery.jpg"
  alt="Product gallery"
  width={600}
  height={400}
  loading="lazy"
  quality={85}
/>
```

### CSS Optimizations

```css
/* ✅ Hardware acceleration for animations */
.animate-element {
  transform: translateZ(0);
  will-change: transform;
}

/* ✅ Efficient transitions */
.transition-smooth {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ✅ Contain layout for better performance */
.product-grid {
  contain: layout style paint;
}
```

## 📱 Core Web Vitals

### Largest Contentful Paint (LCP)

**Target**: < 2.5 seconds

**Optimizations**:

```tsx
// ✅ Preload critical resources
;<head>
  <link rel="preload" href="/hero-image.jpg" as="image" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
</head>

// ✅ Optimize hero section
const HeroSection = () => (
  <section className="hero">
    <Image src="/hero-image.jpg" alt="Hero" priority fill sizes="100vw" />
  </section>
)
```

### First Input Delay (FID)

**Target**: < 100 milliseconds

**Optimizations**:

```tsx
// ✅ Minimize JavaScript execution time
const [isClient, setIsClient] = useState(false)

useEffect(() => {
  setIsClient(true)
}, [])

// ✅ Use Intersection Observer for lazy loading
const useIntersectionObserver = (callback) => {
  const observer = useMemo(() => new IntersectionObserver(callback), [callback])
  // Observer logic
}
```

### Cumulative Layout Shift (CLS)

**Target**: < 0.1

**Optimizations**:

```tsx
// ✅ Reserve space for images
;<div className="aspect-w-16 aspect-h-9">
  <Image src="/image.jpg" alt="Image" fill className="object-cover" />
</div>

// ✅ Skeleton loaders to prevent layout shifts
const ProductSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-48 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
  </div>
)
```

## 🎯 Bundle Optimization

### Current Bundle Analysis

Run bundle analysis:

```bash
npm run build:analyze
```

### Target Metrics

- **First Load JS**: < 200KB
- **Total Bundle Size**: < 500KB (gzipped)
- **Route-specific bundles**: < 150KB each

### Optimization Strategies

#### Dynamic Imports

```tsx
// ✅ Dynamic import for heavy components
const AdminDashboard = dynamic(() => import('./AdminDashboard'), {
  loading: () => <DashboardSkeleton />,
  ssr: false,
})

// ✅ Dynamic import with named exports
const { HeavyChart } = await import('./HeavyChart')
```

#### Library Optimization

```tsx
// ✅ Import only what you need
import { format } from 'date-fns/format'
import { Button } from '@/components/ui/button'

// ❌ Avoid importing entire libraries
import * as dateFns from 'date-fns' // Avoid
import * as lucideReact from 'lucide-react' // Avoid
```

#### Tree Shaking

```javascript
// next.config.mjs
experimental: {
  optimizePackageImports: [
    'lucide-react',
    '@radix-ui/react-accordion',
    '@radix-ui/react-alert-dialog',
    // ... other packages
  ]
}
```

## 📊 Monitoring & Analytics

### Performance Monitoring

```tsx
// Development performance tracking
import { useRenderTracker } from '@/hooks/use-performance'

export const Component = () => {
  useRenderTracker('ComponentName', process.env.NODE_ENV === 'development')

  return <div>Component content</div>
}
```

### Real User Monitoring (RUM)

```tsx
// lib/analytics.ts
export const trackWebVitals = (metric) => {
  switch (metric.name) {
    case 'CLS':
    case 'FID':
    case 'FCP':
    case 'LCP':
    case 'TTFB':
      // Send to analytics service
      analytics.track('web-vitals', {
        name: metric.name,
        value: metric.value,
        id: metric.id,
      })
      break
  }
}

// app/layout.tsx
export default function RootLayout({ children }) {
  useEffect(() => {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(trackWebVitals)
      getFID(trackWebVitals)
      getFCP(trackWebVitals)
      getLCP(trackWebVitals)
      getTTFB(trackWebVitals)
    })
  }, [])

  return children
}
```

### Performance API

```tsx
// Monitor component performance
const usePerformanceMetrics = (componentName) => {
  useEffect(() => {
    const startTime = performance.now()

    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime

      if (renderTime > 16) {
        // Longer than one frame
        console.warn(`${componentName} took ${renderTime}ms to render`)
      }
    }
  })
}
```

## 🔧 Development Tools

### Performance DevTools

```bash
# Lighthouse CI for automated testing
npm install -g @lhci/cli
lhci autorun

# Bundle analyzer
npm run build:analyze

# React DevTools Profiler
# Enable in development for component profiling
```

### Custom Performance Hooks

```tsx
// hooks/use-performance.ts
export const useRenderTracker = (componentName: string, enabled = false) => {
  const renderCount = useRef(0)
  const startTime = useRef(performance.now())

  useEffect(() => {
    if (!enabled) return

    renderCount.current++
    const endTime = performance.now()
    const renderTime = endTime - startTime.current

    console.log(`${componentName} render #${renderCount.current}: ${renderTime}ms`)
    startTime.current = endTime
  })
}

export const useMemoryMonitor = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      if (performance.memory) {
        const memory = performance.memory
        console.log({
          used: Math.round(memory.usedJSHeapSize / 1048576),
          total: Math.round(memory.totalJSHeapSize / 1048576),
          limit: Math.round(memory.jsHeapSizeLimit / 1048576),
        })
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])
}
```

### Performance Testing

```tsx
// __tests__/performance.test.tsx
import { render } from '@testing-library/react'
import { ProductList } from '../ProductList'

describe('ProductList Performance', () => {
  it('renders large list efficiently', () => {
    const products = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      title: `Product ${i}`,
      price: 100,
    }))

    const startTime = performance.now()
    render(<ProductList products={products} />)
    const endTime = performance.now()

    expect(endTime - startTime).toBeLessThan(100) // Should render in < 100ms
  })
})
```

## Performance Checklist

### Build Optimization

- [ ] Bundle size analyzed and optimized
- [ ] Dynamic imports for heavy components
- [ ] Tree shaking configured
- [ ] Code splitting implemented
- [ ] Image optimization enabled

### Runtime Performance

- [ ] Server components used by default
- [ ] Client components minimized
- [ ] Component memoization applied
- [ ] Hook optimizations implemented
- [ ] Loading states and skeletons added

### Core Web Vitals

- [ ] LCP < 2.5 seconds
- [ ] FID < 100 milliseconds
- [ ] CLS < 0.1
- [ ] Images properly sized and optimized
- [ ] Critical resources preloaded

### Monitoring

- [ ] Performance tracking enabled
- [ ] Real user monitoring implemented
- [ ] Error boundary coverage
- [ ] Lighthouse CI configured
- [ ] Performance budgets set

## Performance Budgets

```json
{
  "budgets": [
    {
      "type": "bundle",
      "name": "main",
      "baseline": "200KB",
      "warning": "250KB",
      "error": "300KB"
    },
    {
      "type": "initial",
      "warning": "500KB",
      "error": "600KB"
    }
  ]
}
```

## Continuous Performance Monitoring

```javascript
// lighthouse.config.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
      },
    },
  },
}
```

---

**Performance Targets:**

- **Lighthouse Score**: 95+ (Performance, Accessibility, SEO)
- **Build Time**: < 45 seconds
- **First Load**: < 2 seconds on 3G
- **Time to Interactive**: < 3 seconds
