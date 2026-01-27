"use client"

import { financeApi } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import { EarningDto, PaymentDto, PayoutRequest } from "@/types/auth"
import { format } from "date-fns"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import AdminChart from "./AdminChart"

export default function AdminFinancePage() {
  const [activeTab, setActiveTab] = useState<"overview" | "payouts" | "transactions">("overview")
  const [payouts, setPayouts] = useState<PayoutRequest[]>([])
  const [payments, setPayments] = useState<PaymentDto[]>([])
  const [earnings, setEarnings] = useState<EarningDto[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Analytics State
  const [analytics, setAnalytics] = useState<any>(null)
  const [summary, setSummary] = useState<any>(null)

  // Payout Status filter
  const [payoutStatus, setPayoutStatus] = useState<string>("PENDING")

  const fetchAnalytics = async () => {
    try {
      const [analyticsData, summaryData] = await Promise.all([
        financeApi.getAnalyticsData(),
        financeApi.getAdminFinancialSummary()
      ])
      setAnalytics(analyticsData)
      setSummary(summaryData)
    } catch (e) {
      console.error("Failed to fetch analytics", e)
      toast.error("Failed to load analytics")
    }
  }

  const fetchPayouts = async () => {
    try {
      const data = await financeApi.getAllPayoutRequests(payoutStatus === "ALL" ? null : payoutStatus)
      // @ts-ignore
      setPayouts(data.content || [])
    } catch (e) {
      toast.error("Failed to load payouts")
    }
  }

  const fetchPayments = async () => {
    const data = await financeApi.getAllPayments()
    // @ts-ignore
    setPayments(data.content || [])
  }

  const fetchEarnings = async () => {
    const data = await financeApi.getAllEarnings()
    // @ts-ignore
    setEarnings(data.content || [])
  }

  useEffect(() => {
    setIsLoading(true)
    const loadData = async () => {
      if (activeTab === "payouts") await fetchPayouts()
      if (activeTab === "transactions") await Promise.all([fetchPayments(), fetchEarnings()])
      if (activeTab === "overview") await fetchAnalytics()
      setIsLoading(false)
    }
    loadData()
  }, [activeTab, payoutStatus])

  const handlePayoutAction = async (id: number, status: string, notes: string = "") => {
    try {
      await financeApi.processPayoutRequest(id, status, notes)
      toast.success(`Payout ${status.toLowerCase()} successfully`)
      fetchPayouts()
    } catch (error) {
      toast.error("Action failed")
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Financial Oversight</h1>
        <div className="flex gap-2">
          {["overview", "payouts", "transactions"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === tab
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500">Total Platform Revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(summary?.totalPlatformRevenue)}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500">Total Commissions</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(summary?.totalPlatformCommission)}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500">Pending Payouts</p>
              <p className="text-2xl font-bold text-yellow-600">{formatCurrency(summary?.pendingPayouts)}</p>
              <p className="text-xs text-slate-400">{summary?.pendingPayoutCount} requests</p>
            </div>
          </div>

          <AdminChart data={analytics?.revenueTrends} />
        </div>
      )}

      {activeTab === "payouts" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 dark:text-white">Payout Requests</h3>
            <select
              value={payoutStatus}
              onChange={(e) => setPayoutStatus(e.target.value)}
              className="px-3 py-1 rounded-md border text-sm"
            >
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="ALL">All</option>
            </select>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Method</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {payouts.map((r) => (
                <tr key={r.id}>
                  <td className="p-4">
                    <p className="font-medium text-slate-900 dark:text-white">
                      {r.user.firstName} {r.user.lastName}
                    </p>
                    <p className="text-xs text-slate-500">{r.user.email}</p>
                  </td>
                  <td className="p-4 font-mono font-bold">{formatCurrency(r.amount)}</td>
                  <td className="p-4 text-xs">
                    <p>{r.payoutMethod.bankName}</p>
                    <p className="opacity-70">{r.payoutMethod.accountNumber}</p>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${r.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : r.status === "APPROVED"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {r.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => handlePayoutAction(r.id, "APPROVED")}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handlePayoutAction(r.id, "REJECTED")}
                          className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-xs"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "transactions" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold">Recent Payments (In)</h3>
            </div>
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payments.map(p => (
                  <tr key={p.id}>
                    <td className="p-3">Booking #{p.bookingId}</td>
                    <td className="p-3 font-bold">{formatCurrency(p.amount)}</td>
                    <td className="p-3">{format(new Date(p.date), 'MM/dd')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold">Recent Earnings (Out/Held)</h3>
            </div>
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {earnings.map(e => (
                  <tr key={e.id}>
                    <td className="p-3 truncate max-w-[100px]">{e.propertyTitle}</td>
                    <td className="p-3 font-bold">{formatCurrency(e.netAmount)}</td>
                    <td className="p-3 text-green-600">+{formatCurrency(e.commission)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
