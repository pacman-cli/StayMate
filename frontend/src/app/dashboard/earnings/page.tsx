"use client"

import { DollarSign, Download, TrendingUp, Wallet } from "lucide-react"

export default function EarningsPage() {
 return (
  <div className="p-6 md:p-8 space-y-6">
   <div className="flex justify-between items-end">
    <div>
     <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Earnings</h1>
     <p className="text-slate-500 dark:text-slate-400">Track your revenue and payout history</p>
    </div>
    <button className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-sm font-medium transition flex items-center gap-2">
     <Download className="w-4 h-4" />
     Export Report
    </button>
   </div>

   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
     <div className="flex items-center gap-4 mb-4">
      <div className="w-10 h-10 bg-green-100 dark:bg-green-500/20 text-green-600 rounded-full flex items-center justify-center">
       <DollarSign className="w-5 h-5" />
      </div>
      <h3 className="font-medium text-slate-700 dark:text-slate-300">Total Earnings</h3>
     </div>
     <p className="text-3xl font-bold text-slate-900 dark:text-white">$0.00</p>
     <p className="text-sm text-green-600 flex items-center gap-1 mt-2">
      <TrendingUp className="w-4 h-4" />
      +0% this month
     </p>
    </div>

    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
     <div className="flex items-center gap-4 mb-4">
      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/20 text-blue-600 rounded-full flex items-center justify-center">
       <Wallet className="w-5 h-5" />
      </div>
      <h3 className="font-medium text-slate-700 dark:text-slate-300">Available Payout</h3>
     </div>
     <p className="text-3xl font-bold text-slate-900 dark:text-white">$0.00</p>
     <button className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
      Withdraw Funds
     </button>
    </div>

    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center text-center">
     <h3 className="font-medium text-slate-900 dark:text-white mb-2">Payout Method</h3>
     <p className="text-sm text-slate-500 mb-4">No payout method added</p>
     <button className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition">
      Add Bank Account
     </button>
    </div>
   </div>

   <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
    <Wallet className="w-12 h-12 text-slate-300 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No transaction history</h3>
    <p className="text-slate-500 max-w-sm mx-auto">
     Once you start receiving bookings, your detailed transaction history will appear here.
    </p>
   </div>
  </div>
 )
}
