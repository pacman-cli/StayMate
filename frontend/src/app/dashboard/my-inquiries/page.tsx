"use client"

import EmptyState from "@/components/common/EmptyState"
import { useTheme } from "@/context/ThemeContext"
import { inquiryApi } from "@/lib/api"
import { InquiryResponse } from "@/types/inquiry"
import { format } from "date-fns"
import { ArrowRight, Home, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function MyInquiriesPage() {
  const { isDark } = useTheme()
  const [inquiries, setInquiries] = useState<InquiryResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInquiries()
  }, [])

  const fetchInquiries = async () => {
    try {
      const data = await inquiryApi.getMyInquiries()
      setInquiries(data.content || [])
    } catch (error) {
      console.error("Failed to fetch sent inquiries", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
          My Inquiries
        </h1>
        <p className={`mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          Track questions you've asked about properties.
        </p>
      </div>

      {inquiries.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No inquiries sent"
          description="You haven't asked any questions yet. Find a property you like and ask away!"
          action={
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
            >
              Browse Properties
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4">
          {inquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className={`p-6 rounded-2xl border transition-all ${isDark
                ? "bg-dark-800 border-dark-700"
                : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm"
                }`}
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Property Info */}
                <div className="flex-shrink-0 flex gap-4 md:w-64">
                  <div className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 ${isDark ? "bg-dark-700" : "bg-gray-100"}`}>
                    {inquiry.propertyImage ? (
                      <img
                        src={inquiry.propertyImage}
                        alt={inquiry.propertyTitle}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Home className={`w-6 h-6 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className={`font-semibold line-clamp-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                      {inquiry.propertyTitle}
                    </h3>
                    <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                      Sent on {format(new Date(inquiry.createdAt), "MMM d, yyyy")}
                    </p>
                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${inquiry.status === "REPLIED"
                          ? isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700"
                          : isDark ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-700"
                          }`}
                      >
                        {inquiry.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 space-y-4">
                  <div className={`p-4 rounded-xl ${isDark ? "bg-dark-900/50" : "bg-gray-50"}`}>
                    <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      <span className="font-semibold block mb-1 opacity-70">You Asked:</span>
                      "{inquiry.message}"
                    </p>
                  </div>

                  {inquiry.reply && (
                    <div className={`p-4 rounded-xl border-l-4 border-primary-500 ${isDark ? "bg-primary-500/5" : "bg-primary-50"}`}>
                      <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                        <span className={`font-semibold block mb-1 ${isDark ? "text-primary-400" : "text-primary-700"}`}>
                          Owner Replied:
                        </span>
                        "{inquiry.reply}"
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center">
                  <Link
                    href={`/listings/${inquiry.propertyId}`}
                    className={`flex items-center gap-1 text-sm font-medium hover:underline ${isDark ? "text-primary-400" : "text-primary-600"}`}
                  >
                    View Listing <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
