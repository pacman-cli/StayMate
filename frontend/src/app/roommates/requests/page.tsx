"use client"

import DashboardLayout from "@/components/DashboardLayout"
import { RoommateRequestList } from "@/components/roommates/RoommateRequestList"
import { useTheme } from "@/context/ThemeContext"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function RoommateRequestsPage() {
  const { isDark } = useTheme()

  return (
    <DashboardLayout>
      <div className={`min-h-screen ${isDark ? "bg-dark-900" : "bg-slate-50"}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link
              href="/roommates"
              className={`inline-flex items-center gap-2 text-sm mb-4 ${isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"}`}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Browse
            </Link>
            <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              Roommate Requests
            </h1>
            <p className={isDark ? "text-slate-400" : "text-slate-600"}>
              Manage incoming requests from potential roommates.
            </p>
          </div>

          <RoommateRequestList />
        </div>
      </div>
    </DashboardLayout>
  )
}
