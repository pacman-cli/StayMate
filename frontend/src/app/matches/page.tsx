"use client"

import DashboardLayout from "@/components/DashboardLayout"
import AnimatedCard from "@/components/common/AnimatedCard"
import Avatar from "@/components/common/Avatar"
import EmptyState from "@/components/common/EmptyState"
import LoadingState from "@/components/common/LoadingState"
import PageContainer from "@/components/common/PageContainer"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import apiClient, { messageApi } from "@/lib/api"
import { motion } from "framer-motion"
import { MessageSquare, Sparkles, UserCheck } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

// Match type aligned with backend RoommatePostDto
type Match = {
    id: number
    userId: number
    userName: string
    userAvatar?: string
    location: string
    budget: number
    moveInDate: string
    bio?: string
    genderPreference?: string
    matchScore?: number
    matchExplanation?: string
    createdAt: string
}

export default function MatchesPage() {
    const router = useRouter()
    const { isAuthenticated, isLoading: authLoading } = useAuth()
    const { isDark } = useTheme()
    const [matches, setMatches] = useState<Match[]>([])
    const [loading, setLoading] = useState(true)
    const [connectingId, setConnectingId] = useState<number | null>(null)

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login")
        }
    }, [authLoading, isAuthenticated, router])

    useEffect(() => {
        if (isAuthenticated) {
            fetchMatches()
        }
    }, [isAuthenticated])

    const fetchMatches = async () => {
        setLoading(true)
        try {
            const response = await apiClient.get("/api/roommates/matches")
            const data = response.data.content ? response.data.content : response.data
            console.log("Matches response:", data)
            setMatches(data)
        } catch (error) {
            console.error("Failed to fetch matches:", error)
            toast.error("Failed to load matches")
        } finally {
            setLoading(false)
        }
    }

    const getMatchColor = (score: number) => {
        if (score >= 80) return "from-emerald-500 to-teal-500"
        if (score >= 60) return "from-blue-500 to-cyan-500"
        if (score >= 40) return "from-yellow-500 to-orange-500"
        return "from-slate-500 to-slate-600"
    }

    const handleMessage = async (match: Match) => {
        setConnectingId(match.userId)
        try {
            const conversation = await messageApi.createConversation({
                recipientId: match.userId,
                initialMessage: `Hi ${match.userName.split(' ')[0]}! I saw we're a great match and wanted to connect.`
            })
            router.push(`/messages?conversation=${conversation.id}`)
        } catch (error) {
            console.error("Failed to start conversation:", error)
            toast.error("Failed to start conversation")
        } finally {
            setConnectingId(null)
        }
    }

    if (authLoading) {
        return (
            <DashboardLayout>
                <LoadingState message="Loading matches..." />
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <PageContainer
                title="My Matches"
                description="Compatible roommates based on your preferences and lifestyle"
            >
                {loading ? (
                    <LoadingState message="Loading matches..." />
                ) : matches.length === 0 ? (
                    <EmptyState
                        icon={UserCheck}
                        title="No matches yet"
                        description="Start exploring roommate posts to find compatible matches based on your preferences and lifestyle."
                        action={
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => router.push('/roommates')}
                                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${isDark
                                    ? "bg-primary-500 hover:bg-primary-600 text-white"
                                    : "bg-primary-600 hover:bg-primary-700 text-white"
                                    }`}
                            >
                                <Sparkles className="w-5 h-5" />
                                Find Roommates
                            </motion.button>
                        }
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {matches.map((match, index) => (
                            <AnimatedCard
                                key={match.id}
                                delay={index * 0.1}
                                className="p-6 flex flex-col items-center text-center"
                            >
                                {/* Profile Picture with Match Badge */}
                                <div className="relative mb-4">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        className="relative"
                                    >
                                        <Avatar
                                            name={match.userName}
                                            src={match.userAvatar}
                                            size="xl"
                                            className="border-4 border-primary-500/20"
                                        />
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.2 + index * 0.1, type: "spring" }}
                                            className={`absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br ${getMatchColor(
                                                match.matchScore || 0
                                            )} flex items-center justify-center text-white text-xs font-bold border-4 ${isDark ? "border-dark-800" : "border-white"
                                                } shadow-lg`}
                                        >
                                            {Math.round(match.matchScore || 0)}%
                                        </motion.div>
                                    </motion.div>
                                </div>

                                {/* User Info */}
                                <h3
                                    className={`font-semibold text-xl mb-1 ${isDark ? "text-white" : "text-slate-900"
                                        }`}
                                >
                                    {match.userName}
                                </h3>
                                <p
                                    className={`text-sm mb-2 ${isDark ? "text-slate-400" : "text-slate-500"
                                        }`}
                                >
                                    {match.location} • ৳{match.budget?.toLocaleString()}
                                </p>
                                {match.matchExplanation && (
                                    <p className={`text-xs italic mb-4 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                                        {match.matchExplanation}
                                    </p>
                                )}

                                {/* Compatibility Score Bar */}
                                <div className="w-full mb-4">
                                    <div
                                        className={`h-2 rounded-full overflow-hidden ${isDark ? "bg-white/10" : "bg-slate-200"
                                            }`}
                                    >
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${match.matchScore || 0}%` }}
                                            transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                                            className={`h-full bg-gradient-to-r ${getMatchColor(
                                                match.matchScore || 0
                                            )}`}
                                        />
                                    </div>
                                    <p
                                        className={`text-xs mt-1 ${isDark ? "text-slate-500" : "text-slate-400"
                                            }`}
                                    >
                                        Compatibility Score
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 w-full mt-auto">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleMessage(match)}
                                        disabled={connectingId === match.userId}
                                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 ${isDark
                                            ? "bg-primary-500 hover:bg-primary-600 text-white"
                                            : "bg-primary-600 hover:bg-primary-700 text-white"
                                            }`}
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        {connectingId === match.userId ? "Connecting..." : "Message"}
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => router.push(`/roommates/${match.id}`)}
                                        className={`px-4 py-2.5 rounded-xl transition-colors ${isDark
                                            ? "bg-white/10 hover:bg-white/20 text-slate-300"
                                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                            }`}
                                        title="View Profile"
                                    >
                                        <UserCheck className="w-4 h-4" />
                                    </motion.button>
                                </div>
                            </AnimatedCard>
                        ))}
                    </div>
                )}
            </PageContainer>
        </DashboardLayout>
    )
}
