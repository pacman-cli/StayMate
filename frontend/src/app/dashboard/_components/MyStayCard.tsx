"use client"

import { useTheme } from "@/context/ThemeContext"
import { ArrowRight, Calendar, MapPin } from "lucide-react"
import Link from "next/link"

interface MyStayCardProps {
  status: "LOOKING" | "LIVING" | "MOVING_OUT"
  nextVisit?: {
    date: string
    time: string
    location: string
  }
}

export function MyStayCard({ status, nextVisit }: MyStayCardProps) {
  const { isDark } = useTheme()

  return (
    <div
      className={`group relative overflow-hidden rounded-3xl p-6 transition-all duration-500 hover:shadow-2xl ${isDark
        ? "bg-dark-900 border border-dark-700 hover:border-indigo-500/50"
        : "bg-gradient-to-br from-indigo-50 via-white to-purple-50 border border-indigo-100/50 hover:border-indigo-200 hover:shadow-indigo-100"
        }`}
    >
      {/* Background Decor */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl transition-transform duration-700 group-hover:scale-150" />

      <div className="relative z-10 flex flex-col justify-between h-full">
        <div>
          <div className="mb-4">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${isDark
                ? "bg-indigo-900/50 text-indigo-300"
                : "bg-indigo-100 text-indigo-600"
                }`}
            >
              Current Status
            </span>
          </div>

          <h2
            className={`text-3xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"
              }`}
          >
            {status === "LOOKING" && "Looking for a Room"}
            {status === "LIVING" && "Settled in Sweet Home"}
            {status === "MOVING_OUT" && "Planning to Move Out"}
          </h2>

          <p
            className={`mt-2 max-w-md text-base ${isDark ? "text-slate-300" : "text-slate-600"
              }`}
          >
            {status === "LOOKING" &&
              "Your search is active. Check out your latest matches and recommended listings below."}
            {status === "LIVING" &&
              "Enjoying your stay? Manage your rent payments and maintenance requests here."}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          {nextVisit ? (
            <div
              className={`flex items-center gap-4 rounded-2xl p-4 ${isDark
                ? "bg-dark-800 border border-dark-700"
                : "bg-white border border-slate-100"
                }`}
            >
              <div
                className={`rounded-xl p-3 ${isDark
                  ? "bg-indigo-900/30 text-indigo-400"
                  : "bg-indigo-50 text-indigo-600"
                  }`}
              >
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p
                  className={`text-xs font-medium uppercase tracking-wider ${isDark
                    ? "text-slate-400"
                    : "text-slate-500"
                    }`}
                >
                  Next Visit
                </p>
                <p
                  className={`font-semibold ${isDark
                    ? "text-white"
                    : "text-slate-900"
                    }`}
                >
                  {nextVisit.date} • {nextVisit.time}
                </p>
                <div
                  className={`flex items-center gap-1 text-xs ${isDark
                    ? "text-slate-400"
                    : "text-slate-500"
                    }`}
                >
                  <MapPin className="h-3 w-3" />{" "}
                  {nextVisit.location}
                </div>
              </div>
            </div>
          ) : (
            <div />
          )}

          <Link
            href="/search"
            className="group/btn relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30"
          >
            Manage Search
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  )
}
