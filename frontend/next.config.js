/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: "standalone",
    async rewrites() {
        console.log("DEBUG: process.env.BACKEND_URL =", process.env.BACKEND_URL)
        const backendUrl = process.env.BACKEND_URL || "http://localhost:8080"
        console.log("DEBUG: Using backendUrl =", backendUrl)
        return [
            {
                source: "/oauth2/:path*",
                destination: `${backendUrl}/oauth2/:path*`,
            },
            {
                source: "/login/oauth2/:path*",
                destination: `${backendUrl}/login/oauth2/:path*`,
            },
            {
                source: "/api/:path*",
                destination: `${backendUrl}/api/:path*`,
            },
        ]
    },
    images: {
        remotePatterns: [
            {
                protocol: "http",
                hostname: "localhost",
            },
            {
                protocol: "http",
                hostname: "minio",
            },
            {
                protocol: "https",
                hostname: "ui-avatars.com",
            },
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
            {
                protocol: "https",
                hostname: "*.googleusercontent.com",
            },
        ],
    },
}

module.exports = nextConfig
