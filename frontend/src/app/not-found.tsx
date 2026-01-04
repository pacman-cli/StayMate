"use client"

import { useTheme } from "@/context/ThemeContext"
import { Home, MoveLeft } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
 const { isDark } = useTheme()

 return (
  <div className={`flex min-h-screen flex-col items-center justify-center p-6 text-center ${isDark ? "bg-dark-950 text-white" : "bg-slate-50 text-slate-900"}`}>
   <h1 className={`text-9xl font-extrabold mb-4 opacity-10 ${isDark ? "text-white" : "text-slate-800"}`}>
    404
   </h1>

   <div className="relative -mt-16 z-10">
    <h2 className="text-4xl font-bold mb-4">Page Not Found</h2>
    <p className={`max-w-md mx-auto mb-10 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
     Oops! The page you are looking for doesn't exist or has been moved.
    </p>

    <div className="flex flex-col sm:flex-row gap-4 justify-center">
     <button
      onClick={() => window.history.back()}
      className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold border transition-all ${isDark
        ? "border-white/10 hover:bg-white/10 text-white"
        : "border-slate-200 hover:bg-slate-100 text-slate-700"
       }`}
     >
      <MoveLeft className="w-5 h-5" />
      Go Back
     </button>

     <Link
      href="/"
      className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${isDark
        ? "bg-primary-600 hover:bg-primary-700 text-white"
        : "bg-primary-600 hover:bg-primary-700 text-white"
       }`}
     >
      <Home className="w-5 h-5" />
      Back to Home
     </Link>
    </div>
   </div>
  </div>
 )
}
