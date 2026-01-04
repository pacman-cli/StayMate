"use client"

import { useTheme } from "@/context/ThemeContext"
import { motion } from "framer-motion"

interface LoadingSpinnerProps {
 size?: "sm" | "md" | "lg" | "xl"
 className?: string
}

export default function LoadingSpinner({ size = "md", className = "" }: LoadingSpinnerProps) {
 const { isDark } = useTheme()

 const sizeClasses = {
  sm: "w-5 h-5",
  md: "w-8 h-8",
  lg: "w-12 h-12",
  xl: "w-16 h-16"
 }

 return (
  <div
   className={`flex justify-center items-center ${className}`}
   role="status"
   aria-label="Loading"
  >
   <motion.div
    className={`rounded-full border-4 border-t-transparent ${sizeClasses[size]} ${isDark
     ? "border-primary-500/30 border-t-primary-500"
     : "border-primary-200 border-t-primary-600"
     }`}
    animate={{ rotate: 360 }}
    transition={{
     duration: 1,
     repeat: Infinity,
     ease: "linear"
    }}
   />
   <span className="sr-only">Loading...</span>
  </div>
 )
}
