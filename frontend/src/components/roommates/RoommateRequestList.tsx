"use client"

import { roommateApi } from "@/lib/api"
import { RoommateRequest } from "@/types/auth"
import { Check, User as UserIcon, X } from "lucide-react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export const RoommateRequestList = () => {
  const [requests, setRequests] = useState<RoommateRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchRequests = async () => {
    try {
      const data = await roommateApi.getIncomingRequests()
      setRequests(data)
    } catch (error) {
      console.error("Failed to fetch requests", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleRespond = async (requestId: number, accept: boolean) => {
    try {
      await roommateApi.respondToRequest(requestId, accept)
      toast.success(accept ? "Request accepted!" : "Request rejected")
      fetchRequests() // Refresh list
    } catch (error) {
      toast.error("Failed to respond to request")
    }
  }

  if (isLoading) return <div className="text-center p-4">Loading requests...</div>

  if (requests.length === 0) {
    return (
      <div className="text-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
        <p className="text-slate-500">No pending roommate requests.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Incoming Requests</h3>
      {requests.map((request) => (
        <div key={request.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
              {request.requester.profilePictureUrl ? (
                <img src={request.requester.profilePictureUrl} alt={request.requester.fullName || "User"} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <div>
              <p className="font-medium text-slate-900 dark:text-white">{request.requester.fullName}</p>
              <p className="text-sm text-slate-500 mb-1">Wants to be your roommate</p>
              {request.message && (
                <p className="text-sm text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-700">
                  "{request.message}"
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleRespond(request.id, true)}
              className="p-2 bg-emerald-100 text-emerald-600 rounded-full hover:bg-emerald-200 transition-colors"
              title="Accept"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleRespond(request.id, false)}
              className="p-2 bg-rose-100 text-rose-600 rounded-full hover:bg-rose-200 transition-colors"
              title="Reject"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
