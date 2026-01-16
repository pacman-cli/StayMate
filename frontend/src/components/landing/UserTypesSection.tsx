"use client"

import { useTheme } from "@/context/ThemeContext"
import { motion } from "framer-motion"
import { BookOpen, Briefcase, CheckCircle2 } from "lucide-react"
import Link from "next/link"

const UserTypesSection = () => {
  const { isDark } = useTheme()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  }

  return (
    <section className={`py-24 relative overflow-hidden transition-colors duration-300 ${isDark ? "bg-dark-900" : "bg-slate-50"}`}>
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-30 ${isDark ? "bg-primary-500/20" : "bg-emerald-200/40"}`} />
        <div className={`absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-30 ${isDark ? "bg-blue-500/20" : "bg-blue-100/40"}`} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 tracking-tight ${isDark ? "text-white" : "text-[#111827]"}`}>
              Designed for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Everyone</span>
            </h2>
            <p className={`text-lg md:text-xl leading-relaxed ${isDark ? "text-slate-400" : "text-[#475569]"}`}>
              Whether you're studying or building your career, StayMate provides the perfect environment for your growth.
            </p>
          </motion.div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12"
        >
          {/* Students Card */}
          <motion.div variants={itemVariants} className="h-full">
            <div className={`h-full p-10 rounded-[24px] transition-all duration-300 group hover:-translate-y-1 ${isDark
              ? "bg-dark-800 border border-white/5 hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/10"
              : "bg-white border border-slate-200 shadow-sm hover:shadow-xl"
              }`}>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transform transition-transform group-hover:scale-110 ${isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-50 text-emerald-600"
                }`}>
                <BookOpen className="w-8 h-8" />
              </div>

              <h3 className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-[#111827]"}`}>Students</h3>
              <p className={`mb-8 leading-relaxed ${isDark ? "text-slate-400" : "text-[#475569]"}`}>
                Find affordable housing near campus with verified roommates from your university. Focus on your studies while we handle the rest.
              </p>

              <ul className="space-y-4 mb-8">
                {[
                  "Verified student community",
                  "Flexible lease terms",
                  "Close to major universities",
                  "Budget-friendly options"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? "text-emerald-400" : "text-emerald-500"}`} />
                    <span className={isDark ? "text-slate-300" : "text-[#475569]"}>{item}</span>
                  </li>
                ))}
              </ul>

              <Link href="/register?type=student" className={`inline-flex items-center text-sm font-bold transition-colors ${isDark ? "text-emerald-400 hover:text-emerald-300" : "text-emerald-600 hover:text-emerald-700"
                }`}>
                Start your journey -&gt;
              </Link>
            </div>
          </motion.div>

          {/* Job Seekers Card */}
          <motion.div variants={itemVariants} className="h-full">
            <div className={`h-full p-10 rounded-[24px] transition-all duration-300 group hover:-translate-y-1 ${isDark
              ? "bg-dark-800 border border-white/5 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/10"
              : "bg-white border border-slate-200 shadow-sm hover:shadow-xl"
              }`}>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transform transition-transform group-hover:scale-110 ${isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-50 text-blue-600"
                }`}>
                <Briefcase className="w-8 h-8" />
              </div>

              <h3 className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-[#111827]"}`}>Job Seekers</h3>
              <p className={`mb-8 leading-relaxed ${isDark ? "text-slate-400" : "text-[#475569]"}`}>
                Connect with like-minded professionals in premium living spaces. Network and grow your career in a supportive environment.
              </p>

              <ul className="space-y-4 mb-8">
                {[
                  "Professional networking events",
                  "Premium amenities & workspace",
                  "Strategic city locations",
                  "Quiet & productive environment"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? "text-blue-400" : "text-blue-500"}`} />
                    <span className={isDark ? "text-slate-300" : "text-[#475569]"}>{item}</span>
                  </li>
                ))}
              </ul>

              <Link href="/register?type=professional" className={`inline-flex items-center text-sm font-bold transition-colors ${isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
                }`}>
                Find your space -&gt;
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default UserTypesSection
