import { useTheme } from "@/context/ThemeContext"
import { inquiryApi } from "@/lib/api"
import { AnimatePresence, motion } from "framer-motion"
import { Send, X } from "lucide-react"
import { useState } from "react"
import { toast } from "react-hot-toast"

interface AskQuestionModalProps {
  isOpen: boolean
  onClose: () => void
  propertyId: number
  propertyTitle: string
}

export default function AskQuestionModal({
  isOpen,
  onClose,
  propertyId,
  propertyTitle,
}: AskQuestionModalProps) {
  const { isDark } = useTheme()
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setSending(true)
    try {
      await inquiryApi.createInquiry(propertyId, message)
      toast.success("Inquiry sent successfully!")
      setMessage("")
      onClose()
    } catch (error) {
      toast.error("Failed to send inquiry.")
    } finally {
      setSending(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`relative w-full max-w-lg rounded-2xl shadow-xl overflow-hidden ${isDark ? "bg-dark-900 border border-dark-700" : "bg-white"
            }`}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-dark-700">
            <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              Ask about {propertyTitle}
            </h3>
            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-colors ${isDark ? "hover:bg-dark-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"
                }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-4 bg-primary-50 dark:bg-primary-900/10 p-3 rounded-lg border border-primary-100 dark:border-primary-900/20">
              <p className="text-xs text-primary-700 dark:text-primary-300">
                Use this form for questions about the property (e.g., availability, rules).
                For platform issues or billing, please contact <a href="/dashboard/support" className="underline font-semibold">Help & Support</a>.
              </p>
            </div>

            <div className="mb-6">
              <label
                className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"
                  }`}
              >
                Your Question
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="I'm interested in this property. Is it still available?"
                rows={5}
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary-500 transition-all resize-none ${isDark
                  ? "bg-dark-800 border-dark-700 text-white placeholder-gray-500 focus:border-transparent"
                  : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-transparent"
                  }`}
                required
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className={`px-5 py-2.5 rounded-xl font-medium transition-colors ${isDark
                  ? "bg-dark-800 text-gray-300 hover:bg-dark-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sending || !message.trim()}
                className="px-5 py-2.5 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 focus:ring-4 focus:ring-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {sending ? "Sending..." : "Send Inquiry"}
                {!sending && <Send className="w-4 h-4" />}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
