import { LucideIcon } from "lucide-react"

interface QuickStatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  color: "blue" | "emerald" | "purple" | "orange" | "red" | "pink"
  trend?: string
  isDark: boolean
  onClick?: () => void
}

export function QuickStatCard({
  label,
  value,
  icon: Icon,
  color,
  trend,
  isDark,
  onClick
}: QuickStatCardProps) {
  const colorStyles = {
    blue: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20" },
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20" },
    purple: { bg: "bg-purple-500/10", text: "text-purple-500", border: "border-purple-500/20" },
    orange: { bg: "bg-orange-500/10", text: "text-orange-500", border: "border-orange-500/20" },
    red: { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/20" },
    pink: { bg: "bg-pink-500/10", text: "text-pink-500", border: "border-pink-500/20" }
  }

  const style = colorStyles[color]

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-2xl border transition-all duration-300 ${isDark
        ? "bg-dark-800 border-dark-700 hover:bg-dark-750"
        : "bg-white border-slate-100 hover:bg-slate-50"
        } ${onClick ? "cursor-pointer" : ""} hover:shadow-elevation-low`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${style.bg} ${style.text}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${isDark ? "bg-white/5 text-slate-400" : "bg-slate-100 text-slate-500"
            }`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <h3 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
          {value}
        </h3>
        <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          {label}
        </p>
      </div>
    </div>
  )
}
