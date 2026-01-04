"use client"

import DashboardLayout from "@/components/DashboardLayout"
import RoommateCard from "@/components/roommates/RoommateCard"
import { useTheme } from "@/context/ThemeContext"
import { roommateApi } from "@/lib/api"
import { Filter, Search } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useDebounce } from "use-debounce"

export default function RoommatesPage() {
    const { isDark } = useTheme()

    // Filter States
    const [location, setLocation] = useState("")
    const [debouncedLocation] = useDebounce(location, 500)
    const [minBudget, setMinBudget] = useState("")
    const [maxBudget, setMaxBudget] = useState("")
    const [genderPref, setGenderPref] = useState("")

    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true)
            try {
                const data = await roommateApi.getAll({
                    location: debouncedLocation || undefined,
                    minBudget: minBudget || undefined,
                    maxBudget: maxBudget || undefined,
                    genderPreference: genderPref || undefined
                })
                setPosts(data)
            } catch (err) {
                console.error("Failed to fetch roommates", err)
            } finally {
                setLoading(false)
            }
        }
        fetchPosts()
    }, [debouncedLocation, minBudget, maxBudget, genderPref])

    return (
        <DashboardLayout>
            <div className={`min-h-screen ${isDark ? "bg-dark-900" : "bg-slate-50"}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                                Find Your Perfect Roommate
                            </h1>
                            <p className={isDark ? "text-slate-400" : "text-slate-600"}>
                                Connect with verified people looking for shared accommodation.
                            </p>
                        </div>
                        <Link
                            href="/roommates/create"
                            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all text-center"
                        >
                            Post an Ad
                        </Link>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">

                        {/* Filters Sidebar */}
                        <div className="lg:w-80 flex-shrink-0">
                            <div className={`p-6 rounded-2xl border sticky top-24 ${isDark ? "bg-dark-800 border-white/10" : "bg-white border-slate-200"
                                }`}>
                                <div className="flex items-center gap-2 font-bold mb-6 text-lg">
                                    <Filter className="w-5 h-5" />
                                    <span>Filters</span>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Location</label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="City, Area, or Zip"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm ${isDark
                                                        ? "bg-white/5 border-white/10 focus:border-primary-500/50 text-white"
                                                        : "bg-slate-50 border-slate-200 focus:border-primary-500 text-slate-900"
                                                    } focus:outline-none`}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Monthly Budget</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="number"
                                                placeholder="Min"
                                                value={minBudget}
                                                onChange={(e) => setMinBudget(e.target.value)}
                                                className={`w-full px-3 py-2.5 rounded-xl border text-sm ${isDark
                                                        ? "bg-white/5 border-white/10 focus:border-primary-500/50 text-white"
                                                        : "bg-slate-50 border-slate-200 focus:border-primary-500 text-slate-900"
                                                    } focus:outline-none`}
                                            />
                                            <input
                                                type="number"
                                                placeholder="Max"
                                                value={maxBudget}
                                                onChange={(e) => setMaxBudget(e.target.value)}
                                                className={`w-full px-3 py-2.5 rounded-xl border text-sm ${isDark
                                                        ? "bg-white/5 border-white/10 focus:border-primary-500/50 text-white"
                                                        : "bg-slate-50 border-slate-200 focus:border-primary-500 text-slate-900"
                                                    } focus:outline-none`}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Gender Preference</label>
                                        <select
                                            value={genderPref}
                                            onChange={(e) => setGenderPref(e.target.value)}
                                            className={`w-full px-3 py-2.5 rounded-xl border text-sm ${isDark
                                                    ? "bg-white/5 border-white/10 focus:border-primary-500/50 text-white"
                                                    : "bg-slate-50 border-slate-200 focus:border-primary-500 text-slate-900"
                                                } focus:outline-none`}
                                        >
                                            <option value="">Any</option>
                                            <option value="MALE">Male</option>
                                            <option value="FEMALE">Female</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Results Grid */}
                        <div className="flex-1">
                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className={`h-[300px] rounded-2xl animate-pulse ${isDark ? "bg-white/5" : "bg-slate-200"
                                            }`} />
                                    ))}
                                </div>
                            ) : posts.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {posts.map((post: any) => (
                                        <RoommateCard key={post.id} post={post} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? "bg-white/5" : "bg-slate-100"
                                        }`}>
                                        <Search className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <h3 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                                        No roommates found
                                    </h3>
                                    <p className="text-slate-500">
                                        Try adjusting your filters to see more results.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
