"use client"

import { useTheme } from "@/context/ThemeContext"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { useDebounce } from "use-debounce"

export default function SearchFilters() {
 const router = useRouter()
 const searchParams = useSearchParams()
 const { isDark } = useTheme()

 // Local state for inputs
 const [query, setQuery] = useState(searchParams.get("query") || "")
 const [debouncedQuery] = useDebounce(query, 500)

 const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "")
 const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "")
 const [beds, setBeds] = useState(searchParams.get("minBeds") || "")

 // Sync with URL when debounced query changes
 useEffect(() => {
  updateFilters({ query: debouncedQuery })
 }, [debouncedQuery])

 const createQueryString = useCallback(
  (params: Record<string, string | null>) => {
   const newSearchParams = new URLSearchParams(searchParams.toString())

   Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === "") {
     newSearchParams.delete(key)
    } else {
     newSearchParams.set(key, value)
    }
   })

   return newSearchParams.toString()
  },
  [searchParams]
 )

 const updateFilters = (updates: Record<string, string | null>) => {
  const queryString = createQueryString(updates)
  router.push(`/search?${queryString}`, { scroll: false })
 }

 const clearFilters = () => {
  setQuery("")
  setMinPrice("")
  setMaxPrice("")
  setBeds("")
  router.push("/search")
 }

 const inputClasses = `w-full px-3 py-2 rounded-lg text-sm transition-colors outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 ${isDark
   ? "bg-dark-900 border-white/10 text-white placeholder-slate-600"
   : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
  }`

 const labelClasses = `text-xs font-semibold uppercase tracking-wider mb-1.5 block ${isDark ? "text-slate-500" : "text-slate-500"
  }`

 return (
  <div className={`p-4 rounded-xl border mb-6 ${isDark ? "bg-dark-800/50 border-white/10" : "bg-white border-slate-200 shadow-sm"
   }`}>
   {/* Main Search */}
   <div className="relative mb-6">
    <input
     type="text"
     value={query}
     onChange={(e) => setQuery(e.target.value)}
     placeholder="Search by location, neighborhood, or landmark..."
     className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all ${isDark
       ? "bg-dark-900 border-white/10 text-white placeholder-slate-500 focus:border-primary-500/50"
       : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-primary-500"
      }`}
    />
    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? "text-slate-500" : "text-slate-400"
     }`} />
    {query && (
     <button
      onClick={() => setQuery("")}
      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/10 transition-colors"
     >
      <X className="w-4 h-4 text-slate-400" />
     </button>
    )}
   </div>

   {/* Filter Grid */}
   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
    {/* Price Range */}
    <div className="col-span-2">
     <label className={labelClasses}>Price Range</label>
     <div className="flex items-center gap-2">
      <input
       type="number"
       placeholder="Min"
       value={minPrice}
       onChange={(e) => {
        setMinPrice(e.target.value)
        updateFilters({ minPrice: e.target.value })
       }}
       className={inputClasses}
      />
      <span className="text-slate-400">-</span>
      <input
       type="number"
       placeholder="Max"
       value={maxPrice}
       onChange={(e) => {
        setMaxPrice(e.target.value)
        updateFilters({ maxPrice: e.target.value })
       }}
       className={inputClasses}
      />
     </div>
    </div>

    {/* Beds */}
    <div>
     <label className={labelClasses}>Min Beds</label>
     <select
      value={beds}
      onChange={(e) => {
       setBeds(e.target.value)
       updateFilters({ minBeds: e.target.value })
      }}
      className={`${inputClasses} appearance-none cursor-pointer`}
     >
      <option value="">Any</option>
      <option value="1">1+ Bed</option>
      <option value="2">2+ Beds</option>
      <option value="3">3+ Beds</option>
      <option value="4">4+ Beds</option>
     </select>
    </div>

    {/* Reset Button */}
    <div>
     <button
      onClick={clearFilters}
      className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDark
        ? "text-slate-400 hover:text-white hover:bg-white/5"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
       }`}
     >
      <SlidersHorizontal className="w-4 h-4" />
      Reset All
     </button>
    </div>
   </div>
  </div>
 )
}
