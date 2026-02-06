'use client'

import { motion } from 'framer-motion'
import CinematicText from '../cinematic/CinematicText'
import SceneWrapper from '../cinematic/SceneWrapper'

export default function SceneTrust() {
  return (
    <SceneWrapper className="overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center -z-10 opacity-30">
        {/* Visual Shield Metaphor - Concentric Circles */}
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-stone-300 dark:border-midnight-700"
            style={{ width: `${i * 300}px`, height: `${i * 300}px` }}
            animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3], rotate: i % 2 === 0 ? 360 : -360 }}
            transition={{ duration: 20 + i * 5, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </div>

      <div className="container-cinema text-center">
        <CinematicText type="label" content="SAFETY ARCHITECTURE" />
        <CinematicText
          type="heading"
          content="Trust isn't a feature."
        />
        <CinematicText
          type="heading"
          content="It's the foundation."
          className="text-stone-400 dark:text-midnight-500"
        />

        <div className="mt-12 flex justify-center gap-4 text-xs font-mono uppercase tracking-widest text-stone-500 dark:text-midnight-400">
          <span>ID Verification</span>
          <span>•</span>
          <span>Social Referencing</span>
          <span>•</span>
          <span>Secure Payments</span>
        </div>
      </div>
    </SceneWrapper>
  )
}
