"use client"

import DashboardLayout from "@/components/DashboardLayout"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { bookingApi, propertyApi } from "@/lib/api"
import {
  Calendar,
  CheckCircle2,
  Heart,
  MapPin,
  Share2,
  ShieldCheck,
  Star,
  Wifi
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

export default function ListingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()
  const { isDark } = useTheme()

  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingSent, setBookingSent] = useState(false)

  // Date inputs for booking
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?redirect=/listings/${params.id}`)
    }
  }, [authLoading, isAuthenticated, router, params.id])

  useEffect(() => {
    const fetchProperty = async () => {
      if (!params.id) return
      try {
        const data = await propertyApi.getProperty(Number(params.id))
        setProperty({
          ...data,
          // TODO: Backend should return array of images
          images: [
            data.imageUrl || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1484154218962-a1c002085d2f?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80"
          ]
        })
      } catch (error) {
        console.error("Failed to fetch property", error)
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchProperty()
    }
  }, [params.id, isAuthenticated])

  const handleRequestBooking = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select check-in and check-out dates")
      return
    }

    if (new Date(startDate) >= new Date(endDate)) {
      toast.error("Check-out date must be after check-in date")
      return
    }

    setBookingLoading(true)
    try {
      await bookingApi.createBooking({
        landlordId: property.ownerId,
        propertyId: property.id,
        startDate: startDate,
        endDate: endDate,
        notes: `Booking request for ${property.title}`
      })
      setBookingSent(true)
      toast.success("Booking request sent successfully!")
    } catch (error: any) {
      console.error("Failed to send booking request", error)
      toast.error(error?.response?.data?.message || "Failed to send booking request")
    } finally {
      setBookingLoading(false)
    }
  }

  if (authLoading || loading) return null

  if (!property) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <p className="text-slate-500">Property not found</p>
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div className={`min-h-screen pb-20 ${isDark ? "bg-dark-900" : "bg-slate-50"}`}>

        {/* Hero Image Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 h-[300px] md:h-[400px] lg:h-[500px] rounded-2xl overflow-hidden relative">
            {/* Main Image */}
            <div className="col-span-1 md:col-span-2 row-span-2 relative group cursor-pointer">
              <img
                src={property.images[0]}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                alt="Main view"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
            </div>
            {/* Smaller Images */}
            {property.images.slice(1, 5).map((img: string, idx: number) => (
              <div key={idx} className="relative group cursor-pointer hidden md:block">
                <img
                  src={img}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt={`View ${idx + 2}`}
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
              </div>
            ))}

            <button className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-lg text-sm font-semibold shadow-lg hover:bg-white transition-colors">
              Show all photos
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

            {/* Main Content */}
            <div className="flex-1">
              {/* Header */}
              <div className="border-b border-slate-200 dark:border-white/10 pb-6 mb-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className={`text-2xl md:text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                      {property.title}
                    </h1>
                    <div className="flex items-center gap-2 text-slate-500">
                      <MapPin className="w-4 h-4" />
                      <span>{property.location}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className={`p-2 rounded-full border transition-all ${isDark ? "border-white/10 hover:bg-white/10" : "border-slate-200 hover:bg-slate-100"
                      }`}>
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button className={`p-2 rounded-full border transition-all ${isDark ? "border-white/10 hover:bg-white/10" : "border-slate-200 hover:bg-slate-100"
                      }`}>
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className={`flex flex-wrap gap-6 py-4 rounded-xl border ${isDark ? "bg-white/5 border-white/5" : "bg-white border-slate-100"
                  }`}>
                  <div className="flex-1 flex flex-col items-center justify-center md:border-r border-slate-200 dark:border-white/10">
                    <span className="text-2xl font-bold">{property.beds}</span>
                    <span className="text-sm text-slate-500">Bedrooms</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center md:border-r border-slate-200 dark:border-white/10">
                    <span className="text-2xl font-bold">{property.baths}</span>
                    <span className="text-sm text-slate-500">Bathrooms</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center md:border-r border-slate-200 dark:border-white/10">
                    <span className="text-2xl font-bold">{property.sqft}</span>
                    <span className="text-sm text-slate-500">Square Feet</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-bold">{property.rating}</span>
                      <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                    </div>
                    <span className="text-sm text-slate-500">Rating</span>
                  </div>
                </div>
              </div>

              {/* Host Info */}
              <div className="py-6 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-slate-200 overflow-hidden">
                      <img src={`https://ui-avatars.com/api/?name=${property.ownerName}&background=random`} alt={property.ownerName} />
                    </div>
                    <div>
                      <h3 className={`font-semibold text-lg ${isDark ? "text-white" : "text-slate-900"}`}>
                        Hosted by {property.ownerName}
                      </h3>
                      <p className="text-sm text-slate-500">Joined in December 2024</p>
                    </div>
                  </div>
                  <button className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${isDark
                    ? "border-white/10 hover:bg-white/10"
                    : "border-slate-200 hover:bg-slate-50"
                    }`}>
                    Message Host
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="py-8 border-b border-slate-200 dark:border-white/10">
                <h2 className={`text-xl font-bold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
                  About this place
                </h2>
                <p className={`leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  {property.description}
                </p>
              </div>

              {/* Amenities (Hardcoded for now) */}
              <div className="py-8 border-b border-slate-200 dark:border-white/10">
                <h2 className={`text-xl font-bold mb-6 ${isDark ? "text-white" : "text-slate-900"}`}>
                  What this place offers
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { icon: Wifi, label: "High-speed Wifi" },
                    { icon: Calendar, label: "Free cancellation for 48 hours" },
                    { icon: CheckCircle2, label: "Self check-in" },
                    { icon: ShieldCheck, label: "Security cameras on property" },
                  ].map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-slate-500">
                      <amenity.icon className="w-5 h-5" />
                      <span>{amenity.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sticky Sidebar */}
            <div className="lg:w-[380px]">
              <div className={`sticky top-24 rounded-2xl p-6 border shadow-xl ${isDark ? "bg-dark-800 border-white/10" : "bg-white border-slate-200"
                }`}>
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <span className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                      {property.price}
                    </span>
                    <span className="text-slate-500 ml-1">/month</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span>{property.rating}</span>
                    <span className="text-slate-400">({property.views} reviews)</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className={`rounded-xl border overflow-hidden ${isDark ? "border-white/10" : "border-slate-200"}`}>
                    <div className="flex border-b border-inherit">
                      <div className="flex-1 p-3 border-r border-inherit">
                        <label className="block text-xs font-bold uppercase mb-1">Check-in</label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className={`w-full text-sm bg-transparent outline-none ${isDark ? "text-white" : "text-slate-900"}`}
                        />
                      </div>
                      <div className="flex-1 p-3">
                        <label className="block text-xs font-bold uppercase mb-1">Check-out</label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          min={startDate || new Date().toISOString().split('T')[0]}
                          className={`w-full text-sm bg-transparent outline-none ${isDark ? "text-white" : "text-slate-900"}`}
                        />
                      </div>
                    </div>
                    <div className="p-3">
                      <label className="block text-xs font-bold uppercase mb-1">Guests</label>
                      <div className="text-sm">1 guest</div>
                    </div>
                  </div>

                  {bookingSent ? (
                    <div className="p-4 rounded-xl bg-green-500/10 text-green-500 border border-green-500/20 text-center">
                      <CheckCircle2 className="w-6 h-6 mx-auto mb-2" />
                      <p className="font-semibold">Request Sent!</p>
                      <p className="text-sm opacity-80">The host will contact you soon.</p>
                    </div>
                  ) : (
                    <button
                      onClick={handleRequestBooking}
                      disabled={bookingLoading}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {bookingLoading ? "Sending..." : "Request to Book"}
                    </button>
                  )}

                  <p className="text-center text-xs text-slate-500">
                    You won't be charged yet
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
