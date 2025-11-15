'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Tag } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { CATEGORIES } from '@/lib/constants'
import { apiClient } from '@/lib/api'

interface SearchBarProps {
  autoExpand?: boolean
  onClose?: () => void
}

export default function SearchBar({ autoExpand = false, onClose }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isExpanded, setIsExpanded] = useState(autoExpand)
  const [products, setProducts] = useState<Record<string, unknown>[]>([])
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch products from backend for search suggestions
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // ...existing code...
        const response = await apiClient.getAllProductsComplete(10) // Fetch up to 10 pages
        // Access content directly from complete response
        const productsData = response.content
        setProducts(productsData as Record<string, unknown>[])
        // ...existing code...
      } catch (error) {
        console.error('🚨 SearchBar: Failed to fetch products:', error)
        setProducts([]) // NO FALLBACK TO DUMMY DATA
      }
    }
    fetchProducts()
  }, [])

  type Suggestion = {
    id: string
    label: string
    type: 'category' | 'product'
    href: string
  }

  const [activeIndex, setActiveIndex] = useState<number>(-1)

  const suggestions = useMemo<Suggestion[]>(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return []

    const categoryMatches: Suggestion[] = CATEGORIES.filter((c) => c.name.toLowerCase().includes(q))
      .slice(0, 3)
      .map((c) => ({
        id: `cat-${c.slug}`,
        label: `In ${c.name}`,
        type: 'category' as const,
        href: `/browse?category=${c.slug}${searchQuery.trim() ? `&q=${encodeURIComponent(searchQuery.trim())}` : ''}`,
      }))

    const uniqueProductsMap = new Map<string, Record<string, unknown>>()
    for (const p of products) {
      const productTitle = String(p.productName || p.title || '')
      if (
        productTitle.toLowerCase().includes(q) &&
        !uniqueProductsMap.has(productTitle.toLowerCase())
      ) {
        uniqueProductsMap.set(productTitle.toLowerCase(), p)
      }
      if (uniqueProductsMap.size >= 5) break
    }
    const productMatches: Suggestion[] = Array.from(uniqueProductsMap.values()).map((p) => ({
      id: `prod-${p.productId || p.id}`,
      label: String(p.productName || p.title || 'Unknown Product'),
      type: 'product' as const,
      href: `/browse?q=${encodeURIComponent(String(p.productName || p.title || ''))}`,
    }))

    return [...categoryMatches, ...productMatches].slice(0, 8)
  }, [searchQuery, products])

  const navigateTo = (href: string) => {
    router.push(href)
    setIsExpanded(false)
    setSearchQuery('')
    setActiveIndex(-1)
    if (onClose) {
      onClose()
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/browse?q=${encodeURIComponent(searchQuery.trim())}`)
      setIsExpanded(false)
      setSearchQuery('')
      setActiveIndex(-1)
      if (onClose) {
        onClose()
      }
    }
  }

  const handleIconClick = () => {
    setIsExpanded(true)
  }

  const handleClose = () => {
    setIsExpanded(false)
    setSearchQuery('')
    setActiveIndex(-1)
    if (onClose) {
      onClose()
    }
  }

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isExpanded])

  // Handle click outside to close (only when not auto-expanded in mobile sheet)
  useEffect(() => {
    // Don't attach click-outside handler if auto-expanded (mobile sheet handles closing)
    if (autoExpand) return

    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.closest('form')?.contains(event.target as Node)) {
        setIsExpanded(false)
        setSearchQuery('')
        setActiveIndex(-1)
      }
    }

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isExpanded, autoExpand])

  // Keyboard shortcuts to open/close search (only when not auto-expanded)
  useEffect(() => {
    // Don't attach keyboard shortcuts if auto-expanded (mobile sheet handles its own)
    if (autoExpand) return

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const isEditable =
        !!target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)

      // Open search with '/' or Ctrl/Cmd+K when not typing in an input
      if (!isEditable) {
        const isSlash = e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey
        const isKShortcut = (e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)
        if (isSlash || isKShortcut) {
          e.preventDefault()
          setIsExpanded(true)
        }
      }

      // Close with Escape when expanded
      if (e.key === 'Escape' && isExpanded) {
        e.preventDefault()
        setIsExpanded(false)
        setSearchQuery('')
        setActiveIndex(-1)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isExpanded, autoExpand])

  if (!isExpanded) {
    return (
      <Button
        type="button"
        size="icon"
        onClick={handleIconClick}
        className="h-8 w-8 bg-transparent hover:bg-white/10 text-white rounded-full transition-colors"
        aria-label="Open search"
        aria-expanded={false}
        title="Press / or Ctrl+K to search"
      >
        <Search className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <form
      onSubmit={handleSearch}
      className="relative w-full md:w-auto"
      role="search"
      aria-label="Search products"
    >
      <Label htmlFor="search-input" className="sr-only">
        Search for products in the global marketplace
      </Label>
      <div className="relative flex items-center">
        <Input
          ref={inputRef}
          id="search-input"
          type="text"
          placeholder="Search global marketplace..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setActiveIndex(-1)
          }}
          className="w-full sm:w-96 h-10 sm:h-9 pl-4 pr-4 bg-white border-slate-300 rounded-full text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-neutral-900 placeholder-neutral-500"
          autoComplete="off"
          role="combobox"
          aria-expanded={suggestions.length > 0}
          aria-controls="search-suggestions"
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-activedescendant={
            activeIndex >= 0 && suggestions[activeIndex]
              ? `suggestion-${suggestions[activeIndex].id}`
              : undefined
          }
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setActiveIndex((prev) => (suggestions.length ? (prev + 1) % suggestions.length : -1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActiveIndex((prev) =>
                suggestions.length ? (prev - 1 + suggestions.length) % suggestions.length : -1
              )
            } else if (e.key === 'Enter') {
              if (activeIndex >= 0 && suggestions[activeIndex]) {
                e.preventDefault()
                const s = suggestions[activeIndex]
                navigateTo(s.href)
              }
            } else if (e.key === 'Escape') {
              e.preventDefault()
              handleClose()
            }
          }}
        />
        {searchQuery && (
          <div className="absolute right-0 md:-right-2 lg:-right-3 top-1/2 -translate-y-1/2 z-10">
            <Button
              type="submit"
              size="icon"
              className="h-7 w-7 sm:h-7 sm:w-7 bg-cyan-500 hover:bg-cyan-600 rounded-full flex items-center justify-center"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        )}
        {searchQuery.trim() && suggestions.length > 0 && (
          <ul
            id="search-suggestions"
            role="listbox"
            className="absolute top-full left-0 mt-2 w-full sm:w-96 max-h-72 overflow-auto rounded-lg border-2 border-slate-300 bg-white shadow-2xl z-[100]"
          >
            {suggestions.map((s, idx) => (
              <li
                key={s.id}
                id={`suggestion-${s.id}`}
                role="option"
                aria-selected={idx === activeIndex}
                className={`flex items-center gap-2 px-4 py-3 cursor-pointer text-sm font-medium transition-colors ${
                  idx === activeIndex
                    ? 'bg-cyan-100 text-cyan-900'
                    : 'bg-white text-slate-900 hover:bg-slate-100'
                }`}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseDown={(e) => {
                  // Prevent input blur before click handler
                  e.preventDefault()
                  navigateTo(s.href)
                }}
              >
                {s.type === 'category' ? (
                  <Tag className="h-4 w-4 text-cyan-600 flex-shrink-0" />
                ) : (
                  <Search className="h-4 w-4 text-slate-600 flex-shrink-0" />
                )}
                <span className="truncate text-slate-900">{s.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </form>
  )
}
