"use client"

import { Settings as SettingsIcon } from "lucide-react"

export default function SettingsPage() {
 return (
  <div className="p-6 md:p-8 space-y-6">
   <div>
    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Account Settings</h1>
    <p className="text-slate-500 dark:text-slate-400">Manage your preferences and security</p>
   </div>

   <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
     <SettingsIcon className="w-8 h-8 text-slate-500 dark:text-slate-400" />
    </div>
    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Settings Portal</h3>
    <p className="text-slate-500 max-w-md mt-2">
     Global account settings (Password, Notifications, Privacy) are being migrated here.
    </p>
   </div>
  </div>
 )
}
