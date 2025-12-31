"use client"

import { Clock, Eye, Map, MousePointer2 } from "lucide-react"

export function UserBehaviorAnalytics() {
 return (
  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
   <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">User Behavior & Engagement</h3>

   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    <MetricCard
     label="Avg. Session"
     value="4m 32s"
     icon={Clock}
     color="blue"
     subtext="+12% vs last week"
    />
    <MetricCard
     label="Most Viewed Area"
     value="Gulshan"
     icon={Map}
     color="emerald"
     subtext="2.4k views"
    />
    <MetricCard
     label="Bounce Rate"
     value="42%"
     icon={MousePointer2}
     color="rose"
     subtext="-5% (Improving)"
    />
    <MetricCard
     label="Avg. Views/User"
     value="8.5"
     icon={Eye}
     color="violet"
     subtext="Listings per session"
    />
   </div>

   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    {/* Mock Heatmap */}
    <div>
     <h4 className="text-sm font-semibold text-slate-500 mb-4">Peak Usage Hours (Heatmap)</h4>
     <div className="grid grid-cols-12 gap-1 h-32">
      {Array.from({ length: 12 * 5 }).map((_, i) => (
       <div
        key={i}
        className={`rounded-sm ${Math.random() > 0.7 ? "bg-primary-500" :
          Math.random() > 0.4 ? "bg-primary-300" : "bg-primary-100 dark:bg-primary-900/20"
         } opacity-${Math.floor(Math.random() * 100)}`}
        title="Activity Level"
       ></div>
      ))}
     </div>
     <div className="flex justify-between text-xs text-slate-400 mt-2">
      <span>6 AM</span>
      <span>12 PM</span>
      <span>6 PM</span>
      <span>12 AM</span>
     </div>
    </div>

    {/* Funnel */}
    <div>
     <h4 className="text-sm font-semibold text-slate-500 mb-4">Conversion Funnel</h4>
     <div className="space-y-2">
      <FunnelStep label="Visitors" value="100%" color="bg-slate-200 dark:bg-slate-700" text="12,450" />
      <FunnelStep label="Search" value="65%" color="bg-primary-200" text="8,092" />
      <FunnelStep label="View Listing" value="45%" color="bg-primary-400" text="5,602" />
      <FunnelStep label="Booking Request" value="12%" color="bg-primary-600" text="1,494" />
     </div>
    </div>
   </div>
  </div>
 )
}

function MetricCard({ label, value, icon: Icon, color, subtext }: any) {
 return (
  <div className={`p-4 rounded-lg bg-${color}-50 dark:bg-${color}-900/10 border border-${color}-100 dark:border-${color}-900/20`}>
   <div className="flex items-center gap-3 mb-2">
    <div className={`p-1.5 rounded-full bg-${color}-100 dark:bg-${color}-900/30 text-${color}-600`}>
     <Icon className="w-4 h-4" />
    </div>
    <span className={`text-sm font-medium text-${color}-900 dark:text-${color}-200`}>{label}</span>
   </div>
   <div className="flex items-baseline gap-2">
    <h4 className={`text-xl font-bold text-${color}-900 dark:text-${color}-100`}>{value}</h4>
   </div>
   <p className={`text-xs text-${color}-700/70 dark:text-${color}-300/70 mt-1`}>{subtext}</p>
  </div>
 )
}

function FunnelStep({ label, value, color, text }: any) {
 return (
  <div className="relative h-8 w-full bg-slate-50 dark:bg-slate-800 rounded-md overflow-hidden flex items-center">
   <div className={`absolute left-0 top-0 bottom-0 ${color}`} style={{ width: value }}></div>
   <div className="relative z-10 flex justify-between w-full px-3 text-sm">
    <span className="font-medium text-slate-700 dark:text-slate-300">{label}</span>
    <span className="font-bold text-slate-900 dark:text-white">{text} ({value})</span>
   </div>
  </div>
 )
}
