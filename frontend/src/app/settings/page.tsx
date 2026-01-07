"use client"

import DashboardLayout from "@/components/DashboardLayout"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/context/AuthContext"
import { userApi } from "@/lib/api"
import {
  AlertTriangle,
  Bell,
  Loader2,
  Lock,
  Save,
  Trash2,
  User
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

export default function SettingsPage() {
  const { user, login, refreshUser } = useAuth() // login is used to update user context if needed
  const [activeTab, setActiveTab] = useState("profile")
  const [loading, setLoading] = useState(false)

  // Profile State
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    city: "",
    address: "",
    bio: "",
    phoneNumber: ""
  })

  // Password State
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  // Notification State
  const [notifications, setNotifications] = useState({
    email: true,
    push: true
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
      // Fetch notification settings would go here if we exposed them in user dto,
      // assuming user context has them or we fetch them.
      // Since we just added columns, user context might not have them yet unless we refresh.
      // For now, default to true or what's in 'user' if available.
      if (user.emailNotifications !== undefined) setNotifications(prev => ({ ...prev, email: user.emailNotifications as boolean }))
      if (user.pushNotifications !== undefined) setNotifications(prev => ({ ...prev, push: user.pushNotifications as boolean }))
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
    } catch (error) {
      toast.error("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("New passwords do not match")
    }
    setLoading(true)
    try {
      await userApi.changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      })
      toast.success("Password changed successfully")
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" })
    } catch (error) {
      toast.error("Failed to change password (check old password)")
    } finally {
      setLoading(false)
    }
  }

  const toggleNotification = async (type: string, enabled: boolean) => {
    // Optimistic update
    setNotifications(prev => ({ ...prev, [type]: enabled }))
    try {
      await userApi.updateSettings({ type, enabled })
      toast.success(`${type === 'email' ? 'Email' : 'Push'} notifications ${enabled ? 'enabled' : 'disabled'}`)
    } catch (error) {
      setNotifications(prev => ({ ...prev, [type]: !enabled })) // Revert
      toast.error("Failed to update settings")
    }
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure? This action cannot be undone.")) return
    setLoading(true)
    try {
      await userApi.deleteAccount()
      toast.success("Account deleted")
      window.location.href = "/login"
    } catch (error) {
      toast.error("Failed to delete account")
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <DashboardLayout title="Settings" description="Manage your account preferences">
        <div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto">

          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 flex-shrink-0 space-y-2">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${activeTab === "profile" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-medium" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
            >
              <User className="w-5 h-5" /> Profile
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${activeTab === "security" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-medium" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
            >
              <Lock className="w-5 h-5" /> Security
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${activeTab === "notifications" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-medium" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
            >
              <Bell className="w-5 h-5" /> Notifications
            </button>
            <button
              onClick={() => setActiveTab("danger")}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${activeTab === "danger" ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 font-medium" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
            >
              <Trash2 className="w-5 h-5" /> Danger Zone
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 md:p-8">

            {/* Profile Tab */}
            {activeTab === "profile" && (
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
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <h2 className="text-xl font-bold dark:text-white mb-6">Security Settings</h2>

                <div className="max-w-md space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-600"
                      value={passwordData.oldPassword}
                      onChange={e => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-600"
                      value={passwordData.newPassword}
                      onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirm New Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-600"
                      value={passwordData.confirmPassword}
                      onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Change Password"}
                  </button>
                </div>
              </form>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold dark:text-white mb-6">Notification Preferences</h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <div>
                      <h4 className="font-semibold dark:text-white">Email Notifications</h4>
                      <p className="text-sm text-slate-500">Receive updates and alerts via email.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notifications.email}
                        onChange={(e) => toggleNotification('email', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <div>
                      <h4 className="font-semibold dark:text-white">Push Notifications</h4>
                      <p className="text-sm text-slate-500">Receive mobile push notifications.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notifications.push}
                        onChange={(e) => toggleNotification('push', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Danger Tab */}
            {activeTab === "danger" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-red-600 mb-6">Danger Zone</h2>

                <div className="p-4 border border-red-200 bg-red-50 dark:bg-red-900/10 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-red-700 dark:text-red-400">Delete Account</h3>
                      <p className="text-sm text-red-600/80 mt-1">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      <button
                        onClick={handleDeleteAccount}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                      >
                        Delete My Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
