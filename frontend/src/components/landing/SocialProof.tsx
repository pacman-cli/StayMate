'use client'

import Reveal from '../ui/Reveal'
import StatsCard from './StatsCard'

const stats = [
  {
    value: 1200,
    suffix: "+",
    label: "Matches Made",
    description: "Happy roommates connected"
  },
  {
    value: 450,
    suffix: "",
    label: "Verified Listings",
    description: "Across Dhaka & Sylhet"
  },
  {
    value: 98,
    suffix: "%",
    label: "Safety Score",
    description: "Based on user feedback"
  },
  {
    value: 24,
    suffix: "/7",
    label: "Support",
    description: "Real humans, not bots"
  }
]

export default function SocialProof() {
  return (
    <section className="py-24 border-y border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-200 dark:divide-slate-800">
            {stats.map((stat, index) => (
              <div key={index} className={index % 2 !== 0 ? "pl-8" : ""}>
                <StatsCard
                  {...stat}
                  delay={index * 0.1}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Trust Statement */}
        <div className="text-center mt-16">
          <Reveal delay={0.4}>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-6">
              Verified & Trusted By
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Text Placeholders for Brand Logos */}
              <div className="text-xl font-bold font-heading text-slate-800 dark:text-slate-200">DHAKA<span className="text-primary-600">LIVING</span></div>
              <div className="text-xl font-bold font-heading text-slate-800 dark:text-slate-200">NEXT<span className="text-slate-400">HOME</span></div>
              <div className="text-xl font-bold font-heading text-slate-800 dark:text-slate-200">SAFE<span className="text-green-500">STAY</span></div>
              <div className="text-xl font-bold font-heading text-slate-800 dark:text-slate-200">BANGLA<span className="text-red-500">HOUSING</span></div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
