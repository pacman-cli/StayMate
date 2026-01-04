"use client"

import PublicPageLayout from "@/components/PublicPageLayout"
import { useTheme } from "@/context/ThemeContext"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

export default function FAQPage() {
 const { isDark } = useTheme()
 const [openIndex, setOpenIndex] = useState<number | null>(0)

 const faqs = [
  {
   question: "How do I verify my account?",
   answer: "Go to your Profile > Verification. Upload a valid Government ID (Passport, NID, or Driving License). For students, a Student ID is also required. Our team verifies documents within 24 hours."
  },
  {
   question: "Is StayMate free to use?",
   answer: "Yes! Searching for rooms and roommates is completely free. We optionally charge a small service fee only when you successfully book a confirmed stay through our platform."
  },
  {
   question: "How does the 'Roommate Finder' work?",
   answer: "You can post a 'Roommate Needed' ad or browse 'Explore Roommates'. We use a compatibility algorithm based on your habits (sleep schedule, smoking, pets, etc.) to suggest the best matches."
  },
  {
   question: "Is my payment information safe?",
   answer: "Absolutely. We use industry-standard encryption and partner with secure payment gateways. We do not store your credit card details on our servers."
  },
  {
   question: "Can I cancel a booking?",
   answer: "Cancellation policies are set by individual landlords. You can view the specific cancellation policy on the property details page before booking."
  },
  {
   question: "What if I face an issue with a landlord or tenant?",
   answer: "We have a 24/7 support team. You can report users directly from their profile or contact us via the Help & Support page for mediation."
  }
 ]

 return (
  <PublicPageLayout
   title="Frequently Asked Questions"
   subtitle="Everything you need to know about finding your perfect stay or roommate."
  >
   <div className="space-y-4">
    {faqs.map((faq, index) => (
     <div
      key={index}
      className={`rounded-xl border transition-all overflow-hidden ${isDark
        ? "bg-white/5 border-white/10"
        : "bg-white border-slate-200"
       }`}
     >
      <button
       onClick={() => setOpenIndex(openIndex === index ? null : index)}
       className="w-full px-6 py-4 flex items-center justify-between text-left"
      >
       <span className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
        {faq.question}
       </span>
       {openIndex === index ? (
        <ChevronUp className="w-5 h-5 text-slate-500" />
       ) : (
        <ChevronDown className="w-5 h-5 text-slate-500" />
       )}
      </button>

      {openIndex === index && (
       <div className={`px-6 pb-4 text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
        {faq.answer}
       </div>
      )}
     </div>
    ))}
   </div>
  </PublicPageLayout>
 )
}
