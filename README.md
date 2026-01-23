# StayMate - Modern Housing Marketplace
> Connect with verified landlords and compatible roommates. A safer, smarter way to rent.

## 🚀 Overview
StayMate is a full-stack housing platform built for performance, security, and scalability. It supports atomic bookings, real-time chat, and fraud detection.

**Tech Stack:**
- **Backend**: Spring Boot 3 + Hibernate + MySQL 8
- **Frontend**: Next.js 14 + TailwindCSS + TypeScript
- **Storage**: MinIO (S3 Compatible)
- **DevOps**: Docker, Nginx, AWS EC2 ready

---

## 💻 Local Development Setup

### Prerequisites
- Docker & Docker Compose
- Java 17+ (for local IDE dev)
- Node.js 18+ (for local frontend dev)

### Quick Start (Full Stack via Docker)
Run the entire stack (DB, MinIO, Backend, Frontend) with one command:
```bash
docker-compose up -d --build
```
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8080](http://localhost:8080)
- **MinIO Console**: [http://localhost:9006](http://localhost:9006) (User/Pass: `minioadmin`/`minioadmin`)

### Hybrid Development (Run Services in Docker, Apps Locally)
1. **Start Infrastructure (MySQL + MinIO)**:
   ```bash
   docker-compose up -d mysql-db minio
   ```
2. **Run Backend** (Server):
   ```bash
   cd server
   ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
   ```
3. **Run Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 🌍 Production Architecture
See [DEPLOYMENT.md](DEPLOYMENT.md) for the complete AWS deployment guide.

StayMate is designed to run on AWS EC2 using `docker-compose.aws.yml`.
- **Domain**: `staymate.puspo.online`
- **Reverse Proxy**: Nginx handles SSL and routing.
- **Security**: All secrets are managed via Environment Variables.

---

## 🚦 Load Testing
Located in `staymate-load-test/`.
Uses **Locust** to simulate realistic user traffic.

```bash
cd staymate-load-test
# Install dependencies
pip install locust
# Run test against local
locust -f locustfile.py --host=http://localhost:8080
```
