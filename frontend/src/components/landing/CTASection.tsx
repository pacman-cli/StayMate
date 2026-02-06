'use client'

import { ArrowRight } from 'lucide-react'
import MagneticButton from '../ui/MagneticButton'
import Reveal from '../ui/Reveal'

export default function CTASection() {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-primary-600 dark:bg-primary-900 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.4),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.4),transparent_60%)]" />
        <div className="absolute inset-0 bg-black/10 dark:bg-black/40 backdrop-blur-[1px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
        <Reveal>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight max-w-4xl mx-auto">
            Ready to find your place?
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto mb-12 font-medium">
            Join thousands of others who found their perfect home and roommates through StayMate. Safe, simple, and free to start.
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <MagneticButton variant="primary" className="bg-white text-primary-700 hover:bg-slate-50 border-transparent shadow-xl w-full sm:w-auto min-w-[200px] h-14 text-lg font-bold">
              Get Started Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </MagneticButton>
          </div>
          <p className="mt-6 text-sm text-primary-200/80">
            No credit card required. Verified users only.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
