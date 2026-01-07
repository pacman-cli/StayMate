"use client"

import { adminApi } from "@/lib/api"
import { Report } from "@/types/auth"
import { AlertOctagon, AlertTriangle, Archive, CheckCircle, Clock, ShieldAlert, User as UserIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      const data = await adminApi.getReports()
      // Sort by severity (CRITICAL/HIGH first) then date
      const sorted = data.sort((a, b) => {
        const severityWeight = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }
        const wA = severityWeight[a.severity] || 0
        const wB = severityWeight[b.severity] || 0

        if (a.status === 'PENDING' && b.status !== 'PENDING') return -1
        if (a.status !== 'PENDING' && b.status === 'PENDING') return 1

        if (wA !== wB) return wB - wA

        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
      setReports(sorted)
    } catch (error) {
      toast.error("Failed to load reports")
    } finally {
      setLoading(false)
    }
  }

  const handleResolve = async (id: number) => {
    const notes = prompt("Resolution notes:")
    if (!notes) return

    try {
      await adminApi.resolveReport(id, notes)
      toast.success("Report resolved")
      loadReports()
    } catch (error) {
      toast.error("Failed to resolve report")
    }
  }

  const handleDismiss = async (id: number) => {
    const notes = prompt("Dismissal notes:")
    if (!notes) return

    try {
      await adminApi.dismissReport(id, notes)
      toast.success("Report dismissed")
      loadReports()
    } catch (error) {
      toast.error("Failed to dismiss report")
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL": return "text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400"
      case "HIGH": return "text-orange-700 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400"
      case "MEDIUM": return "text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400"
      case "LOW": return "text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
      default: return "text-slate-700 bg-slate-100"
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-primary-600" />
          Fraud & Reports
        </h1>
        <p className="text-slate-500 text-sm">Monitor and resolve user reports and safety alerts.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              No reports found. Good job!
            </div>
          ) : (
            reports.map(report => (
              <div key={report.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 transition hover:shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4">
                    <div className={`p-3 rounded-lg ${getSeverityColor(report.severity)}`}>
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                        {report.reason}
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(report.severity)}`}>
                          {report.severity}
                        </span>
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <UserIcon className="w-3 h-3" />
                          Reporter: {report.reporter?.firstName || "Unknown"}
                        </span>
                        <span className="flex items-center gap-1 text-red-500 font-medium">
                          <AlertOctagon className="w-3 h-3" />
                          Reported: {report.reportedUser?.firstName || "Unknown"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {report.status === 'PENDING' ? (
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">PENDING</span>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${report.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                        {report.status}
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg text-slate-700 dark:text-slate-300 text-sm mb-4">
                  {report.description}
                </div>

                {report.status === 'PENDING' && (
                  <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-700 pt-4">
                    <button
                      onClick={() => handleDismiss(report.id)}
                      className="px-4 py-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition text-sm font-medium flex items-center gap-2"
                    >
                      <Archive className="w-4 h-4" /> Dismiss
                    </button>
                    <button
                      onClick={() => handleResolve(report.id)}
                      className="px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-lg transition text-sm font-medium flex items-center gap-2 shadow-sm"
                    >
                      <CheckCircle className="w-4 h-4" /> Resolve
                    </button>
                  </div>
                )}

                {report.adminNotes && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500">
                    <span className="font-bold">Admin Notes:</span> {report.adminNotes}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
