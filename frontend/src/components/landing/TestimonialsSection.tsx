"use client"

import { useTheme } from "@/context/ThemeContext"
import { testimonials } from "@/lib/landingData"
import { motion } from "framer-motion"
import { BadgeCheck, Quote, Star } from "lucide-react"

export default function TestimonialsSection() {
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
     viewport={{ once: true }}
     transition={{ duration: 0.6 }}
     className="text-center max-w-3xl mx-auto mb-16"
    >
     <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2 }}
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold mb-8 ${isDark
       ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
       : "bg-yellow-50 text-yellow-600 border border-yellow-100"
       }`}
     >
      <Star className="w-4 h-4" />
      Testimonials
     </motion.span>
     <h2
      className={`text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight ${isDark ? "text-white" : "text-slate-900"
       }`}
     >
      Loved by
      <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent"> Thousands</span>
     </h2>
    </motion.div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
     {testimonials.map((testimonial, idx) => (
      <motion.div
       key={idx}
       initial={{ opacity: 0, y: 30 }}
       whileInView={{ opacity: 1, y: 0 }}
       viewport={{ once: true, margin: "-100px" }}
       transition={{ delay: idx * 0.1, duration: 0.5 }}
       whileHover={{ y: -8 }}
       className={`relative p-8 rounded-3xl transition-all duration-300 h-full flex flex-col ${isDark
        ? "bg-white/5 border border-white/10 hover:bg-white/10"
        : "bg-white border border-slate-200 shadow-xl hover:shadow-2xl"
        }`}
      >
       <Quote
        className={`absolute top-8 right-8 w-10 h-10 opacity-20 ${isDark ? "text-white" : "text-slate-900"
         }`}
       />

       <div className="flex items-center gap-1 mb-6">
        {[...Array(5)].map((_, i) => (
         <Star
          key={i}
          className={`w-5 h-5 fill-current ${i < testimonial.rating
           ? "text-yellow-400"
           : isDark
            ? "text-slate-700"
            : "text-slate-200"
           }`}
         />
        ))}
       </div>

       <p
        className={`text-lg leading-relaxed mb-8 flex-grow italic ${isDark ? "text-slate-300" : "text-slate-600"
         }`}
       >
        "{testimonial.quote}"
       </p>

       <div className="flex items-center gap-4 mt-auto">
        <div
         className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${isDark
          ? "bg-primary-500/20 text-primary-400"
          : "bg-primary-100 text-primary-600"
          }`}
        >
         {testimonial.avatar}
        </div>
        <div>
         <div className="flex items-center gap-2">
          <h4
           className={`font-bold ${isDark ? "text-white" : "text-slate-900"
            }`}
          >
           {testimonial.author}
          </h4>
          {testimonial.verified && (
           <BadgeCheck
            className={`w-4 h-4 ${isDark
             ? "text-primary-400"
             : "text-primary-600"
             }`}
           />
          )}
         </div>
         <div
          className={`text-sm ${isDark ? "text-slate-500" : "text-slate-500"
           }`}
         >
          {testimonial.role} • {testimonial.location}
         </div>
        </div>
       </div>
      </motion.div>
     ))}
    </div>
   </div>
  </section>
 )
}
