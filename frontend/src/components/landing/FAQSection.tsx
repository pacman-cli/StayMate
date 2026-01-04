"use client"

import { useTheme } from "@/context/ThemeContext"
import { faqs } from "@/lib/landingData"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, HelpCircle, Phone } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function FAQSection() {
 const { isDark } = useTheme()
 const [openFaq, setOpenFaq] = useState<number | null>(null)

 return (
  <section
   id="faq"
   className={`py-32 relative overflow-hidden ${isDark ? "bg-dark-900/30" : "bg-slate-50/50"}`}
  >
   {/* Background */}
   <div className="absolute inset-0 opacity-30">
    <div className={`absolute inset-0 ${isDark ? "bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05)_0%,transparent_70%)]" : "bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.02)_0%,transparent_70%)]"}`} />
   </div>

   <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
    <motion.div
     initial={{ opacity: 0, y: 30 }}
     whileInView={{ opacity: 1, y: 0 }}
     viewport={{ once: true, margin: "-100px" }}
     transition={{ duration: 0.6 }}
     className="text-center max-w-3xl mx-auto mb-16"
    >
     <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2 }}
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold mb-8 ${isDark
       ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
       : "bg-purple-50 text-purple-600 border border-purple-100"
       }`}
     >
      <HelpCircle className="w-4 h-4" />
      FAQ
     </motion.span>
     <h2
      className={`text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight ${isDark ? "text-white" : "text-slate-900"
       }`}
     >
      Frequently Asked
      <span className="bg-gradient-to-r from-purple-500 to-primary-600 bg-clip-text text-transparent"> Questions</span>
     </h2>
     <p
      className={`text-lg md:text-xl ${isDark ? "text-slate-300" : "text-slate-600"}`}
     >
      Everything you need to know about StayMate
     </p>
    </motion.div>

    <div className="max-w-4xl mx-auto">
     {faqs.map((faq, idx) => (
      <motion.div
       key={idx}
       initial={{ opacity: 0, y: 30 }}
       whileInView={{ opacity: 1, y: 0 }}
       viewport={{ once: true, margin: "-50px" }}
       transition={{ delay: idx * 0.05, duration: 0.4 }}
       className={`mb-4 rounded-2xl overflow-hidden transition-all duration-300 ${isDark
        ? "bg-white/5 border border-white/10 hover:bg-white/10"
        : "bg-white border border-slate-200 shadow-md hover:shadow-lg"
        }`}
      >
       <button
        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
        className={`w-full flex items-center justify-between p-6 text-left transition-all duration-300 ${isDark ? "hover:bg-white/5" : "hover:bg-slate-50"
         }`}
       >
        <span className={`text-lg font-semibold pr-4 ${isDark ? "text-white" : "text-slate-900"}`}>
         {faq.question}
        </span>
        <motion.div
         animate={{ rotate: openFaq === idx ? 180 : 0 }}
         transition={{ duration: 0.3 }}
         className={`flex-shrink-0 ${isDark ? "text-primary-400" : "text-primary-600"}`}
        >
         <ChevronDown className="w-6 h-6" />
        </motion.div>
       </button>
       <AnimatePresence>
        {openFaq === idx && (
         <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
         >
          <div className={`px-6 pb-6 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
           {faq.answer}
          </div>
         </motion.div>
        )}
       </AnimatePresence>
      </motion.div>
     ))}
    </div>

    {/* Contact CTA */}
    <motion.div
     initial={{ opacity: 0, y: 30 }}
     whileInView={{ opacity: 1, y: 0 }}
     viewport={{ once: true, margin: "-100px" }}
     transition={{ duration: 0.6 }}
     className={`mt-16 text-center p-10 rounded-3xl ${isDark
      ? "bg-gradient-to-r from-primary-500/10 to-purple-500/10 border border-white/10"
      : "bg-gradient-to-r from-primary-50 to-purple-50 border border-primary-100"
      }`}
    >
     <h3 className={`text-2xl sm:text-3xl font-bold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
      Still have questions?
     </h3>
     <p className={`mb-6 max-w-2xl mx-auto ${isDark ? "text-slate-300" : "text-slate-600"}`}>
      Can't find the answer you're looking for? Please contact our friendly team.
     </p>
     <Link
      href="/contact"
      className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${isDark
       ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700"
       : "bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800"
       }`}
     >
      <Phone className="w-5 h-5" />
      Get in Touch
     </Link>
    </motion.div>
   </div>
  </section>
 )
}
