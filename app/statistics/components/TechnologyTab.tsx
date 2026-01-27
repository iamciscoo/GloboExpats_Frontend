'use client'

import React from 'react'
import { Monitor, Smartphone, Tablet, Laptop, Tv, Globe, Cpu, Chrome } from 'lucide-react'
import DataTable from './DataTable'
import ProgressBar from './ProgressBar'
import { DonutChart } from './MiniChart'

interface TechData {
  label: string
  nb_visits?: number
  nb_uniq_visitors?: number
  nb_actions?: number
  logo?: string
  [key: string]: any
}

interface TechnologyTabProps {
  deviceTypes: any
  browsers: any
  operatingSystems: any
  loading?: boolean
}

// Device icon helper
const getDeviceIcon = (type: string) => {
  const lowerType = type?.toLowerCase() || ''
  if (lowerType.includes('desktop')) return <Monitor className="h-4 w-4" />
  if (
    lowerType.includes('smartphone') ||
    lowerType.includes('phone') ||
    lowerType.includes('mobile')
  )
    return <Smartphone className="h-4 w-4" />
  if (lowerType.includes('tablet')) return <Tablet className="h-4 w-4" />
  if (lowerType.includes('laptop')) return <Laptop className="h-4 w-4" />
  if (lowerType.includes('tv') || lowerType.includes('television'))
    return <Tv className="h-4 w-4" />
  return <Monitor className="h-4 w-4" />
}

// Browser icon/color helper
const getBrowserColor = (browser: string) => {
  const lowerBrowser = browser?.toLowerCase() || ''
  if (lowerBrowser.includes('chrome')) return 'bg-yellow-500'
  if (lowerBrowser.includes('firefox')) return 'bg-orange-500'
  if (lowerBrowser.includes('safari')) return 'bg-blue-500'
  if (lowerBrowser.includes('edge')) return 'bg-cyan-500'
  if (lowerBrowser.includes('opera')) return 'bg-red-500'
  if (lowerBrowser.includes('ie') || lowerBrowser.includes('internet explorer'))
    return 'bg-blue-700'
  return 'bg-slate-500'
}

// OS color helper
const getOSColor = (os: string) => {
  const lowerOS = os?.toLowerCase() || ''
  if (lowerOS.includes('windows')) return 'bg-blue-500'
  if (lowerOS.includes('mac') || lowerOS.includes('ios')) return 'bg-slate-700'
  if (lowerOS.includes('android')) return 'bg-green-500'
  if (lowerOS.includes('linux')) return 'bg-orange-500'
  if (lowerOS.includes('ubuntu')) return 'bg-orange-600'
  if (lowerOS.includes('chrome')) return 'bg-emerald-500'
  return 'bg-purple-500'
}

export default function TechnologyTab({
  deviceTypes,
  browsers,
  operatingSystems,
  loading = false,
}: TechnologyTabProps) {
  const devicesArray = Array.isArray(deviceTypes) ? deviceTypes : deviceTypes ? [deviceTypes] : []
  const browsersArray = Array.isArray(browsers) ? browsers : browsers ? [browsers] : []
  const osArray = Array.isArray(operatingSystems)
    ? operatingSystems
    : operatingSystems
      ? [operatingSystems]
      : []

  // Calculate totals
  const totalDevices = devicesArray.reduce((sum, d) => sum + (d.nb_visits || 0), 0)
  const mobileVisits = devicesArray
    .filter(
      (d) =>
        d.label?.toLowerCase().includes('smartphone') ||
        d.label?.toLowerCase().includes('mobile') ||
        d.label?.toLowerCase().includes('tablet')
    )
    .reduce((sum, d) => sum + (d.nb_visits || 0), 0)
  const desktopVisits = devicesArray
    .filter((d) => d.label?.toLowerCase().includes('desktop'))
    .reduce((sum, d) => sum + (d.nb_visits || 0), 0)

  const mobilePercent = totalDevices > 0 ? ((mobileVisits / totalDevices) * 100).toFixed(1) : '0'
  const desktopPercent = totalDevices > 0 ? ((desktopVisits / totalDevices) * 100).toFixed(1) : '0'

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Monitor className="h-5 w-5 text-cyan-200" />
            <span className="text-cyan-100 text-sm font-medium">Desktop Traffic</span>
          </div>
          <p className="text-4xl font-bold">{desktopPercent}%</p>
          <p className="text-cyan-200 text-sm mt-1">{desktopVisits.toLocaleString()} visits</p>
        </div>

        <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Smartphone className="h-5 w-5 text-violet-200" />
            <span className="text-violet-100 text-sm font-medium">Mobile Traffic</span>
          </div>
          <p className="text-4xl font-bold">{mobilePercent}%</p>
          <p className="text-violet-200 text-sm mt-1">{mobileVisits.toLocaleString()} visits</p>
        </div>

        <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="h-5 w-5 text-rose-200" />
            <span className="text-rose-100 text-sm font-medium">Top Browser</span>
          </div>
          <p className="text-2xl font-bold truncate">{browsersArray[0]?.label || 'N/A'}</p>
          <p className="text-rose-200 text-sm mt-1">most used browser</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Types Donut */}
        <DonutChart
          data={devicesArray.map((d) => ({
            label: d.label || 'Unknown',
            value: d.nb_visits || 0,
          }))}
          title="Device Types"
          loading={loading}
          size={180}
          colors={['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899']}
        />

        {/* Browsers Progress */}
        <ProgressBar
          items={browsersArray.slice(0, 6).map((b) => ({
            label: b.label || 'Unknown',
            value: b.nb_visits || 0,
            color: getBrowserColor(b.label || ''),
          }))}
          title="Browser Usage"
          subtitle="Top browsers by visits"
          loading={loading}
          maxItems={6}
        />

        {/* OS Progress */}
        <ProgressBar
          items={osArray.slice(0, 6).map((os) => ({
            label: os.label || 'Unknown',
            value: os.nb_visits || 0,
            color: getOSColor(os.label || ''),
          }))}
          title="Operating Systems"
          subtitle="Top OS by visits"
          loading={loading}
          maxItems={6}
        />
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Types Table */}
        <DataTable
          data={devicesArray}
          title="Device Types"
          subtitle="How users access your site"
          loading={loading}
          emptyMessage="No device data available"
          maxRows={10}
          columns={[
            {
              key: 'label',
              header: 'Device',
              render: (item) => (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">{getDeviceIcon(item.label)}</span>
                  <span className="font-medium text-slate-700 capitalize">{item.label}</span>
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

        {/* Browsers Table */}
        <DataTable
          data={browsersArray}
          title="Browsers"
          subtitle="Browser popularity"
          loading={loading}
          emptyMessage="No browser data available"
          maxRows={10}
          columns={[
            {
              key: 'label',
              header: 'Browser',
              render: (item) => (
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${getBrowserColor(item.label)}`} />
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

        {/* OS Table */}
        <DataTable
          data={osArray}
          title="Operating Systems"
          subtitle="OS distribution"
          loading={loading}
          emptyMessage="No OS data available"
          maxRows={10}
          columns={[
            {
              key: 'label',
              header: 'OS',
              render: (item) => (
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-slate-400" />
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
    </div>
  )
}
