"use client"

import { Activity, CheckCircle, Clock, Database, Server, Wifi } from "lucide-react"

export function SystemHealth() {
  const metrics = [
    { label: "API Uptime", value: "99.98%", status: "healthy", icon: Wifi },
    { label: "Server Load", value: "24%", status: "healthy", icon: Server },
    { label: "Database", value: "Optimal", status: "healthy", icon: Database },
    { label: "Response Time", value: "120ms", status: "warning", icon: Clock },
  ]

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <Activity className="w-5 h-5 text-slate-500" /> System Health
      </h3>
      
      <div className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                metric.status === "healthy" ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
              }`}>
                <metric.icon className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{metric.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white">{metric.value}</span>
              <div className={`w-2 h-2 rounded-full ${
                metric.status === "healthy" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
              }`}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
