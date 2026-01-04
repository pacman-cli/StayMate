"use client"

import PublicPageLayout from "@/components/PublicPageLayout"
import { useTheme } from "@/context/ThemeContext"

export default function PrivacyPage() {
 const { isDark } = useTheme()

 return (
  <PublicPageLayout
   title="Privacy Policy"
   subtitle="Your privacy is important to us. This policy outlines how we collect, use, and protect your data."
  >
   <div className={`space-y-8 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
    <section>
     <h2 className={`text-xl font-bold mb-3 ${isDark ? "text-white" : "text-slate-900"}`}>1. Data Collection</h2>
     <p>
      We collect information you provide directly to us, such as when you create an account, update your profile,
      post a listing, or communicate with other users. This may include your name, email, phone number,
      and verification documents.
     </p>
    </section>

    <section>
     <h2 className={`text-xl font-bold mb-3 ${isDark ? "text-white" : "text-slate-900"}`}>2. Usage of Information</h2>
     <p>
      We use your information to operate and improve our platform, including:
     </p>
     <ul className="list-disc pl-5 mt-2 space-y-1">
      <li>Verifying your identity to ensure community safety.</li>
      <li>Matching you with compatible roommates or properties.</li>
      <li>Facilitating secure payments and bookings.</li>
     </ul>
    </section>

    <section>
     <h2 className={`text-xl font-bold mb-3 ${isDark ? "text-white" : "text-slate-900"}`}>3. Data Security</h2>
     <p>
      We implement industry-standard security measures to protect your personal information.
      Your verification documents are encrypted and only accessible by authorized personnel
      during the verification process.
     </p>
    </section>
   </div>
  </PublicPageLayout>
 )
}
