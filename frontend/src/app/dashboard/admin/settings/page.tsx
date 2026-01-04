"use client"

import DashboardLayout from "@/components/DashboardLayout"
import { adminApi } from "@/lib/api"
import { Save, Settings, ToggleRight, Type } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

export default function AdminSettingsPage() {
 const [settings, setSettings] = useState<Record<string, string>>({})
 const [loading, setLoading] = useState(true)
 const [saving, setSaving] = useState(false)

 useEffect(() => {
  loadSettings()
 }, [])

 const loadSettings = async () => {
  try {
   const data = await adminApi.getSettings()
   setSettings(data || {
    "siteName": "StayMate",
    "supportEmail": "support@staymate.com",
    "maintenanceMode": "false",
    "registrationEnabled": "true"
   })
  } catch (error) {
   toast.error("Failed to load settings")
   // Fallback defaults
   setSettings({
    "siteName": "StayMate",
    "supportEmail": "support@staymate.com",
    "maintenanceMode": "false",
    "registrationEnabled": "true"
   })
  } finally {
   setLoading(false)
  }
 }

 const handleChange = (key: string, value: string) => {
  setSettings(prev => ({
   ...prev,
   [key]: value
  }))
 }

 const handleSave = async (e: React.FormEvent) => {
  e.preventDefault()
  setSaving(true)
  try {
   await adminApi.updateSettings(settings)
   toast.success("Settings saved successfully")
  } catch (error) {
   toast.error("Failed to save settings")
  } finally {
   setSaving(false)
  }
 }

 return (
  <DashboardLayout>
   <div className="p-6 max-w-4xl mx-auto">
    <div className="mb-8">
     <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
      <Settings className="w-8 h-8 text-primary-600" />
      System Settings
     </h1>
     <p className="text-slate-500 text-sm">Configure global application settings.</p>
    </div>

    {loading ? (
     <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
     </div>
    ) : (
     <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <form onSubmit={handleSave} className="p-6 space-y-8">

       {/* General Settings */}
       <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-700">
         <Type className="w-5 h-5 text-slate-400" /> General Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
           Site Name
          </label>
          <input
           type="text"
           value={settings.siteName || ''}
           onChange={(e) => handleChange("siteName", e.target.value)}
           className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition"
          />
         </div>
         <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
           Support Email
          </label>
          <input
           type="email"
           value={settings.supportEmail || ''}
           onChange={(e) => handleChange("supportEmail", e.target.value)}
           className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition"
          />
         </div>
        </div>
       </div>

       {/* Feature Toggles */}
       <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-700">
         <ToggleRight className="w-5 h-5 text-slate-400" /> Features & System Status
        </h3>
        <div className="space-y-4">
         <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
          <div>
           <h4 className="font-medium text-slate-900 dark:text-white">Maintenance Mode</h4>
           <p className="text-xs text-slate-500">Enable to block user access for maintenance.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
           <input
            type="checkbox"
            className="sr-only peer"
            checked={settings.maintenanceMode === 'true'}
            onChange={(e) => handleChange("maintenanceMode", String(e.target.checked))}
           />
           <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
          </label>
         </div>

         <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
          <div>
           <h4 className="font-medium text-slate-900 dark:text-white">New User Registration</h4>
           <p className="text-xs text-slate-500">Allow new users to sign up.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
           <input
            type="checkbox"
            className="sr-only peer"
            checked={settings.registrationEnabled !== 'false'}
            onChange={(e) => handleChange("registrationEnabled", String(e.target.checked))}
           />
           <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
          </label>
         </div>
        </div>
       </div>

       {/* Submit */}
       <div className="pt-4 flex justify-end">
        <button
         type="submit"
         disabled={saving}
         className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium flex items-center gap-2 shadow-lg shadow-primary-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
        >
         {saving ? (
          <>
           <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
           Saving...
          </>
         ) : (
          <>
           <Save className="w-4 h-4" />
           Save Changes
          </>
         )}
        </button>
       </div>
      </form>
     </div>
    )}
   </div>
  </DashboardLayout>
 )
}
