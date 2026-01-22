/**
 * Authentication Utilities for k6 Load Tests
 * ==========================================
 */

import { check } from 'k6'
import http from 'k6/http'
import { BASE_URL, TEST_PASSWORD } from '../config.js'

/**
 * Register a new user
 * @param {string} role - USER or HOUSE_OWNER
 * @returns {object} - { token, refreshToken, userId, email }
 */
export function register(role) {
    const uid = `${Date.now()}_${Math.random().toString(36).substring(7)}`
    const email = `loadtest_${role.toLowerCase()}_${uid}@test.com`

    const payload = JSON.stringify({
        email: email,
        password: TEST_PASSWORD,
        firstName: `Test${role}`,
        lastName: uid.substring(0, 8),
        phoneNumber: `555${Math.floor(Math.random() * 9000000) + 1000000}`,
        role: role,
        bio: 'Load testing user',
    })

    const params = {
        headers: { 'Content-Type': 'application/json' },
        tags: { endpoint: 'register' },
    }

    const res = http.post(`${BASE_URL}/api/auth/register`, payload, params)

    const success = check(res, {
        'register status is 200 or 201': (r) => r.status === 200 || r.status === 201,
    })

    if (success && res.status !== 409) {
        const data = res.json()
        return {
            token: data.accessToken,
            refreshToken: data.refreshToken,
            userId: data.userId,
            email: email,
        }
    }

    // If registration failed due to conflict, try login
    if (res.status === 409) {
        return login(email, TEST_PASSWORD)
    }

    return null
}

/**
 * Login with credentials
 * @param {string} email
 * @param {string} password
 * @returns {object} - { token, refreshToken, userId, email }
 */
export function login(email, password) {
    const payload = JSON.stringify({ email, password })

    const params = {
        headers: { 'Content-Type': 'application/json' },
        tags: { endpoint: 'login' },
    }

    const res = http.post(`${BASE_URL}/api/auth/login`, payload, params)

    const success = check(res, {
        'login status is 200': (r) => r.status === 200,
        'login response has token': (r) => r.json('accessToken') !== undefined,
    })

    if (success) {
        const data = res.json()
        return {
            token: data.accessToken,
            refreshToken: data.refreshToken,
            userId: data.userId,
            email: email,
        }
    }

    return null
}

/**
 * Refresh JWT token
 * @param {string} refreshToken
 * @returns {object} - new tokens
 */
export function refreshAccessToken(refreshToken) {
    const payload = JSON.stringify({ refreshToken })

    const params = {
        headers: { 'Content-Type': 'application/json' },
        tags: { endpoint: 'refresh' },
    }

    const res = http.post(`${BASE_URL}/api/auth/refresh-token`, payload, params)

    if (res.status === 200) {
        const data = res.json()
        return {
            token: data.accessToken,
            refreshToken: data.refreshToken,
        }
    }

    return null
}

/**
 * Get authorization headers
 * @param {string} token
 * @returns {object} - headers object
 */
export function getAuthHeaders(token) {
    return {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    }
}
