import { DashboardStats } from "@/types/auth"
import { Activity, ArrowUpRight, Shield, Users, Zap } from "lucide-react"

interface GlobalHealthBarProps {
  stats: DashboardStats
  isDark: boolean
}

export function GlobalHealthBar({ stats, isDark }: GlobalHealthBarProps) {
  const { userStats, safetyStats, listingStats } = stats

  // Mock Platform Health removed. Replaced with Active Listings.
  const items = [
    {
      label: "Active Listings",
      value: listingStats?.activeListings.toString() || "0",
      icon: Activity,
      trend: `${listingStats?.pendingListings || 0} Pending`,
      status: "good",
      color: "emerald"
    },
    {
      label: "Active Users (24h)",
      value: userStats?.activeUsers24h.toString() || "0",
      icon: Zap,
      trend: `+${userStats?.newUsersLast7Days || 0} this week`, // Using new users as trend proxy
      status: "neutral",
      color: "blue"
    },
    {
      label: "Safety Risk",
      value: safetyStats?.criticalAlerts.toString() || "0",
      icon: Shield,
      trend: safetyStats?.openReports ? `${safetyStats.openReports} Pending` : "Safe",
      status: (safetyStats?.criticalAlerts || 0) > 0 ? "critical" : "good",
      color: (safetyStats?.criticalAlerts || 0) > 0 ? "red" : "emerald"
    },
    {
      label: "Avg Rating",
      value: safetyStats?.averagePlatformRating.toFixed(1) || "5.0", // Default to 5.0 if no ratings
      icon: Users, // Using Users as proxy for reputation
      trend: `${safetyStats?.totalReviews || 0} reviews`,
      status: "good",
      color: "purple"
    }
  ]

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl border ${isDark ? "bg-dark-900 border-dark-700" : "bg-white border-slate-100"
      }`}>
      {items.map((item, idx) => (
        <div key={idx} className={`p-3 rounded-xl border ${isDark ? "bg-dark-800 border-dark-700" : "bg-slate-50 border-slate-100"
          } flex items-center justify-between group hover:scale-[1.02] transition-transform`}>
          <div>
            <p className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {item.label}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <h4 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                {item.value}
              </h4>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${item.status === 'good'
                ? (isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600')
                : item.status === 'critical'
                  ? (isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600')
                  : (isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600')
                }`}>
                {item.trend}
                <ArrowUpRight className="w-2.5 h-2.5" />
              </span>
            </div>
          </div>
          <div className={`p-2.5 rounded-lg ${item.color === 'emerald' ? (isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600') :
            item.color === 'blue' ? (isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600') :
              item.color === 'red' ? (isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600') :
                (isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600')
            }`}>
            <item.icon className="w-5 h-5" />
          </div>
        </div>
      ))}
    </div>
  )
}
