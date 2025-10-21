import { MetadataRoute } from 'next'

/**
 * Dynamic Sitemap Generation for Globoexpats
 * Generates sitemap.xml for search engines
 * https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.globoexpats.com'

  // Static pages with priorities
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/browse`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/sell`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ]

  // Category pages
  const categories = [
    'automotive',
    'home-furniture',
    'electronics-tech',
    'games-toys',
    'fashion-style',
    'fitness-sports',
    'books-media',
    'arts-crafts',
  ]

  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/browse?category=${category}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  }))

  // Location-based pages for Tanzania
  const locations = ['dar-es-salaam', 'arusha', 'dodoma', 'mwanza', 'zanzibar']

  const locationPages: MetadataRoute.Sitemap = locations.map((location) => ({
    url: `${baseUrl}/browse?location=${location}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.6,
  }))

  return [...staticPages, ...categoryPages, ...locationPages]
}
