"use client"

import { useTheme } from "@/context/ThemeContext"
import { Check, ChevronRight, Shield } from "lucide-react"
import Link from "next/link"

export function TrustSafetyDashboard() {
  const { isDark } = useTheme()

  // Mock verification level (2 out of 3)
  const verificationLevel = 2

  return (
    <div
      className={`rounded-3xl border p-6 ${isDark
        ? "bg-dark-900 border-dark-700"
        : "bg-gradient-to-br from-emerald-50/50 to-transparent border-slate-100"
        }`}
    >
      <div className="mb-6 flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/20`}
        >
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h3
            className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"
              }`}
          >
            Trust & Safety
          </h3>
          <p
            className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"
              }`}
          >
            Level {verificationLevel} Verified
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="relative mb-8 flex justify-between">
        {/* Progress Bar Background */}
        <div
          className={`absolute top-1/2 left-0 -z-10 h-1 w-full -translate-y-1/2 rounded-full ${isDark ? "bg-dark-800" : "bg-slate-200"
            }`}
        ></div>
        {/* Active Progress */}
        <div
          className="absolute top-1/2 left-0 -z-10 h-1 -translate-y-1/2 rounded-full bg-emerald-500 transition-all duration-1000"
          style={{
            width: `${((verificationLevel - 1) / 2) * 100}%`,
          }}
        ></div>

        {[1, 2, 3].map((step) => (
          <div
            key={step}
            className={`flex h-8 w-8 items-center justify-center rounded-full border-4 transition-all duration-500 ${step <= verificationLevel
              ? isDark
                ? "bg-emerald-500 border-dark-950 text-white"
                : "bg-emerald-500 border-white text-white shadow-md"
              : isDark
                ? "bg-dark-800 border-dark-900 text-slate-600"
                : "bg-slate-100 border-white text-slate-400"
              }`}
          >
            {step < verificationLevel ? (
              <Check className="h-4 w-4" />
            ) : (
              <span className="text-xs font-bold">{step}</span>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span
            className={isDark ? "text-slate-400" : "text-slate-600"}
          >
            Email Verified
          </span>
          <Check className="h-4 w-4 text-emerald-500" />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span
            className={isDark ? "text-slate-400" : "text-slate-600"}
          >
            Phone Verified
          </span>
          <Check className="h-4 w-4 text-emerald-500" />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span
            className={isDark ? "text-slate-400" : "text-slate-600"}
          >
            Government ID
          </span>
          <span
            className={`text-xs font-medium ${isDark ? "text-amber-500" : "text-amber-600"
              }`}
          >
            Pending
          </span>
        </div>
      </div>

      <Link
        href="/verification"
        className={`group mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-3 text-sm font-medium transition-all ${isDark
          ? "border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
          : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
          }`}
      >
        Complete Verification{" "}
        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  )
}
