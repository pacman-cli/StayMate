"use client"

import { motion } from "framer-motion"

const stats = [
  { value: "10k+", label: "Verified Stays" },
  { value: "100+", label: "Cities Covered" },
  { value: "4.8", label: "Average Rating" },
  { value: "24/7", label: "Support Team" },
]

const brands = [
  "MIT", "Stanford", "Airbnb", "Booking.com", "Y Combinator"
] // Placeholders for now

export default function TrustSignals() {
  return (
    <section className="py-20 bg-stone-50 dark:bg-midnight-950 border-y border-stone-200 dark:border-white/10">
      <div className="container-cinema mx-auto px-6">

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-display font-bold text-stone-900 dark:text-white mb-2">
                {stat.value}
              </div>
              <div className="text-sm font-mono uppercase tracking-widest text-stone-500 dark:text-stone-400">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Logos Row */}
        <div className="text-center">
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-8 uppercase tracking-widest font-mono">
            Trusted by students & travelers from
          </p>
          <div className="flex flex-wrap justify-center gap-12 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Using text placeholders style as logos for now */}
            {brands.map((brand, i) => (
              <span key={i} className="text-xl md:text-2xl font-display font-semibold text-stone-800 dark:text-white cursor-default">
                {brand}
              </span>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
