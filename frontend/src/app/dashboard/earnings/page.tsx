"use client"

import { dashboardApi } from "@/lib/api"
import { LandlordDashboardDTO } from "@/types/auth"
import { BarChart3, Calendar, Download, TrendingUp, Wallet } from "lucide-react"
import { useEffect, useState } from "react"

export default function EarningsPage() {
 const [stats, setStats] = useState<LandlordDashboardDTO | null>(null)
 const [loading, setLoading] = useState(true)

 useEffect(() => {
  const fetchStats = async () => {
   try {
    const data = await dashboardApi.getLandlordStats()
    setStats(data)
   } catch (error) {
    console.error("Failed to fetch earnings", error)
   } finally {
    setLoading(false)
   }
  }
  fetchStats()
 }, [])

 if (loading) return <div className="p-8"><div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" /></div>

 return (
  <div className="p-6 md:p-8 space-y-8">
   <div className="flex items-center justify-between">
    <div>
     <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Earnings & Finance</h1>
     <p className="text-slate-500 dark:text-slate-400">Track your revenue and occupancy metrics</p>
    </div>
    <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-slate-600 dark:text-slate-300 transition">
     <Download className="w-4 h-4" /> Export Report
    </button>
   </div>

   {/* Key Metrics */}
   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/25">
     <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
       <Wallet className="w-6 h-6 text-white" />
      </div>
      <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded">+12.5%</span>
     </div>
     <p className="text-blue-100">Total Revenue</p>
     <h2 className="text-3xl font-bold mt-1">BDT {stats?.totalRevenue?.toLocaleString() ?? 0}</h2>
    </div>

    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
     <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-green-100 dark:bg-green-500/20 rounded-lg">
       <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
      </div>
     </div>
     <p className="text-slate-500">Occupancy Rate</p>
     <h2 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">{stats?.occupancyRate ?? 0}%</h2>
    </div>

    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
     <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-lg">
       <Calendar className="w-6 h-6 text-amber-600 dark:text-amber-400" />
      </div>
     </div>
     <p className="text-slate-500">Pending Bookings Value</p>
     <h2 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">BDT --</h2>
     {/* Placeholder as API might not return this exact metric yet */}
    </div>
   </div>

   {/* Placeholder Chart Section */}
   <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 min-h-[300px] flex flex-col items-center justify-center text-center">
    <BarChart3 className="w-16 h-16 text-slate-300 mb-4" />
    <h3 className="text-lg font-medium text-slate-900 dark:text-white">Revenue Analytics</h3>
    <p className="text-slate-500 max-w-sm">
     Detailed revenue charts and visualization will appear here once you have sufficient transaction history.
    </p>
   </div>

   {/* Transaction History Placeholder */}
   <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
     <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Recent Transactions</h3>
    </div>
    <div className="p-8 text-center text-slate-500">
     <p>No recent transactions to display.</p>
    </div>
   </div>

  </div>
 )
}
