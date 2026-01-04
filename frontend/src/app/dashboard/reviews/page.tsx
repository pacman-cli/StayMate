"use client"

import { Star } from "lucide-react"

export default function ReviewsPage() {
 return (
  <div className="p-6 md:p-8 space-y-6">
   <div>
    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tenant Reviews</h1>
    <p className="text-slate-500 dark:text-slate-400">See what your tenants are saying about you</p>
   </div>

   <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
    <div className="w-16 h-16 bg-yellow-50 dark:bg-yellow-500/20 rounded-full flex items-center justify-center mb-4">
     <Star className="w-8 h-8 text-yellow-500" />
    </div>
    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Reviews Module Coming Soon</h3>
    <p className="text-slate-500 max-w-md mt-2">
     We are currently building a robust review system to help you build trust with potential tenants. Check back soon!
    </p>
   </div>
  </div>
 )
}
