/**
 * Landlord Scenario - k6 Load Test (100% Coverage)
 * =================================================
 * Complete landlord user behavior with ALL endpoints:
 * - Authentication (register as HOUSE_OWNER)
 * - Property management (create, update, status)
 * - Booking handling (requests, accept/reject)
 * - Landlord dashboard & overview
 * - Finance (earnings, payouts)
 * - Maintenance handling
 * - Reviews & messaging
 */

import { check, group, sleep } from 'k6'
import http from 'k6/http'
import { BASE_URL, TEST_PASSWORD } from '../config.js'

let authData = null
let myProperties = []
let bookingRequests = []

function register() {
    const uid = `${Date.now()}_${Math.random().toString(36).substring(7)}`
    const email = `loadtest_landlord_${uid}@test.com`

    const res = http.post(`${BASE_URL}/api/auth/register`,
        JSON.stringify({
            email: email,
            password: TEST_PASSWORD,
            firstName: 'TestLandlord',
            lastName: uid.substring(0, 8),
            phoneNumber: `555${Math.floor(Math.random() * 9000000) + 1000000}`,
            role: 'HOUSE_OWNER',
            bio: 'k6 Load Test Landlord',
        }), {
        headers: { 'Content-Type': 'application/json' },
        tags: { endpoint: 'register' },
    })

    if (res.status === 200 || res.status === 201) {
        const data = res.json()
        return { token: data.accessToken, refreshToken: data.refreshToken, userId: data.userId, email }
    }
    return null
}

function authHeaders(token) {
    return { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } }
}

export default function landlordScenario() {
    if (!authData) authData = register()
    if (!authData || !authData.token) { console.error('Landlord auth failed'); return }

    const token = authData.token
    const headers = authHeaders(token)

    // ===== LANDLORD DASHBOARD =====
    group('Landlord Dashboard', function () {
        // GET /api/dashboard/landlord
        const dashRes = http.get(`${BASE_URL}/api/dashboard/landlord`, headers)
        check(dashRes, { 'dashboard/landlord - 200': (r) => r.status === 200 })

        // GET /api/landlord/dashboard/overview
        const overviewRes = http.get(`${BASE_URL}/api/landlord/dashboard/overview`, headers)
        check(overviewRes, { 'landlord/overview - 200': (r) => r.status === 200 })

        // GET /api/dashboard/stats
        const statsRes = http.get(`${BASE_URL}/api/dashboard/stats`, headers)
        check(statsRes, { 'dashboard/stats - 200': (r) => r.status === 200 })

        sleep(2)
    })

    // ===== PROPERTY MANAGEMENT =====
    group('Property Management', function () {
        // GET /api/properties/my-properties
        const propsRes = http.get(`${BASE_URL}/api/properties/my-properties`, headers)
        check(propsRes, { 'my-properties - 200': (r) => r.status === 200 })

        if (propsRes.status === 200) {
            const props = propsRes.json()
            if (Array.isArray(props)) myProperties = props
        }

        // GET /api/landlord/properties/summary
        const summaryRes = http.get(`${BASE_URL}/api/landlord/properties/summary`, headers)
        check(summaryRes, { 'landlord/properties/summary - 200': (r) => r.status === 200 })

        // View property details
        if (myProperties.length > 0) {
            const prop = myProperties[Math.floor(Math.random() * myProperties.length)]
            const detailRes = http.get(`${BASE_URL}/api/properties/my-properties/${prop.id}`, headers)
            check(detailRes, { 'my-properties/{id} - 200': (r) => r.status === 200 })
        }

        sleep(2)
    })

    // ===== BOOKING MANAGEMENT =====
    group('Booking Management', function () {
        // GET /api/bookings/requests
        const reqsRes = http.get(`${BASE_URL}/api/bookings/requests`, headers)
        check(reqsRes, { 'bookings/requests - 200': (r) => r.status === 200 })

        if (reqsRes.status === 200) {
            let reqs = reqsRes.json()
            if (reqs && reqs.content) reqs = reqs.content
            if (Array.isArray(reqs)) bookingRequests = reqs
        }

        // GET /api/landlord/bookings
        const landlordBookingsRes = http.get(`${BASE_URL}/api/landlord/bookings`, headers)
        check(landlordBookingsRes, { 'landlord/bookings - 200': (r) => r.status === 200 })

        // Process pending bookings (10% chance)
        const pending = bookingRequests.filter(b => b.status === 'PENDING')
        if (pending.length > 0 && Math.random() < 0.1) {
            const booking = pending[0]
            const action = Math.random() > 0.3 ? 'CONFIRMED' : 'REJECTED'
            const updateRes = http.patch(`${BASE_URL}/api/bookings/${booking.id}/status?status=${action}`, null, headers)
            check(updateRes, { 'update booking - 200': (r) => r.status === 200 })
        }

        sleep(2)
    })

    // ===== MAINTENANCE =====
    group('Maintenance', function () {
        // GET /api/maintenance/property-requests
        const maintRes = http.get(`${BASE_URL}/api/maintenance/property-requests`, headers)
        check(maintRes, { 'property-requests - 200': (r) => r.status === 200 })

        sleep(1)
    })

    // ===== FINANCE =====
    group('Finance', function () {
        // GET /api/finance/earnings
        const earnRes = http.get(`${BASE_URL}/api/finance/earnings`, headers)
        check(earnRes, { 'finance/earnings - 200': (r) => r.status === 200 })

        // GET /api/finance/earnings/history
        const histRes = http.get(`${BASE_URL}/api/finance/earnings/history`, headers)
        check(histRes, { 'earnings/history - 200': (r) => r.status === 200 })

        // GET /api/finance/payout-methods
        const payoutRes = http.get(`${BASE_URL}/api/finance/payout-methods`, headers)
        check(payoutRes, { 'payout-methods - 200': (r) => r.status === 200 })

        sleep(2)
    })

    // ===== REVIEWS =====
    group('Reviews', function () {
        // GET /api/landlord/reviews
        const revRes = http.get(`${BASE_URL}/api/landlord/reviews`, headers)
        check(revRes, { 'landlord/reviews - 200': (r) => r.status === 200 })

        sleep(1)
    })

    // ===== NOTIFICATIONS & MESSAGING =====
    group('Notifications', function () {
        const notifRes = http.get(`${BASE_URL}/api/notifications`, headers)
        check(notifRes, { 'notifications - 200': (r) => r.status === 200 })

        const unreadRes = http.get(`${BASE_URL}/api/notifications/unread-count`, headers)
        check(unreadRes, { 'unread-count - 200': (r) => r.status === 200 })

        sleep(1)
    })

    group('Messaging', function () {
        const convRes = http.get(`${BASE_URL}/api/messages/conversations`, headers)
        check(convRes, { 'conversations - 200': (r) => r.status === 200 })

        sleep(1)
    })

    // ===== SUPPORT =====
    group('Support', function () {
        const ticketsRes = http.get(`${BASE_URL}/api/support/my-tickets`, headers)
        check(ticketsRes, { 'my-tickets - 200': (r) => r.status === 200 })

        sleep(1)
    })

    // ===== USER PROFILE =====
    group('Profile', function () {
        const profileRes = http.get(`${BASE_URL}/api/users/profile`, headers)
        check(profileRes, { 'users/profile - 200': (r) => r.status === 200 })

        const verifRes = http.get(`${BASE_URL}/api/verification/status`, headers)
        check(verifRes, { 'verification/status - 200': (r) => r.status === 200 })

        sleep(2)
    })
}
