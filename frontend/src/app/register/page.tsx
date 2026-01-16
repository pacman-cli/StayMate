"use client"

import Logo from "@/components/Logo"
import ThemeSwitcher from "@/components/ThemeSwitcher"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Building,
    CheckCircle,
    Eye,
    EyeOff,
    Key,
    Loader2,
    Lock,
    Mail,
    MapPin,
    Phone,
    Sparkles,
    User,
    Users,
} from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"

export default function RegisterPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const {
        register,
        loginWithGoogle,
        isAuthenticated,
        isLoading: authLoading,
    } = useAuth()
    const { isDark } = useTheme()

    // Get role from URL params if present
    const initialRole =
        searchParams.get("role") === "HOUSE_OWNER" ? "HOUSE_OWNER" : "USER"

    // Basic fields
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    // Additional fields
    const [phoneNumber, setPhoneNumber] = useState("")
    const [role, setRole] = useState<"USER" | "HOUSE_OWNER">(
        initialRole as "USER" | "HOUSE_OWNER",
    )
    const [bio, setBio] = useState("")
    const [address, setAddress] = useState("")
    const [city, setCity] = useState("")

    // Form state
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [step, setStep] = useState(1)

    // Password validation
    const [passwordValidation, setPasswordValidation] = useState({
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
    })

    // Redirect if authenticated
    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            router.push("/dashboard")
        }
    }, [isAuthenticated, authLoading, router])

    // Password validation
    useEffect(() => {
        setPasswordValidation({
            minLength: password.length >= 8,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
        })
    }, [password])

    const isPasswordValid = Object.values(passwordValidation).every(Boolean)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError("")

        if (!email || !password || !confirmPassword) {
            setError("Please fill in all required fields")
            return
        }

        if (!isPasswordValid) {
            setError("Please ensure your password meets all requirements")
            return
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        setIsLoading(true)

        try {
            await register({
                email,
                password,
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                phoneNumber: phoneNumber || undefined,
                role,
                bio: bio || undefined,
                address: address || undefined,
                city: city || undefined,
            })
            router.push("/dashboard")
        } catch (err: any) {
            const message =
                err.response?.data?.message ||
                "Registration failed. Please try again."
            setError(message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleLogin = () => {
        loginWithGoogle()
    }

    const nextStep = () => {
        if (step === 1) {
            if (!email) {
                setError("Email is required")
                return
            }
            if (!password || !isPasswordValid) {
                setError("Please enter a valid password")
                return
            }
            if (password !== confirmPassword) {
                setError("Passwords do not match")
                return
            }
            setError("")
        }
        setStep(step + 1)
    }

    const prevStep = () => {
        setStep(step - 1)
        setError("")
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

    const PasswordRequirement = ({
        met,
        text,
    }: {
        met: boolean
        text: string
    }) => (
        <div
            className={`flex items-center gap-2 text-xs transition-colors ${met
                ? isDark
                    ? "text-emerald-400"
                    : "text-emerald-600"
                : isDark
                    ? "text-dark-500"
                    : "text-dark-400"
                }`}
        >
            {met ? (
                <CheckCircle className="w-3.5 h-3.5" />
            ) : (
                <div className="w-3.5 h-3.5 rounded-full border-2 border-current" />
            )}
            <span>{text}</span>
        </div>
    )

    const inputClassName = `w-full pl-12 pr-4 py-3.5 rounded-xl border transition-all duration-300 ${isDark
        ? "bg-white/5 border-white/10 text-white placeholder-dark-500 focus:bg-white/10 focus:border-primary-500/50"
        : "bg-white border-warm-200 text-dark-900 placeholder-dark-400 focus:border-primary-500 shadow-sm"
        } focus:outline-none focus:ring-2 focus:ring-primary-500/20`

    const labelClassName = `block text-sm font-medium mb-2 ${isDark ? "text-dark-300" : "text-dark-700"
        }`

    const iconClassName = `w-5 h-5 ${isDark ? "text-dark-500" : "text-dark-400"}`

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

            {/* Left Side - Branding */}
            <div
                className={`hidden lg:flex lg:w-1/2 relative overflow-hidden ${isDark
                    ? "bg-gradient-to-br from-primary-900/40 via-dark-900 to-purple-900/40"
                    : "bg-gradient-to-br from-primary-600 via-primary-700 to-purple-700"
                    }`}
            >
                {/* Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse-slow" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow animation-delay-200" />
                </div>

                {/* Content */}
                <div className="relative z-10 flex items-center justify-center w-full p-12">
                    <div className="max-w-lg text-center">
                        <div className="flex justify-center mb-8">
                            <Logo
                                size="xl"
                                showText={false}
                                linkTo={null}
                                animated={true}
                            />
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            Join
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-200 to-purple-200">
                                RentMate Today
                            </span>
                        </h1>

                        <p className="text-lg text-white/70 mb-10">
                            Create your account and start finding your perfect
                            rental home or listing your properties.
                        </p>

                        {/* Feature Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <div
                                className={`p-4 rounded-2xl text-left ${isDark
                                    ? "bg-white/5 border border-white/10"
                                    : "bg-white/10"
                                    } backdrop-blur-sm`}
                            >
                                <Users className="w-8 h-8 text-white mb-3" />
                                <h3 className="text-white font-semibold mb-1">
                                    For Renters
                                </h3>
                                <p className="text-white/60 text-sm">
                                    Find homes and roommates
                                </p>
                            </div>
                            <div
                                className={`p-4 rounded-2xl text-left ${isDark
                                    ? "bg-white/5 border border-white/10"
                                    : "bg-white/10"
                                    } backdrop-blur-sm`}
                            >
                                <Key className="w-8 h-8 text-white mb-3" />
                                <h3 className="text-white font-semibold mb-1">
                                    For Owners
                                </h3>
                                <p className="text-white/60 text-sm">
                                    List and manage properties
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>

            {/* Right Side - Register Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 relative z-10 overflow-y-auto">
                <div className="w-full max-w-md py-8">
                    {/* Mobile Logo & Theme Switcher */}
                    <div className="lg:hidden flex items-center justify-between mb-8">
                        <Logo size="md" linkTo="/" animated={true} />
                        <ThemeSwitcher />
                    </div>

                    {/* Desktop Theme Switcher */}
                    <div className="hidden lg:flex justify-end mb-6">
                        <ThemeSwitcher />
                    </div>

                    {/* Register Card */}
                    <div
                        className={`relative rounded-3xl overflow-hidden ${isDark
                            ? "bg-white/5 border border-white/10"
                            : "bg-warm-50 border border-warm-100 shadow-xl"
                            } backdrop-blur-xl p-8`}
                    >
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
                                    Step {step} of 3
                                </div>
                                <h2
                                    className={`text-2xl md:text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-dark-900"
                                        }`}
                                >
                                    {step === 1 && "Create Account"}
                                    {step === 2 && "Choose Your Role"}
                                    {step === 3 && "Complete Profile"}
                                </h2>
                                <p
                                    className={`${isDark
                                        ? "text-dark-400"
                                        : "text-dark-600"
                                        }`}
                                >
                                    {step === 1 && "Enter your credentials"}
                                    {step === 2 && "How will you use RentMate?"}
                                    {step === 3 && "Add your personal details"}
                                </p>

                                {/* Progress Indicator */}
                                <div className="flex justify-center gap-2 mt-6">
                                    {[1, 2, 3].map((s) => (
                                        <div
                                            key={s}
                                            className={`h-1.5 rounded-full transition-all duration-300 ${s === step
                                                ? "w-8 bg-primary-500"
                                                : s < step
                                                    ? "w-8 bg-emerald-500"
                                                    : `w-4 ${isDark
                                                        ? "bg-white/10"
                                                        : "bg-dark-200"
                                                    }`
                                                }`}
                                        />
                                    ))}
                                </div>
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

                            {/* Step 1: Credentials */}
                            {step === 1 && (
                                <div className="space-y-5">
                                    {/* Google OAuth */}
                                    <button
                                        type="button"
                                        onClick={handleGoogleLogin}
                                        disabled={isLoading}
                                        className={`w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${isDark
                                            ? "bg-white/5 border-white/10 text-white hover:bg-white/10"
                                            : "bg-white border-warm-200 text-dark-900 hover:bg-warm-50 shadow-sm"
                                            }`}
                                    >
                                        <svg
                                            className="w-5 h-5"
                                            viewBox="0 0 24 24"
                                        >
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
                                        Sign up with Google
                                    </button>

                                    {/* Divider */}
                                    <div className="relative">
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
                                                or register with email
                                            </span>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label
                                            htmlFor="email"
                                            className={labelClassName}
                                        >
                                            Email Address{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Mail
                                                    className={iconClassName}
                                                />
                                            </div>
                                            <input
                                                id="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) =>
                                                    setEmail(e.target.value)
                                                }
                                                className={inputClassName}
                                                placeholder="you@example.com"
                                                required
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label
                                            htmlFor="password"
                                            className={labelClassName}
                                        >
                                            Password{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Lock
                                                    className={iconClassName}
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
                                                className={`${inputClassName} pr-12`}
                                                placeholder="••••••••"
                                                required
                                                disabled={isLoading}
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword(
                                                        !showPassword,
                                                    )
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

                                        {/* Password Requirements */}
                                        {password && (
                                            <div
                                                className={`mt-3 p-3 rounded-xl grid grid-cols-2 gap-2 ${isDark
                                                    ? "bg-white/5"
                                                    : "bg-warm-100"
                                                    }`}
                                            >
                                                <PasswordRequirement
                                                    met={
                                                        passwordValidation.minLength
                                                    }
                                                    text="8+ characters"
                                                />
                                                <PasswordRequirement
                                                    met={
                                                        passwordValidation.hasUppercase
                                                    }
                                                    text="Uppercase"
                                                />
                                                <PasswordRequirement
                                                    met={
                                                        passwordValidation.hasLowercase
                                                    }
                                                    text="Lowercase"
                                                />
                                                <PasswordRequirement
                                                    met={
                                                        passwordValidation.hasNumber
                                                    }
                                                    text="Number"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label
                                            htmlFor="confirmPassword"
                                            className={labelClassName}
                                        >
                                            Confirm Password{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Lock
                                                    className={iconClassName}
                                                />
                                            </div>
                                            <input
                                                id="confirmPassword"
                                                type={
                                                    showConfirmPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={confirmPassword}
                                                onChange={(e) =>
                                                    setConfirmPassword(
                                                        e.target.value,
                                                    )
                                                }
                                                className={`${inputClassName} pr-12`}
                                                placeholder="••••••••"
                                                required
                                                disabled={isLoading}
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowConfirmPassword(
                                                        !showConfirmPassword,
                                                    )
                                                }
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                            >
                                                {showConfirmPassword ? (
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
                                        {confirmPassword &&
                                            password !== confirmPassword && (
                                                <p className="mt-2 text-sm text-red-500">
                                                    Passwords do not match
                                                </p>
                                            )}
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Role Selection */}
                            {step === 2 && (
                                <div className="space-y-4">
                                    <button
                                        type="button"
                                        onClick={() => setRole("USER")}
                                        className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-300 ${role === "USER"
                                            ? isDark
                                                ? "border-primary-500 bg-primary-500/10"
                                                : "border-primary-500 bg-primary-50"
                                            : isDark
                                                ? "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                                                : "border-warm-200 bg-white hover:border-warm-300 hover:bg-warm-50 shadow-sm"
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div
                                                className={`w-12 h-12 rounded-xl flex items-center justify-center ${role === "USER"
                                                    ? "bg-primary-500 text-white"
                                                    : isDark
                                                        ? "bg-white/10 text-dark-400"
                                                        : "bg-warm-100 text-dark-500"
                                                    }`}
                                            >
                                                <Users className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1">
                                                <h3
                                                    className={`font-semibold mb-1 ${isDark
                                                        ? "text-white"
                                                        : "text-dark-900"
                                                        }`}
                                                >
                                                    I'm looking for a rental
                                                </h3>
                                                <p
                                                    className={`text-sm ${isDark
                                                        ? "text-dark-400"
                                                        : "text-dark-600"
                                                        }`}
                                                >
                                                    Find homes, apartments, and
                                                    connect with roommates
                                                </p>
                                            </div>
                                            {role === "USER" && (
                                                <CheckCircle className="w-6 h-6 text-primary-500" />
                                            )}
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setRole("HOUSE_OWNER")}
                                        className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-300 ${role === "HOUSE_OWNER"
                                            ? isDark
                                                ? "border-emerald-500 bg-emerald-500/10"
                                                : "border-emerald-500 bg-emerald-50"
                                            : isDark
                                                ? "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                                                : "border-warm-200 bg-white hover:border-warm-300 hover:bg-warm-50 shadow-sm"
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div
                                                className={`w-12 h-12 rounded-xl flex items-center justify-center ${role === "HOUSE_OWNER"
                                                    ? "bg-emerald-500 text-white"
                                                    : isDark
                                                        ? "bg-white/10 text-dark-400"
                                                        : "bg-warm-100 text-dark-500"
                                                    }`}
                                            >
                                                <Building className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1">
                                                <h3
                                                    className={`font-semibold mb-1 ${isDark
                                                        ? "text-white"
                                                        : "text-dark-900"
                                                        }`}
                                                >
                                                    I'm a property owner
                                                </h3>
                                                <p
                                                    className={`text-sm ${isDark
                                                        ? "text-dark-400"
                                                        : "text-dark-600"
                                                        }`}
                                                >
                                                    List and manage your rental
                                                    properties
                                                </p>
                                            </div>
                                            {role === "HOUSE_OWNER" && (
                                                <CheckCircle className="w-6 h-6 text-emerald-500" />
                                            )}
                                        </div>
                                    </button>
                                </div>
                            )}

                            {/* Step 3: Profile Details */}
                            {step === 3 && (
                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-5"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label
                                                htmlFor="firstName"
                                                className={labelClassName}
                                            >
                                                First Name
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <User
                                                        className={
                                                            iconClassName
                                                        }
                                                    />
                                                </div>
                                                <input
                                                    id="firstName"
                                                    type="text"
                                                    value={firstName}
                                                    onChange={(e) =>
                                                        setFirstName(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={inputClassName}
                                                    placeholder="John"
                                                    disabled={isLoading}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label
                                                htmlFor="lastName"
                                                className={labelClassName}
                                            >
                                                Last Name
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <User
                                                        className={
                                                            iconClassName
                                                        }
                                                    />
                                                </div>
                                                <input
                                                    id="lastName"
                                                    type="text"
                                                    value={lastName}
                                                    onChange={(e) =>
                                                        setLastName(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={inputClassName}
                                                    placeholder="Doe"
                                                    disabled={isLoading}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="phoneNumber"
                                            className={labelClassName}
                                        >
                                            Phone Number
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Phone
                                                    className={iconClassName}
                                                />
                                            </div>
                                            <input
                                                id="phoneNumber"
                                                type="tel"
                                                value={phoneNumber}
                                                onChange={(e) =>
                                                    setPhoneNumber(
                                                        e.target.value,
                                                    )
                                                }
                                                className={inputClassName}
                                                placeholder="+1 (555) 000-0000"
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="city"
                                            className={labelClassName}
                                        >
                                            City
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <MapPin
                                                    className={iconClassName}
                                                />
                                            </div>
                                            <input
                                                id="city"
                                                type="text"
                                                value={city}
                                                onChange={(e) =>
                                                    setCity(e.target.value)
                                                }
                                                className={inputClassName}
                                                placeholder="New York"
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`group relative w-full py-3.5 px-4 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${isDark
                                            ? "shadow-glow-sm"
                                            : "shadow-lg"
                                            }`}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600" />
                                        <span className="relative flex items-center justify-center gap-2">
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Creating Account...
                                                </>
                                            ) : (
                                                <>
                                                    Create Account
                                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                                </>
                                            )}
                                        </span>
                                    </button>
                                </form>
                            )}

                            {/* Navigation Buttons */}
                            {step < 3 && (
                                <div className="flex gap-3 mt-6">
                                    {step > 1 && (
                                        <button
                                            type="button"
                                            onClick={prevStep}
                                            className={`flex-1 py-3.5 px-4 rounded-xl font-medium border transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${isDark
                                                ? "border-white/10 text-white hover:bg-white/10"
                                                : "border-dark-200 text-dark-700 hover:bg-dark-50"
                                                }`}
                                        >
                                            <span className="flex items-center justify-center gap-2">
                                                <ArrowLeft className="w-4 h-4" />
                                                Back
                                            </span>
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        className={`flex-1 py-3.5 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${isDark
                                            ? "shadow-glow-sm"
                                            : "shadow-lg"
                                            }`}
                                    >
                                        <span className="flex items-center justify-center gap-2">
                                            Continue
                                            <ArrowRight className="w-4 h-4" />
                                        </span>
                                    </button>
                                </div>
                            )}

                            {step === 3 && (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className={`w-full mt-4 py-3 px-4 rounded-xl font-medium border transition-all duration-300 ${isDark
                                        ? "border-white/10 text-dark-400 hover:bg-white/5"
                                        : "border-dark-200 text-dark-600 hover:bg-dark-50"
                                        }`}
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        <ArrowLeft className="w-4 h-4" />
                                        Back
                                    </span>
                                </button>
                            )}

                            {/* Login Link */}
                            <p
                                className={`mt-8 text-center ${isDark ? "text-dark-400" : "text-dark-600"
                                    }`}
                            >
                                Already have an account?{" "}
                                <Link
                                    href="/login"
                                    className={`font-semibold transition-colors ${isDark
                                        ? "text-primary-400 hover:text-primary-300"
                                        : "text-primary-600 hover:text-primary-700"
                                        }`}
                                >
                                    Sign in
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
