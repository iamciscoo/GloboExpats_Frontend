# Understanding Matomo API Documentation - Simple Guide

The Matomo documentation can be confusing. This guide breaks it down in simple terms.

## Basic Concepts

### 1. What is an API?
Think of Matomo's API as a waiter at a restaurant:
- You (the frontend) make a request: "Show me visitors from last 7 days"
- The waiter (API) takes your order to the kitchen (Matomo)
- The kitchen prepares the data and gives you a plate (JSON response)

### 2. The REST API
Matomo uses a REST API, which means you make HTTP requests to get data.

```
Simple request format:
https://matomo.globoexpats.com/index.php?module=API&method=VisitsSummary.get&idSite=1&period=day&date=today&format=json&token_auth=YOUR_TOKEN
```

Breaking it down:
- `module=API` - We're calling the API (always this)
- `method=VisitsSummary.get` - The data we want (visits, visitors, actions, etc.)
- `idSite=1` - Which website (1 = first website in your Matomo)
- `period=day` - Group by day (or week, month, year)
- `date=today` - What date (or date range)
- `format=json` - How to return it (json, xml, csv, etc.)
- `token_auth=YOUR_TOKEN` - Your authentication

### 3. Standard Parameters (Used in Every Call)

These are the 4 main parameters you'll always use:

| Parameter | Options | Meaning |
|-----------|---------|---------|
| `idSite` | 1, 2, 3... | Which website to analyze |
| `period` | day, week, month, year | How to group the data |
| `date` | today, yesterday, YYYY-MM-DD | Which date(s) |
| `format` | json, xml, csv, html | How to return it |

**Common date values:**
- `today` - Today only
- `yesterday` - Yesterday only
- `last7` - Last 7 days
- `last30` - Last 30 days
- `lastMonth` - Last calendar month
- `2024-01-01,2024-01-31` - Date range

### 4. API Methods (What Data You Can Get)

Each `method` returns different data:

**Top-Level Metrics:**
```
VisitsSummary.get
Returns: visits, unique visitors, actions (page views), bounce rate, time spent
```

**Page & Action Data:**
```
Actions.getPageUrls
Returns: Which pages got how many visits

Actions.getPageTitles
Returns: Which page titles got how many visits

Actions.get
Returns: All actions/pages combined
```

**Visitor Geography:**
```
UserCountry.getCountry
Returns: Which countries your visitors come from

UserCountry.getContinent
Returns: Which continents your visitors come from
```

**Traffic Sources (Where visitors come from):**
```
Referrers.getKeywords
Returns: What search terms people used

Referrers.getWebsites
Returns: Which websites linked to you

Referrers.getCampaigns
Returns: Campaign tracking data
```

**Device & Browser Info:**
```
DevicesDetection.getType
Returns: Desktop, Mobile, Tablet splits

DevicesDetection.getBrowser
Returns: Chrome, Firefox, Safari, etc.

DevicesDetection.getOS
Returns: Windows, Mac, Linux, iOS, Android
```

**Real-Time:**
```
Live.getLastVisitsDetails
Returns: Individual visitor details (real-time)

Live.getCounters
Returns: Count of visitors in last N minutes
```

---

## How We Use It in Your App

### Simple Example: Get Today's Stats

**API URL (What we actually call):**
```
/api/matomo?method=VisitsSummary.get&period=day&date=today&idSite=1
```

**What happens:**
1. Your frontend calls this route
2. Backend secretly adds your `token_auth` (hidden from frontend)
3. Backend calls Matomo
4. Matomo returns JSON data
5. Your frontend displays it

**In your React component:**
```typescript
const { data } = useMatomo({
  method: 'VisitsSummary.get',
  period: 'day',
  date: 'today',
  idSite: '1',
})

// data will have:
// - nb_visits: 150
// - nb_uniq_visitors: 120
// - nb_actions: 450
// - bounce_rate: "45.5%"
```

---

## Common Use Cases

### 1. "Show me how many people visited today"
```typescript
const { data } = useMatomo({
  method: 'VisitsSummary.get',
  period: 'day',
  date: 'today',
})

console.log(data.nb_visits) // e.g., 150
```

### 2. "Show me the top 5 pages"
```typescript
const { data } = useMatomo({
  method: 'Actions.getPageUrls',
  period: 'day',
  date: 'today',
})

// data is an array:
// [
//   { label: '/home', nb_visits: 100 },
//   { label: '/products', nb_visits: 80 },
//   ...
// ]

data.slice(0, 5) // Get top 5
```

### 3. "Show me where visitors are from"
```typescript
const { data } = useMatomo({
  method: 'UserCountry.getCountry',
  period: 'month',
  date: 'today',
})

// data is an array of countries:
// [
//   { label: 'United States', nb_visits: 500 },
//   { label: 'Germany', nb_visits: 200 },
//   ...
// ]
```

### 4. "Show me visits trend over 30 days"
```typescript
const { data } = useMatomo({
  method: 'VisitsSummary.get',
  period: 'day', // Get daily data
  date: 'last30', // For last 30 days
})

// Returns 30 data points, one for each day
// Perfect for charting!
```

### 5. "Show me search keywords"
```typescript
const { data } = useMatomo({
  method: 'Referrers.getKeywords',
  period: 'month',
  date: 'today',
})

// data is an array of keywords:
// [
//   { label: 'best products', nb_visits: 50 },
//   { label: 'how to buy', nb_visits: 30 },
//   ...
// ]
```

---

## Response Data Types

Most API calls return one of these:

### Type 1: Single Object
```typescript
// For VisitsSummary.get
{
  nb_visits: 150,
  nb_uniq_visitors: 120,
  nb_actions: 450,
  bounce_count: 45,
  bounce_rate: "30.0%",
  ...
}
```

### Type 2: Array of Objects
```typescript
// For Actions.getPageUrls, UserCountry.getCountry, etc.
[
  { label: 'page or value', nb_visits: 100, nb_uniq_visitors: 80, ... },
  { label: 'page or value', nb_visits: 50, nb_uniq_visitors: 40, ... },
  ...
]
```

### Type 3: Nested Data (with subtables)
```typescript
// When method supports subtables (hierarchical data)
[
  {
    label: 'parent item',
    nb_visits: 100,
    subtable: [
      { label: 'child item', nb_visits: 50 },
      { label: 'child item', nb_visits: 50 },
    ]
  }
]
```

Our hook handles all three automatically.

---

## Important Metrics (What the numbers mean)

| Metric | Meaning |
|--------|---------|
| `nb_visits` | Number of visits (a visit = browsing session) |
| `nb_uniq_visitors` | Number of unique people (same person, multiple visits = 1) |
| `nb_actions` | Page views + file downloads + outlink clicks |
| `bounce_count` | Visits where person only viewed 1 page then left |
| `bounce_rate` | Percentage of visits that bounced |
| `sum_visit_length` | Total seconds spent on site |
| `conversion_rate` | Percentage of visits that converted (achieved goal) |
| `revenue` | Revenue from e-commerce transactions |

---

## Common Mistakes (And How to Fix Them)

### Mistake 1: Wrong date format
```typescript
// ❌ Wrong
date: '2024/01/15'

// ✅ Correct
date: '2024-01-15'
```

### Mistake 2: Forgetting token_auth
```typescript
// ❌ This won't work (no auth)
const url = 'https://matomo.globoexpats.com/index.php?...'

// ✅ This is handled in /api/matomo route
// Frontend doesn't need to add token, backend does it
```

### Mistake 3: Using wrong idSite
```typescript
// ❌ If your site ID is 1, using 2 gets wrong data
idSite: 2

// ✅ Check Matomo admin to find correct ID
idSite: 1
```

### Mistake 4: Expecting array when getting single object
```typescript
// ✅ Always check type first
if (Array.isArray(data)) {
  // It's an array
} else if (typeof data === 'object') {
  // It's a single object
}
```

---

## Getting More Data From API

### Option 1: More Rows
By default, Matomo returns top 100 rows. To get more:

```typescript
// The hook passes this to API backend
// Backend can add to URL:
&filter_limit=500  // Get top 500 instead of 100
&filter_limit=-1   // Get ALL rows (careful, could be huge)
```

### Option 2: Specific Date Range
Instead of predefined dates, use custom ranges:

```typescript
{
  period: 'range',
  date: '2024-01-01,2024-01-31', // Start date, End date
}
```

### Option 3: Filter Results
```typescript
// Get only pages containing "product"
&label=product

// Get visitors from specific country
&segment=country==US

// More complex: visitors from US OR Canada AND on desktop
&segment=country==US,country==CA;deviceType==desktop
```

---

## Next Steps

1. **Look at your data:**
   - Visit `/statistics` and open browser DevTools (F12)
   - Check Console to see what data API returns
   - Understand the structure

2. **Experiment with methods:**
   - Try different API methods
   - See what data each returns
   - Find what's useful for your goals

3. **Build custom reports:**
   - Use ANALYTICS_EXAMPLES.md
   - Combine multiple API calls
   - Create the dashboards you need

4. **Read official docs:**
   - https://developer.matomo.org/api-reference/reporting-api
   - For detailed parameter documentation
   - For advanced features

---

## Quick Reference

**All the URLs we generate look like:**
```
/api/matomo?method=[METHOD]&period=[PERIOD]&date=[DATE]&idSite=[SITE_ID]
```

**Common METHOD values:**
```
VisitsSummary.get
Actions.getPageUrls
UserCountry.getCountry
Referrers.getKeywords
DevicesDetection.getType
DevicesDetection.getBrowser
DevicesDetection.getOS
Live.getLastVisitsDetails
```

**Common PERIOD values:**
```
day, week, month, year, range
```

**Common DATE values:**
```
today, yesterday, last7, last30, lastMonth
YYYY-MM-DD (specific date)
YYYY-MM-DD,YYYY-MM-DD (date range with period=range)
```

---

## Questions?

1. **Data not showing?** Check `/api/matomo` returns data in browser Network tab
2. **Wrong numbers?** Verify `idSite` matches your website
3. **Want different data?** Find method in Matomo API reference
4. **Performance issues?** Cache responses or reduce API calls

Good luck! 📊
