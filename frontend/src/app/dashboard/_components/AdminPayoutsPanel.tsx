"use client"

import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Loader2,
  RefreshCw,
  TrendingUp,
  XCircle
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

interface AdminFinancialSummary {
  totalPlatformRevenue: number
  totalPlatformCommission: number
  totalOwnerEarnings: number
  pendingPayouts: number
  processingPayouts: number
  completedPayouts: number
  totalPayoutRequests: number
  pendingPayoutCount: number
}

interface PayoutRequest {
  id: number
  amount: number
  status: string
  createdAt: string
  processedAt?: string
  adminNote?: string
  user: {
    id: number
    firstName: string
    lastName: string
    email: string
  }
  payoutMethod: {
    bankName: string
    accountNumber: string
  }
}

export function AdminPayoutsPanel({ isDark }: { isDark: boolean }) {
  const [summary, setSummary] = useState<AdminFinancialSummary | null>(null)
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("PENDING")

  const fetchData = async () => {
    try {
      const { adminApi } = await import("@/lib/api")

      // Fetch summary
      const summaryRes = await adminApi.getFinancialSummary?.() || null
      setSummary(summaryRes)

      // Fetch payout requests
      const requestsRes = await adminApi.getPayoutRequests?.(statusFilter) || { content: [] }
      setPayoutRequests(requestsRes.content || [])
    } catch (error) {
      console.error("Failed to fetch admin financial data", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [statusFilter])

  const handleProcess = async (id: number, status: string) => {
    setProcessingId(id)
    try {
      const { adminApi } = await import("@/lib/api")
      await adminApi.processPayoutRequest?.(id, status)
      toast.success(`Payout ${status.toLowerCase()} successfully`)
      fetchData()
    } catch (error) {
      toast.error("Failed to process payout")
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400 animate-pulse bg-slate-200 rounded-lg w-64 h-8" />
          <Skeleton className="h-9 w-9" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl w-full" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    )
  }

  const summaryCards = [
    {
      label: "Platform Revenue",
      value: `$${(summary?.totalPlatformRevenue || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: "emerald"
    },
    {
      label: "Platform Commission",
      value: `$${(summary?.totalPlatformCommission || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "blue"
    },
    {
      label: "Pending Payouts",
      value: `$${(summary?.pendingPayouts || 0).toLocaleString()}`,
      icon: Clock,
      color: "amber",
      count: summary?.pendingPayoutCount
    },
    {
      label: "Completed Payouts",
      value: `$${(summary?.completedPayouts || 0).toLocaleString()}`,
      icon: CheckCircle,
      color: "green"
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
          Earnings & Payouts Management
        </h2>
        <button
          onClick={() => fetchData()}
          className={`p-2 rounded-lg transition ${isDark ? "hover:bg-slate-700" : "hover:bg-slate-100"}`}
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <div
            key={i}
            className={`p-5 rounded-xl border ${isDark
              ? "bg-slate-800/90 border-slate-700"
              : "bg-white border-slate-200"}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg bg-${card.color}-100 dark:bg-${card.color}-500/20`}>
                <card.icon className={`w-5 h-5 text-${card.color}-600`} />
              </div>
              <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {card.label}
              </span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              {card.value}
            </p>
            {card.count !== undefined && (
              <p className="text-xs text-amber-500 mt-1">{card.count} pending requests</p>
            )}
          </div>
        ))}
      </div>

      {/* Status Filter */}
      <div className="flex gap-2">
        {["PENDING", "PROCESSING", "PAID", "REJECTED"].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${statusFilter === status
              ? "bg-blue-600 text-white"
              : isDark
                ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Payout Requests Table */}
      <div className={`rounded-xl border overflow-hidden ${isDark ? "border-slate-700" : "border-slate-200"}`}>
        <table className="w-full">
          <thead className={isDark ? "bg-slate-800" : "bg-slate-50"}>
            <tr className="text-left text-sm">
              <th className="p-4 font-medium">Owner</th>
              <th className="p-4 font-medium">Amount</th>
              <th className="p-4 font-medium">Bank</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? "divide-slate-700" : "divide-slate-100"}`}>
            {payoutRequests.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  No {statusFilter.toLowerCase()} payout requests
                </td>
              </tr>
            ) : (
              payoutRequests.map(req => (
                <tr key={req.id} className={isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-50"}>
                  <td className="p-4">
                    <p className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                      {req.user?.firstName} {req.user?.lastName}
                    </p>
                    <p className="text-xs text-slate-500">{req.user?.email}</p>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-lg">${req.amount?.toLocaleString()}</span>
                  </td>
                  <td className="p-4">
                    <p className="text-sm">{req.payoutMethod?.bankName}</p>
                    <p className="text-xs text-slate-500">{req.payoutMethod?.accountNumber}</p>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${req.status === "PAID" ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" :
                      req.status === "PENDING" ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" :
                        req.status === "PROCESSING" ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400" :
                          "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                      }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-500">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    {req.status === "PENDING" && (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleProcess(req.id, "PAID")}
                          disabled={processingId === req.id}
                          className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                        >
                          {processingId === req.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                          Approve
                        </button>
                        <button
                          onClick={() => handleProcess(req.id, "REJECTED")}
                          disabled={processingId === req.id}
                          className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
                        >
                          <XCircle className="w-3 h-3" />
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
