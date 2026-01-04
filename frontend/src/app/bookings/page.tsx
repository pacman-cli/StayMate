"use client"

import DashboardLayout from "@/components/DashboardLayout"
import AnimatedCard from "@/components/common/AnimatedCard"
import EmptyState from "@/components/common/EmptyState"
import LoadingState from "@/components/common/LoadingState"
import PageContainer from "@/components/common/PageContainer"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import apiClient from "@/lib/api"
import { motion } from "framer-motion"
import { Calendar, CheckCircle, Clock, User, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

type Booking = {
    id: number
    tenantId: number
    tenantName: string
    landlordId: number
    landlordName: string
    startDate: string
    endDate: string
    status: "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED" | "COMPLETED"
    notes: string
    createdAt: string
}

export default function BookingsPage() {
    const router = useRouter()
    const { isAuthenticated, isLoading: authLoading } = useAuth()
    const { isDark } = useTheme()
    const [activeTab, setActiveTab] = useState<"requests" | "my-bookings">("my-bookings")
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login")
        }
    }, [authLoading, isAuthenticated, router])

    useEffect(() => {
        if (isAuthenticated) {
            fetchBookings()
        }
    }, [isAuthenticated, activeTab])

    const fetchBookings = async () => {
        setLoading(true)
        try {
            const endpoint = activeTab === "requests" ? "/bookings/requests" : "/bookings/my-bookings"
            const response = await apiClient.get(endpoint)
            const data = response.data.content ? response.data.content : response.data
            setBookings(data)
        } catch (error) {
            console.error("Failed to fetch bookings:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusUpdate = async (id: number, status: string) => {
        try {
            await apiClient.patch(`/bookings/${id}/status`, null, {
                params: { status }
            })
            toast.success(`Booking ${status.toLowerCase()} successfully`)
            fetchBookings()
        } catch (error) {
            console.error("Failed to update status:", error)
            toast.error("Failed to update booking status")
        }
    }

    const getStatusConfig = (status: string) => {
        const configs: Record<string, { icon: any; className: string; borderColor: string }> = {
            CONFIRMED: {
                icon: CheckCircle,
                className: isDark
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    : "bg-emerald-100 text-emerald-700 border-emerald-200",
                borderColor: "border-emerald-500/20",
            },
            REJECTED: {
                icon: XCircle,
                className: isDark
                    ? "bg-red-500/20 text-red-400 border-red-500/30"
                    : "bg-red-100 text-red-700 border-red-200",
                borderColor: "border-red-500/20",
            },
            CANCELLED: {
                icon: XCircle,
                className: isDark
                    ? "bg-slate-500/20 text-slate-400 border-slate-500/30"
                    : "bg-slate-100 text-slate-700 border-slate-200",
                borderColor: "border-slate-500/20",
            },
            COMPLETED: {
                icon: CheckCircle,
                className: isDark
                    ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                    : "bg-blue-100 text-blue-700 border-blue-200",
                borderColor: "border-blue-500/20",
            },
            PENDING: {
                icon: Clock,
                className: isDark
                    ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                    : "bg-yellow-100 text-yellow-700 border-yellow-200",
                borderColor: "border-yellow-500/20",
            },
        }

        return configs[status] || configs.PENDING
    }

    if (authLoading) {
        return (
            <DashboardLayout>
                <LoadingState message="Loading bookings..." />
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <PageContainer
                title="Bookings"
                description={
                    activeTab === "my-bookings"
                        ? "Track your upcoming stays and rental bookings"
                        : "Manage booking requests from tenants"
                }
            >
                {/* Tabs */}
                <div className={`flex gap-2 p-1 rounded-xl ${isDark ? "bg-dark-800/50" : "bg-slate-100"}`}>
                    <button
                        onClick={() => setActiveTab("my-bookings")}
                        className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === "my-bookings"
                                ? isDark
                                    ? "bg-primary-500 text-white shadow-lg"
                                    : "bg-white text-primary-600 shadow-md"
                                : isDark
                                    ? "text-slate-400 hover:text-white"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                    >
                        My Bookings
                    </button>
                    <button
                        onClick={() => setActiveTab("requests")}
                        className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === "requests"
                                ? isDark
                                    ? "bg-primary-500 text-white shadow-lg"
                                    : "bg-white text-primary-600 shadow-md"
                                : isDark
                                    ? "text-slate-400 hover:text-white"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                    >
                        Requests
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <LoadingState message="Loading bookings..." />
                ) : bookings.length === 0 ? (
                    <EmptyState
                        icon={Calendar}
                        title={`No ${activeTab === "my-bookings" ? "bookings" : "requests"} found`}
                        description={
                            activeTab === "my-bookings"
                                ? "You haven't made any bookings yet. Start exploring properties to book your stay."
                                : "No booking requests at the moment. Check back later for new requests."
                        }
                    />
                ) : (
                    <div className="grid gap-4">
                        {bookings.map((booking, index) => {
                            const statusConfig = getStatusConfig(booking.status)
                            const StatusIcon = statusConfig.icon

                            return (
                                <AnimatedCard
                                    key={booking.id}
                                    delay={index * 0.1}
                                    className={`p-5 ${statusConfig.borderColor} border-l-4`}
                                >
                                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div
                                                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? "bg-white/10" : "bg-slate-100"
                                                    }`}
                                            >
                                                <User className={`w-6 h-6 ${isDark ? "text-slate-400" : "text-slate-500"}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3
                                                    className={`font-semibold text-lg mb-1 ${isDark ? "text-white" : "text-slate-900"
                                                        }`}
                                                >
                                                    {activeTab === "my-bookings"
                                                        ? booking.landlordName
                                                        : booking.tenantName}
                                                </h3>
                                                <div
                                                    className={`flex items-center gap-2 text-sm mb-2 ${isDark ? "text-slate-400" : "text-slate-500"
                                                        }`}
                                                >
                                                    <Calendar className="w-4 h-4 flex-shrink-0" />
                                                    <span>
                                                        {new Date(booking.startDate).toLocaleDateString()} -{" "}
                                                        {new Date(booking.endDate).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {booking.notes && (
                                                    <p
                                                        className={`text-sm mt-2 italic ${isDark ? "text-slate-400" : "text-slate-600"
                                                            }`}
                                                    >
                                                        "{booking.notes}"
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${statusConfig.className}`}
                                            >
                                                <StatusIcon className="w-3.5 h-3.5" />
                                                {booking.status}
                                            </span>

                                            {booking.status === "PENDING" && activeTab === "requests" && (
                                                <div className="flex gap-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleStatusUpdate(booking.id, "CONFIRMED")}
                                                        className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${isDark
                                                                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                                                                : "bg-emerald-600 hover:bg-emerald-700 text-white"
                                                            }`}
                                                    >
                                                        Confirm
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleStatusUpdate(booking.id, "REJECTED")}
                                                        className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${isDark
                                                                ? "bg-white/10 hover:bg-white/20 text-slate-300"
                                                                : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                                                            }`}
                                                    >
                                                        Reject
                                                    </motion.button>
                                                </div>
                                            )}

                                            {booking.status === "PENDING" && activeTab === "my-bookings" && (
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleStatusUpdate(booking.id, "CANCELLED")}
                                                    className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${isDark
                                                            ? "bg-white/10 hover:bg-white/20 text-slate-300"
                                                            : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                                                        }`}
                                                >
                                                    Cancel
                                                </motion.button>
                                            )}
                                        </div>
                                    </div>
                                </AnimatedCard>
                            )
                        })}
                    </div>
                )}
            </PageContainer>
        </DashboardLayout>
    )
}
