# Tenant API

Endpoints accessible to users with `ROLE_USER` (tenants).

---

## Property Endpoints

### Search Properties

```http
GET /api/properties/search?city=Dhaka&minPrice=5000&maxPrice=20000&page=0&size=20
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `city` | string | Filter by city |
| `minPrice` | number | Minimum price |
| `maxPrice` | number | Maximum price |
| `propertyType` | string | APARTMENT, HOUSE, ROOM |
| `bedrooms` | integer | Number of bedrooms |
| `page` | integer | Page number (0-based) |
| `size` | integer | Page size |

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "title": "Cozy Apartment in Gulshan",
      "price": 15000,
      "city": "Dhaka",
      "images": ["https://..."],
      "landlord": { "id": 5, "name": "John" }
    }
  ],
  "page": 0,
  "totalElements": 45,
  "totalPages": 3
}
```

### Get Property Details

```http
GET /api/properties/{id}
```

### Get Recommended Properties

```http
GET /api/properties/recommended
Authorization: Bearer <token>
```

---

## Booking Endpoints

### Create Booking

```http
POST /api/bookings
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "propertyId": 123,
  "startDate": "2024-02-01",
  "endDate": "2024-02-28",
  "message": "Looking forward to staying!"
}
```

### Get My Bookings

```http
GET /api/bookings/my-bookings?status=APPROVED&page=0
Authorization: Bearer <token>
```

### Cancel Booking

```http
PATCH /api/bookings/{id}/status
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "status": "CANCELLED"
}
```

---

## Roommate Endpoints

### Search Roommates

```http
GET /api/roommates?city=Dhaka&gender=MALE&page=0
```

### Create Roommate Post

```http
POST /api/roommates
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "title": "Looking for roommate in Banani",
  "description": "...",
  "budget": 10000,
  "preferredGender": "ANY",
  "city": "Dhaka"
}
```

### Get My Roommate Posts

```http
GET /api/roommates/my-posts
Authorization: Bearer <token>
```

---

## Messaging Endpoints

### Get Conversations

```http
GET /api/messages/conversations
Authorization: Bearer <token>
```

### Send Message

```http
POST /api/messages
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "conversationId": 10,
  "content": "Is the property still available?"
}
```

### Get Unread Count

```http
GET /api/messages/unread-count
Authorization: Bearer <token>
```

---

## Saved Items

### Save Property

```http
POST /api/saved/properties/{propertyId}
Authorization: Bearer <token>
```

### Get Saved Properties

```http
GET /api/saved/properties
Authorization: Bearer <token>
```

### Remove Saved Property

```http
DELETE /api/saved/properties/{propertyId}
Authorization: Bearer <token>
```

---

## Notifications

### Get Notifications

```http
GET /api/notifications?unreadOnly=true&page=0
Authorization: Bearer <token>
```

### Mark All as Read

```http
POST /api/notifications/mark-all-read
Authorization: Bearer <token>
```

---

## Profile

### Get My Profile

```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Update Profile

```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+8801712345678",
  "bio": "Software developer looking for housing"
}
```
