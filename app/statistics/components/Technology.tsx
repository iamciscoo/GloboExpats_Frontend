'use client'

import React from 'react'
import { TabsContent } from '@/components/ui/tabs'

export default function Technology({ deviceTypes, browsers, operatingSystems }: any) {
  return (
    <TabsContent value="technology" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {deviceTypes && Array.isArray(deviceTypes) && deviceTypes.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Types</h3>
            <div className="space-y-3">
              {deviceTypes.slice(0, 5).map((d: any, i: number) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-700 capitalize">{d.label}</span>
                  <span className="font-medium text-gray-900">
                    {d.nb_visits?.toLocaleString?.() || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {browsers && Array.isArray(browsers) && browsers.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Browsers</h3>
            <div className="space-y-3">
              {browsers.slice(0, 5).map((b: any, i: number) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-700">{b.label}</span>
                  <span className="font-medium text-gray-900">
                    {b.nb_visits?.toLocaleString?.() || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {operatingSystems && Array.isArray(operatingSystems) && operatingSystems.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Operating Systems</h3>
            <ul className="space-y-2">
              {operatingSystems.slice(0, 5).map((os: any, i: number) => (
                <li key={i} className="flex justify-between text-sm">
                  <span className="text-gray-700">{os.label}</span>
                  <span className="font-medium text-gray-900">
                    {os.nb_visits?.toLocaleString?.() || 0}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </TabsContent>
  )
}
