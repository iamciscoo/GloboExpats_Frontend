'use client'

import React from 'react'
import { Globe, MapPin, Languages, Flag, Map } from 'lucide-react'
import DataTable from './DataTable'
import ProgressBar from './ProgressBar'
import { DonutChart } from './MiniChart'

interface GeoData {
  label: string
  nb_visits?: number
  nb_uniq_visitors?: number
  nb_actions?: number
  logo?: string
  code?: string
  [key: string]: any
}

interface AudienceTabProps {
  countries: any
  continents: any
  cities: any
  languages: any
  loading?: boolean
}

// Country flag emoji helper
const getCountryFlag = (countryCode?: string) => {
  if (!countryCode || countryCode.length !== 2) return '🌍'
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

export default function AudienceTab({
  countries,
  continents,
  cities,
  languages,
  loading = false,
}: AudienceTabProps) {
  const countriesArray = Array.isArray(countries) ? countries : countries ? [countries] : []
  const continentsArray = Array.isArray(continents) ? continents : continents ? [continents] : []
  const citiesArray = Array.isArray(cities) ? cities : cities ? [cities] : []
  const languagesArray = Array.isArray(languages) ? languages : languages ? [languages] : []

  // Stats summary
  const totalVisits = countriesArray.reduce((sum, c) => sum + (c.nb_visits || 0), 0)
  const totalCountries = countriesArray.length
  const topCountry = countriesArray[0]?.label || 'N/A'

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="h-5 w-5 text-indigo-200" />
            <span className="text-indigo-100 text-sm font-medium">Countries Reached</span>
          </div>
          <p className="text-4xl font-bold">{totalCountries}</p>
          <p className="text-indigo-200 text-sm mt-1">unique locations</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Flag className="h-5 w-5 text-purple-200" />
            <span className="text-purple-100 text-sm font-medium">Top Country</span>
          </div>
          <p className="text-2xl font-bold truncate">{topCountry}</p>
          <p className="text-purple-200 text-sm mt-1">most visitors from</p>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Languages className="h-5 w-5 text-pink-200" />
            <span className="text-pink-100 text-sm font-medium">Languages</span>
          </div>
          <p className="text-4xl font-bold">{languagesArray.length}</p>
          <p className="text-pink-200 text-sm mt-1">different languages</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Continents Donut Chart */}
        <DonutChart
          data={continentsArray.slice(0, 6).map((c) => ({
            label: c.label || 'Unknown',
            value: c.nb_visits || 0,
          }))}
          title="Visitors by Continent"
          loading={loading}
          size={180}
        />

        {/* Top Countries Progress */}
        <ProgressBar
          items={countriesArray.slice(0, 8).map((c) => ({
            label: c.label || 'Unknown',
            value: c.nb_visits || 0,
            icon: <span className="text-lg">{getCountryFlag(c.code)}</span>,
          }))}
          title="Top Countries"
          subtitle="By number of visits"
          loading={loading}
          maxItems={8}
        />
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Countries Table */}
        <DataTable
          data={countriesArray}
          title="Visitors by Country"
          subtitle="Geographic distribution of your audience"
          loading={loading}
          emptyMessage="No country data available"
          maxRows={10}
          showPagination={countriesArray.length > 10}
          columns={[
            {
              key: 'label',
              header: 'Country',
              render: (item) => (
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getCountryFlag(item.code)}</span>
                  <span className="font-medium text-slate-700">{item.label}</span>
                </div>
              ),
            },
            {
              key: 'nb_visits',
              header: 'Visits',
              align: 'right',
              render: (item) => (
                <span className="font-semibold text-slate-900">
                  {item.nb_visits?.toLocaleString() || 0}
                </span>
              ),
            },
            {
              key: 'percentage',
              header: '%',
              align: 'right',
              render: (item) => {
                const pct =
                  totalVisits > 0 ? (((item.nb_visits || 0) / totalVisits) * 100).toFixed(1) : '0'
                return <span className="text-slate-500">{pct}%</span>
              },
            },
          ]}
        />

        {/* Cities Table */}
        <DataTable
          data={citiesArray}
          title="Top Cities"
          subtitle="Most active city locations"
          loading={loading}
          emptyMessage="No city data available"
          maxRows={10}
          showPagination={citiesArray.length > 10}
          columns={[
            {
              key: 'label',
              header: 'City',
              render: (item) => (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span className="font-medium text-slate-700">{item.label}</span>
                </div>
              ),
            },
            {
              key: 'nb_visits',
              header: 'Visits',
              align: 'right',
              render: (item) => (
                <span className="font-semibold text-slate-900">
                  {item.nb_visits?.toLocaleString() || 0}
                </span>
              ),
            },
          ]}
        />
      </div>

      {/* Languages Table */}
      <DataTable
        data={languagesArray}
        title="Browser Languages"
        subtitle="Language preferences of your visitors"
        loading={loading}
        emptyMessage="No language data available"
        maxRows={10}
        showPagination={languagesArray.length > 10}
        columns={[
          {
            key: 'label',
            header: 'Language',
            render: (item) => (
              <div className="flex items-center gap-2">
                <Languages className="h-4 w-4 text-slate-400" />
                <span className="font-medium text-slate-700">{item.label}</span>
              </div>
            ),
          },
          {
            key: 'nb_visits',
            header: 'Visits',
            align: 'right',
            render: (item) => (
              <span className="font-semibold text-slate-900">
                {item.nb_visits?.toLocaleString() || 0}
              </span>
            ),
          },
          {
            key: 'nb_uniq_visitors',
            header: 'Unique Visitors',
            align: 'right',
            render: (item) => (
              <span className="text-slate-600">{item.nb_uniq_visitors?.toLocaleString() || 0}</span>
            ),
          },
        ]}
      />
    </div>
  )
}
