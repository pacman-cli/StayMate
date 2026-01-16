"use client"

import { userApi } from "@/lib/api"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "react-hot-toast"

export default function SecuritySettings() {
  const [loading, setLoading] = useState(false)
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

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

  return (
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
  )
}
