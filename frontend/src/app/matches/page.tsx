"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import DashboardLayout from "@/components/DashboardLayout";
import AnimatedCard from "@/components/common/AnimatedCard";
import EmptyState from "@/components/common/EmptyState";
import LoadingState from "@/components/common/LoadingState";
import PageContainer from "@/components/common/PageContainer";
import { Loader2, UserCheck, MessageSquare, Trash2, Heart, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import apiClient from "@/lib/api";
import { toast } from "react-hot-toast";

type Match = {
    id: number;
    userId: number;
    userName: string;
    matchedUserId: number;
    matchedUserName: string;
    matchedUserProfilePictureUrl?: string;
    matchPercentage: number;
    createdAt: string;
};

export default function MatchesPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { isDark } = useTheme();
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchMatches();
        }
    }, [isAuthenticated]);

    const fetchMatches = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get("/matches");
            const data = response.data.content ? response.data.content : response.data;
            setMatches(data);
        } catch (error) {
            console.error("Failed to fetch matches:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUnmatch = async (id: number) => {
        if (!confirm("Are you sure you want to unmatch?")) return;

        try {
            await apiClient.delete(`/matches/${id}`);
            toast.success("Unmatched successfully");
            setMatches((prev) => prev.filter((m) => m.id !== id));
        } catch (error) {
            console.error("Failed to unmatch:", error);
            toast.error("Failed to unmatch");
        }
    };

    const getMatchColor = (percentage: number) => {
        if (percentage >= 80) return "from-emerald-500 to-teal-500";
        if (percentage >= 60) return "from-blue-500 to-cyan-500";
        if (percentage >= 40) return "from-yellow-500 to-orange-500";
        return "from-slate-500 to-slate-600";
    };

    if (authLoading) {
        return (
            <DashboardLayout>
                <LoadingState message="Loading matches..." />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <PageContainer
                title="My Matches"
                description="People you've matched with based on compatibility and preferences"
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
                                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                                    isDark
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
                                        {match.matchedUserProfilePictureUrl ? (
                                            <img
                                                src={match.matchedUserProfilePictureUrl}
                                                alt={match.matchedUserName}
                                                className="w-24 h-24 rounded-full object-cover border-4 border-primary-500/20"
                                            />
                                        ) : (
                                            <div
                                                className={`w-24 h-24 rounded-full flex items-center justify-center border-4 border-primary-500/20 ${
                                                    isDark ? "bg-white/10" : "bg-slate-100"
                                                }`}
                                            >
                                                <UserCheck
                                                    className={`w-12 h-12 ${
                                                        isDark ? "text-slate-400" : "text-slate-500"
                                                    }`}
                                                />
                                            </div>
                                        )}
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.2 + index * 0.1, type: "spring" }}
                                            className={`absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br ${getMatchColor(
                                                match.matchPercentage
                                            )} flex items-center justify-center text-white text-xs font-bold border-4 ${
                                                isDark ? "border-dark-800" : "border-white"
                                            } shadow-lg`}
                                        >
                                            {Math.round(match.matchPercentage)}%
                                        </motion.div>
                                    </motion.div>
                                </div>

                                {/* User Info */}
                                <h3
                                    className={`font-semibold text-xl mb-1 ${
                                        isDark ? "text-white" : "text-slate-900"
                                    }`}
                                >
                                    {match.matchedUserName}
                                </h3>
                                <p
                                    className={`text-sm mb-4 ${
                                        isDark ? "text-slate-400" : "text-slate-500"
                                    }`}
                                >
                                    Matched {new Date(match.createdAt).toLocaleDateString()}
                                </p>

                                {/* Compatibility Score Bar */}
                                <div className="w-full mb-4">
                                    <div
                                        className={`h-2 rounded-full overflow-hidden ${
                                            isDark ? "bg-white/10" : "bg-slate-200"
                                        }`}
                                    >
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${match.matchPercentage}%` }}
                                            transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                                            className={`h-full bg-gradient-to-r ${getMatchColor(
                                                match.matchPercentage
                                            )}`}
                                        />
                                    </div>
                                    <p
                                        className={`text-xs mt-1 ${
                                            isDark ? "text-slate-500" : "text-slate-400"
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
                                        onClick={() => router.push(`/messages?userId=${match.matchedUserId}`)}
                                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                            isDark
                                                ? "bg-primary-500 hover:bg-primary-600 text-white"
                                                : "bg-primary-600 hover:bg-primary-700 text-white"
                                        }`}
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        Message
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleUnmatch(match.id)}
                                        className={`px-4 py-2.5 rounded-lg transition-colors ${
                                            isDark
                                                ? "bg-white/10 hover:bg-red-500/20 text-red-400 hover:text-red-300"
                                                : "bg-slate-100 hover:bg-red-50 text-red-600 hover:text-red-700"
                                        }`}
                                        title="Unmatch"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </motion.button>
                                </div>
                            </AnimatedCard>
                        ))}
                    </div>
                )}
            </PageContainer>
        </DashboardLayout>
    );
}
