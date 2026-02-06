'use client'

import { motion, useInView, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useRef } from 'react'

interface StatsCardProps {
  value: number
  suffix?: string
  label: string
  description?: string
  delay?: number
}

function Counter({ from, to, duration = 2 }: { from: number; to: number; duration?: number }) {
  const nodeRef = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(from)
  const springValue = useSpring(motionValue, { damping: 100, stiffness: 100 })
  const isInView = useInView(nodeRef, { once: true, margin: "-100px" })

  useEffect(() => {
    if (isInView) {
      motionValue.set(to)
    }
  }, [motionValue, to, isInView])

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (nodeRef.current) {
        nodeRef.current.textContent = Intl.NumberFormat('en-US').format(Math.floor(latest))
      }
    })
  }, [springValue])

  return <span ref={nodeRef} />
}

export default function StatsCard({ value, suffix = "", label, description, delay = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="text-center p-6"
    >
      <div className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
        <Counter from={0} to={value} />
        <span className="text-primary-600 dark:text-primary-400">{suffix}</span>
      </div>
      <div className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-1">
        {label}
      </div>
      {description && (
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {description}
        </div>
      )}
    </motion.div>
  )
}
