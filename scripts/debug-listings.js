#!/usr/bin/env node

/**
 * Debug Script: Check My Listings Issue
 *
 * This script helps diagnose why users can't see their products in the dashboard.
 * Run with: node scripts/debug-listings.js
 */

const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const API_BASE = 'http://10.123.22.21:8081/api/v1'

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve))
}

async function main() {
  console.log('='.repeat(60))
  console.log('Dashboard "My Listings" Debug Tool')
  console.log('='.repeat(60))
  console.log('')

  // Get JWT token from user
  const token = await question('Enter your JWT token (from localStorage): ')

  if (!token || token.trim().length === 0) {
    console.error('❌ No token provided. Exiting.')
    rl.close()
    return
  }

  console.log('\n✅ Token received\n')

  try {
    // Step 1: Get user details
    console.log('1️⃣ Fetching user details...')
    const userResponse = await fetch(`${API_BASE}/userManagement/user-details`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!userResponse.ok) {
      throw new Error(`Failed to fetch user: ${userResponse.status} ${userResponse.statusText}`)
    }

    const user = await userResponse.json()
    console.log('✅ User Details:')
    console.log(JSON.stringify(user, null, 2))

    const userFullName = `${user.firstName || ''} ${user.lastName || ''}`.trim()
    console.log(`\n👤 User Full Name: "${userFullName}"`)
    console.log(`📧 User Email: ${user.loggingEmail || user.emailAddress}`)

    // Step 2: Fetch first page of products
    console.log('\n2️⃣ Fetching products (page 0)...')
    const productsResponse = await fetch(`${API_BASE}/products/get-all-products?page=0`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!productsResponse.ok) {
      throw new Error(`Failed to fetch products: ${productsResponse.status}`)
    }

    const productsData = await productsResponse.json()
    const products = productsData.data?.content || productsData.content || []

    console.log(`✅ Found ${products.length} products total`)

    if (products.length === 0) {
      console.log('\n⚠️ NO PRODUCTS IN DATABASE')
      console.log('This means no products have been created yet, or they require approval.')
      rl.close()
      return
    }

    // Step 3: Show first product structure
    console.log('\n3️⃣ Examining product structure...')
    console.log('First product:')
    console.log(JSON.stringify(products[0], null, 2))

    // Step 4: Check for matches
    console.log('\n4️⃣ Checking for matches...')
    console.log(`Looking for products where:`)
    console.log(`  - sellerName === "${userFullName}"`)

    const matchingProducts = products.filter((product) => {
      const sellerNameMatch =
        product.sellerName &&
        product.sellerName.toLowerCase().trim() === userFullName.toLowerCase().trim()

      if (sellerNameMatch) {
        console.log(`✅ MATCH: ${product.productName} (sellerName: "${product.sellerName}")`)
      }

      return sellerNameMatch
    })

    console.log(`\n📊 Results:`)
    console.log(`  Total products in DB: ${products.length}`)
    console.log(`  Your products: ${matchingProducts.length}`)

    if (matchingProducts.length === 0) {
      console.log('\n❌ NO MATCHES FOUND')
      console.log('\nDebugging info:')
      console.log(`Your name: "${userFullName}"`)
      console.log('\nSeller names in database:')
      products.forEach((p, idx) => {
        console.log(`  ${idx + 1}. "${p.sellerName}" (Product: ${p.productName})`)
      })

      console.log('\n🔍 Possible issues:')
      console.log('  1. Name mismatch - your name in auth != seller name in products')
      console.log('  2. Products created before name was properly set')
      console.log('  3. Backend not populating sellerName field correctly')
      console.log('\n💡 Solution: Check backend logs to see how it populates sellerName')
    } else {
      console.log('\n✅ MATCHES FOUND! Your products:')
      matchingProducts.forEach((p, idx) => {
        console.log(`  ${idx + 1}. ${p.productName} (ID: ${p.productId})`)
      })
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message)
    console.error(error)
  }

  rl.close()
}

main()
