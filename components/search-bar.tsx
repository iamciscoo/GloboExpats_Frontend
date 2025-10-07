'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Tag } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { CATEGORIES } from '@/lib/constants'
import { apiClient } from '@/lib/api'

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch products from backend for search suggestions
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // ...existing code...
        const response = await apiClient.getAllProducts(0)
        // Access content directly from response (backend returns {content: Array, ...})
        const productsData = response.content || response.data?.content || response.data || []
        setProducts(productsData)
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

    const uniqueProductsMap = new Map<string, any>()
    for (const p of products) {
      const productTitle = p.productName || p.title || ''
      const productId = p.productId || p.id || ''
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
      label: p.productName || p.title || 'Unknown Product',
      type: 'product' as const,
      href: `/browse?q=${encodeURIComponent(p.productName || p.title || '')}`,
    }))

    return [...categoryMatches, ...productMatches].slice(0, 8)
  }, [searchQuery])

  const navigateTo = (href: string) => {
    router.push(href)
    setIsExpanded(false)
    setSearchQuery('')
    setActiveIndex(-1)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/browse?q=${encodeURIComponent(searchQuery.trim())}`)
      setIsExpanded(false)
      setSearchQuery('')
      setActiveIndex(-1)
    }
  }

  const handleIconClick = () => {
    setIsExpanded(true)
  }

  const handleClose = () => {
    setIsExpanded(false)
    setSearchQuery('')
    setActiveIndex(-1)
  }

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isExpanded])

  // Handle click outside to close
  useEffect(() => {
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
  }, [isExpanded])

  // Keyboard shortcuts to open/close search
  useEffect(() => {
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
  }, [isExpanded])

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
    <form onSubmit={handleSearch} className="relative" role="search" aria-label="Search products">
      <Label htmlFor="search-input" className="sr-only">
        Search for products in the global marketplace
      </Label>
      <div className="relative flex items-center">
        <Input
          ref={inputRef}
          id="search-input"
          type="search"
          placeholder="Search global marketplace..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setActiveIndex(-1)
          }}
          className="w-64 h-8 pl-3 pr-16 bg-white border-slate-300 rounded-full text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-neutral-900 placeholder-neutral-500"
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
        <div className="absolute right-1 flex items-center gap-1">
          {searchQuery && (
            <Button
              type="submit"
              size="icon"
              className="h-6 w-6 bg-cyan-500 hover:bg-cyan-600 rounded-full"
              aria-label="Search"
            >
              <Search className="h-3 w-3" />
            </Button>
          )}
          <Button
            type="button"
            size="icon"
            onClick={handleClose}
            className="h-6 w-6 bg-gray-400 hover:bg-gray-500 rounded-full"
            aria-label="Close search"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        {searchQuery.trim() && suggestions.length > 0 && (
          <ul
            id="search-suggestions"
            role="listbox"
            className="absolute top-full left-0 mt-2 w-64 max-h-72 overflow-auto rounded-md border border-slate-200 bg-white shadow-lg z-50"
          >
            {suggestions.map((s, idx) => (
              <li
                key={s.id}
                id={`suggestion-${s.id}`}
                role="option"
                aria-selected={idx === activeIndex}
                className={`flex items-center gap-2 px-3 py-2 cursor-pointer text-sm ${
                  idx === activeIndex ? 'bg-cyan-50 text-cyan-700' : 'hover:bg-slate-50'
                }`}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseDown={(e) => {
                  // Prevent input blur before click handler
                  e.preventDefault()
                  navigateTo(s.href)
                }}
              >
                {s.type === 'category' ? (
                  <Tag className="h-4 w-4 text-cyan-600" />
                ) : (
                  <Search className="h-4 w-4 text-slate-500" />
                )}
                <span className="truncate">{s.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </form>
  )
}
