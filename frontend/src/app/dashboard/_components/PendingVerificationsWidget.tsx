"use client"

import { User } from "@/types/auth"
import { Check, Shield, X } from "lucide-react"

interface PendingVerificationsWidgetProps {
 users: User[]
 isDark: boolean
}

export function PendingVerificationsWidget({ users, isDark }: PendingVerificationsWidgetProps) {
 if (!users || users.length === 0) return null

 return (
  <div
   className={`rounded-3xl border p-6 h-full ${isDark
    ? "bg-dark-900 border-dark-700"
    : "bg-white border-slate-100"
    }`}
  >
   <div className="mb-6 flex items-center justify-between">
    <div className="flex items-center gap-3">
     <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
      <Shield className="h-5 w-5" />
     </div>
     <div>
      <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
       Pending Verifications
      </h3>
      <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
       {users.length} users awaiting review
      </p>
     </div>
    </div>
   </div>

   <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
    {users.map((user) => (
     <div
      key={user.id}
      className={`flex items-center justify-between rounded-2xl p-4 transition-all ${isDark
       ? "bg-dark-800 hover:bg-dark-700"
       : "bg-slate-50 hover:bg-slate-100"
       }`}
     >
      <div className="flex items-center gap-3">
       <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-200">
        {user.profilePictureUrl ? (
         <img src={user.profilePictureUrl || ""} alt={user.firstName || "User"} className="h-full w-full object-cover" />
        ) : (
         <div className="flex h-full w-full items-center justify-center text-slate-400">
          <span className="text-sm font-bold">{user.firstName?.charAt(0)}</span>
         </div>
        )}
       </div>
       <div>
        <h4 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
         {user.fullName || `${user.firstName} ${user.lastName}`}
        </h4>
        <p className="text-xs text-slate-500">{user.email}</p>
       </div>
      </div>

      <div className="flex gap-2">
       <button
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${isDark
         ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
         : "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
         }`}
        title="Verify User"
       >
        <Check className="h-4 w-4" />
       </button>
       <button
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${isDark
         ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
         : "bg-red-100 text-red-600 hover:bg-red-200"
         }`}
        title="Reject"
       >
        <X className="h-4 w-4" />
       </button>
      </div>
     </div>
    ))}
   </div>
  </div>
 )
}
