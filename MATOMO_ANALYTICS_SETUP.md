# Matomo Analytics Dashboard

A fully functional analytics dashboard integrated with Matomo that displays real-time website statistics without requiring login.

## Features

- **Real-time Analytics**: View visits, unique visitors, page views, and bounce rates
- **Top Pages**: See which pages get the most traffic
- **Visitor Location**: View visitor distribution by country
- **Flexible Time Periods**: Choose between daily, weekly, monthly, or yearly views
- **Date Range Selection**: Filter by today, yesterday, last 7 days, last 30 days, or last month
- **Secure API**: Backend API route that keeps your Matomo token safe
- **No Login Required**: Public `/statistics` route accessible to everyone

## Setup Instructions

### 1. Get Your Matomo Credentials

You need three pieces of information from your Matomo instance (`https://matomo.globoexpats.com/`):

#### A. Get Your Authentication Token

1. Log in to your Matomo dashboard
2. Go to **Administration** (gear icon)
3. Click **Personal** in the left sidebar
4. Click **Security**
5. Under "Auth tokens", click **Create new token**
6. Give it a name (e.g., "ExpatFrontend API")
7. Copy the generated token

#### B. Get Your Site ID

The Site ID is the numeric identifier for your website:

1. In Matomo admin, go to **Sites** or check the URL bar
2. Usually visible in the dashboard URL or in the site settings
3. Common values are `1`, `2`, etc.

### 2. Configure Environment Variables

Create a `.env.local` file in the root of your project (copy from `.env.local.example`):

```bash
# Matomo Analytics Configuration
NEXT_PUBLIC_MATOMO_URL=https://matomo.globoexpats.com
MATOMO_TOKEN=your_actual_token_here
MATOMO_SITE_ID=1
```

**Important**:

- `NEXT_PUBLIC_MATOMO_URL` is exposed to the frontend (that's ok, it's just the URL)
- `MATOMO_TOKEN` is ONLY used on the backend in `/app/api/matomo/route.ts` - never exposed to frontend
- Never commit `.env.local` to git (it's in `.gitignore`)

### 3. Access the Dashboard

Visit: `http://localhost:3000/statistics`

## How It Works

### API Route (`/app/api/matomo/route.ts`)

This is a secure backend endpoint that:

1. Accepts analytics requests from the frontend
2. Uses your `MATOMO_TOKEN` to authenticate with Matomo's API
3. Fetches data from `https://matomo.globoexpats.com/`
4. Returns the data to the frontend
5. **Never exposes** the token to the frontend

**Usage from frontend:**

```javascript
const params = new URLSearchParams({
  method: 'VisitsSummary.get',
  period: 'day',
  date: 'today',
  idSite: '1',
})
const response = await fetch(`/api/matomo?${params.toString()}`)
```

### Custom Hook (`/hooks/use-matomo.ts`)

Provides a React hook for fetching Matomo data:

```typescript
const { data, loading, error, refetch } = useMatomo({
  method: 'VisitsSummary.get',
  period: 'day',
  date: 'today',
  idSite: '1',
})
```

### Statistics Page (`/app/statistics/page.tsx`)

A public page that displays:

- **Key Metrics**: Visits, unique visitors, page views, bounce rate
- **Top Pages**: Most visited pages with traffic breakdown
- **Visitor Geography**: Distribution of visitors by country
- **Controls**: Select different time periods and date ranges

## Available Matomo API Methods

Here are some useful methods you can use:

```
# Core Metrics
VisitsSummary.get          - Overall visits, visitors, actions

# Pages
Actions.getPageUrls        - Page URLs and traffic
Actions.getPageTitles      - Page titles and traffic
Actions.get                - All actions/pages

# Geography
UserCountry.getCountry     - Visits by country
UserCountry.getContinent   - Visits by continent
UserCountry.getRegion      - Visits by region

# Referrers
Referrers.get              - All referrers
Referrers.getKeywords      - Search keywords
Referrers.getWebsites      - Referrer websites

# Visitors
Live.getLastVisitsDetails  - Real-time visitor data
VisitFrequency.get         - Returning visitor info

# Devices
DevicesDetection.getType   - Desktop/mobile/tablet
DevicesDetection.getBrand  - Device brands
```

To use any of these methods:

```typescript
const { data } = useMatomo({
  method: 'Actions.getPageUrls',
  period: 'month',
  date: 'today',
})
```

## Customization Examples

### Add a New Metric Card

```tsx
<div className="bg-white rounded-lg shadow p-6">
  <p className="text-gray-500 text-sm font-medium">Custom Metric</p>
  <p className="mt-2 text-3xl font-bold text-gray-900">
    {visitsSummary.your_metric?.toLocaleString()}
  </p>
</div>
```

### Fetch Different Time Period

```typescript
const { data } = useMatomo({
  period: 'month', // or 'week', 'year'
  date: 'lastMonth', // or 'last30', 'last7'
})
```

### Add More Analytics Tables

```typescript
const { data: referrers } = useMatomo({
  method: 'Referrers.get',
  period: 'day',
  date: 'today',
})
```

## Troubleshooting

### "Failed to fetch analytics data"

- Check that `MATOMO_TOKEN` is set in `.env.local`
- Verify the token is valid (not expired)
- Check that `MATOMO_SITE_ID` matches your website in Matomo

### "No data available"

- Your site might not have tracked data for that time period
- Try selecting a different date range
- Make sure your Matomo instance is tracking your website

### CORS/Network Errors

- These shouldn't happen because we're using the backend API route
- If they do, check that Matomo is accessible from your server
- Verify no firewall is blocking requests to Matomo

### Token Authentication Fails

- Regenerate the token in Matomo (Administration > Personal > Security)
- Ensure no typos in `.env.local`
- Check that the token has API permissions enabled

## Security Notes

✅ **Safe:**

- `NEXT_PUBLIC_MATOMO_URL` - This is just the base URL, safe to expose
- Analytics data itself - Usually not sensitive
- `/statistics` route - Public access is fine for analytics

⚠️ **Never expose:**

- `MATOMO_TOKEN` - Keep only in server environment variables
- Admin credentials
- Any personal data you might track

## API Documentation Links

- [Matomo Reporting API Docs](https://developer.matomo.org/api-reference/reporting-api)
- [Matomo Getting Started](https://matomo.org/guide/apis/analytics-api/)
- [List of API Methods](https://developer.matomo.org/api-reference/reporting-api#module-api)

## Future Enhancements

Consider adding:

- Date range picker (calendar)
- Export to CSV/PDF
- Custom report builder
- Charts and graphs (Chart.js, Recharts)
- Alerts for traffic spikes
- Comparison between time periods
- Mobile device stats
- Browser stats
- Traffic sources breakdown
