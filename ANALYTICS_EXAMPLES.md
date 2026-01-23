// Example customizations for the Matomo Analytics Dashboard
// Copy and paste these into /app/statistics/page.tsx to add new features

// ============================================================
// EXAMPLE 1: Add Search Keywords Section
// ============================================================

// Add this hook call in your StatisticsPage component:
/*
const { data: keywords, loading: loadingKeywords } = useMatomo({
  method: 'Referrers.getKeywords',
  period,
  date: getMatomoDate(dateRange),
})
*/

// Add this component after the countries section:
/*
{keywords && Array.isArray(keywords) && keywords.length > 0 && (
  <div className="bg-white rounded-lg shadow mb-8">
    <div className="px-6 py-4 border-b border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900">Top Search Keywords</h2>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
              Keyword
            </th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
              Visits
            </th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
              Unique Visitors
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {keywords.slice(0, 10).map((keyword: any, index: number) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm text-gray-900">{keyword.label}</td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {keyword.nb_visits?.toLocaleString()}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {keyword.nb_uniq_visitors?.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}
*/

// ============================================================
// EXAMPLE 2: Add Device Type Statistics
// ============================================================

/*
const { data: devices } = useMatomo({
  method: 'DevicesDetection.getType',
  period,
  date: getMatomoDate(dateRange),
})
*/

// Add this metric card:
/*
{devices && Array.isArray(devices) && devices[0] && (
  <div className="bg-white rounded-lg shadow p-6">
    <div>
      <p className="text-gray-500 text-sm font-medium mb-4">Devices</p>
      <div className="space-y-3">
        {devices.slice(0, 3).map((device: any, index: number) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {device.label === 'desktop'
                ? '💻 Desktop'
                : device.label === 'mobile'
                ? '📱 Mobile'
                : '📱 Tablet'}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${(device.nb_visits / devices[0].nb_visits) * 100}%`,
                  }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-900 w-12">
                {((device.nb_visits / devices[0].nb_visits) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)}
*/

// ============================================================
// EXAMPLE 3: Add Browser Statistics
// ============================================================

/*
const { data: browsers } = useMatomo({
  method: 'DevicesDetection.getBrowser',
  period,
  date: getMatomoDate(dateRange),
})
*/

// Add this section:
/*
{browsers && Array.isArray(browsers) && browsers.length > 0 && (
  <div className="bg-white rounded-lg shadow">
    <div className="px-6 py-4 border-b border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900">Browser Distribution</h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <div className="space-y-3">
        {browsers.slice(0, 5).map((browser: any, index: number) => (
          <div key={index}>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">{browser.label}</span>
              <span className="text-sm text-gray-600">
                {browser.nb_visits?.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                style={{
                  width: `${(browser.nb_visits / browsers[0].nb_visits) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)}
*/

// ============================================================
// EXAMPLE 4: Add Operating System Stats
// ============================================================

/*
const { data: osStats } = useMatomo({
  method: 'DevicesDetection.getOS',
  period,
  date: getMatomoDate(dateRange),
})
*/

// Add this simple card:
/*
{osStats && Array.isArray(osStats) && osStats.length > 0 && (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Operating Systems</h3>
    <ul className="space-y-3">
      {osStats.slice(0, 5).map((os: any, index: number) => (
        <li key={index} className="flex justify-between text-sm">
          <span className="text-gray-700">{os.label}</span>
          <span className="font-medium text-gray-900">{os.nb_visits?.toLocaleString()}</span>
        </li>
      ))}
    </ul>
  </div>
)}
*/

// ============================================================
// EXAMPLE 5: Add Real-Time Live Visitors
// ============================================================

/*
const { data: liveVisitors } = useMatomo({
  method: 'Live.getCounters',
  idSite: '1', // your site ID
})
*/

// Simple live counter card:
/*
{liveVisitors && (
  <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-lg shadow p-6 text-white">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-green-100 text-sm font-medium">Live Visitors (Last 30 min)</p>
        <p className="mt-2 text-4xl font-bold">{liveVisitors.visits || 0}</p>
      </div>
      <div className="flex items-center justify-center w-16 h-16">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 bg-green-300 rounded-full animate-pulse"></div>
          <div className="absolute inset-2 bg-green-600 rounded-full"></div>
        </div>
      </div>
    </div>
  </div>
)}
*/

// ============================================================
// EXAMPLE 6: Add Referrer Websites Section
// ============================================================

/*
const { data: referrers } = useMatomo({
  method: 'Referrers.getWebsites',
  period,
  date: getMatomoDate(dateRange),
})
*/

// Add this table:
/*
{referrers && Array.isArray(referrers) && referrers.length > 0 && (
  <div className="bg-white rounded-lg shadow">
    <div className="px-6 py-4 border-b border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900">Top Referrer Websites</h2>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
              Website
            </th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
              Visits
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {referrers.slice(0, 10).map((ref: any, index: number) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm">
                <a
                  href={ref.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  {ref.label}
                </a>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {ref.nb_visits?.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}
*/

// ============================================================
// EXAMPLE 7: Custom Quick Stat Cards
// ============================================================

/*
Helper function to create stat cards:

function StatCard({
  title,
  value,
  icon,
  bgColor = 'blue',
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  bgColor?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
}) {
  const bgColorMap = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    purple: 'bg-purple-100',
    orange: 'bg-orange-100',
    red: 'bg-red-100',
  }
  
  const iconColorMap = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
        <div className={`${bgColorMap[bgColor]} rounded-full p-3`}>
          <div className={`${iconColorMap[bgColor]}`}>{icon}</div>
        </div>
      </div>
    </div>
  )
}

// Usage:
<StatCard
  title="Bounce Rate"
  value="45.2%"
  bgColor="orange"
  icon={<YourSVGIcon />}
/>
*/

// ============================================================
// EXAMPLE 8: Add Time-Based Comparison
// ============================================================

// Use Matomo's date range feature to compare periods:
/*
const { data: todayData } = useMatomo({
  method: 'VisitsSummary.get',
  period: 'day',
  date: 'today',
})

const { data: yesterdayData } = useMatomo({
  method: 'VisitsSummary.get',
  period: 'day',
  date: 'yesterday',
})

// Calculate percentage change
const visitChange = todayData?.nb_visits && yesterdayData?.nb_visits
  ? (
      ((todayData.nb_visits - yesterdayData.nb_visits) / yesterdayData.nb_visits) *
      100
    ).toFixed(1)
  : '0'

// Display with trend indicator
<div className="flex items-center gap-2">
  <span className="text-3xl font-bold">
    {todayData?.nb_visits?.toLocaleString()}
  </span>
  <span className={visitChange > '0' ? 'text-green-600' : 'text-red-600'}>
    {visitChange > '0' ? '↑' : '↓'} {Math.abs(parseFloat(visitChange))}%
  </span>
</div>
*/

// ============================================================
// Usage Tips
// ============================================================

/*
1. All these examples follow the same pattern:
   - Use useMatomo() hook with method name
   - Check if data exists and is an array
   - Map over the data and display it

2. Available Matomo methods:
   https://developer.matomo.org/api-reference/reporting-api

3. To debug data structure:
   console.log('Data:', data) in your component

4. Performance tip: Consider caching API responses
   to avoid fetching on every render

5. For charts, install recharts:
   npm install recharts
   Then use with your data

6. Always handle loading and error states
   (already done in the main dashboard)
*/
