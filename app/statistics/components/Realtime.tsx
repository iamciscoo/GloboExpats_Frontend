'use client'

import React from 'react'
import { TabsContent } from '@/components/ui/tabs'

export default function Realtime({ liveVisitors, recentVisits }: any) {
  // Debug logging
  console.log('[Realtime] liveVisitors:', liveVisitors)
  console.log('[Realtime] recentVisits:', recentVisits)

  return (
    <TabsContent value="realtime" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Visitors Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-green-500 text-sm font-medium">Active visitors right now</p>
          <p className="mt-2 text-4xl font-bold text-gray-900">
            {liveVisitors?.visits ?? liveVisitors?.nb_visits ?? 0}
          </p>
          {liveVisitors && (
            <div className="mt-2 text-xs text-gray-500">
              Raw data: {JSON.stringify(liveVisitors)}
            </div>
          )}
        </div>

        {/* Recent Visits Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-900 mb-3">Recent visitors</p>
          {recentVisits && Array.isArray(recentVisits) && recentVisits.length > 0 ? (
            <div className="space-y-3">
              {recentVisits.slice(0, 5).map((v: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {v.visitorId?.substring(0, 8) || v.idvisitor?.substring(0, 8) || 'Anonymous'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {v.lastActionDateTime || v.serverDate
                        ? new Date(v.lastActionDateTime || v.serverDate).toLocaleTimeString()
                        : 'Unknown'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {v.actions || v.actionDetails?.length || 0} actions
                    </p>
                    <p className="text-xs text-gray-600">{v.visitDuration || v.timeSpent || 0}s</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No recent visits data</p>
              {recentVisits && (
                <div className="mt-2 text-xs">
                  Raw data: {JSON.stringify(recentVisits).substring(0, 200)}...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </TabsContent>
  )
}
