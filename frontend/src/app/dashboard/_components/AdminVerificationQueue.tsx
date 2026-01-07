"use client"

import { adminApi } from "@/lib/api"
import { VerificationRequest } from "@/types/auth"
import { Check, Clock, ExternalLink, Shield, X } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

interface AdminVerificationQueueProps {
  isDark: boolean
}

export function AdminVerificationQueue({ isDark }: AdminVerificationQueueProps) {
  const [requests, setRequests] = useState<VerificationRequest[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRequests = async () => {
    try {
      const data = await adminApi.getVerifications()
      setRequests(data)
    } catch (error) {
      console.error("Failed to fetch verification requests", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleApprove = async (id: number) => {
    try {
      if (!confirm("Approve this user's verification?")) return
      await adminApi.approveVerification(id)
      toast.success("Verification approved")
      fetchRequests()
    } catch (error) {
      toast.error("Failed to approve")
    }
  }

  const handleReject = async (id: number) => {
    const reason = prompt("Enter rejection reason:")
    if (!reason) return

    try {
      await adminApi.rejectVerification(id, reason)
      toast.success("Verification rejected")
      fetchRequests()
    } catch (error) {
      toast.error("Failed to reject")
    }
  }

  if (loading) return <div className="p-4 text-center">Loading requests...</div>

  return (
    <div className={`rounded-3xl border p-6 h-full ${isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-100"}`}>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              Verification Queue
            </h3>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {requests.length} pending reviews
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
        {requests.length === 0 ? (
          <div className="text-center py-12 text-slate-400 flex flex-col items-center">
            <Check className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-sm">All caught up! No pending requests.</span>
          </div>
        ) : (
          requests.map((req) => (
            <div
              key={req.id}
              className={`rounded-2xl p-4 transition-all ${isDark ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-200">
                    {req.user.profilePictureUrl ? (
                      <img src={req.user.profilePictureUrl} alt={req.user.fullName || "User"} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-400 font-bold">
                        {req.user.firstName?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                      {req.user.fullName}
                    </h4>
                    <p className="text-xs text-slate-500">{req.documentType}</p>
                  </div>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(req.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="mb-3">
                <a
                  href={req.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs flex items-center gap-1 text-blue-500 hover:underline bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg w-full justify-center"
                >
                  <ExternalLink className="w-3 h-3" /> View Document
                </a>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(req.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 transition-colors"
                >
                  <Check className="w-3 h-3" /> Approve
                </button>
                <button
                  onClick={() => handleReject(req.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors"
                >
                  <X className="w-3 h-3" /> Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
