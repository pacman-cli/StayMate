"use client"

import { AlertTriangle, Clock, X } from "lucide-react"
import { useState } from "react"

interface DeletionWarningModalProps {
 isOpen: boolean
 onClose: () => void
 onConfirm: (reason: string) => void
 userName: string
}

export function DeletionWarningModal({
 isOpen,
 onClose,
 onConfirm,
 userName,
}: DeletionWarningModalProps) {
 const [reason, setReason] = useState("Violation of Terms of Service")
 const [isConfirmed, setIsConfirmed] = useState(false)

 if (!isOpen) return null

 return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
   <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
    {/* Header */}
    <div className="p-6 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-900/30 flex items-start gap-4">
     <div className="p-3 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-500 rounded-full shrink-0">
      <AlertTriangle className="w-6 h-6" />
     </div>
     <div className="space-y-1">
      <h3 className="text-lg font-bold text-amber-900 dark:text-amber-400">
       Schedule Account Deletion
      </h3>
      <p className="text-sm text-amber-800/80 dark:text-amber-500/80">
       This action initiates a 72-hour grace period before permanent
       removal.
      </p>
     </div>
     <button
      onClick={onClose}
      className="ml-auto text-slate-400 hover:text-slate-500 dark:hover:text-slate-300"
     >
      <X className="w-5 h-5" />
     </button>
    </div>

    {/* Content */}
    <div className="p-6 space-y-6">
     <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
       You are observing deletion for user:
      </p>
      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-sm">
       {userName}
      </div>
     </div>

     <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
      <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
      <div className="text-sm text-slate-600 dark:text-slate-400">
       The user will initially be marked as{" "}
       <span className="font-semibold text-amber-600 dark:text-amber-500">
        PENDING_DELETION
       </span>
       . They will be locked out immediately, but data will remain for 3
       days to allow for appeals or cancellation.
      </div>
     </div>

     <div className="space-y-3">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
       Reason for deletion
      </label>
      <select
       value={reason}
       onChange={(e) => setReason(e.target.value)}
       className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
      >
       <option>Violation of Terms of Service</option>
       <option>Fraudulent Activity</option>
       <option>User Request</option>
       <option>Spam/Bot Account</option>
       <option>Other</option>
      </select>
     </div>

     <label className="flex items-start gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <input
       type="checkbox"
       checked={isConfirmed}
       onChange={(e) => setIsConfirmed(e.target.checked)}
       className="mt-1 w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
      />
      <span className="text-sm text-slate-600 dark:text-slate-400">
       I understand that after 72 hours, all data associated with this user
       will be permanently removed or anonymized.
      </span>
     </label>
    </div>

    {/* Footer */}
    <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50">
     <button
      onClick={onClose}
      className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
     >
      Cancel
     </button>
     <button
      disabled={!isConfirmed}
      onClick={() => onConfirm(reason)}
      className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-all ${isConfirmed
        ? "bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-500/20"
        : "bg-slate-300 dark:bg-slate-700 cursor-not-allowed"
       }`}
     >
      Schedule Deletion
     </button>
    </div>
   </div>
  </div>
 )
}
