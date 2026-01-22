# Error Contracts

Standard error response formats across the API.

---

## Error Response Structure

All errors follow this format:

```json
{
  "timestamp": "2024-01-21T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/properties",
  "errors": [...]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `timestamp` | ISO-8601 | When error occurred |
| `status` | integer | HTTP status code |
| `error` | string | HTTP status text |
| `message` | string | Human-readable message |
| `path` | string | Request path |
| `errors` | array | Validation errors (optional) |

---

## HTTP Status Codes

### Success

| Code | Meaning | When |
|------|---------|------|
| `200` | OK | GET, PUT, PATCH success |
| `201` | Created | POST success |
| `204` | No Content | DELETE success |

### Client Errors

| Code | Meaning | When |
|------|---------|------|
| `400` | Bad Request | Invalid input |
| `401` | Unauthorized | Missing/invalid token |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Duplicate resource |
| `422` | Unprocessable Entity | Business rule violation |
| `429` | Too Many Requests | Rate limit exceeded |

### Server Errors

| Code | Meaning | When |
|------|---------|------|
| `500` | Internal Server Error | Unexpected error |
| `503` | Service Unavailable | Maintenance |

---

## Error Examples

### Validation Error (400)

```json
{
  "timestamp": "2024-01-21T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/auth/register",
  "errors": [
    { "field": "email", "message": "must be a valid email" },
    { "field": "password", "message": "must be at least 8 characters" }
  ]
}
```

### Unauthorized (401)

```json
{
  "timestamp": "2024-01-21T10:30:00Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "JWT token is expired",
  "path": "/api/properties"
}
```

### Forbidden (403)

```json
{
  "timestamp": "2024-01-21T10:30:00Z",
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied: You don't have permission to modify this resource",
  "path": "/api/properties/123"
}
```

### Not Found (404)

```json
{
  "timestamp": "2024-01-21T10:30:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Property not found with id: 999",
  "path": "/api/properties/999"
}
```

### Conflict (409)

```json
{
  "timestamp": "2024-01-21T10:30:00Z",
  "status": 409,
  "error": "Conflict",
  "message": "User already exists with email: user@example.com",
  "path": "/api/auth/register"
}
```

### Rate Limited (429)

```json
{
  "timestamp": "2024-01-21T10:30:00Z",
  "status": 429,
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Try again later.",
  "path": "/api/auth/login"
}
```

---

## Client Handling

```typescript
async function apiRequest(url: string, options: RequestInit) {
  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.json();

    switch (response.status) {
      case 401:
        // Redirect to login or refresh token
        await refreshToken();
        return apiRequest(url, options);

      case 403:
        showError("You don't have access to this resource");
        break;

      case 404:
        showError("Resource not found");
        break;

      case 429:
        // Retry after delay
        await delay(60000);
        return apiRequest(url, options);

      default:
        showError(error.message);
    }

    throw new ApiError(error);
  }

  return response.json();
}
```
