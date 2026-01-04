"use client"

import { LandlordDashboardDTO } from "@/types/auth"
import { Check, Clock, DollarSign, Eye, Home, MessageSquare, Plus, Users, X } from "lucide-react"
import Link from "next/link"

interface LandlordDashboardProps {
  stats: LandlordDashboardDTO
  isDark: boolean
}

export function LandlordDashboard({ stats, isDark }: LandlordDashboardProps) {

  const cards = [
    {
      label: "Total Properties",
      value: stats.activePropertiesCount,
      icon: Home,
      color: "blue",
      trend: "Active Listings"
    },
    {
      label: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "emerald",
      trend: "Lifetime Earnings"
    },
    {
      label: "Occupancy Rate",
      value: `${Math.round(stats.occupancyRate)}%`,
      icon: Users,
      color: "amber",
      trend: "Seat Occupancy"
    },
    {
      label: "Total Views",
      value: stats.totalViews || 0,
      icon: Eye,
      color: "purple",
      trend: "All Time"
    },
    {
      label: "Inquiries",
      value: stats.totalInquiries || 0,
      icon: MessageSquare,
      color: "pink",
      trend: "Direct Inquiries"
    }
  ]

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* 1. Header & KPIs */}
      <div>
        <h2 className={`text-2xl font-bold mb-6 ${isDark ? "text-white" : "text-slate-900"}`}>
          Landlord Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {cards.map((card, index) => (
            <div key={index} className={`p-4 rounded-2xl border ${isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-slate-100"
              } backdrop-blur-xl flex flex-col gap-3 hover:scale-105 transition-transform duration-300`}>
              <div className={`p-3 w-fit rounded-xl ${card.color === 'blue' ? 'bg-blue-500/10 text-blue-500' :
                card.color === 'amber' ? 'bg-amber-500/10 text-amber-500' :
                  card.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' :
                    card.color === 'purple' ? 'bg-purple-500/10 text-purple-500' :
                      'bg-pink-500/10 text-pink-500'
                }`}>
                <card.icon className="w-5 h-5" />
              </div>
              <div>
                <p className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>{card.label}</p>
                <h3 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{card.value}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* 2. Incoming Tenant Requests */}
        <div className={`p-6 rounded-2xl border ${isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-slate-100"
          } backdrop-blur-xl h-full`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`font-semibold text-lg ${isDark ? "text-white" : "text-slate-900"}`}>
              Incoming Tenant Requests
            </h3>
            <span className={`text-xs px-2 py-1 rounded-full ${isDark ? "bg-amber-500/10 text-amber-500" : "bg-amber-50 text-amber-600"}`}>
              {stats.totalRequestsPending} Pending
            </span>
          </div>

          <div className="space-y-4">
            {stats.incomingTenantRequests && stats.incomingTenantRequests.length > 0 ? (
              stats.incomingTenantRequests.map((req: any) => (
                <div key={req.id} className={`p-4 rounded-xl border flex items-center justify-between ${isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                      {/* Avatar placeholder */}
                      <div className="w-full h-full flex items-center justify-center bg-indigo-500 text-white font-bold">
                        {req.tenantName?.charAt(0) || "U"}
                      </div>
                    </div>
                    <div>
                      <h4 className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{req.tenantName}</h4>
                      <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        Requested for Seat #2 • {new Date(req.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">
                      <Check className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className={`text-center py-12 border-2 border-dashed rounded-xl ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                <Clock className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                <p className={isDark ? "text-slate-500" : "text-slate-400"}>No pending requests</p>
              </div>
            )}
          </div>
        </div>

        {/* 3. My Properties Overview */}
        <div className={`p-6 rounded-2xl border ${isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-slate-100"
          } backdrop-blur-xl h-full`}>
          <h3 className={`font-semibold text-lg mb-6 ${isDark ? "text-white" : "text-slate-900"}`}>
            My Properties
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stats.myPropertiesOverview && stats.myPropertiesOverview.length > 0 ? (
              stats.myPropertiesOverview.map((prop: any) => (
                <div key={prop.id} className={`group relative overflow-hidden rounded-xl aspect-[4/3] bg-slate-100 ${isDark ? "bg-slate-800" : ""}`}>
                  {/* Image Placeholder */}
                  {prop.imageUrl ? (
                    <img src={prop.imageUrl} alt={prop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Home className="w-8 h-8" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col justify-end">
                    <h4 className="text-white font-medium truncate">{prop.title}</h4>
                    <div className="flex justify-between items-end mt-1">
                      <span className="text-xs text-white/80">{prop.beds} Beds • {prop.baths} Baths</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-500 text-white">Active</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-12">
                <p className={isDark ? "text-slate-500" : "text-slate-400"}>No properties listed yet.</p>
              </div>
            )}
            {/* Add New Property Card - Link */}
            <Link href="/dashboard/properties/add" className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer hover:bg-slate-50 transition-colors ${isDark ? "border-slate-700 hover:bg-slate-800" : "border-slate-200"
              }`}>
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2">
                <Plus className="w-5 h-5 text-slate-400" />
              </div>
              <span className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>Add Property</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}

