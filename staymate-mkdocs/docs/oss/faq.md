# FAQ

Frequently asked questions about StayMate.

---

## General

### What is StayMate?

StayMate is an enterprise-grade property rental and roommate matching platform built with Spring Boot.

### What technologies does it use?

- **Backend**: Spring Boot 3.x, Java 17
- **Database**: MySQL 8.0
- **Auth**: JWT + OAuth2 (Google)
- **Storage**: MinIO (S3-compatible)

---

## Development

### How do I run locally?

```bash
cd server
./mvnw spring-boot:run
```

### How do I run tests?

```bash
./mvnw test
```

### How do I generate docs?

```bash
cd staymate-mkdocs
mkdocs serve
```

---

## API

### How do I authenticate?

Use the login endpoint to get a JWT token:

```http
POST /api/auth/login
Content-Type: application/json

{"email": "user@example.com", "password": "secret"}
```

### What are the user roles?

- `USER` - Tenants
- `HOUSE_OWNER` - Landlords
- `ADMIN` - Platform administrators

---

## Troubleshooting

### Why am I getting 401?

Your JWT token may be expired. Refresh it using:

```http
POST /api/auth/refresh-token
{"refreshToken": "your-refresh-token"}
```

### Why am I getting 429?

You've exceeded the rate limit (200 requests/minute). Wait and retry.
