'use client'

import CinematicText from '../cinematic/CinematicText'
import InfiniteMarquee from '../cinematic/InfiniteMarquee'
import ListingCard from '../cinematic/ListingCard'
import SceneWrapper from '../cinematic/SceneWrapper'

const listingsRow1 = [
  { title: "Skyline Haven", price: "25k", location: "Banani, Dhaka", rating: 4.9, image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800", category: "Premium" },
  { title: "Artist Loft", price: "18k", location: "Dhanmondi", rating: 4.7, image: "https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&q=80&w=800", category: "Creative" },
  { title: "The Glass House", price: "45k", location: "Gulshan 2", rating: 5.0, image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800", category: "Luxury" },
  { title: "Garden Suite", price: "22k", location: "Bashundhara", rating: 4.8, image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=800", category: "Green" },
]

const listingsRow2 = [
  { title: "Minimalist Studio", price: "15k", location: "Mirpur DOHS", rating: 4.6, image: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&q=80&w=800", category: "Budget" },
  { title: "Executive Pad", price: "35k", location: "Baridhara", rating: 4.9, image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&q=80&w=800", category: "Business" },
  { title: "Lakeside View", price: "28k", location: "Uttara", rating: 4.8, image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800", category: "Scenic" },
  { title: "Co-Living Hub", price: "12k", location: "Mohammadpur", rating: 4.5, image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800", category: "Community" },
]

export default function SceneLivingSpaces() {
  return (
    <SceneWrapper className="overflow-hidden min-h-[140vh] py-20">
      <div className="container-cinema relative z-10 mb-12 text-center">
        <CinematicText type="label" content="LIVE FEED" />
        <CinematicText type="heading" content="Sanctuaries. Verified." />
      </div>

      <div className="flex flex-col gap-32 rotate-[-1deg] scale-100 origin-center my-auto">
        {/* Row 1: Slow Drift Right */}
        <InfiniteMarquee baseVelocity={-2} className="py-8">
          {listingsRow1.map((item, i) => (
            <ListingCard key={i} data={item} />
          ))}
        </InfiniteMarquee>

        {/* Row 2: Slow Drift Left */}
        <InfiniteMarquee baseVelocity={2} className="py-8">
          {listingsRow2.map((item, i) => (
            <ListingCard key={i} data={item} />
          ))}
        </InfiniteMarquee>
      </div>

      <div className="container-cinema mt-20 text-center relative z-10">
        <p className="text-stone-500 dark:text-midnight-400 font-mono text-xs uppercase tracking-widest animate-pulse">
          ● Live Listings from Dhaka
        </p>
      </div>
    </SceneWrapper>
  )
}
