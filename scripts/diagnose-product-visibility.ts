#!/usr/bin/env ts-node
/**
 * Product Visibility Diagnostic Tool
 *
 * This script checks which products exist in the listing endpoint but fail
 * when accessed via the detail endpoint. Helps identify backend data consistency issues.
 *
 * Usage:
 *   npx ts-node scripts/diagnose-product-visibility.ts
 *
 * Or add to package.json:
 *   "scripts": { "diagnose-products": "ts-node scripts/diagnose-product-visibility.ts" }
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dev.globoexpats.com'

interface Product {
  productId: number
  productName: string
  sellerName: string
  categoryName: string
}

interface DiagnosticResult {
  totalProducts: number
  accessibleProducts: number
  inaccessibleProducts: number
  failedProductIds: number[]
  errors: Array<{ productId: number; error: string }>
}

async function fetchAllProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/products/get-all-products?page=0`)

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`)
    }

    const data = await response.json()
    const products = data.content || []

    console.log(`✅ Fetched ${products.length} products from listing endpoint`)
    return products
  } catch (error) {
    console.error('❌ Error fetching product list:', error)
    throw error
  }
}

async function checkProductDetails(productId: number): Promise<{
  accessible: boolean
  error?: string
}> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/displayItem/itemDetails/${productId}`)

    if (response.ok) {
      return { accessible: true }
    } else {
      const errorText = await response.text()
      return {
        accessible: false,
        error: `${response.status}: ${errorText || 'No error message'}`,
      }
    }
  } catch (error) {
    return {
      accessible: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

async function runDiagnostics(): Promise<DiagnosticResult> {
  console.log('\n🔍 Starting Product Visibility Diagnostics...\n')
  console.log(`Backend URL: ${BACKEND_URL}\n`)

  // Fetch all products from listing endpoint
  const products = await fetchAllProducts()

  if (products.length === 0) {
    console.log('⚠️  No products found in database')
    return {
      totalProducts: 0,
      accessibleProducts: 0,
      inaccessibleProducts: 0,
      failedProductIds: [],
      errors: [],
    }
  }

  console.log('\n📊 Testing product detail endpoint accessibility...\n')

  const results: DiagnosticResult = {
    totalProducts: products.length,
    accessibleProducts: 0,
    inaccessibleProducts: 0,
    failedProductIds: [],
    errors: [],
  }

  // Test each product
  for (const product of products) {
    process.stdout.write(
      `Testing Product ${product.productId}: "${product.productName.substring(0, 40)}..." `
    )

    const result = await checkProductDetails(product.productId)

    if (result.accessible) {
      console.log('✅')
      results.accessibleProducts++
    } else {
      console.log(`❌ ${result.error}`)
      results.inaccessibleProducts++
      results.failedProductIds.push(product.productId)
      results.errors.push({
        productId: product.productId,
        error: result.error || 'Unknown error',
      })
    }

    // Small delay to avoid overwhelming the backend
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  return results
}

async function printReport(results: DiagnosticResult): Promise<void> {
  console.log('\n' + '='.repeat(80))
  console.log('📋 DIAGNOSTIC REPORT')
  console.log('='.repeat(80))

  console.log(`\n📊 Summary:`)
  console.log(`   Total Products in Database: ${results.totalProducts}`)
  console.log(`   ✅ Accessible via Detail Endpoint: ${results.accessibleProducts}`)
  console.log(`   ❌ Inaccessible (404 errors): ${results.inaccessibleProducts}`)

  if (results.inaccessibleProducts > 0) {
    const percentage = ((results.inaccessibleProducts / results.totalProducts) * 100).toFixed(1)
    console.log(`   \n⚠️  ${percentage}% of products are NOT accessible via detail endpoint`)

    console.log(`\n❌ Failed Product IDs:`)
    console.log(`   ${results.failedProductIds.join(', ')}`)

    console.log(`\n📝 Error Details:`)
    results.errors.slice(0, 10).forEach(({ productId, error }) => {
      console.log(`   Product ${productId}: ${error}`)
    })

    if (results.errors.length > 10) {
      console.log(`   ... and ${results.errors.length - 10} more errors`)
    }

    console.log(`\n💡 Recommended Actions:`)
    console.log(`   1. Check backend logs for errors related to displayItem endpoint`)
    console.log(`   2. Verify database view/table consistency between products and displayItem`)
    console.log(`   3. Check if displayItem endpoint has authentication requirements`)
    console.log(`   4. Investigate if there's a caching/indexing issue`)
    console.log(`   5. Consider using /products endpoint instead of /displayItem for details`)
  } else {
    console.log(`\n✅ All products are accessible - no issues found!`)
  }

  console.log('\n' + '='.repeat(80))
}

// Main execution
runDiagnostics()
  .then(printReport)
  .catch((error) => {
    console.error('\n❌ Diagnostic script failed:', error)
    process.exit(1)
  })
