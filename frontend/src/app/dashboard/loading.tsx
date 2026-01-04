"use client"

import { useTheme } from "@/context/ThemeContext"

export default function DashboardLoading() {
 const { isDark } = useTheme()

 const shimmerClass = `relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] ${isDark
   ? "bg-white/5 before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent"
   : "bg-slate-200 before:bg-gradient-to-r before:from-transparent before:via-white/50 before:to-transparent"
  }`

 return (
  <div className={`min-h-screen p-6 ${isDark ? "bg-dark-950" : "bg-slate-50"}`}>
   <div className="max-w-7xl mx-auto space-y-8">
    {/* Header Skeleton */}
    <div className="flex justify-between items-center mb-10">
     <div className="space-y-3">
      <div className={`h-10 w-64 rounded-xl ${shimmerClass}`} />
      <div className={`h-5 w-48 rounded-lg ${shimmerClass}`} />
     </div>
     <div className={`h-12 w-12 rounded-full ${shimmerClass}`} />
    </div>

    {/* Stats Grid Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
     {[...Array(4)].map((_, i) => (
      <div key={i} className={`p-6 rounded-2xl border ${isDark ? "border-white/5 bg-white/5" : "border-slate-100 bg-white"}`}>
       <div className="flex justify-between items-start mb-4">
        <div className={`h-10 w-10 rounded-xl ${shimmerClass}`} />
        <div className={`h-6 w-16 rounded-full ${shimmerClass}`} />
       </div>
       <div className={`h-8 w-24 mb-2 rounded-lg ${shimmerClass}`} />
       <div className={`h-4 w-32 rounded-lg ${shimmerClass}`} />
      </div>
     ))}
    </div>

    {/* Charts Area Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
     <div className={`lg:col-span-2 p-6 rounded-3xl border h-[400px] ${isDark ? "border-white/5 bg-white/5" : "border-slate-100 bg-white"}`}>
      <div className="flex justify-between mb-8">
       <div className={`h-8 w-48 rounded-lg ${shimmerClass}`} />
       <div className={`h-8 w-24 rounded-lg ${shimmerClass}`} />
      </div>
      <div className={`w-full h-[300px] rounded-2xl ${shimmerClass}`} />
     </div>

     <div className={`p-6 rounded-3xl border h-[400px] ${isDark ? "border-white/5 bg-white/5" : "border-slate-100 bg-white"}`}>
      <div className={`h-8 w-40 mb-6 rounded-lg ${shimmerClass}`} />
      <div className="space-y-4">
       {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4">
         <div className={`h-12 w-12 rounded-full flex-shrink-0 ${shimmerClass}`} />
         <div className="flex-1 space-y-2">
          <div className={`h-4 w-full rounded ${shimmerClass}`} />
          <div className={`h-3 w-2/3 rounded ${shimmerClass}`} />
         </div>
        </div>
       ))}
      </div>
     </div>
    </div>
   </div>
  </div>
 )
}
