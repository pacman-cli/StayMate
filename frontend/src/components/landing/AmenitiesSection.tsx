"use client"

import { useTheme } from "@/context/ThemeContext"
import { amenities } from "@/lib/landingData"
import { motion } from "framer-motion"
import { Wifi } from "lucide-react"

export default function AmenitiesSection() {
  const { isDark } = useTheme()

  return (
    <section className={`py-32 relative overflow-hidden ${isDark ? "bg-dark-950" : "bg-white"}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold mb-8 ${isDark
              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
              : "bg-cyan-50 text-cyan-600 border border-cyan-100"
              }`}
          >
            <Wifi className="w-4 h-4" />
            Amenities
          </motion.span>
          <h2 className={`text-3xl sm:text-4xl font-bold mb-6 ${isDark ? "text-white" : "text-slate-900"}`}>
            Filter by What Matters
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          {amenities.map((amenity, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all duration-300 ${isDark
                ? "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300 hover:text-white"
                : "bg-white border-slate-200 hover:border-primary-200 text-slate-600 hover:text-primary-600 shadow-sm hover:shadow-md"
                }`}
            >
              {amenity.icon}
              <span className="font-medium">{amenity.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
