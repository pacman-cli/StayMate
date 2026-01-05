"use client"

import { ActivityFeed } from "@/components/admin/dashboard/ActivityFeed"
import { KPIStatsGrid } from "@/components/admin/dashboard/KPIStatsGrid"
import { PropertyInsights } from "@/components/admin/dashboard/PropertyInsights"
import { QuickActions } from "@/components/admin/dashboard/QuickActions"
import { RecentDataTables } from "@/components/admin/dashboard/RecentDataTables"
import { RevenueAnalytics } from "@/components/admin/dashboard/RevenueAnalytics"
import { SystemHealth } from "@/components/admin/dashboard/SystemHealth"
import { UserGrowthChart } from "@/components/admin/dashboard/UserGrowthChart"
import { useAuth } from "@/context/AuthContext"
import { Calendar, Download, Sparkles } from "lucide-react"

import { dashboardApi } from "@/lib/api"
import { AdminDashboardDTO } from "@/types/auth"
import { useEffect, useState } from "react"

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState<AdminDashboardDTO | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const stats = await dashboardApi.getAdminStats()
        setData(stats)
      } catch (error) {
        console.error("Failed to load admin stats:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return <div className="p-10 flex justify-center text-slate-500">Loading dashboard...</div>
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Admin Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Welcome back, <span className="font-semibold text-primary-600">{user?.firstName}</span>. System performance is optimal today.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300">
            <Calendar className="w-4 h-4" />
            <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {/* 1. Advanced KPI Grid */}
      <section>
        <KPIStatsGrid data={data} />
      </section>

      {/* 2. Main Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <UserGrowthChart />
        </div>
        <div className="lg:col-span-1">
          <SystemHealth />
          <div className="mt-8">
            <QuickActions />
          </div>
        </div>
      </div>

      {/* 3. Property & Revenue Insights */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <PropertyInsights data={data} />
        <RevenueAnalytics />
      </div>



      {/* 5. Activity & Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 h-full">
          <ActivityFeed />
        </div>
        <div className="lg:col-span-2">
          <RecentDataTables />
        </div>
      </div>

      {/* AI Insights Teaser */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Sparkles className="w-6 h-6 text-yellow-300" />
            </div>
            <h3 className="text-xl font-bold">AI Insights (Beta)</h3>
          </div>
          <p className="text-indigo-100 max-w-2xl mb-6">
            Our upcoming AI module will predict rental demand surges and identify potential churn risk based on user activity patterns.
          </p>
          <button className="px-6 py-2 bg-white text-indigo-600 rounded-lg font-bold text-sm hover:bg-indigo-50 transition">
            Join Waitlist
          </button>
        </div>
      </div>
    </div>
  )
}
