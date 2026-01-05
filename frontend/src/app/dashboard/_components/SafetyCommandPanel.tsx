"use client"

import { DashboardStats } from "@/types/auth"
import { formatDistanceToNow } from "date-fns"
import { AlertCircle, CheckCircle, ShieldAlert } from "lucide-react"

interface SafetyCommandPanelProps {
  stats: DashboardStats
  isDark: boolean
}

export function SafetyCommandPanel({ stats, isDark }: SafetyCommandPanelProps) {
  const { safetyStats } = stats

  // Use real data from stats
  // We map the ReportResponse to the format expected by the UI or adjust UI to use ReportResponse fields directly.
  const alerts = safetyStats?.recentReports || []

  return (
    <div className={`p-6 rounded-2xl border ${isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-slate-100"
      } backdrop-blur-xl h-full`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`font-semibold ${isDark ? "text-white" : "text-slate-900"} flex items-center gap-2`}>
          <ShieldAlert className="w-5 h-5 text-red-500" />
          Safety Command Center
        </h3>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${(safetyStats?.criticalAlerts || 0) > 0
          ? (isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600')
          : (isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600')
          }`}>
          {safetyStats?.criticalAlerts || 0} Critical
        </span>
      </div>

      <div className="space-y-3">
        {(!alerts || alerts.length === 0) && (
          <div className={`p-4 rounded-xl text-center border-dashed border ${isDark ? "border-slate-800" : "border-slate-200"}`}>
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className={isDark ? "text-slate-400" : "text-slate-500"}>System Secure. No active threats.</p>
          </div>
        )}
        {alerts.map((report) => (
          <div key={report.id} className={`p-3 rounded-xl border flex items-start gap-3 ${isDark ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"
            }`}>
            <AlertCircle className={`w-5 h-5 mt-0.5 ${report.severity === 'CRITICAL' ? 'text-red-500' :
              report.severity === 'HIGH' ? 'text-orange-500' : 'text-amber-500'
              }`} />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                  {report.reason ? report.reason.replace("_", " ") : "Report Details"}
                </h4>
                <span className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Reported: <span className="font-semibold">{report.reportedUser.fullName || "User"}</span> • Severity: <span className="uppercase">{report.severity}</span>
              </p>
              <div className="flex gap-2 mt-2">
                <button className="text-xs px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600">
                  Investigate
                </button>
                <button className={`text-xs px-2 py-1 rounded border ${isDark ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
