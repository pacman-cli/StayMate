"use client"

import { useTheme } from "@/context/ThemeContext"
import { getAvatarColor, getInitials } from "@/lib/imageUtils"
import { useState } from "react"

interface AvatarProps {
  src?: string | null
  name: string
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  className?: string
  showOnlineStatus?: boolean
  isOnline?: boolean
}

const sizeClasses = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-12 h-12 text-lg",
  xl: "w-16 h-16 text-xl",
}

const onlineDotSizes = {
  xs: "w-1.5 h-1.5 border",
  sm: "w-2 h-2 border",
  md: "w-2.5 h-2.5 border-2",
  lg: "w-3 h-3 border-2",
  xl: "w-4 h-4 border-2",
}

export default function Avatar({
  src,
  name,
  size = "md",
  className = "",
  showOnlineStatus = false,
  isOnline = false,
}: AvatarProps) {
  const { isDark } = useTheme()
  const [imageError, setImageError] = useState(false)

  const initials = getInitials(name)
  const bgColor = getAvatarColor(name)
  const showFallback = !src || imageError

  return (
    <div className={`relative inline-flex ${className}`}>
      {showFallback ? (
        <div
          className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold text-white`}
          style={{ backgroundColor: bgColor }}
        >
          {initials}
        </div>
      ) : (
        <img
          src={src}
          alt={name}
          onError={() => setImageError(true)}
          className={`${sizeClasses[size]} rounded-full object-cover`}
        />
      )}

      {showOnlineStatus && (
        <div
          className={`absolute bottom-0 right-0 ${onlineDotSizes[size]} rounded-full ${isOnline
              ? "bg-emerald-500 animate-pulse"
              : isDark
                ? "bg-slate-600"
                : "bg-slate-400"
            } ${isDark ? "border-dark-800" : "border-white"}`}
        />
      )}
    </div>
  )
}
