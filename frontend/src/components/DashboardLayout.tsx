"use client"

import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { messageApi, notificationApi } from "@/lib/api"
import {
    NotificationResponse,
    NotificationType,
    getNotificationIconColor,
} from "@/types/auth"
import {
    AlertTriangle,
    Bell,
    Building,
    Calendar,
    ChevronDown,
    Crown,
    LogOut,
    Megaphone,
    MessageSquare,
    Search,
    Settings,
    Shield,
    Star,
    User,
    Users,
    Wallet
} from "lucide-react"
import Link from "next/link"
import { ReactNode, useCallback, useEffect, useRef, useState } from "react"
import DeletionCountdown from "./DeletionCountdown"
import QuickAccessFAB from "./QuickAccessFAB"
import Sidebar from "./Sidebar"
import ThemeSwitcher from "./ThemeSwitcher"

interface DashboardLayoutProps {
    children: ReactNode
    title?: string
    description?: string
}

// Icon mapping for notification types
const getNotificationIcon = (
    type: NotificationType,
    size: string = "w-4 h-4",
) => {
    switch (type) {
        case "NEW_MESSAGE":
            return <MessageSquare className={size} />
        case "BOOKING_REQUEST":
        case "BOOKING_CONFIRMED":
        case "BOOKING_CANCELLED":
        case "BOOKING_REMINDER":
            return <Calendar className={size} />
        case "PROPERTY_INQUIRY":
        case "PROPERTY_APPROVED":
        case "PROPERTY_REJECTED":
        case "PROPERTY_VIEWED":
        case "LISTING_SAVED":
            return <Building className={size} />
        case "REVIEW_RECEIVED":
        case "REVIEW_REPLY":
            return <Star className={size} />
        case "VERIFICATION_APPROVED":
        case "VERIFICATION_REQUIRED":
            return <Shield className={size} />
        case "ROOMMATE_MATCH":
        case "ROOMMATE_REQUEST":
            return <Users className={size} />
        case "SYSTEM_ANNOUNCEMENT":
        case "WELCOME":
            return <Megaphone className={size} />
        case "SECURITY_ALERT":
            return <AlertTriangle className={size} />
        case "PAYMENT_RECEIVED":
        case "PAYMENT_FAILED":
        case "PAYOUT_SENT":
            return <Wallet className={size} />
        default:
            return <Bell className={size} />
    }
}

export default function DashboardLayout({
    children,
    title,
    description,
}: DashboardLayoutProps) {
    const { user, isAdmin, isHouseOwner, logout } = useAuth()
    const { isDark } = useTheme()
    const [profileOpen, setProfileOpen] = useState(false)
    const [notificationOpen, setNotificationOpen] = useState(false)
    const [searchFocused, setSearchFocused] = useState(false)
    const [unreadMessages, setUnreadMessages] = useState(0)
    const [unreadNotifications, setUnreadNotifications] = useState(0)
    const [notifications, setNotifications] = useState<NotificationResponse[]>(
        [],
    )
    const [isLoadingNotifications, setIsLoadingNotifications] = useState(false)
    const profileDropdownRef = useRef<HTMLDivElement>(null)
    const notificationDropdownRef = useRef<HTMLDivElement>(null)

    // Fetch unread message count
    const fetchUnreadCount = useCallback(async () => {
        try {
            const response = await messageApi.getUnreadCount()
            setUnreadMessages(response.totalUnreadCount)
        } catch (error) {
            // Silently fail - user might not be authenticated yet
        }
    }, [])

    // Fetch notification summary
    const fetchNotificationSummary = useCallback(async () => {
        try {
            const response = await notificationApi.getSummary()
            setUnreadNotifications(response.totalUnread)
            setNotifications(response.recentNotifications)
        } catch (error) {
            // Silently fail - user might not be authenticated yet
        }
    }, [])

    // Fetch unread counts on mount and periodically
    useEffect(() => {
        fetchUnreadCount()
        fetchNotificationSummary()
        const interval = setInterval(() => {
            fetchUnreadCount()
            fetchNotificationSummary()
        }, 30000) // Every 30 seconds
        return () => clearInterval(interval)
    }, [fetchUnreadCount, fetchNotificationSummary])

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                profileDropdownRef.current &&
                !profileDropdownRef.current.contains(event.target as Node)
            ) {
                setProfileOpen(false)
            }
            if (
                notificationDropdownRef.current &&
                !notificationDropdownRef.current.contains(event.target as Node)
            ) {
                setNotificationOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () =>
            document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // Mark notification as read
    const handleMarkAsRead = async (notificationId: number) => {
        try {
            await notificationApi.markSingleAsRead(notificationId)
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === notificationId ? { ...n, read: true } : n,
                ),
            )
            setUnreadNotifications((prev) => Math.max(0, prev - 1))
        } catch (error) {
            console.error("Failed to mark notification as read:", error)
        }
    }

    // Mark all notifications as read
    const handleMarkAllAsRead = async () => {
        try {
            await notificationApi.markAllAsRead()
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
            setUnreadNotifications(0)
        } catch (error) {
            console.error("Failed to mark all notifications as read:", error)
        }
    }

    const getRoleBadge = () => {
        if (isAdmin) {
            return {
                label: "Admin",
                className: isDark
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                    : "bg-amber-100 text-amber-700 border-amber-200",
                icon: <Crown className="w-3 h-3" />,
            }
        }
        if (isHouseOwner) {
            return {
                label: "Owner",
                className: isDark
                    ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                    : "bg-blue-100 text-blue-700 border-blue-200",
                icon: null,
            }
        }
        return {
            label: "Member",
            className: isDark
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : "bg-emerald-100 text-emerald-700 border-emerald-200",
            icon: null,
        }
    }

    const roleBadge = getRoleBadge()

    return (
        <div
            className={`min-h-screen transition-colors duration-500 overflow-x-hidden ${isDark
                ? "bg-dark-950"
                : "bg-gradient-to-br from-slate-50 via-white to-slate-50"
                }`}
        >
            {/* Subtle Grid Lines Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 hero-pattern">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: isDark
                            ? `linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)`
                            : `linear-gradient(rgba(0, 0, 0, 0.04) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(0, 0, 0, 0.04) 1px, transparent 1px)`,
                        backgroundSize: "48px 48px",
                    }}
                />
            </div>

            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="relative z-10 pl-64 transition-all duration-300">
                {/* Top Header */}
                <header
                    className={`sticky top-0 z-30 h-16 flex items-center justify-between px-6 border-b ${isDark
                        ? "bg-dark-900 border-white/5"
                        : "bg-white/80 backdrop-blur-xl border-slate-200"
                        }`}
                >
                    {/* Left: Page Title / Search */}
                    <div className="flex items-center gap-6 flex-1">
                        {/* Search Bar */}
                        <div
                            className={`relative flex items-center max-w-md flex-1 transition-all duration-300 ${searchFocused ? "max-w-lg" : ""
                                }`}
                        >
                            <Search
                                className={`absolute left-3 w-4 h-4 transition-colors ${searchFocused
                                    ? isDark
                                        ? "text-primary-400"
                                        : "text-primary-500"
                                    : isDark
                                        ? "text-slate-500"
                                        : "text-slate-400"
                                    }`}
                            />
                            <input
                                type="text"
                                placeholder="Search..."
                                onFocus={() => setSearchFocused(true)}
                                onBlur={() => setSearchFocused(false)}
                                className={`w-full pl-10 pr-4 py-2 text-sm rounded-lg border outline-none transition-all duration-300 ${isDark
                                    ? "bg-dark-800 border-dark-700 text-white placeholder-slate-500 focus:border-primary-500/50 focus:bg-dark-800"
                                    : "bg-slate-100 border-transparent text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:bg-white"
                                    }`}
                            />
                            <kbd
                                className={`absolute right-3 px-1.5 py-0.5 text-xs font-medium rounded ${isDark
                                    ? "bg-dark-700 text-slate-400"
                                    : "bg-slate-200 text-slate-500"
                                    }`}
                            >
                                ⌘K
                            </kbd>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3">
                        {/* Theme Switcher */}
                        <ThemeSwitcher />

                        {/* Messages */}
                        <Link
                            href="/messages"
                            className={`relative p-2 rounded-lg transition-colors ${isDark
                                ? "hover:bg-white/10 text-slate-400 hover:text-white"
                                : "hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                                }`}
                        >
                            <MessageSquare className="w-5 h-5" />
                            {unreadMessages > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-xs font-bold bg-primary-500 text-white rounded-full">
                                    {unreadMessages > 99
                                        ? "99+"
                                        : unreadMessages}
                                </span>
                            )}
                        </Link>

                        {/* Notifications Dropdown */}
                        <div className="relative" ref={notificationDropdownRef}>
                            <button
                                onClick={() => {
                                    setNotificationOpen(!notificationOpen)
                                    setProfileOpen(false)
                                }}
                                className={`relative p-2 rounded-lg transition-colors ${notificationOpen
                                    ? isDark
                                        ? "bg-dark-800 text-white"
                                        : "bg-slate-100 text-slate-900"
                                    : isDark
                                        ? "hover:bg-dark-800 text-slate-400 hover:text-white"
                                        : "hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                                    }`}
                            >
                                <Bell className="w-5 h-5" />
                                {unreadNotifications > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-xs font-bold bg-red-500 text-white rounded-full">
                                        {unreadNotifications > 99
                                            ? "99+"
                                            : unreadNotifications}
                                    </span>
                                )}
                            </button>

                            {/* Notification Dropdown */}
                            {notificationOpen && (
                                <div
                                    className={`absolute right-0 top-full mt-2 w-96 max-h-[32rem] rounded-xl shadow-xl border overflow-hidden ${isDark
                                        ? "bg-dark-800 border-white/10"
                                        : "bg-white border-slate-200"
                                        }`}
                                >
                                    {/* Header */}
                                    <div
                                        className={`px-4 py-3 border-b flex items-center justify-between ${isDark
                                            ? "border-white/10"
                                            : "border-slate-100"
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <h3
                                                className={`font-semibold ${isDark
                                                    ? "text-white"
                                                    : "text-slate-900"
                                                    }`}
                                            >
                                                Notifications
                                            </h3>
                                            {unreadNotifications > 0 && (
                                                <span
                                                    className={`px-2 py-0.5 text-xs font-medium rounded-full ${isDark
                                                        ? "bg-red-500/20 text-red-400"
                                                        : "bg-red-100 text-red-600"
                                                        }`}
                                                >
                                                    {unreadNotifications} new
                                                </span>
                                            )}
                                        </div>
                                        {unreadNotifications > 0 && (
                                            <button
                                                onClick={handleMarkAllAsRead}
                                                className={`text-xs font-medium transition-colors ${isDark
                                                    ? "text-primary-400 hover:text-primary-300"
                                                    : "text-primary-600 hover:text-primary-700"
                                                    }`}
                                            >
                                                Mark all read
                                            </button>
                                        )}
                                    </div>

                                    {/* Notifications List */}
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="py-12 text-center">
                                                <div
                                                    className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${isDark
                                                        ? "bg-white/5"
                                                        : "bg-slate-100"
                                                        }`}
                                                >
                                                    <Bell
                                                        className={`w-6 h-6 ${isDark
                                                            ? "text-slate-500"
                                                            : "text-slate-400"
                                                            }`}
                                                    />
                                                </div>
                                                <p
                                                    className={`text-sm ${isDark
                                                        ? "text-slate-500"
                                                        : "text-slate-500"
                                                        }`}
                                                >
                                                    No notifications yet
                                                </p>
                                            </div>
                                        ) : (
                                            notifications.map(
                                                (notification) => (
                                                    <Link
                                                        key={notification.id}
                                                        href={
                                                            notification.actionUrl ||
                                                            "/notifications"
                                                        }
                                                        onClick={() => {
                                                            if (
                                                                !notification.read
                                                            ) {
                                                                handleMarkAsRead(
                                                                    notification.id,
                                                                )
                                                            }
                                                            setNotificationOpen(
                                                                false,
                                                            )
                                                        }}
                                                        className={`block px-4 py-3 transition-colors ${!notification.read
                                                            ? isDark
                                                                ? "bg-primary-500/5"
                                                                : "bg-primary-50/50"
                                                            : ""
                                                            } ${isDark
                                                                ? "hover:bg-white/5"
                                                                : "hover:bg-slate-50"
                                                            }`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            {/* Icon */}
                                                            <div
                                                                className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${getNotificationIconColor(
                                                                    notification.iconColor,
                                                                    isDark,
                                                                )}`}
                                                            >
                                                                {notification.senderAvatar ? (
                                                                    <img
                                                                        src={
                                                                            notification.senderAvatar
                                                                        }
                                                                        alt=""
                                                                        className="w-9 h-9 rounded-full object-cover"
                                                                    />
                                                                ) : (
                                                                    getNotificationIcon(
                                                                        notification.type,
                                                                    )
                                                                )}
                                                            </div>

                                                            {/* Content */}
                                                            <div className="flex-1 min-w-0">
                                                                <p
                                                                    className={`text-sm font-medium ${isDark
                                                                        ? "text-white"
                                                                        : "text-slate-900"
                                                                        }`}
                                                                >
                                                                    {
                                                                        notification.title
                                                                    }
                                                                </p>
                                                                <p
                                                                    className={`text-xs mt-0.5 line-clamp-2 ${isDark
                                                                        ? "text-slate-400"
                                                                        : "text-slate-600"
                                                                        }`}
                                                                >
                                                                    {
                                                                        notification.message
                                                                    }
                                                                </p>
                                                                <p
                                                                    className={`text-xs mt-1 ${isDark
                                                                        ? "text-slate-500"
                                                                        : "text-slate-400"
                                                                        }`}
                                                                >
                                                                    {
                                                                        notification.timeAgo
                                                                    }
                                                                </p>
                                                            </div>

                                                            {/* Unread indicator */}
                                                            {!notification.read && (
                                                                <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-primary-500" />
                                                            )}
                                                        </div>
                                                    </Link>
                                                ),
                                            )
                                        )}
                                    </div>

                                    {/* Footer */}
                                    <div
                                        className={`px-4 py-3 border-t ${isDark
                                            ? "border-white/10"
                                            : "border-slate-100"
                                            }`}
                                    >
                                        <Link
                                            href="/notifications"
                                            onClick={() =>
                                                setNotificationOpen(false)
                                            }
                                            className={`block w-full text-center text-sm font-medium py-2 rounded-lg transition-colors ${isDark
                                                ? "text-primary-400 hover:bg-white/5"
                                                : "text-primary-600 hover:bg-slate-50"
                                                }`}
                                        >
                                            View all notifications
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Profile Dropdown */}
                        <div className="relative" ref={profileDropdownRef}>
                            <button
                                onClick={() => {
                                    setProfileOpen(!profileOpen)
                                    setNotificationOpen(false)
                                }}
                                className={`flex items-center gap-2 p-1.5 pr-3 rounded-lg transition-colors ${isDark
                                    ? "hover:bg-white/10"
                                    : "hover:bg-slate-100"
                                    }`}
                            >
                                {/* Avatar */}
                                {user?.profilePictureUrl ? (
                                    <img
                                        src={user.profilePictureUrl}
                                        alt={user.firstName || "Profile"}
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                ) : (
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark
                                            ? "bg-white/10"
                                            : "bg-slate-200"
                                            }`}
                                    >
                                        <User
                                            className={`w-4 h-4 ${isDark
                                                ? "text-slate-400"
                                                : "text-slate-500"
                                                }`}
                                        />
                                    </div>
                                )}

                                {/* Name & Role */}
                                <div className="hidden sm:block text-left">
                                    <p
                                        className={`text-sm font-medium ${isDark
                                            ? "text-white"
                                            : "text-slate-900"
                                            }`}
                                    >
                                        {user?.firstName ||
                                            user?.email?.split("@")[0]}
                                    </p>
                                </div>

                                <ChevronDown
                                    className={`w-4 h-4 transition-transform ${profileOpen ? "rotate-180" : ""
                                        } ${isDark ? "text-slate-500" : "text-slate-400"}`}
                                />
                            </button>

                            {/* Dropdown Menu */}
                            {profileOpen && (
                                <div
                                    className={`absolute right-0 top-full mt-2 w-56 rounded-xl shadow-lg border overflow-hidden ${isDark
                                        ? "bg-dark-800 border-white/10"
                                        : "bg-white border-slate-200"
                                        }`}
                                >
                                    {/* User Info */}
                                    <div
                                        className={`px-4 py-3 border-b ${isDark
                                            ? "border-white/10"
                                            : "border-slate-100"
                                            }`}
                                    >
                                        <p
                                            className={`text-sm font-medium ${isDark
                                                ? "text-white"
                                                : "text-slate-900"
                                                }`}
                                        >
                                            {user?.fullName ||
                                                `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
                                                user?.email}
                                        </p>
                                        <p
                                            className={`text-xs truncate ${isDark
                                                ? "text-slate-500"
                                                : "text-slate-500"
                                                }`}
                                        >
                                            {user?.email}
                                        </p>
                                        <div className="mt-2">
                                            <span
                                                className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${roleBadge.className}`}
                                            >
                                                {roleBadge.icon}
                                                {roleBadge.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="py-1">
                                        <Link
                                            href="/profile"
                                            className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${isDark
                                                ? "text-slate-300 hover:bg-white/5"
                                                : "text-slate-700 hover:bg-slate-50"
                                                }`}
                                        >
                                            <User className="w-4 h-4" />
                                            View Profile
                                        </Link>
                                        <Link
                                            href="/settings"
                                            className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${isDark
                                                ? "text-slate-300 hover:bg-white/5"
                                                : "text-slate-700 hover:bg-slate-50"
                                                }`}
                                        >
                                            <Settings className="w-4 h-4" />
                                            Settings
                                        </Link>
                                    </div>

                                    {/* Logout */}
                                    <div
                                        className={`py-1 border-t ${isDark
                                            ? "border-white/10"
                                            : "border-slate-100"
                                            }`}
                                    >
                                        <button
                                            onClick={() => logout()}
                                            className={`flex items-center gap-3 w-full px-4 py-2 text-sm transition-colors ${isDark
                                                ? "text-red-400 hover:bg-red-500/10"
                                                : "text-red-600 hover:bg-red-50"
                                                }`}
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    {/* Deletion Warning */}
                    {user?.accountStatus === "PENDING_DELETION" && user.deletionScheduledAt && (
                        <DeletionCountdown scheduledAt={user.deletionScheduledAt} />
                    )}
                    {/* Page Header */}
                    {(title || description) && (
                        <div className="mb-6">
                            {title && (
                                <h1
                                    className={`text-2xl font-semibold ${isDark ? "text-white" : "text-slate-900"
                                        }`}
                                >
                                    {title}
                                </h1>
                            )}
                            {description && (
                                <p
                                    className={`mt-1 text-sm ${isDark
                                        ? "text-slate-400"
                                        : "text-slate-500"
                                        }`}
                                >
                                    {description}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Page Content */}
                    {children}
                </main>

                {/* Quick Access Floating Action Button */}
                <QuickAccessFAB />
            </div>
        </div>
    )
}
