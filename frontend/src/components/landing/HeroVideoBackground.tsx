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
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster={posterUrl}
          className="object-cover w-full h-full scale-105" // scale-105 to prevent thin lines at edges
          aria-hidden="true"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>

        {/* Cinematic Overlays */}

        {/* 1. Blur Layer (Removed for visibility) */}
        {/* <div className="absolute inset-0 backdrop-blur-[0px]" /> */}

        {/* 2. Gradient Overlay for Text Readability */}
        <div className={`absolute inset-0 ${isDark
          ? "bg-gradient-to-r from-dark-950/70 via-dark-950/30 to-transparent"
          : "bg-gradient-to-r from-white/90 via-white/70 to-white/30"
          }`}
        />

        {/* 3. Bottom Fade for Smooth Transition */}
        <div className={`absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t ${isDark ? "from-dark-950" : "from-white"
          } to-transparent`} />

      </motion.div>
    </div>
  )
}
