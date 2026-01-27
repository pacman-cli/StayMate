"use client"

import EmptyState from "@/components/common/EmptyState"
import { useTheme } from "@/context/ThemeContext"
import { inquiryApi } from "@/lib/api"
import { InquiryResponse } from "@/types/inquiry"
import { format } from "date-fns"
import { CheckCircle2, HelpCircle, MessageSquare, Send, User } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

export default function OwnerInquiriesPage() {
  const { isDark } = useTheme()
  const [inquiries, setInquiries] = useState<InquiryResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [replyingId, setReplyingId] = useState<number | null>(null)
  const [replyText, setReplyText] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchInquiries()
  }, [])

  const fetchInquiries = async () => {
    try {
      const data = await inquiryApi.getReceivedInquiries()
      setInquiries(data.content || [])
    } catch (error) {
      console.error("Failed to fetch inquiries", error)
      toast.error("Failed to load inquiries")
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async (id: number) => {
    if (!replyText.trim()) return

    setSubmitting(true)
    try {
      const updatedInquiry = await inquiryApi.replyToInquiry(id, replyText)
      setInquiries(prev => prev.map(inq => inq.id === id ? updatedInquiry : inq))
      toast.success("Reply sent successfully")
      setReplyingId(null)
      setReplyText("")
    } catch (error) {
      toast.error("Failed to send reply")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            Property Inquiries
          </h1>
          <p className={`mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Questions from potential tenants about your listings.
          </p>
        </div>
        <Link
          href="/dashboard/support"
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${isDark
            ? "border-dark-700 text-gray-400 hover:text-white hover:bg-dark-800"
            : "border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
        >
          <HelpCircle className="w-3 h-3" />
          Platform Support
        </Link>
      </div>

      {inquiries.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No inquiries yet"
          description="Questions about your properties will appear here. This is separate from platform support tickets."
        />
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className={`rounded-2xl border overflow-hidden transition-all ${isDark ? "bg-dark-800 border-dark-700" : "bg-white border-gray-200 shadow-sm"
                }`}
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Sender & Property Context */}
                  <div className="md:w-64 flex-shrink-0 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ${isDark ? "bg-dark-700" : "bg-gray-100"
                        }`}>
                        {inquiry.senderProfilePictureUrl ? (
                          <img src={inquiry.senderProfilePictureUrl} alt="" className="w-full h-full object-cover" />
                        ) : <User className="w-5 h-5 text-gray-400" />}
                      </div>
                      <div>
                        <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                          {inquiry.senderName}
                        </p>
                        <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                          {format(new Date(inquiry.createdAt), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>

                    <div className={`p-3 rounded-xl text-sm ${isDark ? "bg-dark-900/50" : "bg-gray-50"}`}>
                      <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Regarding</span>
                      <p className={`font-medium mt-1 ${isDark ? "text-gray-200" : "text-gray-900"}`}>
                        {inquiry.propertyTitle}
                      </p>
                    </div>
                  </div>

                  {/* Conversation */}
                  <div className="flex-1 space-y-4">
                    {/* User Question */}
                    <div className="flex gap-3">
                      <div className={`flex-shrink-0 mt-1 w-8 h-8 rounded-full flex items-center justify-center ${isDark ? "bg-primary-900/20 text-primary-400" : "bg-primary-100 text-primary-600"
                        }`}>
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                          {inquiry.message}
                        </p>
                      </div>
                    </div>

                    {/* Owner Reply */}
                    {inquiry.status === "REPLIED" && inquiry.reply ? (
                      <div className={`ml-8 p-4 rounded-xl border border-l-4 border-l-emerald-500 ${isDark
                        ? "bg-emerald-500/5 border-emerald-500/20 border-y-0 border-r-0"
                        : "bg-emerald-50 border-emerald-200 border-y-0 border-r-0"
                        }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className={`w-4 h-4 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
                          <span className={`text-xs font-bold uppercase ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>
                            Replied
                          </span>
                        </div>
                        <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                          {inquiry.reply}
                        </p>
                      </div>
                    ) : (
                      <div className="ml-11 mt-2">
                        {replyingId === inquiry.id ? (
                          <div className="space-y-3 animation-fade-in">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Write your response here..."
                              className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-primary-500 outline-none transition-all ${isDark
                                ? "bg-dark-900 border-dark-600 text-white placeholder-gray-500"
                                : "bg-white border-gray-200 text-gray-900"
                                }`}
                              rows={3}
                              autoFocus
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => {
                                  setReplyingId(null)
                                  setReplyText("")
                                }}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
                                  }`}
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleReply(inquiry.id)}
                                disabled={!replyText.trim() || submitting}
                                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {submitting ? "Sending..." : "Send Reply"}
                                <Send className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setReplyingId(inquiry.id)
                              setReplyText("")
                            }}
                            className={`text-sm font-medium transition-colors ${isDark ? "text-primary-400 hover:text-primary-300" : "text-primary-600 hover:text-primary-700"
                              }`}
                          >
                            Reply to Inquiry
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
