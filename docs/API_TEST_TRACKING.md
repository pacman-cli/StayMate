# StayMate API Test Tracking - Complete Master Table

> **Last Updated:** 2026-01-18
> **Total Controllers:** 28 | **Total Endpoints:** ~120+

---

## Status Legend
| Symbol | Meaning |
|--------|---------|
| ✅ | Passed - Works as expected |
| ⚠️ | Partial - Has edge-case issues |
| ❌ | Failed - Needs fix |

---

## 1. Auth Module (`/api/auth`)
| # | Endpoint | Method | Role | Purpose | Status |
|---|----------|--------|------|---------|--------|
| 1 | `/register` | POST | Public | User signup | ✅ |
| 2 | `/login` | POST | Public | User login | ✅ |
| 3 | `/refresh-token` | POST | Public | Refresh JWT | ✅ |
| 4 | `/me` | GET | Auth | Current user | ✅ |
| 5 | `/select-role` | POST | Auth | Role selection | ✅ |
| 6 | `/check-email` | GET | Public | Email availability | ✅ |
| 7 | `/logout` | POST | Auth | Logout | ✅ |
| 8 | `/validate` | GET | Auth | Validate token | ✅ |

---

## 2. User Module (`/api/users`)
| # | Endpoint | Method | Role | Purpose | Status |
|---|----------|--------|------|---------|--------|
| 9 | `/profile` | GET | Auth | Get profile | ✅ |
| 10 | `/profile` | PUT | Auth | Update profile | ✅ |
| 11 | `/profile/picture` | POST | Auth | Upload picture | ✅ |
| 12 | `/{id}` | GET | Auth | Get user by ID | ✅ |
| 13 | `/account` | DELETE | Auth | Delete account | ✅ |
| 14 | `/has-role/{role}` | GET | Auth | Check role | ✅ |
| 15 | `/search` | GET | Auth | Search users | ✅ |
| 16 | `/{id}/public` | GET | Auth | Public profile | ✅ |
| 17 | `/` | GET | Admin | All users | ✅ |
| 18 | `/` | POST | Admin | Create user | ✅ |
| 19 | `/{id}` | PUT | Admin | Update user | ✅ |
| 20 | `/password` | PUT | Auth | Change password | ✅ |
| 21 | `/settings` | PUT | Auth | Notification settings | ✅ |
| 22 | `/{id}` | DELETE | Admin | Delete user | ✅ |

---

## 3. Roommate Module (`/api/roommates`)
| # | Endpoint | Method | Role | Purpose | Status |
|---|----------|--------|------|---------|--------|
| 23 | `/` | POST | Auth | Create post | ✅ |
| 24 | `/{id}` | GET | Public | Get post by ID | ✅ |
| 25 | `/` | GET | Public | Search posts | ✅ |
| 26 | `/my` | GET | Auth | User's posts | ✅ |
| 27 | `/matches` | GET | Auth | AI matches | ✅ |
| 28 | `/{id}` | PUT | Auth | Update post | ✅ |
| 29 | `/{id}` | DELETE | Auth | Delete post | ✅ |
| 30 | `/all` | GET | Admin | All posts | ✅ |
| 31 | `/{id}/status` | PUT | Admin | Update status | ✅ |

---

## 4. Application Module (`/api/applications`)
| # | Endpoint | Method | Role | Purpose | Status |
|---|----------|--------|------|---------|--------|
| 32 | `/` | POST | Auth | Send application | ✅ |
| 33 | `/sent` | GET | Auth | User's sent apps | ✅ |
| 34 | `/received` | GET | Auth | Received apps | ✅ |
| 35 | `/{id}/status` | PATCH | Auth | Update status | ✅ |
| 36 | `/{id}` | DELETE | Auth | Delete app | ✅ |

---

## 5. Messaging Module (`/api/messages`)
| # | Endpoint | Method | Role | Purpose | Status |
|---|----------|--------|------|---------|--------|
| 37 | `/conversations` | GET | Auth | List conversations | ✅ |
| 38 | `/conversations/{id}` | GET | Auth | Get conversation | ✅ |
| 39 | `/conversations/{id}/messages` | GET | Auth | Get messages | ✅ |
| 40 | `/conversations` | POST | Auth | Create conversation | ✅ |
| 41 | `/send` | POST | Auth | Send message | ✅ |
| 42 | `/mark-read` | POST | Auth | Mark read | ✅ |
| 43 | `/conversations/{id}/mark-read` | POST | Auth | Mark convo read | ✅ |
| 44 | `/conversations/{id}` | DELETE | Auth | Delete convo | ✅ |
| 45 | `/messages/{id}` | DELETE | Auth | Delete message | ✅ |
| 46 | `/unread-count` | GET | Auth | Unread count | ✅ |
| 47 | `/all-conversations` | GET | Auth | All convos | ✅ |
| 48 | `/presence/{userId}` | GET | Auth | User presence | ✅ |

---

## 6. Finance Module (`/api/finance`)
| # | Endpoint | Method | Role | Purpose | Status |
|---|----------|--------|------|---------|--------|
| 49 | `/earnings` | GET | Owner/Admin | Earnings summary | ✅ |
| 50 | `/history` | GET | Owner/Admin | Earnings history | ✅ |
| 51 | `/my-payments` | GET | All Auth | User payments | ✅ |
| 52 | `/my-spending-summary` | GET | All Auth | Spending total | ✅ |
| 53 | `/payout-methods` | GET | Owner/Admin | Get methods | ✅ |
| 54 | `/payout-methods` | POST | Owner | Add method | ✅ |
| 55 | `/payout-methods/{id}` | DELETE | Owner | Delete method | ✅ |
| 56 | `/payout-requests` | POST | Owner | Request payout | ✅ |
| 57 | `/admin/payments` | GET | Admin | All payments | ✅ |
| 58 | `/admin/earnings` | GET | Admin | All earnings | ✅ |
| 59 | `/admin/payout-requests` | GET | Admin | All payouts | ✅ |
| 60 | `/admin/payout-requests/{id}/process` | POST | Admin | Process payout | ✅ |

---

## 7. Property Module (`/api/properties`)
| # | Endpoint | Method | Role | Purpose | Status |
|---|----------|--------|------|---------|--------|
| 61 | `/my-properties` | GET | Auth | Owner's properties | ✅ |
| 62 | `/my-properties/{id}` | GET | Auth | Owner prop detail | ✅ |
| 63 | `/` | POST | Owner/Admin | Create property | ✅ |
| 64 | `/recommended` | GET | Auth | Recommendations | ✅ |
| 65 | `/search` | GET | Public | Search | ✅ |
| 66 | `/{id}` | GET | Public | Property detail | ✅ |
| 67 | `/{id}/status` | PATCH | Owner/Admin | Update status | ✅ |
| 68 | `/{id}` | PUT | Owner/Admin | Update property | ✅ |
| 69 | `/{id}` | DELETE | Auth | Delete property | ✅ |

---

## 8. Booking Module (`/api/bookings`)
| # | Endpoint | Method | Role | Purpose | Status |
|---|----------|--------|------|---------|--------|
| 70 | `/` | POST | Auth | Create booking | ✅ |
| 71 | `/my-bookings` | GET | Auth | User's bookings | ✅ |
| 72 | `/requests` | GET | Auth | Booking requests | ✅ |
| 73 | `/{id}/status` | PATCH | Auth | Update status | ✅ |
| 74 | `/{id}` | DELETE | Auth | Delete booking | ✅ |
| 75 | `/{id}/check-in` | POST | Auth | Check in | ✅ |
| 76 | `/{id}/check-out` | POST | Auth | Check out | ✅ |

---

## 9. Notification Module (`/api/notifications`)
| # | Endpoint | Method | Role | Purpose | Status |
|---|----------|--------|------|---------|--------|
| 77 | `/` | GET | Auth | Get notifications | ✅ |
| 78 | `/{id}` | GET | Auth | Get single | ✅ |
| 79 | `/unread-count` | GET | Auth | Unread count | ✅ |
| 80 | `/summary` | GET | Auth | Summary | ✅ |
| 81 | `/mark-read` | POST | Auth | Mark read | ✅ |
| 82 | `/{id}/read` | POST | Auth | Mark single read | ✅ |
| 83 | `/mark-all-read` | POST | Auth | Mark all read | ✅ |
| 84 | `/` | DELETE | Auth | Delete notifications | ✅ |
| 85 | `/{id}` | DELETE | Auth | Delete single | ✅ |
| 86 | `/cleanup` | DELETE | Auth | Cleanup old | ✅ |
| 87 | `/` | POST | Auth | Create notification | ✅ |

---

## 10. Review Module (`/api/reviews`)
| # | Endpoint | Method | Role | Purpose | Status |
|---|----------|--------|------|---------|--------|
| 88 | `/` | POST | Auth | Create review | ✅ |
| 89 | `/user/{userId}` | GET | Public | User reviews | ✅ |
| 90 | `/property/{propertyId}` | GET | Public | Property reviews | ✅ |
| 91 | `/{id}` | DELETE | Auth | Delete review | ✅ |

---

## 11. Saved Module (`/api/saved`)
| # | Endpoint | Method | Role | Purpose | Status |
|---|----------|--------|------|---------|--------|
| 92 | `/properties` | GET | Auth | Saved properties | ✅ |
| 93 | `/properties/{id}` | POST | Auth | Save property | ✅ |
| 94 | `/properties/{id}` | DELETE | Auth | Unsave property | ✅ |
| 95 | `/properties/{id}/check` | GET | Auth | Is saved | ✅ |
| 96 | `/roommates` | GET | Auth | Saved roommates | ✅ |
| 97 | `/roommates/{id}` | POST | Auth | Save roommate | ✅ |
| 98 | `/roommates/{id}` | DELETE | Auth | Unsave roommate | ✅ |
| 99 | `/roommates/{id}/check` | GET | Auth | Is saved | ✅ |

---

## 12. Verification Module (`/api/verification`)
| # | Endpoint | Method | Role | Purpose | Status |
|---|----------|--------|------|---------|--------|
| 100 | `/admin/pending` | GET | Admin | Pending requests | ✅ |
| 101 | `/admin/{id}/approve` | POST | Admin | Approve | ✅ |
| 102 | `/admin/{id}/reject` | POST | Admin | Reject | ✅ |
| 103 | `/status` | GET | Auth | User status | ✅ |
| 104 | `/phone` | POST | Auth | Request phone OTP | ✅ |
| 105 | `/phone/verify` | POST | Auth | Verify phone | ✅ |
| 106 | `/upload` | POST | Auth | Upload document | ✅ |

---

## 13. Dashboard Module (`/api/dashboard`)
| # | Endpoint | Method | Role | Purpose | Status |
|---|----------|--------|------|---------|--------|
| 107 | `/stats` | GET | Auth | Dashboard stats | ✅ |
| 108 | `/admin` | GET | Admin | Admin dashboard | ✅ |
| 109 | `/landlord` | GET | Owner | Landlord dashboard | ✅ |
| 110 | `/user` | GET | User | User dashboard | ✅ |

---

## 14. Admin Module (`/api/admin`)
| # | Endpoint | Method | Role | Purpose | Status |
|---|----------|--------|------|---------|--------|
| 111 | `/dashboard` | GET | Admin | Dashboard stats | ✅ |
| 112 | `/stats` | GET | Admin | Stats alias | ✅ |
| 113 | `/fraud/scan` | POST | Admin | Trigger fraud scan | ✅ |
| 114 | `/properties` | GET | Admin | All properties | ✅ |
| 115 | `/properties/{id}/approve` | PUT | Admin | Approve property | ✅ |
| 116 | `/properties/{id}/reject` | PUT | Admin | Reject property | ✅ |
| 117 | `/reports` | GET | Admin | All reports | ✅ |
| 118 | `/reports/{id}/resolve` | POST | Admin | Resolve report | ✅ |
| 119 | `/reports/{id}/dismiss` | POST | Admin | Dismiss report | ✅ |
| 120 | `/verifications` | GET | Admin | All verifications | ✅ |
| 121 | `/verifications/{id}/approve` | PUT | Admin | Approve | ✅ |
| 122 | `/verifications/{id}/reject` | PUT | Admin | Reject | ✅ |
| 123 | `/settings` | GET | Admin | Get settings | ✅ |
| 124 | `/settings` | PUT | Admin | Update settings | ✅ |
| 125 | `/users/{id}/status` | PUT | Admin | Update user status | ✅ |

---

## 15. Admin Analytics (`/api/admin/analytics`)
| # | Endpoint | Method | Role | Purpose | Status |
|---|----------|--------|------|---------|--------|
| 126 | `/user-growth` | GET | Admin | User growth stats | ✅ |
| 127 | `/revenue` | GET | Admin | Revenue stats | ✅ |
| 128 | `/financial-overview` | GET | Admin | Financial overview | ✅ |
| 129 | `/dashboard` | GET | Admin | Analytics dashboard | ✅ |

---

## 16. Admin Users (`/api/admin/users`)
| # | Endpoint | Method | Role | Purpose | Status |
|---|----------|--------|------|---------|--------|
| 130 | `/{userId}/delete-request` | POST | Admin | Schedule deletion | ✅ |
| 131 | `/{userId}/cancel-delete` | POST | Admin | Cancel deletion | ✅ |

---

## 17. Landlord Module (`/api/landlord`)
| # | Endpoint | Method | Role | Purpose | Status |
|---|----------|--------|------|---------|--------|
| 132 | `/dashboard/overview` | GET | Owner | Landlord overview | ✅ |
| 133 | `/properties/summary` | GET | Owner | Property summaries | ✅ |
| 134 | `/seats/{id}/availability` | PATCH | Owner | Toggle seat | ✅ |
| 135 | `/bookings` | GET | Owner | Get bookings | ✅ |
| 136 | `/bookings/{id}/status` | PATCH | Owner | Update booking | ✅ |
| 137 | `/reviews` | GET | Owner | Get reviews | ✅ |

---

## 18. Match Module (`/api/matches`)
| # | Endpoint | Method | Role | Purpose | Status |
|---|----------|--------|------|---------|--------|
| 138 | `/` | POST | Auth | Create match | ✅ |
| 139 | `/` | GET | Auth | Get my matches | ✅ |
| 140 | `/{id}` | DELETE | Auth | Unmatch | ✅ |

---

## 19. AI Module (`/api/ai`)
| # | Endpoint | Method | Role | Purpose | Status |
|---|----------|--------|------|---------|--------|
| 141 | `/status` | GET | Public | AI health status | ✅ |
| 142 | `/match` | POST | Auth | Trigger AI matching | ✅ |

---

## 20. File Module (`/api/uploads`)
| # | Endpoint | Method | Role | Purpose | Status |
|---|----------|--------|------|---------|--------|
| 143 | `/{fileName}` | GET | Public | Download file | ✅ |
| 144 | `/{bucket}/{filename}` | GET | Public | Get file from bucket | ✅ |

---

## Summary

| Status | Count | Percentage |
|--------|-------|------------|
| ✅ Passed | 144 | 100% |
| ⚠️ Partial | 0 | 0% |
| ❌ Failed | 0 | 0% |

---

## Role Access Summary

| Module | Public | User | Owner | Admin |
|--------|--------|------|-------|-------|
| Auth | ✓ | ✓ | ✓ | ✓ |
| User | ✗ | ✓ | ✓ | ✓ |
| Roommate | ✓ (read) | ✓ | ✓ | ✓ |
| Application | ✗ | ✓ | ✓ | ✓ |
| Messaging | ✗ | ✓ | ✓ | ✓ |
| Finance (User) | ✗ | ✓ | ✓ | ✓ |
| Finance (Owner) | ✗ | ✗ | ✓ | ✓ |
| Finance (Admin) | ✗ | ✗ | ✗ | ✓ |
| Property | ✓ (search) | ✓ | ✓ | ✓ |
| Booking | ✗ | ✓ | ✓ | ✓ |
| Notification | ✗ | ✓ | ✓ | ✓ |
| Review | ✓ (read) | ✓ | ✓ | ✓ |
| Saved | ✗ | ✓ | ✓ | ✓ |
| Verification | ✗ | ✓ | ✓ | ✓ |
| Dashboard | ✗ | ✓ | ✓ | ✓ |
| Admin | ✗ | ✗ | ✗ | ✓ |
| Landlord | ✗ | ✗ | ✓ | ✓ |
| Match | ✗ | ✓ | ✓ | ✓ |
| AI | ✓ (status) | ✓ | ✓ | ✓ |
| File | ✓ | ✓ | ✓ | ✓ |

---

## Bugs Fixed During Audit

| # | Location | Issue | Fix |
|---|----------|-------|-----|
| 1 | `RoommateService.mapToDto` | NPE on null user | Added null check |
| 2 | `FinanceServiceImpl.mapToEarningDto` | NPE on null booking chain | Added null safety |
| 3 | `FinanceServiceImpl.mapToPaymentDto` | NPE on null status | Added null check |
| 4 | `properties/[id]/page.tsx` | Hardcoded Unsplash URL | Replaced with local placeholder |

---

*Generated by Deep System Audit - StayMate v1.0*
