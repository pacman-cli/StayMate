"use client"

import PublicPageLayout from "@/components/PublicPageLayout"
import { useTheme } from "@/context/ThemeContext"
import { Briefcase, Building2, GraduationCap, Users } from "lucide-react"

export default function SolutionsPage() {
 const { isDark } = useTheme()

 const solutions = [
  {
   icon: GraduationCap,
   title: "For Students",
   description: "Find affordable housing near your university. Connect with verified student roommates.",
   features: ["Campus proximity filters", "Student-friendly budgets", "Secure & verified listings"]
  },
  {
   icon: Briefcase,
   title: "For Job Holders",
   description: "Premium stays for working professionals. Quiet environments with high-speed wifi.",
   features: ["Proximity to business districts", "Fully furnished options", "Flexible lease terms"]
  },
  {
   icon: Users,
   title: "For Bachelors",
   description: "Hassle-free rentals with no discrimination. Find like-minded roommates easily.",
   features: ["Bachelor-friendly landlords", "Roommate compatibility matching", "Community events"]
  },
  {
   icon: Building2,
   title: "For Landlords",
   description: "Maximize occupancy and streamline management. Verified tenants and automated rent collection.",
   features: ["Free property listing", "Tenant screening", "Rent management dashboard"]
  }
 ]

 return (
  <PublicPageLayout
   title="Tailored Solutions for Everyone"
   subtitle="Whether you're studying, working, or managing property, StayMate has a dedicated solution for you."
  >
   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    {solutions.map((item, idx) => (
     <div
      key={idx}
      className={`p-6 rounded-2xl border transition-all hover:-translate-y-1 ${isDark
        ? "bg-white/5 border-white/10 hover:border-primary-500/50"
        : "bg-slate-50 border-slate-200 hover:border-primary-200 hover:shadow-lg"
       }`}
     >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isDark ? "bg-primary-500/20 text-primary-400" : "bg-primary-100 text-primary-600"
       }`}>
       <item.icon className="w-6 h-6" />
      </div>
      <h3 className={`text-xl font-bold mb-3 ${isDark ? "text-white" : "text-slate-900"}`}>
       {item.title}
      </h3>
      <p className={`mb-4 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
       {item.description}
      </p>
      <ul className="space-y-2">
       {item.features.map((feature, fIdx) => (
        <li key={fIdx} className="flex items-center gap-2 text-sm text-slate-500">
         <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
         {feature}
        </li>
       ))}
      </ul>
     </div>
    ))}
   </div>
  </PublicPageLayout>
 )
}
