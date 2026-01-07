"use client"

import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { dashboardApi } from "@/lib/api"
import { AdminDashboardDTO, LandlordDashboardDTO, UserDashboardDTO } from "@/types/auth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { AdminDashboard } from "./_components/AdminDashboard"
import { LandlordDashboard } from "./_components/LandlordDashboard"
import { UserDashboard } from "./_components/UserDashboard"

export default function DashboardPage() {
    const router = useRouter()
    const {
        user,
        isAuthenticated,
        isLoading,
        isAdmin,
        isHouseOwner,
        isRegularUser,
        needsRoleSelection,
    } = useAuth()
    const { isDark } = useTheme()

    const [stats, setStats] = useState<any>(null)

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login")
        } else if (!isLoading && isAuthenticated && needsRoleSelection) {
            router.push("/select-role")
        }
    }, [isAuthenticated, isLoading, needsRoleSelection, router])

    useEffect(() => {
        const fetchStats = async () => {
            if (isAuthenticated && user) {
                try {
                    let data
                    if (isAdmin) {
                        data = await dashboardApi.getAdminStats()
                    } else if (isHouseOwner) {
                        data = await dashboardApi.getLandlordStats()
                    } else {
                        data = await dashboardApi.getUserStats()
                    }
                    setStats(data)
                } catch (error) {
                    console.error("Failed to fetch dashboard stats", error)
                }
            }
        }
        fetchStats()
    }, [isAuthenticated, user, isAdmin, isHouseOwner, isRegularUser])

    if (isLoading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-slate-950" : "bg-slate-50"}`}>
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Loading...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return "Good morning"
        if (hour < 18) return "Good afternoon"
        return "Good evening"
    }

    return (
        <>
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className={`text-2xl sm:text-3xl font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                    {getGreeting()}, {user.firstName || user.email?.split("@")[0]}! 👋
                </h1>
                <p className={`mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {isAdmin && "Here's an overview of your platform."}
                    {isHouseOwner && "Here's what's happening with your properties."}
                    {isRegularUser && "Find your perfect rental or roommate today."}
                </p>
            </div>

            {/* Render proper dashboard based on role and pass stats if available */}
            {stats && (
                <>
                    {isAdmin ? (
                        <AdminDashboard stats={stats as AdminDashboardDTO} isDark={isDark} />
                    ) : isHouseOwner ? (
                        <LandlordDashboard stats={stats as LandlordDashboardDTO} isDark={isDark} />
                    ) : (
                        <UserDashboard user={user} stats={stats as UserDashboardDTO} isDark={isDark} />
                    )}
                </>
            )}
            {!stats && (
                <div className="py-12 flex justify-center">
                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}
        </>
    )
}
