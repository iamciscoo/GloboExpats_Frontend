# System Audit & API Integration Report

## Executive Summary
This report details the findings from a comprehensive audit of the Expat Marketplace Frontend codebase, focusing on its integration with the backend API (`http://10.123.22.21:8081`). The system uses a Next.js App Router architecture with a custom API client layer that proxies requests to the backend to handle CORS and authentication.

## Architecture Overview

### Frontend Stack
- **Framework**: Next.js 15.2.4 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Radix UI
- **State Management**: React Hooks (no global store like Redux/Zustand observed for API data, relies on local state/effects)

### API Communication Layer
The application uses a centralized `ApiClient` class (`lib/api.ts`) for all backend communication.

1.  **Configuration**:
    - Base URL is determined by `NEXT_PUBLIC_API_URL`.
    - **Hardcoded Fallback**: `http://10.123.22.21:8081` is hardcoded in multiple files (`next.config.mjs`, `lib/auth-service.ts`, `app/api/products/[id]/route.ts`).

2.  **Proxy Strategy**:
    - **Standard Requests**: Proxied via Next.js Rewrites in `next.config.mjs`:
        ```javascript
        source: '/api/v1/:path*',
        destination: 'http://10.123.22.21:8081/api/v1/:path*'
        ```
    - **Complex Requests (PATCH)**: Handled by a custom Route Handler (`app/api/products/[id]/route.ts`) which manually constructs multipart/form-data requests. This appears to be a workaround for backend handling of PATCH requests with file uploads.

3.  **Authentication**:
    - **Mechanism**: JWT (Bearer Token).
    - **Storage**: Dual storage in `localStorage` (`expat_auth_token`) and Cookies.
    - **Flow**: `lib/auth-service.ts` manages login, registration, and token persistence. The `ApiClient` automatically attaches the token to requests.

## Key Findings & Issues

### 1. Performance Bottlenecks
- **Critical**: `getProductDetails` in `lib/api.ts` contains a dangerous fallback mechanism. If the specific product endpoint returns 404, it triggers `getAllProductsComplete`, which fetches **up to 20 pages of products** sequentially to find the item client-side.
    ```typescript
    // lib/api.ts:765
    const allProductsResponse = await this.getAllProductsComplete(10)
    ```
- **Pagination**: The backend does not support custom page sizes (fixed at 10 items), forcing the frontend to make multiple requests to build larger lists.

### 2. Hardcoded Configuration
The backend IP `10.123.22.21` is hardcoded in:
- `next.config.mjs`
- `lib/auth-service.ts`
- `app/api/products/[id]/route.ts`
- `.env.example`

This makes environment switching (e.g., to production) error-prone if not all files are updated.

### 3. Data Consistency Workarounds
The code explicitly mentions backend data inconsistencies:
> "Product not found in displayItem view - try fallback to products list... This works around backend data consistency issues where products exist in the main products table but not in the displayItem view."

This suggests the backend has two separate read models that are not always in sync.

### 4. Complex Multipart Handling
The `createProduct` and `updateProduct` methods contain extensive manual validation and error handling for `FormData`. The custom proxy at `app/api/products/[id]/route.ts` manually parses and reconstructs `FormData`, which is fragile and adds maintenance overhead.

## API Endpoint Map

| Feature | Frontend Method | Backend Endpoint | Notes |
|---------|----------------|------------------|-------|
| **Products** | `getProducts` | `/api/v1/products` | |
| | `getProduct` | `/api/v1/products/{id}` | |
| | `createProduct` | `/api/v1/products/post-product` | Multipart |
| | `updateProduct` | `/api/products/{id}` | **Custom Proxy** |
| **Display** | `getTopPicks` | `/api/v1/displayItem/top-picks` | |
| | `getNewestListings` | `/api/v1/displayItem/newest` | |
| **Auth** | `login` | `/api/v1/auth/login` | |
| | `register` | `/api/v1/auth/register` | |
| **User** | `getUserDetails` | `/api/v1/userManagement/user-details` | |
| **Orders** | `createOrder` | `/api/v1/orders` | |

## Recommendations

1.  **Refactor Configuration**: Create a single source of truth for the API URL in a config file that reads from `process.env`, removing all hardcoded IP addresses.
2.  **Optimize Fallback**: Remove the `getAllProductsComplete` fallback in `getProductDetails`. It causes massive over-fetching. If the product isn't found, it should be a 404.
3.  **Simplify Proxy**: Investigate if the backend can be updated to handle CORS/PATCH correctly, allowing the removal of the complex `app/api/products/[id]/route.ts` manual proxy.
4.  **Type Definitions**: Replace `unknown` return types in `ApiClient` with proper Zod schemas or TypeScript interfaces to ensure type safety across the application.
