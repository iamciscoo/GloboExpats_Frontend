'use client'

import { useState } from 'react'
import { useMatomo } from '@/hooks/use-matomo'

type Period = 'day' | 'week' | 'month' | 'year'
type DateRange = 'today' | 'yesterday' | 'last7' | 'last30' | 'lastMonth'
type ActiveSection = 'overview' | 'audience' | 'technology' | 'content' | 'realtime'

export default function StatisticsPage() {
  const [period, setPeriod] = useState<Period>('day')
  const [dateRange, setDateRange] = useState<DateRange>('today')
  const [activeSection, setActiveSection] = useState<ActiveSection>('overview')

  // Map our UI date values to Matomo API date format
  const getMatomoDate = (range: DateRange): string => {
    const dateMap: Record<DateRange, string> = {
      today: 'today',
      yesterday: 'yesterday',
      last7: 'last7',
      last30: 'last30',
      lastMonth: 'lastMonth',
    }
    return dateMap[range]
  }

  // Fetch main analytics data
  const {
    data: visitsSummary,
    loading: loadingVisits,
    error: errorVisits,
  } = useMatomo({
    method: 'VisitsSummary.get',
    period,
    date: getMatomoDate(dateRange),
  })

  // Fetch page URLs data
  const {
    data: pageUrls,
    loading: loadingPages,
    error: errorPages,
  } = useMatomo({
    method: 'Actions.getPageUrls',
    period,
    date: getMatomoDate(dateRange),
  })

  // Fetch countries data
  const {
    data: countries,
    loading: loadingCountries,
    error: errorCountries,
  } = useMatomo({
    method: 'UserCountry.getCountry',
    period,
    date: getMatomoDate(dateRange),
  })

  // Device & Technology Analytics
  const { data: deviceTypes, loading: loadingDeviceTypes } = useMatomo({
    method: 'DevicesDetection.getType',
    period,
    date: getMatomoDate(dateRange),
  })

  const { data: browsers, loading: loadingBrowsers } = useMatomo({
    method: 'UserSettings.getBrowser',
    period,
    date: getMatomoDate(dateRange),
  })

  const { data: operatingSystems, loading: loadingOS } = useMatomo({
    method: 'UserSettings.getOS',
    period,
    date: getMatomoDate(dateRange),
  })

  // Real-Time Data
  const { data: liveVisitors, loading: loadingLive } = useMatomo({
    method: 'Live.getCounters',
    idSite: '1',
  })

  const { data: recentVisits, loading: loadingRecent } = useMatomo({
    method: 'Live.getLastVisitsDetails',
    period: 'day',
    date: 'today',
    filter_limit: '10',
  })

  // Advanced Metrics
  const { data: pageTitles, loading: loadingPageTitles } = useMatomo({
    method: 'Actions.getPageTitles',
    period,
    date: getMatomoDate(dateRange),
  })

  const { data: entryPages, loading: loadingEntryPages } = useMatomo({
    method: 'Actions.getEntryPageUrls',
    period,
    date: getMatomoDate(dateRange),
  })

  const { data: exitPages, loading: loadingExitPages } = useMatomo({
    method: 'Actions.getExitPageUrls',
    period,
    date: getMatomoDate(dateRange),
  })

  // Geographic Data
  const { data: continents, loading: loadingContinents } = useMatomo({
    method: 'UserCountry.getContinent',
    period,
    date: getMatomoDate(dateRange),
  })

  const { data: cities, loading: loadingCities } = useMatomo({
    method: 'UserCountry.getCity',
    period,
    date: getMatomoDate(dateRange),
  })

  const { data: languages, loading: loadingLanguages } = useMatomo({
    method: 'UserLanguage.getLanguage',
    period,
    date: getMatomoDate(dateRange),
  })

  const isLoading =
    loadingVisits ||
    loadingPages ||
    loadingCountries ||
    loadingDeviceTypes ||
    loadingBrowsers ||
    loadingOS ||
    loadingLive ||
    loadingRecent ||
    loadingPageTitles ||
    loadingEntryPages ||
    loadingExitPages ||
    loadingContinents ||
    loadingCities ||
    loadingLanguages

  const hasError = errorVisits || errorPages || errorCountries

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-gray-600">Real-time statistics and insights</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="period-select"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Period
              </label>
              <select
                id="period-select"
                value={period}
                onChange={(e) => setPeriod(e.target.value as Period)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="date-range-select"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Date Range
              </label>
              <select
                id="date-range-select"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as DateRange)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="last7">Last 7 Days</option>
                <option value="last30">Last 30 Days</option>
                <option value="lastMonth">Last Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Layout with Sidebar */}
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Analytics</h2>
              </div>
              <nav className="p-4 space-y-2">
                <button
                  onClick={() => setActiveSection('overview')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'overview'
                      ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-500'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">📊</span>
                    <div>
                      <div className="font-medium">Overview</div>
                      <div className="text-sm opacity-75">Key metrics</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveSection('audience')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'audience'
                      ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-500'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">👥</span>
                    <div>
                      <div className="font-medium">Audience</div>
                      <div className="text-sm opacity-75">Geography & demographics</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveSection('technology')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'technology'
                      ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-500'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">💻</span>
                    <div>
                      <div className="font-medium">Technology</div>
                      <div className="text-sm opacity-75">Devices & browsers</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveSection('content')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'content'
                      ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-500'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">📄</span>
                    <div>
                      <div className="font-medium">Content</div>
                      <div className="text-sm opacity-75">Pages & engagement</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveSection('realtime')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'realtime'
                      ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-500'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">⚡</span>
                    <div>
                      <div className="font-medium">Real-time</div>
                      <div className="text-sm opacity-75">Live activity</div>
                    </div>
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Error Message */}
            {hasError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
                <p className="text-red-800">
                  <strong>Error:</strong> {errorVisits || errorPages || errorCountries}
                </p>
                <p className="text-sm text-red-600 mt-2">
                  Make sure you have set the environment variables: MATOMO_TOKEN and MATOMO_SITE_ID
                </p>
              </div>
            )}

            {/* Loading State */}
            {isLoading && !hasError && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="ml-4 text-gray-600">Loading analytics data...</p>
              </div>
            )}

            {/* Content Sections */}
            {!isLoading && visitsSummary && (
              <>
                {/* Overview Section */}
                {activeSection === 'overview' && (
                  <div className="space-y-8">
                    {/* Main Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {/* Visits */}
                      <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-500 text-sm font-medium">Visits</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">
                              {visitsSummary.nb_visits?.toLocaleString() || '0'}
                            </p>
                          </div>
                          <div className="bg-blue-100 rounded-full p-3">
                            <svg
                              className="w-6 h-6 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Unique Visitors */}
                      <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-500 text-sm font-medium">Unique Visitors</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">
                              {visitsSummary.nb_uniq_visitors?.toLocaleString() || '0'}
                            </p>
                          </div>
                          <div className="bg-green-100 rounded-full p-3">
                            <svg
                              className="w-6 h-6 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4.354a4 4 0 110 5.292M15 12H9m6 0a6 6 0 11-12 0 6 6 0 0112 0z"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Page Views */}
                      <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-500 text-sm font-medium">Page Views</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">
                              {visitsSummary.nb_actions?.toLocaleString() || '0'}
                            </p>
                          </div>
                          <div className="bg-purple-100 rounded-full p-3">
                            <svg
                              className="w-6 h-6 text-purple-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Bounce Rate */}
                      <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-500 text-sm font-medium">Bounce Rate</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">
                              {visitsSummary.bounce_rate
                                ? `${parseFloat(visitsSummary.bounce_rate.toString()).toFixed(1)}%`
                                : '0%'}
                            </p>
                          </div>
                          <div className="bg-orange-100 rounded-full p-3">
                            <svg
                              className="w-6 h-6 text-orange-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Top Pages */}
                    {pageUrls && Array.isArray(pageUrls) && pageUrls.length > 0 && (
                      <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                          <h2 className="text-lg font-semibold text-gray-900">Top Pages</h2>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                  Page
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                  Visits
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                  Unique Visitors
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                  Bounce Rate
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {pageUrls.slice(0, 10).map((page: any, index: number) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm text-gray-900">
                                    <a
                                      href={page.label}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 truncate block"
                                      title={page.label}
                                    >
                                      {page.label.length > 50
                                        ? `${page.label.substring(0, 50)}...`
                                        : page.label}
                                    </a>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-600">
                                    {page.nb_visits?.toLocaleString()}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-600">
                                    {page.nb_uniq_visitors?.toLocaleString()}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-600">
                                    {page.bounce_rate
                                      ? `${parseFloat(page.bounce_rate.toString()).toFixed(1)}%`
                                      : 'N/A'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Audience Section */}
                {activeSection === 'audience' && (
                  <div className="space-y-8">
                    {/* Top Countries */}
                    {countries && Array.isArray(countries) && countries.length > 0 && (
                      <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                          <h2 className="text-lg font-semibold text-gray-900">
                            Visitors by Country
                          </h2>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                  Country
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                  Visits
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                  Unique Visitors
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                  % of Total
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {countries.slice(0, 10).map((country: any, index: number) => {
                                const percentage = visitsSummary.nb_visits
                                  ? ((country.nb_visits / visitsSummary.nb_visits) * 100).toFixed(1)
                                  : '0'
                                return (
                                  <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                      {country.label}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                      {country.nb_visits?.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                      {country.nb_uniq_visitors?.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                      {percentage}%
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Geographic Data */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Continents */}
                      {continents && Array.isArray(continents) && continents.length > 0 && (
                        <div className="bg-white rounded-lg shadow">
                          <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Visitors by Continent
                            </h3>
                          </div>
                          <div className="p-6">
                            <ul className="space-y-3">
                              {continents.slice(0, 6).map((continent: any, index: number) => (
                                <li key={index} className="flex justify-between items-center">
                                  <span className="text-sm text-gray-700">{continent.label}</span>
                                  <span className="text-sm font-medium text-gray-900">
                                    {continent.nb_visits?.toLocaleString()}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* Cities */}
                      {cities && Array.isArray(cities) && cities.length > 0 && (
                        <div className="bg-white rounded-lg shadow">
                          <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Top Cities</h3>
                          </div>
                          <div className="p-6">
                            <ul className="space-y-3">
                              {cities.slice(0, 8).map((city: any, index: number) => (
                                <li key={index} className="flex justify-between items-center">
                                  <span className="text-sm text-gray-700">{city.label}</span>
                                  <span className="text-sm font-medium text-gray-900">
                                    {city.nb_visits?.toLocaleString()}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* Languages */}
                      {languages && Array.isArray(languages) && languages.length > 0 && (
                        <div className="bg-white rounded-lg shadow">
                          <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Browser Languages
                            </h3>
                          </div>
                          <div className="p-6">
                            <ul className="space-y-3">
                              {languages.slice(0, 6).map((lang: any, index: number) => (
                                <li key={index} className="flex justify-between items-center">
                                  <span className="text-sm text-gray-700">{lang.label}</span>
                                  <span className="text-sm font-medium text-gray-900">
                                    {lang.nb_visits?.toLocaleString()}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Technology Section */}
                {activeSection === 'technology' && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Device Types */}
                      {deviceTypes && Array.isArray(deviceTypes) && deviceTypes.length > 0 && (
                        <div className="bg-white rounded-lg shadow p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Types</h3>
                          <div className="space-y-4">
                            {deviceTypes.slice(0, 3).map((device: any, index: number) => (
                              <div key={index}>
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-medium text-gray-900 capitalize">
                                    {device.label === 'Desktop'
                                      ? '💻 Desktop'
                                      : device.label === 'Smartphone'
                                        ? '📱 Mobile'
                                        : device.label === 'Tablet'
                                          ? '📱 Tablet'
                                          : device.label === 'Feature phone'
                                            ? '📱 Feature Phone'
                                            : device.label === 'Phablet'
                                              ? '📱 Phablet'
                                              : `📱 ${device.label}`}
                                  </span>
                                  <span className="text-sm text-gray-600">
                                    {device.nb_visits?.toLocaleString()}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{
                                      width: `${
                                        deviceTypes
                                          .filter((d: any) => d.nb_visits > 0)
                                          .reduce((sum: number, d: any) => sum + d.nb_visits, 0) > 0
                                          ? (device.nb_visits /
                                              deviceTypes
                                                .filter((d: any) => d.nb_visits > 0)
                                                .reduce(
                                                  (sum: number, d: any) => sum + d.nb_visits,
                                                  0
                                                )) *
                                            100
                                          : 0
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Browsers */}
                      {browsers && Array.isArray(browsers) && browsers.length > 0 && (
                        <div className="bg-white rounded-lg shadow p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Browsers</h3>
                          <div className="space-y-3">
                            {browsers.slice(0, 5).map((browser: any, index: number) => (
                              <div key={index} className="flex justify-between items-center">
                                <span className="text-sm text-gray-700">{browser.label}</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-20 bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-green-600 h-2 rounded-full"
                                      style={{
                                        width: `${
                                          browsers[0]?.nb_visits
                                            ? (browser.nb_visits / browsers[0].nb_visits) * 100
                                            : 0
                                        }%`,
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-medium text-gray-900 w-12">
                                    {browser.nb_visits?.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Operating Systems */}
                      {operatingSystems &&
                        Array.isArray(operatingSystems) &&
                        operatingSystems.length > 0 && (
                          <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                              Operating Systems
                            </h3>
                            <ul className="space-y-3">
                              {operatingSystems.slice(0, 5).map((os: any, index: number) => (
                                <li key={index} className="flex justify-between text-sm">
                                  <span className="text-gray-700">{os.label}</span>
                                  <span className="font-medium text-gray-900">
                                    {os.nb_visits?.toLocaleString()}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </div>
                  </div>
                )}

                {/* Content Section */}
                {activeSection === 'content' && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Page Titles */}
                      {pageTitles && Array.isArray(pageTitles) && pageTitles.length > 0 && (
                        <div className="bg-white rounded-lg shadow">
                          <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Top Page Titles</h3>
                          </div>
                          <div className="p-6">
                            <ul className="space-y-3">
                              {pageTitles.slice(0, 5).map((page: any, index: number) => (
                                <li key={index} className="flex justify-between items-center">
                                  <span
                                    className="text-sm text-gray-700 truncate flex-1 mr-2"
                                    title={page.label}
                                  >
                                    {page.label.length > 30
                                      ? `${page.label.substring(0, 30)}...`
                                      : page.label}
                                  </span>
                                  <span className="text-sm font-medium text-gray-900">
                                    {page.nb_visits?.toLocaleString()}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* Entry Pages */}
                      {entryPages && Array.isArray(entryPages) && entryPages.length > 0 && (
                        <div className="bg-white rounded-lg shadow">
                          <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Entry Pages</h3>
                          </div>
                          <div className="p-6">
                            <ul className="space-y-3">
                              {entryPages.slice(0, 5).map((page: any, index: number) => (
                                <li key={index} className="flex justify-between items-center">
                                  <span
                                    className="text-sm text-gray-700 truncate flex-1 mr-2"
                                    title={page.label}
                                  >
                                    {page.label.length > 30
                                      ? `${page.label.substring(0, 30)}...`
                                      : page.label}
                                  </span>
                                  <span className="text-sm font-medium text-gray-900">
                                    {page.nb_visits?.toLocaleString()}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* Exit Pages */}
                      {exitPages && Array.isArray(exitPages) && exitPages.length > 0 && (
                        <div className="bg-white rounded-lg shadow">
                          <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Exit Pages</h3>
                          </div>
                          <div className="p-6">
                            <ul className="space-y-3">
                              {exitPages.slice(0, 5).map((page: any, index: number) => (
                                <li key={index} className="flex justify-between items-center">
                                  <span
                                    className="text-sm text-gray-700 truncate flex-1 mr-2"
                                    title={page.label}
                                  >
                                    {page.label.length > 30
                                      ? `${page.label.substring(0, 30)}...`
                                      : page.label}
                                  </span>
                                  <span className="text-sm font-medium text-gray-900">
                                    {page.nb_visits?.toLocaleString()}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Real-time Section */}
                {activeSection === 'realtime' && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Live Visitors */}
                      {liveVisitors && (
                        <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-lg shadow p-6 text-white">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-green-100 text-sm font-medium">
                                Live Visitors (Last 30 min)
                              </p>
                              <p className="mt-2 text-4xl font-bold">{liveVisitors.visits || 0}</p>
                              <p className="text-green-100 text-sm mt-1">
                                Active visitors right now
                              </p>
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

                      {/* Recent Visits */}
                      {recentVisits && Array.isArray(recentVisits) && recentVisits.length > 0 && (
                        <div className="bg-white rounded-lg shadow p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Recent Visitor Activity
                          </h3>
                          <div className="space-y-3">
                            {recentVisits.slice(0, 5).map((visit: any, index: number) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-medium text-blue-600">
                                      {visit.countryCode || '🌍'}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {visit.visitorId?.substring(0, 8) || 'Anonymous'}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      {visit.lastActionDateTime
                                        ? new Date(visit.lastActionDateTime).toLocaleTimeString()
                                        : 'Unknown time'}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium text-gray-900">
                                    {visit.actions || 0} actions
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {visit.visitDuration || 0}s
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Empty State */}
            {!isLoading && !visitsSummary && !hasError && (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500">No data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
