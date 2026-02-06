"use client"

import { Github, Instagram, Linkedin, Twitter } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-stone-100 dark:bg-midnight-950 border-t border-stone-200 dark:border-white/5 pt-20 pb-10">
      <div className="container-cinema mx-auto px-6">

        <div className="grid md:grid-cols-4 gap-12 mb-20">

          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="text-2xl font-display font-bold text-stone-900 dark:text-white tracking-tighter mb-6 inline-block">
              STAYMATE.
            </Link>
            <p className="text-stone-500 dark:text-stone-400 max-w-sm mb-8">
              The modern way to find and book your next home.
              Built for students, professionals, and digital nomads.
            </p>
            <div className="flex gap-4">
              {[Twitter, Instagram, Linkedin, Github].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-stone-200 dark:bg-white/5 flex items-center justify-center text-stone-600 dark:text-stone-400 hover:bg-electric-500 hover:text-white transition-colors duration-300">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-stone-900 dark:text-white mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-stone-500 dark:text-stone-400">
              {['Features', 'Pricing', 'Security', 'Enterprise'].map(item => (
                <li key={item}><a href="#" className="hover:text-electric-500 transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-stone-900 dark:text-white mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-stone-500 dark:text-stone-400">
              {['About Us', 'Careers', 'Blog', 'Contact'].map(item => (
                <li key={item}><a href="#" className="hover:text-electric-500 transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-stone-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-stone-500 dark:text-stone-500">
            © {new Date().getFullYear()} StayMate Inc. All rights reserved.
          </div>
          <div className="flex gap-8 text-sm text-stone-500 dark:text-stone-500">
            <a href="#" className="hover:text-stone-900 dark:hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-stone-900 dark:hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-stone-900 dark:hover:text-white transition-colors">Cookies</a>
          </div>
        </div>

      </div>
    </footer>
  )
}
