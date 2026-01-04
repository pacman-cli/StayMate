import { DashboardMetric } from "@/types/auth"
import {
    Activity,
    AlertCircle,
    Building,
    Calendar,
    CalendarCheck,
    CheckCircle,
    Clock,
    DollarSign,
    Eye,
    Heart,
    Home,
    Lock,
    MessageSquare,
    Send,
    Shield,
    TrendingDown,
    TrendingUp,
    UserCheck,
    Users,
} from "lucide-react"

interface StatsGridProps {
    metrics: DashboardMetric[]
    isDark: boolean
}

const iconMap: Record<string, any> = {
    users: Users,
    home: Home,
    activity: Activity,
    "alert-circle": AlertCircle,
    building: Building,
    calendar: Calendar,
    "calendar-check": CalendarCheck,
    clock: Clock,
    "check-circle": CheckCircle,
    "dollar-sign": DollarSign,
    eye: Eye,
    "message-square": MessageSquare,
    send: Send,
    heart: Heart,
    "user-check": UserCheck,
    shield: Shield,
    lock: Lock,
}

const colorClasses: Record<string, { bg: string; text: string }> = {
    blue: {
        bg: "bg-blue-100 dark:bg-blue-500/10",
        text: "text-blue-600 dark:text-blue-400",
    },
    emerald: {
        bg: "bg-emerald-100 dark:bg-emerald-500/10",
        text: "text-emerald-600 dark:text-emerald-400",
    },
    purple: {
        bg: "bg-purple-100 dark:bg-purple-500/10",
        text: "text-purple-600 dark:text-purple-400",
    },
    amber: {
        bg: "bg-amber-100 dark:bg-amber-500/10",
        text: "text-amber-600 dark:text-amber-400",
    },
    rose: {
        bg: "bg-rose-100 dark:bg-rose-500/10",
        text: "text-rose-600 dark:text-rose-400",
    },
}

export function StatsGrid({ metrics, isDark }: StatsGridProps) {
    if (!metrics || metrics.length === 0) return null

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((stat, idx) => {
                const Icon = iconMap[stat.icon] || Activity
                const colors = colorClasses[stat.color] || colorClasses.blue

                return (
                    <div
                        key={idx}
                        className={`p-5 rounded-xl border ${isDark
                            ? "bg-dark-800 border-dark-700"
                            : "bg-white border-slate-200"
                            } hover:shadow-lg transition-all`}
                    >
                        <div className="flex items-start justify-between">
                            <div className={`p-2.5 rounded-xl ${colors.bg} ${colors.text}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            {stat.change && (
                                <span
                                    className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${stat.trend === "up"
                                        ? isDark
                                            ? "bg-emerald-500/10 text-emerald-400"
                                            : "bg-emerald-50 text-emerald-600"
                                        : isDark
                                            ? "bg-rose-500/10 text-rose-400"
                                            : "bg-rose-50 text-rose-600"
                                        }`}
                                >
                                    {stat.trend === "up" ? (
                                        <TrendingUp className="w-3 h-3" />
                                    ) : (
                                        <TrendingDown className="w-3 h-3" />
                                    )}
                                    {stat.change}
                                </span>
                            )}
                        </div>
                        <p
                            className={`mt-4 text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"
                                }`}
                        >
                            {stat.value}
                        </p>
                        <p
                            className={`text-sm ${isDark ? "text-slate-500" : "text-slate-500"
                                }`}
                        >
                            {stat.label}
                        </p>
                    </div>
                )
            })}
        </div>
    )
}
