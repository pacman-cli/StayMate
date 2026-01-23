"use client"

import { AlertTriangle, Play, RefreshCw, Shield, ShieldAlert, ShieldX, Zap } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

interface FraudEvent {
  id: number
  userId: number | null
  userName: string
  type: string
  severity: string
  metadata: string | null
  createdAt: string
}

interface FraudStats {
  total: number
  byType: Record<string, number>
  bySeverity: Record<string, number>
  periodDays: number
}

export default function AdminFraudPage() {
  const [events, setEvents] = useState<FraudEvent[]>([])
  const [stats, setStats] = useState<FraudStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("accessToken")
      const headers = { Authorization: `Bearer ${token}` }

      const [eventsRes, statsRes] = await Promise.all([
        fetch("/api/admin/fraud/events", { headers }),
        fetch("/api/admin/fraud/stats?days=30", { headers })
      ])

      if (eventsRes.ok) setEvents(await eventsRes.json())
      if (statsRes.ok) setStats(await statsRes.json())
    } catch (error) {
      toast.error("Failed to load fraud data")
    } finally {
      setLoading(false)
    }
  }

  const runScan = async (type: string) => {
    setScanning(true)
    try {
      const token = localStorage.getItem("accessToken")
      const res = await fetch(`/api/admin/fraud/scan/${type}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        toast.success(`${type} scan initiated`)
        setTimeout(loadData, 2000)
      } else {
        toast.error("Scan failed")
      }
    } catch (error) {
      toast.error("Failed to run scan")
    } finally {
      setScanning(false)
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

  const getTypeIcon = (type: string) => {
    if (type.includes("DUPLICATE")) return <Shield className="w-4 h-4" />
    if (type.includes("SPAM")) return <ShieldX className="w-4 h-4" />
    return <ShieldAlert className="w-4 h-4" />
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-red-600" />
          Fraud Detection
        </h1>
        <p className="text-slate-500 text-sm">Monitor suspicious activities and run security scans.</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="text-sm text-slate-500">Total Events</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
            <div className="text-xs text-slate-400">Last {stats.periodDays} days</div>
          </div>

          {Object.entries(stats.bySeverity).map(([severity, count]) => (
            <div key={severity} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <div className={`inline-flex px-2 py-1 rounded text-xs font-medium mb-2 ${getSeverityColor(severity)}`}>
                {severity}
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">{count}</div>
            </div>
          ))}
        </div>
      )}

      {/* Scan Controls */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          Security Scans
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => runScan("duplicates")}
            disabled={scanning}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            Scan Duplicates
          </button>
          <button
            onClick={() => runScan("spam")}
            disabled={scanning}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2 disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            Scan Spam
          </button>
          <button
            onClick={() => runScan("mismatches")}
            disabled={scanning}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition flex items-center gap-2 disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            Scan Mismatches
          </button>
          <button
            onClick={() => runScan("all")}
            disabled={scanning}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
            Run All Scans
          </button>
        </div>
      </div>

      {/* Events List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <h2 className="font-semibold text-slate-900 dark:text-white">Fraud Events</h2>
          </div>

          {events.length === 0 ? (
            <div className="px-4 py-12 text-center text-slate-500">
              <Shield className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
              <p>No fraud events detected. System is secure!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {events.map(event => (
                <div key={event.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${getSeverityColor(event.severity)}`}>
                        {getTypeIcon(event.type)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                          {event.type.replace(/_/g, " ")}
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(event.severity)}`}>
                            {event.severity}
                          </span>
                        </div>
                        <div className="text-sm text-slate-500 mt-1">
                          User: {event.userName || "Unknown"} {event.userId && `(#${event.userId})`}
                        </div>
                        {event.metadata && (
                          <div className="text-xs text-slate-400 mt-1 font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded mt-2 max-w-xl overflow-x-auto">
                            {event.metadata}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 whitespace-nowrap">
                      {new Date(event.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
