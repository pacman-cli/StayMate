"use client"

import LoadingState from "@/components/common/LoadingState"
import PageContainer from "@/components/common/PageContainer"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { propertyApi } from "@/lib/api"
import {
  Bath,
  Bed,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  Heart,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Star,
  Trash2,
  Wifi
} from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

export default function OwnerPropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { isDark } = useTheme()

  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    const fetchProperty = async () => {
      if (!params.id) return
      try {
        // Use the secure owner-specific endpoint
        const data = await propertyApi.getMyPropertyDetails(Number(params.id))
        setProperty(data)
      } catch (error: any) {
        console.error("Failed to fetch property details", error)
        toast.error("Failed to load property details")
        router.push("/dashboard/properties")
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchProperty()
    }
  }, [params.id, isAuthenticated, router])

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this property? This action cannot be undone.")) return

    try {
      await propertyApi.deleteProperty(property.id)
      toast.success("Property deleted successfully")
      router.push("/dashboard/properties")
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
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${config.className}`}
      >
        <Icon className="w-4 h-4" />
        {status}
      </span>
    )
  }

  if (authLoading || loading) {
    return <LoadingState message="Loading property details..." />
  }

  if (!property) return null

  // Fallback images if list is empty (though backend should now return valid list)
  const images = property.images && property.images.length > 0
    ? property.images
    : [property.imageUrl || "/images/property-placeholder.jpg"]

  return (
    <PageContainer
      title="Property Details"
      description="View and manage your property listing"
      action={
        <div className="flex items-center gap-3">
          <button
            onClick={handleDelete}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${isDark
              ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
              : "bg-red-50 text-red-600 hover:bg-red-100"
              }`}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
          <Link
            href={`/dashboard/properties/edit/${property.id}`}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${isDark
              ? "bg-primary-500 hover:bg-primary-600 text-white"
              : "bg-primary-600 hover:bg-primary-700 text-white"
              }`}
          >
            <Edit className="w-4 h-4" />
            Edit Property
          </Link>
        </div>
      }
    >
      <div className={`space-y-8 ${isDark ? "text-slate-200" : "text-slate-700"}`}>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (Images & Details) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-white/10 group relative">
              <div className="aspect-video relative">
                <img
                  src={images[0]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  {getStatusBadge(property.status)}
                </div>
              </div>
            </div>

            {/* Property Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                    {property.title}
                  </h1>
                  <div className="flex items-center gap-2 text-slate-500">
                    <MapPin className="w-5 h-5" />
                    <span className="text-lg">{property.location}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${isDark ? "text-primary-400" : "text-primary-600"}`}>
                    {property.price}
                  </div>
                  <span className="text-sm text-slate-500">per month</span>
                </div>
              </div>

              {/* Features Grid */}
              <div className={`grid grid-cols-4 gap-4 py-6 border-y ${isDark ? "border-white/10" : "border-slate-200"}`}>
                <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-white/5">
                  <Bed className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                  <div className="text-xl font-bold">{property.beds}</div>
                  <div className="text-xs text-slate-500">Bedrooms</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-white/5">
                  <Bath className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                  <div className="text-xl font-bold">{property.baths}</div>
                  <div className="text-xs text-slate-500">Bathrooms</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-white/5">
                  <Building className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                  <div className="text-xl font-bold">{property.sqft}</div>
                  <div className="text-xs text-slate-500">Sq Ft</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-white/5">
                  <Star className="w-6 h-6 mx-auto mb-2 text-amber-400" />
                  <div className="text-xl font-bold">{property.rating}</div>
                  <div className="text-xs text-slate-500">Rating</div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className={`text-xl font-bold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>About this property</h2>
                <p className="leading-relaxed opacity-80 whitespace-pre-line">
                  {property.description}
                </p>
              </div>

              {/* Amenities used for listing preview */}
              <div>
                <h2 className={`text-xl font-bold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>Features</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 opacity-80">
                    <Wifi className="w-5 h-5" />
                    <span>High-speed Wifi</span>
                  </div>
                  <div className="flex items-center gap-3 opacity-80">
                    <CheckCircle className="w-5 h-5" />
                    <span>Verified Listing</span>
                  </div>
                  <div className="flex items-center gap-3 opacity-80">
                    <ShieldCheck className="w-5 h-5" />
                    <span>Secure Property</span>
                  </div>
                  <div className="flex items-center gap-3 opacity-80">
                    <Calendar className="w-5 h-5" />
                    <span>Available Now</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Stats & Quick Info) */}
          <div className="space-y-6">
            {/* Analytics Card */}
            <div className={`p-6 rounded-2xl border ${isDark ? "bg-dark-800 border-white/10" : "bg-white border-slate-200"}`}>
              <h3 className={`text-lg font-bold mb-6 ${isDark ? "text-white" : "text-slate-900"}`}>Performance</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                      <Eye className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">Total Views</div>
                      <div className="text-xl font-bold">{property.views}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">Inquiries</div>
                      <div className="text-xl font-bold">{property.inquiries}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-pink-500/10 text-pink-500">
                      <Heart className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">Saves</div>
                      <div className="text-xl font-bold">--</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className={`p-6 rounded-2xl border ${isDark ? "bg-indigo-900/10 border-indigo-500/30" : "bg-indigo-50 border-indigo-200"}`}>
              <h3 className={`text-lg font-bold mb-3 ${isDark ? "text-indigo-400" : "text-indigo-900"}`}>Host Tips</h3>
              <p className={`text-sm leading-relaxed ${isDark ? "text-indigo-200" : "text-indigo-800"}`}>
                Properties with more than 5 photos get 3x more views. Make sure your listing description highlights unique features.
              </p>
              <Link
                href={`/dashboard/properties/edit/${property.id}`}
                className={`block text-center mt-4 w-full py-2 rounded-lg text-sm font-medium transition-colors ${isDark
                  ? "bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30"
                  : "bg-white text-indigo-700 hover:bg-indigo-50 shadow-sm"
                  }`}
              >
                Improve Listing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
