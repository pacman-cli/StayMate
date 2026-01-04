"use client"

import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { messageApi, notificationApi } from "@/lib/api"
import {
    BarChart3,
    Bell,
    Building,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    FileText,
    Heart,
    HelpCircle,
    Home,
    Inbox,
    Key,
    LogOut,
    MessageSquare,
    Plus,
    Search,
    Settings,
    Shield,
    Star,
    User,
    Users,
    Wallet,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import Logo from "./Logo"

interface NavItem {
    name: string
    href: string
    icon: React.ReactNode
    badge?: number
}

interface NavSection {
    title: string
    items: NavItem[]
}

export default function Sidebar() {
    const pathname = usePathname()
    const { user, isAdmin, isHouseOwner, isRegularUser, logout } = useAuth()
    const { isDark } = useTheme()
    const [collapsed, setCollapsed] = useState(false)
    const [unreadMessages, setUnreadMessages] = useState(0)
    const [unreadNotifications, setUnreadNotifications] = useState(0)

    // Fetch unread counts
    const fetchUnreadCounts = useCallback(async () => {
        try {
            const [messageResponse, notificationResponse] = await Promise.all([
                messageApi.getUnreadCount(),
                notificationApi.getUnreadCount(),
            ])
            setUnreadMessages(messageResponse.totalUnreadCount)
            setUnreadNotifications(notificationResponse.totalUnread)
        } catch (error) {
            // Silently fail - user might not be authenticated yet
        }
    }, [])

    // Fetch on mount and periodically
    useEffect(() => {
        fetchUnreadCounts()
        const interval = setInterval(fetchUnreadCounts, 30000) // Every 30 seconds
        return () => clearInterval(interval)
    }, [fetchUnreadCounts])

    // Navigation items based on role
    const getNavSections = (): NavSection[] => {
        const commonItems: NavSection = {
            title: "General",
            items: [
                {
                    name: "Dashboard",
                    href: "/dashboard",
                    icon: <Home className="w-5 h-5" />,
                },
                {
                    name: "Messages",
                    href: "/messages",
                    icon: <MessageSquare className="w-5 h-5" />,
                    badge: unreadMessages > 0 ? unreadMessages : undefined,
                },
                {
                    name: "Notifications",
                    href: "/notifications",
                    icon: <Bell className="w-5 h-5" />,
                    badge:
                        unreadNotifications > 0
                            ? unreadNotifications
                            : undefined,
                },
            ],
        }

        // Admin navigation
        if (isAdmin) {
            return [
                commonItems,
                {
                    title: "Administration",
                    items: [
                        {
                            name: "User Management",
                            href: "/dashboard/admin/users",
                            icon: <Users className="w-5 h-5" />,
                        },
                        {
                            name: "Properties",
                            href: "/dashboard/admin/properties",
                            icon: <Building className="w-5 h-5" />,
                        },
                        {
                            name: "Analytics",
                            href: "/dashboard/admin/analytics",
                            icon: <BarChart3 className="w-5 h-5" />,
                        },
                        {
                            name: "Reports",
                            href: "/dashboard/admin/reports",
                            icon: <FileText className="w-5 h-5" />,
                        },
                        {
                            name: "Verifications",
                            href: "/dashboard/admin/verifications",
                            icon: <Shield className="w-5 h-5" />,
                        },
                    ],
                },
                {
                    title: "Settings",
                    items: [
                        {
                            name: "Platform Settings",
                            href: "/dashboard/admin/settings",
                            icon: <Settings className="w-5 h-5" />,
                        },
                    ],
                },
            ]
        }

        // House Owner navigation
        if (isHouseOwner) {
            return [
                commonItems,
                {
                    title: "Properties",
                    items: [
                        {
                            name: "My Listings",
                            href: "/dashboard/properties",
                            icon: <Building className="w-5 h-5" />,
                        },
                        {
                            name: "Add Property",
                            href: "/dashboard/properties/add",
                            icon: <Plus className="w-5 h-5" />,
                        },
                        {
                            name: "Booking Requests",
                            href: "/dashboard/bookings",
                            icon: <CalendarDays className="w-5 h-5" />,
                            badge: 2,
                        },
                        {
                            name: "Inquiries",
                            href: "/dashboard/inquiries",
                            icon: <Inbox className="w-5 h-5" />,
                        },
                    ],
                },
                {
                    title: "Finance",
                    items: [
                        {
                            name: "Earnings",
                            href: "/dashboard/earnings",
                            icon: <Wallet className="w-5 h-5" />,
                        },
                        {
                            name: "Reviews",
                            href: "/dashboard/reviews",
                            icon: <Star className="w-5 h-5" />,
                        },
                    ],
                },
                {
                    title: "Account",
                    items: [
                        {
                            name: "Profile",
                            href: "/dashboard/profile",
                            icon: <User className="w-5 h-5" />,
                        },
                        {
                            name: "Verification",
                            href: "/dashboard/verification",
                            icon: <Shield className="w-5 h-5" />,
                        },
                        {
                            name: "Settings",
                            href: "/dashboard/settings",
                            icon: <Settings className="w-5 h-5" />,
                        },
                    ],
                },
            ]
        }

        // Regular User navigation
        return [
            commonItems,
            {
                title: "Discover",
                items: [
                    {
                        name: "Search Rentals",
                        href: "/search",
                        icon: <Search className="w-5 h-5" />,
                    },
                    {
                        name: "Find Roommates",
                        href: "/roommates",
                        icon: <Users className="w-5 h-5" />,
                    },
                    {
                        name: "Saved",
                        href: "/saved",
                        icon: <Heart className="w-5 h-5" />,
                    },
                ],
            },
            {
                title: "My Activity",
                items: [
                    {
                        name: "My Applications",
                        href: "/applications",
                        icon: <FileText className="w-5 h-5" />,
                    },
                    {
                        name: "My Bookings",
                        href: "/bookings",
                        icon: <CalendarDays className="w-5 h-5" />,
                    },
                    {
                        name: "Roommate Matches",
                        href: "/matches",
                        icon: <Key className="w-5 h-5" />,
                    },
                ],
            },
            {
                title: "Account",
                items: [
                    {
                        name: "Profile",
                        href: "/profile",
                        icon: <User className="w-5 h-5" />,
                    },
                    {
                        name: "Verification",
                        href: "/verification",
                        icon: <Shield className="w-5 h-5" />,
                    },
                    {
                        name: "Settings",
                        href: "/settings",
                        icon: <Settings className="w-5 h-5" />,
                    },
                ],
            },
        ]
    }

    const navSections = getNavSections()

    const isActive = (href: string) => pathname === href

    return (
        <aside
            className={`fixed left-0 top-0 h-screen flex flex-col transition-all duration-300 z-40 ${collapsed ? "w-20" : "w-64"
                } ${isDark
                    ? "bg-dark-900 border-r border-white/10"
                    : "bg-white border-r border-slate-200"
                }`}
        >
            {/* Logo Section */}
            <div
                className={`h-16 flex items-center justify-between px-4 border-b ${isDark ? "border-white/10" : "border-slate-200"
                    }`}
            >
                {!collapsed && <Logo size="md" linkTo="/dashboard" />}
                {collapsed && (
                    <Logo size="sm" showText={false} linkTo="/dashboard" />
                )}

                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className={`p-1.5 rounded-lg transition-colors ${isDark
                        ? "hover:bg-dark-800 text-slate-400"
                        : "hover:bg-slate-100 text-slate-500"
                        }`}
                >
                    {collapsed ? (
                        <ChevronRight className="w-4 h-4" />
                    ) : (
                        <ChevronLeft className="w-4 h-4" />
                    )}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-6">
                {navSections.map((section, sectionIdx) => (
                    <div key={sectionIdx}>
                        {!collapsed && (
                            <h3
                                className={`px-3 mb-2 text-xs font-semibold uppercase tracking-wider ${isDark ? "text-slate-500" : "text-slate-400"
                                    }`}
                            >
                                {section.title}
                            </h3>
                        )}
                        <ul className="space-y-1">
                            {section.items.map((item) => (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${isActive(item.href)
                                            ? isDark
                                                ? "bg-dark-800 text-white"
                                                : "bg-slate-900 text-white"
                                            : isDark
                                                ? "text-slate-400 hover:text-white hover:bg-dark-800"
                                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                            } ${collapsed ? "justify-center" : ""}`}
                                    >
                                        <span className="flex-shrink-0">
                                            {item.icon}
                                        </span>
                                        {!collapsed && (
                                            <>
                                                <span className="flex-1 text-sm font-medium">
                                                    {item.name}
                                                </span>
                                                {item.badge && (
                                                    <span
                                                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${isActive(item.href)
                                                            ? "bg-white/20 text-white"
                                                            : isDark
                                                                ? "bg-primary-500/20 text-primary-400"
                                                                : "bg-primary-100 text-primary-600"
                                                            }`}
                                                    >
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </>
                                        )}

                                        {/* Tooltip for collapsed state */}
                                        {collapsed && (
                                            <div
                                                className={`absolute left-full ml-2 px-2 py-1 text-sm font-medium rounded-md whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 ${isDark
                                                    ? "bg-white text-slate-900"
                                                    : "bg-slate-900 text-white"
                                                    }`}
                                            >
                                                {item.name}
                                                {item.badge && (
                                                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary-500 text-white rounded-full">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* Bottom Section */}
            <div
                className={`p-3 border-t ${isDark ? "border-white/10" : "border-slate-200"
                    }`}
            >
                {/* Help */}
                <Link
                    href="/help"
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isDark
                        ? "text-slate-400 hover:text-white hover:bg-dark-800"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        } ${collapsed ? "justify-center" : ""}`}
                >
                    <HelpCircle className="w-5 h-5" />
                    {!collapsed && (
                        <span className="text-sm font-medium">
                            Help & Support
                        </span>
                    )}
                </Link>

                {/* Logout */}
                <button
                    onClick={() => logout()}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isDark
                        ? "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        : "text-red-600 hover:text-red-700 hover:bg-red-50"
                        } ${collapsed ? "justify-center" : ""}`}
                >
                    <LogOut className="w-5 h-5" />
                    {!collapsed && (
                        <span className="text-sm font-medium">Logout</span>
                    )}
                </button>
            </div>
        </aside>
    )
}
