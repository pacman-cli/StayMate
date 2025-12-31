"use client"

import { DollarSign, AlertCircle, CreditCard } from "lucide-react"

export function RevenueAnalytics() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Financial Overview</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-900 dark:text-indigo-200">Net Revenue</span>
          </div>
          <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">BDT 2,450,000</p>
          <p className="text-xs text-indigo-600/70 mt-1">+12% vs last month</p>
        </div>

        <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-900 dark:text-emerald-200">Avg. Booking Value</span>
          </div>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">BDT 15,200</p>
          <p className="text-xs text-emerald-600/70 mt-1">-2% vs last month</p>
        </div>

        <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <span className="text-sm font-medium text-rose-900 dark:text-rose-200">Refunds Processed</span>
          </div>
          <p className="text-2xl font-bold text-rose-700 dark:text-rose-300">BDT 45,000</p>
          <p className="text-xs text-rose-600/70 mt-1">3.2% of total volume</p>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Payment Methods</h4>
        {/* Simple progress bars for now */}
        <div className="space-y-3">
          <PaymentMethodRow method="bKash" percent={65} color="bg-pink-500" />
          <PaymentMethodRow method="Credit Card" percent={25} color="bg-blue-500" />
          <PaymentMethodRow method="Nagad" percent={10} color="bg-orange-500" />
        </div>
      </div>
    </div>
  )
}

function PaymentMethodRow({ method, percent, color }: any) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-24 text-sm font-medium text-slate-600 dark:text-slate-300">{method}</div>
      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${percent}%` }}></div>
      </div>
      <div className="w-12 text-sm text-right text-slate-500">{percent}%</div>
    </div>
  )
}
