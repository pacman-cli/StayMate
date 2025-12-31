"use client"

import { useTheme } from "@/context/ThemeContext"
import { motion } from "framer-motion"
import { ReactNode } from "react"

interface AnimatedCardProps {
    children: ReactNode
    className?: string
    delay?: number
    hover?: boolean
    onClick?: () => void
}

export default function AnimatedCard({
    children,
    className = "",
    delay = 0,
    hover = true,
    onClick,
}: AnimatedCardProps) {
    const { isDark } = useTheme()

    const baseClasses = `
        rounded-xl border transition-all duration-300
        ${isDark
            ? "bg-dark-800/50 border-white/10 hover:border-white/20"
            : "bg-white border-slate-200 hover:border-primary-200 shadow-md hover:shadow-lg"
        }
        ${onClick ? "cursor-pointer" : ""}
        ${className}
    `

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            whileHover={hover ? { scale: 1.02, y: -2 } : {}}
            className={baseClasses}
            onClick={onClick}
        >
            {children}
        </motion.div>
    )
}

