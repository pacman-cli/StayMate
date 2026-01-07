"use client"

import { adminApi } from "@/lib/api"
import { VerificationRequest } from "@/types/auth"
import { Calendar, Check, FileText, Loader2, X } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

export default function AdminVerificationsPage() {
  const [requests, setRequests] = useState<VerificationRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      const data = await adminApi.getVerifications()
      // Sort pending first
      const sorted = data.sort((a, b) => {
        if (a.status === 'PENDING' && b.status !== 'PENDING') return -1
        if (a.status !== 'PENDING' && b.status === 'PENDING') return 1
        return 0
      })
      setRequests(sorted)
    } catch (error) {
      toast.error("Failed to load verification requests")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: number) => {
    try {
      await adminApi.approveVerification(id)
      toast.success("Request approved")
      loadRequests()
    } catch (error) {
      toast.error("Failed to approve request", { duration: 4000 })
    }
  }

  const handleReject = async (id: number) => {
    const reason = prompt("Enter rejection reason:")
    if (!reason) return

    try {
      await adminApi.rejectVerification(id, reason)
      toast.success("Request rejected")
      loadRequests()
    } catch (error) {
      toast.error("Failed to reject request")
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Document Verification</h1>
        <p className="text-slate-500 text-sm">Review user uploaded identity documents.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin h-8 w-8 text-primary-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {requests.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              No verification requests found.
            </div>
          ) : (
            requests.map((req) => (
              <div key={req.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col md:flex-row">
                {/* Document Preview (Left) */}
                <div className="md:w-1/3 bg-slate-100 dark:bg-slate-900 relative min-h-[200px] md:min-h-0">
                  {req.documentUrl ? (
                    <img
                      src={req.documentUrl}
                      alt="Document"
                      className="w-full h-full object-cover absolute inset-0 cursor-pointer hover:opacity-90 transition"
                      onClick={() => window.open(req.documentUrl, '_blank')}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <FileText className="w-12 h-12 text-slate-400" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                    {req.documentType}
                  </div>
                </div>

                {/* Content (Right) */}
                <div className="p-6 md:w-2/3 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={req.user.profilePictureUrl || `https://ui-avatars.com/api/?name=${req.user.firstName}`}
                          alt=""
                          className="w-10 h-10 rounded-full bg-slate-200"
                        />
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white">
                            {req.user.firstName} {req.user.lastName}
                          </h3>
                          <p className="text-xs text-slate-500">{req.user.email}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                        req.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                        {req.status}
                      </span>
                    </div>

                    <div className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        Submitted: {new Date(req.createdAt).toLocaleDateString()}
                      </div>
                      {req.rejectionReason && (
                        <div className="mt-2 text-red-500 bg-red-50 dark:bg-red-900/10 p-2 rounded text-xs">
                          Reason: {req.rejectionReason}
                        </div>
                      )}
                    </div>
                  </div>

                  {req.status === 'PENDING' && (
                    <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                      <button
                        onClick={() => handleReject(req.id)}
                        className="flex-1 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium flex items-center justify-center gap-2"
                      >
                        <X className="w-4 h-4" /> Reject
                      </button>
                      <button
                        onClick={() => handleApprove(req.id)}
                        className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20"
                      >
                        <Check className="w-4 h-4" /> Approve
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
