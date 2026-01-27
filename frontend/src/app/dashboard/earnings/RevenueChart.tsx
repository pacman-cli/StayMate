"use client"

import { EarningDto } from "@/types/auth"
import { format, parseISO } from "date-fns"
import { useMemo } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"

interface RevenueChartProps {
  earnings: EarningDto[]
}

export default function RevenueChart({ earnings }: RevenueChartProps) {
  const data = useMemo(() => {
    // Group by month
    const grouped = earnings.reduce((acc, earning) => {
      // Handle date string or Date object
      const dateStr = earning.date ? earning.date.toString() : new Date().toISOString()
      const monthKey = format(parseISO(dateStr), "MMM yyyy")

      if (!acc[monthKey]) {
        acc[monthKey] = 0
      }
      acc[monthKey] += earning.netAmount || 0
      return acc
    }, {} as Record<string, number>)

    // Convert to array and sort (assuming chronological order helps, but map keys order isn't guaranteed)
    // For MVP, we just take the object entries
    return Object.entries(grouped).map(([name, total]) => ({
      name,
      total
    })).reverse() // Assuming history comes newest first, we want oldest first?
    // Actually history comes newest first. "reverse" makes it oldest first (left to right).
  }, [earnings])

  if (data.length === 0) return null

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis
            dataKey="name"
            stroke="#64748B"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#64748B"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `৳${value}`}
          />
          <Tooltip
            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
            contentStyle={{
              borderRadius: '12px',
              border: 'none',
              backgroundColor: '#1E293B',
              color: '#F8FAFC',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value: any) => [`৳${Number(value).toLocaleString()}`, 'Revenue']}
          />
          <Bar
            dataKey="total"
            fill="#3B82F6"
            radius={[6, 6, 0, 0]}
            barSize={32}
            className="hover:opacity-90 transition-opacity"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
