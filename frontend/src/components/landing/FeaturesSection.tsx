"use client"

import { useTheme } from "@/context/ThemeContext"
import { getColorClasses } from "@/lib/colorUtils"
import { coreFeatures } from "@/lib/landingData"
import { motion } from "framer-motion"
import { CheckCircle, Sparkles } from "lucide-react"

export default function FeaturesSection() {
  const { isDark } = useTheme()

  return (
    <section className={`py-32 relative overflow-hidden transition-colors duration-300 ${isDark ? "bg-dark-800" : "bg-slate-50"}`}>
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary-500/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-purple-500/5 blur-[120px] rounded-full" />

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
              ? "bg-primary-500/10 text-primary-400 border border-primary-500/20"
              : "bg-primary-50 text-primary-600 border border-primary-100"
              }`}
          >
            <Sparkles className="w-4 h-4" />
            Core Features
          </motion.span>
          <h2
            className={`text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight ${isDark ? "text-white" : "text-slate-900"
              }`}
          >
            Everything You Need
            <span className="bg-gradient-to-r from-primary-500 to-purple-500 bg-clip-text text-transparent"> To Live Better</span>
          </h2>
          <p
            className={`text-lg md:text-xl ${isDark ? "text-slate-300" : "text-slate-600"}`}
          >
            We've reimagined the rental experience with smart features designed for your peace of mind.
          </p>
        </motion.div>

        <div className="space-y-24">
          {coreFeatures.map((feature, idx) => {
            const isEven = idx % 2 === 0
            const colors = getColorClasses(feature.color, isDark)

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className={`flex flex-col ${isEven ? "lg:flex-row" : "lg:flex-row-reverse"} items-center gap-12 lg:gap-20`}
              >
                {/* Image/Visual Side */}
                <div className="w-full lg:w-1/2">
                  <motion.div
                    whileHover={{ scale: 1.02, rotate: isEven ? 1 : -1 }}
                    transition={{ duration: 0.5 }}
                    className={`relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl border ${isDark ? "border-white/10" : "border-slate-200"
                      }`}
                  >
                    <div className={`absolute inset-0 ${isDark ? "bg-dark-800/50" : "bg-warm-50"}`}>
                      {/* Abstract visual representation of user interface or feature */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`w-32 h-32 rounded-3xl ${colors.bg} flex items-center justify-center`}>
                          <div className={`transform scale-150 ${colors.text}`}>
                            {feature.icon}
                          </div>
                        </div>
                      </div>

                      {/* Feature Details Overlay */}
                      <div className={`absolute bottom-0 left-0 right-0 p-8 ${isDark ? "bg-gradient-to-t from-dark-950/90 to-transparent" : "bg-gradient-to-t from-slate-900/10 to-transparent"}`}>
                        <div className="flex flex-wrap gap-3">
                          {feature.details.slice(0, 3).map((detail, dIdx) => (
                            <span
                              key={dIdx}
                              className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md ${isDark
                                ? "bg-white/10 text-white border border-white/20"
                                : "bg-white/80 text-slate-800 border border-white/40 shadow-sm"
                                }`}
                            >
                              {detail}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Content Side */}
                <div className="w-full lg:w-1/2">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-8 ${colors.bg} ${colors.text}`}>
                    {feature.icon}
                  </div>
                  <h3 className={`text-3xl sm:text-4xl font-bold mb-6 ${isDark ? "text-white" : "text-slate-900"}`}>
                    {feature.title}
                  </h3>
                  <p className={`text-lg leading-relaxed mb-8 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                    {feature.description}
                  </p>

                  <ul className="space-y-4">
                    {feature.benefits.map((benefit, bIdx) => (
                      <motion.li
                        key={bIdx}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 + bIdx * 0.1 }}
                        className="flex items-center gap-4 group"
                      >
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDark ? "bg-white/5 group-hover:bg-primary-500/20" : "bg-slate-100 group-hover:bg-primary-50"
                          }`}>
                          <CheckCircle className={`w-5 h-5 ${isDark ? "text-primary-400" : "text-primary-600"}`} />
                        </div>
                        <span className={`text-lg font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                          {benefit}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
