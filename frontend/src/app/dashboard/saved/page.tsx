"use client"

import Avatar from "@/components/common/Avatar"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { messageApi, savedApi } from "@/lib/api"
import {
  Bath,
  BedDouble,
  DollarSign,
  Heart,
  Loader2,
  MapPin,
  Maximize,
  MessageSquare,
  Trash2
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "react-hot-toast"

export default function SavedPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { isDark } = useTheme()

  const [activeTab, setActiveTab] = useState<"all" | "rentals" | "roommates">("all")
  const [savedProperties, setSavedProperties] = useState<any[]>([])
  const [savedRoommates, setSavedRoommates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [messagingId, setMessagingId] = useState<number | null>(null)

  // Prevent duplicate fetches (React Strict Mode protection)
  const fetchedRef = useRef(false)

  // Auth check handled by ProtectedRoute in layout, but double check doesn't hurt
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [authLoading, isAuthenticated, router])

  // Fetch data with duplicate protection
  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return
    if (fetchedRef.current) return // Already fetched
    fetchedRef.current = true

    try {
      setIsLoading(true)
      const [properties, roommates] = await Promise.all([
        savedApi.getProperties().catch(() => []),
        savedApi.getRoommates().catch(() => [])
      ])

      setSavedProperties(properties || [])
      setSavedRoommates(roommates || [])
    } catch (error: any) {
      console.error(error)
      // Handle rate limit specifically
      if (error.response?.status === 429) {
        toast.error("Please wait a moment before refreshing")
      } else {
        const message = error.response?.data?.message || "Failed to load saved items"
        toast.error(message)
      }
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    fetchData()
  }, [isAuthenticated])

  const handleRemove = async (id: number, type: "rental" | "roommate") => {
    try {
      if (type === "rental") {
        // Optimistic update
        setSavedProperties(prev => prev.filter(p => p.id !== id))
        await savedApi.removeProperty(id)
        toast.success("Property removed from saved")
      } else {
        setSavedRoommates(prev => prev.filter(r => r.id !== id))
        await savedApi.removeRoommate(id)
        toast.success("Roommate removed from saved")
      }
    } catch (error) {
      console.error("Failed to remove saved item:", error)
      toast.error("Failed to remove item")
      // Revert on error - reset ref to allow refetch
      fetchedRef.current = false
      fetchData()
    }
  }

  // Helper for images
  const getPropertyImage = (item: any) => {
    return item.imageUrl || "/images/property-placeholder.svg"
  }

  // Handle message button click
  const handleMessage = async (post: any) => {
    setMessagingId(post.userId)
    try {
      const conversation = await messageApi.createConversation({
        recipientId: post.userId,
        initialMessage: `Hi ${post.userName?.split(' ')[0] || 'there'}! I saved your roommate profile and wanted to connect.`
      })
      router.push(`/messages?conversation=${conversation.id}`)
    } catch (error) {
      console.error("Failed to start conversation:", error)
      toast.error("Failed to start conversation")
    } finally {
      setMessagingId(null)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const showRentals = activeTab === "all" || activeTab === "rentals"
  const showRoommates = activeTab === "all" || activeTab === "roommates"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
          Saved Items
        </h1>
        <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Your collections of properties and potential roommates
        </p>
      </div>

      {/* Tabs */}
      <div className={`flex items-center gap-2 pb-4 border-b ${isDark ? "border-white/10" : "border-slate-200"}`}>
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === "all"
            ? isDark
              ? "bg-primary-600 text-white"
              : "bg-primary-500 text-white"
            : isDark
              ? "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
        >
          All Saved
        </button>
        <button
          onClick={() => setActiveTab("rentals")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === "rentals"
            ? isDark
              ? "bg-primary-600 text-white"
              : "bg-primary-500 text-white"
            : isDark
              ? "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
        >
          Properties ({savedProperties.length})
        </button>
        <button
          onClick={() => setActiveTab("roommates")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === "roommates"
            ? isDark
              ? "bg-primary-600 text-white"
              : "bg-primary-500 text-white"
            : isDark
              ? "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
        >
          Roommates ({savedRoommates.length})
        </button>
      </div>

      {/* Content */}
      <div className="space-y-8">
        {/* Rentals Section */}
        {showRentals && savedProperties.length > 0 && (
          <div>
            <h2 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
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
                      src={getPropertyImage(property)}
                      alt={property.title}
                      onError={(e) => { e.currentTarget.src = "/images/property-placeholder.svg" }}
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
                      {typeof property.price === 'number' ? `$${property.price}/mo` : property.price}
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

                    <div className={`flex items-center justify-between text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
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
                    <div className={`mt-3 pt-3 border-t text-xs flex justify-between ${isDark ? "border-white/5 text-slate-500" : "border-slate-100 text-slate-400"}`}>
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
            <h2 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
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
                    <Avatar name={post.userName || "User"} src={post.userAvatar || post.user?.profilePictureUrl} size="lg" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-semibold truncate ${isDark ? "text-white" : "text-slate-900"}`}>
                          {post.userName || "User"}
                        </h3>
                        <span className="text-xs font-semibold text-green-500">
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
                      onClick={() => handleMessage(post)}
                      disabled={messagingId === post.userId}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${isDark
                        ? "bg-white/10 text-white hover:bg-white/20"
                        : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                        }`}
                    >
                      {messagingId === post.userId ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <MessageSquare className="w-4 h-4" />
                      )}
                      {messagingId === post.userId ? "Connecting..." : "Message"}
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
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDark ? "bg-white/5" : "bg-slate-100"}`}>
              <Heart className={`w-8 h-8 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
              No saved items found
            </h3>
            <p className={`text-sm ${isDark ? "text-slate-500" : "text-slate-500"}`}>
              Start browsing rentals or roommates to save your favorites here.
            </p>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => router.push("/search")}
                className="px-6 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              >
                Browse Rentals
              </button>
              <button
                onClick={() => router.push("/roommates")}
                className={`px-6 py-2 rounded-lg border transition-colors ${isDark
                  ? "border-white/10 text-white hover:bg-white/10"
                  : "border-slate-200 text-slate-900 hover:bg-slate-50"
                  }`}
              >
                Browse Roommates
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
