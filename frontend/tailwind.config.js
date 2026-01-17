/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: {
                    50: "#eef2ff",
                    100: "#e0e7ff",
                    200: "#c7d2fe",
                    300: "#a5b4fc",
                    400: "#818cf8",
                    500: "#6366f1",
                    600: "#4f46e5",
                    700: "#4338ca",
                    800: "#3730a3",
                    900: "#312e81",
                    950: "#1e1b4b",
                },
                dark: {
                    50: "#f8fafc",
                    100: "#f1f5f9",
                    200: "#e2e8f0",
                    300: "#cbd5e1",
                    400: "#94a3b8",
                    500: "#64748b",
                    600: "#475569",
                    700: "#334155",
                    800: "#1e293b",
                    900: "#0f172a",
                    950: "#020617",
                },
                accent: {
                    cyan: "#06b6d4",
                    purple: "#8b5cf6",
                    pink: "#ec4899",
                    orange: "#f97316",
                    emerald: "#10b981",
                },
                warm: {
                    25: "#f9eddeff",
                    50: "#f8ecdcff",
                },
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
                "dark-gradient":
                    "linear-gradient(to bottom right, #0f172a, #1e1b4b, #0f172a)",
                "light-gradient":
                    "linear-gradient(to bottom right, #f8fafc, #eef2ff, #f8fafc)",
                "glass-gradient":
                    "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                "hero-pattern":
                    "radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)",
            },
            animation: {
                "fade-in": "fadeIn 0.5s ease-out",
                "fade-in-up": "fadeInUp 0.5s ease-out",
                "fade-in-down": "fadeInDown 0.5s ease-out",
                "slide-in-left": "slideInLeft 0.5s ease-out",
                "slide-in-right": "slideInRight 0.5s ease-out",
                "scale-in": "scaleIn 0.3s ease-out",
                float: "float 6s ease-in-out infinite",
                "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                shimmer: "shimmer 2s linear infinite",
                glow: "glow 2s ease-in-out infinite alternate",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                fadeInUp: {
                    "0%": { opacity: "0", transform: "translateY(20px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                fadeInDown: {
                    "0%": { opacity: "0", transform: "translateY(-20px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                slideInLeft: {
                    "0%": { opacity: "0", transform: "translateX(-20px)" },
                    "100%": { opacity: "1", transform: "translateX(0)" },
                },
                slideInRight: {
                    "0%": { opacity: "0", transform: "translateX(20px)" },
                    "100%": { opacity: "1", transform: "translateX(0)" },
                },
                scaleIn: {
                    "0%": { opacity: "0", transform: "scale(0.95)" },
                    "100%": { opacity: "1", transform: "scale(1)" },
                },
                float: {
                    "0%, 100%": { transform: "translateY(0px)" },
                    "50%": { transform: "translateY(-20px)" },
                },
                shimmer: {
                    "0%": { backgroundPosition: "-200% 0" },
                    "100%": { backgroundPosition: "200% 0" },
                },
                glow: {
                    "0%": { boxShadow: "0 0 20px rgba(99, 102, 241, 0.3)" },
                    "100%": { boxShadow: "0 0 40px rgba(99, 102, 241, 0.6)" },
                },
            },
            backdropBlur: {
                xs: "2px",
            },
            boxShadow: {
                "glow-sm": "0 0 15px -3px rgba(99, 102, 241, 0.2)",
                glow: "0 0 25px -5px rgba(99, 102, 241, 0.3)",
                "glow-lg": "0 0 35px -5px rgba(99, 102, 241, 0.4)",
                "inner-glow": "inset 0 0 20px rgba(99, 102, 241, 0.05)",
                glass: "0 8px 32px 0 rgba(0, 0, 0, 0.15)", // Softer shadow
                "glass-sm": "0 4px 16px 0 rgba(0, 0, 0, 0.1)",
                "glass-md": "0 6px 24px 0 rgba(0, 0, 0, 0.12)",
            },
            borderRadius: {
                "4xl": "2rem",
                "5xl": "2.5rem",
            },
        },
    },
    plugins: [],
}
