# Deployment

Deployment architecture and configuration.

---

## Deployment Options

```mermaid
graph LR
    LOCAL[Local Dev] --> DOCKER[Docker]
    DOCKER --> CLOUD[Cloud Deploy]
```

---

## In This Section

| Document | Description |
|----------|-------------|
| [Environment Variables](environment-variables.md) | Configuration |
| [Dockerization](dockerization.md) | Container setup |
| [Architecture](architecture.md) | Deployment topology |
| [Rollback Strategy](rollback-strategy.md) | Recovery procedures |

---

## Quick Commands

```bash
# Local
./mvnw spring-boot:run

# Docker
docker-compose up -d

# Production
java -jar app.jar --spring.profiles.active=prod
```
