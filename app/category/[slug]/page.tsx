import { notFound } from 'next/navigation'
import { CATEGORIES } from '@/lib/constants'
import type { Metadata } from 'next'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const category = CATEGORIES.find((c) => c.slug === slug)
  if (!category) return {}
  return {
    title: `${category.name} | Globoexpats`,
    description: `Browse ${category.name} listings on Globoexpats.`,
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const category = CATEGORIES.find((c) => c.slug === slug)
  if (!category) return notFound()

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="container mx-auto px-4">
        <p className="text-neutral-600 mb-8 max-w-2xl">
          Browse items in the {category.name} category. Listings will appear here as soon as sellers
          start posting.
        </p>
        <div className="text-center text-neutral-500 py-20 border-2 border-dashed rounded-lg">
          <p>We&apos;re working on bringing you great deals in this category.</p>
          <p>Check back soon!</p>
        </div>
      </div>
    </div>
  )
}
