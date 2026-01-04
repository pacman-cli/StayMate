"use client"

import { useTheme } from "@/context/ThemeContext"
import { getColorClasses } from "@/lib/colorUtils"
import { userTypes } from "@/lib/landingData"
import { motion } from "framer-motion"
import { Check, Users } from "lucide-react"

export default function UserTypesSection() {
 const { isDark } = useTheme()

 return (
  <section
   className={`py-32 relative overflow-hidden ${isDark ? "bg-dark-900/30" : "bg-slate-50/50"
    }`}
  >
   <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
    <motion.div
     initial={{ opacity: 0, y: 30 }}
     whileInView={{ opacity: 1, y: 0 }}
     viewport={{ once: true, margin: "-100px" }}
     transition={{ duration: 0.6 }}
     className="text-center max-w-3xl mx-auto mb-20"
    >
     <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2 }}
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold mb-8 ${isDark
       ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
       : "bg-emerald-50 text-emerald-600 border border-emerald-100"
       }`}
     >
      <Users className="w-4 h-4" />
      Who We Serve
     </motion.span>
     <h2
      className={`text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight ${isDark ? "text-white" : "text-slate-900"
       }`}
     >
      Designed for
      <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent"> Everyone</span>
     </h2>
    </motion.div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
     {userTypes.map((type, idx) => {
      const colors = getColorClasses(type.color, isDark)
      return (
       <motion.div
        key={idx}
        initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ delay: idx * 0.1, duration: 0.6 }}
        className={`group p-8 sm:p-10 rounded-3xl transition-all duration-300 relative overflow-hidden ${isDark
         ? "bg-white/5 border border-white/10 hover:bg-white/10"
         : "bg-white border border-slate-200 shadow-xl hover:shadow-2xl"
         }`}
       >
        <div className={`inline-flex items-center justify-center p-4 rounded-2xl mb-6 ${colors.bg} ${colors.text}`}>
         {type.icon}
        </div>

        <h3 className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
         {type.title}
        </h3>
        <p className={`text-lg mb-8 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
         {type.description}
        </p>

        <ul className="space-y-3">
         {type.benefits.map((benefit, bIdx) => (
          <li key={bIdx} className="flex items-center gap-3">
           <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${isDark ? "bg-white/10" : "bg-slate-100"
            }`}>
            <Check className={`w-3.5 h-3.5 ${colors.text}`} />
           </div>
           <span className={`font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            {benefit}
           </span>
          </li>
         ))}
        </ul>
       </motion.div>
      )
     })}
    </div>
   </div>
  </section>
 )
}
