/**
 * StayMate k6 Load Test Suite
 * ============================
 * Main entry point for k6 load tests
 *
 * Run with:
 *   k6 run main.js
 *   k6 run --vus 10 --duration 30s main.js
 *   BASE_URL=http://localhost:8080 k6 run main.js
 *
 * With Prometheus output:
 *   k6 run --out experimental-prometheus-rw main.js
 */

import { scenarios, thresholds } from './config.js'
import adminScenario from './scenarios/admin.js'
import landlordScenario from './scenarios/landlord.js'
import tenantScenario from './scenarios/tenant.js'

// Export options
export const options = {
    scenarios: scenarios,
    thresholds: thresholds,

    // Prometheus remote write (for Grafana integration)
    // Uncomment if using k6 with Prometheus
    // ext: {
    //   loadimpact: {
    //     projectID: 'your-project-id',
    //     name: 'StayMate Load Test'
    //   },
    //   'prometheus-rw': {
    //     url: 'http://localhost:9090/api/v1/write',
    //   }
    // },
}

// Export scenario functions
export { adminScenario, landlordScenario, tenantScenario }

// Default function (runs if no scenario specified)
export default function () {
    // Run all scenarios in sequence for simple testing
    tenantScenario()
}

// Setup function - runs once before the test
export function setup() {
    console.log('========================================')
    console.log('StayMate Load Test Suite - Starting')
    console.log('========================================')
    console.log(`Tenant VUs: ${options.scenarios.tenant_flow.stages[1].target}`)
    console.log(`Landlord VUs: ${options.scenarios.landlord_flow.stages[1].target}`)
    console.log(`Admin VUs: ${options.scenarios.admin_flow.stages[1].target}`)
    console.log('========================================')

    return {}
}

// Teardown function - runs once after the test
export function teardown(data) {
    console.log('========================================')
    console.log('StayMate Load Test Suite - Complete')
    console.log('========================================')
}

// Handle summary output
export function handleSummary(data) {
    return {
        'stdout': textSummary(data, { indent: ' ', enableColors: true }),
        'summary.json': JSON.stringify(data, null, 2),
    }
}

// Text summary helper
function textSummary(data, options) {
    const lines = []
    lines.push('\n=== StayMate Load Test Results ===\n')

    // Metrics summary
    if (data.metrics) {
        const httpDuration = data.metrics.http_req_duration
        if (httpDuration) {
            lines.push(`HTTP Duration (p95): ${httpDuration.values['p(95)'].toFixed(2)}ms`)
            lines.push(`HTTP Duration (p99): ${httpDuration.values['p(99)'].toFixed(2)}ms`)
        }

        const httpFailed = data.metrics.http_req_failed
        if (httpFailed) {
            lines.push(`Error Rate: ${(httpFailed.values.rate * 100).toFixed(2)}%`)
        }

        const checks = data.metrics.checks
        if (checks) {
            lines.push(`Check Pass Rate: ${(checks.values.rate * 100).toFixed(2)}%`)
        }
    }

    lines.push('\n')
    return lines.join('\n')
}
