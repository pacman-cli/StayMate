'use client'

import { motion } from 'framer-motion'
import CinematicText from '../cinematic/CinematicText'
import SceneWrapper from '../cinematic/SceneWrapper'

export default function SceneEcosystem() {
  const pillars = [
    { label: 'TENANT', desc: 'Secure Living' },
    { label: 'OWNER', desc: 'Guaranteed Rent' },
    { label: 'PLATFORM', desc: 'Active Safety' }
  ]

  return (
    <SceneWrapper className="items-center justify-center bg-stone-100 dark:bg-midnight-900 border-y border-stone-200 dark:border-midnight-800">
      <CinematicText type="label" content="THE ECOSYSTEM" className="mb-12" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-6xl px-6">
        {pillars.map((pillar, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: i * 0.2, ease: [0.25, 0.1, 0.25, 1.0] }}
            className="flex flex-col items-center text-center p-8 border border-stone-200 dark:border-midnight-800 rounded-2xl glass-cinema hover:border-lux-indigo/30 transition-colors duration-500"
          >
            <div className="text-6xl font-display font-light text-stone-200 dark:text-midnight-800 mb-6">0{i + 1}</div>
            <h3 className="text-xl font-bold font-display text-stone-900 dark:text-midnight-50 mb-2 tracking-tight">{pillar.label}</h3>
            <p className="text-stone-500 dark:text-midnight-400 font-mono text-xs uppercase tracking-widest">{pillar.desc}</p>
          </motion.div>
        ))}
      </div>

      <CinematicText
        type="body"
        content="A balanced triangle where every party is verified, protected, and accountable."
        className="mt-16 text-center mx-auto"
      />
    </SceneWrapper>
  )
}
