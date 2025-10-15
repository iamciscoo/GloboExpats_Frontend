#!/usr/bin/env node

/**
 * User Verification Diagnostic Script
 * Checks user verification status and provides fix recommendations
 */

const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const API_BASE = process.env.BACKEND_URL || 'http://10.123.22.21:8081'

async function checkUserVerification(email, token) {
  console.log('\n🔍 Checking verification status for:', email)
  console.log('━'.repeat(60))

  try {
    // 1. Check user details
    console.log('\n1️⃣ Fetching user details...')
    const userResponse = await fetch(`${API_BASE}/api/v1/userManagement/user-details`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!userResponse.ok) {
      const errorText = await userResponse.text()
      console.error(`❌ Failed to fetch user details: ${userResponse.status}`)
      console.error(`   Message: ${errorText}`)
      return
    }

    const userData = await userResponse.json()
    console.log('✅ User details retrieved:')
    console.log(`   - Email: ${userData.loggingEmail}`)
    console.log(`   - Organization Email: ${userData.organizationalEmail || 'Not set'}`)
    console.log(`   - Verification Status: ${userData.verificationStatus}`)
    console.log(`   - Passport Status: ${userData.passportVerificationStatus || 'Not verified'}`)
    console.log(`   - Address Status: ${userData.addressVerificationStatus || 'Not verified'}`)
    console.log(`   - Roles: ${userData.roles?.map((r) => r.roleName).join(', ') || 'None'}`)

    // 2. Test cart access
    console.log('\n2️⃣ Testing cart access...')
    const cartResponse = await fetch(`${API_BASE}/api/v1/cart/User`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (cartResponse.ok) {
      console.log('✅ Cart access: WORKING')
    } else {
      const cartError = await cartResponse.text()
      console.log(`❌ Cart access: FAILED (${cartResponse.status})`)
      console.log(`   Error: ${cartError}`)
    }

    // 3. Analyze and provide recommendations
    console.log('\n3️⃣ Analysis & Recommendations:')
    console.log('━'.repeat(60))

    if (userData.verificationStatus !== 'VERIFIED') {
      console.log('⚠️  ISSUE FOUND: User is not verified')
      console.log('\n📋 To fix this:')
      console.log('   1. Go to: http://localhost:3000/account/verification')
      console.log('   2. Click "📧 Send OTP to My Email"')
      console.log('   3. Check your email for OTP')
      console.log('   4. Enter OTP and verify')
      console.log('\n   OR run this in browser console:')
      console.log(`   await fetch('${API_BASE}/api/v1/email/sendOTP', {`)
      console.log(`     method: 'POST',`)
      console.log(`     headers: {`)
      console.log(`       'Authorization': 'Bearer ' + localStorage.getItem('expat_auth_token'),`)
      console.log(`       'Content-Type': 'application/json'`)
      console.log(`     },`)
      console.log(`     body: JSON.stringify({ organizationalEmail: '${email}' })`)
      console.log(`   })`)
    } else if (!userData.roles?.some((r) => r.roleName === 'SELLER' || r.roleName === 'USER')) {
      console.log('⚠️  ISSUE FOUND: User has no buyer/seller role')
      console.log('\n📋 To fix this, contact backend admin to assign role')
    } else if (!cartResponse.ok) {
      console.log('⚠️  ISSUE FOUND: Cart access denied despite verification')
      console.log('\n📋 Possible causes:')
      console.log('   - Buyer profile not created in database')
      console.log('   - Backend role mismatch')
      console.log('   - Database constraint issue')
      console.log('\n   Contact backend admin to check buyer_profiles table')
    } else {
      console.log('✅ Everything looks good! User should be able to use cart.')
    }
  } catch (error) {
    console.error('\n❌ Error during check:', error.message)
  }

  console.log('\n' + '━'.repeat(60))
}

// Main execution
console.log('╔═══════════════════════════════════════════════════════════╗')
console.log('║   User Verification Diagnostic Tool                      ║')
console.log('╚═══════════════════════════════════════════════════════════╝')

rl.question('\n📧 Enter user email: ', (email) => {
  rl.question(
    '🔑 Enter auth token (from localStorage.getItem("expat_auth_token")): ',
    async (token) => {
      await checkUserVerification(email.trim(), token.trim())
      rl.close()
    }
  )
})
