"use client"

import { Building, Check, Eye } from "lucide-react"

interface Property {
 id: number
 title: string
 location: string
 ownerName: string
 price: string
 imageUrl?: string
 status: string
}

interface PendingPropertiesWidgetProps {
 properties: Property[] // Using local interface or match auth.ts
 isDark: boolean
}

export function PendingPropertiesWidget({ properties, isDark }: PendingPropertiesWidgetProps) {
 if (!properties || properties.length === 0) return null

 return (
  <div
   className={`rounded-3xl border p-6 h-full ${isDark
    ? "bg-dark-900 border-dark-700"
    : "bg-white border-slate-100"
    }`}
  >
   <div className="mb-6 flex items-center justify-between">
    <div className="flex items-center gap-3">
     <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
      <Building className="h-5 w-5" />
     </div>
     <div>
      <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
       Pending Properties
      </h3>
      <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
       {properties.length} listings awaiting approval
      </p>
     </div>
    </div>
   </div>

   <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
    {properties.map((property) => (
     <div
      key={property.id}
      className={`group flex items-center gap-4 rounded-2xl p-4 transition-all ${isDark
       ? "bg-dark-800 hover:bg-dark-700"
       : "bg-slate-50 hover:bg-slate-100"
       }`}
     >
      <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-200">
       {property.imageUrl ? (
        <img src={property.imageUrl} alt={property.title} className="h-full w-full object-cover" />
       ) : (
        <div className="flex h-full w-full items-center justify-center text-slate-400">
         <Building className="h-6 w-6" />
        </div>
       )}
      </div>

      <div className="flex-1 min-w-0">
       <h4 className={`truncate text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
        {property.title}
       </h4>
       <p className="truncate text-xs text-slate-500">{property.location}</p>
       <div className="mt-1 flex items-center gap-2 text-xs">
        <span className={`font-medium ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>
         {property.price}
        </span>
        <span className="text-slate-500">• {property.ownerName}</span>
       </div>
      </div>

      <div className="flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100 sm:flex-row sm:opacity-100">
       <button
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${isDark
         ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
         : "bg-white text-slate-600 hover:bg-slate-50 shadow-sm"
         }`}
        title="View Details"
       >
        <Eye className="h-4 w-4" />
       </button>
       <button
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${isDark
         ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
         : "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
         }`}
        title="Approve"
       >
        <Check className="h-4 w-4" />
       </button>
      </div>
     </div>
    ))}
   </div>
  </div>
 )
}
