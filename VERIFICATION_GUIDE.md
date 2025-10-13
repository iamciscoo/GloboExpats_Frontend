# Email Verification Guide

## ⚠️ Why Verification is Required

Your backend requires users to verify their organizational email before they can:
- ✅ Post products (sell items)
- ✅ Add items to cart
- ✅ Complete purchases

**Without verification, you'll get these errors:**
- `404: User is not verified and cannot add items to cart`
- `404: Buyer profile not found for user`

---

## 🚀 Quick Verification Steps

### **Method 1: Using the Verification Page** (Recommended)

1. **Navigate to verification page:**
   ```
   http://localhost:3000/account/verification
   ```

2. **Click "📧 Send OTP to My Email"** button at the top

3. **Check your email** for the OTP code
   - Email: `francisjac21@gmail.com`
   - Subject: Usually "Verification Code" or "OTP Code"
   - If testing locally, **check your backend console logs** for the OTP

4. **Enter the OTP** in the form that appears below

5. **Click "Verify OTP"**

6. **Done!** You're now verified as a SELLER (which includes buyer permissions)

---

### **Method 2: Manual OTP Flow**

If the quick button doesn't work, use the manual form:

1. Go to verification page
2. Scroll to "Organization Email Verification" section
3. Enter your email in the input field
4. Click "Send OTP"
5. Check your email for OTP
6. Enter OTP and click "Verify OTP"

---

## 🔍 Finding the OTP (Development Mode)

If you're testing locally and not receiving emails, check your **backend console logs**:

```bash
# The backend should log something like:
OTP Code: 123456
Sent to: francisjac21@gmail.com
```

Look for lines containing "OTP" or "verification code" in your backend terminal.

---

## ✅ Verification Success

After verification, you should be able to:

### Test 1: Add to Cart
```javascript
fetch('http://10.123.22.21:8081/api/v1/cart/add', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('expat_auth_token')}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        productId: 1,
        quantity: 1
    })
}).then(r => console.log('Cart Status:', r.status));
// Expected: 200 (not 404!)
```

### Test 2: Get Cart
```javascript
fetch('http://10.123.22.21:8081/api/v1/cart/User', {
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('expat_auth_token')}`
    }
}).then(r => console.log('Get Cart Status:', r.status));
// Expected: 200 or 201
```

### Test 3: Post Product
Now you can post products from the `/sell` page without getting 404 errors!

---

## 🐛 Troubleshooting

### Issue: "Failed to send OTP"
**Solution**: 
- Check if you're logged in
- Verify your auth token exists: `localStorage.getItem('expat_auth_token')`
- Check backend is running at http://10.123.22.21:8081

### Issue: "Invalid OTP"
**Solution**:
- Check for typos in the OTP
- Make sure you're using the most recent OTP
- OTP might expire after a few minutes - request a new one

### Issue: Still getting 404 after verification
**Solution**:
- Check verification status: Go to `/account/verification`
- It should show "Account Fully Verified!" with green checkmarks
- Try logging out and logging back in
- Clear browser cache and hard refresh (Ctrl + Shift + R)

---

## 📊 Verification Status Check

Run this in browser console to check your status:

```javascript
// Check frontend state
const user = JSON.parse(localStorage.getItem('expat_user'));
console.log('Verification Status:', user?.verificationStatus);

// Check backend status
fetch('http://10.123.22.21:8081/api/v1/userManagement/user-details', {
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('expat_auth_token')}`
    }
}).then(r => r.json()).then(data => {
    console.log('Backend User Details:', data);
    console.log('Verification Status:', data.verificationStatus);
});
```

Expected output after verification:
```javascript
{
  verificationStatus: "VERIFIED",
  isOrganizationEmailVerified: true,
  canBuy: true,
  canSell: true
}
```

---

## 🎯 Summary

1. ✅ Go to http://localhost:3000/account/verification
2. ✅ Click "📧 Send OTP to My Email"
3. ✅ Check email (or backend logs) for OTP
4. ✅ Enter OTP and verify
5. ✅ Start buying and selling!

---

**Need Help?** Check the browser console for detailed error messages.
