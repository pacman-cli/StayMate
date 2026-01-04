// Color utility for consistent theming across landing page components

export interface ColorClasses {
    bg: string
    text: string
    border: string
    gradient: string
}

export function getColorClasses(color: string, isDark: boolean): ColorClasses {
    const colors: Record<string, ColorClasses> = {
        primary: {
            bg: isDark ? "bg-primary-500/20" : "bg-primary-100",
            text: isDark ? "text-primary-400" : "text-primary-600",
            border: isDark ? "border-primary-500/30" : "border-primary-200",
            gradient: "from-primary-500 to-primary-600",
        },
        purple: {
            bg: isDark ? "bg-purple-500/20" : "bg-purple-100",
            text: isDark ? "text-purple-400" : "text-purple-600",
            border: isDark ? "border-purple-500/30" : "border-purple-200",
            gradient: "from-purple-500 to-purple-600",
        },
        emerald: {
            bg: isDark ? "bg-emerald-500/20" : "bg-emerald-100",
            text: isDark ? "text-emerald-400" : "text-emerald-600",
            border: isDark ? "border-emerald-500/30" : "border-emerald-200",
            gradient: "from-emerald-500 to-emerald-600",
        },
        amber: {
            bg: isDark ? "bg-amber-500/20" : "bg-amber-100",
            text: isDark ? "text-amber-400" : "text-amber-600",
            border: isDark ? "border-amber-500/30" : "border-amber-200",
            gradient: "from-amber-500 to-amber-600",
        },
        rose: {
            bg: isDark ? "bg-rose-500/20" : "bg-rose-100",
            text: isDark ? "text-rose-400" : "text-rose-600",
            border: isDark ? "border-rose-500/30" : "border-rose-200",
            gradient: "from-rose-500 to-rose-600",
        },
        cyan: {
            bg: isDark ? "bg-cyan-500/20" : "bg-cyan-100",
            text: isDark ? "text-cyan-400" : "text-cyan-600",
            border: isDark ? "border-cyan-500/30" : "border-cyan-200",
            gradient: "from-cyan-500 to-cyan-600",
        },
        red: {
            bg: isDark ? "bg-red-500/20" : "bg-red-100",
            text: isDark ? "text-red-400" : "text-red-600",
            border: isDark ? "border-red-500/30" : "border-red-200",
            gradient: "from-red-500 to-red-600",
        },
        orange: {
            bg: isDark ? "bg-orange-500/20" : "bg-orange-100",
            text: isDark ? "text-orange-400" : "text-orange-600",
            border: isDark ? "border-orange-500/30" : "border-orange-200",
            gradient: "from-orange-500 to-orange-600",
        },
        yellow: {
            bg: isDark ? "bg-yellow-500/20" : "bg-yellow-100",
            text: isDark ? "text-yellow-400" : "text-yellow-600",
            border: isDark ? "border-yellow-500/30" : "border-yellow-200",
            gradient: "from-yellow-500 to-yellow-600",
        },
        blue: {
            bg: isDark ? "bg-blue-500/20" : "bg-blue-100",
            text: isDark ? "text-blue-400" : "text-blue-600",
            border: isDark ? "border-blue-500/30" : "border-blue-200",
            gradient: "from-blue-500 to-blue-600",
        },
    }
    return colors[color] || colors.primary
}
