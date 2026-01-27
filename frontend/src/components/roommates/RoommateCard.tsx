"use client"

import Avatar from "@/components/common/Avatar"
import { useTheme } from "@/context/ThemeContext"
import { formatCurrency } from "@/lib/utils"
import { RoommatePostResponse, RoommateRequestStatus } from "@/types/auth"
import {
  BadgeCheck,
  Beer,
  Cat,
  Cigarette,
  Clock,
  Home,
  MapPin,
  MessageSquare,
  Moon,
  Sparkles,
  Users,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

interface RoommateCardProps {
  post: RoommatePostResponse
  showMatchScore?: boolean
}

export default function RoommateCard({ post, showMatchScore = true }: RoommateCardProps) {
  const { isDark } = useTheme()

  // Format budget for display
  const formattedBudget = () => {
    if (post.budgetMin && post.budgetMax) {
      if (post.budgetMin === post.budgetMax) return formatCurrency(post.budgetMax)
      return `${formatCurrency(post.budgetMin)} - ${formatCurrency(post.budgetMax)}`
    }
    return formatCurrency(post.budget)
  }

  return (
    <Link href={`/roommates/${post.id}`} className="block h-full group">
      <div className={`h-full border rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 relative flex flex-col ${isDark
        ? "bg-dark-800/50 border-white/10 hover:border-white/20 hover:bg-dark-800"
        : "bg-white border-slate-200 hover:border-primary-200 hover:shadow-lg"
        }`}>

        {/* Match Score Badge - Absolute Top Right */}
        {showMatchScore && post.matchScore !== undefined && post.matchScore > 0 && (
          <div className="absolute top-4 right-4 z-10">
            <div className={`px-2.5 py-1 rounded-full text-xs font-bold ring-1 inset-0 flex items-center gap-1 shadow-sm backdrop-blur-md ${post.matchScore >= 80
              ? "bg-green-500/10 text-green-600 ring-green-500/20 dark:text-green-400"
              : post.matchScore >= 50
                ? "bg-yellow-500/10 text-yellow-600 ring-yellow-500/20 dark:text-yellow-400"
                : "bg-red-500/10 text-red-600 ring-red-500/20 dark:text-red-400"
              }`}>
              <Sparkles className="w-3 h-3" />
              {post.matchScore}% Match
            </div>
          </div>
        )}

        <div className="p-5 flex flex-col h-full">
          {/* Header Profile */}
          <div className="flex items-center gap-4 mb-5">
            <Avatar name={post.userName} src={post.userAvatar} size="lg" />
            <div>
              <h3 className={`font-bold text-lg flex items-center gap-1.5 ${isDark ? "text-white" : "text-slate-900"}`}>
                {post.userName}
                <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500/10" />
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium capitalize">
                  {post.occupation}
                </span>
                <span className="capitalize text-xs opacity-80">{post.genderPreference} Pref</span>
              </div>
            </div>
          </div>

          {/* Key Info Grid */}
          <div className={`grid grid-cols-2 gap-3 mb-5 pb-5 border-b ${isDark ? "border-white/5" : "border-slate-100"}`}>
            <div className="col-span-2">
              <div className={`text-lg font-bold ${isDark ? "text-primary-400" : "text-primary-600"}`}>
                {formattedBudget()}
                <span className="text-xs font-normal text-slate-500 ml-1">/mo</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-slate-900 dark:text-white">
                {formattedBudget()}
              </span>
              <span className="text-slate-400">/ month</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{post.location}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">Move: {post.moveInDate}</span>
            </div>

            {post.stayDuration && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Home className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate capitalize">{post.stayDuration.replace("_", " ").toLowerCase()}</span>
              </div>
            )}
          </div>

          {/* Lifestyle Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {/* Sleep */}
            {post.sleepSchedule && (
              <div className={`p-1.5 rounded-lg border ${isDark ? "border-indigo-500/20 bg-indigo-500/5 text-indigo-400" : "border-indigo-100 bg-indigo-50 text-indigo-600"}`} title={`Sleep: ${post.sleepSchedule}`}>
                <Moon className="w-3.5 h-3.5" />
              </div>
            )}

            {/* Cleanliness */}
            {post.cleanliness && (
              <div className={`p-1.5 rounded-lg border ${isDark ? "border-blue-500/20 bg-blue-500/5 text-blue-400" : "border-blue-100 bg-blue-50 text-blue-600"}`} title={`Cleanliness: ${post.cleanliness}`}>
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            )}

            {/* Habits Badges */}
            {!post.smoking ? (
              <div className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/5 dark:text-emerald-400" title="Non-Smoker">
                <Cigarette className="w-3.5 h-3.5 rotate-45" />
              </div>
            ) : (
              <div className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 dark:border-white/10 dark:bg-white/5" title="Smoker">
                <Cigarette className="w-3.5 h-3.5" />
              </div>
            )}

            {!post.alcohol ? (
              <div className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/5 dark:text-emerald-400" title="No Alcohol">
                <Beer className="w-3.5 h-3.5" />
              </div>
            ) : null}

            {post.pets && (
              <div className="p-1.5 rounded-lg border border-purple-200 bg-purple-50 text-purple-600 dark:border-purple-500/20 dark:bg-purple-500/5 dark:text-purple-400" title="Pet Friendly">
                <Cat className="w-3.5 h-3.5" />
              </div>
            )}

            {post.guestsAllowed && post.guestsAllowed !== 'NEVER' && (
              <div className="p-1.5 rounded-lg border border-pink-200 bg-pink-50 text-pink-600 dark:border-pink-500/20 dark:bg-pink-500/5 dark:text-pink-400" title={`Guests: ${post.guestsAllowed}`}>
                <Users className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          <div className="flex-1"></div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-auto">
            <Link href={`/roommates/${post.id}`} className={`py-2.5 rounded-xl text-sm font-semibold text-center transition-all ${isDark
              ? "bg-slate-800 text-white hover:bg-slate-700"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}>
              View Profile
            </Link>

            <ConnectButton targetUserId={post.userId} />
          </div>
        </div>
      </div>
    </Link>
  )
}

function ConnectButton({ targetUserId }: { targetUserId: number }) {
  const [status, setStatus] = useState<RoommateRequestStatus>("NONE")
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const router = useRouter()

  useEffect(() => {
    // Prevent fetching if clicking inside the link/card (basic optimization)
    // Actually simpler to just fetch
    checkStatus()
  }, [targetUserId])

  const checkStatus = async () => {
    try {
      // @ts-ignore - roommateApi is new
      const currentStatus = await import("@/lib/api").then(m => m.roommateApi.getRequestStatus(targetUserId)) as RoommateRequestStatus
      setStatus(currentStatus)
    } catch (e) {
      console.error("Failed to check status", e)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation
    e.stopPropagation()

    if (status !== 'NONE') return

    const message = window.prompt("Add a note to your request (optional):")
    if (message === null) return // Cancelled

    setActionLoading(true)
    try {
      // @ts-ignore
      await import("@/lib/api").then(m => m.roommateApi.sendRequest(targetUserId, message))
      toast.success("Request sent!")
      setStatus("SENT_PENDING")
    } catch (e) {
      toast.error("Failed to send request")
    } finally {
      setActionLoading(false)
    }
  }

  const handleMessage = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setActionLoading(true)
    try {
      const api = await import("@/lib/api")
      const conversation = await api.messageApi.createConversation({
        recipientId: targetUserId,
        initialMessage: "Hi! We matched as roommates!"
      })
      router.push(`/dashboard/messages?conversation=${conversation.id}`)
    } catch (e) {
      toast.error("Failed to start conversation")
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <div className="h-10 w-full bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>

  if (status === 'MATCHED' || status === 'ACCEPTED') {
    return (
      <button
        onClick={handleMessage}
        disabled={loading || actionLoading}
        className="w-full py-2.5 rounded-xl text-sm font-semibold bg-green-600 text-white hover:bg-green-700 flex items-center justify-center gap-1 transition shadow-sm hover:shadow-md"
      >
        <MessageSquare className="w-4 h-4" /> Message
      </button>
    )
  }

  if (status === 'SENT_PENDING') {
    return (
      <button disabled className="w-full py-2.5 rounded-xl text-sm font-semibold bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 cursor-default">
        Request Sent
      </button>
    )
  }

  if (status === 'RECEIVED_PENDING') {
    return (
      <Link
        href="/roommates/requests"
        onClick={(e) => e.stopPropagation()}
        className="w-full py-2.5 rounded-xl text-sm font-semibold bg-blue-500 text-white hover:bg-blue-600 flex items-center justify-center gap-1 transition shadow-sm hover:shadow-md"
      >
        Respond to Request
      </Link>
    )
  }

  return (
    <button
      onClick={handleConnect}
      disabled={actionLoading}
      className="w-full py-2.5 rounded-xl text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 transition disabled:opacity-50"
    >
      {actionLoading ? "Sending..." : "Connect"}
    </button>
  )
}
