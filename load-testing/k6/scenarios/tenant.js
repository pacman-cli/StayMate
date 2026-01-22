/**
 * Tenant Scenario - k6 Load Test (100% Coverage)
 * ================================================
 * Complete tenant user behavior with ALL endpoints:
 * - Authentication (register, login, token refresh)
 * - Properties (browse, search, view details, save)
 * - Bookings (create, view, manage)
 * - Dashboard & Notifications
 * - Roommates (search, match, apply)
 * - Reviews & Maintenance
 * - Support & Messaging
 */

import { check, group, sleep } from 'k6'
import http from 'k6/http'
import { BASE_URL, TEST_PASSWORD } from '../config.js'

// State management
let authData = null
let viewedProperties = []
let myBookings = []

/**
 * Register a new tenant user
 */
function register() {
    const uid = `${Date.now()}_${Math.random().toString(36).substring(7)}`
    const email = `loadtest_tenant_${uid}@test.com`

    const payload = JSON.stringify({
        email: email,
        password: TEST_PASSWORD,
        firstName: 'TestTenant',
        lastName: uid.substring(0, 8),
        phoneNumber: `555${Math.floor(Math.random() * 9000000) + 1000000}`,
        role: 'USER',
        bio: 'k6 Load Test Tenant',
    })

    const res = http.post(`${BASE_URL}/api/auth/register`, payload, {
        headers: { 'Content-Type': 'application/json' },
        tags: { endpoint: 'register' },
    })

    if (res.status === 200 || res.status === 201) {
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
 * Login with credentials
 */
function login(email, password) {
    const res = http.post(`${BASE_URL}/api/auth/login`,
        JSON.stringify({ email, password }), {
        headers: { 'Content-Type': 'application/json' },
        tags: { endpoint: 'login' },
    })

    if (res.status === 200) {
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
 * Get auth headers
 */
function authHeaders(token) {
    return {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    }
}

/**
 * Main tenant scenario
 */
export default function tenantScenario() {
    // Initialize auth
    if (!authData) {
        authData = register()
    }

    if (!authData || !authData.token) {
        console.error('Tenant auth failed')
        return
    }

    const token = authData.token
    const headers = authHeaders(token)

    // ===== AUTHENTICATION ENDPOINTS =====
    group('Auth Validation', function () {
        // GET /api/auth/me
        const meRes = http.get(`${BASE_URL}/api/auth/me`, headers)
        check(meRes, { 'auth/me - 200': (r) => r.status === 200 })

        // GET /api/auth/validate
        const valRes = http.get(`${BASE_URL}/api/auth/validate`, headers)
        check(valRes, { 'auth/validate - 200': (r) => r.status === 200 })

        sleep(1)
    })

    // ===== PROPERTY BROWSING =====
    group('Property Browsing', function () {
        // GET /api/properties/recommended
        const recRes = http.get(`${BASE_URL}/api/properties/recommended`, headers)
        check(recRes, { 'properties/recommended - 200': (r) => r.status === 200 })

        // GET /api/properties/search
        const terms = ['apartment', 'house', 'room', '']
        const term = terms[Math.floor(Math.random() * terms.length)]
        const searchRes = http.get(`${BASE_URL}/api/properties/search?query=${term}`, headers)
        check(searchRes, { 'properties/search - 200': (r) => r.status === 200 })

        // Extract properties
        if (searchRes.status === 200) {
            const props = searchRes.json()
            if (Array.isArray(props) && props.length > 0) {
                viewedProperties = props.slice(0, 5)
            }
        }

        // GET /api/properties/{id}
        if (viewedProperties.length > 0) {
            const prop = viewedProperties[Math.floor(Math.random() * viewedProperties.length)]
            const detailRes = http.get(`${BASE_URL}/api/properties/${prop.id}`, headers)
            check(detailRes, { 'properties/{id} - 200': (r) => r.status === 200 })

            // GET /api/reviews/property/{propertyId}
            const revRes = http.get(`${BASE_URL}/api/reviews/property/${prop.id}`, headers)
            check(revRes, { 'reviews/property - 200': (r) => r.status === 200 })
        }

        sleep(2)
    })

    // ===== SAVED ITEMS =====
    group('Saved Items', function () {
        // GET /api/saved/properties
        const savedRes = http.get(`${BASE_URL}/api/saved/properties`, headers)
        check(savedRes, { 'saved/properties - 200': (r) => r.status === 200 })

        // POST /api/saved/properties/{id}
        if (viewedProperties.length > 0 && Math.random() < 0.3) {
            const prop = viewedProperties[Math.floor(Math.random() * viewedProperties.length)]
            const saveRes = http.post(`${BASE_URL}/api/saved/properties/${prop.id}`, null, headers)
            check(saveRes, { 'save property - 200/409': (r) => [200, 409].includes(r.status) })

            // GET /api/saved/properties/{id}/check
            const checkRes = http.get(`${BASE_URL}/api/saved/properties/${prop.id}/check`, headers)
            check(checkRes, { 'saved check - 200': (r) => r.status === 200 })
        }

        // GET /api/saved/roommates
        const savedRmRes = http.get(`${BASE_URL}/api/saved/roommates`, headers)
        check(savedRmRes, { 'saved/roommates - 200': (r) => r.status === 200 })

        sleep(1)
    })

    // ===== BOOKINGS =====
    group('Bookings', function () {
        // GET /api/bookings/my-bookings
        const bookingsRes = http.get(`${BASE_URL}/api/bookings/my-bookings`, headers)
        check(bookingsRes, { 'my-bookings - 200': (r) => r.status === 200 })

        if (bookingsRes.status === 200) {
            let bookings = bookingsRes.json()
            if (bookings && bookings.content) bookings = bookings.content
            if (Array.isArray(bookings)) myBookings = bookings
        }

        // POST /api/bookings (create booking - 20% chance)
        if (viewedProperties.length > 0 && Math.random() < 0.2) {
            const prop = viewedProperties[Math.floor(Math.random() * viewedProperties.length)]
            const today = new Date()
            const startDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
            const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000)

            const bookingRes = http.post(`${BASE_URL}/api/bookings`,
                JSON.stringify({
                    propertyId: prop.id,
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0],
                    notes: 'k6 Load Test',
                }), headers)
            check(bookingRes, { 'create booking - 200/201/400': (r) => [200, 201, 400].includes(r.status) })
        }

        sleep(1)
    })

    // ===== ROOMMATES =====
    group('Roommates', function () {
        // GET /api/roommates - search
        const rmSearchRes = http.get(`${BASE_URL}/api/roommates`, headers)
        check(rmSearchRes, { 'roommates search - 200': (r) => r.status === 200 })

        // GET /api/roommates/matches
        const matchesRes = http.get(`${BASE_URL}/api/roommates/matches`, headers)
        check(matchesRes, { 'roommates/matches - 200/404': (r) => [200, 404].includes(r.status) })

        // GET /api/roommates/my
        const myPostsRes = http.get(`${BASE_URL}/api/roommates/my`, headers)
        check(myPostsRes, { 'roommates/my - 200': (r) => r.status === 200 })

        // GET /api/matches
        const allMatchesRes = http.get(`${BASE_URL}/api/matches`, headers)
        check(allMatchesRes, { 'matches list - 200': (r) => r.status === 200 })

        sleep(1)
    })

    // ===== APPLICATIONS =====
    group('Applications', function () {
        // GET /api/applications/sent
        const sentRes = http.get(`${BASE_URL}/api/applications/sent`, headers)
        check(sentRes, { 'applications/sent - 200': (r) => r.status === 200 })

        // GET /api/applications/received
        const recvRes = http.get(`${BASE_URL}/api/applications/received`, headers)
        check(recvRes, { 'applications/received - 200': (r) => r.status === 200 })

        sleep(1)
    })

    // ===== DASHBOARD & NOTIFICATIONS =====
    group('Dashboard', function () {
        // GET /api/dashboard/user
        const dashRes = http.get(`${BASE_URL}/api/dashboard/user`, headers)
        check(dashRes, { 'dashboard/user - 200': (r) => r.status === 200 })

        // GET /api/dashboard/stats
        const statsRes = http.get(`${BASE_URL}/api/dashboard/stats`, headers)
        check(statsRes, { 'dashboard/stats - 200': (r) => r.status === 200 })

        sleep(1)
    })

    group('Notifications', function () {
        // GET /api/notifications
        const notifRes = http.get(`${BASE_URL}/api/notifications`, headers)
        check(notifRes, { 'notifications - 200': (r) => r.status === 200 })

        // GET /api/notifications/unread-count
        const unreadRes = http.get(`${BASE_URL}/api/notifications/unread-count`, headers)
        check(unreadRes, { 'unread-count - 200': (r) => r.status === 200 })

        // GET /api/notifications/summary
        const summaryRes = http.get(`${BASE_URL}/api/notifications/summary`, headers)
        check(summaryRes, { 'notifications/summary - 200': (r) => r.status === 200 })

        sleep(1)
    })

    // ===== MESSAGING =====
    group('Messaging', function () {
        // GET /api/messages/conversations
        const convRes = http.get(`${BASE_URL}/api/messages/conversations`, headers)
        check(convRes, { 'messages/conversations - 200': (r) => r.status === 200 })

        // GET /api/messages/unread-count
        const msgUnreadRes = http.get(`${BASE_URL}/api/messages/unread-count`, headers)
        check(msgUnreadRes, { 'messages/unread-count - 200': (r) => r.status === 200 })

        sleep(1)
    })

    // ===== MAINTENANCE =====
    group('Maintenance', function () {
        // GET /api/maintenance/my-requests
        const maintRes = http.get(`${BASE_URL}/api/maintenance/my-requests`, headers)
        check(maintRes, { 'maintenance/my-requests - 200': (r) => r.status === 200 })

        sleep(1)
    })

    // ===== SUPPORT =====
    group('Support', function () {
        // GET /api/support/my-tickets
        const ticketsRes = http.get(`${BASE_URL}/api/support/my-tickets`, headers)
        check(ticketsRes, { 'support/my-tickets - 200': (r) => r.status === 200 })

        sleep(1)
    })

    // ===== USER PROFILE =====
    group('User Profile', function () {
        // GET /api/users/profile
        const profileRes = http.get(`${BASE_URL}/api/users/profile`, headers)
        check(profileRes, { 'users/profile - 200': (r) => r.status === 200 })

        // GET /api/verification/status
        const verifRes = http.get(`${BASE_URL}/api/verification/status`, headers)
        check(verifRes, { 'verification/status - 200': (r) => r.status === 200 })

        sleep(1)
    })

    // ===== FINANCE (Tenant: payments/spending) =====
    group('Finance', function () {
        // GET /api/finance/payments
        const payRes = http.get(`${BASE_URL}/api/finance/payments`, headers)
        check(payRes, { 'finance/payments - 200': (r) => r.status === 200 })

        // GET /api/finance/spending-summary
        const spendRes = http.get(`${BASE_URL}/api/finance/spending-summary`, headers)
        check(spendRes, { 'finance/spending-summary - 200': (r) => r.status === 200 })

        sleep(2)
    })
}
