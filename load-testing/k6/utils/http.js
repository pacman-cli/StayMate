/**
 * HTTP Utilities for k6 Load Tests
 * =================================
 */

import { check, sleep } from 'k6'
import http from 'k6/http'
import { BASE_URL } from '../config.js'

/**
 * Make authenticated GET request
 */
export function authGet(path, token, tags = {}) {
    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        tags: tags,
    }

    return http.get(`${BASE_URL}${path}`, params)
}

/**
 * Make authenticated POST request
 */
export function authPost(path, payload, token, tags = {}) {
    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        tags: tags,
    }

    return http.post(`${BASE_URL}${path}`, JSON.stringify(payload), params)
}

/**
 * Make authenticated PATCH request
 */
export function authPatch(path, payload, token, tags = {}) {
    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        tags: tags,
    }

    return http.patch(`${BASE_URL}${path}`, JSON.stringify(payload), params)
}

/**
 * Make authenticated DELETE request
 */
export function authDelete(path, token, tags = {}) {
    const params = {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        tags: tags,
    }

    return http.del(`${BASE_URL}${path}`, null, params)
}

/**
 * Standard response checks
 */
export function checkResponse(res, name, expectedStatus = 200) {
    return check(res, {
        [`${name} - status ${expectedStatus}`]: (r) => r.status === expectedStatus,
        [`${name} - response time < 500ms`]: (r) => r.timings.duration < 500,
    })
}

/**
 * Think time - simulates user reading/thinking
 */
export function thinkTime(min = 1, max = 3) {
    sleep(min + Math.random() * (max - min))
}
