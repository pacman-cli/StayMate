"use client"

import { useTheme } from "@/context/ThemeContext"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface HeroVideoBackgroundProps {
  videoUrl: string
  posterUrl?: string
}

export default function HeroVideoBackground({ videoUrl, posterUrl }: HeroVideoBackgroundProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const { isDark } = useTheme()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 w-full h-full"
      >
        {/* Video Element with CSS Blur for Premium Feel */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster={posterUrl}
          onLoadedData={() => setVideoLoaded(true)}
          className="object-cover w-full h-full scale-105"
          style={{
            // Subtle blur applied directly to video for premium cinematic feel
            // Using CSS filter instead of backdrop-filter for performance
            filter: "blur(2px)",
          }}
          aria-hidden="true"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>

        {/* ========== PREMIUM GLASS OVERLAY ========== */}
        {/* This creates the glossy, premium feel */}
        <div
          className={`absolute inset-0 ${isDark
              ? "bg-gradient-to-br from-dark-950/40 via-dark-900/20 to-transparent"
              : "bg-gradient-to-br from-white/30 via-white/15 to-transparent"
            }`}
          style={{
            // Subtle glossy sheen
            backgroundImage: isDark
              ? "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 50%, rgba(255,255,255,0.02) 100%)"
              : "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)",
          }}
        />

        {/* ========== MAIN GRADIENT OVERLAY FOR TEXT READABILITY ========== */}
        {/* Left-to-right gradient: strong on left (where text is), fading to right */}
        <div
          className={`absolute inset-0 ${isDark
              ? "bg-gradient-to-r from-dark-950/80 via-dark-950/50 to-dark-950/20"
              : "bg-gradient-to-r from-white/85 via-white/60 to-white/30"
            }`}
        />

        {/* ========== RADIAL VIGNETTE FOR CINEMATIC DEPTH ========== */}
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? "radial-gradient(ellipse 80% 60% at 30% 50%, transparent 0%, rgba(3,7,18,0.3) 100%)"
              : "radial-gradient(ellipse 80% 60% at 30% 50%, transparent 0%, rgba(255,255,255,0.2) 100%)",
          }}
        />

        {/* ========== TOP FADE FOR NAVBAR BLEND ========== */}
        <div
          className={`absolute top-0 left-0 w-full h-24 bg-gradient-to-b ${isDark ? "from-dark-950/70" : "from-white/60"
            } to-transparent`}
        />

        {/* ========== BOTTOM FADE FOR SMOOTH SECTION TRANSITION ========== */}
        <div
          className={`absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t ${isDark ? "from-dark-950" : "from-white"
            } to-transparent`}
        />

        {/* ========== SUBTLE NOISE TEXTURE FOR PREMIUM FEEL ========== */}
        {/* Very subtle grain to add depth and reduce banding */}
        <div
          className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </motion.div>
    </div>
  )
}
