"use client"

import { useTheme } from "@/context/ThemeContext"
import { BadgeCheck, Cat, Cigarette, Clock, MapPin } from "lucide-react"
import Link from "next/link"

interface RoommateCardProps {
  post: {
    id: number
    userName: string
    userAvatar: string
    location: string
    budget: number
    moveInDate: string
    bio: string
    genderPreference: string
    smoking: boolean
    pets: boolean
    occupation: string
    matchScore?: number
  }
}

export default function RoommateCard({ post }: RoommateCardProps) {
  const { isDark } = useTheme()

  return (
    <div className={`group rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 ${isDark
      ? "bg-white/5 border-white/10 hover:border-primary-500/50 hover:shadow-glow-sm"
      : "bg-white border-slate-200 hover:border-primary-200 hover:shadow-lg"
      }`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200">
              <img src={post.userAvatar} alt={post.userName} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className={`font-bold flex items-center gap-1 ${isDark ? "text-white" : "text-slate-900"}`}>
                {post.userName}
                <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500/10" />
              </h3>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <span className="capitalize">{post.occupation}</span>
                <span>•</span>
                <span className="capitalize">{post.genderPreference} Preference</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className={`px-3 py-1 rounded-full text-sm font-bold ${isDark ? "bg-primary-500/10 text-primary-400" : "bg-primary-50 text-primary-600"
              }`}>
              ৳{post.budget.toLocaleString()}
            </div>
            {post.matchScore !== undefined && post.matchScore > 0 && (
              <div className={`px-2 py-0.5 rounded-full text-xs font-bold ${post.matchScore > 70
                ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                : post.matchScore > 40
                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400"
                  : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                }`}>
                {post.matchScore}% Match
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <MapPin className="w-4 h-4" />
            <span>Looking in {post.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock className="w-4 h-4" />
            <span>Move in: {post.moveInDate}</span>
          </div>
        </div>

        {/* Bio Truncated */}
        <p className={`text-sm mb-4 line-clamp-2 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          {post.bio}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {!post.smoking && (
            <span className={`px-2 py-1 rounded-lg text-xs flex items-center gap-1 ${isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600"
              }`}>
              <Cigarette className="w-3 h-3 rotate-45" /> No Smoking
            </span>
          )}
          {post.pets && (
            <span className={`px-2 py-1 rounded-lg text-xs flex items-center gap-1 ${isDark ? "bg-purple-500/10 text-purple-400" : "bg-purple-50 text-purple-600"
              }`}>
              <Cat className="w-3 h-3" /> Pet Friendly
            </span>
          )}
        </div>

        {/* Action */}
        <Link
          href={`/roommates/${post.id}`}
          className={`block w-full text-center py-2.5 rounded-xl font-medium transition-colors ${isDark
            ? "bg-white/10 hover:bg-white/20 text-white"
            : "bg-slate-100 hover:bg-slate-200 text-slate-900"
            }`}>
          View Profile
        </Link>
      </div>
    </div>
  )
}
