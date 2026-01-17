"use client"

import Avatar from "@/components/common/Avatar"
import PublicPageLayout from "@/components/PublicPageLayout"
import { useTheme } from "@/context/ThemeContext"
import { Star } from "lucide-react"

export default function TestimonialsPage() {
  const { isDark } = useTheme()

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "University Student",
      content: "Found my perfect roommate within 2 days! The compatibility score was spot on. We successfully secured a 2-bedroom apartment near campus."
    },
    {
      name: "Michael Ross",
      role: "Software Engineer",
      content: "As a landlord, StayMate makes managing my properties incredibly easy. The tenant verification feature gives me peace of mind."
    },
    {
      name: "Jessica Alverez",
      role: "Graphic Designer",
      content: "The user interface is beautiful and so easy to use. I love the map view search, it made finding a place in my preferred neighborhood effortless."
    },
    {
      name: "David Kim",
      role: "Master's Student",
      content: "Moving to a new city was scary, but StayMate helped me find a safe and affordable room. Highly matching algorithm is a game changer."
    }
  ]

  return (
    <PublicPageLayout
      title="Trusted by Students & Professionals"
      subtitle="See what our community has to say about their experience with StayMate."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((item, idx) => (
          <div
            key={idx}
            className={`p-6 rounded-2xl border transition-all hover:scale-[1.01] ${isDark
              ? "bg-white/5 border-white/10"
              : "bg-white border-slate-200 shadow-sm"
              }`}
          >
            <div className="flex items-center gap-4 mb-4">
              <Avatar name={item.name} size="lg" />
              <div>
                <h3 className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                  {item.name}
                </h3>
                <p className="text-xs text-slate-500">{item.role}</p>
              </div>
              <div className="ml-auto flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                ))}
              </div>
            </div>
            <p className={`italic leading-relaxed text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              "{item.content}"
            </p>
          </div>
        ))}
      </div>
    </PublicPageLayout>
  )
}
