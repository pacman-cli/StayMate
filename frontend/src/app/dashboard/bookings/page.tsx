"use client"

import { bookingApi } from "@/lib/api"
import { format } from "date-fns"
import { AlertTriangle, Calendar, CheckCircle2, Clock, User, XCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

// Safe date formatter that handles invalid dates
const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return 'N/A'
  try {
    return format(new Date(dateStr), 'MMM dd, yyyy')
  } catch {
    return 'Invalid Date'
  }
}

export default function BookingRequestsPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRequests = async () => {
    try {
      setError(null)
      const data = await bookingApi.getBookingRequests()
      // @ts-ignore
      const bookings = data?.content || data || []
      setRequests(Array.isArray(bookings) ? bookings : [])
    } catch (err: any) {
      console.error("Failed to fetch booking requests", err)
      setError(err?.message || "Failed to load booking requests")
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await bookingApi.updateStatus(id, status)
      toast.success(`Booking ${status.toLowerCase()} successfully`)
      fetchRequests() // Refresh list
    } catch (error) {
      toast.error("Failed to update status")
    }
  }

  if (loading) return <div className="p-8"><div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" /></div>

  if (error) {
    return (
      <div className="p-6 md:p-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-red-500" />
          <h2 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">Error Loading Bookings</h2>
          <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
          <button
            onClick={() => { setLoading(true); fetchRequests() }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Booking Requests</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage incoming booking requests from tenants</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {requests.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No pending booking requests found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Tenant</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Property</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Dates</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {requests.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                          {booking.tenantProfileUrl ? (
                            <img src={booking.tenantProfileUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{booking.tenantName || `User #${booking.tenantId || booking.userId || 'Unknown'}`}</p>
                          <p className="text-xs text-slate-500">View Profile</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">{booking.propertyTitle || 'Property'}</div>
                      <div className="text-xs text-slate-500">{booking.propertyLocation || booking.location || ''}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-sm text-slate-600 dark:text-slate-300">
                        <span>In: {formatDate(booking.startDate)}</span>
                        <span>Out: {formatDate(booking.endDate)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
                                                ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                          booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                            'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                        }`}
                      >
                        {booking.status === 'PENDING' && <Clock className="w-3 h-3" />}
                        {booking.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {booking.status === 'PENDING' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleStatusUpdate(booking.id, 'CONFIRMED')}
                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg tooltip"
                            title="Approve"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg tooltip"
                            title="Decline"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

