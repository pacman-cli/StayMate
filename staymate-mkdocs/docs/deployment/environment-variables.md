# Environment Variables

Configuration via environment variables.

---

## Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_NAME` | Database name | `staymate` |
| `DB_USERNAME` | Database user | `staymate` |
| `DB_PASSWORD` | Database password | `secret` |
| `JWT_SECRET` | JWT signing key | `base64-key` |

---

## Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CORS_ALLOWED_ORIGINS` | `localhost:3000` | CORS origins |
| `RATE_LIMIT_ENABLED` | `true` | Enable rate limiting |
| `RATE_LIMIT_REQUESTS_PER_MINUTE` | `200` | Requests per minute |

---

## OAuth2 (Optional)

| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret |

---

## MinIO Storage

| Variable | Default |
|----------|---------|
| `MINIO_URL` | `http://localhost:9005` |
| `MINIO_ACCESS_KEY` | `minioadmin` |
| `MINIO_SECRET_KEY` | `minioadmin` |
| `MINIO_BUCKET_NAME` | `staymate-uploads` |

---

## Example .env

```bash
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=staymate
DB_USERNAME=root
DB_PASSWORD=secret

# Security
JWT_SECRET=your-256-bit-secret

# OAuth (optional)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
```

!!! danger "Security"
    Never commit `.env` files to version control.
