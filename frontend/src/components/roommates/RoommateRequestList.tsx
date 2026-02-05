"use client"

import { roommateApi } from "@/lib/api"
import { RoommateRequest } from "@/types/auth"
import { Check, CheckCheck, Loader2, User as UserIcon, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export const RoommateRequestList = () => {
  const [requests, setRequests] = useState<RoommateRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [processingId, setProcessingId] = useState<number | null>(null)
  const router = useRouter()

  const fetchRequests = async () => {
    try {
      const data = await roommateApi.getIncomingRequests()
      // Sort: Accepted first, then Pending
      data.sort((a: RoommateRequest, b: RoommateRequest) => {
        if (a.status === 'ACCEPTED' && b.status !== 'ACCEPTED') return -1
        if (a.status !== 'ACCEPTED' && b.status === 'ACCEPTED') return 1
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
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
    setProcessingId(requestId)
    try {
      await roommateApi.respondToRequest(requestId, accept)
      toast.success(accept ? "Request accepted! Ad is now hidden." : "Request rejected")
      await fetchRequests()
    } catch (error) {
      toast.error("Failed to respond to request")
    } finally {
      setProcessingId(null)
    }
  }

  const handleFinalize = async () => {
    if (!confirm("Are you sure? This will mark your ad as MATCHED and you cannot undo this easily.")) return
    try {
      await roommateApi.finalizeMatch()
      toast.success("Match finalized! Congratulations.")
      router.push("/dashboard") // Or stay here?
    } catch (e) {
      toast.error("Failed to finalize match")
    }
  }

  const handleCancelMatch = async (requestId: number) => {
    if (!confirm("Cancel this match? Your ad will be OPEN again.")) return
    setProcessingId(requestId)
    try {
      await roommateApi.cancelMatch(requestId)
      toast.success("Match cancelled. Ad is now OPEN.")
      await fetchRequests()
    } catch (e) {
      toast.error("Failed to cancel match")
    } finally {
      setProcessingId(null)
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
      {requests.map((request) => {
        const isAccepted = request.status === 'ACCEPTED'
        const isPending = request.status === 'PENDING'

        return (
          <div key={request.id} className={`p-4 rounded-lg shadow-sm border flex flex-col gap-4
            ${isAccepted
              ? "bg-emerald-50/50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-500/30 ring-1 ring-emerald-500/20"
              : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700"
            }`}>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                  {request.requester.profilePictureUrl ? (
                    <img src={request.requester.profilePictureUrl} alt={request.requester.fullName || "User"} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-900 dark:text-white">{request.requester.fullName}</p>
                    {isAccepted && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold dark:bg-emerald-500/20 dark:text-emerald-400">
                        Partner (Pending Match)
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mb-1">
                    {isAccepted ? "You accepted this request" : "Wants to be your roommate"}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {isAccepted ? (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleCancelMatch(request.id)}
                      disabled={processingId === request.id}
                      className="text-sm text-slate-500 hover:text-slate-700 hover:underline dark:text-slate-400"
                    >
                      Cancel Match
                    </button>
                    <button
                      onClick={handleFinalize}
                      disabled={processingId === request.id}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition flex items-center gap-2"
                    >
                      <CheckCheck className="w-4 h-4" />
                      Finalize Match
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => handleRespond(request.id, true)}
                      disabled={processingId === request.id}
                      className="p-2 bg-emerald-100 text-emerald-600 rounded-full hover:bg-emerald-200 transition-colors disabled:opacity-50"
                      title="Accept"
                    >
                      {processingId === request.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleRespond(request.id, false)}
                      disabled={processingId === request.id}
                      className="p-2 bg-rose-100 text-rose-600 rounded-full hover:bg-rose-200 transition-colors disabled:opacity-50"
                      title="Reject"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {request.message && (
              <div className="pl-14">
                <p className="text-sm text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-700 inline-block">
                  "{request.message}"
                </p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
