# AWS Production Deployment Guide

## 🏗 Architecture
StayMate deploys to a single AWS EC2 instance (t3.medium or larger recommended) using Docker Compose. A managed RDS instance (MySQL) is optional but recommended; this guide assumes containerized MySQL for simplicity.

**Components:**
1.  **Nginx**: Reverse proxy, SSL termination, static file serving.
2.  **Frontend**: Next.js (SSR) on port 3000.
3.  **Backend**: Spring Boot API on port 8080.
4.  **MinIO**: Object storage for images/files.
5.  **MySQL**: Database (Persistent Volume).

**Domain**: `staymate.puspo.online`

---

## 📋 Prerequisites
- AWS EC2 Instance (Ubuntu 22.04 LTS)
- Elastic IP attached
- Domain A Records pointing to Elastic IP:
    - `@` -> `X.X.X.X`
    - `www` -> `X.X.X.X`
    - `api` -> `X.X.X.X` (if using subdomain for backend, though current setup proxies `/api`)

---

## 🚀 Deployment Steps

### 1. Clone & Prepare
SSH into your instance:
```bash
ssh -i key.pem ubuntu@staymate.puspo.online
git clone https://github.com/your-repo/staymate.git
cd staymate
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory. **CRITICAL**: Change all secrets.

```bash
cat <<EOF > .env
# --- Database ---
DB_NAME=staymate_prod
DB_USERNAME=admin_prod
DB_PASSWORD=YOUR_STRONG_DB_PASSWORD
DB_HOST=db

# --- Security ---
JWT_SECRET=YOUR_VERY_LONG_RANDOM_BASE64_STRING
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=admin123
ADMIN_SECRET_KEY=YOUR_ADMIN_SECRET_KEY_FOR_SUDO

# --- MinIO (Object Storage) ---
MINIO_ACCESS_KEY=YOUR_MINIO_ACCESS_KEY
MINIO_SECRET_KEY=YOUR_MINIO_SECRET_KEY
MINIO_BUCKET_NAME=staymate-uploads
# PUBLIC URL IS CRITICAL FOR IMAGES TO LOAD IN BROWSER
MINIO_PUBLIC_URL=https://api.staymate.puspo.online/files

# --- Google OAuth (Optional) ---
GOOGLE_CLIENT_ID=disabled
GOOGLE_CLIENT_SECRET=disabled

# --- App Config ---
NEXT_PUBLIC_API_URL=https://api.staymate.puspo.online
CORS_ALLOWED_ORIGINS=https://staymate.puspo.online
Spring_PROFILES_ACTIVE=prod
EOF
```

### 3. Build & Deploy
Use the AWS-specific compose file:

```bash
# Build images
docker-compose -f docker-compose.aws.yml build

# Start services
docker-compose -f docker-compose.aws.yml up -d
```

### 4. Verify Deployment
Check health status:
```bash
# Backend Health
curl localhost:8080/actuator/health

# Frontend Local Check
curl localhost:3000
```

---

## 🔄 Updates & Maintenance

### Deploying New Code
```bash
git pull origin main
docker-compose -f docker-compose.aws.yml build
docker-compose -f docker-compose.aws.yml up -d --no-deps frontend server
```

### Viewing Logs
```bash
docker-compose -f docker-compose.aws.yml logs -f --tail=100 server
```

### Database Backups
```bash
docker exec staymate-db-prod mysqldump -u admin_prod -pYOUR_PASSWORD staymate_prod > backup_$(date +%F).sql
```
