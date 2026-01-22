# Setup

This section provides everything you need to get StayMate running locally.

---

## Quick Start (TL;DR)

```bash
# 1. Prerequisites
java -version   # Java 17+
mvn -version    # Maven 3.8+
mysql --version # MySQL 8.0+

# 2. Start dependencies
docker-compose up -d  # Starts MinIO

# 3. Configure database
mysql -u root -p -e "CREATE DATABASE authdb;"

# 4. Run application
cd server
./mvnw spring-boot:run

# 5. Verify
curl http://localhost:8080/actuator/health
```

---

## In This Section

| Document | Description | Time |
|----------|-------------|------|
| [Prerequisites](prerequisites.md) | Required software | 5 min |
| [Local Setup](local-setup.md) | Step-by-step guide | 15 min |
| [Database Setup](database-setup.md) | MySQL configuration | 10 min |
| [Run & Debug](run-and-debug.md) | IDE and debugging | 10 min |
| [Common Errors](common-errors.md) | Troubleshooting | Reference |

---

## Onboarding Path

```mermaid
flowchart LR
    START([Start Here]) --> PREREQ[Prerequisites]
    PREREQ --> DB[Database Setup]
    DB --> LOCAL[Local Setup]
    LOCAL --> RUN[Run & Debug]
    RUN --> VERIFY{Working?}
    VERIFY -->|Yes| EXPLORE[Explore Docs]
    VERIFY -->|No| ERRORS[Common Errors]
    ERRORS --> RUN

    style START fill:#2ecc71
    style VERIFY fill:#f39c12
    style EXPLORE fill:#3498db
```
