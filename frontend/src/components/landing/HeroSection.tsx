"use client"

import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { trustedBy } from "@/lib/landingData"
import { motion } from "framer-motion"
import { ArrowRight, CheckCircle2, Heart, MapPin, Play, UserCheck } from "lucide-react"
import Link from "next/link"

import HeroVideoBackground from "./HeroVideoBackground"

export default function HeroSection() {
  const { isAuthenticated } = useAuth()
  const { isDark } = useTheme()

  const VIDEO_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/uploads/staymate-uploads/StayMate_Cinematic_Housing_Platform_Concept.mp4`

  // const VIDEO_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/uploads/staymate-uploads/StayMate_Cinematic_Housing_Platform_Concept.mp4`

  return (
    <section className="relative min-h-[110vh] flex flex-col justify-center overflow-hidden">

      {/* Cinematic Video Background */}
      <HeroVideoBackground
        videoUrl={VIDEO_URL}
        posterUrl="/images/hero-poster.jpg"
      />

      {/* Decorative Overlays (kept for extra texture) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Subtle Grid - Reduced Opacity due to video */}
        <div className={`absolute inset-0 opacity-30 ${isDark
          ? "bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)]"
          : "bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)]"
          }`}
          style={{ backgroundSize: '60px 60px', maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)' }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10 pt-20 pb-16">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* Left Column: Typography & CTA */}
          <div className="w-full lg:w-1/2 text-left z-20">
            {/* Trust Pill */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 backdrop-blur-md ${isDark
                ? "bg-white/5 border border-white/10 text-primary-400"
                : "bg-white/60 border border-slate-200 text-primary-700 shadow-sm"
                }`}
            >
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isDark ? "bg-primary-400" : "bg-primary-500"}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isDark ? "bg-primary-500" : "bg-primary-600"}`}></span>
              </span>
              #1 Trusted Roommate Finder
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={`text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6 leading-[1.1] tracking-tight ${isDark ? "text-white" : "text-slate-900"
                }`}
              style={{
                textShadow: isDark
                  ? "0 2px 20px rgba(0,0,0,0.5), 0 0 40px rgba(0,0,0,0.3)"
                  : "0 1px 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.5)"
              }}
            >
              Find Your <br />
              <span className="bg-gradient-to-r from-primary-400 via-primary-500 to-purple-500 bg-clip-text text-transparent drop-shadow-sm">
                Perfect Place.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className={`text-xl font-light leading-relaxed mb-10 max-w-xl ${isDark ? "text-slate-200" : "text-slate-700"
                }`}
              style={{
                textShadow: isDark
                  ? "0 1px 8px rgba(0,0,0,0.4)"
                  : "0 1px 4px rgba(255,255,255,0.6)"
              }}
            >
              Connect with verified landlords and compatible roommates.
              A safer, smarter way to rent in the modern world.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                href={isAuthenticated ? "/dashboard" : "/register"}
                className={`inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-primary-500/25 ${isDark
                  ? "bg-primary-600 text-white hover:bg-primary-500"
                  : "bg-primary-600 text-white hover:bg-primary-700"
                  }`}
              >
                Start Searching
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button className={`inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 border backdrop-blur-sm ${isDark
                ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                : "border-slate-200 bg-white/50 text-slate-700 hover:bg-white/80"
                }`}>
                <Play className="w-5 h-5" />
                How it Works
              </button>
            </motion.div>

            {/* Trust Indicators (Small) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="mt-12 flex items-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500"
            >
              {trustedBy.slice(0, 3).map((item, idx) => (
                <div key={idx} className={`text-sm font-medium flex items-center gap-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {item.icon} <span className="hidden sm:inline">{item.name}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column: 3D Floating UI Composition */}
          <div className="w-full lg:w-1/2 relative h-[600px] perspective-[2000px] hidden lg:block">
            {/* Card 1: Back (Profile Match) */}
            <motion.div
              initial={{ opacity: 0, rotateX: 10, rotateY: -10, z: -100 }}
              animate={{ opacity: 1, rotateX: 5, rotateY: -5, z: 0, y: [0, -15, 0] }}
              transition={{ duration: 0.8, delay: 0.4, y: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
              className={`absolute top-20 right-10 w-72 p-5 rounded-2xl backdrop-blur-xl border shadow-2xl z-10 ${isDark
                ? "bg-dark-800/60 border-white/10 shadow-black/30"
                : "bg-warm-50/80 border-slate-200/60 shadow-xl"
                }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500" />
                <div>
                  <div className={`h-2.5 w-24 rounded-full mb-2 ${isDark ? "bg-white/20" : "bg-slate-200"}`} />
                  <div className={`h-2 w-16 rounded-full ${isDark ? "bg-white/10" : "bg-slate-100"}`} />
                </div>
              </div>
              <div className={`p-3 rounded-xl mb-2 flex items-center gap-3 ${isDark ? "bg-green-500/20 text-green-400" : "bg-green-50 text-green-600"}`}>
                <UserCheck className="w-5 h-5" />
                <span className="font-semibold text-sm">98% Match</span>
              </div>
            </motion.div>

            {/* Card 2: Main (Room Listing) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: [0, -20, 0] }}
              transition={{ duration: 0.8, delay: 0.2, y: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 } }}
              className={`absolute top-40 left-10 w-80 p-4 rounded-3xl backdrop-blur-xl border shadow-2xl z-20 ${isDark
                ? "bg-dark-800/90 border-white/10 shadow-black/40"
                : "bg-warm-50/90 border-white shadow-2xl"
                }`}
            >
              {/* Fake Image Area */}
              <div className="h-48 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 relative overflow-hidden mb-4 group">
                <div className="absolute inset-0 bg-[url('/images/property-placeholder.svg')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md p-1.5 rounded-full">
                  <Heart className="w-4 h-4 text-white fill-white" />
                </div>
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Downtown, NY
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className={`h-4 w-32 rounded-full ${isDark ? "bg-white/20" : "bg-slate-200"}`} />
                  <span className={`text-sm font-bold ${isDark ? "text-primary-400" : "text-primary-600"}`}>$1,200/mo</span>
                </div>
                <div className={`h-3 w-48 rounded-full ${isDark ? "bg-white/10" : "bg-slate-100"}`} />
              </div>
            </motion.div>

            {/* Card 3: Front (Active Status) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: [0, -10, 0] }}
              transition={{ duration: 0.8, delay: 0.6, y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 } }}
              className={`absolute bottom-32 right-0 w-64 p-4 rounded-2xl backdrop-blur-md border shadow-xl z-30 ${isDark
                ? "bg-dark-900/80 border-primary-500/30 shadow-primary-500/10"
                : "bg-warm-50/90 border-primary-100 shadow-lg"
                }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${isDark ? "bg-primary-500/20 text-primary-400" : "bg-primary-100 text-primary-600"}`}>
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className={`text-xs uppercase font-bold tracking-wider mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Status</div>
                  <div className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Verified Landlord</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
