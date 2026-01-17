"use client"

import { bookingApi, roommateApi, savedApi } from "@/lib/api"
import { User, UserDashboardDTO } from "@/types/auth"
import {
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle,
  Heart,
  Home,
  MapPin,
  Search,
  ShieldCheck,
  UserPlus,
  Users,
  Wallet
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ActionCard } from "./ActionCard"
import { QuickStatCard } from "./QuickStatCard"

interface UserDashboardProps {
  user: User
  stats: UserDashboardDTO
  isDark: boolean
}

export function UserDashboard({ user, stats, isDark }: UserDashboardProps) {
  const [pendingVisits, setPendingVisits] = useState(0)
  const [savedCount, setSavedCount] = useState(0)
  const [recommendedRoommates, setRecommendedRoommates] = useState<any[]>([])
  const [isLoadingRoommates, setIsLoadingRoommates] = useState(true)

  useEffect(() => {
    const fetchAdditionalData = async () => {
      try {
        // Fetch pending visits (bookings with PENDING status)
        // Note: Assuming getMyBookings returns list, filtering for PENDING
        const response = await bookingApi.getMyBookings().catch(() => ({ data: [] }))
        const bookings = response.data || []
        setPendingVisits(bookings.filter((b: any) => b.status === "PENDING").length)

        // Fetch saved count
        const [savedProps, savedRoommates] = await Promise.all([
          savedApi.getProperties().catch(() => []),
          savedApi.getRoommates().catch(() => [])
        ])
        setSavedCount(savedProps.length + savedRoommates.length)

        // Fetch recommended roommates
        const roommates = await roommateApi.getRecommended().catch(() => [])
        // Handle paginated response if wrapped in content
        setRecommendedRoommates(Array.isArray(roommates) ? roommates : roommates.content || [])
      } catch (error) {
        console.error("Failed to fetch dashboard secondary data", error)
      } finally {
        setIsLoadingRoommates(false)
      }
    }
    fetchAdditionalData()
  }, [])

  const params = (score: number) => {
    if (score >= 80) return { color: "bg-emerald-100 text-emerald-700", label: "High" }
    if (score >= 50) return { color: "bg-amber-100 text-amber-700", label: "Medium" }
    return { color: "bg-red-100 text-red-700", label: "Low" }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">

      {/* 1. Hero Section & Emergency Access */}
      <div className={`p-8 rounded-3xl relative overflow-hidden ${isDark ? "bg-gradient-to-r from-indigo-900 to-purple-900" : "bg-gradient-to-r from-indigo-600 to-purple-600"
        } text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6`}>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user.firstName}!</h2>
          <p className="opacity-90 max-w-xl">
            We found <span className="font-bold text-amber-300">{stats.recommendedRooms?.length || 0} new properties</span> and <span className="font-bold text-amber-300">{recommendedRoommates.length} potential roommates</span> matching your preferences.
          </p>
        </div>

        {/* Emergency Finder Button */}
        <Link
          href="/emergency-housing"
          className="relative z-10 group flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold transition-all shadow-lg hover:shadow-red-500/30"
        >
          <AlertTriangle className="w-5 h-5 animate-pulse" />
          Emergency Room Finder
        </Link>

        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* 2. Active Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickStatCard
          label="Unread Messages"
          value={stats.unreadNotificationsCount || 0}
          icon={Bell}
          color="blue"
          trend="Check Inbox"
          isDark={isDark}
        />
        <QuickStatCard
          label="Pending Visits"
          value={pendingVisits}
          icon={Calendar}
          color="orange"
          trend="Awaiting Approval"
          isDark={isDark}
        />
        <QuickStatCard
          label="Saved Items"
          value={savedCount}
          icon={Heart}
          color="pink"
          trend="View Favorites"
          isDark={isDark}
        />
      </div>
      {/* 2.1 Verification & Finance Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Verification Progress */}
        {stats.verificationProgress && (
          <div className={`p-6 rounded-2xl border ${isDark ? "bg-slate-900/50 border-slate-700" : "bg-white border-slate-100"}`}>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-indigo-500" />
              <h3 className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Verification Status</h3>
              <span className="ml-auto text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                {stats.verificationProgress.totalProgress}%
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 mb-4 dark:bg-slate-700">
              <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${stats.verificationProgress.totalProgress}%` }}></div>
            </div>
            <div className="space-y-3">
              {[
                { label: "Email Verified", done: stats.verificationProgress.emailVerified },
                { label: "Phone Verified", done: stats.verificationProgress.phoneVerified },
                { label: "Profile Complete", done: stats.verificationProgress.profileCompleted },
                { label: "ID Verified", done: stats.verificationProgress.idVerified },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className={isDark ? "text-slate-300" : "text-slate-600"}>{item.label}</span>
                  {item.done ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Finance Stats */}
        {stats.financeStats && (
          <div className={`p-6 rounded-2xl border ${isDark ? "bg-slate-900/50 border-slate-700" : "bg-white border-slate-100"}`}>
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="w-5 h-5 text-emerald-500" />
              <h3 className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Monthly Finances</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className={`p-3 rounded-xl ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
                <p className="text-xs text-slate-500 mb-1">Spent this Month</p>
                <p className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                  ${stats.financeStats.totalSpentMonth || 0}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
                <p className="text-xs text-slate-500 mb-1">Next Rent Due</p>
                <p className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                  ${stats.financeStats.nextRentDue || 0}
                </p>
              </div>
            </div>
            {stats.financeStats.recentExpenses?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Recent Expenses</h4>
                <div className="space-y-3">
                  {stats.financeStats.recentExpenses.map((expense: any) => (
                    <div key={expense.id} className="flex justify-between items-center text-sm">
                      <span className={isDark ? "text-slate-300" : "text-slate-600 truncate max-w-[150px]"}>{expense.title}</span>
                      <span className="font-medium text-slate-900 dark:text-white">${expense.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Recommended Rooms */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              Recommended Rooms
            </h3>
            <Link href="/search" className="text-indigo-500 font-medium hover:underline text-sm">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.recommendedRooms?.slice(0, 4).map((room: any) => (
              <Link href={`/properties/${room.id}`} key={room.id} className={`group rounded-2xl overflow-hidden border ${isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-slate-100"
                } hover:shadow-lg transition-all`}>
                <div className="aspect-[4/3] bg-slate-200 relative overflow-hidden">
                  {room.imageUrl ? (
                    <img src={room.imageUrl} alt={room.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Home className="w-8 h-8" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-slate-900">
                    ${room.price}/mo
                  </div>
                </div>
                <div className="p-4">
                  <h4 className={`font-semibold truncate ${isDark ? "text-white" : "text-slate-900"}`}>{room.title}</h4>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3 h-3" />
                    {room.location || "City Center"}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-400">
                      {room.beds} Beds
                    </span>
                    <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-400">
                      {room.baths} Baths
                    </span>
                  </div>
                </div>
              </Link>
            ))}
            {!stats.recommendedRooms?.length && (
              <div className="col-span-full py-12 text-center text-slate-400 border-2 border-dashed rounded-2xl">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                No room recommendations yet. <br /> Try adjusting your preferences.
              </div>
            )}
          </div>

          {/* Emergency Rooms Section */}
          {stats.emergencyRooms && stats.emergencyRooms.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                  Emergency Availability
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stats.emergencyRooms.map((room: any) => (
                  <Link href={`/properties/${room.id}`} key={room.id} className={`group rounded-2xl overflow-hidden border border-red-200 ${isDark ? "bg-red-950/10 border-red-900/50" : "bg-red-50"
                    } hover:shadow-lg transition-all`}>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className={`font-bold ${isDark ? "text-red-200" : "text-red-900"}`}>{room.title}</h4>
                        <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">URGENT</span>
                      </div>
                      <p className={`text-sm ${isDark ? "text-red-300" : "text-red-700"}`}>
                        {room.location} • ${room.price}/mo
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quick Action Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <ActionCard
              title="Search Rooms"
              description="Find your perfect place with advanced filters."
              icon={Search}
              href="/search"
              color="blue"
              isDark={isDark}
            />
            <ActionCard
              title="Post Roommate Need"
              description="Create a profile to find compatible roommates."
              icon={UserPlus}
              href="/roommates/create"
              color="purple"
              isDark={isDark}
            />
          </div>
        </div>

        {/* Right Column: Roommates & Compatibility */}
        <div className="space-y-6">

          {/* Compatibility Score Card (Real) */}
          <div className={`p-6 rounded-2xl border ${isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-slate-100"} backdrop-blur-xl mb-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                Match Quality
              </h3>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${params(stats.compatibilityMatchStats || 0).color}`}>
                {params(stats.compatibilityMatchStats || 0).label}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center h-[200px]">
              <div className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
                {Math.round(stats.compatibilityMatchStats || 0)}%
              </div>
              <p className="text-sm text-slate-500 mt-2">Average Compatibility Score</p>
            </div>
          </div>

          {/* Recommended Roommates List */}
          <div className={`p-6 rounded-2xl border ${isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-slate-100"
            } backdrop-blur-xl`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                Top Roommates
              </h3>
              <Link href="/roommates" className="text-xs text-indigo-500 font-bold hover:underline">
                VIEW ALL
              </Link>
            </div>

            <div className="space-y-4">
              {isLoadingRoommates ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                  ))}
                </div>
              ) : recommendedRoommates.slice(0, 4).map((mate: any) => (
                <Link href={`/roommates/${mate.id}`} key={mate.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                    {mate.userAvatar ? (
                      <img src={mate.userAvatar} alt={mate.userName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold text-xs">
                        {mate.userName?.charAt(0) || "U"}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-bold truncate ${isDark ? "text-white group-hover:text-indigo-400" : "text-slate-900 group-hover:text-indigo-600"} transition-colors`}>
                      {mate.userName || "Unknown User"}
                    </h4>
                    <p className="text-xs text-slate-500 truncate">
                      {mate.location || "Location N/A"} • ${mate.budget}/mo
                    </p>
                  </div>
                  <div className={`p-2 rounded-full border ${isDark ? "border-slate-700 text-slate-500" : "border-slate-200 text-slate-400"}`}>
                    <Users className="w-3 h-3" />
                  </div>
                </Link>
              ))}
              {!isLoadingRoommates && recommendedRoommates.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No roommates found.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
