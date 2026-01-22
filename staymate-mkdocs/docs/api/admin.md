# Admin API

Administrative endpoints for platform management.

---

## Endpoints

All endpoints require `ROLE_ADMIN`.

| Category | Example Endpoints |
|----------|-------------------|
| Dashboard | `GET /api/dashboard/admin` |
| Analytics | `GET /api/admin/analytics/user-growth` |
| Users | `GET /api/users`, `DELETE /api/users/{id}` |
| Verification | `GET /api/verification/admin/pending` |
| Fraud | `GET /api/admin/fraud-scan` |

---

## Dashboard Stats

```http
GET /api/dashboard/admin
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "totalUsers": 5420,
  "totalProperties": 1234,
  "activeBookings": 456,
  "pendingBookings": 78,
  "totalRevenue": 125000,
  "fraudAlerts": 3
}
```

---

## User Management

```http
GET /api/users?page=0&size=20&role=USER
Authorization: Bearer <admin_token>
```

---

## Verification Processing

```http
POST /api/verification/admin/{id}/approve
Authorization: Bearer <admin_token>
```

```http
POST /api/verification/admin/{id}/reject
Authorization: Bearer <admin_token>
Content-Type: application/json

{"reason": "Document not readable"}
```

---

See [Security - Authorization](../security/authorization-model.md) for role details.
