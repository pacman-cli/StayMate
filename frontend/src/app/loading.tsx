"use client"

import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { useTheme } from "@/context/ThemeContext"

export default function Loading() {
 const { isDark } = useTheme()

 return (
  <div className={`flex min-h-screen flex-col items-center justify-center ${isDark ? "bg-dark-950" : "bg-slate-50"}`}>
   <LoadingSpinner size="xl" />
   <p className={`mt-4 text-sm font-medium animate-pulse ${isDark ? "text-primary-400" : "text-primary-600"}`}>
    Loading StayMate...
   </p>
  </div>
 )
}
