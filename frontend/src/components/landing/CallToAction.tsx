"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export default function CallToAction() {
  return (
    <section className="py-32 bg-stone-50 dark:bg-midnight-950 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="container-cinema mx-auto px-6"
      >
        <div className="relative rounded-[3rem] overflow-hidden bg-gradient-to-br from-electric-600 to-lux-indigo p-12 md:p-24 text-center">

          {/* Abstract Background Shapes */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-sky-400/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2 pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-8 tracking-tight">
              Your next stay is just <br /> one click away.
            </h2>
            <p className="text-lg md:text-xl text-white/80 mb-12">
              Join thousands of verified users today and experience the new standard of rental living. No fees, no fuss.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-electric-600 bg-white rounded-full hover:bg-stone-100 hover:scale-105 transition-all duration-300 shadow-xl"
              >
                Create Free Account
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>

            <p className="mt-8 text-sm text-white/60 font-mono uppercase tracking-widest">
              No credit card required • Cancel anytime
            </p>
          </div>

        </div>
      </motion.div>
    </section>
  )
}
