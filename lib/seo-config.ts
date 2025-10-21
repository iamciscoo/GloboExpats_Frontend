/**
 * SEO Configuration for Globoexpats
 * Centralized SEO metadata and structured data
 */

export const seoConfig = {
  // Base configuration
  siteName: 'Globoexpats',
  siteUrl: 'https://www.globoexpats.com',
  defaultTitle: 'Globoexpats - Expat Marketplace in Tanzania | Buy & Sell in Dar es Salaam',
  defaultDescription:
    'Globoexpats is the trusted marketplace for expats in Tanzania. Buy and sell quality items in Dar es Salaam, Arusha, and across East Africa. Connect with verified sellers, find authentic products, and join the expat community.',

  // Keywords for different contexts
  keywords: {
    primary: [
      'Globoexpats',
      'GloboExpat',
      'Expat Marketplace',
      'Tanzania Marketplace',
      'Dar es Salaam Shopping',
      'Buy Sell Tanzania',
      'Expat Community Tanzania',
    ],
    secondary: [
      'Expat marketplace Dar es Salaam',
      'Buy sell Tanzania',
      'Expat goods Tanzania',
      'International marketplace East Africa',
      'Verified sellers Tanzania',
      'Expat shopping Arusha',
      'Second hand items Tanzania',
      'Expat community marketplace',
    ],
  },

  // Geographic targeting
  geo: {
    region: 'TZ',
    placename: 'Dar es Salaam, Tanzania',
    position: '-6.7924;39.2083', // Dar es Salaam coordinates
    icbm: '-6.7924, 39.2083',
  },

  // Social media
  social: {
    twitter: '@globoexpats',
    facebook: 'https://facebook.com/globoexpats',
    instagram: 'https://instagram.com/globoexpats',
  },

  // Contact
  contact: {
    email: 'info@globoexpats.com',
    phone: '+255754123456',
    address: '123 Ocean Road, Dar es Salaam, Tanzania',
  },

  // Organization structured data
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Globoexpats',
    alternateName: 'GloboExpat Tanzania',
    url: 'https://www.globoexpats.com',
    logo: 'https://www.globoexpats.com/icon.svg',
    description:
      'Globoexpats is the leading expat marketplace in Tanzania, connecting verified sellers with the international community in Dar es Salaam and across East Africa.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Ocean Road',
      addressLocality: 'Dar es Salaam',
      addressRegion: 'Dar es Salaam',
      postalCode: '11000',
      addressCountry: 'TZ',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '-6.7924',
      longitude: '39.2083',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+255-754-123-456',
      contactType: 'customer service',
      areaServed: ['TZ', 'KE', 'UG', 'RW'],
      availableLanguage: ['English', 'Swahili'],
    },
    sameAs: [
      'https://facebook.com/globoexpats',
      'https://twitter.com/globoexpats',
      'https://instagram.com/globoexpats',
    ],
  },

  // Website structured data
  website: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Globoexpats',
    alternateName: ['GloboExpat', 'Globo Expats Marketplace'],
    url: 'https://www.globoexpats.com',
    description:
      'The trusted expat marketplace in Tanzania. Buy and sell quality items with verified sellers.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.globoexpats.com/browse?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: 'en-US',
    publisher: {
      '@type': 'Organization',
      name: 'Globoexpats',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.globoexpats.com/icon.svg',
      },
    },
  },
}

/**
 * Generate page-specific metadata
 */
export function generatePageMetadata({
  title,
  description,
  path = '',
  keywords = [],
  image = '/og-image.jpg',
  type = 'website',
}: {
  title?: string
  description?: string
  path?: string
  keywords?: string[]
  image?: string
  type?: 'website' | 'article' | 'product'
}) {
  const pageTitle = title ? `${title} | Globoexpats Tanzania` : seoConfig.defaultTitle
  const pageDescription = description || seoConfig.defaultDescription
  const pageUrl = `${seoConfig.siteUrl}${path}`
  const pageImage = image.startsWith('http') ? image : `${seoConfig.siteUrl}${image}`

  const allKeywords = [
    ...seoConfig.keywords.primary,
    ...seoConfig.keywords.secondary,
    ...keywords,
  ].join(', ')

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: allKeywords,
    authors: [{ name: 'Globoexpats Team' }],
    creator: 'Globoexpats',
    publisher: 'Globoexpats',
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type,
      locale: 'en_US',
      url: pageUrl,
      title: pageTitle,
      description: pageDescription,
      siteName: seoConfig.siteName,
      images: [
        {
          url: pageImage,
          width: 1200,
          height: 630,
          alt: title || 'Globoexpats - Expat Marketplace Tanzania',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: seoConfig.social.twitter,
      creator: seoConfig.social.twitter,
      title: pageTitle,
      description: pageDescription,
      images: [pageImage],
    },
    other: {
      'geo.region': seoConfig.geo.region,
      'geo.placename': seoConfig.geo.placename,
      'geo.position': seoConfig.geo.position,
      ICBM: seoConfig.geo.icbm,
    },
  }
}

/**
 * Generate product structured data
 */
export function generateProductStructuredData(product: {
  name: string
  description: string
  image: string
  price: number
  currency: string
  condition?: string
  availability?: string
  seller?: {
    name: string
    rating?: number
  }
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency || 'TZS',
      availability:
        product.availability === 'in_stock'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition: product.condition?.includes('new')
        ? 'https://schema.org/NewCondition'
        : 'https://schema.org/UsedCondition',
      seller: {
        '@type': 'Person',
        name: product.seller?.name || 'Verified Seller',
      },
    },
  }
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${seoConfig.siteUrl}${item.url}`,
    })),
  }
}
