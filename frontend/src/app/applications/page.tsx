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
import { CheckCircle, Clock, FileText, User, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

type Application = {
    id: number
    senderId: number
    senderName: string
    senderProfilePictureUrl?: string
    receiverId: number
    receiverName: string
    status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED"
    message: string
    createdAt: string
}

export default function ApplicationsPage() {
    const router = useRouter()
    const { isAuthenticated, isLoading: authLoading } = useAuth()
    const { isDark } = useTheme()
    const [activeTab, setActiveTab] = useState<"received" | "sent">("received")
    const [applications, setApplications] = useState<Application[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login")
        }
    }, [authLoading, isAuthenticated, router])

    useEffect(() => {
        if (isAuthenticated) {
            fetchApplications()
        }
    }, [isAuthenticated, activeTab])

    const fetchApplications = async () => {
        setLoading(true)
        try {
            const endpoint = activeTab === "received" ? "/applications/received" : "/applications/sent"
            const response = await apiClient.get(endpoint)
            // Handling Page response or List response
            const data = response.data.content ? response.data.content : response.data
            setApplications(data)
        } catch (error) {
            console.error("Failed to fetch applications:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusUpdate = async (id: number, status: string) => {
        try {
            await apiClient.patch(`/applications/${id}/status`, null, {
                params: { status }
            })
            toast.success(`Application ${status.toLowerCase()} successfully`)
            fetchApplications()
        } catch (error) {
            console.error("Failed to update status:", error)
            toast.error("Failed to update application status")
        }
    }

    const getStatusConfig = (status: string) => {
        const configs: Record<string, { icon: any; className: string; borderColor: string }> = {
            ACCEPTED: {
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
                <LoadingState message="Loading applications..." />
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <PageContainer
                title="Applications"
                description={
                    activeTab === "received"
                        ? "Review roommate applications you've received"
                        : "Track applications you've sent to potential roommates"
                }
            >
                {/* Tabs */}
                <div className={`flex gap-2 p-1 rounded-xl ${isDark ? "bg-dark-800/50" : "bg-slate-100"}`}>
                    <button
                        onClick={() => setActiveTab("received")}
                        className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === "received"
                                ? isDark
                                    ? "bg-primary-500 text-white shadow-lg"
                                    : "bg-white text-primary-600 shadow-md"
                                : isDark
                                    ? "text-slate-400 hover:text-white"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                    >
                        Received {activeTab === "received" && applications.length > 0 && `(${applications.length})`}
                    </button>
                    <button
                        onClick={() => setActiveTab("sent")}
                        className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === "sent"
                                ? isDark
                                    ? "bg-primary-500 text-white shadow-lg"
                                    : "bg-white text-primary-600 shadow-md"
                                : isDark
                                    ? "text-slate-400 hover:text-white"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                    >
                        Sent {activeTab === "sent" && applications.length > 0 && `(${applications.length})`}
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <LoadingState message="Loading applications..." />
                ) : applications.length === 0 ? (
                    <EmptyState
                        icon={FileText}
                        title={`No ${activeTab === "received" ? "received" : "sent"} applications`}
                        description={
                            activeTab === "received"
                                ? "You haven't received any roommate applications yet. Keep your profile updated to attract more applications."
                                : "You haven't sent any applications yet. Browse roommate posts to find compatible matches."
                        }
                        action={
                            activeTab === "sent" && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => router.push("/roommates")}
                                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${isDark
                                            ? "bg-primary-500 hover:bg-primary-600 text-white"
                                            : "bg-primary-600 hover:bg-primary-700 text-white"
                                        }`}
                                >
                                    Browse Roommates
                                </motion.button>
                            )
                        }
                    />
                ) : (
                    <div className="grid gap-4">
                        {applications.map((app, index) => {
                            const statusConfig = getStatusConfig(app.status)
                            const StatusIcon = statusConfig.icon

                            return (
                                <AnimatedCard
                                    key={app.id}
                                    delay={index * 0.1}
                                    className={`p-5 ${statusConfig.borderColor} border-l-4`}
                                >
                                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div
                                                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? "bg-white/10" : "bg-slate-100"
                                                    }`}
                                            >
                                                {app.senderProfilePictureUrl ? (
                                                    <img
                                                        src={app.senderProfilePictureUrl}
                                                        alt={activeTab === "received" ? app.senderName : app.receiverName}
                                                        className="w-12 h-12 rounded-xl object-cover"
                                                    />
                                                ) : (
                                                    <User className={`w-6 h-6 ${isDark ? "text-slate-400" : "text-slate-500"}`} />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3
                                                    className={`font-semibold text-lg mb-1 ${isDark ? "text-white" : "text-slate-900"
                                                        }`}
                                                >
                                                    {activeTab === "received" ? app.senderName : app.receiverName}
                                                </h3>
                                                <p
                                                    className={`text-sm mb-2 ${isDark ? "text-slate-400" : "text-slate-500"
                                                        }`}
                                                >
                                                    {app.message || "No message provided"}
                                                </p>
                                                <p
                                                    className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"
                                                        }`}
                                                >
                                                    {new Date(app.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${statusConfig.className}`}
                                            >
                                                <StatusIcon className="w-3.5 h-3.5" />
                                                {app.status}
                                            </span>

                                            {app.status === "PENDING" && activeTab === "received" && (
                                                <div className="flex gap-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleStatusUpdate(app.id, "ACCEPTED")}
                                                        className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${isDark
                                                                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                                                                : "bg-emerald-600 hover:bg-emerald-700 text-white"
                                                            }`}
                                                    >
                                                        Accept
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleStatusUpdate(app.id, "REJECTED")}
                                                        className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${isDark
                                                                ? "bg-white/10 hover:bg-white/20 text-slate-300"
                                                                : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                                                            }`}
                                                    >
                                                        Reject
                                                    </motion.button>
                                                </div>
                                            )}

                                            {app.status === "PENDING" && activeTab === "sent" && (
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleStatusUpdate(app.id, "CANCELLED")}
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
