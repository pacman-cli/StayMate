'use client'

import { motion } from 'framer-motion'
import CinematicText from '../cinematic/CinematicText'
import SceneWrapper from '../cinematic/SceneWrapper'

export default function SceneAILogic() {
  return (
    <SceneWrapper className="overflow-hidden">
      <div className="container-cinema relative z-10">
        <CinematicText type="label" content="INTELLIGENCE" />
        <h2 className="text-display text-4xl md:text-6xl text-stone-900 dark:text-midnight-50 mb-12">
          Not just search. <span className="text-lux-indigo dark:text-lux-glow">Alignment.</span>
        </h2>

        <div className="relative h-[400px] w-full border-t border-stone-200 dark:border-midnight-800 mt-12">
          {/* Abstract Data Visualization */}
          <svg className="absolute inset-0 w-full h-full" overflow="visible">
            <motion.path
              d="M0,200 C300,200 300,50 600,50 S900,200 1200,200"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-stone-300 dark:text-midnight-800"
            />
            <motion.path
              d="M0,200 C300,200 300,50 600,50 S900,200 1200,200"
              fill="none"
              stroke="url(#gradient-line)"
              strokeWidth="4"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
            <defs>
              <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4F46E5" stopOpacity="0" />
                <stop offset="50%" stopColor="#818CF8" stopOpacity="1" />
                <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          {/* Floating Nodes */}
          <div className="absolute top-[50px] left-[50%] -translate-x-1/2 w-4 h-4 bg-lux-indigo rounded-full shadow-[0_0_20px_rgba(79,70,229,0.5)] z-20" />
          <div className="absolute top-[80px] left-[50%] -translate-x-1/2 text-xs font-mono text-lux-indigo mt-2">MATCH 98%</div>
        </div>
      </div>
    </SceneWrapper>
  )
}
