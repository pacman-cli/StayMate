"use client"

import DashboardLayout from "@/components/DashboardLayout"
import PageContainer from "@/components/dashboard/PageContainer"
import PropertyCard from "@/components/search/PropertyCard"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { savedApi } from "@/lib/api"
import { Heart, Loader2, Search } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

export default function SavedRentalsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { isDark } = useTheme()
  const router = useRouter()

  const [savedProperties, setSavedProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [authLoading, isAuthenticated, router])

  const fetchSavedProperties = async () => {
    try {
      const data = await savedApi.getProperties()
      // Map data to match PropertyCard props if needed, assume backend returns compatible DTO
      // Usually need to ensure 'isSaved' is true for these
      const mapped = data.map((p: any) => ({
        ...p,
        imageUrl: p.imageUrl || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
        isSaved: true
      }))
      setSavedProperties(mapped)
    } catch (error) {
      console.error("Failed to fetch saved properties", error)
      toast.error("Could not load your saved list")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedProperties()
    }
  }, [isAuthenticated])

  const handleRemove = async (id: number) => {
    // Optimistic update
    setSavedProperties(prev => prev.filter(p => p.id !== id))

    try {
      await savedApi.removeProperty(id)
      toast.success("Removed from saved items")
    } catch (error) {
      console.error("Failed to remove saved property", error)
      toast.error("Failed to remove item")
      // Revert would require re-fetching or keeping a backup state,
      // but for simple removal, re-fetching is safer if it fails
      fetchSavedProperties()
    }
  }

  if (authLoading) return null

  return (
    <DashboardLayout>
      <PageContainer
        title="Saved Rentals"
        description="Listings you have bookmarked for later"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            <p className="text-slate-500 text-sm">Loading your favorites...</p>
          </div>
        ) : savedProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedProperties.map((property) => (
              <PropertyCard
                key={property.id}
                {...property}
                onToggleSave={handleRemove}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-96 text-center bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-8">
            <Heart className={`w-12 h-12 mb-4 text-slate-300 dark:text-slate-600`} />
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
              No saved rentals yet
            </h3>
            <p className={`text-sm max-w-xs mx-auto mb-6 ${isDark ? "text-slate-500" : "text-slate-500"}`}>
              Start exploring properties and save the ones you like to view them here.
            </p>
            <Link
              href="/search"
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Browse Rentals
            </Link>
          </div>
        )}
      </PageContainer>
    </DashboardLayout>
  )
}
