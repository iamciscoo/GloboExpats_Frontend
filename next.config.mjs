import bundleAnalyzer from '@next/bundle-analyzer'

/**
 * =============================================================================
 * NEXT.JS CONFIGURATION - EXPAT MARKETPLACE FRONTEND
 * =============================================================================
 *
 * This configuration optimizes the frontend for performance and provides
 * clear integration points for the backend team.
 *
 * Key Features:
 * - Optimized bundling and code splitting
 * - Backend API integration setup
 * - Static asset optimization
 * - Docker deployment ready
 * - Environment-based configuration
 */

// Resolve optional basePath/assetPrefix (safer defaults)
const resolvedBasePath = process.env.NEXT_BASE_PATH || process.env.BASE_PATH || ''
// Only allow assetPrefix when pointing to an absolute URL (CDN); otherwise leave empty to avoid broken asset URLs in production
const resolvedAssetPrefix = (() => {
  const p = process.env.ASSET_PREFIX
  if (!p) return ''
  try {
    // Absolute URL is OK (e.g., https://cdn.example.com)
    const u = new URL(p)
    if (u.protocol === 'http:' || u.protocol === 'https:') return p.replace(/\/$/, '')
  } catch {}
  // If a subpath is intended (e.g., /frontend), prefer basePath instead of assetPrefix
  return ''
})()

/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * =============================================================================
   * BUILD OPTIMIZATION
   * =============================================================================
   */

  // Optimize package imports for better tree shaking and smaller bundles
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
    ],
    // Optimize CSS imports
    optimizeCss: true,
    // Enable Turbo for faster builds in development
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  /**
   * =============================================================================
   * IMAGE OPTIMIZATION
   * =============================================================================
   */
  images: {
    // Configure allowed remote patterns for external images (Next.js 15+)
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '0.0.0.0' },
      { protocol: 'http', hostname: 'your-backend-domain.com' }, // Replace with actual backend domain
      { protocol: 'http', hostname: '10.123.22.21:3000' }, // Replace with your CDN domain
      { protocol: 'http', hostname: '10.123.22.21' }, // If using Unsplash for placeholder images
    ],
    // Disable optimization in development for faster builds
    unoptimized: process.env.NODE_ENV === 'development',
    // Optimize image formats
    formats: ['image/webp', 'image/avif'],
    // Define image sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  /**
   * =============================================================================
   * BACKEND API INTEGRATION
   * =============================================================================
   *
   * These settings help the backend team understand how to integrate:
   * 1. API routes are proxied to backend
   * 2. Environment variables for different stages
   * 3. CORS and security headers
   */

  // Environment variables accessible to the frontend
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:8000',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws',
    NEXT_PUBLIC_CDN_URL: process.env.NEXT_PUBLIC_CDN_URL || '',
    NEXT_PUBLIC_ENVIRONMENT: process.env.NODE_ENV || 'development',
  },

  // Proxy API requests to backend server
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/:path*`,
      },
    ]
  },

  // SEO-friendly redirects
  async redirects() {
    return [
      {
        source: '/category',
        destination: '/browse',
        permanent: true,
      },
      {
        source: '/support',
        destination: '/help',
        permanent: true,
      },
      {
        source: '/faq',
        destination: '/help',
        permanent: true,
      },
      {
        source: '/orders',
        destination: '/account/orders',
        permanent: true,
      },
    ]
  },

  /**
   * =============================================================================
   * SECURITY & CORS HEADERS
   * =============================================================================
   */
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.ALLOWED_ORIGINS || '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With',
          },
        ],
      },
    ]
  },

  /**
   * =============================================================================
   * WEBPACK OPTIMIZATION
   * =============================================================================
   */
  webpack: (config, { dev, isServer, webpack }) => {
    // Optimize bundle splitting for better caching
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: 10,
              chunks: 'all',
            },
            radix: {
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              name: 'radix',
              priority: 20,
              chunks: 'all',
            },
            lucide: {
              test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
              name: 'icons',
              priority: 20,
              chunks: 'all',
            },
            common: {
              name: 'common',
              minChunks: 2,
              priority: 5,
              chunks: 'all',
              reuseExistingChunk: true,
            },
          },
        },
      }
    }

    // Improve module resolution
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    }

    // Add custom webpack plugins for optimization
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.BUILD_TIME': JSON.stringify(new Date().toISOString()),
      })
    )

    return config
  },

  /**
   * =============================================================================
   * DEPLOYMENT CONFIGURATION
   * =============================================================================
   */

  // Generate standalone build for Docker deployment
  output: 'standalone',

  // Compress static assets
  compress: true,

  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Disable X-Powered-By header for security
  poweredByHeader: false,

  // Ensure proper static file serving
  // - If hosting under a subpath, set NEXT_BASE_PATH or BASE_PATH (e.g., "/frontend").
  // - Only use ASSET_PREFIX for CDN absolute URLs (e.g., "https://cdn.example.com").
  basePath: resolvedBasePath || undefined,
  assetPrefix: resolvedAssetPrefix,

  // Configure static file serving
  trailingSlash: false,

  /**
   * =============================================================================
   * DEVELOPMENT OPTIMIZATIONS
   * =============================================================================
   */

  // Skip type checking and linting during builds for faster CI/CD
  // These should be handled separately in the pipeline
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  /**
   * =============================================================================
   * LOGGING AND MONITORING
   * =============================================================================
   */

  // Enhanced logging for debugging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // Ensure proper headers for static assets
  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*\\.css)',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/css',
          },
        ],
      },
    ]
  },
}

/**
 * =============================================================================
 * BUNDLE ANALYZER (FOR PERFORMANCE MONITORING)
 * =============================================================================
 *
 * Run `ANALYZE=true npm run build` to analyze bundle sizes
 */
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

export default withBundleAnalyzer(nextConfig)
