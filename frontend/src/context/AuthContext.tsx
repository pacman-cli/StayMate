"use client"

import {
    authApi,
    clearTokens,
    getAccessToken,
    getGoogleOAuthUrl,
    setTokens,
} from "@/lib/api"
import {
    AuthContextType,
    RegisterRequest,
    User,
    needsRoleSelection as checkNeedsRoleSelection,
    isAdmin,
    isHouseOwner,
    isRegularUser,
} from "@/types/auth"
import { useRouter } from "next/navigation"
import React, {
    ReactNode,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
    children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const isAuthenticated = !!user

    // Role checking
    const userIsAdmin = isAdmin(user)
    const userIsHouseOwner = isHouseOwner(user)
    const userIsRegularUser = isRegularUser(user)
    const userNeedsRoleSelection = checkNeedsRoleSelection(user)

    const router = useRouter()

    // Logout function
    const logout = useCallback(() => {
        authApi.logout().catch(console.error)
        clearTokens()
        setUser(null)
        router.push("/")
    }, [router])

    // Fetch current user data
    const refreshUser = useCallback(async () => {
        const token = getAccessToken()
        if (token) {
            try {
                const userData = await authApi.getCurrentUser()
                setUser(userData)
            } catch (error) {
                console.error("Failed to fetch user:", error)
                clearTokens()
                setUser(null)
            }
        } else {
            setUser(null)
        }
    }, [])

    // Initialize auth on mount
    useEffect(() => {
        const initializeAuth = async () => {
            await refreshUser()
            setIsLoading(false)
        }

        initializeAuth()
    }, [refreshUser])

    const login = useCallback(
        async (email: string, password: string) => {
            setIsLoading(true)
            try {
                const response = await authApi.login({ email, password })
                setTokens(response.accessToken, response.refreshToken)
                // Fetch full user data after login
                await refreshUser()
            } finally {
                setIsLoading(false)
            }
        },
        [refreshUser],
    )

    const register = useCallback(
        async (data: RegisterRequest) => {
            setIsLoading(true)
            try {
                const response = await authApi.register(data)
                setTokens(response.accessToken, response.refreshToken)
                // Fetch full user data after registration
                await refreshUser()
            } finally {
                setIsLoading(false)
            }
        },
        [refreshUser],
    )

    const loginWithGoogle = useCallback(() => {
        // Redirect to Spring Boot OAuth2 endpoint
        window.location.href = getGoogleOAuthUrl()
    }, [])

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated,
        isAdmin: userIsAdmin,
        isHouseOwner: userIsHouseOwner,
        isRegularUser: userIsRegularUser,
        needsRoleSelection: userNeedsRoleSelection,
        login,
        register,
        logout,
        loginWithGoogle,
        refreshUser,
    }

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    )
}

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}

export default AuthContext
