"use client"

import { FileBox, Mail, MessageSquare, Plus, ShieldCheck, UserCheck } from "lucide-react"

export function QuickActions() {
  const actions = [
    { label: "Verify User", icon: UserCheck, color: "blue" },
    { label: "Approve Listing", icon: CheckCircle, color: "emerald", iconOverride: ShieldCheck }, // using ShieldCheck as icon
    { label: "Send Email", icon: Mail, color: "violet" },
    { label: "Announcement", icon: MessageSquare, color: "amber" },
    { label: "Support Ticket", icon: FileBox, color: "rose" },
    { label: "Add Admin", icon: Plus, color: "slate" },
  ]

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl shadow-lg p-6 text-white">
      <h3 className="text-lg font-bold mb-6">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {actions.map((action, i) => (
          <button 
            key={i}
            className="flex flex-col items-center justify-center p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10 hover:border-white/20 group"
          >
            <div className={`p-2 rounded-full bg-${action.color}-500/20 text-${action.color}-400 mb-2 group-hover:scale-110 transition-transform`}>
              {/* @ts-ignore */}
              <action.icon className="w-5 h-5" /> 
            </div>
            <span className="text-xs font-medium text-slate-300 group-hover:text-white">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function CheckCircle(props: any) {
    return <ShieldCheck {...props} />
}
