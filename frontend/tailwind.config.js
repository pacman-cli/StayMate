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
                // LIGHT MODE: "Morning Light"
                stone: {
                    50: "#FDFCF8",  // Base (Warm Cardstock)
                    100: "#F5F2EA", // Surface
                    200: "#E6E0D4", // Border
                    900: "#1A1A1A", // Primary Text (Soft Black)
                    800: "#404040", // Secondary Text
                    500: "#737373", // Muted Text
                },

                // DARK MODE: "Midnight Deep"
                midnight: {
                    950: "#050505", // Base (True Void)
                    900: "#0F0F0F", // Surface (Charcoal Glass)
                    800: "#171717", // Border
                    50: "#E0E0E0",  // Primary Text (Moonlight)
                    200: "#A3A3A3", // Secondary Text
                    500: "#525252", // Muted Text
                },

                // EMOTIONAL ACCENTS (Used sparingly)
                lux: {
                    indigo: "#4F46E5",
                    violet: "#7C3AED",
                    glow: "#818CF8",
                }
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
                display: ["Outfit", "Inter", "system-ui", "sans-serif"], // Editorial Headings
            },
            letterSpacing: {
                'tightest': '-0.02em',
                'widest': '0.1em', // For overline labels
            },
            transitionTimingFunction: {
                'cinematic': 'cubic-bezier(0.25, 0.1, 0.25, 1.0)', // Heavy, expensive feel
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "aurora": "conic-gradient(from 180deg at 50% 50%, #1a1a1a 0deg, #2a2a2a 180deg, #1a1a1a 360deg)",
            },
            boxShadow: {
                "glass": "0 8px 32px 0 rgba(0, 0, 0, 0.12)",
                "glass-deep": "0 24px 48px -12px rgba(0, 0, 0, 0.5)",
            },
        },
    },
    plugins: [],
}
