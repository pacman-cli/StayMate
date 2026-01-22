/**
 * StayMate k6 Load Test Configuration
 * ====================================
 */

// Base URL - can be overridden via environment variable
export const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080'

// Test user credentials
export const ADMIN_EMAIL = __ENV.ADMIN_EMAIL || 'mpuspo2310304@bscse.uiu.ac.bd'
export const ADMIN_PASSWORD = __ENV.ADMIN_PASSWORD || 'password'
export const TEST_PASSWORD = 'TestPassword123+'

// VU distribution (can be overridden via env vars)
export const TENANT_VUS = parseInt(__ENV.TENANT_VUS) || 30
export const LANDLORD_VUS = parseInt(__ENV.LANDLORD_VUS) || 15
export const ADMIN_VUS = parseInt(__ENV.ADMIN_VUS) || 5

// Test duration settings
export const RAMP_UP_TIME = __ENV.RAMP_UP_TIME || '30s'
export const STEADY_STATE_TIME = __ENV.STEADY_STATE_TIME || '5m'
export const RAMP_DOWN_TIME = __ENV.RAMP_DOWN_TIME || '30s'

// SLA Thresholds
export const thresholds = {
    // Global thresholds
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],  // Error rate < 1%

    // Per-endpoint thresholds (using tags)
    'http_req_duration{endpoint:login}': ['p(95)<300'],
    'http_req_duration{endpoint:search}': ['p(95)<500'],
    'http_req_duration{endpoint:dashboard}': ['p(95)<400'],

    // Checks threshold
    checks: ['rate>0.95'],  // 95% of checks must pass
}

// Scenario configurations
export const scenarios = {
    tenant_flow: {
        executor: 'ramping-vus',
        startVUs: 0,
        stages: [
            { duration: RAMP_UP_TIME, target: TENANT_VUS },
            { duration: STEADY_STATE_TIME, target: TENANT_VUS },
            { duration: RAMP_DOWN_TIME, target: 0 },
        ],
        exec: 'tenantScenario',
        tags: { role: 'tenant' },
    },
    landlord_flow: {
        executor: 'ramping-vus',
        startVUs: 0,
        stages: [
            { duration: RAMP_UP_TIME, target: LANDLORD_VUS },
            { duration: STEADY_STATE_TIME, target: LANDLORD_VUS },
            { duration: RAMP_DOWN_TIME, target: 0 },
        ],
        exec: 'landlordScenario',
        tags: { role: 'landlord' },
    },
    admin_flow: {
        executor: 'ramping-vus',
        startVUs: 0,
        stages: [
            { duration: RAMP_UP_TIME, target: ADMIN_VUS },
            { duration: STEADY_STATE_TIME, target: ADMIN_VUS },
            { duration: RAMP_DOWN_TIME, target: 0 },
        ],
        exec: 'adminScenario',
        tags: { role: 'admin' },
    },
}
