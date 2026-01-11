import { Booking } from "@/types/auth"
import { Calendar, Check, Clock, MessageSquare, User, X } from "lucide-react"

interface TenantRequestManagerProps {
  requests: Booking[]
  onApprove: (id: number) => void
  onReject: (id: number) => void
}

export const TenantRequestManager = ({ requests, onApprove, onReject }: TenantRequestManagerProps) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm h-full flex flex-col">
      <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/10">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" /> Pending Requests
        </h3>
        <span className="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 text-xs font-bold px-2 py-1 rounded-full">
          {requests.length}
        </span>
      </div>

      <div className="flex-1 overflow-auto p-0 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-600">
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400">
            <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-sm">No pending requests</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {requests.map((req) => (
              <div key={req.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                      {req.tenantProfilePictureUrl ? (
                        <img src={req.tenantProfilePictureUrl} alt={req.tenantName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <User className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{req.tenantName}</h4>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Requested {new Date(req.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 px-2 py-1 rounded">
                    {Math.ceil((new Date(req.endDate).getTime() - new Date(req.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>

                <div className="flex gap-2 mt-3 justify-end">
                  <button
                    onClick={() => { alert("Feature coming soon: Propose New Time") }}
                    className="px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 rounded-lg transition flex items-center justify-center gap-1"
                    title="Propose New Time"
                  >
                    <Calendar className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onReject(req.id)}
                    className="flex-1 px-3 py-2 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-300 dark:hover:bg-rose-900/40 rounded-lg transition flex items-center justify-center gap-1"
                  >
                    <X className="w-3 h-3" /> Decline
                  </button>
                  <button
                    onClick={() => onApprove(req.id)}
                    className="flex-1 px-3 py-2 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:hover:bg-emerald-900/40 rounded-lg transition flex items-center justify-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
