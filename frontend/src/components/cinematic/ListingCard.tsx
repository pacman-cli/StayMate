'use client'

import { motion } from 'framer-motion'
import { MapPin, Star, User } from 'lucide-react'

interface ListingProps {
  title: string
  price: string
  location: string
  rating: number
  image: string
  category: string
}

export default function ListingCard({ data }: { data: ListingProps }) {
  return (
    <motion.div
      whileHover={{ y: -10, scale: 1.02 }}
      className="group relative flex-shrink-0 w-[300px] md:w-[350px] aspect-[4/5] rounded-2xl overflow-hidden glass-cinema border border-stone-200/50 dark:border-midnight-800/50 cursor-pointer"
    >
      {/* Image Layer */}
      <div className="absolute inset-0 bg-stone-900/10 dark:bg-midnight-950/20 z-0 transition-opacity duration-500 group-hover:opacity-0" />
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${data.image})` }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 w-full p-6 z-30 text-white transform-gpu">
        <div className="flex justify-between items-start mb-2">
          <span className="bg-lux-indigo/90 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
            {data.category}
          </span>
          <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded-lg">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-medium">{data.rating}</span>
          </div>
        </div>

        <h3 className="font-display text-2xl font-bold mb-1 leading-tight group-hover:text-lux-glow transition-colors">
          {data.title}
        </h3>

        <div className="flex items-center gap-1 text-stone-300 text-sm mb-4">
          <MapPin className="w-3 h-3" />
          {data.location}
        </div>

        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-stone-200/20 flex items-center justify-center">
              <User className="w-3 h-3" />
            </div>
            <span className="text-xs text-stone-300">Verified Host</span>
          </div>
          <div className="text-lg font-bold font-mono">
            {data.price}<span className="text-xs font-normal text-stone-400">/mo</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
