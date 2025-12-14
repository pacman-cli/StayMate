# Makefile for Docker and development commands

.PHONY: help build up down logs clean mysql mysql-stop app app-stop all all-stop test dev

# Default target
help:
	@echo "Available commands:"
	@echo ""
	@echo "  Docker Commands:"
	@echo "    make mysql          - Start MySQL container only"
	@echo "    make mysql-stop     - Stop MySQL container"
	@echo "    make app            - Start MySQL + App containers"
	@echo "    make app-stop       - Stop all containers"
	@echo "    make all            - Start all services (MySQL + App + phpMyAdmin)"
	@echo "    make all-stop       - Stop all services"
	@echo "    make logs           - View logs from all containers"
	@echo "    make logs-app       - View logs from app container"
	@echo "    make logs-mysql     - View logs from MySQL container"
	@echo "    make clean          - Stop containers and remove volumes"
	@echo "    make build          - Build Docker images"
	@echo "    make rebuild        - Rebuild Docker images (no cache)"
	@echo ""
	@echo "  Development Commands:"
	@echo "    make dev            - Run app locally with H2 database"
	@echo "    make dev-mysql      - Run app locally with MySQL (requires MySQL container)"
	@echo "    make test           - Run tests"
	@echo "    make package        - Build JAR package"
	@echo ""
	@echo "  Database Commands:"
	@echo "    make db-shell       - Open MySQL shell"
	@echo "    make db-reset       - Reset database (WARNING: deletes all data)"
	@echo ""

# ==================== Docker Commands ====================

# Build Docker images
build:
	docker compose build

# Rebuild without cache
rebuild:
	docker compose build --no-cache

# Start MySQL only (default for local development)
mysql:
	docker compose up -d mysql
	@echo ""
	@echo "MySQL is starting..."
	@echo "  Host: localhost"
	@echo "  Port: 3306"
	@echo "  Database: authdb"
	@echo "  Username: authuser"
	@echo "  Password: authpassword"
	@echo ""
	@echo "Waiting for MySQL to be ready..."
	@sleep 5
	@docker compose ps mysql

# Stop MySQL
mysql-stop:
	docker compose stop mysql

# Start MySQL + App
app: build
	docker compose --profile app up -d
	@echo ""
	@echo "Application is starting..."
	@echo "  API: http://localhost:8080"
	@echo "  Health: http://localhost:8080/actuator/health"
	@echo ""

# Stop MySQL + App
app-stop:
	docker compose --profile app down

# Start all services (MySQL + App + phpMyAdmin)
all: build
	docker compose --profile app --profile tools up -d
	@echo ""
	@echo "All services are starting..."
	@echo "  API: http://localhost:8080"
	@echo "  phpMyAdmin: http://localhost:8081"
	@echo ""

# Stop all services
all-stop:
	docker compose --profile app --profile tools down

# Generic up/down
up: mysql

down:
	docker compose down

# View logs
logs:
	docker compose logs -f

logs-app:
	docker compose logs -f app

logs-mysql:
	docker compose logs -f mysql

# Clean up everything
clean:
	docker compose --profile app --profile tools down -v --remove-orphans
	@echo "Cleaned up all containers and volumes"

# ==================== Development Commands ====================

# Run locally with H2 (default development)
dev:
	./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Run locally with MySQL (requires MySQL container running)
dev-mysql: mysql
	@echo "Waiting for MySQL to be ready..."
	@sleep 10
	./mvnw spring-boot:run -Dspring-boot.run.profiles=mysql

# Run tests
test:
	./mvnw test

# Build JAR package
package:
	./mvnw clean package -DskipTests

# ==================== Database Commands ====================

# Open MySQL shell
db-shell:
	docker compose exec mysql mysql -u authuser -pauthpassword authdb

# Reset database (WARNING: deletes all data)
db-reset:
	@echo "WARNING: This will delete all data in the database!"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ] || exit 1
	docker compose down -v mysql
	docker compose up -d mysql
	@echo "Database has been reset"

# ==================== Utility Commands ====================

# Check status
status:
	docker compose ps

# Show running containers
ps:
	docker compose ps

# Prune unused Docker resources
prune:
	docker system prune -f
