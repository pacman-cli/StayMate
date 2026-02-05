'use client'

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity
} from "framer-motion"
import { ReactNode, useRef } from "react"

// Local wrap utility
const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min
}

interface InfiniteMarqueeProps {
  children: ReactNode
  baseVelocity?: number
  className?: string
}

export default function InfiniteMarquee({
  children,
  baseVelocity = 100,
  className = ""
}: InfiniteMarqueeProps) {
  const baseX = useMotionValue(0)
  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400
  })

  // Adjust speed based on scroll
  const velocityFactor = useTransform(smoothVelocity, [10, 1000], [0, 1.5], {
    clamp: false
  })

  // Reset wrap logic: 5 items means each is 20%. Wrap between -20% and 0%.
  const x = useTransform(baseX, (v) => `${wrap(-20, 0, v)}%`)

  const directionFactor = useRef<number>(1)

  useAnimationFrame((t, delta) => {
    // Reduced velocity multiplier for smoother motion
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000)

    // If scrolling up/down, add extra velocity
    if (velocityFactor.get() < 0) {
      directionFactor.current = -1
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1
    }

    // Apply velocity factor but limit the multiplier to avoid super-fast jumps
    moveBy += directionFactor.current * moveBy * velocityFactor.get()

    baseX.set(baseX.get() + moveBy)
  })

  return (
    <div className={`overflow-hidden flex flex-nowrap ${className}`}>
      <motion.div
        className="flex flex-nowrap gap-16 will-change-transform transform-gpu" // Increased gap & HW acceleration
        style={{ x }}
      >
        {children}
        {children}
        {children}
        {children}
        {children}
      </motion.div>
    </div>
  )
}
