"use client"

import { AlertTriangle, Clock } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

interface DeletionCountdownProps {
 scheduledAt: string // ISO string
}

export default function DeletionCountdown({ scheduledAt }: DeletionCountdownProps) {
 const [timeLeft, setTimeLeft] = useState<string>("")

 // Calculate remaining time
 const calculateTimeLeft = () => {
  const now = new Date()
  const target = new Date(scheduledAt)
  const diff = target.getTime() - now.getTime()

  if (diff <= 0) return "Pending deletion..."

  // Simple countdown formatting
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  return `${days}d ${hours}h ${minutes}m`
 }

 useEffect(() => {
  // Initial toast
  toast.error(
   "Account scheduled for deletion! Please contact admin to cancel.",
   {
    duration: 6000,
    icon: "⚠️",
    style: {
     border: '1px solid #ef4444',
     padding: '16px',
     color: '#713200',
    },
   }
  )

  const timer = setInterval(() => {
   setTimeLeft(calculateTimeLeft())
  }, 60000) // Update every minute

  setTimeLeft(calculateTimeLeft()) // Initial call

  return () => clearInterval(timer)
 }, [scheduledAt])

 return (
  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 flex items-center justify-between animate-in fade-in slide-in-from-top-4">
   <div className="flex items-center gap-3">
    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
     <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
    </div>
    <div>
     <h3 className="font-bold text-red-700 dark:text-red-400">Account Scheduled for Deletion</h3>
     <p className="text-sm text-red-600/80 dark:text-red-400/80">
      Your account will be permanently deleted in <span className="font-mono font-bold">{timeLeft}</span>.
     </p>
    </div>
   </div>
   <div className="hidden sm:block">
    <Clock className="w-8 h-8 text-red-200 dark:text-red-900/50" />
   </div>
  </div>
 )
}
