"use client"

import { motion } from "framer-motion"
import { useRef } from "react"

// Mock Images for the carousel
const images = [
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2653&auto=format&fit=crop", // Elegant Living Room
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670&auto=format&fit=crop", // Modern Kitchen
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=2670&auto=format&fit=crop", // Cozy Bedroom
]

export default function AppShowcase() {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <section className="py-32 bg-stone-900 dark:bg-black text-white overflow-hidden">
      <div className="container-cinema mx-auto px-6 mb-16 flex flex-col items-center text-center">
        <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">
          Designed for <span className="text-electric-400">modern living.</span>
        </h2>
        <p className="text-lg text-stone-400 max-w-2xl">
          A seamless experience on web and mobile. Browse beautiful stays in high-resolution detail.
        </p>
      </div>

      {/* Infinite Scroll / Marquee Horizontal */}
      <div className="relative w-full overflow-hidden">
        <div className="flex gap-8 px-4 animate-scroll-slow">
          {/* Duplicating array for infinite effect */}
          {[...images, ...images, ...images].map((src, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className="relative flex-shrink-0 w-[300px] md:w-[500px] aspect-[4/3] rounded-3xl overflow-hidden border-[6px] border-stone-800 shadow-2xl cursor-pointer"
            >
              <img
                src={src}
                alt="App Screenshot"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-6 left-6">
                  <div className="text-lg font-bold">Luxury Penthouse</div>
                  <div className="text-sm text-stone-300">$2,400/mo • New York</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Fade overlay edges */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-stone-900 via-stone-900/80 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-stone-900 via-stone-900/80 to-transparent pointer-events-none" />
      </div>

    </section>
  )
}
