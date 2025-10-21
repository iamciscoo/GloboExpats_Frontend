'use client'

/**
 * SEO Head Component
 * Client-side component for adding structured data to pages
 */

interface SEOHeadProps {
  structuredData?: Record<string, unknown> | Record<string, unknown>[]
}

export function SEOHead({ structuredData }: SEOHeadProps) {
  if (!structuredData) return null

  const data = Array.isArray(structuredData) ? structuredData : [structuredData]

  return (
    <>
      {data.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item),
          }}
        />
      ))}
    </>
  )
}
