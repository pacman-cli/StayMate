"use client"

import { CheckCircle2, Home, UserPlus, ShieldAlert, LogIn } from "lucide-react"

export function ActivityFeed() {
  const activities = [
    {
      id: 1,
      type: "new_user",
      user: "Sarah Jenkins",
      action: "created an account",
      time: "2 mins ago",
      icon: UserPlus,
      color: "blue"
    },
    {
      id: 2,
      type: "new_listing",
      user: "Michael Scott",
      action: "listed 'Luxury Apt in Gulshan'",
      time: "15 mins ago",
      icon: Home,
      color: "emerald"
    },
    {
      id: 3,
      type: "verification",
      user: "System",
      action: "verified document for John Doe",
      time: "1 hour ago",
      icon: CheckCircle2,
      color: "violet"
    },
    {
      id: 4,
      type: "alert",
      user: "Security Bot",
      action: "flagged suspicious login attempt",
      time: "2 hours ago",
      icon: ShieldAlert,
      color: "rose"
    },
    {
      id: 5,
      type: "login",
      user: "Admin",
      action: "logged into dashboard",
      time: "3 hours ago",
      icon: LogIn,
      color: "slate"
    }
  ]

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 h-full">
      <div className="flex justify-between items-center mb-6">
         <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h3>
         <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">View All</button>
      </div>

      <div className="relative border-l border-slate-200 dark:border-slate-700 ml-3 space-y-8">
        {activities.map((activity) => (
          <div key={activity.id} className="relative pl-8">
            <span className={`absolute -left-[9px] top-1 h-5 w-5 rounded-full border-4 border-white dark:border-slate-800 bg-${activity.color}-500`}></span>
            <div className="flex flex-col">
              <span className="text-sm text-slate-900 dark:text-white">
                <span className="font-semibold hover:underline cursor-pointer">{activity.user}</span> {activity.action}
              </span>
              <span className="text-xs text-slate-500 mt-1">{activity.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
