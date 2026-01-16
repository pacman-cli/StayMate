"use client"

import { useAuth } from "@/context/AuthContext"
import { userApi } from "@/lib/api"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

export default function NotificationSettings() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState({
    email: true,
    push: true
  })

  useEffect(() => {
    if (user) {
      if (user.emailNotifications !== undefined) setNotifications(prev => ({ ...prev, email: user.emailNotifications as boolean }))
      if (user.pushNotifications !== undefined) setNotifications(prev => ({ ...prev, push: user.pushNotifications as boolean }))
    }
  }, [user])

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

  return (
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
  )
}
