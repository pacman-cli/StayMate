#!/bin/bash
# =============================================================================
# StayMate AWS Deployment Script
# =============================================================================
# Usage: ./deploy-aws.sh [build|deploy|restart|logs|status|stop]
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.aws.yml"
PROJECT_NAME="staymate"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
check_env() {
    if [ ! -f .env ]; then
        log_error ".env file not found!"
        log_info "Copy .env.prod.example to .env and configure your variables:"
        log_info "  cp .env.prod.example .env"
        log_info "  nano .env"
        exit 1
    fi
    log_success ".env file found"
}

# Build Docker images
build() {
    log_info "Building Docker images..."
    docker-compose -f $COMPOSE_FILE build --no-cache
    log_success "Build complete!"
}

# Deploy application
deploy() {
    check_env

    log_info "Starting StayMate deployment..."

    # Pull latest changes if git repo
    if [ -d .git ]; then
        log_info "Pulling latest changes..."
        git pull origin main || git pull origin master || true
    fi

    # Build images
    log_info "Building Docker images..."
    docker-compose -f $COMPOSE_FILE build

    # Start services
    log_info "Starting services..."
    docker-compose -f $COMPOSE_FILE up -d

    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    sleep 30

    # Show status
    status

    log_success "Deployment complete!"
    log_info "Application should be available at your configured domain"
}

# Restart all services
restart() {
    log_info "Restarting all services..."
    docker-compose -f $COMPOSE_FILE restart
    log_success "Restart complete!"
    status
}

# Show logs
logs() {
    local service=$1
    if [ -z "$service" ]; then
        docker-compose -f $COMPOSE_FILE logs -f --tail=100
    else
        docker-compose -f $COMPOSE_FILE logs -f --tail=100 $service
    fi
}

# Show status
status() {
    log_info "Service Status:"
    echo ""
    docker-compose -f $COMPOSE_FILE ps
    echo ""

    log_info "Container Health:"
    echo ""
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep staymate || true
    echo ""

    # Check backend health
    log_info "Checking backend health..."
    if curl -sf http://localhost:8080/actuator/health > /dev/null 2>&1; then
        log_success "Backend is healthy"
    else
        log_warning "Backend health check failed (may still be starting)"
    fi

    # Check nginx health
    log_info "Checking nginx..."
    if curl -sf http://localhost:80/health > /dev/null 2>&1; then
        log_success "Nginx is healthy"
    else
        log_warning "Nginx health check failed"
    fi
}

# Stop all services
stop() {
    log_info "Stopping all services..."
    docker-compose -f $COMPOSE_FILE down
    log_success "All services stopped"
}

# Clean up (remove containers, networks, volumes)
clean() {
    log_warning "This will remove all containers, networks, and volumes!"
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose -f $COMPOSE_FILE down -v --remove-orphans
        docker system prune -f
        log_success "Cleanup complete"
    else
        log_info "Cleanup cancelled"
    fi
}

# Update application
update() {
    log_info "Updating StayMate..."

    # Pull latest changes
    if [ -d .git ]; then
        git pull origin main || git pull origin master
    fi

    # Rebuild only changed images
    docker-compose -f $COMPOSE_FILE build

    # Rolling update
    docker-compose -f $COMPOSE_FILE up -d --no-deps --build server
    sleep 30
    docker-compose -f $COMPOSE_FILE up -d --no-deps --build frontend
    sleep 10
    docker-compose -f $COMPOSE_FILE up -d --no-deps nginx

    log_success "Update complete!"
    status
}

# Database backup
backup_db() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="backup_${timestamp}.sql"

    log_info "Creating database backup..."
    docker exec staymate-db-prod mysqldump -u root -p"${DB_PASSWORD}" ${DB_NAME} > $backup_file
    gzip $backup_file
    log_success "Backup created: ${backup_file}.gz"
}

# Main
case "$1" in
    build)
        build
        ;;
    deploy)
        deploy
        ;;
    restart)
        restart
        ;;
    logs)
        logs $2
        ;;
    status)
        status
        ;;
    stop)
        stop
        ;;
    clean)
        clean
        ;;
    update)
        update
        ;;
    backup)
        backup_db
        ;;
    *)
        echo "StayMate AWS Deployment Script"
        echo ""
        echo "Usage: $0 {build|deploy|restart|logs|status|stop|clean|update|backup}"
        echo ""
        echo "Commands:"
        echo "  build     - Build Docker images only"
        echo "  deploy    - Full deployment (build + start)"
        echo "  restart   - Restart all services"
        echo "  logs      - Show logs (optionally specify service: logs server)"
        echo "  status    - Show service status and health"
        echo "  stop      - Stop all services"
        echo "  clean     - Remove all containers, networks, and volumes"
        echo "  update    - Pull latest code and perform rolling update"
        echo "  backup    - Create database backup"
        exit 1
        ;;
esac
