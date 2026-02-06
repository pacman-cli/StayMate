"use client"

import { motion } from "framer-motion"

const steps = [
  {
    num: "01",
    title: "Search & Discover",
    desc: "Browse verified listings by city, college, or workplace.",
  },
  {
    num: "02",
    title: "Compare & Chat",
    desc: "Talk to landlords and potential roommates directly.",
  },
  {
    num: "03",
    title: "Book Securely",
    desc: "Pay the deposit online and get an instant digital agreement.",
  },
  {
    num: "04",
    title: "Move In",
    desc: "Pack your bags. Your new home is ready for you.",
  },
]

export default function HowItWorks() {
  return (
    <section className="py-24 bg-stone-100 dark:bg-black overflow-hidden">
      <div className="container-cinema mx-auto px-6">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <span className="text-electric-500 font-mono text-sm uppercase tracking-widest block mb-4">
            Simple & Fast
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-stone-900 dark:text-white">
            From search to keys <br /> in 4 simple steps.
          </h2>
        </motion.div>

        <div className="relative grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-12 left-0 right-0 h-[2px] bg-stone-300 dark:bg-stone-800 -z-0" />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.6 }}
              className="relative z-10"
            >
              <div className="flex items-center justify-center w-24 h-24 rounded-full bg-white dark:bg-midnight-900 border-[6px] border-stone-100 dark:border-black text-3xl font-display font-bold text-electric-600 dark:text-electric-400 mb-8 shadow-lg">
                {step.num}
              </div>

              <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-4">
                {step.title}
              </h3>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed pr-4">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
