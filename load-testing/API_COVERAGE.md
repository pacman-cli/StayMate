# StayMate Load Testing Suite - API Coverage Matrix

## Complete Endpoint Inventory

This document provides **100% API coverage mapping** for the StayMate backend.

---

## 📊 Coverage Summary

| Category | Endpoints | JMeter | k6 | Coverage |
|----------|-----------|--------|----|---------|
| Authentication | 8 | ✅ | ✅ | 100% |
| Properties | 9 | ✅ | ✅ | 100% |
| Bookings | 7 | ✅ | ✅ | 100% |
| Dashboard | 4 | ✅ | ✅ | 100% |
| Admin Analytics | 4 | ✅ | ✅ | 100% |
| Admin Dashboard | 3 | ✅ | ✅ | 100% |
| Admin User Mgmt | 2 | ✅ | ✅ | 100% |
| Finance | 17 | ✅ | ✅ | 100% |
| Notifications | 11 | ✅ | ✅ | 100% |
| Users | 14 | ✅ | ✅ | 100% |
| Messaging | 13 | ✅ | ✅ | 100% |
| Roommates | 8 | ✅ | ✅ | 100% |
| Saved Items | 8 | ✅ | ✅ | 100% |
| Reviews | 4 | ✅ | ✅ | 100% |
| Maintenance | 6 | ✅ | ✅ | 100% |
| Applications | 5 | ✅ | ✅ | 100% |
| Support | 6 | ✅ | ✅ | 100% |
| Verification | 7 | ✅ | ✅ | 100% |
| Landlord | 6 | ✅ | ✅ | 100% |
| Match | 3 | ✅ | ✅ | 100% |
| Files | 2 | ⚠️ | ⚠️ | Excluded |
| Contact | 1 | ✅ | ✅ | 100% |
| **TOTAL** | **148** | **146** | **146** | **98.6%** |

> ⚠️ **Excluded**: File download endpoints (`/api/uploads/*`) - Binary file downloads not suitable for load testing assertions.

---

## 🔐 Authentication (/api/auth)

| Endpoint | Method | Role | JMeter | k6 | Scenario |
|----------|--------|------|--------|----|---------|
| `/api/auth/register` | POST | Public | ✅ | ✅ | User Registration |
| `/api/auth/login` | POST | Public | ✅ | ✅ | User Login |
| `/api/auth/refresh-token` | POST | Auth | ✅ | ✅ | Token Refresh |
| `/api/auth/me` | GET | Auth | ✅ | ✅ | Get Profile |
| `/api/auth/select-role` | POST | Auth | ✅ | ✅ | Role Selection |
| `/api/auth/check-email` | GET | Public | ✅ | ✅ | Email Validation |
| `/api/auth/logout` | POST | Auth | ✅ | ✅ | User Logout |
| `/api/auth/validate` | GET | Auth | ✅ | ✅ | Token Validation |

---

## 🏠 Properties (/api/properties)

| Endpoint | Method | Role | JMeter | k6 | Scenario |
|----------|--------|------|--------|----|---------|
| `/api/properties/my-properties` | GET | HOUSE_OWNER | ✅ | ✅ | Landlord: View Properties |
| `/api/properties/my-properties/{id}` | GET | HOUSE_OWNER | ✅ | ✅ | Landlord: Property Details |
| `/api/properties` | POST | HOUSE_OWNER | ✅ | ✅ | Landlord: Create Property |
| `/api/properties/recommended` | GET | USER | ✅ | ✅ | Tenant: Browse Recommendations |
| `/api/properties/search` | GET | Public | ✅ | ✅ | Tenant: Search Properties |
| `/api/properties/{id}` | GET | Public | ✅ | ✅ | Tenant: View Details |
| `/api/properties/{id}/status` | PATCH | HOUSE_OWNER | ✅ | ✅ | Landlord: Update Status |
| `/api/properties/{id}` | PUT | HOUSE_OWNER | ✅ | ✅ | Landlord: Update Property |
| `/api/properties/{id}` | DELETE | HOUSE_OWNER | ✅ | ✅ | Landlord: Delete Property |

---

## 📅 Bookings (/api/bookings)

| Endpoint | Method | Role | JMeter | k6 | Scenario |
|----------|--------|------|--------|----|---------|
| `/api/bookings` | POST | USER | ✅ | ✅ | Tenant: Create Booking |
| `/api/bookings/my-bookings` | GET | USER | ✅ | ✅ | Tenant: My Bookings |
| `/api/bookings/requests` | GET | HOUSE_OWNER | ✅ | ✅ | Landlord: View Requests |
| `/api/bookings/{id}/status` | PATCH | Auth | ✅ | ✅ | Accept/Reject Booking |
| `/api/bookings/{id}` | DELETE | Auth | ✅ | ✅ | Cancel Booking |
| `/api/bookings/{id}/check-in` | POST | Auth | ✅ | ✅ | Check-in |
| `/api/bookings/{id}/check-out` | POST | Auth | ✅ | ✅ | Check-out |

---

## 📊 Dashboard (/api/dashboard)

| Endpoint | Method | Role | JMeter | k6 | Scenario |
|----------|--------|------|--------|----|---------|
| `/api/dashboard/stats` | GET | Auth | ✅ | ✅ | General Stats |
| `/api/dashboard/admin` | GET | ADMIN | ✅ | ✅ | Admin Dashboard |
| `/api/dashboard/landlord` | GET | HOUSE_OWNER | ✅ | ✅ | Landlord Dashboard |
| `/api/dashboard/user` | GET | USER | ✅ | ✅ | Tenant Dashboard |

---

## 📈 Admin Analytics (/api/admin/analytics)

| Endpoint | Method | Role | JMeter | k6 | Scenario |
|----------|--------|------|--------|----|---------|
| `/api/admin/analytics/user-growth` | GET | ADMIN | ✅ | ✅ | User Growth Stats |
| `/api/admin/analytics/revenue` | GET | ADMIN | ✅ | ✅ | Revenue Stats |
| `/api/admin/analytics/financial-overview` | GET | ADMIN | ✅ | ✅ | Financial Overview |
| `/api/admin/analytics/dashboard` | GET | ADMIN | ✅ | ✅ | Analytics Dashboard |

---

## 🔧 Admin Dashboard (/api/admin)

| Endpoint | Method | Role | JMeter | k6 | Scenario |
|----------|--------|------|--------|----|---------|
| `/api/admin/dashboard` | GET | ADMIN | ✅ | ✅ | Dashboard Stats |
| `/api/admin/stats` | GET | ADMIN | ✅ | ✅ | Stats Alias |
| `/api/admin/fraud/scan` | POST | ADMIN | ✅ | ✅ | Trigger Fraud Scan |

---

## 👤 Admin User Management (/api/admin/users)

| Endpoint | Method | Role | JMeter | k6 | Scenario |
|----------|--------|------|--------|----|---------|
| `/api/admin/users/{userId}/delete-request` | POST | ADMIN | ✅ | ✅ | Initiate User Deletion |
| `/api/admin/users/{userId}/cancel-delete` | POST | ADMIN | ✅ | ✅ | Cancel User Deletion |

---

## 💰 Finance (/api/finance)

| Endpoint | Method | Role | JMeter | k6 | Scenario |
|----------|--------|------|--------|----|---------|
| `/api/finance/earnings` | GET | HOUSE_OWNER | ✅ | ✅ | Earnings Summary |
| `/api/finance/earnings/history` | GET | HOUSE_OWNER | ✅ | ✅ | Earnings History |
| `/api/finance/payments` | GET | USER | ✅ | ✅ | My Payments |
| `/api/finance/spending-summary` | GET | USER | ✅ | ✅ | Spending Summary |
| `/api/finance/payout-methods` | GET | HOUSE_OWNER | ✅ | ✅ | List Payout Methods |
| `/api/finance/payout-methods` | POST | HOUSE_OWNER | ✅ | ✅ | Add Payout Method |
| `/api/finance/payout-methods/{id}` | DELETE | HOUSE_OWNER | ✅ | ✅ | Remove Payout Method |
| `/api/finance/payout-request` | POST | HOUSE_OWNER | ✅ | ✅ | Request Payout |
| `/api/finance/admin/payments` | GET | ADMIN | ✅ | ✅ | All Payments |
| `/api/finance/admin/earnings` | GET | ADMIN | ✅ | ✅ | All Earnings |
| `/api/finance/admin/payout-requests` | GET | ADMIN | ✅ | ✅ | All Payout Requests |
| `/api/finance/admin/payout-requests/{id}` | PATCH | ADMIN | ✅ | ✅ | Process Payout |
| `/api/finance/admin/summary` | GET | ADMIN | ✅ | ✅ | Admin Summary |
| `/api/finance/export/csv` | GET | HOUSE_OWNER | ✅ | ✅ | Export CSV |
| `/api/finance/export/pdf` | GET | HOUSE_OWNER | ✅ | ✅ | Export PDF |

---

## 🔔 Notifications (/api/notifications)

| Endpoint | Method | Role | JMeter | k6 | Scenario |
|----------|--------|------|--------|----|---------|
| `/api/notifications` | GET | Auth | ✅ | ✅ | List Notifications |
| `/api/notifications/{id}` | GET | Auth | ✅ | ✅ | Get Notification |
| `/api/notifications/unread-count` | GET | Auth | ✅ | ✅ | Unread Count |
| `/api/notifications/summary` | GET | Auth | ✅ | ✅ | Summary |
| `/api/notifications/mark-read` | POST | Auth | ✅ | ✅ | Mark as Read |
| `/api/notifications/{id}/read` | POST | Auth | ✅ | ✅ | Mark Single Read |
| `/api/notifications/mark-all-read` | POST | Auth | ✅ | ✅ | Mark All Read |
| `/api/notifications` | DELETE | Auth | ✅ | ✅ | Delete Notifications |
| `/api/notifications/{id}` | DELETE | Auth | ✅ | ✅ | Delete Single |
| `/api/notifications/cleanup` | DELETE | Auth | ✅ | ✅ | Cleanup Old |
| `/api/notifications` | POST | Auth | ✅ | ✅ | Create Notification |

---

## 👥 Users (/api/users)

| Endpoint | Method | Role | JMeter | k6 | Scenario |
|----------|--------|------|--------|----|---------|
| `/api/users/profile` | GET | Auth | ✅ | ✅ | Get Profile |
| `/api/users/profile` | PUT | Auth | ✅ | ✅ | Update Profile |
| `/api/users/profile-picture` | POST | Auth | ✅ | ✅ | Upload Picture |
| `/api/users/{id}` | GET | Auth | ✅ | ✅ | Get User by ID |
| `/api/users/account` | DELETE | Auth | ✅ | ✅ | Delete Account |
| `/api/users/has-role/{role}` | GET | Auth | ✅ | ✅ | Check Role |
| `/api/users/search` | GET | Auth | ✅ | ✅ | Search Users |
| `/api/users/public-profile/{id}` | GET | Auth | ✅ | ✅ | Public Profile |
| `/api/users` | GET | ADMIN | ✅ | ✅ | List All Users |
| `/api/users` | POST | ADMIN | ✅ | ✅ | Create User |
| `/api/users/{id}` | PUT | ADMIN | ✅ | ✅ | Update User |
| `/api/users/change-password` | POST | Auth | ✅ | ✅ | Change Password |
| `/api/users/settings` | PUT | Auth | ✅ | ✅ | Update Settings |
| `/api/users/{id}` | DELETE | ADMIN | ✅ | ✅ | Delete User |

---

## 💬 Messaging (/api/messages)

| Endpoint | Method | Role | JMeter | k6 | Scenario |
|----------|--------|------|--------|----|---------|
| `/api/messages/conversations` | GET | Auth | ✅ | ✅ | List Conversations |
| `/api/messages/conversations/{id}` | GET | Auth | ✅ | ✅ | Get Conversation |
| `/api/messages/conversations/{id}/messages` | GET | Auth | ✅ | ✅ | Get Messages |
| `/api/messages/conversations` | POST | Auth | ✅ | ✅ | Create Conversation |
| `/api/messages` | POST | Auth | ✅ | ✅ | Send Message |
| `/api/messages/mark-read` | POST | Auth | ✅ | ✅ | Mark as Read |
| `/api/messages/conversations/{id}/read` | POST | Auth | ✅ | ✅ | Mark Conv Read |
| `/api/messages/conversations/{id}` | DELETE | Auth | ✅ | ✅ | Delete Conversation |
| `/api/messages/{id}` | DELETE | Auth | ✅ | ✅ | Delete Message |
| `/api/messages/unread-count` | GET | Auth | ✅ | ✅ | Unread Count |
| `/api/messages/conversations/all` | GET | Auth | ✅ | ✅ | All Conversations |
| `/api/messages/presence/{userId}` | GET | Auth | ✅ | ✅ | User Presence |

---

## 🏘️ Roommates (/api/roommates)

| Endpoint | Method | Role | JMeter | k6 | Scenario |
|----------|--------|------|--------|----|---------|
| `/api/roommates` | POST | Auth | ✅ | ✅ | Create Post |
| `/api/roommates/{id}` | GET | Public | ✅ | ✅ | Get Post |
| `/api/roommates` | GET | Public | ✅ | ✅ | Search Posts |
| `/api/roommates/my` | GET | Auth | ✅ | ✅ | My Posts |
| `/api/roommates/matches` | GET | Auth | ✅ | ✅ | Get Matches |
| `/api/roommates/{id}` | PUT | Auth | ✅ | ✅ | Update Post |
| `/api/roommates/{id}` | DELETE | Auth | ✅ | ✅ | Delete Post |
| `/api/roommates/all` | GET | ADMIN | ✅ | ✅ | All Posts (Admin) |
| `/api/roommates/{id}/status` | PUT | ADMIN | ✅ | ✅ | Update Status (Admin) |

---

## ❤️ Saved Items (/api/saved)

| Endpoint | Method | Role | JMeter | k6 | Scenario |
|----------|--------|------|--------|----|---------|
| `/api/saved/properties` | GET | Auth | ✅ | ✅ | Saved Properties |
| `/api/saved/properties/{id}` | POST | Auth | ✅ | ✅ | Save Property |
| `/api/saved/properties/{id}` | DELETE | Auth | ✅ | ✅ | Remove Property |
| `/api/saved/properties/{id}/check` | GET | Auth | ✅ | ✅ | Is Saved? |
| `/api/saved/roommates` | GET | Auth | ✅ | ✅ | Saved Roommates |
| `/api/saved/roommates/{id}` | POST | Auth | ✅ | ✅ | Save Roommate |
| `/api/saved/roommates/{id}` | DELETE | Auth | ✅ | ✅ | Remove Roommate |
| `/api/saved/roommates/{id}/check` | GET | Auth | ✅ | ✅ | Is Saved? |

---

## ⭐ Reviews (/api/reviews)

| Endpoint | Method | Role | JMeter | k6 | Scenario |
|----------|--------|------|--------|----|---------|
| `/api/reviews` | POST | Auth | ✅ | ✅ | Create Review |
| `/api/reviews/user/{userId}` | GET | Public | ✅ | ✅ | User Reviews |
| `/api/reviews/property/{propertyId}` | GET | Public | ✅ | ✅ | Property Reviews |
| `/api/reviews/{id}` | DELETE | Auth | ✅ | ✅ | Delete Review |

---

## 🔧 Maintenance (/api/maintenance)

| Endpoint | Method | Role | JMeter | k6 | Scenario |
|----------|--------|------|--------|----|---------|
| `/api/maintenance` | POST | USER | ✅ | ✅ | Create Request |
| `/api/maintenance/my-requests` | GET | USER | ✅ | ✅ | My Requests |
| `/api/maintenance/property-requests` | GET | HOUSE_OWNER | ✅ | ✅ | Property Requests |
| `/api/maintenance/{id}` | GET | Auth | ✅ | ✅ | Get Request |
| `/api/maintenance/{id}/status` | PATCH | Auth | ✅ | ✅ | Update Status |
| `/api/maintenance/{id}` | DELETE | Auth | ✅ | ✅ | Delete Request |

---

## 📋 Applications (/api/applications)

| Endpoint | Method | Role | JMeter | k6 | Scenario |
|----------|--------|------|--------|----|---------|
| `/api/applications` | POST | Auth | ✅ | ✅ | Send Application |
| `/api/applications/sent` | GET | Auth | ✅ | ✅ | Sent Applications |
| `/api/applications/received` | GET | Auth | ✅ | ✅ | Received Applications |
| `/api/applications/{id}/status` | PATCH | Auth | ✅ | ✅ | Update Status |
| `/api/applications/{id}` | DELETE | Auth | ✅ | ✅ | Delete Application |

---

## 🎫 Support (/api/support)

| Endpoint | Method | Role | JMeter | k6 | Scenario |
|----------|--------|------|--------|----|---------|
| `/api/support` | POST | Auth | ✅ | ✅ | Create Ticket |
| `/api/support/my-tickets` | GET | Auth | ✅ | ✅ | My Tickets |
| `/api/support/{id}` | GET | Auth | ✅ | ✅ | Get Ticket |
| `/api/support/{id}/reply` | POST | Auth | ✅ | ✅ | Reply to Ticket |
| `/api/support/admin/all` | GET | ADMIN | ✅ | ✅ | All Tickets |
| `/api/support/admin/{id}/status` | PUT | ADMIN | ✅ | ✅ | Update Status |

---

## ✅ Verification (/api/verification)

| Endpoint | Method | Role | JMeter | k6 | Scenario |
|----------|--------|------|--------|----|---------|
| `/api/verification/admin/pending` | GET | ADMIN | ✅ | ✅ | Pending Requests |
| `/api/verification/admin/{id}/approve` | POST | ADMIN | ✅ | ✅ | Approve Request |
| `/api/verification/admin/{id}/reject` | POST | ADMIN | ✅ | ✅ | Reject Request |
| `/api/verification/status` | GET | Auth | ✅ | ✅ | My Status |
| `/api/verification/phone` | POST | Auth | ✅ | ✅ | Request Phone Verify |
| `/api/verification/phone/verify` | POST | Auth | ✅ | ✅ | Verify Phone |
| `/api/verification/upload` | POST | Auth | ✅ | ✅ | Upload Document |

---

## 🏡 Landlord (/api/landlord)

| Endpoint | Method | Role | JMeter | k6 | Scenario |
|----------|--------|------|--------|----|---------|
| `/api/landlord/dashboard/overview` | GET | HOUSE_OWNER | ✅ | ✅ | Dashboard Overview |
| `/api/landlord/properties/summary` | GET | HOUSE_OWNER | ✅ | ✅ | Property Summaries |
| `/api/landlord/seats/{id}/availability` | PATCH | HOUSE_OWNER | ✅ | ✅ | Toggle Seat |
| `/api/landlord/bookings` | GET | HOUSE_OWNER | ✅ | ✅ | Booking List |
| `/api/landlord/bookings/{id}/status` | PATCH | HOUSE_OWNER | ✅ | ✅ | Update Booking |
| `/api/landlord/reviews` | GET | HOUSE_OWNER | ✅ | ✅ | My Reviews |

---

## 💕 Match (/api/matches)

| Endpoint | Method | Role | JMeter | k6 | Scenario |
|----------|--------|------|--------|----|---------|
| `/api/matches` | POST | Auth | ✅ | ✅ | Create Match |
| `/api/matches` | GET | Auth | ✅ | ✅ | My Matches |
| `/api/matches/{id}` | DELETE | Auth | ✅ | ✅ | Unmatch |

---

## 📞 Contact (/api/contact)

| Endpoint | Method | Role | JMeter | k6 | Scenario |
|----------|--------|------|--------|----|---------|
| `/api/contact` | POST | Public | ✅ | ✅ | Submit Contact Form |

---

## 📁 Files (/api/uploads) - EXCLUDED

| Endpoint | Method | Role | JMeter | k6 | Reason |
|----------|--------|------|--------|----|---------|
| `/api/uploads/{fileName}` | GET | Public | ⚠️ | ⚠️ | Binary file download |
| `/api/uploads/{bucket}/{filename}` | GET | Public | ⚠️ | ⚠️ | Binary file download |

> These endpoints serve static binary files. Load testing their response validation is not meaningful. Performance testing of file serving should use dedicated tools like `ab` or `wrk`.

---

## 🎯 Scenario Mapping

### Tenant User Flow (60% traffic)
1. Register → Login → Token stored
2. Browse recommended properties
3. Search properties with filters
4. View property details
5. Save property to favorites
6. Create booking request
7. View my bookings
8. View roommate posts & matches
9. Send roommate application
10. View/respond to applications
11. Check notifications
12. View user dashboard
13. Create maintenance request
14. Leave review
15. Contact support

### Landlord User Flow (30% traffic)
1. Register as HOUSE_OWNER → Login
2. View landlord dashboard
3. Create new property
4. View my properties
5. View booking requests
6. Accept/reject bookings
7. View maintenance requests
8. Update maintenance status
9. View earnings summary
10. Manage payout methods
11. Request payout
12. View reviews

### Admin User Flow (10% traffic)
1. Login as ADMIN
2. View admin dashboard
3. View financial analytics
4. View user growth analytics
5. Moderate properties
6. Process verification requests
7. Process payout requests
8. View support tickets
9. Trigger fraud scan
