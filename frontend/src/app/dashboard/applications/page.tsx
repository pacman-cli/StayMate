"use client"

import AnimatedCard from "@/components/common/AnimatedCard"
import EmptyState from "@/components/common/EmptyState"
import LoadingState from "@/components/common/LoadingState"
import PageContainer from "@/components/common/PageContainer"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { applicationApi } from "@/lib/api"
import { ApplicationResponse } from "@/types/auth"
import { format } from "date-fns"
import {
  Building,
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  MessageSquare,
  Trash2,
  XCircle
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

export default function MyApplicationsPage() {
  const router = useRouter()
  const { isDark } = useTheme()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [applications, setApplications] = useState<ApplicationResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchApplications()
    }
  }, [isAuthenticated, user])

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const data = await applicationApi.getSentApplications()
      setApplications(data.content || [])
    } catch (error) {
      console.error("Failed to fetch applications", error)
      toast.error("Failed to load your applications")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id: number) => {
    if (!confirm("Are you sure you want to cancel this application?")) return

    try {
      await applicationApi.updateApplicationStatus(id, "CANCELLED" as any)
      toast.success("Application cancelled")
      fetchApplications()
    } catch (error) {
      console.error("Failed to cancel application", error)
      toast.error("Failed to cancel application")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return isDark
          ? "bg-yellow-950/50 text-yellow-400 border-yellow-900"
          : "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "ACCEPTED":
      case "APPROVED":
        return isDark
          ? "bg-emerald-950/50 text-emerald-400 border-emerald-900"
          : "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "REJECTED":
        return isDark
          ? "bg-red-950/50 text-red-400 border-red-900"
          : "bg-red-100 text-red-700 border-red-200"
      case "CANCELLED":
        return isDark
          ? "bg-slate-800 text-slate-400 border-slate-700"
          : "bg-slate-100 text-slate-700 border-slate-200"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING": return Clock
      case "ACCEPTED":
      case "APPROVED": return CheckCircle
      case "REJECTED": return XCircle
      case "CANCELLED": return Trash2
      default: return Clock
    }
  }

  if (authLoading || loading) {
    return <LoadingState message="Loading your applications..." />
  }

  return (
    <PageContainer
      title="My Applications"
      description="Track the status of your rental applications"
    >
      {applications.length === 0 ? (
        <EmptyState
          icon={Building}
          title="No applications yet"
          description="You haven't applied to any properties yet. Start your search to find your next home."
          action={
            <Link
              href="/dashboard/search"
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${isDark
                ? "bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-900/20"
                : "bg-primary-600 hover:bg-primary-700 text-white"
                }`}
            >
              <MapPin className="w-5 h-5" />
              Search Properties
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {applications.map((app, index) => {
            const StatusIcon = getStatusIcon(app.status)
            return (
              <AnimatedCard
                key={app.id}
                delay={index * 0.1}
                className="flex flex-col md:flex-row gap-6 p-6"
              >
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className={`font-semibold text-lg ${isDark ? "text-white" : "text-slate-900"}`}>
                        <Link href={`/dashboard/properties/${app.propertyId}`} className="hover:underline">
                          {app.propertyTitle}
                        </Link>
                      </h3>
                      <div className={`flex items-center gap-2 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        <MapPin className="w-4 h-4" />
                        {app.propertyLocation}
                      </div>
                    </div>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(app.status)}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {app.status}
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg text-sm border ${isDark ? "bg-dark-900 border-dark-700 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-600"}`}>
                    <div className="flex items-center gap-2 mb-2 font-medium opacity-75">
                      <MessageSquare className="w-4 h-4" />
                      Your Message
                    </div>
                    <p className="italic">"{app.message}"</p>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      Applied {format(new Date(app.createdAt), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-center justify-end gap-3 pt-4 md:pt-0 md:pl-6 border-t md:border-t-0 md:border-l border-slate-200 dark:border-dark-700 min-w-[140px]">
                  <Link
                    href={`/dashboard/properties/${app.propertyId}`}
                    className={`flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDark
                      ? "bg-dark-800 hover:bg-dark-700 text-white"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                  >
                    View Property
                  </Link>

                  {app.status === 'PENDING' && (
                    <button
                      onClick={() => handleCancel(app.id)}
                      className={`flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDark
                        ? "bg-red-900/20 hover:bg-red-900/30 text-red-400"
                        : "bg-red-50 hover:bg-red-100 text-red-600"
                        }`}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </AnimatedCard>
            )
          })}
        </div>
      )}
    </PageContainer>
  )
}
