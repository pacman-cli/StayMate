"use client"

import { useTheme } from "@/context/ThemeContext"
import { motion, useScroll, useTransform } from "framer-motion"
import { useEffect, useState } from "react"

export default function HexPatternBackground() {
  const { isDark } = useTheme()
  const { scrollY } = useScroll()
  const [mounted, setMounted] = useState(false)

  // Parallax effect
  const y1 = useTransform(scrollY, [0, 1000], [0, 200])
  const y2 = useTransform(scrollY, [0, 1000], [0, -150])

  // Fade out on scroll (Texture opacity reduces but never fully disappears)
  const containerOpacity = useTransform(scrollY, [0, 400], [1, 0.2])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none transition-colors duration-700 -z-10 ${isDark ? "bg-[#0A101C]" : "bg-[#F5EEE4]"
      }`}>
      <motion.div style={{ opacity: containerOpacity }} className="absolute inset-0">
        {/* Ambient Gradient Orbs */}
        <div className="absolute inset-0 opacity-60">
          <motion.div
            style={{ y: y1 }}
            className={`absolute top-0 left-0 w-[800px] h-[800px] rounded-full blur-[120px] mix-blend-screen transition-colors duration-700 ${isDark
              ? "bg-slate-900/20"
              : "bg-[#EAE5D5]"
              }`} />
          <motion.div
            style={{ y: y2 }}
            className={`absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-[100px] mix-blend-screen transition-colors duration-700 ${isDark
              ? "bg-blue-950/20"
              : "bg-[#E0DDD5]"
              }`} />
        </div>

        {/* Texture Image - Adaptive Logic */}
        <div
          className={`absolute inset-0 transition-all duration-700 ${isDark
            ? "bg-[url('/minimal-honeycomb.png')] bg-cover opacity-40" // Dark Mode: Use same high-quality image but inverted
            : "bg-[url('/minimal-honeycomb.png')] bg-cover opacity-100" // Light Mode: Original warm beige
            }`}
          style={{
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            // Premium Dark Mode Strategy:
            // Invert the warm beige light image to get a cool deep slate/blue.
            // brightness(0.5): dims it to sit nicely in the background.
            // saturate(0.5): removes too much color to keep it modern and minimal.
            filter: isDark ? 'invert(1) hue-rotate(180deg) brightness(0.5) saturate(0.5)' : 'none'
          }}
        />
      </motion.div>
    </div>
  )
}
