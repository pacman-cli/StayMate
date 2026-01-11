"use client"

import { useTheme } from "@/context/ThemeContext"
import { Bath, BedDouble, Heart, MapPin, Maximize, Star, Verified } from "lucide-react"
import Link from "next/link"
import { MouseEvent } from "react"

export interface PropertyCardProps {
  id: number
  title: string
  location: string
  price: string
  imageUrl: string
  beds: number
  baths: number
  sqft: number
  rating: number
  verified: boolean
  isSaved?: boolean
  onToggleSave?: (id: number) => void
  latitude?: number
  longitude?: number
  address?: string
}

export default function PropertyCard({
  id,
  title,
  location,
  price,
  imageUrl,
  beds,
  baths,
  sqft,
  rating,
  verified,
  isSaved = false,
  onToggleSave
}: PropertyCardProps) {
  const { isDark } = useTheme()

  const handleSave = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onToggleSave?.(id)
  }

  return (
    <Link
      href={`/listings/${id}`}
      className={`group block rounded-2xl overflow-hidden border transition-all duration-300 ${isDark
        ? "bg-dark-800/50 border-white/10 hover:border-white/20 hover:bg-dark-800"
        : "bg-white border-slate-200 hover:border-primary-200 hover:shadow-lg hover:-translate-y-1"
        }`}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={imageUrl || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80"}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex gap-2">
          {verified && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/90 backdrop-blur-md text-primary-600 text-xs font-bold shadow-sm">
              <Verified className="w-3 h-3" />
              <span>VERIFIED</span>
            </div>
          )}
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all active:scale-95 ${isSaved
            ? "bg-red-500 text-white shadow-md hover:bg-red-600"
            : "bg-black/20 text-white hover:bg-black/40"
            }`}
        >
          <Heart className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
        </button>

        {/* Price Tag */}
        <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur-md text-slate-900 text-sm font-bold shadow-lg">
          {price}
          <span className="text-xs font-normal text-slate-500 ml-1">/mo</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <h3 className={`font-semibold truncate pr-2 ${isDark ? "text-white" : "text-slate-900"}`}>
            {title}
          </h3>
          <div className="flex items-center gap-1 text-xs font-medium text-amber-500">
            <Star className="w-3 h-3 fill-current" />
            <span>{rating}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm text-slate-500 mb-4">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{location}</span>
        </div>

        {/* Specs Grid */}
        <div className={`grid grid-cols-3 gap-2 py-3 border-t text-xs ${isDark ? "border-white/5 text-slate-400" : "border-slate-100 text-slate-500"
          }`}>
          <div className="flex items-center justify-center gap-1.5">
            <BedDouble className="w-3.5 h-3.5" />
            <span>{beds} Bed</span>
          </div>
          <div className={`flex items-center justify-center gap-1.5 border-l border-r ${isDark ? "border-white/5" : "border-slate-100"
            }`}>
            <Bath className="w-3.5 h-3.5" />
            <span>{baths} Bath</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <Maximize className="w-3.5 h-3.5" />
            <span>{sqft} sqft</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
