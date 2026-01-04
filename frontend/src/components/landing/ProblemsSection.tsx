"use client"

import { useTheme } from "@/context/ThemeContext"
import { getColorClasses } from "@/lib/colorUtils"
import { problems } from "@/lib/landingData"
import { motion } from "framer-motion"
import { AlertTriangle, CircleDollarSign, Fingerprint, Heart } from "lucide-react"

export default function ProblemsSection() {
 const { isDark } = useTheme()

 return (
  <section
   className={`py-32 relative overflow-hidden ${isDark ? "bg-dark-900/30" : "bg-slate-50/50"}`}
  >
   {/* Background Pattern */}
   <div className="absolute inset-0 opacity-30">
    <div className={`absolute inset-0 ${isDark ? "bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05)_0%,transparent_70%)]" : "bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.02)_0%,transparent_70%)]"}`} />
   </div>

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
       ? "bg-red-500/10 text-red-400 border border-red-500/20"
       : "bg-red-50 text-red-600 border border-red-100"
       }`}
     >
      <AlertTriangle className="w-4 h-4" />
      The Problem
     </motion.span>
     <h2
      className={`text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight ${isDark ? "text-white" : "text-slate-900"
       }`}
     >
      Why Traditional Renting
      <span className="text-red-500"> Doesn't Work</span>
     </h2>
     <p
      className={`text-lg md:text-xl ${isDark ? "text-slate-300" : "text-slate-600"}`}
     >
      Finding a suitable rental room or a compatible
      roommate is one of the most challenging tasks for
      students, job seekers, and newcomers in urban areas.
      Traditional methods often lead to:
     </p>
    </motion.div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
     {problems.map((problem, idx) => {
      const colors = getColorClasses(problem.color, isDark)
      return (
       <motion.div
        key={idx}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ delay: idx * 0.1, duration: 0.5 }}
        whileHover={{ y: -8, scale: 1.02 }}
        className={`group relative p-8 rounded-2xl transition-all duration-300 ${isDark
         ? "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 backdrop-blur-sm"
         : "bg-white border border-slate-200 shadow-lg hover:shadow-2xl"
         }`}
       >
        <motion.div
         className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 ${colors.bg} ${colors.text} shadow-lg`}
         whileHover={{ scale: 1.1, rotate: 5 }}
         transition={{ type: "spring", stiffness: 300 }}
        >
         {problem.icon}
        </motion.div>
        <h3
         className={`text-xl font-bold mb-3 ${isDark
          ? "text-white"
          : "text-slate-900"
          }`}
        >
         {problem.title}
        </h3>
        <p
         className={`leading-relaxed ${isDark
          ? "text-slate-300"
          : "text-slate-600"
          }`}
        >
         {problem.description}
        </p>
       </motion.div>
      )
     })}
    </div>

    {/* Impact Stats */}
    <motion.div
     initial={{ opacity: 0, y: 50 }}
     whileInView={{ opacity: 1, y: 0 }}
     viewport={{ once: true, margin: "-100px" }}
     transition={{ duration: 0.6 }}
     className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6"
    >
     <ImpactCard
      icon={<CircleDollarSign className={`w-14 h-14 mx-auto mb-5 ${isDark ? "text-red-400" : "text-red-600"}`} />}
      title="Financial Losses"
      description="Thousands of students lose deposits to scammers every year due to unverified listings."
      colorClass={isDark ? "bg-red-500/10 border-red-500/20 hover:bg-red-500/15" : "bg-red-50 border-red-100 hover:shadow-xl"}
      isDark={isDark}
     />
     <ImpactCard
      icon={<Fingerprint className={`w-14 h-14 mx-auto mb-5 ${isDark ? "text-orange-400" : "text-orange-600"}`} />}
      title="Privacy Risks"
      description="Sharing personal information with unverified parties puts your identity at risk."
      colorClass={isDark ? "bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/15" : "bg-orange-50 border-orange-100 hover:shadow-xl"}
      isDark={isDark}
     />
     <ImpactCard
      icon={<Heart className={`w-14 h-14 mx-auto mb-5 ${isDark ? "text-purple-400" : "text-purple-600"}`} />}
      title="Mental Stress"
      description="The uncertainty and frustration of housing search affects mental well-being."
      colorClass={isDark ? "bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/15" : "bg-purple-50 border-purple-100 hover:shadow-xl"}
      isDark={isDark}
     />
    </motion.div>
   </div>
  </section>
 )
}

interface ImpactCardProps {
 icon: React.ReactNode
 title: string
 description: string
 colorClass: string
 isDark: boolean
}

function ImpactCard({ icon, title, description, colorClass, isDark }: ImpactCardProps) {
 return (
  <motion.div
   initial={{ opacity: 0, y: 30 }}
   whileInView={{ opacity: 1, y: 0 }}
   viewport={{ once: true }}
   transition={{ duration: 0.5 }}
   whileHover={{ y: -5, scale: 1.02 }}
   className={`text-center p-8 rounded-2xl transition-all duration-300 border ${colorClass}`}
  >
   <motion.div
    whileHover={{ scale: 1.1, rotate: 5 }}
    transition={{ type: "spring", stiffness: 300 }}
   >
    {icon}
   </motion.div>
   <h4 className={`text-2xl font-bold mb-3 ${isDark ? "text-white" : "text-slate-900"}`}>
    {title}
   </h4>
   <p className={`${isDark ? "text-slate-300" : "text-slate-600"}`}>
    {description}
   </p>
  </motion.div>
 )
}
