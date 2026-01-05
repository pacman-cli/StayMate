"use client"

import { useAuth } from "@/context/AuthContext"
import { bookingApi } from "@/lib/api"
import { format } from "date-fns"
import { Calendar, Check, Clock, User as UserIcon, X } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

interface BookingRequest {
  id: number
  propertyId: number
  propertyTitle: string
  tenantName: string
  tenantEmail: string
  tenantProfilePictureUrl?: string
  startDate: string
  endDate: string
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED'
  notes?: string
  createdAt: string
}

export default function BookingRequestsPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<BookingRequest[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRequests = async () => {
    try {
      const data = await bookingApi.getBookingRequests()
      // @ts-ignore
      setRequests(data.content || data)
    } catch (error) {
      console.error("Failed to fetch booking requests", error)
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
      // Refresh list
      fetchRequests()
    } catch (error) {
      toast.error("Failed to update booking status")
    }
  }

  if (loading) return <div className="p-8"><div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" /></div>

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Booking Requests</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage incoming booking requests for your properties</p>
      </div>

      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <Clock className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">No pending requests</h3>
            <p className="text-slate-500">You're all caught up!</p>
          </div>
        ) : (
          requests.map((request) => (
            <div key={request.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                      {request.propertyTitle}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${request.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                        request.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                      }`}>
                      {request.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                      {request.tenantProfilePictureUrl ? (
                        <img src={request.tenantProfilePictureUrl} alt={request.tenantName} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-5 h-5 m-2.5 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{request.tenantName}</p>
                      <p className="text-xs text-slate-500">Tenant</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Check-in</p>
                        <p className="font-medium">{format(new Date(request.startDate), 'MMM dd, yyyy')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Check-out</p>
                        <p className="font-medium">{format(new Date(request.endDate), 'MMM dd, yyyy')}</p>
                      </div>
                    </div>
                  </div>

                  {request.notes && (
                    <div className="text-sm bg-blue-50 dark:bg-blue-900/10 text-blue-800 dark:text-blue-300 p-3 rounded-lg">
                      <span className="font-semibold block mb-1">Note from tenant:</span>
                      "{request.notes}"
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 justify-center border-l dark:border-slate-700 pl-0 md:pl-6">
                  {request.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleAction(request.id, 'CONFIRMED')}
                        className="flex items-center justify-center gap-2 w-full md:w-32 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                      >
                        <Check className="w-4 h-4" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleAction(request.id, 'REJECTED')}
                        className="flex items-center justify-center gap-2 w-full md:w-32 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-medium transition"
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
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
