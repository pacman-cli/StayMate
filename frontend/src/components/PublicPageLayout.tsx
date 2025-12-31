"use client"

import { useTheme } from "@/context/ThemeContext"
import { ReactNode } from "react"

interface PublicPageLayoutProps {
 children: ReactNode
 title: string
 subtitle?: string
}

export default function PublicPageLayout({
 children,
 title,
 subtitle,
}: PublicPageLayoutProps) {
 const { isDark } = useTheme()

 return (
  <div className={`min-h-screen pt-24 pb-12 ${isDark ? "bg-[#0A101C]" : "bg-[#F9F6F2]"}`}>
   <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
    <div className="text-center mb-16">
     <h1 className={`text-3xl md:text-5xl font-bold mb-6 ${isDark ? "text-white" : "text-slate-900"}`}>
      {title}
     </h1>
     {subtitle && (
      <p className={`text-lg md:text-xl max-w-2xl mx-auto ${isDark ? "text-slate-400" : "text-slate-600"}`}>
       {subtitle}
      </p>
     )}
    </div>
    <div className={`rounded-3xl p-8 md:p-12 ${isDark
      ? "bg-white/5 border border-white/10"
      : "bg-white border border-slate-200 shadow-sm"
     }`}>
     {children}
    </div>
   </div>
  </div>
 )
}
