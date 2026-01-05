"use client"

import { useAuth } from "@/context/AuthContext"
import { reviewApi } from "@/lib/api"
import { ReviewResponse } from "@/types/review"
import { format } from "date-fns"
import { Star } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

export default function ReviewsPage() {
 const { user } = useAuth()
 const [reviews, setReviews] = useState<ReviewResponse[]>([])
 const [loading, setLoading] = useState(true)

 const fetchReviews = async () => {
  if (!user) return
  try {
   const data = await reviewApi.getByUser(user.id)
   // @ts-ignore - Handle Spring Page response if needed, assumed direct list or content
   setReviews(data.content || data)
  } catch (error) {
   console.error("Failed to fetch reviews", error)
  } finally {
   setLoading(false)
  }
 }

 useEffect(() => {
  fetchReviews()
 }, [user])

 const handleDelete = async (id: number) => {
  if (!confirm("Are you sure you want to delete this review?")) return
  try {
   await reviewApi.delete(id)
   toast.success("Review deleted")
   setReviews(prev => prev.filter(r => r.id !== id))
  } catch (error) {
   toast.error("Failed to delete review")
  }
 }

 if (loading) return <div className="p-8"><div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" /></div>

 return (
  <div className="p-6 md:p-8 space-y-6">
   <div>
    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Reviews</h1>
    <p className="text-slate-500 dark:text-slate-400">Reviews you have received from others</p>
   </div>

   <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
    {reviews.length === 0 ? (
     <div className="p-12 text-center text-slate-500">
      <Star className="w-12 h-12 mx-auto mb-3 opacity-20" />
      <p>No reviews received yet.</p>
     </div>
    ) : (
     <div className="divide-y divide-slate-100 dark:divide-slate-700">
      {reviews.map((review) => (
       <div key={review.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
        <div className="flex justify-between items-start mb-2">
         <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900 dark:text-white">{review.authorName}</span>
          <span className="text-xs text-slate-500">• {format(new Date(review.createdAt), 'MMM dd, yyyy')}</span>
         </div>
         {/* Only allow deleting if user is author, which means this view (received reviews) probably shouldn't have delete.
                                        But if we want to show 'My Written Reviews' we can add a toggle. For now, assuming received. */}
        </div>
        <div className="flex items-center gap-1 mb-3 text-amber-500">
         {[...Array(5)].map((_, i) => (
          <Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-current" : "text-slate-200 dark:text-slate-700"}`} />
         ))}
        </div>
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
         "{review.comment}"
        </p>
       </div>
      ))}
     </div>
    )}
   </div>
  </div>
 )
}
