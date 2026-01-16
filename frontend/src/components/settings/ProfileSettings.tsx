"use client"

import { useAuth } from "@/context/AuthContext"
import { userApi } from "@/lib/api"
import { Loader2, Save } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

export default function ProfileSettings() {
  const { user, refreshUser } = useAuth()
  const [loading, setLoading] = useState(false)

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    city: "",
    address: "",
    bio: "",
    phoneNumber: ""
  })

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        city: user.city || "",
        address: user.address || "",
        bio: user.bio || "",
        phoneNumber: user.phoneNumber || ""
      })
    }
  }, [user])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await userApi.updateProfile(profileData)
      toast.success("Profile updated successfully")
      if (refreshUser) {
        await refreshUser()
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to update profile"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleProfileUpdate} className="space-y-6">
      <h2 className="text-xl font-bold dark:text-white mb-6">Profile Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-600"
            value={profileData.firstName}
            onChange={e => setProfileData({ ...profileData, firstName: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-600"
            value={profileData.lastName}
            onChange={e => setProfileData({ ...profileData, lastName: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">City</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-600"
            value={profileData.city}
            onChange={e => setProfileData({ ...profileData, city: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-600"
            value={profileData.address}
            onChange={e => setProfileData({ ...profileData, address: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-600"
            value={profileData.phoneNumber}
            onChange={e => setProfileData({ ...profileData, phoneNumber: e.target.value })}
          />
        </div>
        <div className="col-span-1 md:col-span-2 space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Bio</label>
          <textarea
            className="w-full px-4 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-600"
            rows={3}
            value={profileData.bio}
            onChange={e => setProfileData({ ...profileData, bio: e.target.value })}
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
        </button>
      </div>
    </form>
  )
}
