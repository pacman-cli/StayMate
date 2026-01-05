import {
    AdminDashboardDTO,
    AuthResponse,
    ConversationListResponse,
    ConversationResponse,
    CreateConversationRequest,
    DashboardStats,
    LandlordDashboardDTO,
    LoginRequest,
    MarkAsReadRequest,
    MessageListResponse,
    MessageResponse,
    NotificationDeleteRequest,
    NotificationListResponse,
    NotificationMarkAsReadRequest,
    NotificationResponse,
    NotificationSummary,
    NotificationUnreadCountResponse,
    RegisterRequest,
    Report,
    RoleSelectionRequest,
    SendMessageRequest,
    TokenRefreshRequest,
    UnreadCountResponse,
    User,
    UserDashboardDTO,
    VerificationRequest
} from "@/types/auth"
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios"
import Cookies from "js-cookie"

const isServer = typeof window === "undefined"
const API_BASE_URL = isServer
    ? process.env.BACKEND_URL || "http://localhost:8080"
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
})

// Token management
export const getAccessToken = (): string | undefined => {
    return Cookies.get("accessToken")
}

export const getRefreshToken = (): string | undefined => {
    return Cookies.get("refreshToken")
}

// Mutex for token refresh
let isRefreshing = false
let failedQueue: Array<{
    resolve: (token: string) => void
    reject: (error: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token!)
        }
    })
    failedQueue = []
}

export const setTokens = (accessToken: string, refreshToken: string): void => {
    // Check if we're in development (localhost)
    const isLocalhost =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1")

    // Access token expires in 15 minutes
    Cookies.set("accessToken", accessToken, {
        expires: 1 / 96,
        secure: !isLocalhost, // Only use secure in production (HTTPS)
        sameSite: "lax",
        path: "/",
    })
    // Refresh token expires in 7 days
    Cookies.set("refreshToken", refreshToken, {
        expires: 7,
        secure: !isLocalhost, // Only use secure in production (HTTPS)
        sameSite: "lax",
        path: "/",
    })
}

export const clearTokens = (): void => {
    Cookies.remove("accessToken", { path: "/" })
    Cookies.remove("refreshToken", { path: "/" })
}

// Request interceptor - add auth token
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getAccessToken()
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    },
)

// Response interceptor - handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject })
                })
                    .then((token) => {
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${token}`
                        }
                        return api(originalRequest)
                    })
                    .catch((err) => {
                        return Promise.reject(err)
                    })
            }

            originalRequest._retry = true
            isRefreshing = true

            const refreshToken = getRefreshToken()
            if (refreshToken) {
                try {
                    const response = await axios.post<AuthResponse>(
                        `${API_BASE_URL}/api/auth/refresh-token`,
                        {
                            refreshToken,
                        },
                    )

                    const { accessToken, refreshToken: newRefreshToken } =
                        response.data
                    setTokens(accessToken, newRefreshToken)

                    processQueue(null, accessToken)

                    // Retry original request with new token
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${accessToken}`
                    }
                    return api(originalRequest)
                } catch (refreshError) {
                    processQueue(refreshError, null)
                    // Refresh failed, clear tokens and redirect to login
                    clearTokens()
                    if (typeof window !== "undefined") {
                        // Avoid redirect loops if already on login page
                        if (!window.location.pathname.startsWith("/login")) {
                            window.location.href = "/login"
                        }
                    }
                    return Promise.reject(refreshError)
                } finally {
                    isRefreshing = false
                }
            } else {
                // No refresh token available
                isRefreshing = false
                clearTokens()
                if (typeof window !== "undefined") {
                    if (!window.location.pathname.startsWith("/login")) {
                        window.location.href = "/login"
                    }
                }
            }
        }

        return Promise.reject(error)
    },
)

// Auth API functions
export const authApi = {
    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>(
            "/api/auth/register",
            data,
        )
        return response.data
    },

    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>("/api/auth/login", data)
        return response.data
    },

    refreshToken: async (data: TokenRefreshRequest): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>(
            "/api/auth/refresh-token",
            data,
        )
        return response.data
    },

    getCurrentUser: async (): Promise<User> => {
        const response = await api.get<User>("/api/auth/me")
        return response.data
    },

    logout: async (): Promise<void> => {
        try {
            await api.post("/api/auth/logout")
        } finally {
            clearTokens()
        }
    },

    checkEmail: async (
        email: string,
    ): Promise<{ exists: boolean; available: boolean }> => {
        const response = await api.get<{ exists: boolean; available: boolean }>(
            "/api/auth/check-email",
            {
                params: { email },
            },
        )
        return response.data
    },

    validateToken: async (): Promise<{ valid: boolean; email?: string }> => {
        const response = await api.get<{ valid: boolean; email?: string }>(
            "/api/auth/validate",
        )
        return response.data
    },

    selectRole: async (data: RoleSelectionRequest): Promise<User> => {
        const response = await api.post<User>("/api/auth/select-role", data)
        return response.data
    },
}

// User API functions
export const userApi = {
    getProfile: async (): Promise<User> => {
        const response = await api.get<User>("/api/users/profile")
        return response.data
    },

    updateProfile: async (updates: {
        firstName?: string
        lastName?: string
        profilePictureUrl?: string
    }): Promise<User> => {
        const response = await api.put<User>("/api/users/profile", updates)
        return response.data
    },

    deleteAccount: async (): Promise<{ message: string }> => {
        const response = await api.delete<{ message: string }>(
            "/api/users/profile",
        )
        return response.data
    },

    hasRole: async (role: string): Promise<{ hasRole: boolean }> => {
        const response = await api.get<{ hasRole: boolean }>(
            `/api/users/has-role/${role}`,
        )
        return response.data
    },
}

// Google OAuth URL
export const getGoogleOAuthUrl = (): string => {
    return `${API_BASE_URL}/oauth2/authorization/google`
}

// Message API functions
export const messageApi = {
    // Get conversations with pagination and optional search
    getConversations: async (
        page: number = 0,
        size: number = 20,
        search?: string,
    ): Promise<ConversationListResponse> => {
        const params: Record<string, unknown> = { page, size }
        if (search) params.search = search
        const response = await api.get<ConversationListResponse>(
            "/api/messages/conversations",
            { params },
        )
        return response.data
    },

    // Get all conversations without pagination
    getAllConversations: async (): Promise<ConversationResponse[]> => {
        const response = await api.get<ConversationResponse[]>(
            "/api/messages/conversations/all",
        )
        return response.data
    },

    // Get a specific conversation
    getConversation: async (
        conversationId: number,
    ): Promise<ConversationResponse> => {
        const response = await api.get<ConversationResponse>(
            `/api/messages/conversations/${conversationId}`,
        )
        return response.data
    },

    // Get messages for a conversation
    getMessages: async (
        conversationId: number,
        page: number = 0,
        size: number = 50,
    ): Promise<MessageListResponse> => {
        const response = await api.get<MessageListResponse>(
            `/api/messages/conversations/${conversationId}/messages`,
            { params: { page, size } },
        )
        return response.data
    },

    // Create a new conversation
    createConversation: async (
        request: CreateConversationRequest,
    ): Promise<ConversationResponse> => {
        const response = await api.post<ConversationResponse>(
            "/api/messages/conversations",
            request,
        )
        return response.data
    },

    // Send a message
    sendMessage: async (
        request: SendMessageRequest,
    ): Promise<MessageResponse> => {
        const response = await api.post<MessageResponse>(
            "/api/messages/send",
            request,
        )
        return response.data
    },

    // Mark messages as read
    markAsRead: async (request: MarkAsReadRequest): Promise<void> => {
        await api.post("/api/messages/mark-read", request)
    },

    // Mark conversation as read
    markConversationAsRead: async (conversationId: number): Promise<void> => {
        await api.post(`/api/messages/conversations/${conversationId}/read`)
    },

    // Delete a conversation
    deleteConversation: async (conversationId: number): Promise<void> => {
        await api.delete(`/api/messages/conversations/${conversationId}`)
    },

    // Delete a message
    deleteMessage: async (messageId: number): Promise<void> => {
        await api.delete(`/api/messages/messages/${messageId}`)
    },

    // Get unread count
    getUnreadCount: async (): Promise<UnreadCountResponse> => {
        const response = await api.get<UnreadCountResponse>(
            "/api/messages/unread-count",
        )
        return response.data
    },
}

// Notification API functions
export const notificationApi = {
    // Get paginated notifications
    getNotifications: async (
        page: number = 0,
        size: number = 20,
        filter?: string,
    ): Promise<NotificationListResponse> => {
        const params: Record<string, unknown> = { page, size }
        if (filter) params.filter = filter
        const response = await api.get<NotificationListResponse>(
            "/api/notifications",
            { params },
        )
        return response.data
    },

    // Get a single notification
    getNotification: async (
        notificationId: number,
    ): Promise<NotificationResponse> => {
        const response = await api.get<NotificationResponse>(
            `/api/notifications/${notificationId}`,
        )
        return response.data
    },

    // Get unread count
    getUnreadCount: async (): Promise<NotificationUnreadCountResponse> => {
        const response = await api.get<NotificationUnreadCountResponse>(
            "/api/notifications/unread-count",
        )
        return response.data
    },

    // Get notification summary (for header dropdown)
    getSummary: async (): Promise<NotificationSummary> => {
        const response = await api.get<NotificationSummary>(
            "/api/notifications/summary",
        )
        return response.data
    },

    // Mark notifications as read
    markAsRead: async (
        request: NotificationMarkAsReadRequest,
    ): Promise<void> => {
        await api.post("/api/notifications/mark-read", request)
    },

    // Mark a single notification as read
    markSingleAsRead: async (notificationId: number): Promise<void> => {
        await api.post(`/api/notifications/${notificationId}/read`)
    },

    // Mark all notifications as read
    markAllAsRead: async (): Promise<void> => {
        await api.post("/api/notifications/mark-all-read")
    },

    // Delete notifications
    deleteNotifications: async (
        request: NotificationDeleteRequest,
    ): Promise<void> => {
        await api.delete("/api/notifications", { data: request })
    },

    // Delete a single notification
    deleteNotification: async (notificationId: number): Promise<void> => {
        await api.delete(`/api/notifications/${notificationId}`)
    },

    // Cleanup old read notifications
    cleanupOldNotifications: async (): Promise<void> => {
        await api.delete("/api/notifications/cleanup")
    },
}

// User search API functions
export const userSearchApi = {
    // Search for users to message
    searchUsers: async (query: string): Promise<User[]> => {
        if (!query || query.trim().length < 2) {
            return []
        }
        const response = await api.get<User[]>("/api/users/search", {
            params: { query: query.trim() },
        })
        return response.data
    },

    // Get public profile of a user
    getPublicProfile: async (
        userId: number,
    ): Promise<{
        id: number
        firstName: string
        lastName: string
        fullName: string
        profilePictureUrl: string
        bio: string
        city: string
    }> => {
        const response = await api.get(`/api/users/public/${userId}`)
        return response.data
    },
}

// Admin API functions
export const adminApi = {
    getAllUsers: async (
        page: number = 0,
        size: number = 10,
        search?: string,
    ): Promise<{
        content: User[]
        totalPages: number
        totalElements: number
        number: number
        size: number
    }> => {
        const params: Record<string, unknown> = { page, size }
        if (search) params.search = search
        const response = await api.get("/api/users", { params })
        return response.data
    },

    createUser: async (user: any): Promise<User> => {
        const response = await api.post<User>("/api/users", user)
        return response.data
    },

    updateUser: async (id: number, updates: any): Promise<User> => {
        const response = await api.put<User>(`/api/users/${id}`, updates)
        return response.data
    },

    deleteUser: async (id: number): Promise<void> => {
        await api.delete(`/api/users/${id}`)
    },

    updateUserStatus: async (id: number, status: string): Promise<void> => {
        await api.put(`/api/admin/users/${id}/status`, null, { params: { status } })
    },

    getStats: async (): Promise<{
        totalUsers: number
        totalHouseOwners: number
        totalRegularUsers: number
        totalAdmins: number
        activeUsers: number
        pendingVerifications: number
    }> => {
        const response = await api.get<{
            totalUsers: number
            totalHouseOwners: number
            totalRegularUsers: number
            totalAdmins: number
            activeUsers: number
            pendingVerifications: number
        }>("/api/admin/stats")
        return response.data
    },

    scheduleDeletion: async (id: number, reason: string): Promise<void> => {
        await api.post(`/api/admin/users/${id}/delete-request`, { reason })
    },

    cancelDeletion: async (id: number): Promise<void> => {
        await api.post(`/api/admin/users/${id}/cancel-delete`)
    },

    // Property Management
    getAllProperties: async (): Promise<any[]> => {
        const response = await api.get<any[]>("/api/admin/properties")
        return response.data
    },

    approveProperty: async (id: number): Promise<any> => {
        const response = await api.put<any>(`/api/admin/properties/${id}/approve`)
        return response.data
    },

    rejectProperty: async (id: number): Promise<any> => {
        const response = await api.put<any>(`/api/admin/properties/${id}/reject`)
        return response.data
    },

    // Analytics
    getRevenueAnalytics: async (): Promise<any> => {
        const response = await api.get<any>("/api/admin/analytics/revenue")
        return response.data
    },

    // Reports
    getReports: async (): Promise<Report[]> => {
        const response = await api.get<Report[]>("/api/admin/reports")
        return response.data
    },

    resolveReport: async (id: number, notes: string): Promise<Report> => {
        const response = await api.post<Report>(`/api/admin/reports/${id}/resolve`, { notes })
        return response.data
    },

    dismissReport: async (id: number, notes: string): Promise<Report> => {
        const response = await api.post<Report>(`/api/admin/reports/${id}/dismiss`, { notes })
        return response.data
    },

    // Verifications
    // Verifications
    getVerifications: async (): Promise<VerificationRequest[]> => {
        const response = await api.get<VerificationRequest[]>("/api/admin/verifications")
        return response.data
    },

    approveVerification: async (id: number): Promise<VerificationRequest> => {
        const response = await api.put<VerificationRequest>(`/api/admin/verifications/${id}/approve`)
        return response.data
    },

    rejectVerification: async (id: number, reason: string): Promise<VerificationRequest> => {
        const response = await api.put<VerificationRequest>(`/api/admin/verifications/${id}/reject`, null, {
            params: { reason }
        })
        return response.data
    },

    // Settings
    getSettings: async (): Promise<Record<string, string>> => {
        const response = await api.get<Record<string, string>>("/api/admin/settings")
        return response.data
    },

    updateSettings: async (settings: Record<string, string>): Promise<Record<string, string>> => {
        const response = await api.put<Record<string, string>>("/api/admin/settings", settings)
        return response.data
    },
}

// Application API
export const applicationApi = {
    sendApplication: async (data: { receiverId: number; message: string }) => {
        return api.post("/api/applications", data)
    },
    getSentApplications: async () => {
        return api.get("/api/applications/sent")
    },
    getReceivedApplications: async () => {
        return api.get("/api/applications/received")
    },
    updateStatus: async (id: number, status: string) => {
        return api.patch(`/api/applications/${id}/status`, null, { params: { status } })
    },
    deleteApplication: async (id: number) => {
        return api.delete(`/api/applications/${id}`)
    }
}

// Booking API
export const bookingApi = {
    createBooking: async (data: { landlordId: number; propertyId: number; startDate: string; endDate: string; notes?: string }) => {
        return api.post("/api/bookings", data)
    },
    getMyBookings: async () => {
        const response = await api.get("/api/bookings/my-bookings")
        return response.data
    },
    getBookingRequests: async () => {
        return api.get("/api/bookings/requests")
    },
    updateStatus: async (id: number, status: string) => {
        return api.patch(`/api/bookings/${id}/status`, null, { params: { status } })
    },
    deleteBooking: async (id: number) => {
        return api.delete(`/api/bookings/${id}`)
    }
}

// Match API
export const matchApi = {
    createMatch: async (targetUserId: number) => {
        return api.post("/api/matches", { targetUserId })
    },
    getMatches: async () => {
        return api.get("/api/matches")
    },
    unmatch: async (id: number) => {
        return api.delete(`/api/matches/${id}`)
    }
}

// Dashboard API
export const dashboardApi = {
    getStats: async (): Promise<DashboardStats> => {
        const response = await api.get<DashboardStats>("/api/dashboard/stats")
        return response.data
    },
    getAdminStats: async (): Promise<AdminDashboardDTO> => {
        const response = await api.get<AdminDashboardDTO>("/api/dashboard/admin")
        return response.data
    },
    getLandlordStats: async (): Promise<LandlordDashboardDTO> => {
        const response = await api.get<LandlordDashboardDTO>("/api/dashboard/landlord")
        return response.data
    },
    getUserStats: async (): Promise<UserDashboardDTO> => {
        const response = await api.get<UserDashboardDTO>("/api/dashboard/user")
        return response.data
    }
}


// Property API
export const propertyApi = {
    getRecommended: async (): Promise<any[]> => {
        const response = await api.get<any[]>("/api/properties/recommended")
        return response.data
    },
    getMyProperties: async (): Promise<any[]> => {
        const response = await api.get<any[]>("/api/properties/my-properties")
        return response.data
    },
    searchProperties: async (params: {
        query?: string
        minPrice?: number
        maxPrice?: number
        minBeds?: number
        minBaths?: number
        propertyType?: string
    }): Promise<any[]> => {
        const response = await api.get<any[]>("/api/properties/search", { params })
        return response.data
    },
    getProperty: async (id: number): Promise<any> => {
        const response = await api.get<any>(`/api/properties/${id}`)
        return response.data
    },
    createProperty: async (data: any, files?: File[]): Promise<any> => {
        const formData = new FormData()

        // Append JSON data as a Blob with application/json type
        formData.append("data", new Blob([JSON.stringify(data)], {
            type: "application/json"
        }))

        // Append files
        if (files) {
            files.forEach((file) => {
                formData.append("files", file)
            })
        }

        const response = await api.post<any>("/api/properties", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
        return response.data
    },
    updateStatus: async (id: number, status: string): Promise<any> => {
        const response = await api.patch<any>(`/api/properties/${id}/status`, null, {
            params: { status }
        })
        return response.data
    },
    deleteProperty: async (id: number): Promise<void> => {
        await api.delete(`/api/properties/${id}`)
    }
}

// Contact API
export const contactApi = {
    sendMessage: async (data: { name: string; email: string; message: string }) => {
        return api.post("/api/contact", data)
    }
}

export const roommateApi = {
    getAll: (params?: any) => api.get("/api/roommates", { params }).then((res) => res.data),
    getRecommended: () => api.get("/api/roommates", { params: { size: 5, sort: "createdAt,desc" } }).then((res) => res.data),
    getMyPosts: () => api.get("/api/roommates/my").then((res) => res.data),
    getById: (id: number) => api.get(`/api/roommates/${id}`).then((res) => res.data),
    create: (data: any) => api.post("/api/roommates", data).then((res) => res.data),
    update: (id: number, data: any) => api.put(`/api/roommates/${id}`, data).then((res) => res.data),
    delete: (id: number) => api.delete(`/api/roommates/${id}`),
    getAllAdmin: () => api.get<any[]>("/api/roommates/all").then((res) => res.data),
    updateStatus: (id: number, status: string) => api.put<any>(`/api/roommates/${id}/status`, null, { params: { status } }).then((res) => res.data),
    getMatches: () => api.get<any[]>("/api/roommates/matches").then((res) => res.data),
}

export const savedApi = {
    getProperties: async (): Promise<any[]> => {
        const response = await api.get<any[]>("/api/saved/properties")
        return response.data
    },
    saveProperty: async (id: number) => {
        return api.post(`/api/saved/properties/${id}`)
    },
    removeProperty: async (id: number) => {
        return api.delete(`/api/saved/properties/${id}`)
    },
    isPropertySaved: async (id: number): Promise<boolean> => {
        const response = await api.get<{ isSaved: boolean }>(`/api/saved/properties/${id}/check`)
        return response.data.isSaved
    },
    getRoommates: async (): Promise<any[]> => {
        const response = await api.get<any[]>("/api/saved/roommates")
        return response.data
    },
    saveRoommate: async (id: number) => {
        return api.post(`/api/saved/roommates/${id}`)
    },
    removeRoommate: async (id: number) => {
        return api.delete(`/api/saved/roommates/${id}`)
    },

    isRoommateSaved: async (id: number): Promise<boolean> => {
        const response = await api.get<{ isSaved: boolean }>(`/api/saved/roommates/${id}/check`)
        return response.data.isSaved
    }
}

export const reviewApi = {
    create: async (data: { propertyId?: number; receiverId?: number; rating: number; comment: string }) => {
        const response = await api.post('/api/reviews', data)
        return response.data
    },
    getByUser: async (userId: number, page = 0) => {
        const response = await api.get(`/api/reviews/user/${userId}?page=${page}`)
        return response.data
    },
    getByProperty: async (propertyId: number, page = 0) => {
        const response = await api.get(`/api/reviews/property/${propertyId}?page=${page}`)
        return response.data
    },
    delete: async (id: number) => {
        await api.delete(`/api/reviews/${id}`)
    }
}

// Audit API (Admin only)
export const auditApi = {
    getLogs: async (page: number = 0, size: number = 50) => {
        const response = await api.get("/api/admin/audit", { params: { page, size } })
        return response.data
    },
    getLogsForUser: async (userId: number, page: number = 0, size: number = 50) => {
        const response = await api.get(`/api/admin/audit/user/${userId}`, { params: { page, size } })
        return response.data
    },
    getLogsForEntity: async (entityType: string, entityId: number, page: number = 0, size: number = 50) => {
        const response = await api.get(`/api/admin/audit/entity/${entityType}/${entityId}`, { params: { page, size } })
        return response.data
    },
    cleanup: async (retentionDays: number = 90) => {
        const response = await api.delete("/api/admin/audit/cleanup", { params: { retentionDays } })
        return response.data
    }
}

export default api
