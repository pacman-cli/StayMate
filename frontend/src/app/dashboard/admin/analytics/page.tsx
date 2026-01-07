"use client"

import { AnalyticsChart } from "@/components/admin/dashboard/AnalyticsChart"
import { RevenueAnalytics } from "@/components/admin/dashboard/RevenueAnalytics"
import { adminApi } from "@/lib/api"
import { BarChart3, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export default function AdminAnalyticsPage() {
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [userGrowthData, setUserGrowthData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const dashboardData = await adminApi.getAnalyticsDashboard()

        // Revenue Data for Area Chart
        const formattedRevenue = dashboardData.revenueTrends.map(point => ({
          name: point.date,
          value: point.amount
        }))
        setRevenueData(formattedRevenue)

        // User Growth Data is passed directly to AnalyticsChart
        setUserGrowthData(dashboardData.userGrowth)

      } catch (error) {
        console.error("Failed to load analytics")
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Platform Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* User Growth Chart */}
        <div className="h-[400px]">
          <AnalyticsChart data={userGrowthData} />
        </div>

        {/* Revenue Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm h-[400px]">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-6">Revenue Trends</h3>
          {loading ? (
            <div className="h-full flex items-center justify-center text-slate-400">Loading...</div>
          ) : revenueData.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: 'none', borderRadius: '8px', color: '#fff' }}
                    cursor={{ stroke: '#10b981', strokeWidth: 1 }}
                    formatter={(value: number) => [`BDT ${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">
              <TrendingUp className="w-12 h-12 opacity-20" />
              <span className="ml-2">No revenue data available</span>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Analytics Section */}
      <RevenueAnalytics />

      <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 p-4 rounded-lg flex items-center gap-3 mt-6">
        <BarChart3 className="w-5 h-5 shrink-0" />
        <p className="text-sm">Advanced predictive analytics are currently in beta. Real-time reports update every 15 minutes.</p>
      </div>
    </div>
  )
}
