"use client"

import ProtectedRoute from "@/components/auth/ProtectedRoute"
import Sidebar from "@/components/Sidebar"

export default function DashboardLayout({
 children,
}: {
 children: React.ReactNode
}) {
 return (
  <ProtectedRoute>
   <div className="flex h-screen bg-slate-50 dark:bg-dark-950">
    <Sidebar />
    <main className="flex-1 overflow-y-auto p-4 md:p-8">
     {children}
    </main>
   </div>
  </ProtectedRoute>
 )
}
