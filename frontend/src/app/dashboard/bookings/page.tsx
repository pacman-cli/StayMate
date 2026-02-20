"use client"

import AnimatedCard from "@/components/common/AnimatedCard"
import EmptyState from "@/components/common/EmptyState"
import PageContainer from "@/components/common/PageContainer"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { bookingApi } from "@/lib/api"
import { BookingRequest } from "@/types/auth"
import { format } from "date-fns"
import { Calendar, Check, Clock, User as UserIcon, X } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

export default function BookingRequestsPage() {
  const { isDark } = useTheme()
  const { user } = useAuth()
  const [requests, setRequests] = useState<BookingRequest[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRequests = async () => {
    try {
      const data = await bookingApi.getBookingRequests()
      // @ts-ignore - Handle potential page object or array
      setRequests(data.content || data)
    } catch (error) {
      console.error("Failed to fetch booking requests", error)
      toast.error("Failed to load booking requests")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleAction = async (id: number, status: 'CONFIRMED' | 'REJECTED') => {
    try {
      await bookingApi.updateStatus(id, status)
      toast.success(`Booking ${status.toLowerCase()} successfully`)
      fetchRequests()
    } catch (error) {
      toast.error("Failed to update booking status")
    }
  }

  if (loading) return (
    <div className="p-8 flex justify-center">
      <div className="w-8 h-8 rounded-full border-4 border-primary-600 border-t-transparent animate-spin" />
    </div>
  )

  return (
    <PageContainer
      title="Booking Requests"
      description="Manage incoming booking requests for your properties"
    >
      <div className="space-y-4">
        {requests.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No pending requests"
            description="You're all caught up! No new booking requests at the moment."
          />
        ) : (
          requests.map((request, index) => (
            <AnimatedCard
              key={request.id}
              delay={index * 0.1}
              className="flex flex-col md:flex-row justify-between gap-6 p-6"
            >
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <h3 className={`font-bold text-lg ${isDark ? "text-white" : "text-slate-900"}`}>
                    {request.propertyTitle}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${request.status === 'PENDING'
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                    : request.status === 'CONFIRMED'
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800"
                    }`}>
                    {request.status}
                  </span>
                </div>

                <div className={`flex items-center gap-4 p-3 rounded-xl border ${isDark ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                    {request.tenantProfilePictureUrl ? (
                      <img src={request.tenantProfilePictureUrl} alt={request.tenantName} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-5 h-5 m-2.5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <p className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{request.tenantName}</p>
                    <p className="text-xs text-slate-500">Tenant</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className={`flex items-center gap-2 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Check-in</p>
                      <p className="font-medium">{format(new Date(request.startDate), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Check-out</p>
                      <p className="font-medium">{format(new Date(request.endDate), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                </div>

                {request.notes && (
                  <div className={`text-sm p-3 rounded-lg border ${isDark ? "bg-blue-900/10 text-blue-300 border-blue-900/30" : "bg-blue-50 text-blue-800 border-blue-100"}`}>
                    <span className="font-semibold block mb-1">Note from tenant:</span>
                    "{request.notes}"
                  </div>
                )}
              </div>

              <div className="flex flex-row md:flex-col items-center justify-end gap-3 pt-4 md:pt-0 md:pl-6 border-t md:border-t-0 md:border-l border-slate-200 dark:border-dark-700 min-w-[140px]">
                {request.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleAction(request.id, 'CONFIRMED')}
                      className="flex items-center justify-center gap-2 w-full md:w-32 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition shadow-lg shadow-green-900/20"
                    >
                      <Check className="w-4 h-4" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleAction(request.id, 'REJECTED')}
                      className={`flex items-center justify-center gap-2 w-full md:w-32 px-4 py-2 border rounded-lg font-medium transition ${isDark
                        ? "border-red-900/50 text-red-400 hover:bg-red-900/20"
                        : "border-red-200 text-red-600 hover:bg-red-50"
                        }`}
                    >
                      <X className="w-4 h-4" />
                      Decline
                    </button>
                  </>
                )}
                <p className="text-xs text-slate-400 text-center mt-2">
                  Received {format(new Date(request.createdAt), 'MMM dd')}
                </p>
              </div>
            </AnimatedCard>
          ))
        )}
      </div>
    </PageContainer>
  )
}
