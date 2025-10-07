# Google OAuth Implementation Summary

## Overview

Implemented Google OAuth login flow with automatic token expiration and logout functionality.

## Features Implemented

### 1. Google OAuth Login Flow

- **Login Button**: Redirects to `http://10.123.22.21:8081/api/v1/oauth2/login/google`
- **Callback Handling**: Processes `auth_code` parameter from Google redirect
- **Token Exchange**: Exchanges auth code for user data and JWT token via `http://10.123.22.21:8081/api/v1/oauth2/exchange?auth_code={code}`

### 2. Token Management

- **Storage**: Tokens saved in both localStorage and cookies
- **Expiry**: Automatic 2-hour expiration for both storage methods
- **Auto Logout**: Timer-based logout when token expires
- **Event System**: Custom `authTokenExpired` event for cross-component logout

### 3. Security Features

- **Secure Cookies**: SameSite=Lax, Secure flag for production
- **Middleware Integration**: Middleware checks cookie for authentication
- **Automatic Cleanup**: Clears tokens from all storage on logout/expiry

## Files Modified

### Core Authentication (`lib/auth-service.ts`)

- Added `TOKEN_EXPIRY_HOURS = 2` constant
- Added `setupAutoLogout()` function
- Added `initializeAutoLogout()` function
- Added `redirectToGoogleLogin()` function
- Added `exchangeAuthCode()` function
- Added `extractAuthCodeFromUrl()` function
- Updated `setAuthToken()` to include expiry time
- Updated `getAuthToken()` to check expiry
- Updated `clearAuthToken()` to clear cookies and timers

### Login Page (`app/login/page.tsx`)

- Added OAuth callback handling in useEffect
- Added `exchangeAuthCode` import
- Updated Google login handler to redirect to OAuth URL
- Added user data processing for Google login response

### Auth Provider (`providers/auth-provider.tsx`)

- Added `initializeAutoLogout` import
- Added token expiry event listener
- Added automatic logout on token expiry event

### Middleware (`middleware.ts`)

- Added logging to verify cookie token detection

## Usage Flow

1. **User clicks "Login with Google"**

   ```typescript
   handleSocialLogin('google') → redirects to OAuth server
   ```

2. **Google redirects back with auth code**

   ```
   http://yoursite.com/login/?auth_code=139e91ef-5dc4-40b1-bdae-989b14d9ba7b
   ```

3. **Frontend exchanges code for token**

   ```typescript
   exchangeAuthCode(authCode) → gets user data + JWT token
   ```

4. **Token stored with 2-hour expiry**

   ```typescript
   setAuthToken(token) → localStorage + cookie + timer setup
   ```

5. **Automatic logout after 2 hours**
   ```typescript
   setupAutoLogout() → setTimeout → clearAuthToken() → event dispatch
   ```

## API Endpoints Used

- **Login**: `GET http://10.123.22.21:8081/api/v1/oauth2/login/google`
- **Exchange**: `GET http://10.123.22.21:8081/api/v1/oauth2/exchange?auth_code={code}`

## Response Format

```json
{
  "firstName": "Zed",
  "lastName": "Fx",
  "profileImageUrl": "https://lh3.googleusercontent.com/...",
  "email": "zackeye002@gmail.com",
  "token": "eyJhbGciOiJIUzM4NCJ9..."
}
```

## Testing

1. Click Google login button in `/login` page
2. Complete Google OAuth flow
3. Verify user is logged in and redirected to home
4. Check browser dev tools for cookie and localStorage
5. Wait 2 hours or manually clear token to test auto logout

## Logs Added

- `[AUTH] Set cookie:` - Logs when token is set as cookie
- `[MIDDLEWARE] Cookie token:` - Logs token detection in middleware
- `[AUTH] Google OAuth token set in cookie:` - Logs Google OAuth success
