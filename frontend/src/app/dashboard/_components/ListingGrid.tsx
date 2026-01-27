"use client"

import { useTheme } from "@/context/ThemeContext"
import { Eye, MessageSquare, MoreVertical } from "lucide-react"
import Link from "next/link"

interface Listing {
  id: number
  title: string
  price: string
  views: number
  messages: number
  status: "ACTIVE" | "PAUSED"
  image: string
}

export function ListingGrid() {
  const { isDark } = useTheme()

  // Mock data
  const listings: Listing[] = [
    {
      id: 1,
      title: "Sunny Room in Williamsburg",
      price: "$1,200/mo",
      views: 124,
      messages: 8,
      status: "ACTIVE",
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
    },
    {
      id: 2,
      title: "Looking for Roommate - NYU",
      price: "$1,500/mo",
      views: 45,
      messages: 3,
      status: "PAUSED",
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
    },
  ]

  return (
    <div
      className={`rounded-3xl border p-6 ${isDark
        ? "bg-dark-900 border-dark-700"
        : "bg-white border-slate-100"
        }`}
    >
      <div className="mb-6 flex items-center justify-between">
        <h3
          className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"
            }`}
        >
          Your Listings & Posts
        </h3>
        <Link
          href="/my-listings"
          className={`text-sm font-medium transition-colors ${isDark
            ? "text-primary-400 hover:text-primary-300"
            : "text-primary-600 hover:text-primary-700"
            }`}
        >
          View All
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {listings.map((listing) => (
          <div
            key={listing.id}
            className={`group relative overflow-hidden rounded-2xl border transition-all hover:shadow-lg ${isDark
              ? "bg-dark-800 border-dark-700 hover:border-dark-600"
              : "bg-white border-slate-100 hover:border-slate-200"
              }`}
          >
            {/* Status Badge */}
            <div className="absolute left-3 top-3 z-10">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${listing.status === "ACTIVE"
                  ? "bg-emerald-600 text-white"
                  : "bg-amber-600 text-white"
                  }`}
              >
                {listing.status}
              </span>
            </div>

            {/* Image */}
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={listing.image}
                alt={listing.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Content */}
            <div className="p-4">
              <h4
                className={`truncate font-semibold ${isDark ? "text-white" : "text-slate-900"
                  }`}
              >
                {listing.title}
              </h4>
              <p
                className={`text-sm ${isDark
                  ? "text-primary-400"
                  : "text-primary-600"
                  }`}
              >
                {listing.price}
              </p>

              <div
                className={`mt-4 flex items-center justify-between border-t pt-3 ${isDark
                  ? "border-white/10 text-slate-400"
                  : "border-slate-100 text-slate-500"
                  }`}
              >
                <div className="flex gap-4 text-xs font-medium">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {listing.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5" />
                    {listing.messages}
                  </span>
                </div>
                <button
                  className={`rounded-lg p-1 transition-colors ${isDark
                    ? "hover:bg-white/10 text-slate-400"
                    : "hover:bg-slate-100 text-slate-400"
                    }`}
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add New Card */}
        <Link
          href="/create-listing"
          className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-6 transition-colors ${isDark
            ? "border-dark-700 bg-dark-800 hover:bg-dark-750 text-slate-400 hover:text-white"
            : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900"
            }`}
        >
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full ${isDark ? "bg-dark-700" : "bg-white shadow-sm"
              }`}
          >
            <span className="text-2xl font-light">+</span>
          </div>
          <span className="text-sm font-medium">Create New</span>
        </Link>
      </div>
    </div>
  )
}
