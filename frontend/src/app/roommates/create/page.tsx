"use client"

import DashboardLayout from "@/components/DashboardLayout"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { roommateApi } from "@/lib/api"
import { CleanlinessLevel, SleepSchedule } from "@/types/auth"
import { Briefcase, Calendar, Cigarette, Dog, DollarSign, Heart, Loader2, MapPin, Moon, Sparkles, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "react-hot-toast"

export default function CreateRoommatePostPage() {
  const router = useRouter()
  const { isDark } = useTheme()
  const { user, isAuthenticated, isLoading } = useAuth()

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    location: "",
    budgetMin: "",
    budgetMax: "",
    moveInDate: "",
    bio: "",
    genderPreference: "ANY",
    smoking: false,
    alcohol: false,
    pets: false,
    stayDuration: "LONG_TERM",
    guestsAllowed: "WEEKENDS",
    cookingHabits: "OFTEN",
    occupation: "",
    cleanliness: "MODERATE" as CleanlinessLevel,
    sleepSchedule: "IRREGULAR" as SleepSchedule,
    personalityTags: "",
    interests: ""
  })

  // Redirect if not logged in
  if (!isLoading && !isAuthenticated) {
    router.push("/login?redirect=/roommates/create")
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await roommateApi.createPost({
        ...formData,
        budgetMin: Number(formData.budgetMin),
        budgetMax: Number(formData.budgetMax),
        budget: Number(formData.budgetMax), // Legacy
        latitude: 0, // Should use geocoding in real app
        longitude: 0,
        personalityTags: formData.personalityTags.split(",").map(t => t.trim()).filter(Boolean),
        interests: formData.interests.split(",").map(t => t.trim()).filter(Boolean)
      })
      toast.success("Roommate profile created! Good luck finding a match.")
      router.push("/roommates")
    } catch (error: any) {
      console.error("Failed to create post", error)
      const message = error.response?.data?.message || "Failed to create profile"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className={`min-h-screen py-10 px-4 sm:px-6 lg:px-8 ${isDark ? "bg-dark-900" : "bg-slate-50"}`}>
        <div className="max-w-2xl mx-auto">
          <div className={`p-8 rounded-2xl border shadow-xl ${isDark ? "bg-dark-800 border-white/10" : "bg-white border-slate-200"}`}>
            <div className="text-center mb-8">
              <h1 className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                Find Your Roommate
              </h1>
              <p className={isDark ? "text-slate-400" : "text-slate-500"}>
                Create a profile to start matching with compatible roommates
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Location */}
              <div>
                <label className="block text-sm font-medium mb-2 opacity-70">Target Location / City</label>
                <div className={`flex items-center gap-3 p-3 rounded-xl border ${isDark ? "bg-dark-900 border-white/10" : "bg-slate-50 border-slate-200"}`}>
                  <MapPin className="w-5 h-5 opacity-50 flex-shrink-0" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. New York, NY"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    className="flex-1 bg-transparent outline-none min-w-0"
                  />
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium mb-2 opacity-70">Budget Range (Min - Max)</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`flex items-center gap-2 p-3 rounded-xl border ${isDark ? "bg-dark-900 border-white/10" : "bg-slate-50 border-slate-200"}`}>
                    <DollarSign className="w-4 h-4 opacity-50 flex-shrink-0" />
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="Min"
                      value={formData.budgetMin}
                      onChange={e => setFormData({ ...formData, budgetMin: e.target.value })}
                      className="flex-1 bg-transparent outline-none min-w-0 text-sm"
                    />
                  </div>
                  <div className={`flex items-center gap-2 p-3 rounded-xl border ${isDark ? "bg-dark-900 border-white/10" : "bg-slate-50 border-slate-200"}`}>
                    <DollarSign className="w-4 h-4 opacity-50 flex-shrink-0" />
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="Max"
                      value={formData.budgetMax}
                      onChange={e => setFormData({ ...formData, budgetMax: e.target.value })}
                      className="flex-1 bg-transparent outline-none min-w-0 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium mb-2 opacity-70">Move-in Date</label>
                <div className={`flex items-center gap-3 p-3 rounded-xl border ${isDark ? "bg-dark-900 border-white/10" : "bg-slate-50 border-slate-200"}`}>
                  <Calendar className="w-5 h-5 opacity-50 flex-shrink-0" />
                  <input
                    type="date"
                    required
                    value={formData.moveInDate}
                    onChange={e => setFormData({ ...formData, moveInDate: e.target.value })}
                    className={`flex-1 bg-transparent outline-none min-w-0 ${!formData.moveInDate && "text-slate-500"}`}
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium mb-2 opacity-70">About Yourself</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell potential roommates about your lifestyle, hobbies, and what you're looking for..."
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  className={`w-full p-3 rounded-xl border outline-none resize-none ${isDark ? "bg-dark-900 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}
                />
              </div>

              {/* Occupation */}
              <div>
                <label className="block text-sm font-medium mb-2 opacity-70">Occupation</label>
                <div className={`flex items-center gap-3 p-3 rounded-xl border ${isDark ? "bg-dark-900 border-white/10" : "bg-slate-50 border-slate-200"}`}>
                  <Briefcase className="w-5 h-5 opacity-50 flex-shrink-0" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Software Engineer"
                    value={formData.occupation}
                    onChange={e => setFormData({ ...formData, occupation: e.target.value })}
                    className="flex-1 bg-transparent outline-none min-w-0"
                  />
                </div>
              </div>

              {/* AI Matching - Habits & Lifestyle */}
              <div className="space-y-6 pt-4 border-t border-dashed border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-primary-500" />
                  <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>AI Compatibility Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Cleanliness */}
                  <div>
                    <label className="block text-sm font-medium mb-2 opacity-70">Cleanliness Level</label>
                    <div className={`p-3 rounded-xl border ${isDark ? "bg-dark-900 border-white/10" : "bg-slate-50 border-slate-200"}`}>
                      <select
                        value={formData.cleanliness}
                        onChange={e => setFormData({ ...formData, cleanliness: e.target.value as CleanlinessLevel })}
                        className="bg-transparent outline-none w-full"
                      >
                        <option value="MESSY">Relaxed / Messy</option>
                        <option value="MODERATE">Moderate</option>
                        <option value="NEAT_FREAK">Neat Freak</option>
                      </select>
                    </div>
                  </div>

                  {/* Sleep Schedule */}
                  <div>
                    <label className="block text-sm font-medium mb-2 opacity-70">Sleep Schedule</label>
                    <div className={`flex items-center gap-3 p-3 rounded-xl border ${isDark ? "bg-dark-900 border-white/10" : "bg-slate-50 border-slate-200"}`}>
                      <Moon className="w-5 h-5 opacity-50" />
                      <select
                        value={formData.sleepSchedule}
                        onChange={e => setFormData({ ...formData, sleepSchedule: e.target.value as SleepSchedule })}
                        className="bg-transparent outline-none w-full"
                      >
                        <option value="EARLY_BIRD">Early Bird (Morning Person)</option>
                        <option value="NIGHT_OWL">Night Owl (Late Riser)</option>
                        <option value="IRREGULAR">Flexible / Irregular</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Tags & Interests */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 opacity-70">Personality Traits (Comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Introvert, Gamer, Musician, Quiet"
                      value={formData.personalityTags}
                      onChange={e => setFormData({ ...formData, personalityTags: e.target.value })}
                      className={`w-full p-3 rounded-xl border outline-none ${isDark ? "bg-dark-900 border-white/10" : "bg-slate-50 border-slate-200"}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 opacity-70">Interests & Hobbies (Comma separated)</label>
                    <div className={`flex items-center gap-3 p-3 rounded-xl border ${isDark ? "bg-dark-900 border-white/10" : "bg-slate-50 border-slate-200"}`}>
                      <Heart className="w-5 h-5 opacity-50 flex-shrink-0" />
                      <input
                        type="text"
                        placeholder="e.g. Hiking, Cooking, Tech, Movies"
                        value={formData.interests}
                        onChange={e => setFormData({ ...formData, interests: e.target.value })}
                        className="flex-1 bg-transparent outline-none min-w-0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Gender */}
                <div className={`p-3 rounded-xl border ${isDark ? "bg-dark-900 border-white/10" : "bg-slate-50 border-slate-200"}`}>
                  <label className="block text-xs font-bold uppercase mb-2 opacity-50">Gender Preference</label>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 opacity-50" />
                    <select
                      value={formData.genderPreference}
                      onChange={e => setFormData({ ...formData, genderPreference: e.target.value })}
                      className="bg-transparent outline-none w-full text-sm"
                    >
                      <option value="ANY">Any Gender</option>
                      <option value="MALE">Male Only</option>
                      <option value="FEMALE">Female Only</option>
                    </select>
                  </div>
                </div>

                {/* Smoking */}
                <div
                  onClick={() => setFormData({ ...formData, smoking: !formData.smoking })}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${formData.smoking
                    ? "bg-primary-500/10 border-primary-500 text-primary-500"
                    : isDark ? "bg-dark-900 border-white/10 hover:border-white/20" : "bg-slate-50 border-slate-200 hover:border-slate-300"
                    }`}
                >
                  <label className="block text-xs font-bold uppercase mb-2 opacity-70 pointer-events-none">Smoking</label>
                  <div className="flex items-center gap-2">
                    <Cigarette className="w-4 h-4" />
                    <span className="text-sm font-medium">{formData.smoking ? "Smoker" : "Non-Smoker"}</span>
                  </div>
                </div>

                {/* Alcohol */}
                <div
                  onClick={() => setFormData({ ...formData, alcohol: !formData.alcohol })}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${formData.alcohol
                    ? "bg-primary-500/10 border-primary-500 text-primary-500"
                    : isDark ? "bg-dark-900 border-white/10 hover:border-white/20" : "bg-slate-50 border-slate-200 hover:border-slate-300"
                    }`}
                >
                  <label className="block text-xs font-bold uppercase mb-2 opacity-70 pointer-events-none">Alcohol</label>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">{formData.alcohol ? "Drinks" : "No Alcohol"}</span>
                  </div>
                </div>

                {/* Pets */}
                <div
                  onClick={() => setFormData({ ...formData, pets: !formData.pets })}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${formData.pets
                    ? "bg-primary-500/10 border-primary-500 text-primary-500"
                    : isDark ? "bg-dark-900 border-white/10 hover:border-white/20" : "bg-slate-50 border-slate-200 hover:border-slate-300"
                    }`}
                >
                  <label className="block text-xs font-bold uppercase mb-2 opacity-70 pointer-events-none">Pets</label>
                  <div className="flex items-center gap-2">
                    <Dog className="w-4 h-4" />
                    <span className="text-sm font-medium">{formData.pets ? "Have Pets" : "No Pets"}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Stay Duration */}
                <div>
                  <label className="block text-sm font-medium mb-2 opacity-70">Duration</label>
                  <div className={`p-3 rounded-xl border ${isDark ? "bg-dark-900 border-white/10" : "bg-slate-50 border-slate-200"}`}>
                    <select
                      value={formData.stayDuration}
                      onChange={e => setFormData({ ...formData, stayDuration: e.target.value })}
                      className="bg-transparent outline-none w-full"
                    >
                      <option value="SHORT_TERM">Short Term</option>
                      <option value="LONG_TERM">Long Term</option>
                      <option value="INDEFINITE">Indefinite</option>
                    </select>
                  </div>
                </div>

                {/* Guests */}
                <div>
                  <label className="block text-sm font-medium mb-2 opacity-70">Guests</label>
                  <div className={`p-3 rounded-xl border ${isDark ? "bg-dark-900 border-white/10" : "bg-slate-50 border-slate-200"}`}>
                    <select
                      value={formData.guestsAllowed}
                      onChange={e => setFormData({ ...formData, guestsAllowed: e.target.value })}
                      className="bg-transparent outline-none w-full"
                    >
                      <option value="NEVER">No Guests</option>
                      <option value="WEEKENDS">Weekends Only</option>
                      <option value="ALWAYS">Anytime</option>
                    </select>
                  </div>
                </div>

                {/* Cooking */}
                <div>
                  <label className="block text-sm font-medium mb-2 opacity-70">Cooking</label>
                  <div className={`p-3 rounded-xl border ${isDark ? "bg-dark-900 border-white/10" : "bg-slate-50 border-slate-200"}`}>
                    <select
                      value={formData.cookingHabits}
                      onChange={e => setFormData({ ...formData, cookingHabits: e.target.value })}
                      className="bg-transparent outline-none w-full"
                    >
                      <option value="NEVER">Don't Cook</option>
                      <option value="RARELY">Rarely</option>
                      <option value="OFTEN">Often</option>
                      <option value="VEGETARIAN">Vegetarian</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                  {loading ? "Creating Profile..." : "Publish Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
