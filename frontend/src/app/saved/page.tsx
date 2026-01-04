"use client"

import DashboardLayout from "@/components/DashboardLayout"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import {
    Bath,
    BedDouble,
    DollarSign,
    Heart,
    MapPin,
    Maximize,
    MessageSquare,
    Trash2
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

// Types moved to types/index.ts or kept here if needed for component
type SavedType = "all" | "rentals" | "roommates"

interface SavedProperty {
    id: number
    type: "rental"
    title: string
    location: string
    price: number
    image: string
    beds: number
    baths: number
    sqft: number
    dateSaved: string
}

interface SavedRoommate {
    id: number
    type: "roommate"
    name: string
    location: string
    budget: number
    image: string
    matchScore: number
    dateSaved: string
}

// ... imports ...
import { savedApi } from "@/lib/api"
// ...

export default function SavedPage() {
    const router = useRouter()
    const { isAuthenticated, isLoading: authLoading } = useAuth()
    const { isDark } = useTheme()

    const [activeTab, setActiveTab] = useState<SavedType>("all")
    const [savedProperties, setSavedProperties] = useState<any[]>([])
    const [savedRoommates, setSavedRoommates] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Initial check
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login")
        }
    }, [authLoading, isAuthenticated, router])

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            if (!isAuthenticated) return

            try {
                setIsLoading(true)
                const [properties, roommates] = await Promise.all([
                    savedApi.getProperties(),
                    savedApi.getRoommates()
                ])

                // Map API response to match UI expectations if needed, or adjust UI
                // For now assuming API returns compatible objects or we use 'any'
                setSavedProperties(properties)
                setSavedRoommates(roommates)
            } catch (error) {
                console.error("Failed to fetch saved items:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [isAuthenticated])

    const handleRemove = async (id: number, type: "rental" | "roommate") => {
        try {
            if (type === "rental") {
                await savedApi.removeProperty(id)
                setSavedProperties(prev => prev.filter(p => p.id !== id))
            } else {
                await savedApi.removeRoommate(id)
                setSavedRoommates(prev => prev.filter(r => r.id !== id))
            }
        } catch (error) {
            console.error("Failed to remove saved item:", error)
        }
    }

    if (authLoading || isLoading) {
        return (
            <DashboardLayout>
                <div className={`h-[calc(100vh-120px)] flex flex-col items-center justify-center rounded-xl border ${isDark ? "bg-dark-800/50 border-white/10" : "bg-white border-slate-200"}`}>
                    <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </DashboardLayout>
        )
    }

    const showRentals = activeTab === "all" || activeTab === "rentals"
    const showRoommates = activeTab === "all" || activeTab === "roommates"

    // Helper to format currency
    const formatPrice = (price: string | number) => {
        if (typeof price === 'number') return `$${price}/mo`
        return price
    }

    // Helper for images
    const getImage = (item: any, type: "rental" | "roommate") => {
        // Fallback images
        if (type === "rental") {
            return item.imageUrl || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80"
        } else {
            // Roommate/User avatar
            return item.userAvatar || item.user?.profilePictureUrl || `https://ui-avatars.com/api/?name=${item.userName || "User"}`
        }
    }

    return (
        <DashboardLayout>
            <div
                className={`h-[calc(100vh-120px)] flex flex-col rounded-xl overflow-hidden border ${isDark ? "bg-dark-800/50 border-white/10" : "bg-white border-slate-200"
                    }`}
            >
                {/* Header Section */}
                <div className={`flex-shrink-0 border-b ${isDark ? "border-white/10" : "border-slate-200"}`}>
                    <div className="p-4 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                                    Saved Items
                                </h1>
                                <p className={`text-sm ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                                    Your collections of properties and potential roommates
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="px-4 pb-0 flex items-center gap-6">
                        <button
                            onClick={() => setActiveTab("all")}
                            className={`pb-3 border-b-2 text-sm font-medium transition-colors ${activeTab === "all"
                                ? isDark
                                    ? "border-primary-500 text-primary-400"
                                    : "border-primary-600 text-primary-600"
                                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                }`}
                        >
                            All Saved
                        </button>
                        <button
                            onClick={() => setActiveTab("rentals")}
                            className={`pb-3 border-b-2 text-sm font-medium transition-colors ${activeTab === "rentals"
                                ? isDark
                                    ? "border-primary-500 text-primary-400"
                                    : "border-primary-600 text-primary-600"
                                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                }`}
                        >
                            Properties ({savedProperties.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("roommates")}
                            className={`pb-3 border-b-2 text-sm font-medium transition-colors ${activeTab === "roommates"
                                ? isDark
                                    ? "border-primary-500 text-primary-400"
                                    : "border-primary-600 text-primary-600"
                                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                }`}
                        >
                            Roommates ({savedRoommates.length})
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className={`flex-1 overflow-y-auto p-6 ${isDark ? "bg-dark-900/20" : "bg-slate-50/50"}`}>
                    <div className="space-y-8">

                        {/* Rentals Section */}
                        {showRentals && savedProperties.length > 0 && (
                            <div>
                                <h2 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${isDark ? "text-slate-500" : "text-slate-400"
                                    }`}>
                                    Saved Properties
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {savedProperties.map((property) => (
                                        <div
                                            key={property.id}
                                            className={`relative group rounded-xl overflow-hidden border transition-all ${isDark
                                                ? "bg-dark-800/50 border-white/10 hover:border-white/20"
                                                : "bg-white border-slate-200 hover:border-primary-200 hover:shadow-lg"
                                                }`}
                                        >
                                            <div className="relative aspect-[4/3] overflow-hidden">
                                                <img
                                                    src={getImage(property, 'rental')}
                                                    alt={property.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                <button
                                                    onClick={() => handleRemove(property.id, "rental")}
                                                    className="absolute top-3 right-3 p-2 rounded-full bg-red-500 text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Remove from saved"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-black/60 backdrop-blur-md text-white text-xs font-semibold">
                                                    {property.price}
                                                </div>
                                            </div>

                                            <div className="p-4">
                                                <h3 className={`font-semibold truncate mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>
                                                    {property.title}
                                                </h3>
                                                <div className="flex items-center gap-1 text-sm text-slate-500 mb-3">
                                                    <MapPin className="w-3 h-3" />
                                                    <span className="truncate">{property.location}</span>
                                                </div>

                                                <div className={`flex items-center justify-between text-xs ${isDark ? "text-slate-400" : "text-slate-500"
                                                    }`}>
                                                    <div className="flex items-center gap-1">
                                                        <BedDouble className="w-3 h-3" />
                                                        <span>{property.beds} Bed</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Bath className="w-3 h-3" />
                                                        <span>{property.baths} Bath</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Maximize className="w-3 h-3" />
                                                        <span>{property.sqft} sqft</span>
                                                    </div>
                                                </div>
                                                <div className={`mt-3 pt-3 border-t text-xs flex justify-between ${isDark ? "border-white/5 text-slate-500" : "border-slate-100 text-slate-400"
                                                    }`}>
                                                    {/* We don't have exact saved date without creating a DTO, keeping simple for now */}
                                                    <span>View Details</span>
                                                    <button
                                                        onClick={() => router.push(`/listings/${property.id}`)}
                                                        className="text-primary-500 hover:underline"
                                                    >
                                                        See Listing
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Roommates Section */}
                        {showRoommates && savedRoommates.length > 0 && (
                            <div>
                                <h2 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${isDark ? "text-slate-500" : "text-slate-400"
                                    }`}>
                                    Saved Roommates
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {savedRoommates.map((post) => (
                                        <div
                                            key={post.id}
                                            className={`p-4 rounded-xl border transition-all ${isDark
                                                ? "bg-dark-800/50 border-white/10 hover:border-white/20"
                                                : "bg-white border-slate-200 hover:border-primary-200 hover:shadow-sm"
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <img
                                                    src={getImage(post, 'roommate')}
                                                    alt={post.userName}
                                                    className="w-12 h-12 rounded-full object-cover"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className={`font-semibold truncate ${isDark ? "text-white" : "text-slate-900"}`}>
                                                            {post.userName || "User"}
                                                        </h3>
                                                        <span className="text-xs font-semibold text-green-500">
                                                            {/* Match Score logic would go here */}
                                                            New Match
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                                                        <MapPin className="w-3 h-3" />
                                                        <span>{post.location}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                                                        <DollarSign className="w-3 h-3" />
                                                        <span>Budget: ${post.budget}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 mt-4">
                                                <button
                                                    onClick={() => router.push(`/messages?userId=${post.userId}`)}
                                                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isDark
                                                        ? "bg-white/10 text-white hover:bg-white/20"
                                                        : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                                                        }`}
                                                >
                                                    <MessageSquare className="w-4 h-4" />
                                                    Message
                                                </button>
                                                <button
                                                    onClick={() => handleRemove(post.id, "roommate")}
                                                    className={`px-3 py-1.5 rounded-lg transition-colors ${isDark
                                                        ? "bg-white/5 text-slate-400 hover:bg-red-500/20 hover:text-red-400"
                                                        : "bg-slate-50 text-slate-500 hover:bg-red-100 hover:text-red-600"
                                                        }`}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Empty States */}
                        {((showRentals && savedProperties.length === 0) || (showRoommates && savedRoommates.length === 0)) && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDark ? "bg-white/5" : "bg-slate-100"
                                    }`}>
                                    <Heart className={`w-8 h-8 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                                </div>
                                <h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                                    No saved items yet
                                </h3>
                                <p className={`text-sm ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                                    Start browsing rentals or roommates to save your favorites here.
                                </p>
                                <button
                                    onClick={() => router.push("/search")}
                                    className="mt-4 px-6 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                                >
                                    Browse Rentals
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
