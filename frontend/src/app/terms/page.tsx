"use client"

import PublicPageLayout from "@/components/PublicPageLayout"
import { useTheme } from "@/context/ThemeContext"

export default function TermsPage() {
 const { isDark } = useTheme()

 return (
  <PublicPageLayout
   title="Terms of Service"
   subtitle="Please read these terms carefully before using StayMate."
  >
   <div className={`space-y-8 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
    <section>
     <h2 className={`text-xl font-bold mb-3 ${isDark ? "text-white" : "text-slate-900"}`}>1. Acceptance of Terms</h2>
     <p>
      By accessing or using StayMate, you agree to be bound by these Terms of Service.
      If you do not agree, strictly do not use our services.
     </p>
    </section>

    <section>
     <h2 className={`text-xl font-bold mb-3 ${isDark ? "text-white" : "text-slate-900"}`}>2. User Conduct</h2>
     <p>
      You agree to use the platform only for lawful purposes. You are strictly prohibited from:
     </p>
     <ul className="list-disc pl-5 mt-2 space-y-1">
      <li>Posting false or misleading listings.</li>
      <li>Harassing or discriminating against other users.</li>
      <li>Attempting to circumvent our fee or verification systems.</li>
     </ul>
    </section>

    <section>
     <h2 className={`text-xl font-bold mb-3 ${isDark ? "text-white" : "text-slate-900"}`}>3. Platform Role</h2>
     <p>
      StayMate serves as a connector between landlords, tenants, and roommates.
      We do not own or manage the properties listed (unless explicitly stated).
      Any agreement entered into is between the respective users.
     </p>
    </section>
   </div>
  </PublicPageLayout>
 )
}
