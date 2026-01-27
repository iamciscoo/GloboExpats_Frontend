'use client'

import React from 'react'
import { TabsContent } from '@/components/ui/tabs'

export default function Overview({ visitsSummary, pageUrls }: any) {
  return (
    <TabsContent value="overview" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm font-medium">Visits</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {visitsSummary?.nb_visits?.toLocaleString?.() || '0'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm font-medium">Unique Visitors</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {visitsSummary?.nb_uniq_visitors?.toLocaleString?.() || '0'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm font-medium">Page Views</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {visitsSummary?.nb_pageviews?.toLocaleString?.() || '0'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm font-medium">Bounce Rate</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {visitsSummary?.bounce_rate || '—'}
          </p>
        </div>
      </div>

      {pageUrls && Array.isArray(pageUrls) && pageUrls.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Top Pages</h2>
          </div>
          <div className="overflow-x-auto p-4">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left text-sm font-medium p-2">Page</th>
                  <th className="text-right text-sm font-medium p-2">Visits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pageUrls.slice(0, 10).map((page: any, i: number) => (
                  <tr key={i}>
                    <td className="p-2 text-sm text-gray-700 truncate">{page.label}</td>
                    <td className="p-2 text-sm text-right font-medium">
                      {page.nb_visits?.toLocaleString?.() || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </TabsContent>
  )
}
