'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, MapPin, Star } from 'lucide-react'
import Reveal from '../ui/Reveal'

export default function DemoPreview() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Reveal>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white tracking-tight">
              Your new home base.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Manage everything from one beautiful, intuitive dashboard.
              Chat, payments, and agreements—all in one place.
            </p>
          </Reveal>
        </div>

        <div className="relative max-w-6xl mx-auto perspective-1000">
          {/* Main Interface Mockup */}
          <Reveal delay={0.2} direction="up" className="perspective-1000">
            <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden transform-gpu rotate-x-12 hover:rotate-x-0 transition-transform duration-700 ease-out">

              {/* Mock Header */}
              <div className="h-14 border-b border-slate-100 dark:border-slate-800 flex items-center px-6 justify-between bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                </div>
                <div className="h-8 w-64 bg-slate-100 dark:bg-slate-800 rounded-lg mx-auto" />
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700" />
              </div>

              {/* Mock Content Layout */}
              <div className="p-6 grid grid-cols-12 gap-6 min-h-[600px] bg-slate-50/50 dark:bg-slate-950/50">

                {/* Sidebar */}
                <div className="col-span-3 hidden md:flex flex-col gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 w-full rounded-lg bg-slate-200/50 dark:bg-slate-800/50 animate-pulse-slow" style={{ animationDelay: `${i * 100}ms` }} />
                  ))}
                </div>

                {/* Main Feed */}
                <div className="col-span-12 md:col-span-6 flex flex-col gap-6">
                  {/* Card 1 */}
                  <div className="p-5 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex gap-4 mb-4">
                      <div className="w-16 h-16 rounded-lg bg-slate-200 dark:bg-slate-700" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-3 w-1/2 bg-slate-100 dark:bg-slate-800 rounded" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 size={12} /> Verified
                      </div>
                      <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1">
                        <MapPin size={12} /> Dhaka
                      </div>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="p-5 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 opacity-80">
                    <div className="flex gap-4 mb-4">
                      <div className="w-16 h-16 rounded-lg bg-slate-200 dark:bg-slate-700" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-3 w-1/3 bg-slate-100 dark:bg-slate-800 rounded" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Panel */}
                <div className="col-span-3 hidden md:flex flex-col gap-6">
                  <div className="aspect-square rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 p-6 text-white flex flex-col justify-between shadow-lg shadow-primary-500/20">
                    <Star className="w-8 h-8 opacity-80" />
                    <div>
                      <div className="text-3xl font-bold">4.9</div>
                      <div className="text-sm opacity-80">Average Match Rating</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gradient Overlay for Fade Effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 via-transparent to-transparent opacity-20 pointer-events-none" />
            </div>
          </Reveal>

          {/* Floating Elements */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="absolute -left-4 top-1/3 p-4 glass-card bg-white/90 dark:bg-slate-800/90 shadow-xl z-20 hidden lg:block"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-white">Match Found!</div>
                <div className="text-xs text-slate-500">98% Compatibility</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx global>{`
                .perspective-1000 {
                    perspective: 1000px;
                }
                .rotate-x-12 {
                    transform: rotateX(12deg) scale(0.95);
                }
                .rotate-x-0 {
                    transform: rotateX(0deg) scale(1);
                }
            `}</style>
    </section>
  )
}
