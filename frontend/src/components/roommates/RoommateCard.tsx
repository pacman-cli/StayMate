"use client"

import Avatar from "@/components/common/Avatar"
import { useTheme } from "@/context/ThemeContext"
import { RoommatePostResponse } from "@/types/auth"
import { BadgeCheck, Cat, Cigarette, Clock, MapPin, Moon, Sparkles } from "lucide-react"
import Link from "next/link"

interface RoommateCardProps {
  post: RoommatePostResponse
}

export default function RoommateCard({ post }: RoommateCardProps) {
  const { isDark } = useTheme()

  return (
    <Link href={`/roommates/${post.id}`} className="block h-full">
      <div className="glass-card group h-full hover:-translate-y-1 relative transition-all duration-300 flex flex-col">
        <div className="p-6 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar name={post.userName} src={post.userAvatar} size="md" />
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
              <div className={`px-3 py-1 rounded-full text-sm font-bold ${isDark ? "bg-primary-500/10 text-primary-400" : "bg-primary-50 text-primary-600"}`}>
                ৳{post.budget.toLocaleString()}
              </div>
              {post.matchScore !== undefined && post.matchScore > 0 && (
                <div className={`px-2 py-0.5 rounded-full text-xs font-bold ring-1 inset-0 ${post.matchScore >= 80
                  ? "bg-green-100 text-green-700 ring-green-200 dark:bg-green-500/20 dark:text-green-400 dark:ring-green-500/30"
                  : post.matchScore >= 50
                    ? "bg-yellow-100 text-yellow-700 ring-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:ring-yellow-500/30"
                    : "bg-red-100 text-red-700 ring-red-200 dark:bg-red-500/20 dark:text-red-400 dark:ring-red-500/30"
                  }`}>
                  {post.matchScore}% Compatibility
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

          {/* AI & Lifestyle Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {!post.smoking && (
              <span className={`px-2 py-1 rounded-lg text-xs flex items-center gap-1 ${isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600"}`}>
                <Cigarette className="w-3 h-3 rotate-45" /> No Smoking
              </span>
            )}
            {post.pets && (
              <span className={`px-2 py-1 rounded-lg text-xs flex items-center gap-1 ${isDark ? "bg-purple-500/10 text-purple-400" : "bg-purple-50 text-purple-600"}`}>
                <Cat className="w-3 h-3" /> Pet Friendly
              </span>
            )}
            {post.cleanliness && (
              <span className={`px-2 py-1 rounded-lg text-xs flex items-center gap-1 ${isDark ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
                <Sparkles className="w-3 h-3" /> {post.cleanliness.replace("_", " ")}
              </span>
            )}
            {post.sleepSchedule && (
              <span className={`px-2 py-1 rounded-lg text-xs flex items-center gap-1 ${isDark ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-50 text-indigo-600"}`}>
                <Moon className="w-3 h-3" /> {post.sleepSchedule.replace("_", " ")}
              </span>
            )}
            {post.personalityTags?.slice(0, 2).map((tag, i) => (
              <span key={i} className={`px-2 py-1 rounded-lg text-xs flex items-center gap-1 ${isDark ? "bg-slate-700/50 text-slate-300" : "bg-slate-100 text-slate-600"}`}>
                {tag}
              </span>
            ))}
          </div>

          {/* Bio Truncated */}
          <p className={`text-sm mb-4 line-clamp-2 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            {post.bio}
          </p>

          {/* Spacer to push button dowm */}
          <div className="flex-1"></div>

          {/* Fake Button (Visual) */}
          <div className={`block w-full text-center py-2.5 rounded-xl font-medium transition-colors ${isDark
            ? "bg-white/10 group-hover:bg-white/20 text-white"
            : "bg-slate-100 group-hover:bg-slate-200 text-slate-900"
            }`}>
            View Profile
          </div>
        </div>
      </div>
    </Link>
  )
}
