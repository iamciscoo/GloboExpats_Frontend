# Backend Integration Guide – GlobalExpat Frontend

> **Status:** _Draft v0.1 – generated 2024-06-12_
>
> This document enumerates every front-end component or page that makes (or will make) network requests, and specifies the REST/GraphQL endpoints, request/response shapes, and auth requirements the backend should expose. It can be iterated as the product evolves.

---

## 1. Auth & User Management

| Front-end Location             | Purpose                | HTTP Method & Path                      | Request Body                    | Response              | Notes                                                                                                            |
| ------------------------------ | ---------------------- | --------------------------------------- | ------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `/app/login/page.tsx`          | Email/password sign-in | `POST /api/auth/login`                  | `{ email, password }`           | `200 { token, user }` | Token returned is stored in `localStorage` and attached via `Authorization: Bearer` header for subsequent calls. |
| `/app/register/page.tsx`       | Account creation       | `POST /api/auth/register`               | `{ name, email, password }`     | `201 { token, user }` | Sends verification e-mail out-of-band.                                                                           |
| `/app/reset-password/page.tsx` | Forgot-password        | `POST /api/auth/password-reset-request` | `{ email }`                     | `204`                 | Backend emails OTP / link.                                                                                       |
| same                           | Reset confirmation     | `POST /api/auth/password-reset`         | `{ email, token, newPassword }` | `204`                 |                                                                                                                  |
| `useAuth` provider             | Token refresh          | `POST /api/auth/refresh`                | (cookie refresh token)          | `200 { token }`       | Triggered silently before expiry.                                                                                |

---

## 2. Products & Listings

| Front-end                          | Purpose                   | Method & Path              | Body / Params                               | Response                      |
| ---------------------------------- | ------------------------- | -------------------------- | ------------------------------------------- | ----------------------------- |
| `FeaturedListings`, Browse, Search | Fetch paginated products  | `GET /api/products`        | Query-string: `q, category, sort, page`     | `{ items: Product[], total }` |
| Product page                       | Single product            | `GET /api/products/:id`    | —                                           | `Product`                     |
| `ProductActions` (Add to Cart)     | Add to cart (server copy) | `POST /api/cart`           | `{ productId, qty }`                        | `Cart`                        |
| Sell flow                          | Create listing            | `POST /api/products`       | `NewProductPayload` inc. images (multipart) | `201 Product`                 |
| Seller dashboard                   | Seller's listings         | `GET /api/seller/products` | auth                                        | list                          |
| Update listing                     | `PATCH /api/products/:id` | `Partial<Product>`         | updated                                     |

`Product` model (minimal):

```jsonc
{
  "id": 123,
  "title": "MacBook Pro 14\" M2",
  "price": 3500000,
  "currency": "TZS",
  "images": ["/files/abc.jpg"],
  "seller": { "id": 9, "name": "TechExpat Dar" },
  "condition": "like-new",
  "category": "electronics-tech",
  "location": "Dar es Salaam, TZ",
  "rating": 4.9,
  "verified": true,
}
```

---

## 3. Cart & Checkout

| Front-end                     | Endpoint                                                                | Description                                                                                                 |
| ----------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `CartProvider` (initial load) | `GET /api/cart`                                                         | Returns current cart items for logged-in user.                                                              |
| Add/update/remove             | `POST /api/cart`, `PATCH /api/cart/:itemId`, `DELETE /api/cart/:itemId` | Standard CRUD.                                                                                              |
| Checkout page                 | `POST /api/checkout`                                                    | Body: `Cart + paymentMethod + address`. Returns order confirmation + Stripe client-secret if paying online. |

---

## 4. Orders

| Page             | Endpoint                        | Behaviour       |
| ---------------- | ------------------------------- | --------------- |
| Account → Orders | `GET /api/orders?status=&page=` | Paginated list. |
| Order detail     | `GET /api/orders/:id`           | —               |

---

## 5. Messaging

| Component                          | Endpoint                               | Notes                                             |
| ---------------------------------- | -------------------------------------- | ------------------------------------------------- |
| MessagesClient (conversation list) | `GET /api/conversations`               | Returns conversations summary with unread counts. |
| MessagesClient (chat)              | `GET /api/conversations/:id/messages`  | Lazy-loaded when opening a chat.                  |
| Send message                       | `POST /api/conversations/:id/messages` | `{ text }`                                        |
| WebSocket / SSE                    | `/ws/chat`                             | Real-time updates (optional phase-2).             |

---

## 6. Verification Flow

| Step                           | Endpoint                         |
| ------------------------------ | -------------------------------- |
| Request verification email/OTP | `POST /api/verification/request` |
| Submit OTP                     | `POST /api/verification/verify`  |
| Status check (on login)        | `GET /api/verification`          |

Backend should set a boolean `verifiedBuyer` on the user record; front-end blocks unverified actions via `useVerification` hook.

---

## 7. Admin APIs (Dashboard)

| Feature            | Endpoint                               |
| ------------------ | -------------------------------------- |
| View flagged items | `GET /api/admin/flagged-products`      |
| Archive listing    | `POST /api/admin/products/:id/archive` |
| Send notification  | `POST /api/admin/notifications`        |

Admin endpoints require `role: admin` JWT claims.

---

## 8. Common Response Wrapper

Suggested envelope:

```jsonc
{
  "success": true,
  "data": …,
  "error": null
}
```

On errors (`success:false`) backend returns `error.code`, `error.message` for consistent handling by `use-toast`.

---

## 9. Authentication & Headers

All protected endpoints must accept:

```http
Authorization: Bearer <JWT>
```

Frontend uses `fetch` with `credentials: 'include'` when refresh tokens are HttpOnly cookies.

---

## 10. Roadmap / Open Questions

1. Payment provider? Currently assuming Stripe – adjust endpoints accordingly.
2. Shipping service integration TBD.
3. Real-time chat: will we adopt WebSockets (Socket.io) or server-sent events? Temporary polling is acceptable in MVP.

---

_Feel free to annotate or PR against this doc as backend contracts evolve._
