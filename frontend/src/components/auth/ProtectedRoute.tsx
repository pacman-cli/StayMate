"use client"

import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface ProtectedRouteProps {
 children: React.ReactNode
 requiredRole?: string
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
 const { user, isLoading, isAuthenticated } = useAuth()
 const router = useRouter()

 useEffect(() => {
  if (!isLoading && !isAuthenticated) {
   router.push("/login")
  }

  // Optional: Check for specific role if required
  if (!isLoading && isAuthenticated && requiredRole && user?.roles?.includes(requiredRole) === false) { // Also fix user.role access if user.roles is array
   // Redirect to unauthorized page or dashboard if role doesn't match
   router.push("/dashboard")
  }
 }, [isLoading, isAuthenticated, user, router, requiredRole])

 if (isLoading) {
  return (
   <div className="flex h-screen w-full items-center justify-center">
    <LoadingSpinner size="lg" />
   </div>
  )
 }

 if (!isAuthenticated) {
  return null // Will redirect in useEffect
 }

 if (requiredRole && user?.roles?.includes(requiredRole) === false) {
  return null // Will redirect in useEffect
 }

 return <>{children}</>
}
