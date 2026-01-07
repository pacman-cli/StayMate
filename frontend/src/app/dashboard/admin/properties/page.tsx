"use client"

import { useAuth } from "@/context/AuthContext"
import { adminApi } from "@/lib/api"
import { Bath, Bed, Building, Check, MapPin, User, X } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

export default function AdminPropertiesPage() {
  const { user } = useAuth()
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("ALL") // ALL, PENDING, ACTIVE

  useEffect(() => {
    loadProperties()
  }, [])

  const loadProperties = async () => {
    try {
      const res = await adminApi.getAllProperties()
      setProperties(res)
    } catch (error) {
      console.error(error)
      toast.error("Failed to load properties")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: number) => {
    try {
      await adminApi.approveProperty(id)
      toast.success("Property approved")
      loadProperties()
    } catch (error) {
      toast.error("Failed to approve property")
    }
  }

  const handleReject = async (id: number) => {
    if (!confirm("Are you sure you want to reject this property?")) return
    try {
      await adminApi.rejectProperty(id)
      toast.success("Property rejected")
      loadProperties()
    } catch (error) {
      toast.error("Failed to reject property")
    }
  }

  const filteredProperties = properties.filter(p => {
    if (filter === "ALL") return true

    // Normalize status for comparison logic
    // Backend statuses: "Active", "Pending", "Rejected"
    // Filter keys: "ACTIVE", "PENDING"
    if (filter === "ACTIVE") return p.status === "Active"
    if (filter === "PENDING") return p.status === "Pending"

    return true
  })

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Property Management</h1>
          <p className="text-slate-500 text-sm">Review, approve, or reject property listings.</p>
        </div>
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          {["ALL", "PENDING", "ACTIVE"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${filter === f
                ? "bg-white dark:bg-slate-700 text-primary-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredProperties.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No properties found.</div>
          ) : (
            filteredProperties.map((property) => (
              <div key={property.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-64 h-40 bg-slate-200 rounded-lg overflow-hidden shrink-0">
                  {property.imageUrl ? (
                    <img src={property.imageUrl} alt={property.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Building className="w-8 h-8" />
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{property.title}</h3>
                        <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                          <MapPin className="w-4 h-4" />
                          {property.location}
                        </div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${property.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                        property.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                        {property.status}
                      </span>
                    </div>

                    <div className="flex gap-4 text-sm text-slate-500 mt-4">
                      <span className="flex items-center gap-1"><Bed className="w-4 h-4" /> {property.beds} Beds</span>
                      <span className="flex items-center gap-1"><Bath className="w-4 h-4" /> {property.baths} Baths</span>
                      <span className="flex items-center gap-1"><User className="w-4 h-4" /> {property.ownerName || "Unknown Owner"}</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition">
                      View Details
                    </button>
                    {property.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => handleReject(property.id)}
                          className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 rounded-lg transition flex items-center gap-2"
                        >
                          <X className="w-4 h-4" /> Reject
                        </button>
                        <button
                          onClick={() => handleApprove(property.id)}
                          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition flex items-center gap-2 shadow-sm"
                        >
                          <Check className="w-4 h-4" /> Approve
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
