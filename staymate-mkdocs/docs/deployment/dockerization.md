# Dockerization

Docker containerization for StayMate.

---

## Dockerfile

```dockerfile
# Build stage
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY pom.xml mvnw ./
COPY .mvn .mvn
RUN ./mvnw dependency:go-offline
COPY src src
RUN ./mvnw package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Non-root user
RUN addgroup -S spring && adduser -S spring -G spring
USER spring

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

## Docker Compose

```yaml
version: '3.8'
services:
  api:
    build: ./server
    ports:
      - "8080:8080"
    environment:
      - DB_HOST=mysql
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mysql
      - minio

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: staymate
      MYSQL_ROOT_PASSWORD: ${MYSQL_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql

  minio:
    image: minio/minio
    ports:
      - "9005:9000"
    command: server /data
    volumes:
      - minio_data:/data

volumes:
  mysql_data:
  minio_data:
```

---

## Commands

```bash
# Build
docker-compose build

# Run
docker-compose up -d

# Logs
docker-compose logs -f api

# Stop
docker-compose down
```
