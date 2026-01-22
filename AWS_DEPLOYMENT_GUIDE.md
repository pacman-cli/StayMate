# StayMate AWS Deployment Guide

> **Domain:** `staymate.puspo.online`
> **Stack:** Spring Boot 3.2 + Next.js 14 + MySQL 8 + Docker
> **Version:** 1.0 | January 2026

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites](#2-prerequisites)
3. [AWS Infrastructure Setup](#3-aws-infrastructure-setup)
4. [Cloudflare Configuration](#4-cloudflare-configuration)
5. [EC2 Instance Setup](#5-ec2-instance-setup)
6. [Docker Deployment](#6-docker-deployment)
7. [Nginx Reverse Proxy](#7-nginx-reverse-proxy)
8. [Cloudflare Tunnel Setup](#8-cloudflare-tunnel-setup)
9. [Auto Scaling Configuration](#9-auto-scaling-configuration)
10. [RDS MySQL Setup (Optional)](#10-rds-mysql-setup-optional)
11. [Monitoring & Logging](#11-monitoring--logging)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Architecture Overview

```
                                    ┌──────────────────────────────────────┐
                                    │           Cloudflare                  │
                                    │  • DNS Management (puspo.online)     │
                                    │  • CDN & Caching                      │
                                    │  • DDoS Protection                    │
                                    │  • SSL/TLS Termination                │
                                    └─────────────┬────────────────────────┘
                                                  │ HTTPS
                                                  ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              AWS VPC (10.0.0.0/16)                                       │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐   │
│  │                         Application Load Balancer (ALB)                           │   │
│  │                         staymate-alb.us-east-1.elb.amazonaws.com                  │   │
│  └──────────────────────────────┬───────────────────────────────────────────────────┘   │
│                                 │                                                        │
│         ┌───────────────────────┼───────────────────────────┐                           │
│         ▼                       ▼                           ▼                           │
│  ┌─────────────┐         ┌─────────────┐            ┌─────────────┐                     │
│  │   EC2-1     │         │   EC2-2     │            │   EC2-N     │  ← Auto Scaling     │
│  │ ┌─────────┐ │         │ ┌─────────┐ │            │ ┌─────────┐ │    Group            │
│  │ │ Docker  │ │         │ │ Docker  │ │            │ │ Docker  │ │                     │
│  │ │┌───────┐│ │         │ │┌───────┐│ │            │ │┌───────┐│ │                     │
│  │ ││Backend││ │         │ ││Backend││ │            │ ││Backend││ │                     │
│  │ ││:8080  ││ │         │ ││:8080  ││ │            │ ││:8080  ││ │                     │
│  │ │└───────┘│ │         │ │└───────┘│ │            │ │└───────┘│ │                     │
│  │ │┌───────┐│ │         │ │┌───────┐│ │            │ │┌───────┐│ │                     │
│  │ ││Frontend│ │         │ ││Frontend│ │            │ ││Frontend│ │                     │
│  │ ││:3000  ││ │         │ ││:3000  ││ │            │ ││:3000  ││ │                     │
│  │ │└───────┘│ │         │ │└───────┘│ │            │ │└───────┘│ │                     │
│  │ │┌───────┐│ │         │ │┌───────┐│ │            │ │┌───────┐│ │                     │
│  │ ││ Nginx ││ │         │ ││ Nginx ││ │            │ ││ Nginx ││ │                     │
│  │ ││:80    ││ │         │ ││:80    ││ │            │ ││:80    ││ │                     │
│  │ │└───────┘│ │         │ │└───────┘│ │            │ │└───────┘│ │                     │
│  │ └─────────┘ │         │ └─────────┘ │            │ └─────────┘ │                     │
│  └─────────────┘         └─────────────┘            └─────────────┘                     │
│                                                                                          │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐   │
│  │                           RDS MySQL (Private Subnet)                              │   │
│  │                           staymate-db.xxxxxx.us-east-1.rds.amazonaws.com          │   │
│  └──────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Prerequisites

### 2.1 Required Accounts

| Service | Purpose | Free Tier Available |
|---------|---------|---------------------|
| **AWS Account** | Cloud infrastructure | ✅ 12 months |
| **Cloudflare Account** | DNS & CDN | ✅ Free plan |
| **Domain** | `puspo.online` | Already owned |

### 2.2 Local Tools Required

```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /

# Verify installation
aws --version

# Configure AWS CLI
aws configure
# Enter: AWS Access Key ID, Secret Access Key, Region (e.g., us-east-1), Output format (json)
```

### 2.3 Project Files Checklist

Ensure these files exist in your StayMate project:

- [x] `docker-compose.prod.yml` - Production Docker configuration
- [x] `server/Dockerfile` - Backend Dockerfile
- [x] `frontend/Dockerfile` - Frontend Dockerfile
- [x] `.env.prod.example` - Environment variables template

---

## 3. AWS Infrastructure Setup

### 3.1 Create VPC

```bash
# Create VPC
aws ec2 create-vpc \
    --cidr-block 10.0.0.0/16 \
    --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=staymate-vpc}]'

# Note the VpcId from output (e.g., vpc-0123456789abcdef0)
```

### 3.2 Create Subnets

```bash
# Public Subnet 1 (us-east-1a)
aws ec2 create-subnet \
    --vpc-id vpc-XXXXXXXX \
    --cidr-block 10.0.1.0/24 \
    --availability-zone us-east-1a \
    --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=staymate-public-1a}]'

# Public Subnet 2 (us-east-1b)
aws ec2 create-subnet \
    --vpc-id vpc-XXXXXXXX \
    --cidr-block 10.0.2.0/24 \
    --availability-zone us-east-1b \
    --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=staymate-public-1b}]'

# Private Subnet for RDS (us-east-1a)
aws ec2 create-subnet \
    --vpc-id vpc-XXXXXXXX \
    --cidr-block 10.0.10.0/24 \
    --availability-zone us-east-1a \
    --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=staymate-private-1a}]'

# Private Subnet for RDS (us-east-1b)
aws ec2 create-subnet \
    --vpc-id vpc-XXXXXXXX \
    --cidr-block 10.0.11.0/24 \
    --availability-zone us-east-1b \
    --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=staymate-private-1b}]'
```

### 3.3 Create Internet Gateway

```bash
# Create Internet Gateway
aws ec2 create-internet-gateway \
    --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=staymate-igw}]'

# Attach to VPC
aws ec2 attach-internet-gateway \
    --vpc-id vpc-XXXXXXXX \
    --internet-gateway-id igw-XXXXXXXX
```

### 3.4 Create Route Table

```bash
# Create Route Table
aws ec2 create-route-table \
    --vpc-id vpc-XXXXXXXX \
    --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=staymate-public-rt}]'

# Add Internet Route
aws ec2 create-route \
    --route-table-id rtb-XXXXXXXX \
    --destination-cidr-block 0.0.0.0/0 \
    --gateway-id igw-XXXXXXXX

# Associate with Public Subnets
aws ec2 associate-route-table --subnet-id subnet-PUBLIC1 --route-table-id rtb-XXXXXXXX
aws ec2 associate-route-table --subnet-id subnet-PUBLIC2 --route-table-id rtb-XXXXXXXX
```

### 3.5 Create Security Groups

```bash
# Application Security Group
aws ec2 create-security-group \
    --group-name staymate-app-sg \
    --description "Security group for StayMate application" \
    --vpc-id vpc-XXXXXXXX

# Add Inbound Rules
aws ec2 authorize-security-group-ingress \
    --group-id sg-APP-XXXXXXXX \
    --protocol tcp --port 22 --cidr 0.0.0.0/0    # SSH (restrict to your IP in production)

aws ec2 authorize-security-group-ingress \
    --group-id sg-APP-XXXXXXXX \
    --protocol tcp --port 80 --cidr 0.0.0.0/0    # HTTP

aws ec2 authorize-security-group-ingress \
    --group-id sg-APP-XXXXXXXX \
    --protocol tcp --port 443 --cidr 0.0.0.0/0   # HTTPS

aws ec2 authorize-security-group-ingress \
    --group-id sg-APP-XXXXXXXX \
    --protocol tcp --port 8080 --cidr 10.0.0.0/16  # Backend (internal only)

aws ec2 authorize-security-group-ingress \
    --group-id sg-APP-XXXXXXXX \
    --protocol tcp --port 3000 --cidr 10.0.0.0/16  # Frontend (internal only)

# Database Security Group
aws ec2 create-security-group \
    --group-name staymate-db-sg \
    --description "Security group for StayMate database" \
    --vpc-id vpc-XXXXXXXX

aws ec2 authorize-security-group-ingress \
    --group-id sg-DB-XXXXXXXX \
    --protocol tcp --port 3306 --source-group sg-APP-XXXXXXXX  # MySQL from App SG only
```

---

## 4. Cloudflare Configuration

### 4.1 Add Domain to Cloudflare

1. **Login to Cloudflare Dashboard:** https://dash.cloudflare.com
2. **Add Site:** Click "Add a Site" → Enter `puspo.online`
3. **Select Plan:** Choose "Free" plan
4. **Update Nameservers:** Update nameservers at your domain registrar to:
   ```
   ns1.cloudflare.com
   ns2.cloudflare.com
   ```

### 4.2 Configure DNS Records

Navigate to **DNS → Records** and add:

| Type | Name | Content | Proxy Status | TTL |
|------|------|---------|--------------|-----|
| A | staymate | `<EC2_PUBLIC_IP>` | Proxied (orange) | Auto |
| CNAME | www.staymate | staymate.puspo.online | Proxied (orange) | Auto |

> **Note:** Replace `<EC2_PUBLIC_IP>` with your actual EC2 instance IP after launching.

### 4.3 SSL/TLS Configuration

Navigate to **SSL/TLS → Overview**:

1. **Encryption Mode:** Select `Full (strict)`
2. **Edge Certificates:** Enable "Always Use HTTPS"
3. **Minimum TLS Version:** TLS 1.2

Navigate to **SSL/TLS → Edge Certificates**:

1. **Always Use HTTPS:** ON
2. **Automatic HTTPS Rewrites:** ON
3. **HTTP Strict Transport Security (HSTS):** Enable with:
   - Max Age: 6 months
   - Include subdomains: Yes
   - Preload: Yes

### 4.4 Caching Configuration

Navigate to **Caching → Configuration**:

1. **Caching Level:** Standard
2. **Browser Cache TTL:** 4 hours
3. **Always Online:** ON

Navigate to **Rules → Page Rules** and create:

| URL Pattern | Setting |
|-------------|---------|
| `staymate.puspo.online/api/*` | Cache Level: Bypass |
| `staymate.puspo.online/_next/static/*` | Cache Level: Cache Everything, Edge Cache TTL: 1 month |

### 4.5 Security Settings

Navigate to **Security → Settings**:

1. **Security Level:** Medium
2. **Challenge Passage:** 30 minutes
3. **Browser Integrity Check:** ON

Navigate to **Security → WAF**:

1. Enable **Managed Rulesets**
2. Enable **OWASP Core Ruleset**

---

## 5. EC2 Instance Setup

### 5.1 Create Key Pair

```bash
aws ec2 create-key-pair \
    --key-name staymate-key \
    --query 'KeyMaterial' \
    --output text > ~/.ssh/staymate-key.pem

chmod 400 ~/.ssh/staymate-key.pem
```

### 5.2 Launch EC2 Instance

```bash
# Launch t3.medium instance (recommended minimum)
aws ec2 run-instances \
    --image-id ami-0c7217cdde317cfec \
    --instance-type t3.medium \
    --key-name staymate-key \
    --security-group-ids sg-APP-XXXXXXXX \
    --subnet-id subnet-PUBLIC1 \
    --associate-public-ip-address \
    --block-device-mappings '[{"DeviceName":"/dev/xvda","Ebs":{"VolumeSize":30,"VolumeType":"gp3"}}]' \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=staymate-server}]' \
    --user-data file://user-data.sh
```

### 5.3 User Data Script (user-data.sh)

Create this file before launching:

```bash
#!/bin/bash
set -e

# Update system
yum update -y

# Install Docker
yum install -y docker
systemctl start docker
systemctl enable docker
usermod -aG docker ec2-user

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Nginx
amazon-linux-extras install nginx1 -y
systemctl start nginx
systemctl enable nginx

# Install Git
yum install -y git

# Create app directory
mkdir -p /opt/staymate
chown ec2-user:ec2-user /opt/staymate

echo "StayMate server initialization complete!"
```

### 5.4 Connect to EC2

```bash
# Get public IP
aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=staymate-server" \
    --query "Reservations[*].Instances[*].PublicIpAddress" \
    --output text

# SSH into instance
ssh -i ~/.ssh/staymate-key.pem ec2-user@<EC2_PUBLIC_IP>
```

---

## 6. Docker Deployment

### 6.1 Clone Repository on EC2

```bash
cd /opt/staymate
git clone https://github.com/YOUR_USERNAME/StayMate.git .
```

### 6.2 Create Production Environment File

```bash
cat > .env << 'EOF'
# ==============================================
# StayMate Production Environment Variables
# ==============================================

# Database Configuration
DB_HOST=db
DB_PORT=3306
DB_NAME=staymate_prod
DB_USERNAME=staymate_user
DB_PASSWORD=YOUR_SECURE_DB_PASSWORD_HERE

# Security & Auth
JWT_SECRET=YOUR_64_CHAR_JWT_SECRET_HERE
JWT_EXPIRATION_MS=900000
JWT_REFRESH_EXPIRATION_MS=604800000

# OAuth2 (Google)
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET

# Admin Configuration
ADMIN_EMAIL=admin@staymate.puspo.online
ADMIN_PASSWORD=YOUR_ADMIN_PASSWORD_HERE
ADMIN_SECRET_KEY=YOUR_ADMIN_SECRET_KEY

# CORS & Server
CORS_ALLOWED_ORIGINS=https://staymate.puspo.online
SERVER_PORT=8080

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS_PER_MINUTE=60

# Frontend
NEXT_PUBLIC_API_URL=https://staymate.puspo.online
BACKEND_URL=http://server:8080
EOF
```

> ⚠️ **Security:** Generate secure passwords using:
> ```bash
> # Generate JWT Secret
> openssl rand -base64 64
>
> # Generate DB Password
> openssl rand -base64 32
> ```

### 6.3 Create Production Docker Compose

Create `docker-compose.aws.yml`:

```yaml
services:
  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: staymate-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
    depends_on:
      - frontend
      - server
    networks:
      - staymate-net
    healthcheck:
      test: ["CMD", "nginx", "-t"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend Service
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    image: staymate-frontend:prod
    container_name: staymate-frontend-prod
    restart: always
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
      - BACKEND_URL=${BACKEND_URL}
    expose:
      - "3000"
    depends_on:
      server:
        condition: service_healthy
    networks:
      - staymate-net
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

  # Backend Service
  server:
    build:
      context: ./server
      dockerfile: Dockerfile
    image: staymate-server:prod
    container_name: staymate-backend-prod
    restart: always
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DB_HOST=${DB_HOST}
      - DB_PORT=${DB_PORT}
      - DB_NAME=${DB_NAME}
      - DB_USERNAME=${DB_USERNAME}
      - DB_PASSWORD=${DB_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRATION_MS=${JWT_EXPIRATION_MS}
      - JWT_REFRESH_EXPIRATION_MS=${JWT_REFRESH_EXPIRATION_MS}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - ADMIN_EMAIL=${ADMIN_EMAIL}
      - ADMIN_PASSWORD=${ADMIN_PASSWORD}
      - ADMIN_SECRET_KEY=${ADMIN_SECRET_KEY}
      - CORS_ALLOWED_ORIGINS=${CORS_ALLOWED_ORIGINS}
      - RATE_LIMIT_ENABLED=${RATE_LIMIT_ENABLED}
      - RATE_LIMIT_REQUESTS_PER_MINUTE=${RATE_LIMIT_REQUESTS_PER_MINUTE}
    expose:
      - "8080"
    depends_on:
      db:
        condition: service_healthy
    networks:
      - staymate-net
    volumes:
      - uploads:/app/uploads
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.25'
          memory: 256M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  # Database Service
  db:
    image: mysql:8.0
    container_name: staymate-db-prod
    restart: always
    environment:
      - MYSQL_DATABASE=${DB_NAME}
      - MYSQL_USER=${DB_USERNAME}
      - MYSQL_PASSWORD=${DB_PASSWORD}
      - MYSQL_ROOT_PASSWORD=${DB_PASSWORD}
    volumes:
      - db_data:/var/lib/mysql
    networks:
      - staymate-net
    command: --default-authentication-plugin=mysql_native_password
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G

networks:
  staymate-net:
    driver: bridge

volumes:
  db_data:
  uploads:
```

### 6.4 Build and Deploy

```bash
# Build images
docker-compose -f docker-compose.aws.yml build

# Start services
docker-compose -f docker-compose.aws.yml up -d

# Check status
docker-compose -f docker-compose.aws.yml ps

# View logs
docker-compose -f docker-compose.aws.yml logs -f
```

---

## 7. Nginx Reverse Proxy

### 7.1 Create Nginx Configuration Directory

```bash
mkdir -p /opt/staymate/nginx/conf.d
```

### 7.2 Main Nginx Configuration

Create `/opt/staymate/nginx/nginx.conf`:

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript
               application/rss+xml application/atom+xml image/svg+xml;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_conn_zone $binary_remote_addr zone=conn_limit:10m;

    # Upstream Backends
    upstream frontend {
        server frontend:3000;
        keepalive 32;
    }

    upstream backend {
        server server:8080;
        keepalive 32;
    }

    include /etc/nginx/conf.d/*.conf;
}
```

### 7.3 Site Configuration

Create `/opt/staymate/nginx/conf.d/staymate.conf`:

```nginx
server {
    listen 80;
    server_name staymate.puspo.online www.staymate.puspo.online;

    # Cloudflare Real IP
    set_real_ip_from 103.21.244.0/22;
    set_real_ip_from 103.22.200.0/22;
    set_real_ip_from 103.31.4.0/22;
    set_real_ip_from 104.16.0.0/13;
    set_real_ip_from 104.24.0.0/14;
    set_real_ip_from 108.162.192.0/18;
    set_real_ip_from 131.0.72.0/22;
    set_real_ip_from 141.101.64.0/18;
    set_real_ip_from 162.158.0.0/15;
    set_real_ip_from 172.64.0.0/13;
    set_real_ip_from 173.245.48.0/20;
    set_real_ip_from 188.114.96.0/20;
    set_real_ip_from 190.93.240.0/20;
    set_real_ip_from 197.234.240.0/22;
    set_real_ip_from 198.41.128.0/17;
    real_ip_header CF-Connecting-IP;

    # Client body size (for file uploads)
    client_max_body_size 50M;

    # Health check endpoint
    location /health {
        return 200 'OK';
        add_header Content-Type text/plain;
    }

    # API Routes → Backend
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;

        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Buffering
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }

    # WebSocket Routes
    location /ws/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket timeouts
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }

    # OAuth2 Routes
    location /oauth2/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /login/oauth2/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Actuator (health checks only)
    location /actuator/health {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }

    # Swagger/OpenAPI Documentation
    location /swagger-ui/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    location /v3/api-docs {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Static assets (Next.js)
    location /_next/static/ {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # All other routes → Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
    }
}
```

### 7.4 Reload Nginx

```bash
# Test configuration
docker exec staymate-nginx nginx -t

# Reload if valid
docker exec staymate-nginx nginx -s reload
```

---

## 8. Cloudflare Tunnel Setup

> Cloudflare Tunnel provides secure, encrypted tunnels directly to your origin server without exposing your public IP. This is an alternative to exposing port 80/443 directly.

### 8.1 Install Cloudflared

```bash
# On EC2 instance
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb
```

### 8.2 Authenticate Cloudflared

```bash
cloudflared tunnel login
# This opens a browser URL - authenticate with your Cloudflare account
```

### 8.3 Create Tunnel

```bash
# Create tunnel
cloudflared tunnel create staymate-tunnel

# Note the Tunnel ID from output
# Example: Created tunnel staymate-tunnel with id a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

### 8.4 Configure Tunnel

Create `/etc/cloudflared/config.yml`:

```yaml
tunnel: staymate-tunnel
credentials-file: /root/.cloudflared/<TUNNEL_ID>.json

ingress:
  # API Routes
  - hostname: staymate.puspo.online
    path: /api/*
    service: http://localhost:80

  # WebSocket
  - hostname: staymate.puspo.online
    path: /ws/*
    service: http://localhost:80
    originRequest:
      noTLSVerify: true

  # All other traffic
  - hostname: staymate.puspo.online
    service: http://localhost:80

  # Catch-all
  - service: http_status:404
```

### 8.5 Create DNS Route

```bash
cloudflared tunnel route dns staymate-tunnel staymate.puspo.online
```

### 8.6 Run Tunnel as Service

```bash
# Install as systemd service
sudo cloudflared service install

# Start service
sudo systemctl start cloudflared
sudo systemctl enable cloudflared

# Check status
sudo systemctl status cloudflared
```

---

## 9. Auto Scaling Configuration

### 9.1 Create Launch Template

```bash
# Create launch template
aws ec2 create-launch-template \
    --launch-template-name staymate-lt \
    --version-description "StayMate v1.0" \
    --launch-template-data '{
        "ImageId": "ami-0c7217cdde317cfec",
        "InstanceType": "t3.medium",
        "KeyName": "staymate-key",
        "SecurityGroupIds": ["sg-APP-XXXXXXXX"],
        "UserData": "'$(base64 -w0 user-data.sh)'"
    }'
```

### 9.2 Create Auto Scaling Group

```bash
aws autoscaling create-auto-scaling-group \
    --auto-scaling-group-name staymate-asg \
    --launch-template LaunchTemplateName=staymate-lt,Version='$Latest' \
    --min-size 1 \
    --max-size 5 \
    --desired-capacity 2 \
    --vpc-zone-identifier "subnet-PUBLIC1,subnet-PUBLIC2" \
    --health-check-type ELB \
    --health-check-grace-period 300 \
    --tags Key=Name,Value=staymate-asg-instance,PropagateAtLaunch=true
```

### 9.3 Create Application Load Balancer

```bash
# Create ALB
aws elbv2 create-load-balancer \
    --name staymate-alb \
    --subnets subnet-PUBLIC1 subnet-PUBLIC2 \
    --security-groups sg-APP-XXXXXXXX \
    --type application \
    --scheme internet-facing

# Create Target Group
aws elbv2 create-target-group \
    --name staymate-tg \
    --protocol HTTP \
    --port 80 \
    --vpc-id vpc-XXXXXXXX \
    --health-check-path /health \
    --health-check-interval-seconds 30 \
    --health-check-timeout-seconds 5 \
    --healthy-threshold-count 2 \
    --unhealthy-threshold-count 3 \
    --target-type instance

# Create Listener
aws elbv2 create-listener \
    --load-balancer-arn arn:aws:elasticloadbalancing:REGION:ACCOUNT:loadbalancer/app/staymate-alb/XXXXX \
    --protocol HTTP \
    --port 80 \
    --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:REGION:ACCOUNT:targetgroup/staymate-tg/XXXXX
```

### 9.4 Attach Auto Scaling Group to Target Group

```bash
aws autoscaling attach-load-balancer-target-groups \
    --auto-scaling-group-name staymate-asg \
    --target-group-arns arn:aws:elasticloadbalancing:REGION:ACCOUNT:targetgroup/staymate-tg/XXXXX
```

### 9.5 Create Scaling Policies

```bash
# Scale Out Policy (add instances)
aws autoscaling put-scaling-policy \
    --auto-scaling-group-name staymate-asg \
    --policy-name staymate-scale-out \
    --policy-type TargetTrackingScaling \
    --target-tracking-configuration '{
        "TargetValue": 70.0,
        "PredefinedMetricSpecification": {
            "PredefinedMetricType": "ASGAverageCPUUtilization"
        },
        "ScaleOutCooldown": 300,
        "ScaleInCooldown": 300
    }'

# Scale based on request count
aws autoscaling put-scaling-policy \
    --auto-scaling-group-name staymate-asg \
    --policy-name staymate-scale-requests \
    --policy-type TargetTrackingScaling \
    --target-tracking-configuration '{
        "TargetValue": 1000.0,
        "PredefinedMetricSpecification": {
            "PredefinedMetricType": "ALBRequestCountPerTarget",
            "ResourceLabel": "app/staymate-alb/XXXXX/targetgroup/staymate-tg/XXXXX"
        }
    }'
```

### 9.6 Update Cloudflare DNS for ALB

Navigate to **Cloudflare → DNS** and update:

| Type | Name | Content | Proxy Status |
|------|------|---------|--------------|
| CNAME | staymate | staymate-alb.us-east-1.elb.amazonaws.com | Proxied (orange) |

---

## 10. RDS MySQL Setup (Optional)

> Use RDS instead of containerized MySQL for production-grade database with automated backups and high availability.

### 10.1 Create DB Subnet Group

```bash
aws rds create-db-subnet-group \
    --db-subnet-group-name staymate-db-subnet \
    --db-subnet-group-description "StayMate DB Subnet Group" \
    --subnet-ids subnet-PRIVATE1 subnet-PRIVATE2
```

### 10.2 Create RDS Instance

```bash
aws rds create-db-instance \
    --db-instance-identifier staymate-db \
    --db-instance-class db.t3.medium \
    --engine mysql \
    --engine-version 8.0 \
    --master-username staymate_admin \
    --master-user-password YOUR_STRONG_PASSWORD \
    --allocated-storage 20 \
    --storage-type gp3 \
    --vpc-security-group-ids sg-DB-XXXXXXXX \
    --db-subnet-group-name staymate-db-subnet \
    --db-name staymate_prod \
    --backup-retention-period 7 \
    --multi-az \
    --storage-encrypted \
    --publicly-accessible false
```

### 10.3 Update Environment Variables

Update `.env` with RDS endpoint:

```bash
DB_HOST=staymate-db.xxxxxx.us-east-1.rds.amazonaws.com
DB_PORT=3306
DB_NAME=staymate_prod
DB_USERNAME=staymate_admin
DB_PASSWORD=YOUR_RDS_PASSWORD
```

### 10.4 Remove Docker MySQL Service

When using RDS, remove the `db` service from `docker-compose.aws.yml` and update the `server` service to remove `depends_on: db`.

---

## 11. Monitoring & Logging

### 11.1 CloudWatch Agent Setup

```bash
# Install CloudWatch agent
sudo yum install amazon-cloudwatch-agent -y

# Configure agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard
```

### 11.2 Docker Container Metrics

Add to `/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json`:

```json
{
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/opt/staymate/logs/*.log",
            "log_group_name": "staymate-app-logs",
            "log_stream_name": "{instance_id}",
            "retention_in_days": 30
          }
        ]
      }
    }
  },
  "metrics": {
    "namespace": "StayMate",
    "metrics_collected": {
      "cpu": {
        "resources": ["*"],
        "measurement": ["cpu_usage_idle", "cpu_usage_user", "cpu_usage_system"]
      },
      "mem": {
        "measurement": ["mem_used_percent"]
      },
      "disk": {
        "resources": ["/"],
        "measurement": ["disk_used_percent"]
      }
    }
  }
}
```

### 11.3 Create CloudWatch Alarms

```bash
# High CPU Alarm
aws cloudwatch put-metric-alarm \
    --alarm-name staymate-high-cpu \
    --alarm-description "Alarm when CPU exceeds 80%" \
    --metric-name CPUUtilization \
    --namespace AWS/EC2 \
    --statistic Average \
    --period 300 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold \
    --dimensions Name=AutoScalingGroupName,Value=staymate-asg \
    --evaluation-periods 2 \
    --alarm-actions arn:aws:sns:REGION:ACCOUNT:staymate-alerts

# Database Connection Alarm
aws cloudwatch put-metric-alarm \
    --alarm-name staymate-db-connections \
    --alarm-description "Alarm when DB connections exceed 80%" \
    --metric-name DatabaseConnections \
    --namespace AWS/RDS \
    --statistic Average \
    --period 300 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold \
    --dimensions Name=DBInstanceIdentifier,Value=staymate-db \
    --evaluation-periods 2
```

---

## 12. Troubleshooting

### 12.1 Common Issues

| Issue | Solution |
|-------|----------|
| **502 Bad Gateway** | Check if backend is healthy: `docker logs staymate-backend-prod` |
| **Database connection failed** | Verify security group allows MySQL port from app SG |
| **Cloudflare 522 Error** | Origin server not reachable - check EC2 security group |
| **Static assets not loading** | Check Next.js build and Nginx static asset config |
| **WebSocket connection failed** | Ensure Nginx WebSocket proxy headers are set |

### 12.2 Useful Commands

```bash
# Check all container status
docker-compose -f docker-compose.aws.yml ps

# View logs for specific service
docker logs staymate-backend-prod --tail 100 -f

# Test database connection
docker exec staymate-db-prod mysql -u staymate_user -p -e "SELECT 1"

# Test Nginx configuration
docker exec staymate-nginx nginx -t

# Check Cloudflare Tunnel status
cloudflared tunnel info staymate-tunnel

# Check Auto Scaling Group status
aws autoscaling describe-auto-scaling-groups --auto-scaling-group-names staymate-asg
```

### 12.3 Health Check Endpoints

| Endpoint | Purpose |
|----------|---------|
| `https://staymate.puspo.online/health` | Nginx health |
| `https://staymate.puspo.online/actuator/health` | Spring Boot health |
| `https://staymate.puspo.online/api/v1/health` | API health |

---

## Quick Start Checklist

- [ ] Create AWS account and configure CLI
- [ ] Create VPC with public/private subnets
- [ ] Set up security groups
- [ ] Launch EC2 instance
- [ ] Add domain to Cloudflare
- [ ] Configure DNS A record
- [ ] Deploy with Docker Compose
- [ ] Configure Nginx reverse proxy
- [ ] (Optional) Set up Cloudflare Tunnel
- [ ] (Optional) Configure Auto Scaling
- [ ] (Optional) Migrate to RDS
- [ ] Set up monitoring and alerts
- [ ] Test all endpoints

---

## Cost Estimation (Monthly)

| Resource | Configuration | Estimated Cost |
|----------|---------------|----------------|
| EC2 (t3.medium) | 1 instance, always on | ~$30 |
| RDS (db.t3.medium) | Multi-AZ | ~$70 |
| ALB | Per hour + LCU | ~$20 |
| Data Transfer | 100GB/month | ~$9 |
| EBS Storage | 30GB gp3 | ~$3 |
| **Cloudflare** | Free plan | **$0** |
| **Total (with RDS)** | | **~$132/month** |
| **Total (Docker MySQL)** | | **~$62/month** |

---

## Support

- **Documentation:** [StayMate MkDocs](https://staymate.puspo.online/docs)
- **Issues:** GitHub Issues
- **Contact:** admin@staymate.puspo.online

---

*Last Updated: January 2026*
*Guide Version: 1.0*
