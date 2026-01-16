"use client"

import AuthGuard from "@/components/auth/AuthGuard"
import DashboardLayout from "@/components/DashboardLayout"
import { Bell, Loader2, Lock, Trash2, User } from "lucide-react"
import dynamic from "next/dynamic"
import { useState } from "react"

// Dynamic imports for better compilation performance
const ProfileSettings = dynamic(() => import("@/components/settings/ProfileSettings"), {
  loading: () => <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
})
const SecuritySettings = dynamic(() => import("@/components/settings/SecuritySettings"), {
  loading: () => <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
})
const NotificationSettings = dynamic(() => import("@/components/settings/NotificationSettings"), {
  loading: () => <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
})
const DangerSettings = dynamic(() => import("@/components/settings/DangerSettings"), {
  loading: () => <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
})

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")

  return (
    <AuthGuard>
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
            {activeTab === "profile" && <ProfileSettings />}
            {activeTab === "security" && <SecuritySettings />}
            {activeTab === "notifications" && <NotificationSettings />}
            {activeTab === "danger" && <DangerSettings />}
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}

