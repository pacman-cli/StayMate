"use client"

import { useTheme } from "@/context/ThemeContext"
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

interface AICompatibilityChartProps {
  data: {
    subject: string
    A: number
    fullMark: number
  }[]
}

export function AICompatibilityChart({ data }: AICompatibilityChartProps) {
  const { isDark } = useTheme()

  return (
    <div
      className={`relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border p-6 transition-all duration-300 hover:shadow-xl ${isDark
        ? "bg-dark-900 border-dark-700 hover:border-emerald-500/50"
        : "bg-white border-slate-100 hover:border-emerald-200"
        }`}
    >
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h3
            className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"
              }`}
          >
            AI Compatibility
          </h3>
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
        </div>
        <p
          className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"
            }`}
        >
          Analysis based on your lifestyle
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid
              stroke={isDark ? "#334155" : "#e2e8f0"}
              strokeOpacity={0.5}
            />
            <PolarAngleAxis
              dataKey="subject"
              tick={{
                fill: isDark ? "#94a3b8" : "#64748b",
                fontSize: 12,
                fontWeight: 600,
              }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            <Radar
              name="You"
              dataKey="A"
              stroke="#10b981"
              strokeWidth={3}
              fill="#10b981"
              fillOpacity={0.2}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "#1e293b" : "#ffffff",
                borderColor: isDark ? "#334155" : "#e2e8f0",
                borderRadius: "12px",
                color: isDark ? "#f8fafc" : "#0f172a",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        <p
          className={`text-xs font-medium ${isDark ? "text-emerald-400" : "text-emerald-600"
            }`}
        >
          Top Match: 94% with Sarah J.
        </p>
      </div>
    </div>
  )
}
