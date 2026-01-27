"use client"

import { useState } from "react"

export function RecentDataTables() {
  const [activeTab, setActiveTab] = useState("users")

  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-dark-700 shadow-sm overflow-hidden">
      <div className="flex border-b border-slate-200 dark:border-dark-700">
        <TabButton label="Recent Users" id="users" active={activeTab} onClick={setActiveTab} />
        <TabButton label="Latest Listings" id="listings" active={activeTab} onClick={setActiveTab} />
        <TabButton label="Transactions" id="transactions" active={activeTab} onClick={setActiveTab} />
      </div>

      <div className="p-0">
        {activeTab === "users" && <UsersTable />}
        {activeTab === "listings" && <ListingsTable />}
        {activeTab === "transactions" && <TransactionsTable />}
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-dark-700 text-center">
        <button className="text-sm font-medium text-primary-600 hover:text-primary-700">View All Records</button>
      </div>
    </div>
  )
}

function TabButton({ label, id, active, onClick }: any) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${active === id
          ? "border-primary-600 text-primary-600 dark:text-primary-400"
          : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
        }`}
    >
      {label}
    </button>
  )
}

// Sub-tables with dummy data for UI demo
function UsersTable() {
  return (
    <table className="w-full text-sm text-left">
      <thead className="bg-slate-50 dark:bg-dark-750 text-slate-500 font-medium">
        <tr>
          <th className="px-6 py-3">User</th>
          <th className="px-6 py-3">Role</th>
          <th className="px-6 py-3">Status</th>
          <th className="px-6 py-3 text-right">Date</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-dark-700">
        {[1, 2, 3, 4, 5].map((i) => (
          <tr key={i} className="hover:bg-slate-50 dark:hover:bg-dark-750/50">
            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">User {i}</td>
            <td className="px-6 py-4 text-slate-500">Tenant</td>
            <td className="px-6 py-4"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">Active</span></td>
            <td className="px-6 py-4 text-right text-slate-500">2 mins ago</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function ListingsTable() {
  return (
    <table className="w-full text-sm text-left">
      <thead className="bg-slate-50 dark:bg-dark-750 text-slate-500 font-medium">
        <tr>
          <th className="px-6 py-3">Property</th>
          <th className="px-6 py-3">Location</th>
          <th className="px-6 py-3">Price</th>
          <th className="px-6 py-3 text-right">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-dark-700">
        {[1, 2, 3, 4, 5].map((i) => (
          <tr key={i} className="hover:bg-slate-50 dark:hover:bg-dark-750/50">
            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">Luxury Apt {i}</td>
            <td className="px-6 py-4 text-slate-500">Gulshan 2</td>
            <td className="px-6 py-4 text-slate-500">BDT 25,000</td>
            <td className="px-6 py-4 text-right"><span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">Pending</span></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function TransactionsTable() {
  return (
    <table className="w-full text-sm text-left">
      <thead className="bg-slate-50 dark:bg-dark-750 text-slate-500 font-medium">
        <tr>
          <th className="px-6 py-3">ID</th>
          <th className="px-6 py-3">User</th>
          <th className="px-6 py-3">Amount</th>
          <th className="px-6 py-3 text-right">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-dark-700">
        {[1, 2, 3, 4, 5].map((i) => (
          <tr key={i} className="hover:bg-slate-50 dark:hover:bg-dark-750/50">
            <td className="px-6 py-4 font-mono text-xs text-slate-500">#TRX-{3992 + i}</td>
            <td className="px-6 py-4 text-slate-900 dark:text-white">John Doe</td>
            <td className="px-6 py-4 font-medium">BDT 12,500</td>
            <td className="px-6 py-4 text-right"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">Success</span></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
