"use client"

import { userApi } from "@/lib/api"
import { AlertTriangle } from "lucide-react"
import { useState } from "react"
import { toast } from "react-hot-toast"

export default function DangerSettings() {
  const [loading, setLoading] = useState(false)

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
              disabled={loading}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-50"
            >
              {loading ? "Deleting..." : "Delete My Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
