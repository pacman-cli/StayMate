"use client"

import { motion } from "framer-motion"
import { Quote, Star } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Grad Student @ Stanford",
    quote: "StayMate saved me from a nightmare housing situation. The verified badge actually means something.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150"
  },
  {
    name: "Marcus Rodriguez",
    role: "Digital Nomad",
    quote: "I book completely online now. No more awkward tours or cash scams. It's just clean and simple.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150"
  },
  {
    name: "Emily Watson",
    role: "Remote Developer",
    quote: "The payment system is flawless. My landlord gets paid on time, and I get a receipt instantly.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150"
  }
]

export default function Testimonials() {
  return (
    <section className="py-24 bg-stone-50 dark:bg-midnight-950 overflow-hidden">
      <div className="container-cinema mx-auto px-6">

        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-stone-900 dark:text-white mb-6">
            Loved by thousands.
          </h2>
          <p className="text-lg text-stone-600 dark:text-stone-400">
            Join a community of students and professionals who found their perfect space.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.6 }}
              className="relative p-8 rounded-3xl bg-white dark:bg-midnight-900 border border-stone-100 dark:border-white/5 shadow-xl shadow-stone-200/50 dark:shadow-none hover:-translate-y-2 transition-transform duration-300"
            >
              <Quote className="absolute top-8 right-8 w-8 h-8 text-electric-500/20 fill-current" />

              <div className="flex items-center gap-1 text-orange-400 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>

              <p className="text-lg text-stone-700 dark:text-stone-300 leading-relaxed mb-8">
                "{t.quote}"
              </p>

              <div className="flex items-center gap-4">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-electric-500/20"
                />
                <div>
                  <div className="font-bold text-stone-900 dark:text-white">{t.name}</div>
                  <div className="text-xs font-mono uppercase tracking-widest text-stone-500 dark:text-stone-500">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
