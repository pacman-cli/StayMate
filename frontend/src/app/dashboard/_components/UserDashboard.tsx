"use client"

import { bookingApi, roommateApi, savedApi } from "@/lib/api"
import { User, UserDashboardDTO } from "@/types/auth"
import {
 AlertTriangle,
 Bell,
 Calendar,
 Heart,
 Home,
 MapPin,
 Search,
 UserPlus,
 Users
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ActionCard } from "./ActionCard"
import { AICompatibilityChart } from "./AICompatibilityChart"
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

 // AI Data for the chart
 const aiData = [
  { subject: "Lifestyle", A: 85, fullMark: 100 },
  { subject: "Habits", A: stats.compatibilityMatchStats || 75, fullMark: 100 },
  { subject: "Budget", A: 90, fullMark: 100 },
  { subject: "Location", A: 60, fullMark: 100 },
  { subject: "Social", A: 80, fullMark: 100 },
 ]

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

     {/* Compatibility Chart */}
     <div className="h-[350px]">
      <AICompatibilityChart data={aiData} />
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
          {mate.profilePictureUrl ? (
           <img src={mate.profilePictureUrl} alt={mate.name} className="w-full h-full object-cover" />
          ) : (
           <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold text-xs">
            {mate.name?.charAt(0) || "U"}
           </div>
          )}
         </div>
         <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-bold truncate ${isDark ? "text-white group-hover:text-indigo-400" : "text-slate-900 group-hover:text-indigo-600"} transition-colors`}>
           {mate.name || "Unknown User"}
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
