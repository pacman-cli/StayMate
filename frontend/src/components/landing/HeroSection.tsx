'use client'

import { ArrowRight, ShieldCheck } from 'lucide-react'
import AnimatedBackground from '../ui/AnimatedBackground'
import MagneticButton from '../ui/MagneticButton'
import Reveal from '../ui/Reveal'

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
      <AnimatedBackground />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto space-y-8">

          {/* Trust Pill */}
          <Reveal direction="down" delay={0.1}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-sm font-medium text-slate-600 dark:text-slate-300 mb-4 animate-fade-in">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              Trusted by 5,000+ Students in Dhaka
            </div>
          </Reveal>

          {/* Hero Headline */}
          <Reveal delay={0.2} className="w-full">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-slate-900 dark:text-white text-balance leading-[1.1]">
              Finding a home <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-violet-600 dark:from-primary-400 dark:to-violet-400">
                shouldn't feel risky.
              </span>
            </h1>
          </Reveal>

          {/* Subheadline */}
          <Reveal delay={0.3} className="w-full">
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              StayMate is the safest way to find roommates and rentals in Bangladesh.
              Verified profiles, secure payments, and zero headaches.
            </p>
          </Reveal>

          {/* CTAs */}
          <Reveal delay={0.4} className="w-full">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
              <MagneticButton variant="primary" className="w-full sm:w-auto min-w-[160px] h-14 text-lg">
                Find a Room
                <ArrowRight className="ml-2 w-5 h-5" />
              </MagneticButton>

              <MagneticButton variant="secondary" className="w-full sm:w-auto min-w-[160px] h-14 text-lg">
                List Property
              </MagneticButton>
            </div>
          </Reveal>

          {/* Trust Badges */}
          <Reveal delay={0.5} width="100%">
            <div className="flex flex-wrap items-center justify-center gap-6 mt-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Placeholder generic logos effectively - can replace with SVGs later */}
              {['Secure ID', 'No Brokers', 'Fast Support', 'Verified'].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  <ShieldCheck className="w-5 h-5" />
                  {item}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50 dark:opacity-30">
        <div className="w-6 h-10 border-2 border-current rounded-full flex justify-center p-1">
          <div className="w-1 h-3 bg-current rounded-full" />
        </div>
      </div>
    </section>
  )
}
