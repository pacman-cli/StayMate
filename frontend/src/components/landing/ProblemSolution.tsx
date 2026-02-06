"use client"

import { motion } from "framer-motion"
import { Check, X } from "lucide-react"

const problems = [
  "Hidden broker fees & commissions",
  "Fake photos vs reality",
  "Unresponsive landlords",
  "Cash-only shady deals"
]

const solutions = [
  "Zero brokerage, transparent pricing",
  "100% Verified listings only",
  "Direct chat with hosts",
  "Secure digital payments"
]

export default function ProblemSolution() {
  return (
    <section className="py-24 bg-stone-100 dark:bg-black">
      <div className="container-cinema mx-auto px-6">

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">

          {/* The Old Way (Problem) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative p-10 rounded-3xl bg-stone-200/50 dark:bg-stone-900/50 border border-stone-300 dark:border-stone-800"
          >
            <h3 className="text-2xl font-display font-bold text-stone-900 dark:text-stone-400 mb-8">
              The Rental Nightmare
            </h3>
            <ul className="space-y-6">
              {problems.map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-stone-600 dark:text-stone-500 font-medium">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-500">
                    <X className="w-5 h-5" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* The StayMate Way (Solution) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative p-10 rounded-3xl bg-white dark:bg-midnight-900 border border-electric-200 dark:border-electric-900 shadow-2xl shadow-electric-500/10"
          >
            <div className="absolute top-0 right-0 p-4">
              <span className="px-3 py-1 rounded-full bg-electric-100 dark:bg-electric-900/50 text-electric-600 dark:text-electric-400 text-xs font-bold uppercase tracking-widest">
                The StayMate Way
              </span>
            </div>

            <h3 className="text-3xl font-display font-bold text-stone-900 dark:text-electric-400 mb-8">
              A Better Reality
            </h3>
            <ul className="space-y-6">
              {solutions.map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-stone-900 dark:text-white font-semibold text-lg">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-electric-100 dark:bg-electric-500/20 flex items-center justify-center text-electric-600 dark:text-electric-400">
                    <Check className="w-5 h-5" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

        </div>

      </div>
    </section>
  )
}
