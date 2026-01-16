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
    <footer className={`relative pt-24 pb-12 overflow-hidden mt-0 ${isDark ? "bg-dark-950 border-t border-white/5" : "bg-slate-900 text-white"}`}>
      {/* Watermark */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full flex justify-center pointer-events-none select-none overflow-hidden opacity-10">
        <span className="text-[12vw] sm:text-[15vw] font-black leading-none tracking-tighter text-white/[0.05]">
          STAYMATE
        </span>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-8 mb-16">
          {/* Left Column - Brand */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
            <Logo size="lg" linkTo="/" animated={false} />
            <p className={`text-lg font-medium tracking-tight ${isDark ? "text-slate-400" : "text-slate-300"}`}>
              Satisfying stays. <span className="text-primary-400">Better living.</span>
            </p>

            <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white/5 text-slate-300 border border-white/10">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              System Operational
            </div>
          </div>

          {/* Center Column - Links */}
          <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-12 sm:gap-24">
            {footerLinks.map((section, idx) => (
              <div key={idx} className="flex flex-col items-center lg:items-start space-y-6">
                <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                  {section.title}
                </h4>
                <ul className="space-y-4">
                  {section.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <Link
                        href={link.href}
                        className="text-sm font-medium transition-all duration-300 relative group text-slate-400 hover:text-white"
                      >
                        {link.label}
                        <span className="absolute -bottom-1 left-0 w-0 h-px transition-all duration-300 group-hover:w-full bg-primary-500" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Right Column - Social */}
          <div className="flex flex-col items-center lg:items-end space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Connect With Us
            </h4>
            <div className="flex gap-4">
              {socialLinks.map((social, idx) => (
                <Link
                  key={idx}
                  href={social.href}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10`}
                >
                  {social.icon}
                </Link>
              ))}
            </div>

            {/* Newsletter Mini Input */}
            <div className="mt-4 relative group w-full max-w-xs bg-white/5 focus-within:bg-white/10 rounded-xl transition-all duration-300 border border-white/5 focus-within:border-primary-500/50">
              <input
                type="email"
                placeholder="Subscribe for updates..."
                className="w-full h-12 bg-transparent border-none outline-none px-4 text-sm text-white placeholder-slate-500"
              />
              <button className="absolute right-1 top-1 bottom-1 w-10 rounded-lg flex items-center justify-center transition-colors bg-primary-600 text-white hover:bg-primary-500">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>© 2025 StayMate. All rights reserved.</p>
          <p className="flex gap-1 items-center">
            Made with <span className="text-red-500 animate-pulse">❤</span> for better living.
          </p>
        </div>
      </div>
    </footer>
  )
}
