"use client"

import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { ArrowRight, LogOut, Menu, Settings, User, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import DeletionCountdown from "./DeletionCountdown"
import Logo from "./Logo"
import ThemeSwitcher from "./ThemeSwitcher"

export default function Navbar() {
    const { isAuthenticated, isLoading, user, logout } = useAuth()
    const { isDark } = useTheme()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)

    const handleLogout = async () => {
        await logout()
        setProfileDropdownOpen(false)
    }

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isDark
                ? "bg-[#0A101C] border-b border-white/5" // Dark Mode: Solid background, no blur
                : "bg-[#F5EEE4]/80 border-b border-[#EAE5D5] backdrop-blur-md" // Light Mode: Preserve glass effect
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Logo size="md" linkTo="/" animated={true} />

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-2">
                        <ThemeSwitcher />

                        {isLoading ? (
                            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                        ) : isAuthenticated ? (
                            <>
                                <div className="flex items-center gap-1 mr-2">
                                    <Link
                                        href="/about"
                                        className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${isDark
                                            ? "text-dark-300 hover:text-white hover:bg-white/10"
                                            : "text-dark-600 hover:text-dark-900 hover:bg-dark-100"
                                            }`}
                                    >
                                        About
                                    </Link>
                                    <Link
                                        href="/contact"
                                        className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${isDark
                                            ? "text-dark-300 hover:text-white hover:bg-white/10"
                                            : "text-dark-600 hover:text-dark-900 hover:bg-dark-100"
                                            }`}
                                    >
                                        Contact
                                    </Link>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Link
                                        href="/dashboard"
                                        className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${isDark
                                            ? "text-dark-300 hover:text-white hover:bg-white/10"
                                            : "text-dark-600 hover:text-dark-900 hover:bg-dark-100"
                                            }`}
                                    >
                                        Dashboard
                                    </Link>

                                    {/* Profile Dropdown */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${isDark
                                                ? "hover:bg-white/10"
                                                : "hover:bg-dark-100"
                                                }`}
                                        >
                                            <div
                                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${isDark
                                                    ? "bg-primary-500/20 text-primary-400"
                                                    : "bg-primary-100 text-primary-600"
                                                    }`}
                                            >
                                                {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
                                            </div>
                                        </button>

                                        {profileDropdownOpen && (
                                            <div
                                                className={`absolute right-0 mt-2 w-56 rounded-xl shadow-lg border overflow-hidden animate-scale-in ${isDark
                                                    ? "bg-dark-800 border-white/10"
                                                    : "bg-white border-dark-200"
                                                    }`}
                                            >
                                                <div
                                                    className={`px-4 py-3 border-b ${isDark
                                                        ? "border-white/10"
                                                        : "border-dark-100"
                                                        }`}
                                                >
                                                    <p className={`text-sm font-medium ${isDark ? "text-white" : "text-dark-900"}`}>
                                                        {user?.firstName} {user?.lastName}
                                                    </p>
                                                    <p className={`text-xs ${isDark ? "text-dark-400" : "text-dark-500"}`}>
                                                        {user?.email}
                                                    </p>
                                                </div>
                                                <div className="py-1">
                                                    <Link
                                                        href="/dashboard/profile"
                                                        className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${isDark
                                                            ? "text-dark-300 hover:bg-white/10 hover:text-white"
                                                            : "text-dark-600 hover:bg-dark-50 hover:text-dark-900"
                                                            }`}
                                                        onClick={() => setProfileDropdownOpen(false)}
                                                    >
                                                        <User className="w-4 h-4" />
                                                        Profile
                                                    </Link>
                                                    <Link
                                                        href="/dashboard/settings"
                                                        className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${isDark
                                                            ? "text-dark-300 hover:bg-white/10 hover:text-white"
                                                            : "text-dark-600 hover:bg-dark-50 hover:text-dark-900"
                                                            }`}
                                                        onClick={() => setProfileDropdownOpen(false)}
                                                    >
                                                        <Settings className="w-4 h-4" />
                                                        Settings
                                                    </Link>
                                                    <button
                                                        onClick={handleLogout}
                                                        className={`flex items-center gap-3 w-full px-4 py-2 text-sm transition-colors ${isDark
                                                            ? "text-red-400 hover:bg-red-500/10"
                                                            : "text-red-600 hover:bg-red-50"
                                                            }`}
                                                    >
                                                        <LogOut className="w-4 h-4" />
                                                        Sign out
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/about"
                                    className={`hidden sm:block px-4 py-2 rounded-xl font-medium transition-all duration-300 ${isDark
                                        ? "text-dark-300 hover:text-white hover:bg-white/10"
                                        : "text-dark-600 hover:text-dark-900 hover:bg-dark-100"
                                        }`}
                                >
                                    About
                                </Link>
                                <Link
                                    href="/login"
                                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${isDark
                                        ? "text-dark-300 hover:text-white"
                                        : "text-dark-600 hover:text-dark-900"
                                        }`}
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/register"
                                    className="group relative px-5 py-2.5 rounded-xl font-medium text-white overflow-hidden transition-all duration-300 hover:scale-105"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300 group-hover:from-primary-600 group-hover:to-primary-700" />
                                    <div
                                        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isDark ? "shadow-glow" : ""
                                            }`}
                                    />
                                    <span className="relative flex items-center gap-2">
                                        Get Started
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    </span>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-2">
                        <ThemeSwitcher />
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className={`p-2 rounded-xl transition-colors ${isDark
                                ? "hover:bg-white/10 text-white"
                                : "hover:bg-dark-100 text-dark-900"
                                }`}
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>
                {/* Deletion Warning in Navbar */}
                {user?.accountStatus === "PENDING_DELETION" && user.deletionScheduledAt && (
                    <div className="pb-2">
                        <DeletionCountdown scheduledAt={user.deletionScheduledAt} />
                    </div>
                )}
            </div >

            {/* Mobile Menu */}
            {
                mobileMenuOpen && (
                    <div
                        className={`md:hidden border-t animate-fade-in-down ${isDark
                            ? "bg-dark-900/95 border-white/10"
                            : "bg-[#F5EEE4]/95 border-dark-200/10"
                            } backdrop-blur-xl`}
                    >
                        <div className="px-4 py-4 space-y-2">
                            {isAuthenticated ? (
                                <>
                                    <Link
                                        href="/dashboard"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`block px-4 py-3 rounded-xl font-medium transition-colors ${isDark
                                            ? "text-white hover:bg-white/10"
                                            : "text-dark-900 hover:bg-dark-100"
                                            }`}
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        href="/dashboard/profile"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`block px-4 py-3 rounded-xl font-medium transition-colors ${isDark
                                            ? "text-dark-300 hover:bg-white/10"
                                            : "text-dark-600 hover:bg-dark-100"
                                            }`}
                                    >
                                        Profile
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleLogout()
                                            setMobileMenuOpen(false)
                                        }}
                                        className={`block w-full text-left px-4 py-3 rounded-xl font-medium transition-colors ${isDark
                                            ? "text-red-400 hover:bg-red-500/10"
                                            : "text-red-600 hover:bg-red-50"
                                            }`}
                                    >
                                        Sign out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`block px-4 py-3 rounded-xl font-medium transition-colors ${isDark
                                            ? "text-white hover:bg-white/10"
                                            : "text-dark-900 hover:bg-dark-100"
                                            }`}
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/register"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block px-4 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 text-center"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )
            }
        </nav >
    )
}
