'use client'

import { BadgeCheck, MessageSquare, Shield, Users } from 'lucide-react'
import Reveal from '../ui/Reveal'
import FeatureCard from './FeatureCard'

const features = [
  {
    title: "Verified Roommates",
    description: "No more creepy strangers. We verify every user with detailed ID checks and social referencing so you can live with peace of mind.",
    icon: Shield
  },
  {
    title: "Smart Matching",
    description: "Our algorithm matches you based on lifestyle, habits, and preferences. Night owl? Early riser? We find your people.",
    icon: Users
  },
  {
    title: "Instant Chat",
    description: "Connect safely without sharing your phone number. Schedule viewings and discuss house rules directly in the app.",
    icon: MessageSquare
  }
]

export default function FeatureSection() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6">

        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <Reveal>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white tracking-tight">
              Everything you need to <br />
              <span className="text-primary-600 dark:text-primary-400">live better together.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              We've rethought the entire roommate finding experience to focus on what matters: trust, compatibility, and simplicity.
            </p>
          </Reveal>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              index={index}
              {...feature}
            />
          ))}
        </div>

        {/* Alternating Feature Block 1 */}
        <div className="mt-32 flex flex-col md:flex-row items-center gap-12 md:gap-24">
          <div className="flex-1 order-2 md:order-1 relative">
            {/* Abstract Shape/Image Placeholder */}
            <Reveal direction="right">
              <div className="aspect-square rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 relative overflow-hidden flex items-center justify-center group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <BadgeCheck className="w-32 h-32 text-slate-300 dark:text-slate-600 group-hover:text-primary-500/50 transition-colors duration-500" />
                <div className="absolute bottom-6 left-6 right-6 p-4 glass-panel rounded-lg shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">ID Verified</p>
                      <p className="text-xs text-slate-500">Government issued ID check passed</p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="flex-1 order-1 md:order-2">
            <Reveal direction="left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 text-sm font-medium mb-6">
                <Shield className="w-4 h-4" /> Safety First
              </div>
              <h3 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900 dark:text-white">
                Real people, <br /> real verification.
              </h3>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                We don't just take people's word for it. Our multi-step verification process ensures that the person you're talking to is exactly who they say they are.
              </p>
              <ul className="space-y-4">
                {['National ID Verification', 'Phone Number Verification', 'Social Media Linking'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 text-xs font-bold">
                      {i + 1}
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
