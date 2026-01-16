"use client"

import { useAuth } from "@/context/AuthContext"
import { RoleName } from "@/types/auth"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoles?: RoleName[]
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login")
      } else if (
        allowedRoles &&
        user &&
        !allowedRoles.some((role) => user.roles.includes(role))
      ) {
        router.push("/unauthorized") // Or dashboard
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (allowedRoles && user && !allowedRoles.some((role) => user.roles.includes(role))) {
    return null
  }

  return <>{children}</>
}
