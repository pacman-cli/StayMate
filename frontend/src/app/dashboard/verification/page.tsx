"use client"

import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api" // Assuming generic api client is available or we add verificationApi
import { AlertCircle, CheckCircle2, CloudUpload, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "react-hot-toast"

export default function VerificationPage() {
 const { user, refreshUser } = useAuth()
 const [file, setFile] = useState<File | null>(null)
 const [uploading, setUploading] = useState(false)
 const [status, setStatus] = useState<'IDLE' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('IDLE')

 // Derived from user state in real app
 const isVerified = user?.emailVerified && user?.phoneVerified // Simplified for now

 const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files[0]) {
   setFile(e.target.files[0])
  }
 }

 const handleUpload = async () => {
  if (!file) return

  setUploading(true)
  const formData = new FormData()
  formData.append("file", file)
  formData.append("documentType", "GOVERNMENT_ID")

  try {
   // Check if verificationApi exists, otherwise assume endpoint
   await api.post("/api/verification/upload", formData, {
    headers: {
     "Content-Type": "multipart/form-data",
    },
   })
   toast.success("Document uploaded successfully. Pending approval.")
   setStatus('PENDING')
  } catch (error) {
   console.error("Upload failed", error)
   toast.error("Failed to upload document")
  } finally {
   setUploading(false)
  }
 }

 return (
  <div className="p-6 md:p-8 space-y-6 max-w-3xl mx-auto">
   <div>
    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Identity Verification</h1>
    <p className="text-slate-500 dark:text-slate-400">Verify your identity to unlock all features</p>
   </div>

   <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
    <div className="p-6 md:p-8">
     {/* Status Sections */}
     <div className="flex items-center gap-4 mb-8 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isVerified ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
       }`}>
       {isVerified ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
      </div>
      <div>
       <h3 className="font-semibold text-slate-900 dark:text-white">
        {isVerified ? "You are verified!" : "Verification Required"}
       </h3>
       <p className="text-sm text-slate-500 dark:text-slate-400">
        {isVerified
         ? "Your identity has been confirmed. You have full access."
         : "Please upload a valid government ID (Passport, Driver's License) to verify your account."}
       </p>
      </div>
     </div>

     {!isVerified && (
      <div className="space-y-6">
       <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-center cursor-pointer relative">
        <input
         type="file"
         className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
         onChange={handleFileChange}
         accept="image/*,.pdf"
        />
        <div className="flex flex-col items-center">
         <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mb-4 text-blue-500">
          <CloudUpload className="w-8 h-8" />
         </div>
         <h4 className="font-medium text-slate-900 dark:text-white mb-1">
          {file ? file.name : "Click to upload document"}
         </h4>
         <p className="text-sm text-slate-500">
          PNG, JPG or PDF (max. 5MB)
         </p>
        </div>
       </div>

       <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
       >
        {uploading && <Loader2 className="w-5 h-5 animate-spin" />}
        {uploading ? "Uploading..." : "Submit for Verification"}
       </button>
      </div>
     )}
    </div>
   </div>
  </div>
 )
}
