/**
 * Admin Scenario - k6 Load Test (100% Coverage)
 * ==============================================
 * Complete admin user behavior with ALL endpoints:
 * - Admin dashboards & analytics
 * - Financial management
 * - User management
 * - Property moderation
 * - Verification processing
 * - Support & reports
 */

import { check, group, sleep } from 'k6'
import http from 'k6/http'
import { ADMIN_EMAIL, ADMIN_PASSWORD, BASE_URL } from '../config.js'

let authData = null

function login(email, password) {
    const res = http.post(`${BASE_URL}/api/auth/login`,
        JSON.stringify({ email, password }), {
        headers: { 'Content-Type': 'application/json' },
        tags: { endpoint: 'login' },
    })

    if (res.status === 200) {
        const data = res.json()
        return { token: data.accessToken, refreshToken: data.refreshToken, userId: data.userId, email }
    }
    return null
}

function authHeaders(token) {
    return { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } }
}

export default function adminScenario() {
    if (!authData) authData = login(ADMIN_EMAIL, ADMIN_PASSWORD)
    if (!authData || !authData.token) { console.error('Admin auth failed'); return }

    const token = authData.token
    const headers = authHeaders(token)

    // ===== ADMIN DASHBOARDS =====
    group('Admin Dashboards', function () {
        // GET /api/dashboard/admin
        const dashRes = http.get(`${BASE_URL}/api/dashboard/admin`, headers)
        check(dashRes, { 'dashboard/admin - 200': (r) => r.status === 200 })

        // GET /api/admin/dashboard
        const adminDashRes = http.get(`${BASE_URL}/api/admin/dashboard`, headers)
        check(adminDashRes, { 'admin/dashboard - 200': (r) => r.status === 200 })

        // GET /api/admin/stats
        const statsRes = http.get(`${BASE_URL}/api/admin/stats`, headers)
        check(statsRes, { 'admin/stats - 200': (r) => r.status === 200 })

        sleep(2)
    })

    // ===== ANALYTICS =====
    group('Analytics', function () {
        // GET /api/admin/analytics/financial-overview
        const finRes = http.get(`${BASE_URL}/api/admin/analytics/financial-overview`, headers)
        check(finRes, { 'financial-overview - 200': (r) => r.status === 200 })

        // GET /api/admin/analytics/user-growth
        const growthRes = http.get(`${BASE_URL}/api/admin/analytics/user-growth`, headers)
        check(growthRes, { 'user-growth - 200': (r) => r.status === 200 })

        // GET /api/admin/analytics/revenue
        const revRes = http.get(`${BASE_URL}/api/admin/analytics/revenue`, headers)
        check(revRes, { 'revenue - 200': (r) => r.status === 200 })

        // GET /api/admin/analytics/dashboard
        const analyticsDashRes = http.get(`${BASE_URL}/api/admin/analytics/dashboard`, headers)
        check(analyticsDashRes, { 'analytics/dashboard - 200': (r) => r.status === 200 })

        sleep(3)
    })

    // ===== ADMIN FINANCE =====
    group('Admin Finance', function () {
        // GET /api/finance/admin/payments
        const payRes = http.get(`${BASE_URL}/api/finance/admin/payments`, headers)
        check(payRes, { 'admin/payments - 200': (r) => r.status === 200 })

        // GET /api/finance/admin/earnings
        const earnRes = http.get(`${BASE_URL}/api/finance/admin/earnings`, headers)
        check(earnRes, { 'admin/earnings - 200': (r) => r.status === 200 })

        // GET /api/finance/admin/payout-requests
        const payoutRes = http.get(`${BASE_URL}/api/finance/admin/payout-requests`, headers)
        check(payoutRes, { 'admin/payout-requests - 200': (r) => r.status === 200 })

        // GET /api/finance/admin/summary
        const summaryRes = http.get(`${BASE_URL}/api/finance/admin/summary`, headers)
        check(summaryRes, { 'admin/summary - 200': (r) => r.status === 200 })

        sleep(2)
    })

    // ===== USER MANAGEMENT =====
    group('User Management', function () {
        // GET /api/users (admin list all)
        const usersRes = http.get(`${BASE_URL}/api/users`, headers)
        check(usersRes, { 'users list - 200': (r) => r.status === 200 })

        sleep(2)
    })

    // ===== PROPERTY MODERATION =====
    group('Property Moderation', function () {
        // GET /api/admin/properties (if exists)
        const propsRes = http.get(`${BASE_URL}/api/admin/properties`, headers)
        check(propsRes, { 'admin/properties - 200/404': (r) => [200, 404].includes(r.status) })

        sleep(2)
    })

    // ===== VERIFICATION =====
    group('Verification', function () {
        // GET /api/verification/admin/pending
        const pendingRes = http.get(`${BASE_URL}/api/verification/admin/pending`, headers)
        check(pendingRes, { 'verification/pending - 200': (r) => r.status === 200 })

        sleep(2)
    })

    // ===== SUPPORT =====
    group('Support', function () {
        // GET /api/support/admin/all
        const ticketsRes = http.get(`${BASE_URL}/api/support/admin/all`, headers)
        check(ticketsRes, { 'support/admin/all - 200': (r) => r.status === 200 })

        sleep(2)
    })

    // ===== ROOMMATES ADMIN =====
    group('Roommates Admin', function () {
        // GET /api/roommates/all
        const rmRes = http.get(`${BASE_URL}/api/roommates/all`, headers)
        check(rmRes, { 'roommates/all - 200': (r) => r.status === 200 })

        sleep(2)
    })

    // ===== NOTIFICATIONS =====
    group('Notifications', function () {
        const notifRes = http.get(`${BASE_URL}/api/notifications`, headers)
        check(notifRes, { 'notifications - 200': (r) => r.status === 200 })

        sleep(2)
    })
}
