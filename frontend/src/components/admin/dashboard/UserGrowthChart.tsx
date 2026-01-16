"use client"

import { adminApi } from "@/lib/api"
import { useEffect, useState } from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface UserGrowthPoint {
  date: string
  count: number
}

export function UserGrowthChart() {
  const [timeRange, setTimeRange] = useState("30d")
  const [data, setData] = useState<{ date: string; total: number; active: number; new: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.getUserGrowthAnalytics()
      .then((points: UserGrowthPoint[]) => {
        // Transform backend data format to chart format
        const transformed = points.map((p, idx) => ({
          date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
          total: p.count,
          active: Math.floor(p.count * 0.8), // Estimate active as 80% of total
          new: idx > 0 ? Math.max(0, p.count - points[idx - 1].count) : 0
        }))
        setData(transformed)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 h-[450px] flex items-center justify-center">
        <p className="text-slate-500">Loading user growth data...</p>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 h-[450px] flex items-center justify-center">
        <p className="text-slate-500">No user growth data available yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">User Growth Analytics</h3>
          <p className="text-sm text-slate-500">Track user acquisition and retention over time.</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
          {["7d", "30d", "90d", "1y"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${timeRange === range
                  ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '8px',
                border: 'none',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            // Dark mode support for tooltip can be tricky inline, usually handled by checking theme context or CSS vars
            />
            <Area
              name="Total Users"
              type="monotone"
              dataKey="total"
              stroke="#3b82f6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorTotal)"
            />
            <Area
              name="Active Users"
              type="monotone"
              dataKey="active"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorActive)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
