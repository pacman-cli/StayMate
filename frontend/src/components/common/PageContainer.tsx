"use client"

import { useTheme } from "@/context/ThemeContext"
import { motion } from "framer-motion"
import { ReactNode } from "react"

interface PageContainerProps {
    title?: string
    description?: string
    action?: ReactNode
    children: ReactNode
    className?: string
}

export default function PageContainer({
    title,
    description,
    action,
    children,
    className = "",
}: PageContainerProps) {
    const { isDark } = useTheme()

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Page Header */}
            {(title || description || action) && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b ${isDark ? "border-dark-800" : "border-slate-200"
                        }`}
                >
                    <div>
                        {title && (
                            <h1
                                className={`text-2xl sm:text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"
                                    }`}
                            >
                                {title}
                            </h1>
                        )}
                        {description && (
                            <p
                                className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"
                                    }`}
                            >
                                {description}
                            </p>
                        )}
                    </div>
                    {action && <div>{action}</div>}
                </motion.div>
            )}

            {/* Page Content */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
            >
                {children}
            </motion.div>
        </div>
    )
}

