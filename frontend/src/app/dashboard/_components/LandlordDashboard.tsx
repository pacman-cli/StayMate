"use client"

import { BusinessHealthStats } from "@/components/landlord/dashboard/BusinessHealthStats"
import { PropertyCommandCenter } from "@/components/landlord/dashboard/PropertyCommandCenter"
import { ReputationMonitor } from "@/components/landlord/dashboard/ReputationMonitor"
import { TenantRequestManager } from "@/components/landlord/dashboard/TenantRequestManager"
import { landlordApi } from "@/lib/api"
import { Booking, LandlordDashboardDTO, LandlordOverviewStats, PropertySeatSummary, ReviewResponse } from "@/types/auth"
import { useEffect, useState } from "react"

interface LandlordDashboardProps {
  stats: LandlordDashboardDTO | null
  isDark: boolean
}

export function LandlordDashboard({ stats: initialStats, isDark }: LandlordDashboardProps) {

  // Local state for the enhanced dashboard data
  const [overview, setOverview] = useState<LandlordOverviewStats | null>(null)
  const [properties, setProperties] = useState<PropertySeatSummary[]>([])
  const [requests, setRequests] = useState<Booking[]>([])
  const [reviews, setReviews] = useState<ReviewResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const [overviewData, propertiesData, bookingsData, reviewsData] = await Promise.all([
        landlordApi.getOverview(),
        landlordApi.getPropertySummaries(),
        landlordApi.getBookings(),
        landlordApi.getReviews()
      ])

      setOverview(overviewData)
      setProperties(propertiesData)
      setRequests(bookingsData)
      setReviews(reviewsData)
    } catch (error) {
      console.error("Failed to fetch landlord dashboard data", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleToggleSeat = async (seatId: number) => {
    try {
      await landlordApi.toggleSeatAvailability(seatId)
      // Optimistic update or refetch
      const updatedProperties = await landlordApi.getPropertySummaries()
      setProperties(updatedProperties)
      // Also refetch overview as occupancy changes
      const updatedOverview = await landlordApi.getOverview()
      setOverview(updatedOverview)
    } catch (e) {
      console.error("Failed to toggle seat", e)
    }
  }

  const handleApproveRequest = async (id: number) => {
    try {
      await landlordApi.updateBookingStatus(id, "CONFIRMED")
      // Refetch everything
      fetchDashboardData()
    } catch (e) {
      console.error("Failed to approve booking", e)
    }
  }

  const handleRejectRequest = async (id: number) => {
    try {
      await landlordApi.updateBookingStatus(id, "CANCELLED")
      // Refetch
      fetchDashboardData()
    } catch (e) {
      console.error("Failed to reject booking", e)
    }
  }

  if (isLoading || !overview) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500">Loading your command center...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
          Landlord Command Center
        </h2>
        <button
          onClick={fetchDashboardData}
          className="text-sm text-indigo-500 hover:text-indigo-600 font-medium"
        >
          Refresh Data
        </button>
      </div>

      {/* 1. API Driven Stats */}
      <BusinessHealthStats stats={overview} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. Main Area: Property & Seat Management (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Vacant Properties ("Active" / "Pending" / etc but NOT "Booked") */}
          <PropertyCommandCenter
            title="Vacant Properties"
            properties={properties.filter(p => !p.status || p.status === 'Vacant')}
            onToggleSeat={handleToggleSeat}
          />

          {/* Booked Properties */}
          <PropertyCommandCenter
            title="Booked Properties"
            properties={properties.filter(p => p.status === 'Booked')}
            onToggleSeat={handleToggleSeat}
          />
        </div>

        {/* 3. Sidebar: Requests & Reputation (1/3 width) */}
        <div className="space-y-8 flex flex-col h-full">
          <div className="flex-1 min-h-[400px]">
            <TenantRequestManager
              requests={requests}
              onApprove={handleApproveRequest}
              onReject={handleRejectRequest}
            />
          </div>
          <div className="flex-1 min-h-[400px]">
            <ReputationMonitor reviews={reviews} />
          </div>
        </div>
      </div>
    </div>
  )
}
