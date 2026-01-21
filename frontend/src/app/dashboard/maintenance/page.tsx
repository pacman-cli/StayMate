"use client"

import { useAuth } from "@/context/AuthContext"
import { maintenanceApi } from "@/lib/api"
import type { MaintenancePriority, MaintenanceResponseDto, MaintenanceStatus } from "@/types/auth"
import { AnimatePresence, motion } from "framer-motion"
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  Loader2,
  Pause,
  Plus,
  Send,
  Wrench,
  XCircle
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const statusConfig: Record<MaintenanceStatus, { color: string; icon: React.ReactNode; label: string }> = {
  OPEN: { color: "bg-blue-500/20 text-blue-400", icon: <Clock className="w-4 h-4" />, label: "Open" },
  IN_PROGRESS: { color: "bg-yellow-500/20 text-yellow-400", icon: <Loader2 className="w-4 h-4 animate-spin" />, label: "In Progress" },
  ON_HOLD: { color: "bg-orange-500/20 text-orange-400", icon: <Pause className="w-4 h-4" />, label: "On Hold" },
  RESOLVED: { color: "bg-green-500/20 text-green-400", icon: <CheckCircle2 className="w-4 h-4" />, label: "Resolved" },
  CLOSED: { color: "bg-gray-500/20 text-gray-400", icon: <XCircle className="w-4 h-4" />, label: "Closed" },
  CANCELLED: { color: "bg-red-500/20 text-red-400", icon: <XCircle className="w-4 h-4" />, label: "Cancelled" },
}

const priorityConfig: Record<MaintenancePriority, { color: string; label: string }> = {
  LOW: { color: "bg-gray-500/20 text-gray-400", label: "Low" },
  MEDIUM: { color: "bg-blue-500/20 text-blue-400", label: "Medium" },
  HIGH: { color: "bg-orange-500/20 text-orange-400", label: "High" },
  URGENT: { color: "bg-red-500/20 text-red-400", label: "Urgent" },
}

export default function MaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceResponseDto[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    propertyId: "",
    title: "",
    description: "",
    type: "MAINTENANCE",
    priority: "MEDIUM"
  })
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const data = await maintenanceApi.getMyRequests()
      setRequests(data.content || [])
    } catch (error) {
      console.error("Failed to fetch maintenance requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.propertyId || !formData.title || !formData.description) return

    setSubmitting(true)
    try {
      await maintenanceApi.createRequest({
        propertyId: parseInt(formData.propertyId),
        title: formData.title,
        description: formData.description,
        type: formData.type,
        priority: formData.priority
      })
      setShowForm(false)
      setFormData({ propertyId: "", title: "", description: "", type: "MAINTENANCE", priority: "MEDIUM" })
      fetchRequests()
    } catch (error) {
      console.error("Failed to create request:", error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Maintenance Requests</h1>
          <p className="text-white/60 mt-1">Report issues or request repairs for your stays</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500
            hover:from-blue-500 hover:to-blue-400 text-white rounded-xl transition-all duration-200
            shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-5 h-5" />
          New Request
        </button>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1a1f2e] border border-white/10 rounded-2xl p-6 w-full max-w-lg"
            >
              <h2 className="text-xl font-semibold text-white mb-4">Submit Maintenance Request</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-1">Property ID</label>
                  <input
                    type="number"
                    value={formData.propertyId}
                    onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white
                      focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none"
                    placeholder="Enter property ID"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white
                      focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none"
                    placeholder="Brief description of the issue"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white
                      focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none resize-none"
                    rows={3}
                    placeholder="Detailed description of the issue"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-1">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white
                        focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none"
                    >
                      <option value="MAINTENANCE">Maintenance</option>
                      <option value="COMPLAINT">Complaint</option>
                      <option value="IMPROVEMENT">Improvement</option>
                      <option value="EMERGENCY">Emergency</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-1">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white
                        focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600
                      hover:bg-blue-500 text-white rounded-xl transition-colors disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Submit
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="bg-[#1a1f2e]/50 border border-white/5 rounded-2xl p-12 text-center">
          <Wrench className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Maintenance Requests</h3>
          <p className="text-white/60 mb-6">You haven&apos;t submitted any maintenance requests yet.</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
          >
            Create Your First Request
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-[#1a1f2e]/50 border border-white/5 rounded-xl p-4 hover:border-white/10
                transition-all duration-200 group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5
                      ${statusConfig[request.status].color}`}>
                      {statusConfig[request.status].icon}
                      {statusConfig[request.status].label}
                    </span>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium
                      ${priorityConfig[request.priority].color}`}>
                      {priorityConfig[request.priority].label}
                    </span>
                    <span className="text-xs text-white/40">{request.type}</span>
                  </div>
                  <h3 className="text-white font-medium truncate">{request.title}</h3>
                  <p className="text-white/50 text-sm mt-1 line-clamp-2">{request.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-white/40">
                    <span>Property: {request.propertyTitle}</span>
                    <span>•</span>
                    <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/40 transition-colors shrink-0" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
