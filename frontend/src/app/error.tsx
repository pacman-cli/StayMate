"use client"

import { useTheme } from "@/context/ThemeContext"
import { AlertCircle, RefreshCcw } from "lucide-react"
import { useEffect } from "react"

export default function Error({
 error,
 reset,
}: {
 error: Error & { digest?: string }
 reset: () => void
}) {
 const { isDark } = useTheme()

 useEffect(() => {
  // Log the error to an error reporting service
  console.error(error)
 }, [error])

 return (
  <div className={`flex min-h-screen flex-col items-center justify-center p-6 text-center ${isDark ? "bg-dark-950 text-white" : "bg-slate-50 text-slate-900"}`}>
   <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${isDark ? "bg-red-500/10 text-red-500" : "bg-red-50 text-red-600"}`}>
    <AlertCircle className="w-10 h-10" />
   </div>

   <h2 className="text-3xl font-bold mb-4">Something went wrong!</h2>
   <p className={`max-w-md mb-8 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
    We apologize for the inconvenience. An unexpected error occurred while loading this page.
   </p>

   <button
    onClick={reset}
    className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${isDark
      ? "bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-900/20"
      : "bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-400/20"
     }`}
   >
    <RefreshCcw className="w-5 h-5" />
    Try again
   </button>
  </div>
 )
}
