"use client"

import { useTheme } from "@/context/ThemeContext"
import {
  Calendar,
  Eye,
  FileText,
  MessageSquare,
  Search,
  Shield,
} from "lucide-react"

interface ActivityItem {
  id: number
  type: "MESSAGE" | "VIEW" | "BOOKING" | "VERIFICATION" | "SEARCH"
  title: string
  time: string
  description?: string
}

const getActivityIcon = (type: ActivityItem["type"]) => {
  switch (type) {
    case "MESSAGE":
      return <MessageSquare className="h-4 w-4" />
    case "VIEW":
      return <Eye className="h-4 w-4" />
    case "BOOKING":
      return <Calendar className="h-4 w-4" />
    case "VERIFICATION":
      return <Shield className="h-4 w-4" />
    case "SEARCH":
      return <Search className="h-4 w-4" />
    default:
      return <FileText className="h-4 w-4" />
  }
}

export function ActivityTimeline() {
  const { isDark } = useTheme()

  // Mock data - replace with real props later
  const activities: ActivityItem[] = [
    {
      id: 1,
      type: "MESSAGE",
      title: "New message from Alex",
      time: "2 mins ago",
      description: "Hey, is the room still available?",
    },
    {
      id: 2,
      type: "VIEW",
      title: "Viewed Downtown Loft",
      time: "2 hours ago",
    },
    {
      id: 3,
      type: "SEARCH",
      title: "Searched in Brooklyn",
      time: "Yesterday",
    },
    {
      id: 4,
      type: "VERIFICATION",
      title: "ID Verification Approved",
      time: "2 days ago",
    },
  ]

  return (
    <div
      className={`rounded-3xl border p-6 transition-all duration-300 ${isDark
        ? "bg-dark-900 border-dark-700"
        : "bg-white border-slate-100"
        }`}
    >
      <h3
        className={`mb-6 text-lg font-bold ${isDark ? "text-white" : "text-slate-900"
          }`}
      >
        Recent Activity
      </h3>

      <div className="relative space-y-8 pl-4 before:absolute before:left-[11px] before:top-2 before:h-[85%] before:w-[2px] before:bg-slate-200 before:content-[''] dark:before:bg-slate-700">
        {activities.map((activity) => (
          <div key={activity.id} className="relative flex gap-4">
            <div
              className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-4 ${isDark
                ? "bg-dark-800 ring-dark-900 border border-dark-700 text-slate-400"
                : "bg-white ring-white border border-slate-200 text-slate-500"
                }`}
            >
              {getActivityIcon(activity.type)}
            </div>
            <div className="-mt-1 flex-1">
              <p
                className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-900"
                  }`}
              >
                {activity.title}
              </p>
              <p
                className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"
                  }`}
              >
                {activity.time}
              </p>
              {activity.description && (
                <p
                  className={`mt-1 rounded-lg p-2 text-xs ${isDark
                    ? "bg-dark-800 text-slate-400"
                    : "bg-slate-50 text-slate-600"
                    }`}
                >
                  "{activity.description}"
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
