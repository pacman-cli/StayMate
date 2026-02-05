'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { ReactNode, useRef } from 'react'

interface SceneWrapperProps {
  children: ReactNode
  className?: string
  id?: string
}

export default function SceneWrapper({ children, className = "", id }: SceneWrapperProps) {
  const ref = useRef<HTMLDivElement>(null)

  // We create a "timeline" for this specific scene based on its scroll position
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  // Default opacity fade in/out interactions for smooth narrative flow
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

  // Subtle scale effect to give "breathing" room
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.95, 1, 1, 0.95])

  return (
    <motion.section
      ref={ref}
      id={id}
      style={{ opacity, scale }}
      className={`min-h-screen flex flex-col justify-center relative ${className}`}
    >
      {children}
    </motion.section>
  )
}
