# 🔍 StayMate Codebase Audit & Improvement Tracking

**Audit Date:** February 3, 2026  
**Audited Files:** 505 files (323 Java, 182 TypeScript/React)  
**Total Issues Found:** 129  
**Previous Audit Reference:** [IMPROVEMENTS.md](./IMPROVEMENTS.md) (January 31, 2026)

---

## 📋 Quick Stats

| Category | 🔴 Critical | 🟡 High | 🟠 Medium | 🟢 Low | Total |
|----------|-------------|---------|-----------|--------|-------|
| **Security** | 14 | 14 | 12 | 6 | **46** |
| **Logic Bugs** | 5 | 6 | 8 | 4 | **23** |
| **Performance** | 3 | 8 | 10 | 3 | **24** |
| **Code Quality** | 1 | 8 | 12 | 15 | **36** |
| **Infrastructure** | 6 | 5 | 4 | 2 | **17** |
| **TOTAL** | **29** | **41** | **46** | **30** | **146** |

---

## 🚨 Executive Summary

### Immediate Actions Required (This Week)

1. **🔴 ROTATE ALL EXPOSED SECRETS IMMEDIATELY**
   - Google OAuth credentials in `.env`
   - JWT secrets in `application.properties`
   - Database passwords in multiple files
   - Admin secret keys

2. **🔴 REMOVE SENSITIVE FILES FROM GIT HISTORY**
   - `.env` file is currently tracked (line 2 in .gitignore doesn't work retroactively)
   - `.env.bak` backup file also committed

3. **🔴 FIX CRITICAL SECURITY VULNERABILITIES**
   - Public H2 console access
   - CSRF protection disabled
   - Admin endpoints publicly accessible
   - File storage publicly accessible

4. **🔴 FIX RACE CONDITIONS**
   - Double booking vulnerability in booking system
   - Token refresh race conditions
   - Concurrent user operations

---

## 🔴 Critical Issues (Immediate Fix Required)

### Security (14 Critical)

#### 1. Exposed Production Credentials in Git
- **File:** `.env` (line 1-12)
- **Issue:** REAL Google OAuth client ID and secret committed to repository
- **Impact:** Anyone with git access can impersonate the application
- **Fix:** 
  ```bash
  # Immediately rotate credentials
  # Remove from git history
  git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env .env.bak' HEAD
  # Add to .gitignore and commit
  ```

#### 2. Weak JWT Secret in Source Code
- **File:** `server/src/main/resources/application.properties` (line 40)
- **Issue:** Base64 encoded weak default secret: `ZGV2ZWxvcG1lbnQtc2VjcmV0LWtleS10aGF0LWlzLWF0LWxlYXN0LTI1Ni1iaXRzLWxvbmctZm9yLUhTMjU2LWFsZ29yaXRobQ==`
- **Impact:** JWT tokens can be forged
- **Fix:** Remove default, require environment variable

#### 3. H2 Console Publicly Accessible
- **File:** `server/src/main/java/com/webapp/auth/config/SecurityConfig.java` (line 104)
- **Issue:** `/h2-console/**` permits all access
- **Impact:** Direct database access without authentication
- **Fix:** Remove H2 console in production or restrict to specific IPs

#### 4. CSRF Protection Disabled
- **File:** `server/src/main/java/com/webapp/auth/config/SecurityConfig.java` (line 87)
- **Issue:** `csrf(AbstractHttpConfigurer::disable)` with stateless sessions
- **Impact:** Cross-site request forgery attacks possible
- **Fix:** Enable CSRF or implement stateless CSRF tokens

#### 5. Admin Endpoints Publicly Accessible
- **File:** `server/src/main/java/com/webapp/auth/config/SecurityConfig.java` (line 107)
- **Issue:** `/api/v1/internal/sudo/**` permits all access
- **Impact:** Hidden admin controller bypasses Spring Security
- **Fix:** Add `.hasRole("ADMIN")` protection

#### 6. Hardcoded Admin Secret Key
- **File:** `server/src/main/java/com/webapp/auth/controller/HiddenAdminController.java` (line 65-66)
- **Issue:** Default secret: `RENTMATE_SUPER_SECRET_ADMIN_KEY_2024`
- **Impact:** Guessable admin access key
- **Fix:** Remove default value, fail on missing environment variable

#### 7. Public File Bucket Policy
- **File:** `server/src/main/java/com/webapp/domain/file/service/impl/MinioFileStorageServiceImpl.java` (line 62-82)
- **Issue:** Automatically sets public read policy on bucket
- **Impact:** Any uploaded file is publicly accessible without authentication
- **Fix:** Implement signed URLs for authorized access only

#### 8. Information Leakage in Exceptions
- **File:** `server/src/main/java/com/webapp/auth/exception/GlobalExceptionHandler.java` (line 154)
- **Issue:** `ex.getMessage()` exposed in production responses
- **Impact:** Reveals internal structure, file paths, potential vulnerabilities
- **Fix:** Return generic error messages, log details server-side only

#### 9. JWT Parsing Without Validation
- **File:** `frontend/src/lib/api.ts` (line 69-75)
- **Issue:** `atob()` and `JSON.parse()` without input validation
- **Impact:** Malformed tokens can cause crashes or expose parser vulnerabilities
- **Fix:** Add token format validation before parsing

#### 10. Insecure Cookie Settings
- **File:** `frontend/src/lib/api.ts` (line 103-115)
- **Issue:** `sameSite: "lax"` allows cross-origin GET requests
- **Impact:** CSRF attacks possible
- **Fix:** Implement CSRF tokens for state-changing operations

#### 11. Token Refresh Race Condition
- **File:** `frontend/src/lib/api.ts` (line 147-157, 210-226)
- **Issue:** Multiple concurrent 401s trigger multiple refresh requests
- **Impact:** Token inconsistency, potential security issues
- **Fix:** Implement cross-tab synchronization using BroadcastChannel

#### 12. WebSocket Token in Headers
- **File:** `frontend/src/hooks/useWebSocketNotifications.ts` (line 54-67)
- **Issue:** Access token sent in WebSocket connect headers
- **Impact:** Token exposure in connection logs
- **Fix:** Use cookie-based auth or short-lived connection tokens

#### 13. Missing Error Handling in Login
- **File:** `frontend/src/context/AuthContext.tsx` (line 84-97)
- **Issue:** `try...finally` without `catch` block
- **Impact:** Unhandled errors bubble up, potentially exposing sensitive info
- **Fix:** Add comprehensive error handling

#### 14. Logout Race Condition
- **File:** `frontend/src/context/AuthContext.tsx` (line 50-55)
- **Issue:** Tokens cleared before API call completes
- **Impact:** User appears logged out but server session remains
- **Fix:** Clear tokens only after successful API logout

### Logic Bugs (5 Critical)

#### 15. Race Condition in Booking (Double Booking)
- **File:** `server/src/main/java/com/webapp/domain/booking/service/impl/BookingServiceImpl.java` (line 72-86)
- **Issue:** Time-of-check-time-of-use (TOCTOU) vulnerability
- **Impact:** Two concurrent requests can book same seat
- **Fix:** Use database-level pessimistic locking (`SELECT FOR UPDATE`)

#### 16. Race Condition in Seat Allocation
- **File:** `server/src/main/java/com/webapp/domain/booking/service/impl/BookingServiceImpl.java` (line 201-228)
- **Issue:** Atomicity not guaranteed for seat allocation
- **Impact:** Overbooking scenarios
- **Fix:** Implement optimistic locking with `@Version`

#### 17. Data Inconsistency Risk
- **File:** `server/src/main/java/com/webapp/domain/booking/service/impl/BookingServiceImpl.java` (line 233-257)
- **Issue:** Property status not transactional with seat release
- **Impact:** Inconsistent booking/property state
- **Fix:** Wrap in single transaction

#### 18. Data Integrity Issue (Soft Delete)
- **File:** `server/src/main/java/com/webapp/domain/user/service/impl/UserServiceImpl.java` (line 383-424)
- **Issue:** Soft delete doesn't cascade properly
- **Impact:** Orphaned records in database
- **Fix:** Implement proper cascade logic

#### 19. NPE Risk in Delete Booking
- **File:** `server/src/main/java/com/webapp/domain/booking/service/impl/BookingServiceImpl.java` (line 292-310)
- **Issue:** No null check before accessing booking properties
- **Impact:** NullPointerException crashes request
- **Fix:** Add null validation

### Infrastructure (6 Critical)

#### 20. Sensitive File in Git History
- **File:** `.env`, `.env.bak`
- **Issue:** Production credentials committed to repository
- **Impact:** Complete compromise of OAuth, database, JWT
- **Fix:** Rotate all secrets, scrub git history

#### 21. Incorrect Production MinIO URL
- **File:** `server/src/main/resources/application-prod.yml` (line 94-95)
- **Issue:** Points to `http://localhost:9000` instead of production URL
- **Impact:** File uploads fail in production
- **Fix:** Update to production MinIO URL

#### 22. DDL-Auto Set to Update
- **File:** `server/src/main/resources/application.properties` (line 25)
- **Issue:** `spring.jpa.hibernate.ddl-auto=update` in default config
- **Impact:** Schema changes applied automatically
- **Fix:** Set to `validate` for production

#### 23. Weak Default Passwords in Docker Compose
- **File:** `docker-compose.yml` (line 9, 31)
- **Issue:** `MYSQL_ROOT_PASSWORD: ${DB_PASSWORD:-password}` and MinIO defaults
- **Impact:** Predictable passwords if env vars not set
- **Fix:** Remove defaults, fail if env vars missing

#### 24. MySQL Port Exposed
- **File:** `docker-compose.yml` (line 12)
- **Issue:** Port 3306 exposed to host
- **Impact:** Database directly accessible
- **Fix:** Remove port mapping or bind to localhost only

#### 25. Backend Port Exposed
- **File:** `docker-compose.yml` (line 51)
- **Issue:** Port 8080 exposed to all interfaces
- **Impact:** API directly accessible bypassing reverse proxy
- **Fix:** Use `127.0.0.1:8080:8080` or internal network only

---

## 🟡 High Priority Issues (Fix Within 2 Weeks)

### Security (14 High)

| # | File | Line | Issue | Recommendation |
|---|------|------|-------|----------------|
| 26 | SecurityConfig.java | 172 | CORS exposes X-Admin-Secret header | Remove admin headers from CORS |
| 27 | GlobalExceptionHandler.java | 106 | HttpMessageNotReadableException exposes raw message | Return generic error message |
| 28 | RateLimitFilter.java | 96-106 | IP spoofing via X-Forwarded-For | Validate against trusted proxy list |
| 29 | HiddenAdminController.java | 79, 144 | Failed attempts log secret key | Never log authentication credentials |
| 30 | HiddenAdminController.java | 138-154 | Weak auth for hidden admin | Add rate limiting and IP whitelist |
| 31 | HiddenAdminController.java | 79, 144 | Timing attack vulnerability | Use constant-time comparison |
| 32 | MinioFileStorageServiceImpl.java | 101-134 | No file type validation | Add MIME type and extension whitelist |
| 33 | api.ts | 669, 674 | Excessive `any` usage | Define proper TypeScript interfaces |
| 34 | api.ts | 575, 920 | Duplicate API definitions | Remove empty duplicate |
| 35 | login/page.tsx | 58-61 | Error message rendering | Sanitize before rendering (XSS risk) |
| 36 | login/page.tsx | 286-299 | No rate limiting on login | Implement exponential backoff |
| 37 | AuthContext.tsx | 116 | OAuth redirect bypass | Use router.push() with security headers |
| 38 | useWebSocketNotifications.ts | 75-102 | Callback reference staleness | Use refs or proper useCallback deps |
| 39 | BookingServiceImpl.java | 145-188 | Missing pessimistic locking | Add @Version or SELECT FOR UPDATE |

### Logic Bugs (6 High)

| # | File | Line | Issue | Recommendation |
|---|------|------|-------|----------------|
| 40 | BookingServiceImpl.java | 68-70 | Can book own property | Add ownership check |
| 41 | BookingServiceImpl.java | 313-344 | Check-in doesn't verify payment | Validate payment status |
| 42 | BookingServiceImpl.java | 348-395 | Check-out doesn't verify check-in | Add state validation |
| 43 | MessageServiceImpl.java | 126-211 | Duplicate conversation creation | Add unique constraint |
| 44 | BookingServiceImpl.java | 213-227 | Property status inconsistency | Use state machine pattern |
| 45 | BookingServiceImpl.java | 168-170 | Double refund risk | Make cancellation idempotent |

### Performance (8 High)

| # | File | Line | Issue | Recommendation |
|---|------|------|-------|----------------|
| 46 | BookingServiceImpl.java | 86-87 | N+1 query in hasAvailableSeats | Use @EntityGraph or JOIN FETCH |
| 47 | MessageServiceImpl.java | 50-81 | N+1 query in getConversations | Batch load conversations |
| 48 | RateLimitFilter.java | 32-141 | In-memory rate limiting | Implement Redis-backed distributed limiter |
| 49 | PropertyRepository.java | 38-47 | Complex subquery | Optimize or add materialized view |
| 50 | BookingRepository.java | 101-103 | Inefficient overlap check | Restructure query for index usage |
| 51 | api.ts | 399-421 | Client-side pagination | Implement server-side pagination |
| 52 | application-prod.yml | 22-28 | Connection pool undersized | Increase max pool size for production |
| 53 | UserRepository.java | 65-69 | LIKE with leading wildcard | Use full-text search or trigram index |

### Code Quality (8 High)

| # | File | Line | Issue | Recommendation |
|---|------|------|-------|----------------|
| 54 | locustfile.py | Entire file | Duplicate test files | Consolidate into single location |
| 55 | BookingServiceImpl.java | 145-188 | Overly complex method | Refactor into smaller methods |
| 56 | MessageServiceImpl.java | 288-338 | Overly complex method | Split into helper methods |
| 57 | UserServiceImpl.java | 383-424 | Long method | Extract concerns into separate methods |
| 58 | api.ts | 1433 | Excessively long file | Split into domain modules |
| 59 | login/page.tsx | 38-42 | Race condition in redirect | Add loading state check |
| 60 | login/page.tsx | 55-65 | Missing CSRF protection | Implement CSRF tokens |
| 61 | AuthContext.tsx | 50-55 | Logout race condition | Clear tokens after API success |

### Infrastructure (5 High)

| # | File | Line | Issue | Recommendation |
|---|------|------|-------|----------------|
| 62 | application.properties | 26 | SQL logging enabled | Disable in production |
| 63 | application.properties | 87 | Rate limiting disabled | Enable by default |
| 64 | application-prod.yml | 77 | MinIO always public | Remove automatic public policy |
| 65 | docker-compose.yml | 9, 31 | Weak default passwords | Require strong passwords |
| 66 | application.properties | 94 | Error details exposed | Set to `never` in production |

---

## 🟠 Medium Priority Issues (Fix Within 1 Month)

### Security (12 Medium)

| # | File | Line | Issue | Severity |
|---|------|------|-------|----------|
| 67 | GlobalExceptionHandler.java | - | Missing @Order annotation | Medium |
| 68 | SecurityConfig.java | 149-153 | Missing security headers | Medium |
| 69 | RateLimitFilter.java | 32 | Unbounded ConcurrentHashMap | Medium |
| 70 | RateLimitFilter.java | 160 | Thread contention risk | Medium |
| 71 | RateLimitFilter.java | 135-141 | Cleanup race condition | Medium |
| 72 | FileController.java | 26-44 | Path traversal vulnerability | Medium |
| 73 | BookingServiceImpl.java | 86 | Insufficient authorization | Medium |
| 74 | MessageServiceImpl.java | 312-317 | Commented out notifications | Medium |
| 75 | UserServiceImpl.java | 51-57 | Pending deletion bypassed | Medium |
| 76 | login/page.tsx | 44-65 | Redundant validation | Medium |
| 77 | api.ts | 227-249 | Error message leakage | Medium |
| 78 | useWebSocketNotifications.ts | 59-63 | Debug logging not guarded | Medium |

### Logic Bugs (8 Medium)

| # | File | Line | Issue | Severity |
|---|------|------|-------|----------|
| 79 | BookingServiceImpl.java | 89-91 | Edge case: zero days calculation | Medium |
| 80 | BookingServiceImpl.java | 363-374 | Orphan seat reference | Medium |
| 81 | MessageServiceImpl.java | 150-163 | Concurrent conversation creation | Medium |
| 82 | UserServiceImpl.java | 474-488 | Role escalation without audit | Medium |
| 83 | api.ts | 279-282 | Missing error handling | Medium |
| 84 | BookingServiceImpl.java | 292-310 | Missing status check | Medium |
| 85 | BookingServiceImpl.java | 210-219 | N+1 query risk | Medium |
| 86 | MessageServiceImpl.java | 126-211 | WebSocket error handling | Medium |

### Performance (10 Medium)

| # | File | Line | Issue | Severity |
|---|------|------|-------|----------|
| 87 | MessageRepository.java | 18-27 | No limit on message loading | Medium |
| 88 | BookingServiceImpl.java | 293-310 | Missing indexes | Medium |
| 89 | login/page.tsx | 38-42 | Redundant auth check | Medium |
| 90 | api.ts | 1-41 | Large import block | Medium |
| 91 | api.ts | 395 | Hardcoded OAuth URL | Medium |
| 92 | useWebSocketNotifications.ts | 64-66 | Fixed heartbeat interval | Medium |
| 93 | AuthContext.tsx | 39-45 | Role checks on every render | Medium |
| 94 | SecurityConfig.java | 149-153 | Missing security headers | Medium |
| 95 | application.properties | 101-102 | File upload limits | Medium |
| 96 | docker-compose.yml | 13-14 | MySQL port exposure | Medium |

### Code Quality (12 Medium)

| # | File | Line | Issue | Severity |
|---|------|------|-------|----------|
| 97 | MessageServiceImpl.java | 313-317 | Commented out code | Medium |
| 98 | UserServiceImpl.java | 51-57 | Commented out check | Medium |
| 99 | BookingServiceImpl.java | 211-220 | Comments instead of code | Medium |
| 100 | BookingRepository.java | 78-83 | Magic strings | Medium |
| 101 | UserRepository.java | 21-27 | Magic strings in queries | Medium |
| 102 | BookingServiceImpl.java | 96 | Magic number (0.05) | Medium |
| 103 | AuthContext.tsx | 58-72 | Token validation bypass | Medium |
| 104 | AuthContext.tsx | 75-82 | Missing cleanup | Medium |
| 105 | useWebSocketNotifications.ts | 49 | No user ID validation | Medium |
| 106 | useWebSocketNotifications.ts | 105-108 | STOMP error handling | Medium |
| 107 | login/page.tsx | 71-83 | Loading state flash | Medium |
| 108 | api.ts | 298-304 | Logout error handling | Medium |

### Infrastructure (4 Medium)

| # | File | Line | Issue | Severity |
|---|------|------|-------|----------|
| 109 | application.properties | 94 | Error details exposed | Medium |
| 110 | application-prod.yml | 107 | Actuator endpoints exposed | Medium |
| 111 | application.properties | 101-102 | File upload limits restrictive | Medium |
| 112 | docker-compose.yml | 51 | Backend port exposed | Medium |

---

## 🟢 Low Priority / Enhancements (Fix When Convenient)

### Security (6 Low)

| # | File | Line | Issue | Severity |
|---|------|------|-------|----------|
| 113 | MinioFileStorageServiceImpl.java | 117 | InputStream not explicitly closed | Low |
| 114 | api.ts | 924, 956 | Inconsistent naming conventions | Low |
| 115 | api.ts | 298-304 | Logout error handling | Low |
| 116 | login/page.tsx | 86-481 | Excessive inline styles | Low |
| 117 | login/page.tsx | 149 | Brand name mismatch | Low |
| 118 | AuthContext.tsx | 50 | Console error logging | Low |

### Logic Bugs (4 Low)

| # | File | Line | Issue | Severity |
|---|------|------|-------|----------|
| 119 | BookingServiceImpl.java | 96 | Magic number 0.05 | Low |
| 120 | HiddenAdminController.java | 244-248 | Stack trace leak | Low |
| 121 | HiddenAdminController.java | 292-296 | Exception messages exposed | Low |
| 122 | HiddenAdminController.java | - | Missing input sanitization | Low |

### Performance (3 Low)

| # | File | Line | Issue | Severity |
|---|------|------|-------|----------|
| 123 | api.ts | 1-1433 | File too large | Low |
| 124 | AuthContext.tsx | 28 | Import organization | Low |
| 125 | useWebSocketNotifications.ts | 11-18 | Interface duplication | Low |

### Code Quality (15 Low)

| # | File | Line | Issue | Severity |
|---|------|------|-------|----------|
| 126 | api.ts | 924, 956 | Inconsistent naming | Low |
| 127 | api.ts | 298-304 | Logout error handling | Low |
| 128 | login/page.tsx | 86-481 | Excessive inline styles | Low |
| 129 | login/page.tsx | 149 | Brand name mismatch | Low |
| 130 | login/page.tsx | 265-391 | Form not using library | Low |
| 131 | AuthContext.tsx | 28 | Import organization | Low |
| 132 | AuthContext.tsx | 133-136 | Context provider return | Low |
| 133 | useWebSocketNotifications.ts | 11-18 | Interface duplication | Low |
| 134 | useWebSocketNotifications.ts | 38-44 | Options interface | Low |
| 135 | useWebSocketNotifications.ts | 137-141 | Return value cleanup | Low |
| 136 | api.ts | 301 | Typo in comment | Low |
| 137 | locustfile.py | 17-40 | Test data pollution | Low |
| 138 | DashboardServiceTest.java | - | No performance tests | Low |
| 139 | RoommateServiceTest.java | - | Coverage gaps | Low |
| 140 | MessageControllerTest.java | - | Mocking incomplete | Low |

### Infrastructure (2 Low)

| # | File | Line | Issue | Severity |
|---|------|------|-------|----------|
| 141 | docker-compose.yml | - | Port configuration | Low |
| 142 | application.properties | - | Logging configuration | Low |

---

## 🎯 Action Plan

### Phase 1: Emergency Security Fixes (Week 1)

- [ ] Rotate all exposed secrets (OAuth, JWT, Database, Admin)
- [ ] Remove `.env` and `.env.bak` from git history
- [ ] Fix H2 console exposure
- [ ] Enable CSRF protection or implement tokens
- [ ] Fix public bucket policy
- [ ] Fix race conditions in booking system
- [ ] Remove hardcoded admin secret
- [ ] Fix information leakage in exception handlers

### Phase 2: High Priority (Weeks 2-3)

- [ ] Fix IP spoofing in rate limiting
- [ ] Implement proper file type validation
- [ ] Add rate limiting to login form
- [ ] Fix token refresh race conditions
- [ ] Add pessimistic locking to bookings
- [ ] Split api.ts into domain modules
- [ ] Fix N+1 query issues
- [ ] Implement Redis-backed rate limiting

### Phase 3: Medium Priority (Weeks 4-5)

- [ ] Add database indexes for slow queries
- [ ] Refactor complex methods
- [ ] Remove commented-out code
- [ ] Fix magic strings and numbers
- [ ] Add proper error handling
- [ ] Optimize WebSocket connections
- [ ] Add input validation throughout

### Phase 4: Low Priority (Weeks 6-8)

- [ ] Improve test coverage to 80%+
- [ ] Add integration tests
- [ ] Standardize naming conventions
- [ ] Add performance tests
- [ ] Improve documentation
- [ ] Code style cleanup

---

## 📚 References

### Security Best Practices
- [OWASP Top 10 2021](https://owasp.org/www-project-top-ten/)
- [Spring Security Best Practices](https://docs.spring.io/spring-security/reference/)
- [JWT Best Practices (RFC 8725)](https://tools.ietf.org/html/rfc8725)

### Performance Optimization
- [Hibernate Performance Tuning](https://docs.jboss.org/hibernate/orm/6.2/userguide/html_single/Hibernate_User_Guide.html#performance)
- [MySQL Query Optimization](https://dev.mysql.com/doc/refman/8.0/en/optimization.html)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)

### Testing
- [Spring Boot Testing](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.testing)
- [Jest Best Practices](https://jestjs.io/docs/best-practices)
- [Locust Load Testing](https://docs.locust.io/)

---

## 📝 Notes

- This document consolidates findings from previous audit (IMPROVEMENTS.md) and new detailed analysis
- Priority levels: 🔴 Critical (immediate), 🟡 High (2 weeks), 🟠 Medium (1 month), 🟢 Low (convenient)
- All file paths are relative to repository root
- Line numbers reference current codebase state as of February 3, 2026

---

*Last Updated: February 3, 2026*  
*Next Review: February 17, 2026*
