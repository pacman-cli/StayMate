'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import CinematicText from '../cinematic/CinematicText'
import SceneWrapper from '../cinematic/SceneWrapper'
import MagneticButton from '../ui/MagneticButton'

export default function SceneResolution() {
  return (
    <div className="relative">
      {/* Scene 8: The Numbers - Minimalist */}
      <SceneWrapper className="items-center justify-center min-h-[50vh]">
        <div className="flex gap-12 md:gap-32 text-center">
          {[
            { val: '5k+', label: 'Citizens' },
            { val: '98%', label: 'Safety Score' },
            { val: '0', label: 'Hidden Fees' }
          ].map((stat, i) => (
            <div key={i}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: i * 0.2 }}
                className="text-5xl md:text-8xl font-display font-light text-stone-900 dark:text-midnight-50"
              >
                {stat.val}
              </motion.div>
              <div className="text-xs font-mono uppercase tracking-widest text-stone-400 dark:text-midnight-500 mt-4">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </SceneWrapper>

      {/* Scene 9: Stories (Atmospheric Quote) */}
      <SceneWrapper className="items-center justify-center min-h-[60vh] bg-stone-100 dark:bg-midnight-900">
        <blockquote className="max-w-4xl text-center px-6">
          <CinematicText
            type="heading"
            content='"I stopped feeling like a tenant and started feeling like I belonged."'
            className="text-3xl md:text-5xl italic leading-tight mb-8 !font-light"
          />
          <CinematicText
            type="label"
            content="— SARAH K., DHAKA"
            className="opacity-50"
          />
        </blockquote>
      </SceneWrapper>

      {/* Scene 10 & 11: Vision & CTA */}
      <SceneWrapper className="items-center justify-center min-h-[90vh]">
        <div className="text-center">
          <CinematicText type="label" content="THE RESOLUTION" className="mb-8" />

          <h2 className="text-display text-5xl md:text-7xl lg:text-9xl mb-12 text-stone-900 dark:text-midnight-50 tracking-tighter">
            Begin your journey.
          </h2>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <MagneticButton variant="primary" className="bg-lux-indigo hover:bg-lux-violet text-white px-12 py-6 text-xl rounded-full shadow-glow-lg">
              Enter StayMate <ArrowRight className="ml-3 w-6 h-6" />
            </MagneticButton>
          </motion.div>

          <div className="mt-12 flex justify-center gap-8 text-sm text-stone-400 dark:text-midnight-600 font-medium">
            <span className="cursor-pointer hover:text-stone-900 dark:hover:text-midnight-200 transition-colors">Instagram</span>
            <span className="cursor-pointer hover:text-stone-900 dark:hover:text-midnight-200 transition-colors">Twitter</span>
            <span className="cursor-pointer hover:text-stone-900 dark:hover:text-midnight-200 transition-colors">Manifesto</span>
          </div>
        </div>

        {/* Final Ambient Glow */}
        <div className="absolute bottom-0 left-0 w-full h-[50vh] bg-gradient-to-t from-stone-200/50 dark:from-lux-indigo/10 to-transparent -z-10 pointer-events-none" />
      </SceneWrapper>
    </div>
  )
}
