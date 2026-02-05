'use client'

import { motion } from 'framer-motion'

export default function FluidGradient() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-stone-50 dark:bg-midnight-950 transition-colors duration-700">
      {/* Ambient Aurora */}
      <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] opacity-40 dark:opacity-30 mix-blend-soft-light dark:mix-blend-overlay">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className="w-full h-full bg-aurora filter blur-[100px]"
        />
      </div>

      {/* Accent Orbs (Lux Indigo) */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-lux-indigo/10 rounded-full blur-[120px]"
      />

      <motion.div
        animate={{
          x: [0, -70, 0],
          y: [0, 100, 0],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-lux-violet/10 rounded-full blur-[140px]"
      />

      {/* Grain Overlay for Texture */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{ backgroundImage: 'url("/noise.png")' }}></div>
    </div>
  )
}
