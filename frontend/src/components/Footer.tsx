"use client"

import { useTheme } from "@/context/ThemeContext"
import { Instagram, Linkedin, Send, Twitter, Youtube } from "lucide-react"
import Link from "next/link"
import Logo from "./Logo"

export default function Footer() {
  const { isDark } = useTheme()

  const socialLinks = [
    { icon: <Youtube className="w-5 h-5" />, href: "#", bg: "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white" },
    { icon: <Twitter className="w-5 h-5" />, href: "#", bg: "bg-blue-400/10 text-blue-400 hover:bg-blue-400 hover:text-white" },
    { icon: <Instagram className="w-5 h-5" />, href: "#", bg: "bg-pink-500/10 text-pink-500 hover:bg-pink-500 hover:text-white" },
    { icon: <Linkedin className="w-5 h-5" />, href: "#", bg: "bg-blue-600/10 text-blue-600 hover:bg-blue-600 hover:text-white" },
  ]

  const footerLinks = [
    {
      title: "Product",
      links: [
        { label: "Search Rentals", href: "/search" },
        { label: "Solutions", href: "/solutions" },
        { label: "How it Works", href: "/how-it-works" },
        { label: "Testimonials", href: "/testimonials" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Careers", href: "#" },
        { label: "Blog", href: "#" },
        { label: "Press", href: "#" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Help Center / FAQs", href: "/faq" },
        { label: "Terms & Conditions", href: "/terms" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Contact Support", href: "/contact" },
      ],
    },
  ]

  return (
    <footer className={`relative pt-24 pb-12 overflow-hidden rounded-t-[3rem] mt-24 ${isDark
      ? "bg-dark-950 border-t border-white/5"
      : "bg-white border-t border-gray-100 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]"
      }`}>
      {/* Watermark */}
      <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-full flex justify-center pointer-events-none select-none overflow-hidden`}>
        <span className={`text-[12vw] sm:text-[15vw] font-black leading-none tracking-tighter ${isDark
          ? "text-white/[0.02]"
          : "text-dark-900/[0.02]"
          }`}>
          STAYMATE
        </span>
      </div>

      {/* Gradient Glow Effects (Dark Mode only) */}
      {isDark && (
        <>
          <div className="absolute top-0 transform -translate-x-1/2 left-1/2 w-full max-w-[800px] h-20 bg-gradient-to-r from-transparent via-primary-500/10 to-transparent blur-[60px]" />
          <div className="absolute -left-40 top-20 w-80 h-80 bg-primary-500/5 rounded-full blur-[100px]" />
          <div className="absolute -right-40 bottom-20 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px]" />
        </>
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-8 mb-16">
          {/* Left Column - Brand */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
            <Logo size="lg" linkTo="/" animated={false} />
            <p className={`text-lg font-medium tracking-tight ${isDark ? "text-dark-300" : "text-dark-600"
              }`}>
              Satisfying stays. <span className="text-primary-500">Better living.</span>
            </p>

            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${isDark
              ? "bg-white/5 text-dark-300 border border-white/5"
              : "bg-dark-50 text-dark-600 border border-dark-200"
              }`}>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              System Operational
            </div>
          </div>

          {/* Center Column - Links */}
          <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-12 sm:gap-24">
            {footerLinks.map((section, idx) => (
              <div key={idx} className="flex flex-col items-center lg:items-start space-y-6">
                <h4 className={`text-sm font-bold uppercase tracking-wider ${isDark ? "text-white" : "text-dark-900"
                  }`}>
                  {section.title}
                </h4>
                <ul className="space-y-4">
                  {section.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <Link
                        href={link.href}
                        className={`text-sm font-medium transition-all duration-300 relative group ${isDark
                          ? "text-dark-400 hover:text-white"
                          : "text-dark-500 hover:text-dark-900"
                          }`}
                      >
                        {link.label}
                        <span className={`absolute -bottom-1 left-0 w-0 h-px transition-all duration-300 group-hover:w-full ${isDark ? "bg-primary-500" : "bg-primary-600"
                          }`} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Right Column - Social */}
          <div className="flex flex-col items-center lg:items-end space-y-6">
            <h4 className={`text-sm font-bold uppercase tracking-wider ${isDark ? "text-white" : "text-dark-900"
              }`}>
              Connect With Us
            </h4>
            <div className="flex gap-4">
              {socialLinks.map((social, idx) => (
                <Link
                  key={idx}
                  href={social.href}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl ${isDark
                    ? "bg-white/5 border border-white/5 " + (social.bg.split(' ')[2] ? "" : "text-dark-400 hover:text-white hover:bg-white/10")
                    : "bg-white border border-dark-100 text-dark-500 hover:text-white"
                    } ${social.bg}`}
                >
                  {social.icon}
                </Link>
              ))}
            </div>

            {/* Newsletter Mini Input (Optional Polish) */}
            <div className={`mt-4 relative group w-full max-w-xs ${isDark
              ? "bg-white/5 focus-within:bg-white/10"
              : "bg-dark-50 focus-within:bg-white focus-within:shadow-md"
              } rounded-xl transition-all duration-300 border ${isDark ? "border-white/5 focus-within:border-primary-500/50" : "border-dark-200 focus-within:border-primary-500/50"
              }`}>
              <input
                type="email"
                placeholder="Subscribe for updates..."
                className={`w-full h-12 bg-transparent border-none outline-none px-4 text-sm ${isDark ? "text-white placeholder-dark-500" : "text-dark-900 placeholder-dark-400"
                  }`}
              />
              <button className={`absolute right-1 top-1 bottom-1 w-10 rounded-lg flex items-center justify-center transition-colors ${isDark ? "bg-primary-500 text-white hover:bg-primary-400" : "bg-primary-600 text-white hover:bg-primary-500"
                }`}>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-sm ${isDark ? "border-white/5 text-dark-500" : "border-dark-100 text-dark-400"
          }`}>
          <p>© 2025 StayMate. All rights reserved.</p>
          <p className="flex gap-1 items-center">
            Made with <span className="text-red-500 animate-pulse">❤</span> for better living.
          </p>
        </div>
      </div>
    </footer>
  )
}
