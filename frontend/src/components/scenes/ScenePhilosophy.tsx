'use client'

import CinematicText from '../cinematic/CinematicText'
import SceneWrapper from '../cinematic/SceneWrapper'

export default function ScenePhilosophy() {
  return (
    <div className="relative">
      {/* Scene 2: The Problem (Chaos) - Passed quickly */}
      <SceneWrapper className="items-center justify-center opacity-80 mix-blend-multiply dark:mix-blend-screen text-center">
        <div className="max-w-screen-xl mx-auto flex flex-wrap justify-center gap-8 md:gap-16 opacity-30 select-none pointer-events-none blur-sm">
          {['Broker Fees', 'Unsafe Areas', 'No Privacy', 'Scams', 'Lost Deposits', 'Bad Roommates'].map((item, i) => (
            <span key={i} className="text-4xl md:text-6xl font-bold font-display text-stone-300 dark:text-midnight-700">
              {item}
            </span>
          ))}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <CinematicText content="Finding a home shouldn't be a battle." type="body" className="font-medium text-2xl !text-stone-900 dark:!text-midnight-100" />
        </div>
      </SceneWrapper>

      {/* Scene 3: The Philosophy */}
      <SceneWrapper className="items-start text-left bg-stone-100/50 dark:bg-midnight-900/50 backdrop-blur-sm border-y border-stone-200/50 dark:border-midnight-800/50">
        <div className="container-cinema grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <CinematicText type="label" content="THE PHILOSOPHY" />
            <CinematicText
              type="heading"
              content="StayMate is the ecosystem for trust."
            />
          </div>
          <div className="py-12">
            <CinematicText
              type="body"
              content="We believe certainty is the ultimate luxury. Start with verified people, connect through secure channels, and live with clarity. No brokers, no hidden clauses."
              delay={0.2}
            />
          </div>
        </div>
      </SceneWrapper>
    </div>
  )
}
