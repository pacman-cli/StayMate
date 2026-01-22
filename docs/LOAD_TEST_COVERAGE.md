# StayMate Load Test Coverage Report

> **Date:** 2026-01-18
> **Tool:** Locust
> **File:** `staymate-load-test/locustfile.py`

---

## Executive Summary

| Metric | Value |
|--------|-------|
| **User Classes** | 3 (Tenant, Landlord, Admin) |
| **Total Tasks** | 50+ |
| **Endpoints Covered** | 45+ |
| **Response Validation** | ✅ Enabled |
| **Realistic Flows** | ✅ State-dependent |

---

## User Class Distribution

| Class | Role | Weight | Wait Time | Tasks |
|-------|------|--------|-----------|-------|
| `TenantUser` | USER | 7 | 2-6s | 18 |
| `LandlordUser` | HOUSE_OWNER | 3 | 4-10s | 12 |
| `AdminUser` | ADMIN | 1 | 5-15s | 12 |

---

## Load Test Coverage Matrix

### Authentication Module
| # | Endpoint | Method | Role | Tested | Validated | Notes |
|---|----------|--------|------|--------|-----------|-------|
| 1 | `/api/auth/register` | POST | All | ✅ | ✅ Keys + Time | Dynamic emails |
| 2 | `/api/auth/login` | POST | Admin | ✅ | ✅ Time | Token reuse |
| 3 | `/api/auth/refresh-token` | POST | All | ✅ | - | Token refresh |

---

### Property Module
| # | Endpoint | Method | Role | Tested | Validated | Notes |
|---|----------|--------|------|--------|-----------|-------|
| 4 | `/api/properties/search` | GET | Tenant | ✅ | ✅ Time | With filters |
| 5 | `/api/properties/{id}` | GET | Tenant | ✅ | ✅ Keys | Detail view |
| 6 | `/api/properties` | POST | Landlord | ✅ | ✅ | Multipart |
| 7 | `/api/properties/my-properties` | GET | Landlord | ✅ | - | State capture |

---

### Booking Module
| # | Endpoint | Method | Role | Tested | Validated | Notes |
|---|----------|--------|------|--------|-----------|-------|
| 8 | `/api/bookings` | POST | Tenant | ✅ | ✅ Time | State-dependent |
| 9 | `/api/bookings/my-bookings` | GET | Tenant | ✅ | ✅ Time | History |
| 10 | `/api/bookings/requests` | GET | Landlord | ✅ | - | Pending check |
| 11 | `/api/bookings/{id}/status` | PATCH | Landlord | ✅ | - | Approval flow |

---

### Roommate Module
| # | Endpoint | Method | Role | Tested | Validated | Notes |
|---|----------|--------|------|--------|-----------|-------|
| 12 | `/api/roommates` | GET | Tenant | ✅ | ✅ Time | Browse |
| 13 | `/api/roommates` | POST | Tenant | ✅ | - | Create post |
| 14 | `/api/matches` | GET | Tenant | ✅ | - | User matches |

---

### Application Module *(NEW)*
| # | Endpoint | Method | Role | Tested | Validated | Notes |
|---|----------|--------|------|--------|-----------|-------|
| 15 | `/api/applications` | POST | Tenant | ✅ | - | Submit |
| 16 | `/api/applications/sent` | GET | Tenant | ✅ | - | User sent |
| 17 | `/api/applications/received` | GET | Landlord | ✅ | - | Owner received |

---

### Finance Module *(NEW)*
| # | Endpoint | Method | Role | Tested | Validated | Notes |
|---|----------|--------|------|--------|-----------|-------|
| 18 | `/api/finance/my-payments` | GET | Tenant | ✅ | ✅ Time | User payments |
| 19 | `/api/finance/my-spending-summary` | GET | Tenant | ✅ | - | Spending |
| 20 | `/api/finance/earnings` | GET | Landlord | ✅ | ✅ Time | Owner earnings |
| 21 | `/api/finance/history` | GET | Landlord | ✅ | - | Earnings history |
| 22 | `/api/finance/payout-methods` | GET | Landlord | ✅ | - | Bank accounts |
| 23 | `/api/finance/admin/payments` | GET | Admin | ✅ | - | All payments |
| 24 | `/api/finance/admin/payout-requests` | GET | Admin | ✅ | - | Payout queue |

---

### Messaging Module
| # | Endpoint | Method | Role | Tested | Validated | Notes |
|---|----------|--------|------|--------|-----------|-------|
| 25 | `/api/messages/conversations` | GET | All | ✅ | ✅ Time | Polling |
| 26 | `/api/messages/send` | POST | Tenant | ✅ | - | After booking |

---

### Notification Module
| # | Endpoint | Method | Role | Tested | Validated | Notes |
|---|----------|--------|------|--------|-----------|-------|
| 27 | `/api/notifications` | GET | All | ✅ | ✅ Time | High frequency |

---

### Review Module
| # | Endpoint | Method | Role | Tested | Validated | Notes |
|---|----------|--------|------|--------|-----------|-------|
| 28 | `/api/reviews/property/{id}` | GET | Tenant | ✅ | - | Property reviews |
| 29 | `/api/reviews/user/{id}` | GET | Landlord | ✅ | - | User reviews |

---

### Saved Items Module
| # | Endpoint | Method | Role | Tested | Validated | Notes |
|---|----------|--------|------|--------|-----------|-------|
| 30 | `/api/saved/properties/{id}` | POST | Tenant | ✅ | - | 20% chance |

---

### Support Module *(NEW)*
| # | Endpoint | Method | Role | Tested | Validated | Notes |
|---|----------|--------|------|--------|-----------|-------|
| 31 | `/api/support/my-tickets` | GET | Tenant | ✅ | - | User tickets |
| 32 | `/api/support/admin/all` | GET | Admin | ✅ | - | All tickets |

---

### Maintenance Module *(NEW)*
| # | Endpoint | Method | Role | Tested | Validated | Notes |
|---|----------|--------|------|--------|-----------|-------|
| 33 | `/api/maintenance/my-requests` | GET | Tenant | ✅ | - | User requests |
| 34 | `/api/maintenance/property-requests` | GET | Landlord | ✅ | - | Owner view |

---

### Verification Module
| # | Endpoint | Method | Role | Tested | Validated | Notes |
|---|----------|--------|------|--------|-----------|-------|
| 35 | `/api/verification/upload` | POST | Tenant | ✅ | - | 10% of users |
| 36 | `/api/verification/admin/pending` | GET | Admin | ✅ | - | Pending list |
| 37 | `/api/verification/admin/{id}/approve` | POST | Admin | ✅ | - | Approval |

---

### Admin Module
| # | Endpoint | Method | Role | Tested | Validated | Notes |
|---|----------|--------|------|--------|-----------|-------|
| 38 | `/api/admin/dashboard` | GET | Admin | ✅ | ✅ Time | Main stats |
| 39 | `/api/admin/analytics/dashboard` | GET | Admin | ✅ | - | Analytics |
| 40 | `/api/admin/properties` | GET | Admin | ✅ | - | Property list |
| 41 | `/api/admin/properties/{id}/approve` | PUT | Admin | ✅ | - | Moderation |
| 42 | `/api/admin/reports` | GET | Admin | ✅ | - | User reports |
| 43 | `/api/admin/audit` | GET | Admin | ✅ | - | Audit logs |
| 44 | `/api/users` | GET | Admin | ✅ | - | User list |

---

### Landlord Dashboard *(NEW)*
| # | Endpoint | Method | Role | Tested | Validated | Notes |
|---|----------|--------|------|--------|-----------|-------|
| 45 | `/api/landlord/dashboard/overview` | GET | Landlord | ✅ | - | Overview stats |

---

### AI Module
| # | Endpoint | Method | Role | Tested | Validated | Notes |
|---|----------|--------|------|--------|-----------|-------|
| 46 | `/api/ai/match` | POST | Tenant | ✅ | ✅ 5s threshold | 5% frequency |

---

## Coverage Summary

| Status | Count | Percentage |
|--------|-------|------------|
| ✅ Tested | 46 | 100% |
| ✅ With Validation | 15 | 33% |
| ⚠️ Partial | 0 | 0% |
| ❌ Not Tested | 0 | 0% |

---

## Response Thresholds

| Category | Threshold | Monitored |
|----------|-----------|-----------|
| Fast | 200ms | Auth, Notifications |
| Normal | 500ms | Most APIs |
| Slow | 1000ms | Logged as warning |
| AI Heavy | 5000ms | AI matching |

---

## Improvements Made

1. **Added Finance Module** - 7 new endpoints for payments, earnings, payouts
2. **Added Application Flow** - Complete submit/sent/received cycle
3. **Added Support & Maintenance** - Ticket systems covered
4. **Added Landlord Dashboard** - Overview endpoint
5. **Added Admin Analytics** - Full dashboard data
6. **Added Audit Logs** - Admin audit trail
7. **Response Validation** - JSON keys and response times
8. **Realistic Flows** - State-dependent actions
9. **Slow Request Logging** - Performance warnings
10. **Improved Wait Times** - More realistic patterns

---

## Running the Tests

```bash
# Install Locust
pip install locust

# Run with web UI
locust -f staymate-load-test/locustfile.py --host=http://localhost:8080

# Run headless
locust -f staymate-load-test/locustfile.py --host=http://localhost:8080 \
  --users 100 --spawn-rate 10 --run-time 5m --headless
```

---

*Load Test Suite Enhanced - StayMate v1.0*
