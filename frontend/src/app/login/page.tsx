"use client"

import Logo from "@/components/Logo"
import ThemeSwitcher from "@/components/ThemeSwitcher"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import {
    AlertCircle,
    ArrowRight,
    Eye,
    EyeOff,
    Loader2,
    Lock,
    Mail,
    Sparkles,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"

export default function LoginPage() {
    const router = useRouter()
    const {
        login,
        loginWithGoogle,
        isAuthenticated,
        isLoading: authLoading,
    } = useAuth()
    const { isDark } = useTheme()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            router.push("/dashboard")
        }
    }, [isAuthenticated, authLoading, router])

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError("")

        if (!email || !password) {
            setError("Please fill in all fields")
            return
        }

        setIsLoading(true)

        try {
            await login(email, password)
            router.push("/dashboard")
        } catch (err: any) {
            const message =
                err.response?.data?.message || "Invalid email or password"
            setError(message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleLogin = () => {
        loginWithGoogle()
    }

    if (authLoading) {
        return (
            <div
                className={`min-h-screen flex items-center justify-center ${isDark ? "bg-dark-950" : "bg-warm-25"
                    }`}
            >
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    <div className="absolute inset-0 w-12 h-12 border-4 border-primary-500/20 rounded-full" />
                </div>
            </div>
        )
    }

    return (
        <div
            className={`min-h-screen flex transition-colors duration-500 ${isDark
                ? "bg-dark-950"
                : "bg-warm-25"
                }`}
        >
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div
                    className={`absolute top-0 -left-40 w-96 h-96 rounded-full blur-3xl ${isDark ? "bg-primary-500/10" : "bg-primary-400/10"
                        }`}
                />
                <div
                    className={`absolute bottom-0 -right-40 w-96 h-96 rounded-full blur-3xl ${isDark ? "bg-purple-500/10" : "bg-purple-400/5"
                        }`}
                />
                <div
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl ${isDark ? "bg-primary-500/5" : "bg-primary-400/5"
                        }`}
                />

                {/* Grid Pattern */}
                <div
                    className={`absolute inset-0 ${isDark ? "opacity-[0.02]" : "opacity-[0.03]"
                        }`}
                    style={{
                        backgroundImage: `linear-gradient(${isDark ? "#fff" : "#000"
                            } 1px, transparent 1px), linear-gradient(90deg, ${isDark ? "#fff" : "#000"
                            } 1px, transparent 1px)`,
                        backgroundSize: "60px 60px",
                    }}
                />
            </div>

            {/* Left Side - Branding (Hidden on mobile) */}
            <div
                className={`hidden lg:flex lg:w-1/2 relative overflow-hidden ${isDark
                    ? "bg-gradient-to-br from-primary-900/40 via-dark-900 to-purple-900/40"
                    : "bg-gradient-to-br from-primary-600 via-primary-700 to-purple-700"
                    }`}
            >
                {/* Animated Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse-slow" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow animation-delay-200" />
                </div>

                {/* Content */}
                <div className="relative z-10 flex items-center justify-center w-full p-12">
                    <div className="max-w-lg text-center">
                        {/* Logo */}
                        <div className="flex justify-center mb-8">
                            <Logo
                                size="xl"
                                showText={false}
                                linkTo={null}
                                animated={true}
                            />
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            Welcome Back to
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-200 to-purple-200">
                                RentMate
                            </span>
                        </h1>

                        <p className="text-lg text-white/70 mb-10">
                            Sign in to find your perfect rental home, connect
                            with roommates, or manage your properties.
                        </p>

                        {/* Feature Pills */}
                        <div className="flex flex-wrap justify-center gap-3">
                            {[
                                "Find Rentals",
                                "Match Roommates",
                                "List Properties",
                            ].map((feature, index) => (
                                <div
                                    key={index}
                                    className={`px-4 py-2 rounded-full text-sm font-medium ${isDark
                                        ? "bg-white/10 text-white border border-white/20"
                                        : "bg-white/20 text-white"
                                        } backdrop-blur-sm`}
                                >
                                    {feature}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 relative z-10">
                <div className="w-full max-w-md">
                    {/* Mobile Logo & Theme Switcher */}
                    <div className="lg:hidden flex items-center justify-between mb-8">
                        <Logo size="md" linkTo="/" animated={true} />
                        <ThemeSwitcher />
                    </div>

                    {/* Desktop Theme Switcher */}
                    <div className="hidden lg:flex justify-end mb-6">
                        <ThemeSwitcher />
                    </div>

                    {/* Login Card */}
                    <div
                        className={`relative rounded-3xl overflow-hidden ${isDark
                            ? "bg-white/5 border border-white/10"
                            : "bg-warm-50 border border-warm-100 shadow-xl"
                            } backdrop-blur-xl p-8`}
                    >
                        {/* Card Glow Effect */}
                        {isDark && (
                            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-purple-500/5 pointer-events-none" />
                        )}

                        <div className="relative z-10">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div
                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4 ${isDark
                                        ? "bg-primary-500/10 text-primary-400 border border-primary-500/20"
                                        : "bg-primary-100 text-primary-700"
                                        }`}
                                >
                                    <Sparkles className="w-3 h-3" />
                                    Welcome back
                                </div>
                                <h2
                                    className={`text-2xl md:text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-dark-900"
                                        }`}
                                >
                                    Sign In
                                </h2>
                                <p
                                    className={`${isDark
                                        ? "text-dark-400"
                                        : "text-dark-600"
                                        }`}
                                >
                                    Enter your credentials to access your
                                    account
                                </p>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div
                                    className={`mb-6 p-4 rounded-xl flex items-start gap-3 animate-fade-in ${isDark
                                        ? "bg-red-500/10 border border-red-500/20"
                                        : "bg-red-50 border border-red-200"
                                        }`}
                                >
                                    <AlertCircle
                                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark
                                            ? "text-red-400"
                                            : "text-red-500"
                                            }`}
                                    />
                                    <p
                                        className={`text-sm ${isDark
                                            ? "text-red-300"
                                            : "text-red-600"
                                            }`}
                                    >
                                        {error}
                                    </p>
                                </div>
                            )}

                            {/* Login Form */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Email Field */}
                                <div>
                                    <label
                                        htmlFor="email"
                                        className={`block text-sm font-medium mb-2 ${isDark
                                            ? "text-dark-300"
                                            : "text-dark-700"
                                            }`}
                                    >
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail
                                                className={`w-5 h-5 ${isDark
                                                    ? "text-dark-500"
                                                    : "text-dark-400"
                                                    }`}
                                            />
                                        </div>
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                            className={`w-full pl-12 pr-4 py-3.5 rounded-xl border transition-all duration-300 ${isDark
                                                ? "bg-white/5 border-white/10 text-white placeholder-dark-500 focus:bg-white/10 focus:border-primary-500/50"
                                                : "bg-white border-warm-200 text-dark-900 placeholder-dark-400 focus:border-primary-500 shadow-sm"
                                                } focus:outline-none focus:ring-2 focus:ring-primary-500/20`}
                                            placeholder="you@example.com"
                                            autoComplete="email"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div>
                                    <label
                                        htmlFor="password"
                                        className={`block text-sm font-medium mb-2 ${isDark
                                            ? "text-dark-300"
                                            : "text-dark-700"
                                            }`}
                                    >
                                        Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock
                                                className={`w-5 h-5 ${isDark
                                                    ? "text-dark-500"
                                                    : "text-dark-400"
                                                    }`}
                                            />
                                        </div>
                                        <input
                                            id="password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                            className={`w-full pl-12 pr-12 py-3.5 rounded-xl border transition-all duration-300 ${isDark
                                                ? "bg-white/5 border-white/10 text-white placeholder-dark-500 focus:bg-white/10 focus:border-primary-500/50"
                                                : "bg-white border-warm-200 text-dark-900 placeholder-dark-400 focus:border-primary-500 shadow-sm"
                                                } focus:outline-none focus:ring-2 focus:ring-primary-500/20`}
                                            placeholder="••••••••"
                                            autoComplete="current-password"
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                        >
                                            {showPassword ? (
                                                <EyeOff
                                                    className={`w-5 h-5 transition-colors ${isDark
                                                        ? "text-dark-500 hover:text-dark-300"
                                                        : "text-dark-400 hover:text-dark-600"
                                                        }`}
                                                />
                                            ) : (
                                                <Eye
                                                    className={`w-5 h-5 transition-colors ${isDark
                                                        ? "text-dark-500 hover:text-dark-300"
                                                        : "text-dark-400 hover:text-dark-600"
                                                        }`}
                                                />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`group relative w-full py-3.5 px-4 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${isDark ? "shadow-glow-sm" : "shadow-lg"
                                        }`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300 group-hover:from-primary-600 group-hover:to-primary-700" />
                                    <span className="relative flex items-center justify-center gap-2">
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Signing in...
                                            </>
                                        ) : (
                                            <>
                                                Sign In
                                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                            </>
                                        )}
                                    </span>
                                </button>
                            </form>

                            {/* Divider */}
                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div
                                        className={`w-full border-t ${isDark
                                            ? "border-white/10"
                                            : "border-warm-200"
                                            }`}
                                    />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span
                                        className={`px-4 ${isDark
                                            ? "bg-dark-900/50 text-dark-500"
                                            : "bg-warm-50 text-dark-500"
                                            }`}
                                    >
                                        or continue with
                                    </span>
                                </div>
                            </div>

                            {/* Google OAuth Button */}
                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                disabled={isLoading}
                                className={`w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${isDark
                                    ? "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20"
                                    : "bg-white border-warm-200 text-dark-900 hover:bg-warm-50 hover:border-warm-300 shadow-sm"
                                    }`}
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Continue with Google
                            </button>

                            {/* Register Link */}
                            <p
                                className={`mt-8 text-center ${isDark ? "text-dark-400" : "text-dark-600"
                                    }`}
                            >
                                Don't have an account?{" "}
                                <Link
                                    href="/register"
                                    className={`font-semibold transition-colors ${isDark
                                        ? "text-primary-400 hover:text-primary-300"
                                        : "text-primary-600 hover:text-primary-700"
                                        }`}
                                >
                                    Create account
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Back to Home */}
                    <p className="mt-8 text-center">
                        <Link
                            href="/"
                            className={`inline-flex items-center gap-2 text-sm transition-colors ${isDark
                                ? "text-dark-500 hover:text-dark-300"
                                : "text-dark-500 hover:text-dark-700"
                                }`}
                        >
                            <ArrowRight className="w-4 h-4 rotate-180" />
                            Back to home
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
