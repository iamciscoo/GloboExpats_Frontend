'use client'

import React from 'react'
import { TabsContent } from '@/components/ui/tabs'

export default function ContentTab({ pageTitles, entryPages, exitPages }: any) {
  return (
    <TabsContent value="content" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {pageTitles && Array.isArray(pageTitles) && pageTitles.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Top Page Titles</h3>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {pageTitles.slice(0, 5).map((p: any, i: number) => (
                  <li key={i} className="flex justify-between text-sm">
                    <span className="text-gray-700 truncate">{p.label}</span>
                    <span className="font-medium text-gray-900">
                      {p.nb_visits?.toLocaleString?.() || 0}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {entryPages && Array.isArray(entryPages) && entryPages.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Entry Pages</h3>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {entryPages.slice(0, 5).map((p: any, i: number) => (
                  <li key={i} className="flex justify-between text-sm">
                    <span className="text-gray-700 truncate">{p.label}</span>
                    <span className="font-medium text-gray-900">
                      {p.nb_visits?.toLocaleString?.() || 0}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {exitPages && Array.isArray(exitPages) && exitPages.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Exit Pages</h3>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {exitPages.slice(0, 5).map((p: any, i: number) => (
                  <li key={i} className="flex justify-between text-sm">
                    <span className="text-gray-700 truncate">{p.label}</span>
                    <span className="font-medium text-gray-900">
                      {p.nb_visits?.toLocaleString?.() || 0}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </TabsContent>
  )
}
