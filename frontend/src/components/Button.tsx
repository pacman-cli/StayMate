"use client"

import { useTheme } from "@/context/ThemeContext"
import { Loader2 } from "lucide-react"
import { ButtonHTMLAttributes, ReactNode } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode
    variant?: "primary" | "secondary" | "ghost" | "danger" | "outline" | "glow"
    size?: "sm" | "md" | "lg" | "xl"
    isLoading?: boolean
    leftIcon?: ReactNode
    rightIcon?: ReactNode
    fullWidth?: boolean
}

export default function Button({
    children,
    variant = "primary",
    size = "md",
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    className = "",
    disabled,
    ...props
}: ButtonProps) {
    const { isDark } = useTheme()

    const sizeClasses = {
        sm: "px-3 py-1.5 text-sm rounded-lg gap-1.5",
        md: "px-4 py-2.5 text-sm rounded-xl gap-2",
        lg: "px-6 py-3 text-base rounded-xl gap-2",
        xl: "px-8 py-4 text-lg rounded-2xl gap-3",
    }

    const baseClasses = `
        relative inline-flex items-center justify-center font-medium
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${fullWidth ? "w-full" : ""}
    `

    const variantClasses = {
        primary: `
            text-white
            bg-gradient-to-r from-primary-500 to-primary-600
            hover:from-primary-600 hover:to-primary-700
            hover:scale-[1.02] active:scale-[0.98]
            ${isDark ? "shadow-glow-sm hover:shadow-glow" : "shadow-md hover:shadow-lg"}
        `,
        secondary: `
            ${isDark
                ? "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                : "bg-dark-100 text-dark-900 border border-dark-200 hover:bg-dark-200"
            }
            hover:scale-[1.02] active:scale-[0.98]
        `,
        ghost: `
            ${isDark
                ? "text-dark-300 hover:text-white hover:bg-white/10"
                : "text-dark-600 hover:text-dark-900 hover:bg-dark-100"
            }
        `,
        danger: `
            text-white
            bg-gradient-to-r from-red-500 to-red-600
            hover:from-red-600 hover:to-red-700
            hover:scale-[1.02] active:scale-[0.98]
            shadow-md hover:shadow-lg
        `,
        outline: `
            bg-transparent
            ${isDark
                ? "text-primary-400 border-2 border-primary-500/50 hover:border-primary-400 hover:bg-primary-500/10"
                : "text-primary-600 border-2 border-primary-500 hover:bg-primary-50"
            }
            hover:scale-[1.02] active:scale-[0.98]
        `,
        glow: `
            text-white
            bg-gradient-to-r from-primary-500 via-purple-500 to-primary-500
            bg-[length:200%_100%]
            animate-shimmer
            hover:scale-[1.02] active:scale-[0.98]
            ${isDark ? "shadow-glow hover:shadow-glow-lg" : "shadow-lg hover:shadow-xl"}
        `,
    }

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            disabled={disabled || isLoading}
            data-loading={isLoading}
            {...props}
        >
            {/* Loading Spinner - Absolute Center to prevent layout shift */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-inherit">
                    <Loader2 className="w-4 h-4 animate-spin" />
                </div>
            )}

            {/* Content Wrapper - Invisible when loading but preserves width */}
            <div className={`flex items-center gap-2 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
                <span>{children}</span>
                {rightIcon && (
                    <span className="flex-shrink-0 transition-transform group-hover:translate-x-1">
                        {rightIcon}
                    </span>
                )}
            </div>

            {/* Glow effect overlay for primary and glow variants */}
            {(variant === "primary" || variant === "glow") && isDark && !isLoading && (
                <div className="absolute inset-0 rounded-inherit opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            )}
        </button>
    )
}

// Icon Button variant
export function IconButton({
    children,
    variant = "ghost",
    size = "md",
    className = "",
    ...props
}: Omit<ButtonProps, "leftIcon" | "rightIcon" | "fullWidth">) {
    const { isDark } = useTheme()

    const sizeClasses = {
        sm: "p-1.5 rounded-lg",
        md: "p-2 rounded-xl",
        lg: "p-3 rounded-xl",
        xl: "p-4 rounded-2xl",
    }

    const variantClasses = {
        primary: `
            text-white bg-gradient-to-r from-primary-500 to-primary-600
            hover:from-primary-600 hover:to-primary-700
            ${isDark ? "shadow-glow-sm" : "shadow-md"}
        `,
        secondary: `
            ${isDark
                ? "bg-white/10 text-white hover:bg-white/20"
                : "bg-dark-100 text-dark-700 hover:bg-dark-200"
            }
        `,
        ghost: `
            ${isDark
                ? "text-dark-400 hover:text-white hover:bg-white/10"
                : "text-dark-500 hover:text-dark-900 hover:bg-dark-100"
            }
        `,
        danger: `
            text-white bg-gradient-to-r from-red-500 to-red-600
            hover:from-red-600 hover:to-red-700
        `,
        outline: `
            ${isDark
                ? "text-primary-400 border border-primary-500/50 hover:bg-primary-500/10"
                : "text-primary-600 border border-primary-500 hover:bg-primary-50"
            }
        `,
        glow: `
            text-white bg-gradient-to-r from-primary-500 to-primary-600
            ${isDark ? "shadow-glow-sm hover:shadow-glow" : "shadow-md"}
        `,
    }

    return (
        <button
            className={`
                inline-flex items-center justify-center
                transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed
                hover:scale-105 active:scale-95
                ${sizeClasses[size]}
                ${variantClasses[variant]}
                ${className}
            `}
            {...props}
        >
            {children}
        </button>
    )
}
