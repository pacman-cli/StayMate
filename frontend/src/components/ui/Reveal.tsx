'use client'

import { motion, useAnimation, useInView } from 'framer-motion'
import { ReactNode, useEffect, useRef } from 'react'

interface RevealProps {
  children: ReactNode
  width?: "fit-content" | "100%"
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  className?: string
}

export default function Reveal({
  children,
  width = "fit-content",
  delay = 0.25,
  duration = 0.5,
  direction = 'up',
  className = ""
}: RevealProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-10%" })
  const mainControls = useAnimation()

  useEffect(() => {
    if (isInView) {
      mainControls.start("visible")
    }
  }, [isInView, mainControls])

  const getVariants = () => {
    const distance = 75
    const hidden: any = { opacity: 0 }
    const visible: any = { opacity: 1 }

    switch (direction) {
      case 'up':
        hidden.y = distance
        visible.y = 0
        break
      case 'down':
        hidden.y = -distance
        visible.y = 0
        break
      case 'left':
        hidden.x = distance
        visible.x = 0
        break
      case 'right':
        hidden.x = -distance
        visible.x = 0
        break
      case 'none':
        // Just fade
        break
    }

    return {
      hidden,
      visible: {
        ...visible,
        transition: { duration, delay, ease: "easeOut" }
      }
    }
  }

  return (
    <div ref={ref} style={{ position: "relative", width, overflow: "hidden" }} className={className}>
      <motion.div
        variants={getVariants()}
        initial="hidden"
        animate={mainControls}
      >
        {children}
      </motion.div>
    </div>
  )
}
