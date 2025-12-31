"use client"

import { useTheme } from "@/context/ThemeContext"
import { LucideIcon } from "lucide-react"
import { motion } from "framer-motion"
import { ReactNode } from "react"

interface EmptyStateProps {
    icon: LucideIcon
    title: string
    description?: string
    action?: ReactNode
}

export default function EmptyState({
    icon: Icon,
    title,
    description,
    action,
}: EmptyStateProps) {
    const { isDark } = useTheme()

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-16 px-4 text-center"
        >
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
                    isDark
                        ? "bg-white/5 border border-white/10"
                        : "bg-slate-100 border border-slate-200"
                }`}
            >
                <Icon
                    className={`w-10 h-10 ${
                        isDark ? "text-slate-500" : "text-slate-400"
                    }`}
                />
            </motion.div>
            <h3
                className={`text-xl font-semibold mb-2 ${
                    isDark ? "text-white" : "text-slate-900"
                }`}
            >
                {title}
            </h3>
            {description && (
                <p
                    className={`max-w-md text-sm mb-6 ${
                        isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                >
                    {description}
                </p>
            )}
            {action && <div>{action}</div>}
        </motion.div>
    )
}

