"use client"

import DashboardLayout from "@/components/DashboardLayout"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { getRoleBadgeColor, getRoleDisplayName } from "@/types/auth"
import { format } from "date-fns"
import { Calendar, Loader2, Mail, MapPin, Phone, Shield } from "lucide-react"
import { useState } from "react"
import { toast } from "react-hot-toast"

export default function ProfilePage() {
  const { user, isHouseOwner, refreshUser } = useAuth()
  const { isDark } = useTheme()
  const [uploading, setUploading] = useState(false)

  if (!user) return null

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB")
      return
    }

    setUploading(true)
    try {
      const { userApi } = await import("@/lib/api")
      await userApi.uploadProfilePicture(file)

      // Refresh user data to get updated profile picture URL
      if (refreshUser) {
        await refreshUser()
      }

      toast.success("Profile picture updated!")
    } catch (error: any) {
      console.error("Failed to upload profile picture", error)
      const message = error.response?.data?.message || "Failed to upload profile picture"
      toast.error(message)
    } finally {
      setUploading(false)
      // Reset file input
      e.target.value = ""
    }
  }

  return (
    <DashboardLayout title="My Profile" description="Manage your personal information and account settings">
      <div className={`rounded-2xl border overflow-hidden ${isDark ? "bg-dark-800 border-white/10" : "bg-white border-slate-200"}`}>

        {/* Cover & Avatar */}
        <div className="relative h-48 bg-gradient-to-r from-primary-500 to-primary-700">
          <div className="absolute -bottom-12 left-8 group">
            <div className={`relative w-24 h-24 rounded-full border-4 overflow-hidden ${isDark ? "border-dark-800" : "border-white"}`}>
              {user.profilePictureUrl ? (
                <img
                  src={`${user.profilePictureUrl}?t=${Date.now()}`}
                  alt={user.firstName || "Profile"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-2xl">
                  {(user.firstName?.[0] || user.email[0]).toUpperCase()}
                </div>
              )}

              {/* Upload Overlay */}
              <label className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity cursor-pointer ${uploading ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                {uploading ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <span className="text-white text-xs font-medium">Change</span>
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  disabled={uploading}
                  onChange={handleProfilePictureUpload}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="pt-14 px-8 pb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">

            {/* Basic Info */}
            <div>
              <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                {user.firstName} {user.lastName}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                {user.roles?.map(role => (
                  <span key={role} className={`px-2 py-0.5 text-xs font-bold rounded uppercase ${getRoleBadgeColor(role)}`}>
                    {getRoleDisplayName(role)}
                  </span>
                ))}
              </div>
              <p className={`mt-4 max-w-2xl ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                {user.bio || "No bio added yet."}
              </p>
            </div>

            {/* Stats / Status */}
            <div className={`p-4 rounded-xl border ${isDark ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${user.emailVerified ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}`}>
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className={`text-xs font-medium uppercase tracking-wider ${isDark ? "text-slate-500" : "text-slate-500"}`}>Account Status</p>
                  <p className={`font-semibold ${user.emailVerified ? (isDark ? "text-white" : "text-slate-900") : "text-amber-500"}`}>
                    {user.emailVerified ? "Verified" : "Unverified"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className={`h-px my-8 ${isDark ? "bg-white/10" : "bg-slate-200"}`} />

          {/* Details Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Contact Information</h3>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className={`w-5 h-5 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                  <div>
                    <p className={`text-sm ${isDark ? "text-slate-500" : "text-slate-500"}`}>Email Address</p>
                    <p className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className={`w-5 h-5 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                  <div>
                    <p className={`text-sm ${isDark ? "text-slate-500" : "text-slate-500"}`}>Phone Number</p>
                    <p className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{user.phoneNumber || "Not provided"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className={`w-5 h-5 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                  <div>
                    <p className={`text-sm ${isDark ? "text-slate-500" : "text-slate-500"}`}>Location</p>
                    <p className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{user.city || user.address || "Not provided"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Account Details</h3>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className={`w-5 h-5 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                  <div>
                    <p className={`text-sm ${isDark ? "text-slate-500" : "text-slate-500"}`}>Member Since</p>
                    <p className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                      {user.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy') : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
