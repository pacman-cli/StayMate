"use client"

import { Shield } from "lucide-react"

export default function VerificationPage() {
 return (
  <div className="p-6 md:p-8 space-y-6">
   <div>
    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Identity Verification</h1>
    <p className="text-slate-500 dark:text-slate-400">Verify your identity to build trust</p>
   </div>

   <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
     <Shield className="w-8 h-8 text-blue-500" />
    </div>
    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Verification System Update</h3>
    <p className="text-slate-500 max-w-md mt-2">
     We are updating our verification providers. Please check back later to upload your documents.
    </p>
   </div>
  </div>
 )
}
