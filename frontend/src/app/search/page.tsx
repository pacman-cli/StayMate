"use client"

import DashboardLayout from "@/components/DashboardLayout"
import PropertyCard, { PropertyCardProps } from "@/components/search/PropertyCard"
import SearchFilters from "@/components/search/SearchFilters"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { propertyApi } from "@/lib/api"
import { Loader2, Map as MapIcon, Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function SearchRentalsPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { isAuthenticated, isLoading: authLoading } = useAuth()
    const { isDark } = useTheme()

    const [properties, setProperties] = useState<PropertyCardProps[]>([])
    const [loading, setLoading] = useState(true)
    const [showMobileMap, setShowMobileMap] = useState(false)

    // Initial check
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login")
        }
    }, [authLoading, isAuthenticated, router])

    // Fetch Properties
    useEffect(() => {
        const fetchProperties = async () => {
            setLoading(true)
            try {
                // Convert URL params to API params
                const params = {
                    query: searchParams.get("query") || undefined,
                    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
                    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
                    minBeds: searchParams.get("minBeds") ? Number(searchParams.get("minBeds")) : undefined,
                }

                const data = await propertyApi.searchProperties(params)

                const mappedProperties = data.map((p: any) => ({
                    ...p,
                    imageUrl: p.imageUrl || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
                    isSaved: false // TODO: Fetch saved state
                }))
                setProperties(mappedProperties)
            } catch (error) {
                console.error("Failed to fetch properties", error)
            } finally {
                setLoading(false)
            }
        }

        if (isAuthenticated) {
            fetchProperties()
        }
    }, [searchParams, isAuthenticated])

    const handleToggleSave = (id: number) => {
        setProperties(prev => prev.map(p =>
            p.id === id ? { ...p, isSaved: !p.isSaved } : p
        ))
    }

    if (authLoading) return null

    return (
        <DashboardLayout>
            <div className="relative h-[calc(100vh-100px)] flex">

                {/* Left Side - List View */}
                <div className={`w-full lg:w-[60%] xl:w-[55%] flex flex-col h-full overflow-hidden ${showMobileMap ? "hidden lg:flex" : "flex"
                    }`}>
                    {/* Header */}
                    <div className={`flex-shrink-0 px-6 py-4 border-b z-10 ${isDark ? "bg-dark-900 border-white/10" : "bg-white border-slate-200"
                        }`}>
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                                    Explore Stays
                                </h1>
                                <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                    {loading ? "Searching..." : `${properties.length} properties found`}
                                </p>
                            </div>

                            {/* Mobile Map Toggle */}
                            <button
                                onClick={() => setShowMobileMap(true)}
                                className={`lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${isDark
                                        ? "bg-white/10 text-white"
                                        : "bg-slate-100 text-slate-900"
                                    }`}
                            >
                                <MapIcon className="w-4 h-4" />
                                Map
                            </button>
                        </div>

                        <SearchFilters />
                    </div>

                    {/* Scrollable List */}
                    <div className={`flex-1 overflow-y-auto p-6 ${isDark ? "bg-dark-900" : "bg-slate-50"}`}>
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-64 gap-3">
                                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                                <p className="text-slate-500 text-sm">Finding best matches...</p>
                            </div>
                        ) : properties.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                                {properties.map((property) => (
                                    <PropertyCard
                                        key={property.id}
                                        {...property}
                                        onToggleSave={handleToggleSave}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-center">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDark ? "bg-white/5" : "bg-slate-100"
                                    }`}>
                                    <Search className={`w-8 h-8 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                                </div>
                                <h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                                    No properties found
                                </h3>
                                <p className={`text-sm max-w-xs mx-auto ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                                    Try adjusting your filters or search for a different location.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side - Map View */}
                <div className={`fixed inset-0 lg:static lg:w-[40%] xl:w-[45%] h-full z-20 lg:z-auto transition-transform duration-300 ${showMobileMap ? "translate-x-0" : "translate-x-full lg:translate-x-0"
                    }`}>
                    <div className={`relative w-full h-full ${isDark ? "bg-dark-800" : "bg-slate-200"}`}>
                        {/* Mobile Close Map Button */}
                        <button
                            onClick={() => setShowMobileMap(false)}
                            className="absolute top-4 left-4 z-30 lg:hidden p-2 rounded-full bg-white shadow-lg"
                        >
                            <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Map Placeholder */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center opacity-30">
                                <MapIcon className="w-16 h-16 mx-auto mb-2 text-slate-500" />
                                <p className="font-semibold text-slate-500">Interactive Map View</p>
                                <p className="text-xs text-slate-500">Coming Soon</p>
                            </div>
                        </div>

                        {/* Fake Map Pattern */}
                        <div className="absolute inset-0 opacity-[0.03]"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                            }}
                        />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
