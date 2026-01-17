"use client"

import DashboardLayout from "@/components/DashboardLayout"
import PropertyCard, { PropertyCardProps } from "@/components/search/PropertyCard"
import SearchFilters from "@/components/search/SearchFilters"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { propertyApi, savedApi } from "@/lib/api"
import { Loader2, Map as MapIcon, Search } from "lucide-react"
import dynamic from "next/dynamic"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"


const Map = dynamic(() => import("@/components/Map"), {
    ssr: false,
    loading: () => <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
})

export default function SearchRentalsPage() {
    // ... existing hook logic ...
    const router = useRouter()
    const searchParams = useSearchParams()
    const { isAuthenticated, isLoading: authLoading } = useAuth()
    const { isDark } = useTheme()

    const [properties, setProperties] = useState<PropertyCardProps[]>([])
    const [loading, setLoading] = useState(true)
    const [showMobileMap, setShowMobileMap] = useState(false)

    // ... existing effects ...
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login")
        }
    }, [authLoading, isAuthenticated, router])

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
                    imageUrl: p.imageUrl || "/images/property-placeholder.svg",
                    isSaved: false
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

    const handleToggleSave = async (id: number) => {
        if (!isAuthenticated) {
            router.push("/login")
            return
        }

        // Optimistic update
        setProperties(prev => prev.map(p =>
            p.id === id ? { ...p, isSaved: !p.isSaved } : p
        ))

        const property = properties.find(p => p.id === id)
        const isCurrentlySaved = property?.isSaved

        try {
            if (isCurrentlySaved) {
                await savedApi.removeProperty(id)
                toast.success(
                    <div className="flex items-center gap-2">
                        <span className="text-lg">💔</span>
                        <div>
                            <p className="font-semibold">Removed from Saved</p>
                            <p className="text-xs opacity-70">Property removed from your favorites</p>
                        </div>
                    </div>,
                    { position: "bottom-right", duration: 3000 }
                )
            } else {
                await savedApi.saveProperty(id)
                toast.success(
                    <div className="flex items-center gap-2">
                        <span className="text-lg">❤️</span>
                        <div>
                            <p className="font-semibold">Added to Saved</p>
                            <p className="text-xs opacity-70">Property saved to your favorites</p>
                        </div>
                    </div>,
                    {
                        position: "bottom-right",
                        duration: 3000,
                        style: {
                            background: isDark ? '#1e293b' : '#fff',
                            color: isDark ? '#fff' : '#0f172a',
                            border: '1px solid ' + (isDark ? '#334155' : '#e2e8f0'),
                        }
                    }
                )
            }
        } catch (error) {
            console.error("Failed to toggle save", error)
            toast.error("Failed to update saved status")
            // Revert optimistic update
            setProperties(prev => prev.map(p =>
                p.id === id ? { ...p, isSaved: isCurrentlySaved } : p
            ))
        }
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
                                <Search className={`w-8 h-8 mb-4 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                                <h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                                    No properties found
                                </h3>
                                <p className={`text-sm max-w-xs mx-auto mb-4 ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                                    Try adjusting your filters or search for a different location.
                                </p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="text-sm text-primary-500 hover:text-primary-600 font-medium"
                                >
                                    Refresh Results
                                </button>
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
                            className="absolute top-4 left-4 z-[1000] lg:hidden p-2 rounded-full bg-white shadow-lg text-slate-900"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="w-full h-full">
                            <Map properties={properties} />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
