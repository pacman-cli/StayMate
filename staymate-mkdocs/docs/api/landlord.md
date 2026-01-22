# Landlord API

Endpoints for users with `ROLE_HOUSE_OWNER` (landlords).

---

## Property Management

### Create Property

```http
POST /api/properties
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "title": "Modern 2BR Apartment",
  "description": "Spacious apartment with city view...",
  "price": 25000,
  "deposit": 50000,
  "propertyType": "APARTMENT",
  "bedrooms": 2,
  "bathrooms": 2,
  "squareFeet": 1200,
  "address": "123 Main St",
  "city": "Dhaka",
  "amenities": ["WIFI", "AC", "PARKING"],
  "images": ["https://storage.../image1.jpg"]
}
```

### Get My Properties

```http
GET /api/properties/my-properties?page=0&size=20
Authorization: Bearer <token>
```

### Update Property

```http
PUT /api/properties/{id}
Authorization: Bearer <token>
Content-Type: application/json
```

### Delete Property

```http
DELETE /api/properties/{id}
Authorization: Bearer <token>
```

### Update Property Status

```http
PATCH /api/properties/{id}/status
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "status": "UNAVAILABLE"
}
```

---

## Booking Management

### Get Property Bookings

```http
GET /api/bookings/property/{propertyId}?status=PENDING
Authorization: Bearer <token>
```

### Approve/Reject Booking

```http
PATCH /api/bookings/{id}/status
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "status": "APPROVED",
  "note": "Looking forward to hosting you!"
}
```

### Check-In Tenant

```http
POST /api/bookings/{id}/check-in
Authorization: Bearer <token>
```

### Check-Out Tenant

```http
POST /api/bookings/{id}/check-out
Authorization: Bearer <token>
```

---

## Financial Operations

### Get Earnings Summary

```http
GET /api/finance/earnings
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalEarnings": 150000,
  "pendingPayouts": 25000,
  "availableBalance": 50000,
  "thisMonth": {
    "earnings": 30000,
    "bookings": 5
  }
}
```

### Get Earnings History

```http
GET /api/finance/earnings/history?from=2024-01-01&to=2024-01-31
Authorization: Bearer <token>
```

### Get Payout Methods

```http
GET /api/finance/payout-methods
Authorization: Bearer <token>
```

### Add Payout Method

```http
POST /api/finance/payout-methods
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "type": "BANK_ACCOUNT",
  "accountName": "John Doe",
  "bankName": "City Bank",
  "accountNumber": "1234567890",
  "routingNumber": "12345",
  "isDefault": true
}
```

### Request Payout

```http
POST /api/finance/payout-request
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "amount": 25000,
  "payoutMethodId": 1
}
```

### Export Financial Report

```http
GET /api/finance/export/csv?from=2024-01-01&to=2024-01-31
Authorization: Bearer <token>
```

---

## Maintenance Requests

### Get Maintenance Requests

```http
GET /api/maintenance/property/{propertyId}
Authorization: Bearer <token>
```

### Update Request Status

```http
PATCH /api/maintenance/{id}/status
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "status": "IN_PROGRESS",
  "note": "Technician scheduled for tomorrow"
}
```

---

## Dashboard

### Get Landlord Dashboard

```http
GET /api/dashboard/landlord
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalProperties": 5,
  "activeBookings": 3,
  "pendingBookings": 2,
  "monthlyEarnings": 75000,
  "occupancyRate": 0.85,
  "recentActivity": [...]
}
```
