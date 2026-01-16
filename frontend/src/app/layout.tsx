import { AuthProvider } from "@/context/AuthContext"
import { ThemeProvider } from "@/context/ThemeContext"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
    title: {
        default: "RentMate - Find Your Perfect Home & Roommates",
        template: "%s | RentMate",
    },
    description: "A modern platform for finding rental homes, connecting with roommates, and listing properties. Built with Next.js and Spring Boot.",
    keywords: ["rental", "roommates", "housing", "property listing", "apartment finder", "real estate", "rent"],
    authors: [{ name: "StayMate Team" }],
    creator: "StayMate",
    publisher: "StayMate",
    metadataBase: new URL("https://staymate.com"), // Replace with actual production URL
    alternates: {
        canonical: "/",
    },
    openGraph: {
        title: "RentMate - Find Your Perfect Home & Roommates",
        description: "Join thousands of users finding their dream homes and ideal roommates on RentMate.",
        url: "https://staymate.com",
        siteName: "RentMate",
        locale: "en_US",
        type: "website",
        images: [
            {
                url: "/og-image.jpg", // Needs to be added to public folder ideally
                width: 1200,
                height: 630,
                alt: "RentMate Platform Preview",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "RentMate - Find Your Perfect Home",
        description: "The easiest way to rent homes and find roommates.",
        creator: "@staymate",
        images: ["/twitter-image.jpg"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
}

import { Toaster } from "react-hot-toast"

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="dark" suppressHydrationWarning>
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@600;700;800;900&display=swap"
                    rel="stylesheet"
                />
                <meta
                    name="theme-color"
                    content="#0f172a"
                    media="(prefers-color-scheme: dark)"
                />
                <meta
                    name="theme-color"
                    content="#f8fafc"
                    media="(prefers-color-scheme: light)"
                />
            </head>
            <body className="min-h-screen antialiased">
                <ThemeProvider>
                    <AuthProvider>
                        {children}
                        <Toaster position="top-center" toastOptions={{
                            className: 'dark:bg-slate-800 dark:text-white',
                            style: {
                                background: '#333',
                                color: '#fff',
                            },
                        }} />
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    )
}
