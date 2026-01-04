"use client"

import { useTheme } from "@/context/ThemeContext"
import { AlertCircle, CheckCircle, Mail, Shield, Sparkles } from "lucide-react"

interface TopStatsBarProps {
  stats: {
    profileCompletion: number
    isVerified: boolean
    activeListings: number
    matchScore: number
    pendingMessages: number
  }
}

export function TopStatsBar({ stats }: TopStatsBarProps) {
  const { isDark } = useTheme()

  const StatCard = ({
    label,
    value,
    icon,
    color,
    subtext,
  }: {
    label: string
    value: string | number | React.ReactNode
    icon: React.ReactNode
    color: string
    subtext?: string
  }) => (
    <div
      className={`relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${isDark
        ? "bg-dark-800 border-dark-700 hover:bg-dark-700 hover:shadow-primary-500/10"
        : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200/50"
        }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            className={`text-xs font-medium uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"
              }`}
          >
            {label}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3
              className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"
                }`}
            >
              {value}
            </h3>
            {subtext && (
              <span
                className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"
                  }`}
              >
                {subtext}
              </span>
            )}
          </div>
        </div>
        <div
          className={`rounded-xl p-2.5 ${isDark ? "bg-dark-700" : "bg-slate-50"
            }`}
        >
          <div className={color}>{icon}</div>
        </div>
      </div>

      {/* Progress Bar for Completion */}
      {label === "Profile Completion" && (
        <div className="mt-3">
          <div
            className={`h-1.5 w-full rounded-full ${isDark ? "bg-dark-700" : "bg-slate-100"
              }`}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000"
              style={{ width: `${stats.profileCompletion}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Profile Completion"
        value={`${stats.profileCompletion}%`}
        icon={<CheckCircle className="h-5 w-5" />}
        color="text-emerald-500"
        subtext={
          stats.profileCompletion === 100
            ? "Great job!"
            : "Complete it now"
        }
      />

      <StatCard
        label="Verification"
        value={
          <span
            className={`inline-flex items-center gap-1.5 text-sm font-bold px-2.5 py-0.5 rounded-full ${stats.isVerified
              ? "bg-emerald-500/10 text-emerald-500"
              : "bg-amber-500/10 text-amber-500"
              }`}
          >
            {stats.isVerified ? (
              <>
                <Shield className="h-3.5 w-3.5" /> Verified
              </>
            ) : (
              <>
                <AlertCircle className="h-3.5 w-3.5" /> Pending
              </>
            )}
          </span>
        }
        icon={<Shield className="h-5 w-5" />}
        color={stats.isVerified ? "text-emerald-500" : "text-amber-500"}
      />

      <StatCard
        label="Match Potential"
        value={stats.matchScore}
        icon={<Sparkles className="h-5 w-5" />}
        color="text-indigo-500"
        subtext="AI Compatibility"
      />

      <StatCard
        label="New Messages"
        value={stats.pendingMessages}
        icon={<Mail className="h-5 w-5" />}
        color="text-blue-500"
        subtext="Unread chats"
      />
    </div>
  )
}
