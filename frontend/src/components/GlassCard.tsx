"use client"

import { useTheme } from "@/context/ThemeContext"
import { ReactNode } from "react"

interface GlassCardProps {
    children: ReactNode
    className?: string
    hover?: boolean
    glow?: boolean
    padding?: "none" | "sm" | "md" | "lg" | "xl"
    blur?: "sm" | "md" | "lg" | "xl"
}

export default function GlassCard({
    children,
    className = "",
    hover = false,
    glow = false,
    padding = "lg",
    blur = "lg",
}: GlassCardProps) {
    const { isDark } = useTheme()

    const paddingClasses = {
        none: "",
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
        xl: "p-8",
    }

    const blurClasses = {
        sm: "backdrop-blur-sm",
        md: "backdrop-blur-md",
        lg: "backdrop-blur-lg",
        xl: "backdrop-blur-xl",
    }

    return (
        <div
            className={`
                relative rounded-2xl overflow-hidden transition-all duration-300
                ${paddingClasses[padding]}
                ${isDark
                    ? "bg-dark-800 border-dark-700 shadow-xl shadow-black/20"
                    : "bg-white border-slate-200 shadow-lg"
                }
                ${hover
                    ? isDark
                        ? "hover:bg-dark-750 hover:border-dark-600 hover:shadow-elevation-high"
                        : "hover:bg-slate-50 hover:shadow-xl hover:border-slate-300"
                    : ""
                }
                ${glow && isDark
                    ? "shadow-glow-sm hover:shadow-glow"
                    : ""
                }
                ${className}
            `}
        >
            {/* Gradient overlay for depth */}
            <div
                className={`absolute inset-0 pointer-events-none ${isDark
                    ? "bg-gradient-to-br from-white/5 via-transparent to-transparent"
                    : "bg-gradient-to-br from-white/50 via-transparent to-transparent"
                    }`}
            />

            {/* Content */}
            <div className="relative z-10">{children}</div>

            {/* Subtle inner glow effect */}
            {glow && isDark && (
                <div className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-br from-primary-500/5 to-transparent" />
            )}
        </div>
    )
}

// Variant for smaller cards
export function GlassCardSmall({
    children,
    className = "",
    hover = true,
}: {
    children: ReactNode
    className?: string
    hover?: boolean
}) {
    return (
        <GlassCard
            padding="md"
            blur="md"
            hover={hover}
            className={className}
        >
            {children}
        </GlassCard>
    )
}

// Variant for feature cards with icon
export function GlassFeatureCard({
    icon,
    title,
    description,
    className = "",
}: {
    icon: ReactNode
    title: string
    description: string
    className?: string
}) {
    const { isDark } = useTheme()

    return (
        <GlassCard hover glow className={className}>
            <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${isDark
                    ? "bg-primary-500/20 text-primary-400"
                    : "bg-primary-100 text-primary-600"
                    }`}
            >
                {icon}
            </div>
            <h3
                className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-dark-900"
                    }`}
            >
                {title}
            </h3>
            <p
                className={`text-sm leading-relaxed ${isDark ? "text-dark-400" : "text-dark-600"
                    }`}
            >
                {description}
            </p>
        </GlassCard>
    )
}
