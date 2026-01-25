'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import { useAuth } from './use-auth'
import { toast } from '@/components/ui/use-toast'

export const useSavedProducts = () => {
  const { isLoggedIn } = useAuth()
  const [savedProductIds, setSavedProductIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)
  const [savedProducts, setSavedProducts] = useState<Record<string, unknown>[]>([])

  const fetchSavedProducts = useCallback(async () => {
    if (!isLoggedIn) return

    setLoading(true)
    try {
      const response = await apiClient.getSavedProducts()
      // Use robust content extraction
      const products = Array.isArray(response)
        ? (response as Record<string, unknown>[])
        : ((response as Record<string, unknown>)?.content as Record<string, unknown>[]) ||
        ((response as Record<string, unknown>)?.data as Record<string, unknown>[]) ||
        []

      setSavedProducts(products)

      // Ultra-aggressive ID extraction matching transformBackendProduct
      const ids = new Set<number>(
        products
          .map((p: any) => {
            const getAnyId = (obj: any): number => {
              if (obj === undefined || obj === null) return 0
              if (typeof obj === 'number') return obj
              if (typeof obj === 'string' && !isNaN(Number(obj))) return Number(obj)
              if (typeof obj !== 'object') return 0

              const keys = [
                'productId',
                'productID',
                'id',
                'product_id',
                'item_id',
                'ID',
                'uid',
                'pk',
                'idProduct',
              ]
              for (const key of keys) {
                const val = obj[key]
                if (
                  val !== undefined &&
                  val !== null &&
                  val !== '' &&
                  !isNaN(Number(val)) &&
                  Number(val) !== 0
                ) {
                  return Number(val)
                }
              }
              return 0
            }
            return getAnyId(p.product || p.item || p.data) || getAnyId(p) || null
          })
          .filter((id): id is number => id !== null && id !== 0)
      )

      setSavedProductIds(ids)
    } catch (error) {
      console.error('Failed to fetch saved products:', error)
    } finally {
      setLoading(false)
    }
  }, [isLoggedIn])

  useEffect(() => {
    fetchSavedProducts()
  }, [fetchSavedProducts])

  const toggleSaveProduct = async (productId: number) => {
    if (!isLoggedIn) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to save products to your wishlist.',
      })
      return
    }

    if (!productId || productId === 0) {
      console.error('❌ Cannot toggle save for product ID 0')
      return
    }

    const isSaved = savedProductIds.has(productId)

    try {
      if (isSaved) {
        await apiClient.unsaveProduct(productId)
        setSavedProductIds((prev) => {
          const next = new Set(prev)
          next.delete(productId)
          return next
        })
        toast({
          title: 'Removed from Saved',
          description: 'Product has been removed from your saved items.',
        })
      } else {
        await apiClient.saveProduct(productId)
        setSavedProductIds((prev) => {
          const next = new Set(prev)
          next.add(productId)
          return next
        })
        toast({
          title: 'Saved',
          description: 'Product has been saved to your wishlist.',
        })
      }
      // Refresh the list
      fetchSavedProducts()
    } catch (error) {
      console.error('Failed to toggle saved product:', error)
      toast({
        title: 'Error',
        description: 'Failed to update saved products. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const isProductSaved = (productId: number) => savedProductIds.has(productId)

  return {
    savedProductIds,
    savedProducts,
    loading,
    toggleSaveProduct,
    isProductSaved,
    refreshSavedProducts: fetchSavedProducts,
  }
}
