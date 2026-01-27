"use client"

import { financeApi } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import { EarningDto, EarningsSummaryResponse, PayoutMethodDto } from "@/types/auth"
import { format } from "date-fns"
import { CheckCircle, CreditCard, DollarSign, Download, Plus, Trash2, Wallet } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import AddPayoutMethodModal from "./AddPayoutMethodModal"
import RevenueChart from "./RevenueChart"

export default function EarningsPage() {
  const [summary, setSummary] = useState<EarningsSummaryResponse | null>(null)
  const [payoutMethods, setPayoutMethods] = useState<PayoutMethodDto[]>([])
  const [history, setHistory] = useState<EarningDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false)
  const [isRequestingPayout, setIsRequestingPayout] = useState(false)

  const fetchData = async () => {
    try {
      const [summaryData, methodsData, historyData] = await Promise.all([
        financeApi.getEarningsSummary(),
        financeApi.getPayoutMethods(),
        financeApi.getHistory(0, 100) // Increase to 100 for chart
      ])
      setSummary(summaryData)
      setPayoutMethods(methodsData)
      setPayoutMethods(methodsData)
      const historyResponse = historyData as unknown as { content: EarningDto[] }
      setHistory(historyResponse.content || [])
      setIsLoading(false)
    } catch (error) {
      console.error("Failed to fetch earnings data", error)
      toast.error("Failed to load earnings data")
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleRequestPayout = async () => {
    if (!payoutMethods.length) {
      toast.error("Please add a payout method first")
      return
    }
    if (!summary?.availableBalance || summary.availableBalance <= 0) {
      toast.error("No available balance to withdraw")
      return
    }

    if (!confirm("Are you sure you want to request a payout of " + formatCurrency(summary.availableBalance) + "?")) return

    setIsRequestingPayout(true)
    try {
      await financeApi.requestPayout()
      toast.success("Payout requested successfully")
      fetchData() // Refresh data
    } catch (error) {
      toast.error("Failed to request payout")
    } finally {
      setIsRequestingPayout(false)
    }
  }

  const handleDeleteMethod = async (id: number) => {
    if (!confirm("Remove this bank account?")) return
    try {
      await financeApi.deletePayoutMethod(id)
      toast.success("Payout method removed")
      fetchData()
    } catch (error) {
      toast.error("Failed to remove payout method")
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center">Loading earnings...</div>
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Earnings & Payouts</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your revenue and withdrawal settings</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                await financeApi.exportReport()
                toast.success("CSV Report downloaded!")
              } catch (error) {
                toast.error("Failed to export CSV")
              }
            }}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl text-sm font-medium transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={async () => {
              try {
                await financeApi.exportPdf()
                toast.success("PDF Report downloaded!")
              } catch (error) {
                toast.error("Failed to export PDF")
              }
            }}
            className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl text-sm font-medium transition flex items-center gap-2 border border-red-200 dark:border-red-800"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Earnings */}
        <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl border border-slate-200 dark:border-dark-700 shadow-sm relative overflow-hidden group hover:shadow-elevation-low transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign className="w-24 h-24 text-green-500" />
          </div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800/50 rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-slate-700 dark:text-slate-300">Total Earnings</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white relative z-10">
            {formatCurrency(summary?.totalEarnings)}
          </p>
          <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1 mt-2 relative z-10">
            <CheckCircle className="w-4 h-4" />
            Lifetime Gross Revenue
          </p>
        </div>

        {/* Available Balance */}
        <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl border border-slate-200 dark:border-dark-700 shadow-sm relative overflow-hidden hover:shadow-elevation-low transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wallet className="w-24 h-24 text-blue-500" />
          </div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 rounded-full flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-slate-700 dark:text-slate-300">Available Payout</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white relative z-10">
            {formatCurrency(summary?.availableBalance)}
          </p>
          <button
            onClick={handleRequestPayout}
            disabled={!summary?.availableBalance || summary.availableBalance <= 0 || isRequestingPayout}
            className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 relative z-10 shadow-lg shadow-blue-900/20"
          >
            {isRequestingPayout ? "Processing..." : "Request Payout"}
          </button>
          {summary?.pendingEarnings ? (
            <p className="text-xs text-slate-500 mt-2 text-center relative z-10">
              {formatCurrency(summary.pendingEarnings)} pending clearance
            </p>
          ) : null}
        </div>

        {/* Payout Method */}
        <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl border border-slate-200 dark:border-dark-700 shadow-sm flex flex-col justify-between hover:shadow-elevation-low transition-all">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50 rounded-full flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="font-medium text-slate-700 dark:text-slate-300">Bank Account</h3>
            </div>
            {payoutMethods.length > 0 ? (
              <div className="mb-4">
                <p className="font-semibold text-slate-900 dark:text-white">{payoutMethods[0].bankName}</p>
                <p className="text-slate-500 font-mono text-sm">{payoutMethods[0].accountNumber}</p>
                <p className="text-xs text-slate-400 mt-1">{payoutMethods[0].currency} • {payoutMethods[0].accountHolderName}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-500 mb-4">No payout method added yet.</p>
            )}
          </div>

          {payoutMethods.length > 0 ? (
            <button
              onClick={() => handleDeleteMethod(payoutMethods[0].id)}
              className="w-full py-2 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium transition flex justify-center items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Remove Account
            </button>
          ) : (
            <button
              onClick={() => setIsPayoutModalOpen(true)}
              className="w-full py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-sm font-medium transition flex justify-center items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Bank Account
            </button>
          )}
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-dark-700 p-6">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6">Revenue Trend</h3>
        <RevenueChart earnings={history} />
      </div>

      {/* Transactions History */}
      <div className="bg-white dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-dark-700 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-dark-700">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Transaction History</h3>
        </div>

        {history.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Wallet className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No transactions yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-dark-750 text-slate-500 font-medium">
                <tr>
                  <th className="p-4">Date</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Amount</th>
                  <th className="p-4 text-right">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-700">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-dark-750/50 transition">
                    <td className="p-4 text-slate-500">
                      {item.date ? format(new Date(item.date), 'MMM dd, yyyy') : 'N/A'}
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-slate-900 dark:text-white">Booking #{item.bookingId}</p>
                      <p className="text-xs text-slate-500">{item.propertyTitle}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === 'AVAILABLE' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800' :
                        item.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800' :
                          item.status === 'PAID' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800' :
                            'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-right text-slate-500">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="p-4 text-right font-medium text-slate-900 dark:text-white">
                      +{formatCurrency(item.netAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddPayoutMethodModal
        isOpen={isPayoutModalOpen}
        onClose={() => setIsPayoutModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  )
}
