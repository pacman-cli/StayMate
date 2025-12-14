import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import {
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    RoleSelectionRequest,
    TokenRefreshRequest,
    User,
    ConversationListResponse,
    ConversationResponse,
    MessageListResponse,
    MessageResponse,
    SendMessageRequest,
    CreateConversationRequest,
    UnreadCountResponse,
    MarkAsReadRequest,
    NotificationListResponse,
    NotificationResponse,
    NotificationUnreadCountResponse,
    NotificationSummary,
    NotificationMarkAsReadRequest,
    NotificationDeleteRequest,
} from "@/types/auth";

const isServer = typeof window === "undefined";
const API_BASE_URL = isServer
    ? process.env.BACKEND_URL || "http://localhost:8080"
    : process.env.NEXT_PUBLIC_API_URL || "";

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

// Token management
export const getAccessToken = (): string | undefined => {
    return Cookies.get("accessToken");
};

export const getRefreshToken = (): string | undefined => {
    return Cookies.get("refreshToken");
};

export const setTokens = (accessToken: string, refreshToken: string): void => {
    // Check if we're in development (localhost)
    const isLocalhost =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1");

    // Access token expires in 15 minutes
    Cookies.set("accessToken", accessToken, {
        expires: 1 / 96,
        secure: !isLocalhost, // Only use secure in production (HTTPS)
        sameSite: "lax",
    });
    // Refresh token expires in 7 days
    Cookies.set("refreshToken", refreshToken, {
        expires: 7,
        secure: !isLocalhost, // Only use secure in production (HTTPS)
        sameSite: "lax",
    });
};

export const clearTokens = (): void => {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
};

// Request interceptor - add auth token
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getAccessToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        // If 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = getRefreshToken();
            if (refreshToken) {
                try {
                    const response = await axios.post<AuthResponse>(
                        `${API_BASE_URL}/api/auth/refresh-token`,
                        {
                            refreshToken,
                        },
                    );

                    const { accessToken, refreshToken: newRefreshToken } =
                        response.data;
                    setTokens(accessToken, newRefreshToken);

                    // Retry original request with new token
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    }
                    return api(originalRequest);
                } catch (refreshError) {
                    // Refresh failed, clear tokens and redirect to login
                    clearTokens();
                    if (typeof window !== "undefined") {
                        window.location.href = "/login";
                    }
                    return Promise.reject(refreshError);
                }
            }
        }

        return Promise.reject(error);
    },
);

// Auth API functions
export const authApi = {
    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>(
            "/api/auth/register",
            data,
        );
        return response.data;
    },

    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>("/api/auth/login", data);
        return response.data;
    },

    refreshToken: async (data: TokenRefreshRequest): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>(
            "/api/auth/refresh-token",
            data,
        );
        return response.data;
    },

    getCurrentUser: async (): Promise<User> => {
        const response = await api.get<User>("/api/auth/me");
        return response.data;
    },

    logout: async (): Promise<void> => {
        try {
            await api.post("/api/auth/logout");
        } finally {
            clearTokens();
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
        );
        return response.data;
    },

    validateToken: async (): Promise<{ valid: boolean; email?: string }> => {
        const response = await api.get<{ valid: boolean; email?: string }>(
            "/api/auth/validate",
        );
        return response.data;
    },

    selectRole: async (data: RoleSelectionRequest): Promise<User> => {
        const response = await api.post<User>("/api/auth/select-role", data);
        return response.data;
    },
};

// User API functions
export const userApi = {
    getProfile: async (): Promise<User> => {
        const response = await api.get<User>("/api/users/profile");
        return response.data;
    },

    updateProfile: async (updates: {
        firstName?: string;
        lastName?: string;
        profilePictureUrl?: string;
    }): Promise<User> => {
        const response = await api.put<User>("/api/users/profile", updates);
        return response.data;
    },

    deleteAccount: async (): Promise<{ message: string }> => {
        const response = await api.delete<{ message: string }>(
            "/api/users/profile",
        );
        return response.data;
    },

    hasRole: async (role: string): Promise<{ hasRole: boolean }> => {
        const response = await api.get<{ hasRole: boolean }>(
            `/api/users/has-role/${role}`,
        );
        return response.data;
    },
};

// Google OAuth URL
export const getGoogleOAuthUrl = (): string => {
    return `${API_BASE_URL}/oauth2/authorization/google`;
};

// Message API functions
export const messageApi = {
    // Get conversations with pagination and optional search
    getConversations: async (
        page: number = 0,
        size: number = 20,
        search?: string,
    ): Promise<ConversationListResponse> => {
        const params: Record<string, unknown> = { page, size };
        if (search) params.search = search;
        const response = await api.get<ConversationListResponse>(
            "/api/messages/conversations",
            { params },
        );
        return response.data;
    },

    // Get all conversations without pagination
    getAllConversations: async (): Promise<ConversationResponse[]> => {
        const response = await api.get<ConversationResponse[]>(
            "/api/messages/conversations/all",
        );
        return response.data;
    },

    // Get a specific conversation
    getConversation: async (
        conversationId: number,
    ): Promise<ConversationResponse> => {
        const response = await api.get<ConversationResponse>(
            `/api/messages/conversations/${conversationId}`,
        );
        return response.data;
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
        );
        return response.data;
    },

    // Create a new conversation
    createConversation: async (
        request: CreateConversationRequest,
    ): Promise<ConversationResponse> => {
        const response = await api.post<ConversationResponse>(
            "/api/messages/conversations",
            request,
        );
        return response.data;
    },

    // Send a message
    sendMessage: async (
        request: SendMessageRequest,
    ): Promise<MessageResponse> => {
        const response = await api.post<MessageResponse>(
            "/api/messages/send",
            request,
        );
        return response.data;
    },

    // Mark messages as read
    markAsRead: async (request: MarkAsReadRequest): Promise<void> => {
        await api.post("/api/messages/mark-read", request);
    },

    // Mark conversation as read
    markConversationAsRead: async (conversationId: number): Promise<void> => {
        await api.post(`/api/messages/conversations/${conversationId}/read`);
    },

    // Delete a conversation
    deleteConversation: async (conversationId: number): Promise<void> => {
        await api.delete(`/api/messages/conversations/${conversationId}`);
    },

    // Delete a message
    deleteMessage: async (messageId: number): Promise<void> => {
        await api.delete(`/api/messages/messages/${messageId}`);
    },

    // Get unread count
    getUnreadCount: async (): Promise<UnreadCountResponse> => {
        const response = await api.get<UnreadCountResponse>(
            "/api/messages/unread-count",
        );
        return response.data;
    },
};

// Notification API functions
export const notificationApi = {
    // Get paginated notifications
    getNotifications: async (
        page: number = 0,
        size: number = 20,
        filter?: string,
    ): Promise<NotificationListResponse> => {
        const params: Record<string, unknown> = { page, size };
        if (filter) params.filter = filter;
        const response = await api.get<NotificationListResponse>(
            "/api/notifications",
            { params },
        );
        return response.data;
    },

    // Get a single notification
    getNotification: async (
        notificationId: number,
    ): Promise<NotificationResponse> => {
        const response = await api.get<NotificationResponse>(
            `/api/notifications/${notificationId}`,
        );
        return response.data;
    },

    // Get unread count
    getUnreadCount: async (): Promise<NotificationUnreadCountResponse> => {
        const response = await api.get<NotificationUnreadCountResponse>(
            "/api/notifications/unread-count",
        );
        return response.data;
    },

    // Get notification summary (for header dropdown)
    getSummary: async (): Promise<NotificationSummary> => {
        const response = await api.get<NotificationSummary>(
            "/api/notifications/summary",
        );
        return response.data;
    },

    // Mark notifications as read
    markAsRead: async (
        request: NotificationMarkAsReadRequest,
    ): Promise<void> => {
        await api.post("/api/notifications/mark-read", request);
    },

    // Mark a single notification as read
    markSingleAsRead: async (notificationId: number): Promise<void> => {
        await api.post(`/api/notifications/${notificationId}/read`);
    },

    // Mark all notifications as read
    markAllAsRead: async (): Promise<void> => {
        await api.post("/api/notifications/mark-all-read");
    },

    // Delete notifications
    deleteNotifications: async (
        request: NotificationDeleteRequest,
    ): Promise<void> => {
        await api.delete("/api/notifications", { data: request });
    },

    // Delete a single notification
    deleteNotification: async (notificationId: number): Promise<void> => {
        await api.delete(`/api/notifications/${notificationId}`);
    },

    // Cleanup old read notifications
    cleanupOldNotifications: async (): Promise<void> => {
        await api.delete("/api/notifications/cleanup");
    },
};

// User search API functions
export const userSearchApi = {
    // Search for users to message
    searchUsers: async (query: string): Promise<User[]> => {
        if (!query || query.trim().length < 2) {
            return [];
        }
        const response = await api.get<User[]>("/api/users/search", {
            params: { query: query.trim() },
        });
        return response.data;
    },

    // Get public profile of a user
    getPublicProfile: async (
        userId: number,
    ): Promise<{
        id: number;
        firstName: string;
        lastName: string;
        fullName: string;
        profilePictureUrl: string;
        bio: string;
        city: string;
    }> => {
        const response = await api.get(`/api/users/public/${userId}`);
        return response.data;
    },
};

export default api;
