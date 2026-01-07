"use client"

import { AnalyticsChart } from "@/components/admin/dashboard/AnalyticsChart"
import { FraudMonitor } from "@/components/admin/dashboard/FraudMonitor"
import { VerificationQueue } from "@/components/admin/dashboard/VerificationQueue"
import { useAuth } from "@/context/AuthContext"
import { adminApi } from "@/lib/api"
import { AdminDashboardStatDto } from "@/types/auth"
import { AlertCircle, Calendar, Home, Search, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<AdminDashboardStatDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)

  const loadData = async () => {
    try {
      const data = await adminApi.getDashboardStats()
      setStats(data)
    } catch (error) {
      console.error("Failed to load admin stats:", error)
      toast.error("Failed to load dashboard data.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleTriggerScan = async () => {
    setScanning(true)
    try {
      await adminApi.triggerFraudScan()
      toast.success("Fraud scan initiated successfully.")
      // Reload data to see if new events passed (might need delay or websocket in real app)
      setTimeout(loadData, 2000)
    } catch (error) {
      toast.error("Failed to trigger scan.")
    } finally {
      setScanning(false)
    }
  }

  if (loading || !stats) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  // Calculate generic stats
  const activeListings = stats.listingStats['Active'] || 0
  const rentedListings = stats.listingStats['Rented'] || 0
  const pendingListings = stats.listingStats['Pending'] || 0

  // Calculate total users from userAcquisition
  const totalUsers = stats.userAcquisition.reduce((acc, curr) => acc + curr.count, 0)

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Super Admin Console</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            System Overview & Integrity Monitor
          </p>
        </div>
        <div className="flex gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300">
            <Calendar className="w-4 h-4" />
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-slate-500">Total Users</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white pl-1">{totalUsers.toLocaleString()}</div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600">
              <Home className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-slate-500">Active Listings</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white pl-1">{activeListings.toLocaleString()}</div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-slate-500">Pending Approval</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white pl-1">{pendingListings.toLocaleString()}</div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600">
              <Search className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-slate-500">Rented / Archived</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white pl-1">{rentedListings.toLocaleString()}</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Verification + Fraud */}
        <div className="lg:col-span-1 space-y-6">
          <VerificationQueue stats={stats.verificationStats} />

          {/* Quick Action Trigger for Demo */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-2">System IntegrityScan™</h3>
              <p className="text-indigo-100 text-sm mb-4">
                Run a comprehensive audit for duplicates, spam, and anomalies.
              </p>
              <button
                onClick={handleTriggerScan}
                disabled={scanning}
                className="w-full py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 rounded-lg text-sm font-semibold transition"
              >
                {scanning ? "Scanning..." : "Run Manual Scan"}
              </button>
            </div>
            {/* Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          </div>
        </div>

        {/* Right Col: Analytics + Fraud Table */}
        <div className="lg:col-span-2 space-y-6">
          <AnalyticsChart data={stats.userAcquisition} />
          <FraudMonitor events={stats.recentFraudEvents} onTriggerScan={handleTriggerScan} />
        </div>
      </div>

    </div>
  )
}
