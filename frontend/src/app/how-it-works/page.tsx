"use client"

import PublicPageLayout from "@/components/PublicPageLayout"
import { useTheme } from "@/context/ThemeContext"
import { CheckCircle2, MessageSquare, Search, UserCheck } from "lucide-react"

export default function HowItWorksPage() {
 const { isDark } = useTheme()

 const steps = [
  {
   icon: Search,
   title: "1. Search for Stays or Roommates",
   description: "Use our advanced filters to find properties near your university or office. Or browse roommate profiles to find your perfect match."
  },
  {
   icon: UserCheck,
   title: "2. Connect & Verify",
   description: "View verified profiles. Chat with landlords or potential roommates directly through our secure messaging system."
  },
  {
   icon: MessageSquare,
   title: "3. Schedule a Visit",
   description: "Request a property tour or a casual meet-up with roommates to ensure it's the right fit before you commit."
  },
  {
   icon: CheckCircle2,
   title: "4. Book Securely",
   description: "Finalize your booking online. Receive a digital agreement and move-in instructions instantly."
  }
 ]

 return (
  <PublicPageLayout
   title="How StayMate Works"
   subtitle="Your journey to a better living experience in 4 simple steps."
  >
   <div className="space-y-8 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-12 md:gap-y-8 relative">
    {/* Connecting Line (Desktop) */}
    <div className={`hidden md:block absolute left-1/2 top-4 bottom-4 w-px -ml-px border-l-2 border-dashed ${isDark ? "border-white/10" : "border-slate-200"
     }`} />

    {steps.map((step, idx) => (
     <div
      key={idx}
      className={`relative flex flex-col gap-4 p-6 rounded-2xl border ${isDark
        ? "bg-white/5 border-white/10"
        : "bg-white border-slate-200"
       }`}
     >
      {/* Step Number Badge */}
      <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md ${isDark ? "bg-primary-500 text-white" : "bg-primary-600 text-white"
       }`}>
       {idx + 1}
      </div>

      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? "bg-primary-500/20 text-primary-400" : "bg-primary-100 text-primary-600"
       }`}>
       <step.icon className="w-6 h-6" />
      </div>

      <div>
       <h3 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
        {step.title}
       </h3>
       <p className={`text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
        {step.description}
       </p>
      </div>
     </div>
    ))}
   </div>
  </PublicPageLayout>
 )
}
