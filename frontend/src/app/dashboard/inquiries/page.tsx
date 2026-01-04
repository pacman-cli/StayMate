"use client"

import { applicationApi } from "@/lib/api"
import { ApplicationResponse, ApplicationStatus } from "@/types/auth"
import { format } from "date-fns"
import { CheckCircle2, Clock, Mail, MessageSquare, User, XCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

export default function InquiriesPage() {
 const [inquiries, setInquiries] = useState<ApplicationResponse[]>([])
 const [loading, setLoading] = useState(true)

 const fetchInquiries = async () => {
  try {
   const data = await applicationApi.getReceivedApplications()
   // @ts-ignore - Handle Spring Page response
   setInquiries(data.content || data)
  } catch (error) {
   console.error("Failed to fetch inquiries", error)
  } finally {
   setLoading(false)
  }
 }

 useEffect(() => {
  fetchInquiries()
 }, [])

 const handleStatusUpdate = async (id: number, status: ApplicationStatus) => {
  try {
   // @ts-ignore - Check api method signature in api.ts, might need string
   await applicationApi.updateStatus(id, status)
   toast.success(`Application ${status.toLowerCase()} successfully`)
   fetchInquiries()
  } catch (error) {
   toast.error("Failed to update status")
  }
 }

 if (loading) return <div className="p-8"><div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" /></div>

 return (
  <div className="p-6 md:p-8 space-y-6">
   <div>
    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Property Inquiries</h1>
    <p className="text-slate-500 dark:text-slate-400">Review applications from potential tenants</p>
   </div>

   <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
    {inquiries.length === 0 ? (
     <div className="p-12 text-center text-slate-500">
      <Mail className="w-12 h-12 mx-auto mb-3 opacity-20" />
      <p>No inquiries received yet.</p>
     </div>
    ) : (
     <div className="divide-y divide-slate-100 dark:divide-slate-700">
      {inquiries.map((inquiry) => (
       <div key={inquiry.id} className="p-6 flex flex-col md:flex-row gap-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
        {/* Sender Info */}
        <div className="flex-shrink-0 flex items-start gap-4 md:w-64">
         <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
          {inquiry.senderProfilePicture ? (
           <img src={inquiry.senderProfilePicture} alt="" className="w-full h-full object-cover" />
          ) : (
           <User className="w-6 h-6 text-slate-400" />
          )}
         </div>
         <div>
          <p className="font-semibold text-slate-900 dark:text-white">{inquiry.senderName}</p>
          <p className="text-sm text-slate-500">{inquiry.senderEmail}</p>
          <p className="text-xs text-slate-400 mt-1">{format(new Date(inquiry.createdAt), 'MMM dd, yyyy')}</p>
         </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3">
         <div>
          <span className="text-sm text-slate-500">Applying for: </span>
          <span className="font-medium text-slate-900 dark:text-white">{inquiry.propertyTitle}</span>
         </div>
         <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg text-sm text-slate-600 dark:text-slate-300 relative">
          <MessageSquare className="w-4 h-4 text-slate-400 absolute top-4 left-4" />
          <p className="pl-6">{inquiry.message}</p>
         </div>
        </div>

        {/* Actions */}
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-4 min-w-[140px]">
         <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
                                        ${inquiry.status === 'APPROVED' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
           inquiry.status === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
            'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
          }`}
         >
          {inquiry.status === 'PENDING' && <Clock className="w-3 h-3" />}
          {inquiry.status}
         </span>

         {inquiry.status === 'PENDING' && (
          <div className="flex items-center gap-2">
           <button
            onClick={() => handleStatusUpdate(inquiry.id, 'APPROVED')}
            className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition flex items-center gap-2 shadow-sm"
           >
            <CheckCircle2 className="w-4 h-4" /> Accept
           </button>
           <button
            onClick={() => handleStatusUpdate(inquiry.id, 'REJECTED')}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
            title="Reject"
           >
            <XCircle className="w-5 h-5" />
           </button>
          </div>
         )}
        </div>
       </div>
      ))}
     </div>
    )}
   </div>
  </div>
 )
}
