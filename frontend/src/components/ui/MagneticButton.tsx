'use client'

import { motion, useMotionValue, useSpring } from 'framer-motion'
import { MouseEvent, ReactNode, useRef } from 'react'

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass'
}

export default function MagneticButton({
  children,
  className = '',
  onClick,
  variant = 'primary'
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)

  // Motion values for the magnetic effect
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Smooth spring animation
  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 }
  const springX = useSpring(x, springConfig)
  const springY = useSpring(y, springConfig)

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return

    const { clientX, clientY } = e
    const { left, top, width, height } = ref.current.getBoundingClientRect()

    const centerX = left + width / 2
    const centerY = top + height / 2

    const distance = 15 // Max distance the button moves

    const moveX = (clientX - centerX) / (width / 2)
    const moveY = (clientY - centerY) / (height / 2)

    x.set(moveX * distance)
    y.set(moveY * distance)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  // Base styles
  const baseStyles = "relative inline-flex items-center justify-center font-medium transition-colors duration-200 cursor-pointer overflow-hidden"

  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    ghost: "btn-ghost",
    glass: "glass-button hover:bg-white/10 dark:hover:bg-white/5 backdrop-blur-md text-white border-white/20",
  }

  return (
    <motion.button
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.95 }}
    >
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </motion.button>
  )
}
