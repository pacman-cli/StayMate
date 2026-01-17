"use client"

import Avatar from "@/components/common/Avatar"
import { supportApi } from "@/lib/api"
import { AlertCircle, Search } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("ALL")
  const [search, setSearch] = useState("")

  useEffect(() => {
    loadTickets()
  }, [])

  const loadTickets = async () => {
    try {
      const res = await supportApi.getAllTicketsAdmin()
      setTickets(res)
    } catch (error) {
      toast.error("Failed to load tickets")
    } finally {
      setLoading(false)
    }
  }

  const filteredTickets = tickets.filter(t => {
    const matchesFilter = filter === 'ALL' || t.status === filter
    const matchesSearch = t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.userName.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toString().includes(search)
    return matchesFilter && matchesSearch
  })

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Support Tickets</h1>
          <p className="text-slate-500 text-sm">Manage user support requests.</p>
        </div>

        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="ALL">All Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">Subject</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">User</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">Status</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">Priority</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">Updated</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredTickets.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900 dark:text-white">{ticket.subject}</div>
                  <div className="text-xs text-slate-500">{ticket.category}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Avatar name={ticket.userName || "User"} src={ticket.userAvatar} size="xs" />
                    <span className="text-sm font-medium">{ticket.userName}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${ticket.status === 'OPEN' ? 'bg-blue-100 text-blue-700' :
                    ticket.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' :
                      ticket.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-slate-100 text-slate-700'
                    }`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-bold flex items-center gap-1 ${ticket.priority === 'URGENT' ? 'text-red-500' :
                    ticket.priority === 'HIGH' ? 'text-orange-500' : 'text-slate-500'
                    }`}>
                    {ticket.priority === 'URGENT' && <AlertCircle className="w-3 h-3" />}
                    {ticket.priority}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {new Date(ticket.updatedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`/dashboard/admin/support/${ticket.id}`}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {filteredTickets.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  No support tickets found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
