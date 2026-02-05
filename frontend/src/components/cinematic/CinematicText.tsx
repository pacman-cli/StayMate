'use client'

import { motion } from 'framer-motion'

interface CinematicTextProps {
  content: string
  type?: 'heading' | 'body' | 'label'
  className?: string
  delay?: number
}

export default function CinematicText({
  content,
  type = 'body',
  className = "",
  delay = 0
}: CinematicTextProps) {

  const variants = {
    hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      // Explicitly typing the ease array as a readonly tuple for Framer Motion
      transition: {
        duration: 1.2,
        ease: [0.25, 0.1, 0.25, 1.0] as const,
        delay
      }
    }
  }

  const Tag = type === 'heading' ? 'h2' : type === 'label' ? 'span' : 'p'

  const baseStyles = {
    heading: "text-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-stone-900 dark:text-midnight-50 leading-[1.1]",
    body: "text-body-cinematic text-lg md:text-xl text-stone-900/80 dark:text-midnight-200 leading-relaxed max-w-prose",
    label: "font-mono text-xs uppercase tracking-widest text-stone-500 dark:text-midnight-500 mb-4 block"
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
      variants={variants}
    >
      <Tag className={`${baseStyles[type]} ${className}`}>
        {content}
      </Tag>
    </motion.div>
  )
}
