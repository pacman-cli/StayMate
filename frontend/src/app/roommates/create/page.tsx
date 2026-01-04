"use client"

import DashboardLayout from "@/components/DashboardLayout"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { roommateApi } from "@/lib/api"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"

export default function CreateRoommatePostPage() {
 const { isDark } = useTheme()
 const { user } = useAuth()
 const router = useRouter()

 const [loading, setLoading] = useState(false)
 const [error, setError] = useState("")

 const [formData, setFormData] = useState({
  location: "",
  budget: "",
  moveInDate: "",
  bio: "",
  genderPreference: "ANY",
  smoking: false,
  pets: false,
  occupation: "ANY"
 })

 const handleSubmit = async (e: FormEvent) => {
  e.preventDefault()
  setError("")
  setLoading(true)

  try {
   await roommateApi.create({
    ...formData,
    budget: Number(formData.budget)
   })
   router.push("/roommates")
  } catch (err: any) {
   setError(err.response?.data?.message || "Failed to create post")
  } finally {
   setLoading(false)
  }
 }

 const inputClassName = `w-full px-4 py-3 rounded-xl border transition-all ${isDark
   ? "bg-white/5 border-white/10 focus:border-primary-500/50 text-white"
   : "bg-white border-slate-200 focus:border-primary-500 text-slate-900"
  } focus:outline-none focus:ring-2 focus:ring-primary-500/20`

 const labelClassName = `block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`

 return (
  <DashboardLayout>
   <div className={`min-h-screen ${isDark ? "bg-dark-900" : "bg-slate-50"} py-12`}>
    <div className="max-w-2xl mx-auto px-4">
     <div className="text-center mb-8">
      <h1 className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
       Create Roommate Ad
      </h1>
      <p className={isDark ? "text-slate-400" : "text-slate-600"}>
       Tell us about yourself and what you're looking for.
      </p>
     </div>

     <div className={`p-8 rounded-3xl border ${isDark ? "bg-dark-800 border-white/10" : "bg-white border-slate-200 shadow-xl"
      }`}>
      {error && (
       <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        <p>{error}</p>
       </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
       {/* Location & Budget */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
         <label className={labelClassName}>Preferred Location</label>
         <input
          type="text"
          required
          placeholder="e.g. Dhaka, Dhanmondi"
          value={formData.location}
          onChange={e => setFormData({ ...formData, location: e.target.value })}
          className={inputClassName}
         />
        </div>
        <div>
         <label className={labelClassName}>Max Budget (BDT)</label>
         <input
          type="number"
          required
          placeholder="e.g. 5000"
          value={formData.budget}
          onChange={e => setFormData({ ...formData, budget: e.target.value })}
          className={inputClassName}
         />
        </div>
       </div>

       {/* Move In Date */}
       <div>
        <label className={labelClassName}>Earliest Move-in Date</label>
        <input
         type="date"
         required
         value={formData.moveInDate}
         onChange={e => setFormData({ ...formData, moveInDate: e.target.value })}
         className={inputClassName}
        />
       </div>

       {/* Bio */}
       <div>
        <label className={labelClassName}>About You & Preferences</label>
        <textarea
         required
         rows={4}
         placeholder="Describe your lifestyle, habits, and what kind of roommate you are looking for..."
         value={formData.bio}
         onChange={e => setFormData({ ...formData, bio: e.target.value })}
         className={inputClassName}
        />
       </div>

       {/* Preferences Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
         <label className={labelClassName}>Gender Preference</label>
         <select
          value={formData.genderPreference}
          onChange={e => setFormData({ ...formData, genderPreference: e.target.value })}
          className={inputClassName}
         >
          <option value="ANY">Any</option>
          <option value="MALE">Male Only</option>
          <option value="FEMALE">Female Only</option>
         </select>
        </div>
        <div>
         <label className={labelClassName}>Your Occupation</label>
         <select
          value={formData.occupation}
          onChange={e => setFormData({ ...formData, occupation: e.target.value })}
          className={inputClassName}
         >
          <option value="ANY">Prefer not to say</option>
          <option value="STUDENT">Student</option>
          <option value="PROFESSIONAL">Working Professional</option>
         </select>
        </div>
       </div>

       {/* Toggles */}
       <div className="flex flex-col sm:flex-row gap-6">
        <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${formData.smoking
          ? "bg-primary-500/10 border-primary-500 text-primary-500"
          : isDark ? "border-white/10" : "border-slate-200"
         }`}>
         <input
          type="checkbox"
          checked={formData.smoking}
          onChange={e => setFormData({ ...formData, smoking: e.target.checked })}
          className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
         />
         <span className="font-medium">Smoking Allowed / Smoker</span>
        </label>

        <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${formData.pets
          ? "bg-primary-500/10 border-primary-500 text-primary-500"
          : isDark ? "border-white/10" : "border-slate-200"
         }`}>
         <input
          type="checkbox"
          checked={formData.pets}
          onChange={e => setFormData({ ...formData, pets: e.target.checked })}
          className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
         />
         <span className="font-medium">Pet Friendly / Have Pets</span>
        </label>
       </div>

       <button
        type="submit"
        disabled={loading}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
       >
        {loading ? (
         <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Publishing...
         </>
        ) : (
         <>
          <CheckCircle2 className="w-5 h-5" />
          Publish Ad
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
