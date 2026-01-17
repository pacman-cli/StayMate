"use client"

import DashboardLayout from "@/components/DashboardLayout"
import { useAuth } from "@/context/AuthContext"
import { bookingApi } from "@/lib/api"
import { format } from "date-fns"
import { Calendar, CheckCircle2, Clock, MapPin, XCircle } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface Booking {
    id: number
    propertyId: number
    propertyTitle: string
    propertyImage: string
    propertyAddress: string // or location
    landlordName: string
    landlordId: number
    startDate: string
    endDate: string
    status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED'
    totalPrice?: number
    notes?: string
    createdAt: string
}

import { ReviewModal } from "@/components/reviews/ReviewModal"
import { reviewApi } from "@/lib/api"
import toast from "react-hot-toast"

export default function MyBookingsPage() {
    const { user } = useAuth()
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

    const fetchBookings = async () => {
        try {
            const data = await bookingApi.getMyBookings()
            // @ts-ignore
            setBookings(data.content || data)
        } catch (error) {
            console.error("Failed to fetch bookings", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBookings()
    }, [])

    const handleOpenReview = (booking: Booking) => {
        setSelectedBooking(booking)
        setIsReviewModalOpen(true)
    }

    const handleSubmitReview = async (rating: number, comment: string) => {
        if (!selectedBooking) return

        try {
            await reviewApi.create({
                propertyId: selectedBooking.propertyId,
                receiverId: selectedBooking.landlordId,
                rating,
                comment,
            })
            toast.success("Review submitted successfully!")
            setIsReviewModalOpen(false)
            setSelectedBooking(null)
        } catch (error) {
            console.error("Failed to submit review", error)
            toast.error("Failed to submit review. Please try again.")
        }
    }

    const getStatusColor = (status: Booking['status']) => {
        switch (status) {
            case 'CONFIRMED': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            case 'PENDING': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
            case 'REJECTED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            case 'CANCELLED': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
            default: return 'bg-slate-100 text-slate-700'
        }
    }

    const getStatusIcon = (status: Booking['status']) => {
        switch (status) {
            case 'CONFIRMED': return <CheckCircle2 className="w-4 h-4" />
            case 'PENDING': return <Clock className="w-4 h-4" />
            case 'REJECTED': return <XCircle className="w-4 h-4" />
            case 'CANCELLED': return <XCircle className="w-4 h-4" />
            default: return <Clock className="w-4 h-4" />
        }
    }

    if (loading) return <div className="p-8"><div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" /></div>

    return (
        <DashboardLayout title="My Bookings">
            <div className="space-y-4">
                {bookings.length === 0 ? (
                    <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">No bookings yet</h3>
                        <p className="text-slate-500 mb-6">Start exploring properties to find your next home.</p>
                        <Link href="/search" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                            Browse Properties
                        </Link>
                    </div>
                ) : (
                    bookings.map((booking) => (
                        <div key={booking.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition">
                            <div className="flex flex-col md:flex-row">
                                <div className="w-full md:w-48 h-48 md:h-auto relative bg-slate-200">
                                    <img
                                        src={booking.propertyImage || "/images/property-placeholder.svg"}
                                        alt={booking.propertyTitle}
                                        onError={(e) => { e.currentTarget.src = "/images/property-placeholder.svg" }}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 p-6 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-1">
                                                {booking.propertyTitle}
                                            </h3>
                                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                                                {getStatusIcon(booking.status)}
                                                {booking.status}
                                            </span>
                                        </div>

                                        <p className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                                            <MapPin className="w-4 h-4" />
                                            {booking.propertyAddress}
                                        </p>

                                        <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-300">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                <span>Check-in: <b>{format(new Date(booking.startDate), 'MMM dd, yyyy')}</b></span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                <span>Check-out: <b>{format(new Date(booking.endDate), 'MMM dd, yyyy')}</b></span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-slate-500">Host: {booking.landlordName}</span>
                                        </div>
                                        <div className="flex gap-3">
                                            {/* Cancel Button for Pending bookings */}
                                            {booking.status === 'PENDING' && (
                                                <button
                                                    onClick={async () => {
                                                        if (confirm("Are you sure you want to cancel this booking request?")) {
                                                            try {
                                                                await bookingApi.updateStatus(booking.id, "CANCELLED")
                                                                fetchBookings()
                                                            } catch (e) {
                                                                console.error("Failed to cancel booking", e)
                                                            }
                                                        }
                                                    }}
                                                    className="text-sm font-medium text-red-600 hover:underline"
                                                >
                                                    Cancel Request
                                                </button>
                                            )}

                                            {/* Add Review Button for Confirmed/Past bookings */}
                                            {booking.status === 'CONFIRMED' && (
                                                <button
                                                    onClick={() => handleOpenReview(booking)}
                                                    className="text-sm font-medium text-blue-600 hover:underline"
                                                >
                                                    Write Review
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <ReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => {
                    setIsReviewModalOpen(false)
                    setSelectedBooking(null)
                }}
                onSubmit={handleSubmitReview}
                title={`Review your stay at ${selectedBooking?.propertyTitle}`}
                subtitle={`How was your experience with ${selectedBooking?.landlordName}?`}
            />
        </DashboardLayout>
    )
}
