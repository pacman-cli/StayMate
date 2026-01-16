"use client"

import { useAuth } from "@/context/AuthContext"
import { supportApi } from "@/lib/api"
import { AlertCircle, MessageSquare, Plus } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

export default function SupportPage() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [formData, setFormData] = useState({
    subject: "",
    category: "General",
    priority: "MEDIUM",
    message: ""
  })

  useEffect(() => {
    loadTickets()
  }, [])

  const loadTickets = async () => {
    try {
      const res = await supportApi.getMyTickets()
      setTickets(res)
    } catch (error: any) {
      console.error(error)
      const message = error.response?.data?.message || "Failed to load tickets"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await supportApi.createTicket(formData)
      toast.success("Ticket created")
      setShowCreate(false)
      loadTickets()
      setFormData({
        subject: "",
        category: "General",
        priority: "MEDIUM",
        message: ""
      })
    } catch (error) {
      toast.error("Failed to create ticket")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Help & Support</h1>
          <p className="text-slate-500 text-sm">Contact our support team for any issues.</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Ticket
        </button>
      </div>

      {showCreate && (
        <div className="mb-8 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 animate-fade-in-down">
          <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Create New Ticket</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-primary-500"
                  placeholder="What's the issue?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-primary-500"
                >
                  <option value="General">General Inquiry</option>
                  <option value="Billing">Billing & Payments</option>
                  <option value="Technical">Technical Issue</option>
                  <option value="Account">Account Support</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                <option value="LOW">Low - Not urgent</option>
                <option value="MEDIUM">Medium - Normal issue</option>
                <option value="HIGH">High - Important</option>
                <option value="URGENT">Urgent - Critical issue</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Message</label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="Describe your issue in detail..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Submit Ticket
              </button>
            </div>
          </form>
        </div>
      )}

      {tickets.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
          <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No tickets yet</h3>
          <p className="text-slate-500">Need help? Create a new support ticket above.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tickets.map(ticket => (
            <Link
              href={`/dashboard/support/${ticket.id}`}
              key={ticket.id}
              className="block bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-500 transition-colors group"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${ticket.status === 'OPEN' ? 'bg-blue-100 text-blue-700' :
                      ticket.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' :
                        ticket.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-slate-100 text-slate-700'
                      }`}>
                      {ticket.status}
                    </span>
                    <span className="text-xs text-slate-500">{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">
                    {ticket.subject}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-1">
                    {ticket.category} • Priority: {ticket.priority}
                  </p>
                </div>
                <div className="text-slate-400">
                  <AlertCircle className={`w-5 h-5 ${ticket.priority === 'URGENT' ? 'text-red-500' :
                    ticket.priority === 'HIGH' ? 'text-orange-500' : ''
                    }`} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
