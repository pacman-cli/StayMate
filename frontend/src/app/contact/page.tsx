"use client"

import Button from "@/components/Button"
import PublicPageLayout from "@/components/PublicPageLayout"
import { useTheme } from "@/context/ThemeContext"

export default function ContactPage() {
 const { isDark } = useTheme()

 return (
  <PublicPageLayout
   title="Contact Us"
   subtitle="Have questions or need support? We're here to help."
  >
   <form className="space-y-6 max-w-lg mx-auto">
    <div>
     <label className={`block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`} htmlFor="name">
      Name
     </label>
     <input
      type="text"
      id="name"
      className={`w-full px-4 py-3 rounded-xl border transition-colors focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none ${isDark
        ? "bg-white/5 border-white/10 text-white placeholder-slate-500"
        : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
       }`}
      placeholder="Your name"
     />
    </div>

    <div>
     <label className={`block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`} htmlFor="email">
      Email
     </label>
     <input
      type="email"
      id="email"
      className={`w-full px-4 py-3 rounded-xl border transition-colors focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none ${isDark
        ? "bg-white/5 border-white/10 text-white placeholder-slate-500"
        : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
       }`}
      placeholder="your@email.com"
     />
    </div>

    <div>
     <label className={`block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`} htmlFor="message">
      Message
     </label>
     <textarea
      id="message"
      rows={5}
      className={`w-full px-4 py-3 rounded-xl border transition-colors focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none ${isDark
        ? "bg-white/5 border-white/10 text-white placeholder-slate-500"
        : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
       }`}
      placeholder="How can we help?"
     />
    </div>

    <Button fullWidth size="lg">Send Message</Button>
   </form>
  </PublicPageLayout>
 )
}
