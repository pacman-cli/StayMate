"use client"

import { useAuth } from "@/context/AuthContext"
import { roommateApi } from "@/lib/api"
import { Calendar, Check, Cigarette, DollarSign, MapPin, X } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

import DashboardLayout from "@/components/DashboardLayout"

export default function AdminRoommatesPage() {
 const { user } = useAuth()
 const [posts, setPosts] = useState<any[]>([])
 const [loading, setLoading] = useState(true)
 const [filter, setFilter] = useState("ALL") // ALL, PENDING, APPROVED

 useEffect(() => {
  loadPosts()
 }, [])

 const loadPosts = async () => {
  try {
   const res = await roommateApi.getAllAdmin()
   // Sort by status (PENDING first)
   const sorted = res.sort((a: any, b: any) => {
    if (a.status === 'PENDING' && b.status !== 'PENDING') return -1
    if (a.status !== 'PENDING' && b.status === 'PENDING') return 1
    return 0
   })
   setPosts(sorted)
  } catch (error) {
   console.error(error)
   toast.error("Failed to load roommate posts")
  } finally {
   setLoading(false)
  }
 }

 const handleApprove = async (id: number) => {
  try {
   await roommateApi.updateStatus(id, "APPROVED")
   toast.success("Post approved")
   loadPosts()
  } catch (error) {
   toast.error("Failed to approve post")
  }
 }

 const handleReject = async (id: number) => {
  if (!confirm("Are you sure you want to reject this post?")) return
  try {
   await roommateApi.updateStatus(id, "REJECTED")
   toast.success("Post rejected")
   loadPosts()
  } catch (error) {
   toast.error("Failed to reject post")
  }
 }

 const filteredPosts = posts.filter(p => {
  if (filter === "ALL") return true
  if (filter === "APPROVED") return p.status === "APPROVED"
  if (filter === "PENDING") return p.status === "PENDING" || !p.status // Assume null is pending or handle it
  return true
 })

 return (
  <DashboardLayout>
   <div className="p-6">
    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
     <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Roommate Posts</h1>
      <p className="text-slate-500 text-sm">Review, approve, or reject roommate finder posts.</p>
     </div>
     <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
      {["ALL", "PENDING", "APPROVED"].map((f) => (
       <button
        key={f}
        onClick={() => setFilter(f)}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${filter === f
         ? "bg-white dark:bg-slate-700 text-primary-600 shadow-sm"
         : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
         }`}
       >
        {f.charAt(0) + f.slice(1).toLowerCase()}
       </button>
      ))}
     </div>
    </div>

    {loading ? (
     <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
     </div>
    ) : (
     <div className="grid grid-cols-1 gap-4">
      {filteredPosts.length === 0 ? (
       <div className="text-center py-12 text-slate-500">No posts found.</div>
      ) : (
       filteredPosts.map((post) => (
        <div key={post.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col gap-4">
         <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
           <img src={post.userAvatar || `https://ui-avatars.com/api/?name=${post.userName}`} alt={post.userName} className="w-10 h-10 rounded-full" />
           <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">{post.userName}</h3>
            <div className="flex items-center gap-2 text-slate-500 text-xs">
             <span>{post.occupation}</span>
             <span>•</span>
             <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
           </div>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${post.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
           post.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
            'bg-amber-100 text-amber-700'
           }`}>
           {post.status || 'PENDING'}
          </span>
         </div>

         <div className="text-slate-600 dark:text-slate-300 text-sm">
          {post.bio}
         </div>

         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          <div className="flex items-center gap-2 text-sm text-slate-500">
           <MapPin className="w-4 h-4" /> {post.location}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
           <DollarSign className="w-4 h-4" /> ${post.budget}/mo
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
           <Calendar className="w-4 h-4" /> Move: {post.moveInDate}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
           {post.smoking ? <Cigarette className="w-4 h-4 text-red-500" /> : <Cigarette className="w-4 h-4 text-green-500 line-through" />}
           {post.smoking ? "Smoker" : "Non-smoker"}
          </div>
         </div>

         <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700 mt-2">
          <button
           onClick={() => handleReject(post.id)}
           className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 rounded-lg transition flex items-center gap-2"
          >
           <X className="w-4 h-4" /> Reject
          </button>
          <button
           onClick={() => handleApprove(post.id)}
           className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition flex items-center gap-2 shadow-sm"
          >
           <Check className="w-4 h-4" /> Approve
          </button>
         </div>
        </div>
       ))
      )}
     </div>
    )}
   </div>
  </DashboardLayout>
 )
}
