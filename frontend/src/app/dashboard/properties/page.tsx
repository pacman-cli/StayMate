"use client"


import AnimatedCard from "@/components/common/AnimatedCard"
import EmptyState from "@/components/common/EmptyState"
import LoadingState from "@/components/common/LoadingState"
import PageContainer from "@/components/common/PageContainer"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { propertyApi } from "@/lib/api"
import { motion } from "framer-motion"
import {
    Bath,
    Bed,
    Building,
    CheckCircle,
    Clock,
    Edit,
    Eye,
    MapPin,
    Plus,
    Star,
    Trash2
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

export default function MyPropertiesPage() {
    const router = useRouter()
    const { isDark } = useTheme()
    const { isAuthenticated, isLoading: authLoading } = useAuth()
    const [properties, setProperties] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login")
        }
    }, [authLoading, isAuthenticated, router])

    useEffect(() => {
        if (isAuthenticated) {
            fetchProperties()
        }
    }, [isAuthenticated])

    const fetchProperties = async () => {
        setLoading(true)
        try {
            const data = await propertyApi.getMyProperties()
            setProperties(data)
        } catch (error) {
            console.error("Failed to fetch properties", error)
            toast.error("Failed to load properties")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this property?")) return

        try {
            await propertyApi.deleteProperty(id)
            toast.success("Property deleted successfully")
            fetchProperties()
        } catch (error) {
            console.error("Failed to delete property", error)
            toast.error("Failed to delete property")
        }
    }

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            Active: {
                icon: CheckCircle,
                className: isDark
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    : "bg-emerald-100 text-emerald-700 border-emerald-200",
            },
            Pending: {
                icon: Clock,
                className: isDark
                    ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                    : "bg-yellow-100 text-yellow-700 border-yellow-200",
            },
            Rented: {
                icon: CheckCircle,
                className: isDark
                    ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                    : "bg-blue-100 text-blue-700 border-blue-200",
            },
        }

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Pending
        const Icon = config.icon

        return (
            <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}
            >
                <Icon className="w-3 h-3" />
                {status}
            </span>
        )
    }

    if (authLoading || loading) {
        return (
            <LoadingState message="Loading your properties..." />
        )
    }

    return (
        <>
            <PageContainer
                title="My Properties"
                description="Manage and track your rental listings"
                action={
                    <Link
                        href="/dashboard/properties/add"
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 ${isDark
                            ? "bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/25"
                            : "bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-lg"
                            }`}
                    >
                        <Plus className="w-4 h-4" />
                        Add Property
                    </Link>
                }
            >
                {properties.length === 0 ? (
                    <EmptyState
                        icon={Building}
                        title="No properties listed yet"
                        description="Start earning by listing your first property and reaching potential tenants"
                        action={
                            <Link
                                href="/dashboard/properties/add"
                                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${isDark
                                    ? "bg-primary-500 hover:bg-primary-600 text-white"
                                    : "bg-primary-600 hover:bg-primary-700 text-white"
                                    }`}
                            >
                                <Plus className="w-5 h-5" />
                                Create Your First Listing
                            </Link>
                        }
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.map((property, index) => (
                            <AnimatedCard
                                key={property.id}
                                delay={index * 0.1}
                                className="overflow-hidden group"
                            >
                                {/* Image */}
                                <div className="relative aspect-video overflow-hidden">
                                    <motion.img
                                        src={
                                            property.imageUrl ||
                                            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80"
                                        }
                                        alt={property.title}
                                        className="w-full h-full object-cover"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                    <div className="absolute top-3 right-3">
                                        {getStatusBadge(property.status || "Active")}
                                    </div>
                                    <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white text-sm font-medium">
                                        <Eye className="w-4 h-4" />
                                        {property.views || 0} views
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5 space-y-4">
                                    <div>
                                        <h3
                                            className={`font-semibold text-lg mb-1 line-clamp-1 ${isDark ? "text-white" : "text-slate-900"
                                                }`}
                                        >
                                            {property.title}
                                        </h3>
                                        <div
                                            className={`flex items-center gap-1.5 text-sm ${isDark ? "text-slate-400" : "text-slate-500"
                                                }`}
                                        >
                                            <MapPin className="w-4 h-4 flex-shrink-0" />
                                            <span className="truncate">
                                                {property.location || property.city}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <div className="flex items-center gap-4 text-sm">
                                        <div
                                            className={`flex items-center gap-1.5 ${isDark ? "text-slate-300" : "text-slate-600"
                                                }`}
                                        >
                                            <Bed className="w-4 h-4" />
                                            <span>{property.beds || 0} Beds</span>
                                        </div>
                                        <div
                                            className={`flex items-center gap-1.5 ${isDark ? "text-slate-300" : "text-slate-600"
                                                }`}
                                        >
                                            <Bath className="w-4 h-4" />
                                            <span>{property.baths || 0} Baths</span>
                                        </div>
                                        {property.sqft && (
                                            <div
                                                className={`flex items-center gap-1.5 ${isDark ? "text-slate-300" : "text-slate-600"
                                                    }`}
                                            >
                                                <Building className="w-4 h-4" />
                                                <span>{property.sqft} sqft</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Rating & Price */}
                                    <div className="flex items-center justify-between pt-3 border-t border-white/10 dark:border-slate-700">
                                        <div className="flex items-center gap-1">
                                            <Star
                                                className={`w-4 h-4 fill-yellow-400 text-yellow-400 ${isDark ? "" : ""
                                                    }`}
                                            />
                                            <span
                                                className={`text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"
                                                    }`}
                                            >
                                                {property.rating?.toFixed(1) || "0.0"}
                                            </span>
                                        </div>
                                        <span
                                            className={`text-lg font-bold ${isDark ? "text-primary-400" : "text-primary-600"
                                                }`}
                                        >
                                            {property.price || `BDT ${property.priceAmount?.toLocaleString() || 0}/mo`}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 pt-2">
                                        <Link
                                            href={`/dashboard/properties/${property.id}`}
                                            className={`flex-1 text-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDark
                                                ? "bg-white/10 hover:bg-white/20 text-white"
                                                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                                }`}
                                        >
                                            View
                                        </Link>
                                        <Link
                                            href={`/dashboard/properties/edit/${property.id}`}
                                            className={`px-4 py-2 rounded-lg transition-colors ${isDark
                                                ? "bg-white/10 hover:bg-white/20 text-primary-400"
                                                : "bg-slate-100 hover:bg-slate-200 text-primary-600"
                                                }`}
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(property.id)}
                                            className={`px-4 py-2 rounded-lg transition-colors ${isDark
                                                ? "bg-white/10 hover:bg-red-500/20 text-red-400 hover:text-red-300"
                                                : "bg-slate-100 hover:bg-red-50 text-red-600 hover:text-red-700"
                                                }`}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </AnimatedCard>
                        ))}
                    </div>
                )}
            </PageContainer>
        </>
    )
}
