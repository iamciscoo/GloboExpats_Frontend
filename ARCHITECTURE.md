# 📊 Analytics Dashboard Architecture

## How It All Works Together

```
┌─────────────────────────────────────────────────────────────────────┐
│                    USER'S BROWSER                                   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  /statistics PAGE (PUBLIC - NO LOGIN)                        │  │
│  │                                                                │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │  Controls                                              │  │  │
│  │  │  ├─ Period: day / week / month / year                │  │  │
│  │  │  └─ Date: today / yesterday / last7 / last30          │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  │                                                                │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │  4 Metric Cards                                        │  │  │
│  │  │  ├─ Visits                                            │  │  │
│  │  │  ├─ Unique Visitors                                  │  │  │
│  │  │  ├─ Page Views                                       │  │  │
│  │  │  └─ Bounce Rate                                      │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  │                                                                │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │  Top Pages Table (Top 10)                             │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  │                                                                │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │  Countries Table (Top 10)                             │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│              ↑                                                      │
│              │ Fetches from                                        │
│              │ /api/matomo?method=...&period=...&date=...         │
└──────────────┼──────────────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────────────┐
│               NEXT.JS BACKEND (Your Server)                         │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  /api/matomo Route Handler                                   │  │
│  │                                                                │  │
│  │  1. Receives: ?method=VisitsSummary.get&period=day...       │  │
│  │                                                                │  │
│  │  2. Gets MATOMO_TOKEN from .env.local (SECRET!)             │  │
│  │     ⚠️  Token is NEVER sent to browser!                      │  │
│  │                                                                │  │
│  │  3. Builds URL to Matomo:                                    │  │
│  │     https://matomo.globoexpats.com/index.php                │  │
│  │     ?module=API                                              │  │
│  │     &method=VisitsSummary.get                               │  │
│  │     &idSite=1                                                │  │
│  │     &period=day                                              │  │
│  │     &date=today                                              │  │
│  │     &token_auth=YOUR_SECRET_TOKEN ← ADDED HERE              │  │
│  │     &format=JSON                                             │  │
│  │                                                                │  │
│  │  4. Makes request to Matomo API                              │  │
│  │                                                                │  │
│  │  5. Returns JSON to browser                                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│              ↑                                                      │
│              │ Requests data from                                  │
└──────────────┼──────────────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────────────┐
│         MATOMO INSTANCE (matomo.globoexpats.com)                    │
│                                                                       │
│  ✅ Authenticates with token_auth                                   │
│  ✅ Verifies idSite (which website)                                 │
│  ✅ Queries analytics database                                       │
│  ✅ Returns data (visits, pages, countries, etc.)                   │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### 1. Frontend Component (`/app/statistics/page.tsx`)
```
StatisticsPage (client-side)
├─ State: period, dateRange
├─ useMatomo() hooks (3 parallel calls):
│  ├─ VisitsSummary.get → visits, unique visitors, bounce rate
│  ├─ Actions.getPageUrls → top pages
│  └─ UserCountry.getCountry → visitor countries
├─ Renders:
│  ├─ Controls (dropdowns)
│  ├─ Metric Cards (4 cards)
│  ├─ Top Pages Table
│  ├─ Countries Table
│  └─ Loading/Error states
└─ User can change period/date → re-fetches → updates display
```

### 2. React Hook (`/hooks/use-matomo.ts`)
```
useMatomo(options)
├─ Input: {method, period, date, idSite}
├─ Makes fetch: /api/matomo?...
├─ Handles:
│  ├─ Loading state
│  ├─ Error handling
│  ├─ Response parsing (array vs object)
│  └─ Automatic refetch on param change
└─ Returns: {data, loading, error, refetch}
```

### 3. Backend API Route (`/app/api/matomo/route.ts`)
```
/api/matomo GET endpoint
├─ Receives: query parameters
├─ Reads .env.local:
│  ├─ MATOMO_URL
│  ├─ MATOMO_TOKEN (secret)
│  └─ MATOMO_SITE_ID
├─ Builds Matomo API URL
├─ Makes server-side request
├─ Returns JSON response
└─ Error handling
```

---

## Data Flow Example

### User Action: "Show me last 30 days of data"

```
1. User selects "Last 30 Days" in date dropdown
   └─ setDateRange('last30')

2. React component re-renders
   └─ useMatomo hook notices dateRange changed

3. Hook fetches: /api/matomo?method=VisitsSummary.get&period=day&date=last30
   └─ Calls setLoading(true)

4. Backend receives request
   └─ Reads MATOMO_TOKEN from .env.local

5. Backend builds URL:
   https://matomo.globoexpats.com/index.php
   ?module=API
   &method=VisitsSummary.get
   &period=day
   &date=last30
   &idSite=1
   &token_auth=YOUR_TOKEN
   &format=JSON

6. Backend sends request to Matomo

7. Matomo validates token
   └─ Returns 30 days of daily data points

8. Backend sends JSON back to browser

9. Hook processes response
   └─ setLoading(false)
   └─ setData(response)

10. Component re-renders with new data

11. User sees updated charts/tables
```

---

## Security Model

### What's Safe? ✅
```
PUBLIC (can be in code / frontend / URLs):
├─ NEXT_PUBLIC_MATOMO_URL = https://matomo.globoexpats.com
├─ /statistics route URL
├─ Analytics data (visits, pages, countries)
└─ Site ID (which website)

PROTECTED (server-only, in .env.local):
├─ MATOMO_TOKEN = your_secret_token_xyz
└─ MATOMO_SITE_ID (if you want to hide it)
```

### Token Location: Server Only
```
Browser       Backend         Matomo
 │             │               │
 │─ request ──→│              │
 │             │               │
 │             ├─ has token ───→ Authenticate
 │             │               │
 │             │←─ data ────────│
 │←─ data ─────│              │
 │             │              │

Token NEVER travels to browser! ✅
```

---

## Adding New Features

### Pattern: Add Any API Method

```
1. Identify Matomo method
   Example: Referrers.getKeywords

2. Add useMatomo hook in component:
   const { data: keywords } = useMatomo({
     method: 'Referrers.getKeywords',
     period,
     date: getMatomoDate(dateRange),
   })

3. Add to JSX (copy an existing table):
   {keywords && Array.isArray(keywords) && (
     <table>
       <tr>
         {keywords.map(item => (
           <td>{item.label}</td>
           <td>{item.nb_visits}</td>
         ))}
       </tr>
     </table>
   )}

4. Done! 🎉
```

---

## File Dependency Graph

```
┌─────────────────────────────────────┐
│  /app/statistics/page.tsx           │
│  (Dashboard UI)                     │
│                                     │
│  Uses hook:                         │
│  └─ useMatomo()                    │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  /hooks/use-matomo.ts               │
│  (React Hook)                       │
│                                     │
│  Fetches from:                      │
│  └─ /api/matomo                    │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  /app/api/matomo/route.ts           │
│  (Backend API)                      │
│                                     │
│  Reads from:                        │
│  └─ .env.local (MATOMO_TOKEN)      │
│                                     │
│  Requests from:                     │
│  └─ matomo.globoexpats.com         │
└─────────────────────────────────────┘
```

---

## Typical Request/Response

### Request to `/api/matomo`
```
GET /api/matomo?method=VisitsSummary.get&period=day&date=today&idSite=1
```

### Backend Internal Request to Matomo
```
GET https://matomo.globoexpats.com/index.php
   ?module=API
   &method=VisitsSummary.get
   &idSite=1
   &period=day
   &date=today
   &format=JSON
   &token_auth=abc123xyz789 ← Secret, only on server
```

### Response to Browser
```json
{
  "nb_visits": 150,
  "nb_uniq_visitors": 120,
  "nb_actions": 450,
  "bounce_count": 45,
  "bounce_rate": "30.0%",
  "sum_visit_length": 12345,
  "nb_visits_converted": 5
}
```

---

## Performance Considerations

### Caching
```typescript
// Without caching (current):
// Re-fetches on every render/date change
// ✅ Always up-to-date
// ⚠️ More API calls

// With caching (optional):
// Store data in state/context
// Check cache before fetching
// ✅ Fewer API calls
// ⚠️ Slightly stale data
```

### Parallel Requests
```typescript
// Current approach (good):
// 3 useMatomo() hooks in parallel
// All 3 requests go to Matomo at same time
// ✅ Fast
// ⚠️ 3 separate API calls

// Alternative (bulk requests):
// Matomo supports API.getBulkRequest
// Send multiple requests in 1 HTTP call
// ✅ Single request
// ⚠️ More complex code
```

---

## Scaling For Production

### Current Setup (Good for Small-Medium)
```
/api/matomo route
└─ Direct pass-through to Matomo
   └─ Works for <10 concurrent users
```

### For Scaling (Optional Later)
```
/api/matomo route with caching
├─ Redis/In-memory cache
├─ Cache for 5-15 minutes
├─ Handles 100+ concurrent users
└─ Reduces Matomo API load
```

---

## Summary

- **Frontend:** Requests data from own backend
- **Backend:** Adds secret token, forwards to Matomo
- **Matomo:** Returns analytics data
- **Frontend:** Displays beautifully

Token stays secret. Data is secure. User sees nice dashboard. ✅

---

Done! This is exactly how your analytics dashboard works. 📊
