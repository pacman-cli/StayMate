import { LandlordOverviewStats } from "@/types/auth"
import { Bed, DollarSign, Home, Star, TrendingUp } from "lucide-react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

interface BusinessHealthStatsProps {
  stats: LandlordOverviewStats
}

export const BusinessHealthStats = ({ stats }: BusinessHealthStatsProps) => {

  const pieData = [
    { name: "Occupied", value: stats.occupiedSeats, color: "#10b981" }, // emerald-500
    { name: "Vacant", value: stats.vacantSeats, color: "#cbd5e1" }, // slate-300
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-slate-200 dark:border-dark-700 shadow-sm relative overflow-hidden group hover:shadow-elevation-low transition-all">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Home className="w-16 h-16 text-blue-600" />
        </div>
        <div className="flex flex-col">
          <span className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Properties</span>
          <span className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalProperties}</span>
          <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" /> Active Portfolio
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-800 p-4 rounded-xl border border-slate-200 dark:border-dark-700 shadow-sm flex flex-col justify-between hover:shadow-elevation-low transition-all">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Occupancy</span>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.occupancyRate.toFixed(1)}%</span>
            </div>
          </div>
          {/* Pie Chart Mini */}
          <div className="w-[60px] h-[60px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={15}
                  outerRadius={25}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '10px', padding: '4px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
          {stats.occupiedSeats} occupied / {stats.vacantSeats} vacant
        </div>
      </div>

      <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-slate-200 dark:border-dark-700 shadow-sm relative overflow-hidden group hover:shadow-elevation-low transition-all">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <DollarSign className="w-16 h-16 text-emerald-600" />
        </div>
        <div className="flex flex-col">
          <span className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Earnings</span>
          <span className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
            ${(stats.totalEarnings || 0).toLocaleString()}
          </span>
          <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center">
            Pending: ${(stats.pendingPayouts || 0).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-slate-200 dark:border-dark-700 shadow-sm relative overflow-hidden group hover:shadow-elevation-low transition-all">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Bed className="w-16 h-16 text-indigo-600" />
        </div>
        <div className="flex flex-col">
          <span className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Vacant Seats</span>
          <span className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.vacantSeats}</span>
          <div className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center">
            {stats.longTermVacantSeats > 0 ? (
              <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                {stats.longTermVacantSeats} long-term vacant
              </span>
            ) : "High demand"}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-slate-200 dark:border-dark-700 shadow-sm relative overflow-hidden group hover:shadow-elevation-low transition-all">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Star className="w-16 h-16 text-amber-500" />
        </div>
        <div className="flex flex-col">
          <span className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Reputation</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">{stats.averageRating.toFixed(1)}</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-4 h-4 ${s <= Math.round(stats.averageRating) ? "text-amber-400 fill-amber-400" : "text-slate-300"}`} />
              ))}
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            Based on {stats.totalReviews} reviews
          </div>
        </div>
      </div>
    </div>
  )
}
