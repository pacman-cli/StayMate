"use client"

import { useTheme } from "@/context/ThemeContext"
import { howItWorks } from "@/lib/landingData"
import { motion } from "framer-motion"
import { Rocket } from "lucide-react"

export default function HowItWorksSection() {
  const { isDark } = useTheme()

  return (
    <section
      className={`py-32 relative overflow-hidden transition-colors duration-300 ${isDark ? "bg-dark-900" : "bg-white"}`}
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
              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
              : "bg-blue-50 text-blue-600 border border-blue-100"
              }`}
          >
            <Rocket className="w-4 h-4" />
            How It Works
          </motion.span>
          <h2
            className={`text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight ${isDark ? "text-white" : "text-slate-900"
              }`}
          >
            Simple Steps to
            <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent"> Your New Home</span>
          </h2>
        </motion.div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-[60px] left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-20" />

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {howItWorks.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: idx * 0.15, duration: 0.5 }}
                className="relative flex flex-col items-center text-center group"
              >
                {/* Step Number & Icon */}
                <div className="relative mb-8">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className={`w-32 h-32 rounded-3xl flex items-center justify-center relative z-10 transition-colors duration-300 ${isDark
                      ? "bg-dark-800/80 border border-white/10 group-hover:border-primary-500/50 shadow-xl"
                      : "bg-warm-50 border border-slate-200 shadow-xl group-hover:border-primary-200"
                      }`}
                  >
                    <div className={`transform scale-125 transition-colors duration-300 ${isDark ? "text-primary-400" : "text-primary-600"
                      }`}>
                      {step.icon}
                    </div>

                    <div className={`absolute -top-4 -right-4 w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${isDark
                      ? "bg-dark-950 border-primary-500 text-primary-400"
                      : "bg-white border-primary-500 text-primary-600"
                      }`}>
                      {step.step}
                    </div>
                  </motion.div>
                </div>

                <h3 className={`text-xl font-bold mb-3 ${isDark ? "text-white" : "text-slate-900"}`}>
                  {step.title}
                </h3>
                <p className={`text-sm leading-relaxed mb-4 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
