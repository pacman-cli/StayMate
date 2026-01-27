"use client"

import { useAuth } from "@/context/AuthContext"
import { messageApi, roommateApi } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import { Calendar, Loader2, MapPin, MessageSquare, Sparkles, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { toast } from "react-hot-toast"

interface RoommatePostDto {
  id: number
  userId: number
  userName: string
  userAvatar: string
  location: string
  budget: number
  moveInDate: string
  bio: string
  genderPreference: string
  smoking: boolean
  pets: boolean
  occupation: string
  matchScore?: number
  matchExplanation?: string
}

export default function MatchesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [matches, setMatches] = useState<RoommatePostDto[]>([])
  const [loading, setLoading] = useState(true)
  const [connectingId, setConnectingId] = useState<number | null>(null)

  // Prevent duplicate fetches (React Strict Mode protection)
  const fetchedRef = useRef(false)

  const [incomingRequests, setIncomingRequests] = useState<any[]>([])

  useEffect(() => {
    const fetchMatches = async () => {
      if (fetchedRef.current) return // Already fetched
      fetchedRef.current = true

      try {
        const [matchesData, requestsData] = await Promise.all([
          roommateApi.getMatches(),
          roommateApi.getIncomingRequests()
        ])
        setMatches(matchesData || [])
        setIncomingRequests(requestsData || [])
      } catch (error: any) {
        console.error("Failed to fetch matches", error)
        if (error.response?.status !== 404) {
          toast.error("Unable to load matches.")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [])

  const handleConnect = async (matchUserId: number) => {
    setConnectingId(matchUserId)
    try {
      const conversation = await messageApi.createConversation({
        recipientId: matchUserId,
        initialMessage: "Hi! I saw your roommate profile and thought we might be a good match."
      })
      router.push(`/messages?conversation=${conversation.id}`)
      toast.success("Connection started!")
    } catch (error) {
      console.error("Failed to connect", error)
      toast.error("Failed to start conversation")
    } finally {
      setConnectingId(null)
    }
  }

  const handleRequestMatch = async (userId: number) => {
    if (!confirm("Send a roommate match request? This will notify them.")) return
    try {
      await roommateApi.sendRequest(userId)
      toast.success("Request sent successfully!")
    } catch (error) {
      toast.error("Failed to send request")
    }
  }

  const handleRespond = async (requestId: number, accept: boolean) => {
    try {
      await roommateApi.respondToRequest(requestId, accept)
      toast.success(accept ? "You have a new roommate!" : "Request declined")
      // Refresh
      const requests = await roommateApi.getIncomingRequests()
      setIncomingRequests(requests)
    } catch (error) {
      toast.error("Failed to respond")
    }
  }


  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Incoming Requests Section */}
      {incomingRequests.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Incoming Match Requests
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {incomingRequests.map(req => (
              <div key={req.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={req.requester.profilePictureUrl || "/default-avatar.png"} className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{req.requester.firstName} {req.requester.lastName}</p>
                    <p className="text-xs text-slate-500">Wants to be your roommate</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleRespond(req.id, true)} className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700">Accept</button>
                  <button onClick={() => handleRespond(req.id, false)} className="px-3 py-1 bg-red-100 text-red-600 text-xs rounded-md hover:bg-red-200">Decline</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            Your Perfect Matches
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Based on your budget, location, and lifestyle preferences.
          </p>
        </div>
        <Link
          href="/dashboard/roommates/create"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          Update My Preferences
        </Link>
      </div>

      {matches.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-700 shadow-sm">
          <User className="h-12 w-12 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            No matches found yet
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            We couldn't find any roommates matching your criteria right now. Try expanding your budget or location preferences.
          </p>
          <Link
            href="/dashboard/roommates/create"
            className="text-blue-600 hover:underline font-medium"
          >
            Edit Match Preferences
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <div key={match.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition group">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={match.userAvatar}
                      alt={match.userName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-slate-100 dark:border-slate-700"
                    />
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {match.userName}
                      </h3>
                      <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                        {match.occupation}
                      </p>
                    </div>
                  </div>
                  {match.matchScore && (
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30">
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        {match.matchScore}%
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  {/* AI Insight Section */}
                  {match.matchExplanation && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                      <div className="flex gap-2 items-start">
                        <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                        <p className="text-sm text-indigo-700 dark:text-indigo-300 italic">
                          "{match.matchExplanation}"
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span>{match.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(match.budget)}
                    </span>
                    <span className="text-slate-400">/ month</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>Move-in: {match.moveInDate}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {match.smoking && (
                    <span className="px-2 py-1 text-xs rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      Smoker
                    </span>
                  )}
                  {match.pets && (
                    <span className="px-2 py-1 text-xs rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      Has Pets
                    </span>
                  )}
                  <span className="px-2 py-1 text-xs rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {match.genderPreference === 'ANY' ? 'Any Gender' : match.genderPreference}
                  </span>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-6 h-10">
                  {match.bio}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleRequestMatch(match.userId)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Request Match
                  </button>
                  <button
                    onClick={() => handleConnect(match.userId)}
                    disabled={connectingId === match.userId}
                    className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
