"use client"

import Footer from "@/components/Footer"
import Navbar from "@/components/Navbar"
import {
    HeroSection,
    HexPatternBackground,
    ProblemsSection
} from "@/components/landing"
import { useTheme } from "@/context/ThemeContext"
import dynamic from "next/dynamic"

// Lazy load below-the-fold components
const FeaturesSection = dynamic(() => import("@/components/landing/FeaturesSection"))
const HowItWorksSection = dynamic(() => import("@/components/landing/HowItWorksSection"))
const UserTypesSection = dynamic(() => import("@/components/landing/UserTypesSection"))
const AmenitiesSection = dynamic(() => import("@/components/landing/AmenitiesSection"))
const TestimonialsSection = dynamic(() => import("@/components/landing/TestimonialsSection"))
const FAQSection = dynamic(() => import("@/components/landing/FAQSection"))

export default function LandingPage() {
    const { isDark } = useTheme()

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-dark-950" : "bg-slate-50"}`}>
            <HexPatternBackground />

            <Navbar />

            <main>
                <HeroSection />
                <ProblemsSection />
                <FeaturesSection />
                <HowItWorksSection />
                <UserTypesSection />
                <AmenitiesSection />
                <TestimonialsSection />
                <FAQSection />
            </main>

            <Footer />
        </div>
    )
}
