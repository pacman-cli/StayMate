"use client"

import DashboardLayout from "@/components/DashboardLayout"
import PropertyCard, { PropertyCardProps } from "@/components/search/PropertyCard"
import SearchFilters from "@/components/search/SearchFilters"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { propertyApi } from "@/lib/api"
import GoogleMapReact from 'google-map-react' // eslint-disable-line
import { Loader2, Map as MapIcon, Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

const Marker = ({ price, selected }: { lat: number; lng: number; price: string; selected: boolean }) => (
    <div className={`relative -translate-x-1/2 -translate-y-full cursor-pointer hover:z-10 group`}>
        <div className={`px-2 py-1 rounded-lg font-bold text-xs shadow-md transition-all ${selected
                ? 'bg-primary-600 text-white scale-110'
                : 'bg-white text-slate-900 group-hover:scale-105 group-hover:bg-primary-50'
            }`}>
            {price}
        </div>
        <div className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] mx-auto ${selected ? 'border-t-primary-600' : 'border-t-white'
            }`} />
    </div>
)

const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
    { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
    { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
    { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] }
]

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

                        <div className="w-full h-full">
                            <GoogleMapReact
                                bootstrapURLKeys={{ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "" }}
                                defaultCenter={{ lat: 23.8103, lng: 90.4125 }} // Dhaka default
                                center={properties.length > 0 && properties[0].latitude ? { lat: properties[0].latitude!, lng: properties[0].longitude! } : undefined}
                                defaultZoom={13}
                                options={{
                                    styles: isDark ? darkMapStyle : [],
                                    disableDefaultUI: true,
                                    zoomControl: true,
                                }}
                            >
                                {properties.map((property) => (
                                    property.latitude && property.longitude ? (
                                        <Marker
                                            key={property.id}
                                            lat={property.latitude}
                                            lng={property.longitude}
                                            price={property.price}
                                            selected={false} // TODO: Add selection state
                                        />
                                    ) : null
                                ))}
                            </GoogleMapReact>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
