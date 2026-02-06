"use client"

import { motion } from "framer-motion"
import { ArrowRight, CheckCircle, Play } from "lucide-react"
import Link from "next/link"

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Gradient Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-lux-indigo/10 rounded-full blur-[120px] transform translate-x-1/3 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-electric-500/10 rounded-full blur-[100px] transform -translate-x-1/3 translate-y-1/4" />
      </div>

      <div className="container-cinema w-full grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

        {/* Left Column: Content */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-start text-left z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-100/50 dark:bg-white/5 border border-stone-200/50 dark:border-white/10 backdrop-blur-sm mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-electric-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-electric-500"></span>
            </span>
            <span className="text-sm font-medium text-stone-600 dark:text-stone-300">Live in 100+ cities</span>
          </div>

          <h1 className="text-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-stone-900 dark:text-white leading-[1.05] mb-6">
            Find your next <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-electric-600 dark:from-electric-400 dark:to-electric-500">
              stay
            </span> without <br />
            the stress.
          </h1>

          <p className="text-lg md:text-xl text-stone-600 dark:text-stone-400 max-w-lg mb-10 leading-relaxed">
            StayMate connects students and professionals with verified hosts. No hidden fees, no fake listings, just seamless moving.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link
              href="/register"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white transition-all duration-200 bg-gradient-to-r from-electric-600 to-lux-indigo rounded-full hover:shadow-lg hover:shadow-electric-500/25 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-electric-500"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <button className="group inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-stone-900 dark:text-white transition-all duration-200 bg-transparent border border-stone-200 dark:border-white/10 rounded-full hover:bg-stone-50 dark:hover:bg-white/5">
              <Play className="mr-2 w-5 h-5 fill-current opacity-80" />
              See How It Works
            </button>
          </div>

          <div className="mt-10 flex items-center gap-6 text-sm text-stone-500 dark:text-stone-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-electric-500" />
              <span>Verified Listings</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-electric-500" />
              <span>Secure Payments</span>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Visual Component */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative lg:h-[800px] flex items-center justify-center z-0 hidden lg:flex"
        >
          {/* Abstract Phone Mockup / Card */}
          <div className="relative w-[400px] h-[700px] rounded-[3rem] border-[8px] border-stone-900 dark:border-stone-800 bg-stone-100 dark:bg-midnight-900 overflow-hidden shadow-2xl shadow-electric-500/10 rotate-[-6deg] hover:rotate-0 transition-transform duration-700 ease-out">
            {/* Mock UI Content */}
            <div className="absolute inset-0 bg-stone-50 dark:bg-midnight-950 flex flex-col">
              <div className="h-40 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop")' }}></div>
              <div className="p-6">
                <div className="h-4 w-24 bg-electric-500/20 rounded mb-4"></div>
                <div className="h-8 w-48 bg-stone-200 dark:bg-stone-800 rounded mb-2"></div>
                <div className="h-4 w-full bg-stone-100 dark:bg-stone-900 rounded mb-6"></div>

                <div className="flex justify-between items-center mt-4">
                  <span className="text-2xl font-bold dark:text-white">$1,200<span className="text-sm text-stone-500 font-normal">/mo</span></span>
                  <button className="px-4 py-2 bg-stone-900 dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium">Book Now</button>
                </div>
              </div>

              {/* Floating Elements (Notifications) */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute bottom-24 left-6 right-6 p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-bold dark:text-white">Booking Confirmed!</div>
                    <div className="text-xs text-white/60">You're moving in.</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-1/2 right-0 transform translate-x-12 -translate-y-1/2 bg-white dark:bg-stone-900 p-4 rounded-2xl shadow-xl flex flex-col gap-4 animate-float">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-stone-900 bg-stone-200 dark:bg-stone-800" />
              ))}
            </div>
            <div className="text-center font-mono text-xs text-stone-500">1k+ Happy Students</div>
          </div>

        </motion.div>
      </div>
    </section>
  )
}
