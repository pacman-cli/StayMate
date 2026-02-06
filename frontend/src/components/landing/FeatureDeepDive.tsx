"use client"

import { motion } from "framer-motion"
import { Heart, MapPin, MessageCircle, Search, Shield } from "lucide-react"
import { ReactNode } from "react"

interface FeatureCardProps {
  icon: ReactNode
  title: string
  desc: string
  delay: number
}

const FeatureCard = ({ icon, title, desc, delay }: FeatureCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ y: -8 }}
    className="group p-8 rounded-3xl bg-white dark:bg-midnight-900 border border-stone-100 dark:border-white/5 hover:border-electric-200 dark:hover:border-electric-800 shadow-xl shadow-stone-200/50 dark:shadow-none transition-all duration-300"
  >
    <div className="w-12 h-12 rounded-2xl bg-stone-50 dark:bg-white/5 group-hover:bg-electric-500/10 flex items-center justify-center text-stone-900 dark:text-white group-hover:text-electric-600 dark:group-hover:text-electric-400 transition-colors mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-3 group-hover:text-electric-600 dark:group-hover:text-electric-400 transition-colors">
      {title}
    </h3>
    <p className="text-stone-600 dark:text-stone-400 group-hover:text-stone-500 dark:group-hover:text-stone-300">
      {desc}
    </p>
  </motion.div>
)

const features = [
  {
    icon: <Search className="w-6 h-6" />,
    title: "Smart Search",
    desc: "Filter by price, location, amenities, and roommate vibes."
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Verified Hosts",
    desc: "Every listing is manually verified to prevent scams."
  },
  {
    icon: <MapPin className="w-6 h-6" />,
    title: "Interactive Maps",
    desc: "See commute times and neighborhood scores instantly."
  },
  {
    icon: <MessageCircle className="w-6 h-6" />,
    title: "Direct Chat",
    desc: "Connect with landlords and roommates before you book."
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: "Roommate Matching",
    desc: "Find people who match your lifestyle and habits."
  },
  {
    icon: <Shield className="w-6 h-6" />, // Using shield as placeholder for payments
    title: "Secure Payments",
    desc: "Pay rent online with auto-receipts and rental agreements."
  }
]

export default function FeatureDeepDive() {
  return (
    <section className="py-32 bg-stone-50 dark:bg-midnight-950">
      <div className="container-cinema mx-auto px-6">

        <div className="flex flex-col md:flex-row justify-between items-end mb-20">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-stone-900 dark:text-white mb-6">
              Everything you need <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-electric-600">to find home.</span>
            </h2>
            <p className="text-lg text-stone-600 dark:text-stone-400">
              We've rethought the entire rental experience from the ground up.
            </p>
          </div>

          <button className="hidden md:flex items-center gap-2 px-6 py-3 rounded-full bg-stone-100 dark:bg-white/5 border border-stone-200 dark:border-white/10 hover:bg-stone-200 dark:hover:bg-white/10 transition-colors">
            View all features
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <FeatureCard key={i} {...f} delay={i * 0.1} />
          ))}
        </div>

      </div>
    </section>
  )
}
