"use client"

import Avatar from "@/components/common/Avatar"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { messageApi, roommateApi } from "@/lib/api"
import { BadgeCheck, Calendar, Cat, Cigarette, Heart, MapPin, MessageCircle, Share2, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function RoommatePostDetailsPage({ params }: { params: { id: string } }) {
  const { isDark } = useTheme()
  const { user } = useAuth()
  const router = useRouter()

  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await roommateApi.getById(parseInt(params.id))
        setPost(data)
      } catch (err) {
        console.error("Failed to fetch post", err)
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [params.id])

  const handleMessage = async () => {
    if (!user) {
      router.push('/login?redirect=/roommates/' + post.id)
      return
    }

    // Prevent messaging yourself
    if (user.id === post.userId) {
      alert("You cannot message yourself.")
      return
    }

    console.log("Starting conversation with:", post.userId, post.userName)
    setSendingMessage(true)
    try {
      const conversation = await messageApi.createConversation({
        recipientId: post.userId,
        initialMessage: `Hi ${post.userName.split(' ')[0]}! I saw your roommate profile and I'm interested in connecting.`
      })
      console.log("Conversation created:", conversation)
      router.push(`/messages?conversation=${conversation.id}`)
    } catch (err) {
      console.error('Failed to start conversation', err)
      alert('Failed to start conversation. Please try again.')
    } finally {
      setSendingMessage(false)
    }
  }

  if (loading) return (
    <div className={`min-h-screen pt-24 flex items-center justify-center ${isDark ? "bg-dark-900 text-white" : "bg-slate-50 text-slate-900"}`}>
      Loading...
    </div>
  )

  if (!post) return (
    <div className={`min-h-screen pt-24 flex flex-col items-center justify-center ${isDark ? "bg-dark-900 text-white" : "bg-slate-50 text-slate-900"}`}>
      <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
      <Link href="/roommates" className="text-primary-500 hover:underline">
        Back to Roommates
      </Link>
    </div>
  )

  return (
    <div className={`min-h-screen pt-24 pb-12 ${isDark ? "bg-dark-900" : "bg-slate-50"}`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <Link href="/roommates" className={`inline-flex items-center gap-2 ${isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
            }`}>
            ← Back to Roommates
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className={`p-8 rounded-3xl border ${isDark ? "bg-dark-800 border-white/10" : "bg-white border-slate-200"}`}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Avatar name={post.userName} src={post.userAvatar} size="lg" />
                  <div>
                    <h1 className={`text-2xl font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                      {post.userName}
                      <BadgeCheck className="w-6 h-6 text-blue-500" />
                    </h1>
                    <p className={isDark ? "text-slate-400" : "text-slate-600"}>
                      {post.occupation} • {post.genderPreference} Preference
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className={`p-3 rounded-full border transition-colors ${isDark ? "border-white/10 hover:bg-white/5 text-white" : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}>
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button className={`p-3 rounded-full border transition-colors ${isDark ? "border-white/10 hover:bg-white/5 text-white" : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}>
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-t border-b border-dashed border-slate-200 dark:border-white/10">
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Budget</div>
                  <div className={`font-bold text-lg ${isDark ? "text-primary-400" : "text-primary-600"}`}>
                    ৳{post.budget.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Location</div>
                  <div className={`font-bold text-lg flex items-center gap-1 ${isDark ? "text-white" : "text-slate-900"}`}>
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {post.location}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Move In</div>
                  <div className={`font-bold text-lg flex items-center gap-1 ${isDark ? "text-white" : "text-slate-900"}`}>
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {post.moveInDate}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Gender</div>
                  <div className={`font-bold text-lg flex items-center gap-1 ${isDark ? "text-white" : "text-slate-900"}`}>
                    <User className="w-4 h-4 text-slate-400" />
                    {post.genderPreference}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className={`font-bold mb-3 ${isDark ? "text-white" : "text-slate-900"}`}>About Me & My Search</h3>
                <p className={`leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  {post.bio}
                </p>
              </div>

              <div className="mt-8 flex gap-3">
                {!post.smoking && (
                  <span className={`px-4 py-2 rounded-xl flex items-center gap-2 ${isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600"
                    }`}>
                    <Cigarette className="w-4 h-4 rotate-45" /> Non-Smoker
                  </span>
                )}
                {post.pets && (
                  <span className={`px-4 py-2 rounded-xl flex items-center gap-2 ${isDark ? "bg-purple-500/10 text-purple-400" : "bg-purple-50 text-purple-600"
                    }`}>
                    <Cat className="w-4 h-4" /> Pet Friendly
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Contact & Safety */}
          <div className="space-y-6">
            <div className={`p-6 rounded-3xl border ${isDark ? "bg-dark-800 border-white/10" : "bg-white border-slate-200"}`}>
              <h3 className={`font-bold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
                Interested in teaming up?
              </h3>
              <button
                onClick={handleMessage}
                disabled={sendingMessage || (user?.id === post.userId) || false}
                className="w-full py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 mb-3">
                <MessageCircle className="w-5 h-5" />
                {user && user.id === post.userId
                  ? 'Your Post'
                  : sendingMessage
                    ? 'Sending...'
                    : `Message ${post.userName.split(' ')[0]}`}
              </button>
              <p className="text-xs text-center text-slate-500">
                Typically replies within few hours
              </p>
            </div>

            <div className={`p-6 rounded-3xl border ${isDark ? "bg-dark-800 border-white/10" : "bg-white border-slate-200"}`}>
              <h3 className={`font-bold mb-4 flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                <BadgeCheck className="w-5 h-5 text-emerald-500" />
                Safety Verified
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-slate-500">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  Email Verified
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-500">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  Phone Verified
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-500">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  Identity Verified
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
