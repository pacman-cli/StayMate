import { ArrowRight, LucideIcon } from "lucide-react"
import Link from "next/link"

interface ActionCardProps {
 title: string
 description: string
 icon: LucideIcon
 href: string
 color: "blue" | "emerald" | "purple" | "orange" | "red"
 isDark: boolean
}

export function ActionCard({
 title,
 description,
 icon: Icon,
 href,
 color,
 isDark
}: ActionCardProps) {
 const colorStyles = {
  blue: { gradient: "from-blue-500/20 to-cyan-500/20", icon: "text-blue-500", bg: "bg-blue-500/10" },
  emerald: { gradient: "from-emerald-500/20 to-teal-500/20", icon: "text-emerald-500", bg: "bg-emerald-500/10" },
  purple: { gradient: "from-purple-500/20 to-pink-500/20", icon: "text-purple-500", bg: "bg-purple-500/10" },
  orange: { gradient: "from-orange-500/20 to-amber-500/20", icon: "text-orange-500", bg: "bg-orange-500/10" },
  red: { gradient: "from-red-500/20 to-rose-500/20", icon: "text-red-500", bg: "bg-red-500/10" }
 }

 const style = colorStyles[color]

 return (
  <Link
   href={href}
   className={`group relative overflow-hidden p-6 rounded-2xl border transition-all duration-300 ${isDark
     ? "bg-slate-900/50 border-white/10 hover:border-white/20"
     : "bg-white border-slate-100 hover:shadow-lg"
    }`}
  >
   <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${style.gradient} rounded-bl-full opacity-50 transition-opacity group-hover:opacity-70`} />

   <div className="relative z-10">
    <div className={`w-12 h-12 rounded-xl ${style.bg} ${style.icon} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
     <Icon className="w-6 h-6" />
    </div>

    <h3 className={`text-lg font-semibold mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>
     {title}
    </h3>
    <p className={`text-sm mb-4 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
     {description}
    </p>

    <div className={`flex items-center text-sm font-medium ${style.icon}`}>
     <span>Action</span>
     <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
    </div>
   </div>
  </Link>
 )
}
