'use client'

import React from 'react'
import { TabsContent } from '@/components/ui/tabs'

export default function Audience({ countries, continents, cities, languages }: any) {
  return (
    <TabsContent value="audience" className="space-y-6">
      {countries && Array.isArray(countries) && countries.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Visitors by Country</h2>
          </div>
          <div className="overflow-x-auto p-4">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left text-sm font-medium p-2">Country</th>
                  <th className="text-right text-sm font-medium p-2">Visits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {countries.slice(0, 10).map((c: any, i: number) => (
                  <tr key={i}>
                    <td className="p-2 text-sm text-gray-700">{c.label}</td>
                    <td className="p-2 text-sm text-right font-medium">
                      {c.nb_visits?.toLocaleString?.() || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {continents && Array.isArray(continents) && continents.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Visitors by Continent</h3>
            <ul className="mt-4 space-y-2">
              {continents.slice(0, 5).map((cnt: any, i: number) => (
                <li key={i} className="flex justify-between text-sm">
                  <span className="text-gray-700">{cnt.label}</span>
                  <span className="font-medium text-gray-900">
                    {cnt.nb_visits?.toLocaleString?.() || 0}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {cities && Array.isArray(cities) && cities.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Cities</h3>
            <ul className="mt-4 space-y-2">
              {cities.slice(0, 5).map((ct: any, i: number) => (
                <li key={i} className="flex justify-between text-sm">
                  <span className="text-gray-700">{ct.label}</span>
                  <span className="font-medium text-gray-900">
                    {ct.nb_visits?.toLocaleString?.() || 0}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {languages && Array.isArray(languages) && languages.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Browser Languages</h3>
            <ul className="mt-4 space-y-2">
              {languages.slice(0, 5).map((ln: any, i: number) => (
                <li key={i} className="flex justify-between text-sm">
                  <span className="text-gray-700">{ln.label}</span>
                  <span className="font-medium text-gray-900">
                    {ln.nb_visits?.toLocaleString?.() || 0}
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
