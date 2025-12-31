"use client"

import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export function PropertyInsights() {
  const propertyTypes = [
    { name: "Apartment", value: 400 },
    { name: "House", value: 300 },
    { name: "Studio", value: 200 },
    { name: "Room", value: 150 },
  ]

  const occupancyData = [
    { name: "Gulshan", occupied: 85, vacant: 15 },
    { name: "Banani", occupied: 70, vacant: 30 },
    { name: "Dhanmondi", occupied: 90, vacant: 10 },
    { name: "Uttara", occupied: 60, vacant: 40 },
    { name: "Mirpur", occupied: 75, vacant: 25 },
  ]

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b']

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Property Types Pie Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Property Distribution</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={propertyTypes}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {propertyTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Occupancy by Area Bar Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Occupancy Rates by Area</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={occupancyData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={80} tick={{fill: '#94a3b8', fontSize: 12}} />
              <Tooltip />
              <Legend />
              <Bar dataKey="occupied" stackId="a" fill="#10b981" name="Occupied %" radius={[0, 4, 4, 0]} />
              <Bar dataKey="vacant" stackId="a" fill="#e2e8f0" name="Vacant %" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
