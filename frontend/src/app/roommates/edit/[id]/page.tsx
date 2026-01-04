"use client"

import DashboardLayout from "@/components/DashboardLayout"
import { useTheme } from "@/context/ThemeContext"
import { roommateApi } from "@/lib/api"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"

type FormData = {
 location: string
 budget: number
 moveInDate: string
 bio: string
 genderPreference: string
 smoking: boolean
 pets: boolean
 occupation: string
}

export default function EditRoommatePostPage({ params }: { params: { id: string } }) {
 const { isDark } = useTheme()
 const router = useRouter()
 const { register, handleSubmit, reset, setValue } = useForm<FormData>()
 const [loading, setLoading] = useState(false)
 const [fetching, setFetching] = useState(true)

 useEffect(() => {
  const fetchPost = async () => {
   try {
    const data = await roommateApi.getById(parseInt(params.id))
    // Pre-fill form
    setValue("location", data.location)
    setValue("budget", data.budget)
    setValue("moveInDate", data.moveInDate)
    setValue("bio", data.bio)
    setValue("genderPreference", data.genderPreference)
    setValue("smoking", data.smoking)
    setValue("pets", data.pets)
    setValue("occupation", data.occupation)
   } catch (err) {
    console.error("Failed to fetch post", err)
    alert("Failed to load post data")
    router.push("/roommates/my")
   } finally {
    setFetching(false)
   }
  }
  fetchPost()
 }, [params.id, router, setValue])

 const onSubmit = async (data: FormData) => {
  setLoading(true)
  try {
   await roommateApi.update(parseInt(params.id), data)
   router.push("/roommates/my")
  } catch (error) {
   console.error("Failed to update post", error)
   alert("Failed to update post. Please try again.")
  } finally {
   setLoading(false)
  }
 }

 if (fetching) return (
  <DashboardLayout>
   <div className={`min-h-screen ${isDark ? "bg-dark-900" : "bg-slate-50"} flex items-center justify-center`}>
    <div className={isDark ? "text-white" : "text-slate-900"}>Loading...</div>
   </div>
  </DashboardLayout>
 )

 return (
  <DashboardLayout>
   <div className={`min-h-screen ${isDark ? "bg-dark-900" : "bg-slate-50"} py-8`}>
    <div className="max-w-2xl mx-auto px-4">
     <Link href="/roommates/my" className={`inline-flex items-center gap-2 mb-6 ${isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
      }`}>
      <ArrowLeft className="w-4 h-4" />
      Back to My Posts
     </Link>

     <div className={`p-8 rounded-2xl border ${isDark ? "bg-dark-800 border-white/10" : "bg-white border-slate-200"
      }`}>
      <div className="mb-8">
       <h1 className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
        Edit Roommate Ad
       </h1>
       <p className={isDark ? "text-slate-400" : "text-slate-600"}>
        Update your preferences and details.
       </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
         <label className={`block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
          Target Location
         </label>
         <input
          {...register("location", { required: true })}
          type="text"
          className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${isDark
            ? "bg-dark-900 border-white/10 focus:border-primary-500 text-white placeholder-slate-600"
            : "bg-white border-slate-200 focus:border-primary-500 text-slate-900"
           }`}
         />
        </div>
        <div>
         <label className={`block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
          Max Budget (৳)
         </label>
         <input
          {...register("budget", { required: true })}
          type="number"
          className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${isDark
            ? "bg-dark-900 border-white/10 focus:border-primary-500 text-white placeholder-slate-600"
            : "bg-white border-slate-200 focus:border-primary-500 text-slate-900"
           }`}
         />
        </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
         <label className={`block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
          Move-in Date
         </label>
         <input
          {...register("moveInDate", { required: true })}
          type="date"
          className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${isDark
            ? "bg-dark-900 border-white/10 focus:border-primary-500 text-white placeholder-slate-600"
            : "bg-white border-slate-200 focus:border-primary-500 text-slate-900"
           }`}
         />
        </div>
        <div>
         <label className={`block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
          Gender Preference
         </label>
         <select
          {...register("genderPreference", { required: true })}
          className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${isDark
            ? "bg-dark-900 border-white/10 focus:border-primary-500 text-white"
            : "bg-white border-slate-200 focus:border-primary-500 text-slate-900"
           }`}
         >
          <option value="ANY">Any</option>
          <option value="MALE">Male Only</option>
          <option value="FEMALE">Female Only</option>
         </select>
        </div>
       </div>

       <div>
        <label className={`block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
         Your Occupation
        </label>
        <input
         {...register("occupation", { required: true })}
         type="text"
         className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${isDark
           ? "bg-dark-900 border-white/10 focus:border-primary-500 text-white placeholder-slate-600"
           : "bg-white border-slate-200 focus:border-primary-500 text-slate-900"
          }`}
        />
       </div>

       <div>
        <label className={`block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
         About You & What You're Looking For
        </label>
        <textarea
         {...register("bio", { required: true })}
         rows={4}
         className={`w-full px-4 py-3 rounded-xl border outline-none transition-all resize-none ${isDark
           ? "bg-dark-900 border-white/10 focus:border-primary-500 text-white placeholder-slate-600"
           : "bg-white border-slate-200 focus:border-primary-500 text-slate-900"
          }`}
        />
       </div>

       <div className="flex gap-6">
        <label className="flex items-center gap-3 cursor-pointer">
         <input
          {...register("smoking")}
          type="checkbox"
          className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
         />
         <span className={isDark ? "text-slate-300" : "text-slate-700"}>Smoking Allowed</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
         <input
          {...register("pets")}
          type="checkbox"
          className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
         />
         <span className={isDark ? "text-slate-300" : "text-slate-700"}>Pets Allowed</span>
        </label>
       </div>

       <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
       >
        {loading ? "Updating..." : (
         <>
          <Save className="w-5 h-5" />
          Update Post
         </>
        )}
       </button>
      </form>
     </div>
    </div>
   </div>
  </DashboardLayout>
 )
}
