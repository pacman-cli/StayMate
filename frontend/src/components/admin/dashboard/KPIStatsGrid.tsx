"use client"

import { ArrowDownRight, ArrowUpRight, DollarSign, Users, Activity, UserPlus, MousePointerClick, UserMinus } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer } from "recharts"

interface KPIStatsGridProps {
  data?: any // We'll type this properly later when backend is ready
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
      label: "Monthly Active Users",
      value: "12,450",
      change: "+12.5%",
      trend: "up",
      icon: Users,
      color: "blue",
      data: sparklineData
    },
    {
      label: "Daily Active Users",
      value: "1,203",
      change: "+5.2%",
      trend: "up",
      icon: Activity,
      color: "emerald",
      data: sparklineData
    },
    {
      label: "New Signups (30d)",
      value: "450",
      change: "+18.2%",
      trend: "up",
      icon: UserPlus,
      color: "indigo",
      data: sparklineData
    },
    {
      label: "Total Revenue (Mo)",
      value: "BDT 450k",
      change: "+8.4%",
      trend: "up",
      icon: DollarSign,
      color: "violet",
      data: sparklineData
    },
    {
      label: "Conversion Rate",
      value: "3.2%",
      change: "-0.4%",
      trend: "down",
      icon: MousePointerClick,
      color: "amber",
      data: sparklineDataDown
    },
    {
      label: "Churn Rate",
      value: "0.8%",
      change: "-0.1%",
      trend: "up", // Churn going down is good (metrics usually show direction of number though) -> "up" means metric value increased? Or good/bad?
      // Usually green "down" arrow for churn is good.
      // Let's stick to visual "red down" for negative change in value, but we might want to color logic differently.
      // For now, let's say Churn IMPROVED (went down 0.1%).
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
      
      {/* Sparkline */}
      <div className="h-10 mt-3 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={metric.data}>
            <defs>
              <linearGradient id={`gradient-${metric.label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity={0.2} />
                <stop offset="100%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={isPositive ? "#10b981" : "#f43f5e"} 
              strokeWidth={2}
              fill={`url(#gradient-${metric.label})`} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
