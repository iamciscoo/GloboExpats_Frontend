# Immediate Fix Guide - API Path Duplication Issue

**Status:** Critical - Local development frontend broken  
**Last Updated:** October 20, 2025

---

## Problem Summary

The frontend is making API requests with duplicated paths:
```
❌ Current: /api/backend/v1/api/v1/displayItem/newest
✅ Expected: http://10.123.22.21:8081/api/v1/displayItem/newest
```

## Root Cause

The running application was built with incorrect `NEXT_PUBLIC_API_URL=/api/backend/v1` instead of the full backend URL.

## Quick Fix Steps

### Option 1: Rebuild Docker Container (Recommended)

```bash
# Navigate to project directory
cd /home/cisco/Documents/ExpatFrontend-main

# Stop the running container
docker-compose down

# Rebuild with no cache to ensure fresh build
docker-compose build --no-cache

# Start the container
docker-compose up -d

# View logs to verify
docker-compose logs -f frontend
```

### Option 2: Development Server (Faster for testing)

```bash
# Kill any running processes on port 3000
pkill -f "next dev" || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Install dependencies if needed
npm install --legacy-peer-deps

# Start development server
npm run dev

# Or with explicit host binding
npm run dev -- -H 0.0.0.0 -p 3000
```

### Option 3: Rebuild Next.js Application

```bash
# Clean previous build
rm -rf .next

# Rebuild application
npm run build

# Start production server
npm start
```

## Verification Steps

After rebuilding, test the following:

### 1. Check Browser Console

Navigate to `http://10.123.22.21:3000/` and open browser DevTools (F12).

**Expected:**
```javascript
[LOG] [API] GET http://10.123.22.21:8081/api/v1/displayItem/newest?page=0&size=20
[LOG] [API] GET http://10.123.22.21:8081/api/v1/displayItem/top-picks?page=0&size=20
[LOG] [API] GET http://10.123.22.21:8081/api/v1/products/get-all-products?page=0
```

**Should NOT see:**
```javascript
❌ [ERROR] Failed to load resource: 404
❌ /api/backend/v1/api/v1/...
```

### 2. Test API Endpoints Directly

```bash
# Test backend is accessible
curl http://10.123.22.21:8081/api/v1/products/categories

# Should return JSON with categories, not HTML
```

### 3. Verify Homepage Loads

- Navigate to `http://10.123.22.21:3000/`
- Homepage should show product listings (not error messages)
- "New Arrivals" section should have actual products
- "Trending Now" section should display items
- No "404" errors in sections

### 4. Check Network Tab

Open DevTools → Network tab:
- Filter by "XHR" or "Fetch"
- All API requests should show `Status: 200 OK`
- Response should be JSON (not HTML)

## Troubleshooting

### Issue: Still seeing `/api/backend/v1/api/v1/` after rebuild

**Solution:**
```bash
# Clear browser cache
# Chrome: Ctrl+Shift+Del → Clear all
# Firefox: Ctrl+Shift+Del → Everything

# Hard refresh the page
# Ctrl+Shift+R (Windows/Linux)
# Cmd+Shift+R (Mac)

# Or open in incognito/private window
```

### Issue: Environment variables not updating

**Check current environment:**
```bash
# View environment in running container
docker exec <container-id> env | grep NEXT_PUBLIC_API_URL

# Should show:
# NEXT_PUBLIC_API_URL=http://10.123.22.21:8081
```

**If showing old value, rebuild with explicit args:**
```bash
docker build \
  --no-cache \
  --build-arg NEXT_PUBLIC_API_URL=http://10.123.22.21:8081 \
  --build-arg BACKEND_URL=http://10.123.22.21:8081 \
  --build-arg NEXT_PUBLIC_BACKEND_URL=http://10.123.22.21:8081 \
  -t expat-frontend:latest .

docker run -d \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://10.123.22.21:8081 \
  -e BACKEND_URL=http://10.123.22.21:8081 \
  --name expat-frontend \
  expat-frontend:latest
```

### Issue: Port 3000 already in use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or kill all Node processes
pkill -9 node
```

### Issue: Docker container won't start

```bash
# Check logs
docker logs <container-id>

# Common issues:
# 1. Missing dependencies - run: docker-compose build --no-cache
# 2. Port conflict - change port in docker-compose.yml
# 3. Memory limits - increase Docker memory allocation
```

## Files Modified in This Fix

1. **`Dockerfile`** (Lines 39-46, 48-58)
   - Changed `NEXT_PUBLIC_API_URL` from `/api/backend/v1` to `http://10.123.22.21:8081`
   - Updated all related environment variables
   - Fixed documentation comments

2. **`.env.local`** (Already correct)
   - Contains proper configuration
   - No changes needed

3. **`lib/api.ts`** (No changes needed)
   - Already handles URL construction correctly
   - Appends `/api/v1/` to base URL automatically

## Expected Behavior After Fix

### Homepage (`/`)
- ✅ Product listings display
- ✅ "New Arrivals" section populated
- ✅ "Trending Now" section shows items
- ✅ Search bar functional
- ✅ No console errors

### API Requests
- ✅ All requests go directly to `http://10.123.22.21:8081/api/v1/...`
- ✅ Responses are JSON (not HTML)
- ✅ Status codes: 200 (success) or 401 (auth required)

### User Flows
- ✅ Browse products works
- ✅ Search returns results
- ✅ Product details page loads
- ✅ Login/registration functional
- ✅ Cart operations work (for authenticated users)

## Production Deployment Notes

For production deployment to `https://globoexpats.com/`, use:

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://api.globoexpats.com \
  --build-arg BACKEND_URL=https://api.globoexpats.com \
  --build-arg NEXT_PUBLIC_BACKEND_URL=https://api.globoexpats.com \
  --build-arg NEXT_PUBLIC_WS_URL=wss://api.globoexpats.com/ws \
  --build-arg NEXT_PUBLIC_ENVIRONMENT=production \
  -t expat-frontend:production .
```

**Note:** Production is currently showing 502 Bad Gateway. Backend service needs to be restored first before deploying frontend changes.

## Next Steps After Fix

1. ✅ Verify local development works
2. Test all user flows (registration, login, product listing, cart, checkout)
3. Address production 502 error (backend service down)
4. Implement health monitoring
5. Set up automated testing
6. Configure CI/CD pipeline

## Support

If issues persist after following this guide:

1. **Check logs:**
   ```bash
   docker-compose logs frontend
   docker-compose logs backend
   ```

2. **Verify backend is running:**
   ```bash
   curl http://10.123.22.21:8081/swagger-ui/index.html
   ```

3. **Test API directly:**
   ```bash
   curl http://10.123.22.21:8081/api/v1/products/categories
   ```

4. **Contact DevOps team** with:
   - Error messages from console
   - Docker logs
   - Network tab screenshots
   - Steps to reproduce

---

**Last Verified:** Pending rebuild  
**Priority:** P0 - Critical (blocks all development)  
**Owner:** Development Team
