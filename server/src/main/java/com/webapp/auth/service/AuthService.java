package com.webapp.auth.service;

import com.webapp.auth.dto.request.LoginRequest;
import com.webapp.auth.dto.request.RegisterRequest;
import com.webapp.auth.dto.request.TokenRefreshRequest;
import com.webapp.auth.dto.response.AuthResponse;
import com.webapp.domain.user.entity.User;

/**
 * Service interface for authentication operations.
 * Handles user registration, login, and token management.
 *
 * Note: Role management operations have been moved to UserService
 * as they are user management concerns, not authentication concerns.
 */
public interface AuthService {
    /**
     * Register a new user and return authentication tokens.
     */
    AuthResponse register(RegisterRequest request);

    /**
     * Authenticate a user and return authentication tokens.
     */
    AuthResponse login(LoginRequest request);

    /**
     * Refresh an expired access token using a valid refresh token.
     */
    AuthResponse refreshToken(TokenRefreshRequest request);

    /**
     * Get the currently authenticated user.
     */
    User getCurrentUser();
}
