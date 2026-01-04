"use client"

import { DashboardStats } from "@/types/auth"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

interface UserEcosystemChartProps {
 stats: DashboardStats
 isDark: boolean
}

export function UserEcosystemChart({ stats, isDark }: UserEcosystemChartProps) {
 const { userStats } = stats

 const data = userStats?.userRoleDistribution ? [
  { name: 'Tenants', value: userStats.userRoleDistribution['Tenant'] || 0, color: '#3B82F6' }, // Blue
  { name: 'Landlords', value: userStats.userRoleDistribution['Landlord'] || 0, color: '#10B981' }, // Emerald
  { name: 'Admins', value: userStats.userRoleDistribution['Admin'] || 0, color: '#8B5CF6' }, // Purple
 ] : []

 return (
  <div className={`p-6 rounded-2xl border ${isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-slate-100"
   } backdrop-blur-xl h-full`}>
   <h3 className={`font-semibold mb-6 ${isDark ? "text-white" : "text-slate-900"}`}>
    User Ecosystem
   </h3>
   <div className="h-[200px] w-full relative">
    <ResponsiveContainer width="100%" height="100%">
     <PieChart>
      <Pie
       data={data}
       innerRadius={60}
       outerRadius={80}
       paddingAngle={5}
       dataKey="value"
      >
       {data.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
       ))}
      </Pie>
      <Tooltip
       contentStyle={{
        backgroundColor: isDark ? '#1e293b' : '#fff',
        borderRadius: '8px',
        border: 'none',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
       }}
      />
     </PieChart>
    </ResponsiveContainer>
    {/* Center Text */}
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
     <span className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
      {userStats?.totalUsers || 0}
     </span>
     <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
      Total Users
     </span>
    </div>
   </div>

   {/* Legend */}
   <div className="mt-6 space-y-3">
    {data.map((item) => (
     <div key={item.name} className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
       <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
       <span className={isDark ? "text-slate-300" : "text-slate-600"}>{item.name}</span>
      </div>
      <span className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
       {item.value}
      </span>
     </div>
    ))}
   </div>
  </div>
 )
}
