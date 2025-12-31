"use client"

import { useTheme } from "@/context/ThemeContext"
import { Loader2 } from "lucide-react"
import { motion } from "framer-motion"

interface LoadingStateProps {
    message?: string
    fullScreen?: boolean
}

export default function LoadingState({
    message = "Loading...",
    fullScreen = false,
}: LoadingStateProps) {
    const { isDark } = useTheme()

    const content = (
        <div className="flex flex-col items-center justify-center gap-4">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
                <Loader2
                    className={`w-8 h-8 ${
                        isDark ? "text-primary-400" : "text-primary-600"
                    }`}
                />
            </motion.div>
            <p
                className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
                {message}
            </p>
        </div>
    )

    if (fullScreen) {
        return (
            <div
                className={`fixed inset-0 flex items-center justify-center ${
                    isDark ? "bg-dark-950" : "bg-white"
                }`}
            >
                {content}
            </div>
        )
    }

    return <div className="py-16">{content}</div>
}

