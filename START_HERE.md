# 🚀 QUICK START - Matomo Analytics Dashboard

## What You Got

✅ Public analytics dashboard at `/statistics` (no login!)  
✅ Secure backend API at `/api/matomo`  
✅ React hook for easy data fetching  
✅ Beautiful responsive UI

---

## 3-Step Setup

### 1️⃣ Get Your Credentials (5 min)

```
Go to: https://matomo.globoexpats.com/
Log in → Administration → Personal → Security
- Create new token (copy it)
- Note your Site ID (usually 1)
```

### 2️⃣ Create `.env.local`

```bash
# Copy from .env.local.example, then add:
NEXT_PUBLIC_MATOMO_URL=https://matomo.globoexpats.com
MATOMO_TOKEN=<your_token_here>
MATOMO_SITE_ID=1
```

### 3️⃣ Run & View

```bash
npm run dev
# Visit: http://localhost:3000/statistics
```

**Done!** 🎉

---

## What You Can See

| Section         | What it shows                                      |
| --------------- | -------------------------------------------------- |
| 4 Cards         | Visits, unique visitors, page views, bounce rate   |
| Top Pages Table | Most visited pages with traffic                    |
| Geography Table | Which countries visitors come from                 |
| Controls        | Change period (day/week/month/year) and date range |

---

## How to Add More Analytics

1. **Open** `/app/statistics/page.tsx`
2. **Add hook** for new data:
   ```typescript
   const { data } = useMatomo({
     method: 'Referrers.getKeywords', // Change this
     period,
     date: getMatomoDate(dateRange),
   })
   ```
3. **Add to JSX** - copy a table and modify it

See `ANALYTICS_EXAMPLES.md` for ready-to-use code!

---

## Available Methods

```
VisitsSummary.get              - Visits, visitors, actions
Actions.getPageUrls            - Page traffic
UserCountry.getCountry         - Visitor countries
Referrers.getKeywords          - Search keywords
DevicesDetection.getType       - Desktop/mobile/tablet
DevicesDetection.getBrowser    - Browser stats
Live.getLastVisitsDetails      - Real-time visitors
```

---

## File Guide

| File                        | Purpose                        |
| --------------------------- | ------------------------------ |
| `/app/api/matomo/route.ts`  | Backend API (keeps token safe) |
| `/hooks/use-matomo.ts`      | React hook for queries         |
| `/app/statistics/page.tsx`  | Dashboard page (public)        |
| `ANALYTICS_QUICK_START.md`  | Quick overview                 |
| `MATOMO_ANALYTICS_SETUP.md` | Complete setup guide           |
| `MATOMO_API_EXPLAINED.md`   | How Matomo works               |
| `ANALYTICS_EXAMPLES.md`     | Code examples                  |

---

## Troubleshooting

| Problem             | Solution                                                       |
| ------------------- | -------------------------------------------------------------- |
| No data showing     | Check `.env.local` values, verify Matomo is tracking your site |
| Token error         | Regenerate token in Matomo: Admin → Personal → Security        |
| Wrong Site ID       | Check Matomo dashboard to find correct ID                      |
| "No data available" | Try different date range (too recent data may not exist)       |

---

## Security ✅

- Your token is **NEVER** exposed to frontend
- Backend keeps it in `.env.local` only
- `/statistics` URL is public and safe to share
- No personal data is at risk

---

## Common Customizations

### Change colors

Edit Tailwind classes in `/app/statistics/page.tsx`

### Add charts

Install `npm install recharts` and use data in charts

### Auto-refresh

Call `refetch()` every 30 seconds

### Custom period logic

Modify `getMatomoDate()` function

---

## Next Steps

1. ✅ Set up `.env.local`
2. ✅ Visit `/statistics`
3. 📖 Read `MATOMO_ANALYTICS_SETUP.md` for details
4. 💻 Add custom sections using `ANALYTICS_EXAMPLES.md`

---

## Get Help

- **Understanding API?** → `MATOMO_API_EXPLAINED.md`
- **Need examples?** → `ANALYTICS_EXAMPLES.md`
- **Full setup guide?** → `MATOMO_ANALYTICS_SETUP.md`
- **Implementation details?** → `IMPLEMENTATION_SUMMARY.md`

---

**Ready to view your analytics?**

```bash
npm run dev
# Then visit: http://localhost:3000/statistics
```

Enjoy! 📊
