'use client'

import { motion } from 'framer-motion'
import CinematicText from '../cinematic/CinematicText'
import SceneWrapper from '../cinematic/SceneWrapper'

export default function SceneSilentHero() {
  return (
    <SceneWrapper className="items-center text-center">

      <CinematicText
        type="label"
        content="EST. 2024 — DHAKA"
        delay={0.5}
      />

      <div className="max-w-4xl mx-auto px-4">
        <CinematicText
          type="heading"
          content="Living together."
          delay={0.8}
        />
        <CinematicText
          type="heading"
          content="Redefined."
          className="text-stone-400 dark:text-midnight-500"
          delay={1.2}
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1.5 }}
        className="absolute bottom-12 flex flex-col items-center gap-2"
      >
        <span className="text-xs uppercase tracking-widest text-stone-400 dark:text-midnight-500">Scroll to begin</span>
        <div className="w-[1px] h-12 bg-stone-300 dark:bg-midnight-800 overflow-hidden">
          <motion.div
            animate={{ y: ["-100%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-full h-full bg-stone-900 dark:bg-midnight-200"
          />
        </div>
      </motion.div>

    </SceneWrapper>
  )
}
