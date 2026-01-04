"use client"

import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { stats, trustedBy } from "@/lib/landingData"
import { motion } from "framer-motion"
import { ArrowRight, Play } from "lucide-react"
import Link from "next/link"

export default function HeroSection() {
 const { isAuthenticated } = useAuth()
 const { isDark } = useTheme()

 return (
  <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
   {/* Animated Gradient Background */}
   <div className="absolute inset-0 overflow-hidden">
    <motion.div
     className={`absolute inset-0 ${isDark
      ? "bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950"
      : "bg-gradient-to-br from-slate-50 via-white to-slate-50"
      }`}
     animate={{
      backgroundPosition: ["0% 0%", "100% 100%"],
     }}
     transition={{
      duration: 20,
      repeat: Infinity,
      repeatType: "reverse",
     }}
    />

    {/* Animated Orbs */}
    <motion.div
     className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl ${isDark
      ? "bg-primary-500/20"
      : "bg-primary-200/50"
      }`}
     animate={{
      x: [0, 100, 0],
      y: [0, 50, 0],
      scale: [1, 1.2, 1],
     }}
     transition={{
      duration: 15,
      repeat: Infinity,
      ease: "easeInOut",
     }}
    />
    <motion.div
     className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl ${isDark
      ? "bg-purple-500/20"
      : "bg-purple-200/50"
      }`}
     animate={{
      x: [0, -100, 0],
      y: [0, -50, 0],
      scale: [1, 1.2, 1],
     }}
     transition={{
      duration: 18,
      repeat: Infinity,
      ease: "easeInOut",
     }}
    />
   </div>

   <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10 flex flex-col justify-center items-center pt-20 pb-16">
    {/* Trust Banner */}
    <motion.div
     initial={{ opacity: 0, y: -20 }}
     animate={{ opacity: 1, y: 0 }}
     transition={{ duration: 0.6 }}
     className="flex justify-center mb-8"
    >
     <div
      className={`inline-flex flex-wrap items-center justify-center gap-3 sm:gap-6 px-5 sm:px-8 py-3.5 rounded-full backdrop-blur-xl ${isDark
       ? "bg-white/5 border border-white/10 shadow-lg"
       : "bg-white/80 border border-slate-200/50 shadow-xl"
       }`}
     >
      {trustedBy.map((item, idx) => (
       <motion.div
        key={idx}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: idx * 0.1, duration: 0.4 }}
        className={`flex items-center gap-2 text-xs sm:text-sm font-medium ${isDark
         ? "text-slate-300"
         : "text-slate-700"
         } ${idx !== 0 ? "sm:border-l sm:border-current/20 sm:pl-6" : ""}`}
       >
        <motion.span
         className={`${isDark
          ? "text-primary-400"
          : "text-primary-600"
          }`}
         whileHover={{ scale: 1.2, rotate: 10 }}
         transition={{ type: "spring", stiffness: 300 }}
        >
         {item.icon}
        </motion.span>
        <span className="hidden xs:inline sm:inline">
         {item.name}
        </span>
       </motion.div>
      ))}
     </div>
    </motion.div>

    {/* Main Hero Content */}
    <div className="text-center max-w-6xl mx-auto w-full">
     <motion.h1
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-[1.1] ${isDark ? "text-white" : "text-slate-900"
       }`}
     >
      Smart Living{" "}
      <motion.span
       className="bg-gradient-to-r from-primary-500 via-purple-500 to-primary-600 bg-clip-text text-transparent"
       animate={{
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
       }}
       transition={{
        duration: 5,
        repeat: Infinity,
        ease: "linear",
       }}
       style={{
        backgroundSize: "200% 200%",
       }}
      >
       Starts Here
      </motion.span>
     </motion.h1>

     <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className={`text-xl sm:text-2xl md:text-3xl mb-12 max-w-3xl mx-auto leading-relaxed font-light ${isDark ? "text-slate-300" : "text-slate-600"
       }`}
     >
      Find verified rental rooms, trusted landlords, and
      compatible roommates—all in one place.
     </motion.p>

     {/* CTA Buttons */}
     <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
      className="flex flex-col sm:flex-row gap-4 justify-center mb-16 md:mb-20"
     >
      <motion.div
       whileHover={{ scale: 1.05 }}
       whileTap={{ scale: 0.95 }}
      >
       <Link
        href={
         isAuthenticated ? "/dashboard" : "/register"
        }
        className={`inline-flex items-center justify-center gap-3 px-10 py-5 text-lg md:text-xl font-semibold text-white rounded-2xl shadow-2xl transition-all duration-300 ${isDark
         ? "bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-primary-500/50"
         : "bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-primary-600/30"
         }`}
       >
        Get Started Free
        <motion.div
         animate={{ x: [0, 5, 0] }}
         transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
         }}
        >
         <ArrowRight className="w-6 h-6" />
        </motion.div>
       </Link>
      </motion.div>

      <motion.button
       whileHover={{ scale: 1.05 }}
       whileTap={{ scale: 0.95 }}
       className={`inline-flex items-center justify-center gap-3 px-10 py-5 text-lg md:text-xl font-semibold rounded-2xl border-2 backdrop-blur-sm transition-all duration-300 ${isDark
        ? "border-white/20 text-white hover:bg-white/10 hover:border-white/30 bg-white/5"
        : "border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 bg-white/50"
        }`}
      >
       <Play className="w-6 h-6" />
       Watch Demo
      </motion.button>
     </motion.div>

     {/* Quick Stats Row */}
     <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.8 }}
      className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-12 max-w-5xl mx-auto w-full"
     >
      {stats.slice(0, 4).map((stat, idx) => (
       <motion.div
        key={idx}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9 + idx * 0.1, duration: 0.5 }}
        whileHover={{ scale: 1.1, y: -5 }}
        className="text-center"
       >
        <div
         className={`text-4xl sm:text-5xl md:text-6xl font-extrabold mb-2 ${isDark
          ? "text-white"
          : "text-slate-900"
          }`}
        >
         {stat.value}
         <motion.span
          className={`${isDark ? "text-primary-400" : "text-primary-600"}`}
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{
           duration: 2,
           repeat: Infinity,
           ease: "easeInOut",
          }}
         >
          {stat.suffix}
         </motion.span>
        </div>
        <div
         className={`flex items-center justify-center gap-2 text-sm sm:text-base ${isDark ? "text-slate-400" : "text-slate-600"
          }`}
        >
         <span className={`${isDark ? "text-primary-400" : "text-primary-600"}`}>
          {stat.icon}
         </span>
         {stat.label}
        </div>
       </motion.div>
      ))}
     </motion.div>
    </div>
   </div>
  </section>
 )
}
