# Database Strategy – MongoDB Atlas

> Version: 2024-06-13 – _proposal_

This document proposes how to introduce **MongoDB** into the Modern Expat Platform while keeping the current React/Next.js frontend untouched.

---

## 1. Why MongoDB?

- Flexible document model – easy to store heterogeneous product listings & user-generated metadata.
- First-class cloud offering via **MongoDB Atlas** with global clusters.
- Mature Node driver + official Prisma & Mongoose ORMs.
- Built-in full-text search (Atlas Search) useful for marketplace search.

---

## 2. High-Level Data Model

| Collection       | Purpose                         | Example Fields                                                                                                                                   |
| ---------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `users`          | Accounts (buyers & sellers)     | `_id`, `name`, `email`, `hashedPassword`, `role`, `verificationStatus`, `addresses[]`, `createdAt`                                               |
| `products`       | Listings visible on marketplace | `_id`, `sellerId`, `title`, `description`, `category`, `condition`, `price`, `currency`, `images[]`, `location`, `status`, `createdAt`, `rating` |
| `orders`         | Checkout results                | `_id`, `buyerId`, `sellerId`, `items[]`, `total`, `paymentMethodId`, `status`, `createdAt`                                                       |
| `cartItems`      | Server-side carts (optional)    | `_id`, `userId`, `productId`, `qty`, `createdAt`                                                                                                 |
| `messages`       | Chat messages                   | `_id`, `conversationId`, `fromUserId`, `text`, `sentAt`, `read`                                                                                  |
| `conversations`  | Conversation peers              | `_id`, `participantIds[]`, `lastMessage`, `updatedAt`                                                                                            |
| `paymentMethods` | Saved cards (tokenized via PSP) | `_id`, `userId`, `brand`, `last4`, `expMonth`, `expYear`, `stripeCustomerId`                                                                     |
| `notifications`  | In-app notifications            | `_id`, `userId`, `type`, `payload`, `read`, `createdAt`                                                                                          |

---

## 3. Access Layer Options

1. **Prisma** ORM (recommended)
   - Preview MongoDB connector is stable.
   - Schema-first approach; generates strict TypeScript types.
   - Migrations handled by Prisma Migrate.
2. **Mongoose**
   - Familiar to many Node devs, but less type-safe.

Either way, expose data to the Next.js frontend via a **REST** or **GraphQL** service (Node/Express, NestJS, Hono, etc.).

---

## 4. Connecting Frontend ➜ Backend ➜ MongoDB

```
[Browser] ──fetch──►  [Next.js API Routes or External Service]  ──ODM──►  [MongoDB Atlas]
```

Steps:

1. Create a backend service (`/backend` repo or monorepo `apps/api`) that handles auth, business logic & database access.
2. Keep the **contract** documented in `docs/backend.md` – those endpoints stay the same; only implementation changes.
3. Frontend **does not import MongoDB driver**. It only calls HTTP endpoints.

---

## 5. Local Development

```bash
# Spin up a local replica set (optional)
docker compose up mongo

# Environment .env
MONGODB_URI=mongodb://localhost:27017/expat
JWT_SECRET=supersecret
```

Prisma example schema (`prisma/schema.prisma`):

```prisma
// datasource & generator omitted for brevity
model User {
  id             String   @id @default(auto()) @map("_id") @db.ObjectId
  name           String
  email          String   @unique
  hashedPassword String
  role           String   @default("buyer")
  verificationStatus String @default("unverified")
  addresses      Address[]
  createdAt      DateTime @default(now())
}

model Product {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  sellerId    String   @db.ObjectId
  title       String
  description String
  category    String
  condition   String
  price       Int
  currency    String @default("TZS")
  images      String[]
  location    String
  status      String   @default("active")
  rating      Float?
  createdAt   DateTime @default(now())
}
```

Run migrations:

```bash
npx prisma generate
npx prisma db push
```

---

## 6. Production Checklist

- [ ] Create an Atlas cluster (`M0` free tier for staging).
- [ ] Whitelist Vercel IP ranges or use Vercel Integration for private networking.
- [ ] Store `MONGODB_URI` in Vercel project env vars.
- [ ] Enable **Atlas Backup** and **Metrics**.
- [ ] Ensure `unique` indexes on `users.email`, `products.slug`, etc.

---

## 7. Future Enhancements

- **MongoDB Realm / App Services** for GraphQL API & rules.
- **Change Streams** to power real-time notifications without polling.
- **Atlas Vector Search** if implementing semantic product search.

---

_Suggest edits or questions via PR._
