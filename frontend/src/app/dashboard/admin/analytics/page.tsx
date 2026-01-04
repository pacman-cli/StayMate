"use client"

import DashboardLayout from "@/components/DashboardLayout"
import { adminApi } from "@/lib/api"
import { BarChart3, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts"

export default function AdminAnalyticsPage() {
 const [revenueData, setRevenueData] = useState<any[]>([])

 useEffect(() => {
  const fetchAnalytics = async () => {
   try {
    const res = await adminApi.getRevenueAnalytics()
    // Transform { labels: [], data: [] } to [{name: "", value: }]
    const chartData = res.labels.map((label: string, index: number) => ({
     name: label,
     value: res.data[index]
    }))
    setRevenueData(chartData)
   } catch (error) {
    console.error("Failed to load analytics")
   }
  }
  fetchAnalytics()
 }, [])

 return (
  <DashboardLayout>
   <div className="p-6">
    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Platform Analytics</h1>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
     {/* Placeholder until deep analytics API is ready */}
     <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
      <h3 className="text-sm font-medium text-slate-500 mb-2">User Growth</h3>
      <div className="h-40 flex items-end gap-2">
       {[40, 60, 45, 70, 85, 90, 100].map((h, i) => (
        <div key={i} className="flex-1 bg-blue-100 dark:bg-blue-900/30 rounded-t-lg relative group">
         <div className="absolute bottom-0 w-full bg-blue-500 rounded-t-lg transition-all duration-500 group-hover:bg-blue-600" style={{ height: `${h}%` }}></div>
        </div>
       ))}
      </div>
     </div>

     <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
      <h3 className="text-sm font-medium text-slate-500 mb-2">Revenue Trends</h3>
      {revenueData.length > 0 ? (
       <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
         <AreaChart data={revenueData}>
          <defs>
           <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
           </linearGradient>
          </defs>
          <Tooltip
           contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', border: 'none', borderRadius: '8px', color: '#fff' }}
          />
          <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" />
         </AreaChart>
        </ResponsiveContainer>
       </div>
      ) : (
       <div className="h-40 flex items-center justify-center text-slate-400">
        <TrendingUp className="w-12 h-12 opacity-20" />
        <span className="ml-2">Loading...</span>
       </div>
      )}
     </div>
    </div>

    <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 p-4 rounded-lg flex items-center gap-3">
     <BarChart3 className="w-5 h-5 shrink-0" />
     <p className="text-sm">Advanced analytics data collection is currently being implemented. Check back later for real-time reports.</p>
    </div>
   </div>
  </DashboardLayout>
 )
}
