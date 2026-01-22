# Authentication API

Authentication endpoints for login, registration, and token management.

---

## Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `POST` | `/api/auth/register` | Register new user | Public |
| `POST` | `/api/auth/login` | Login | Public |
| `POST` | `/api/auth/refresh-token` | Refresh JWT | Public |
| `GET` | `/api/auth/me` | Get current user | JWT |
| `POST` | `/api/auth/logout` | Logout | JWT |
| `POST` | `/api/auth/select-role` | Select user role | JWT |
| `GET` | `/api/auth/check-email` | Check email exists | Public |
| `GET` | `/api/auth/validate` | Validate token | JWT |

---

## Register

```http
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "tokenType": "Bearer",
  "expiresIn": 900000
}
```

---

## Login

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

---

## OAuth2 (Google)

```http
GET /oauth2/authorization/google
```

Redirects to Google for authentication, then returns to configured redirect URI.

---

See [JWT Lifecycle](../security/jwt-lifecycle.md) for token management details.
