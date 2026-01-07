"use client"

import DashboardLayout from "@/components/DashboardLayout"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  FileText,
  Loader2,
  Mail,
  Smartphone,
  UploadCloud,
  User as UserIcon
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

// Types
type VerificationStatus = {
  emailVerified: boolean
  phoneVerified: boolean
  profileComplete: boolean
  documentStatus: 'NOT_UPLOADED' | 'PENDING' | 'APPROVED' | 'REJECTED'
  rejectionReason?: string
}

export default function VerificationPage() {
  const { user } = useAuth()
  const [status, setStatus] = useState<VerificationStatus | null>(null)
  const [loading, setLoading] = useState(true)

  // Phone Verification State
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)

  // Document Upload State
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const res = await api.get('/api/verification/status')
      setStatus(res.data)
    } catch (error) {
      console.error(error)
      toast.error("Failed to load verification status")
    } finally {
      setLoading(false)
    }
  }

  const handleSendOtp = async () => {
    if (!phoneNumber) return toast.error("Enter phone number")
    setSendingOtp(true)
    try {
      const res = await api.post('/api/verification/phone', { phoneNumber })
      toast.success("OTP Sent! (Use code: " + res.data.otp + ")")
      setShowOtpInput(true)
    } catch (error) {
      toast.error("Failed to send OTP")
    } finally {
      setSendingOtp(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp) return toast.error("Enter OTP")
    setVerifyingOtp(true)
    try {
      await api.post('/api/verification/phone/verify', { otp, phone: phoneNumber })
      toast.success("Phone Verified!")
      fetchStatus() // Refresh status
      setShowOtpInput(false)
    } catch (error) {
      toast.error("Invalid OTP")
    } finally {
      setVerifyingOtp(false)
    }
  }

  const handleFileUpload = async () => {
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("documentType", "GOVERNMENT_ID")

    try {
      await api.post("/api/verification/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      toast.success("Document uploaded successfully")
      fetchStatus()
    } catch (error) {
      toast.error("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>

  return (
    <ProtectedRoute>
      <DashboardLayout title="Verification" description="Complete these steps to verify your account">
        <div className="max-w-3xl mx-auto space-y-8">

          {/* Step 1: Email */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-4">
            <div className={`mt-1 p-2 rounded-full ${status?.emailVerified ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
              {status?.emailVerified ? <CheckCircle2 className="w-6 h-6" /> : <Mail className="w-6 h-6" />}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold dark:text-white">Email Verification</h3>
              <p className="text-slate-500 text-sm mt-1">
                {status?.emailVerified ? "Your email is verified." : "Please verify your email via the link sent to your inbox."}
              </p>
            </div>
          </div>

          {/* Step 2: Profile */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-4">
            <div className={`mt-1 p-2 rounded-full ${status?.profileComplete ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
              {status?.profileComplete ? <CheckCircle2 className="w-6 h-6" /> : <UserIcon className="w-6 h-6" />}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold dark:text-white">Profile Completion</h3>
              <p className="text-slate-500 text-sm mt-1 mb-4">
                {status?.profileComplete ? "Profile information is complete." : "Add your full name and city to complete your profile."}
              </p>
              {!status?.profileComplete && (
                <Link href="/settings" className="indigo-btn text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2">
                  Complete Profile <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>

          {/* Step 3: Phone */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-4">
            <div className={`mt-1 p-2 rounded-full ${status?.phoneVerified ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
              {status?.phoneVerified ? <CheckCircle2 className="w-6 h-6" /> : <Smartphone className="w-6 h-6" />}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold dark:text-white">Phone Verification</h3>
              <p className="text-slate-500 text-sm mt-1 mb-4">
                {status?.phoneVerified ? "Your phone number is verified." : "We need to verify your phone number for security."}
              </p>

              {!status?.phoneVerified && (
                <div className="max-w-sm space-y-3">
                  {!showOtpInput ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 px-4 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-600"
                        placeholder="Enter phone number"
                        value={phoneNumber}
                        onChange={e => setPhoneNumber(e.target.value)}
                      />
                      <button
                        onClick={handleSendOtp}
                        disabled={sendingOtp}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {sendingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send OTP"}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="flex-1 px-4 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-600"
                          placeholder="Enter 6-digit OTP"
                          value={otp}
                          onChange={e => setOtp(e.target.value)}
                        />
                        <button
                          onClick={handleVerifyOtp}
                          disabled={verifyingOtp}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          {verifyingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
                        </button>
                      </div>
                      <button onClick={() => setShowOtpInput(false)} className="text-sm text-slate-500 hover:underline">Change number</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Step 4: Identity Document */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-4">
            <div className={`mt-1 p-2 rounded-full ${status?.documentStatus === 'APPROVED' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
              {status?.documentStatus === 'APPROVED' ? <CheckCircle2 className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold dark:text-white">Identity Verification</h3>

              {status?.documentStatus === 'APPROVED' ? (
                <p className="text-slate-500 text-sm mt-1">Your identity has been verified.</p>
              ) : status?.documentStatus === 'PENDING' ? (
                <div className="mt-2 text-yellow-600 bg-yellow-50 p-3 rounded-lg text-sm inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Verification in progress. We'll notify you once reviewed.
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-slate-500 text-sm mt-1">
                    Upload a valid government ID (Passport, Driver's License) to unlock verified badges.
                  </p>

                  {status?.documentStatus === 'REJECTED' && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Rejected: {status.rejectionReason || "Common rejection reasons: Blurry image, expired ID."}
                    </div>
                  )}

                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-center cursor-pointer relative max-w-md">
                    <input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      accept="image/*,.pdf"
                    />
                    <div className="flex flex-col items-center">
                      <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {file ? file.name : "Click to upload document"}
                      </span>
                      <span className="text-xs text-slate-500 mt-1">Max 5MB (PDF, JPG, PNG)</span>
                    </div>
                  </div>

                  <button
                    onClick={handleFileUpload}
                    disabled={!file || uploading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                  >
                    {uploading ? "Uploading..." : "Submit Document"}
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
