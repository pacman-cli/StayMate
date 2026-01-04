"use client"

import DashboardLayout from "@/components/DashboardLayout"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { roommateApi } from "@/lib/api"
import { Edit2, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function MyRoommatePostsPage() {
 const { isDark } = useTheme()
 const { user } = useAuth()
 const router = useRouter()

 const [posts, setPosts] = useState([])
 const [loading, setLoading] = useState(true)

 useEffect(() => {
  fetchMyPosts()
 }, [])

 const fetchMyPosts = async () => {
  try {
   const data = await roommateApi.getMyPosts()
   setPosts(data)
  } catch (err) {
   console.error("Failed to fetch my posts", err)
  } finally {
   setLoading(false)
  }
 }

 const handleDelete = async (id: number) => {
  if (!confirm("Are you sure you want to delete this post?")) return

  try {
   await roommateApi.delete(id)
   setPosts(posts.filter((p: any) => p.id !== id))
  } catch (err) {
   alert("Failed to delete post")
  }
 }

 return (
  <DashboardLayout>
   <div className={`min-h-screen ${isDark ? "bg-dark-900" : "bg-slate-50"} py-8`}>
    <div className="max-w-5xl mx-auto px-4">
     <div className="flex items-center justify-between mb-8">
      <div>
       <h1 className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
        My Roommate Ads
       </h1>
       <p className={isDark ? "text-slate-400" : "text-slate-600"}>
        Manage your active posts and preferences.
       </p>
      </div>
      <Link
       href="/roommates/create"
       className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors flex items-center gap-2"
      >
       <Plus className="w-5 h-5" />
       Create New Ad
      </Link>
     </div>

     {loading ? (
      <div className="text-center py-12">Loading...</div>
     ) : posts.length > 0 ? (
      <div className="space-y-4">
       {posts.map((post: any) => (
        <div key={post.id} className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${isDark ? "bg-dark-800 border-white/10" : "bg-white border-slate-200"
         }`}>
         <div>
          <h3 className={`font-bold text-lg mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>
           Looking for roommate in {post.location}
          </h3>
          <div className="flex flex-wrap gap-2 text-sm text-slate-500">
           <span>Budget: ৳{post.budget}</span>
           <span>•</span>
           <span>Move in: {post.moveInDate}</span>
           <span>•</span>
           <span className="capitalize">{post.genderPreference} Preferred</span>
          </div>
         </div>

         <div className="flex items-center gap-3">
          <button
           onClick={() => router.push(`/roommates/edit/${post.id}`)}
           className={`p-2 rounded-lg border transition-colors ${isDark
             ? "border-white/10 hover:bg-white/5 text-slate-300"
             : "border-slate-200 hover:bg-slate-50 text-slate-600"
            }`}
          >
           <Edit2 className="w-4 h-4" />
          </button>
          <button
           onClick={() => handleDelete(post.id)}
           className="p-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
          >
           <Trash2 className="w-4 h-4" />
          </button>
         </div>
        </div>
       ))}
      </div>
     ) : (
      <div className={`text-center py-20 rounded-3xl border border-dashed ${isDark ? "border-white/10" : "border-slate-200"
       }`}>
       <h3 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
        No Active Ads
       </h3>
       <p className="text-slate-500 mb-6">
        You haven't posted any roommate requests yet.
       </p>
       <Link
        href="/roommates/create"
        className="inline-flex items-center gap-2 text-primary-500 font-medium hover:underline"
       >
        <Plus className="w-4 h-4" />
        Post your first ad
       </Link>
      </div>
     )}
    </div>
   </div>
  </DashboardLayout>
 )
}
