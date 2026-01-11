import { ReviewResponse } from "@/types/auth"
import { MessageCircle, Reply, Star, User } from "lucide-react"

interface ReputationMonitorProps {
  reviews: ReviewResponse[]
}

export const ReputationMonitor = ({ reviews }: ReputationMonitorProps) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm h-full flex flex-col">
      <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-900/10">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500" /> Recent Reviews
        </h3>
        <span className="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 text-xs font-bold px-2 py-1 rounded-full">
          {reviews.length}
        </span>
      </div>

      <div className="flex-1 overflow-auto p-0 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-600">
        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400">
            <MessageCircle className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-sm">No reviews yet</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {reviews.map((review) => (
              <div key={review.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                      {review.authorAvatar ? (
                        <img src={review.authorAvatar} alt={review.authorName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{review.authorName}</h4>
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-current" : "text-slate-200 dark:text-slate-700"}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 line-clamp-3">
                  "{review.comment}"
                </p>
                {/* Reply Button - appears on hover */}
                <div className="mt-3 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="text-xs text-indigo-500 hover:text-indigo-600 font-medium flex items-center gap-1"
                    onClick={() => alert("Reply feature coming in next update")}
                  >
                    <Reply className="w-3 h-3" /> Reply
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
