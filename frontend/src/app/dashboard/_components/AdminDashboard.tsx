"use client"

import { AdminDashboardDTO } from "@/types/auth"
import { Building, CheckCircle, ShieldAlert, Users } from "lucide-react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { AdminVerificationQueue } from "./AdminVerificationQueue"

interface AdminDashboardProps {
  stats: AdminDashboardDTO
  isDark: boolean
}

export function AdminDashboard({ stats, isDark }: AdminDashboardProps) {

  // Use locationOccupancyStats (real) or fallback to mock
  const occupancyData = stats.locationOccupancyStats || [
    { name: 'Downtown', occupied: 85 },
    { name: 'Uptown', occupied: 65 },
    { name: 'Campus A', occupied: 92 },
    { name: 'Campus B', occupied: 45 },
    { name: 'Suburbs', occupied: 30 },
  ]

  const cards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "blue",
      trend: "+5% this week"
    },
    {
      label: "Total Landlords",
      value: stats.totalLandlords,
      icon: Building,
      color: "emerald",
      trend: "+2% this week"
    },
    {
      label: "Verified Listings",
      value: stats.verifiedListingsCount,
      icon: CheckCircle,
      color: "purple",
      trend: "+12 new"
    },
    {
      label: "Fraud Alerts",
      value: stats.recentFraudAlerts?.length || 0,
      icon: ShieldAlert,
      color: "red",
      trend: "Action Required"
    }
  ]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* 1. Top Row: 4 Cards */}
      {/* 1. Top Row: 4 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div key={index} className={`p-6 rounded-xl border ${isDark ? "bg-dark-800 border-dark-700" : "bg-white border-slate-200"
            } transition-all duration-300 hover:shadow-elevation-low`}>
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-lg ${card.color === 'blue' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                card.color === 'emerald' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                  card.color === 'purple' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                    'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                <card.icon className="w-6 h-6" />
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${card.color === 'red' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                isDark ? 'bg-dark-750 text-slate-400' : 'bg-slate-100 text-slate-600'
                }`}>
                {card.trend}
              </span>
            </div>
            <div className="mt-4">
              <h3 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                {card.value}
              </h3>
              <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {card.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Middle Section: Chart & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Seat Occupancy Analytics (Chart) */}
        <div className={`lg:col-span-2 p-6 rounded-xl border ${isDark ? "bg-dark-800 border-dark-700" : "bg-white border-slate-200"
          }`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`font-semibold text-lg ${isDark ? "text-white" : "text-slate-900"}`}>
              Seat Occupancy Analytics
            </h3>
            <div className={`text-sm px-3 py-1 rounded-full ${isDark ? "bg-dark-750 text-slate-400" : "bg-slate-100 text-slate-600"}`}>
              Avg Occupancy: {stats.seatOccupancyRate ? stats.seatOccupancyRate.toFixed(1) : 0}%
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={occupancyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#e2e8f0"} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: isDark ? "#334155" : "#f1f5f9", opacity: 0.4 }}
                  contentStyle={{
                    backgroundColor: isDark ? '#1e293b' : '#fff',
                    borderRadius: '8px',
                    border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar
                  dataKey="occupied"
                  fill="#8B5CF6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Verification Requests (Table/Widget) */}
        <div className="lg:col-span-1">
          {/* Using existing widget but strictly for Pending Users per requirements */}
          <AdminVerificationQueue isDark={isDark} />
        </div>
      </div>

    </div>
  )
}
