"use client"

import { Activity, ArrowDownRight, ArrowUpRight, DollarSign, MousePointerClick, UserMinus, UserPlus, Users } from "lucide-react"

import { AdminDashboardDTO } from "@/types/auth"

interface KPIStatsGridProps {
  data?: AdminDashboardDTO | null
}

export function KPIStatsGrid({ data }: KPIStatsGridProps) {
  // Mock data for sparklines
  const sparklineData = [
    { value: 40 }, { value: 30 }, { value: 45 }, { value: 80 }, { value: 55 }, { value: 90 }, { value: 100 }
  ]
  const sparklineDataDown = [
    { value: 100 }, { value: 90 }, { value: 80 }, { value: 60 }, { value: 70 }, { value: 50 }, { value: 40 }
  ]

  const metrics = [
    {
      label: "Total Users",
      value: data?.totalUsers?.toLocaleString() || "0",
      change: "+0%", // TODO: Calculate growth
      trend: "neutral",
      icon: Users,
      color: "blue",
      data: sparklineData
    },
    {
      label: "Total Listings",
      value: data?.totalListings?.toLocaleString() || "0",
      change: `Pending: ${data?.pendingVerificationsCount || 0}`,
      trend: "up",
      icon: Activity,
      color: "emerald",
      data: sparklineData
    },
    {
      label: "Occupancy Rate",
      value: `${data?.seatOccupancyRate?.toFixed(1) || 0}%`,
      change: "Active Beds",
      trend: "up",
      icon: UserPlus,
      color: "indigo",
      data: sparklineData
    },
    {
      label: "Total Bookings",
      value: data?.totalBookings?.toLocaleString() || "0",
      change: `Confirmed: ${data?.confirmedBookings || 0}`,
      trend: "up",
      icon: DollarSign,
      color: "violet",
      data: sparklineData
    },
    {
      label: "Emergancy Rooms",
      value: data?.totalEmergencyRoomsAvailable?.toLocaleString() || "0",
      change: "Available Now",
      trend: "down",
      icon: MousePointerClick,
      color: "amber",
      data: sparklineDataDown
    },
    {
      label: "Risk Alerts",
      value: data?.recentFraudAlerts?.length.toString() || "0",
      change: `${data?.bannedUsersCount || 0} Banned`,
      trend: "up",
      icon: UserMinus,
      color: "rose",
      data: sparklineDataDown,
      inverseTrend: true
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index} metric={metric} />
      ))}
    </div>
  )
}

function Card({ metric }: { metric: any }) {
  const isPositive = metric.change.startsWith("+")
  // For churn, negative change is good (green), positive is bad (red) -> logic handled by styling

  const trendColor = metric.inverseTrend
    ? (isPositive ? "text-red-600 bg-red-50" : "text-emerald-600 bg-emerald-50")
    : (isPositive ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50")

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div className={`p-2 rounded-lg bg-${metric.color}-50 dark:bg-${metric.color}-900/20 text-${metric.color}-600 dark:text-${metric.color}-400`}>
          <metric.icon className="w-4 h-4" />
        </div>
        <div className={`flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full ${trendColor}`}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {metric.change}
        </div>
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">{metric.label}</p>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{metric.value}</h3>
      </div>
    </div>
  )
}
