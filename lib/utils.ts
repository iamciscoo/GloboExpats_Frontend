import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { STATUS_COLORS, IMAGE_TYPE_LABELS } from "./constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export function getStatusColor(status: string): string {
  const statusKey = status.toLowerCase() as keyof typeof STATUS_COLORS
  return STATUS_COLORS[statusKey] || STATUS_COLORS.draft
}

export function getImageTypeLabel(type: string): string {
  return IMAGE_TYPE_LABELS[type as keyof typeof IMAGE_TYPE_LABELS] || type
}

export function formatPrice(price: string | number, currency = "TZS"): string {
  if (typeof price === "number") {
    return `${price.toLocaleString()} ${currency}`
  }
  return price
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return formatDate(dateString)
}

export function calculateEngagementRate(views: number, interactions: number): number {
  if (views === 0) return 0
  return Math.round((interactions / views) * 100)
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-")
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + "..."
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s-()]{7,}$/
  return phoneRegex.test(phone)
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

export function filterProducts<T>(
  products: T[],
  searchQuery: string,
  categoryFilter?: string,
  statusFilter?: string
): T[] {
  return products.filter((product: any) => {
    const matchesSearch = product.title?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !categoryFilter || categoryFilter === "all" || 
      product.category?.toLowerCase() === categoryFilter.toLowerCase()
    const matchesStatus = !statusFilter || statusFilter === "all" || 
      product.status?.toLowerCase() === statusFilter.toLowerCase()
    
    return matchesSearch && matchesCategory && matchesStatus
  })
}
