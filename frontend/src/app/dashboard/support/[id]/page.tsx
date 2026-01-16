"use client"

import { useAuth } from "@/context/AuthContext"
import { supportApi } from "@/lib/api"
import { ArrowLeft, Send, Shield, User } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { toast } from "react-hot-toast"

export default function SupportDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [ticket, setTicket] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [reply, setReply] = useState("")
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadTicket()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [ticket?.messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadTicket = async () => {
    try {
      const res = await supportApi.getTicket(Number(id))
      setTicket(res)
    } catch (error) {
      toast.error("Failed to load ticket")
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reply.trim()) return

    setSending(true)
    try {
      await supportApi.reply(Number(id), reply)
      setReply("")
      loadTicket() // Reload to see new message (and potentially status update)
    } catch (error) {
      toast.error("Failed to send reply")
    } finally {
      setSending(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  )

  if (!ticket) return <div className="p-8 text-center">Ticket not found</div>

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-5xl mx-auto p-4 md:p-6">
      <Link href="/dashboard/support" className="flex items-center gap-2 text-slate-500 hover:text-primary-600 mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Tickets
      </Link>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{ticket.subject}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${ticket.status === 'OPEN' ? 'bg-blue-100 text-blue-700' :
                ticket.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' :
                  ticket.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-slate-100 text-slate-700'
              }`}>
              {ticket.status}
            </span>
          </div>
          <div className="flex gap-4 text-sm text-slate-500">
            <span>Ticket #{ticket.id}</span>
            <span>Category: {ticket.category}</span>
            <span>Priority: {ticket.priority}</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {ticket.messages.map((msg: any) => {
            const isMe = msg.isAdminReply ? false : msg.senderId === user?.id
            // If admin is viewing, logic flips, but here creating User view first.
            // Actually, wait:
            // For USER: isMe = !msg.isAdminReply
            // For ADMIN: isMe = msg.isAdminReply
            // Let's rely on isAdminReply flag for styling mostly.

            const isSupport = msg.isAdminReply

            return (
              <div key={msg.id} className={`flex gap-4 ${isSupport ? '' : 'flex-row-reverse'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isSupport ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                  {isSupport ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>

                <div className={`max-w-[80%] space-y-1 ${isSupport ? 'items-start' : 'items-end flex flex-col'}`}>
                  <div className={`p-4 rounded-xl ${isSupport
                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-none'
                      : 'bg-primary-600 text-white rounded-tr-none'
                    }`}>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                  </div>
                  <span className="text-xs text-slate-400 px-1">
                    {isSupport ? 'Support Agent' : 'You'} • {new Date(msg.sentAt).toLocaleString()}
                  </span>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Area */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          {ticket.status === 'CLOSED' ? (
            <div className="text-center text-slate-500 py-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
              This ticket is closed. Please create a new ticket for further assistance.
            </div>
          ) : (
            <form onSubmit={handleReply} className="flex gap-3">
              <textarea
                value={reply}
                onChange={e => setReply(e.target.value)}
                placeholder="Type your reply..."
                className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 resize-none h-[60px]"
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleReply(e)
                  }
                }}
              />
              <button
                type="submit"
                disabled={sending || !reply.trim()}
                className="px-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all w-[60px]"
              >
                {sending ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Send className="w-5 h-5" />}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
