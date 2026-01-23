#!/bin/bash

# =============================================================================
# DOCKER COMPOSE DEPLOYMENT SCRIPT - EXPAT MARKETPLACE FRONTEND
# =============================================================================
# Comprehensive script for managing the frontend application using Docker Compose

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENV_FILE="${ENV_FILE:-.env.prod}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
SERVICE_NAME="robotics-lab"

# Functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Help function
show_help() {
    echo "Docker Compose Deployment Script for Expat Marketplace Frontend"
    echo ""
    echo "Usage: $0 [OPTIONS] COMMAND"
    echo ""
    echo "Commands:"
    echo "  build         Build the Docker image using docker-compose"
    echo "  up            Start services (uses existing image)"
    echo "  down          Stop and remove containers"
    echo "  start         Start existing services"
    echo "  stop          Stop services"
    echo "  restart       Restart services"
    echo "  logs          Show container logs"
    echo "  shell         Access container shell"
    echo "  clean         Remove containers, images, and volumes"
    echo "  deploy        Full deployment (build + up - use for code changes)"
    echo "  status        Show container status"
    echo "  ps            List running services"
    echo ""
    echo "Options:"
    echo "  -e, --env FILE       Environment file (default: .env.prod)"
    echo "  -f, --file FILE      Compose file (default: docker-compose.yml)"
    echo "  -h, --help           Show this help"
    echo ""
    echo "Environment Files:"
    echo "  .env.dev     Development environment"
    echo "  .env.local   Local development environment"
    echo "  .env.prod    Production environment (default)"
    echo ""
    echo "Examples:"
    echo "  $0 deploy                      # Full deployment with .env.prod (default)"
    echo "  $0 -e .env.dev deploy         # Rebuild & start with dev environment"
    echo "  $0 -e .env.dev up             # Start (no rebuild) with dev environment"
    echo "  $0 -e .env.local up           # Start with local environment"
    echo "  $0 logs                        # Show logs"
    echo "  $0 restart                     # Restart services"
}

# Check Docker installation
check_docker() {
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed or not in PATH"
    fi
    
    if ! docker compose version &> /dev/null; then
        error "Docker Compose is not available. Please install Docker Compose."
    fi
    
    if ! docker info &> /dev/null; then
        error "Cannot connect to Docker daemon. Is Docker running?"
    fi
}

# Check environment file
check_env_file() {
    if [ ! -f "$ENV_FILE" ]; then
        error "Environment file not found: $ENV_FILE"
    fi
    info "Using environment file: $ENV_FILE"
}

# Build Docker image
build_image() {
    log "Building Docker image using docker-compose"
    check_env_file
    
    # Check if docker-compose.yml exists
    if [ ! -f "$COMPOSE_FILE" ]; then
        error "Compose file not found: $COMPOSE_FILE"
    fi
    
    # Build the image
    docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" build || error "Failed to build Docker image"
    
    log "Docker image built successfully"
}

# Start services
start_services() {
    log "Starting services with docker-compose"
    check_env_file
    
    docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d || error "Failed to start services"
    
    log "Services started successfully"
    info "Access the application at: http://localhost:3000"
    info "Use '$0 logs' to view logs"
    info "Use '$0 status' to check status"
}

# Stop services
stop_services() {
    log "Stopping services with docker-compose"
    
    docker compose -f "$COMPOSE_FILE" stop || error "Failed to stop services"
    
    log "Services stopped successfully"
}

# Down services (stop and remove)
down_services() {
    log "Stopping and removing services with docker-compose"
    
    docker compose -f "$COMPOSE_FILE" down || error "Failed to stop and remove services"
    
    log "Services stopped and removed successfully"
}

# Show logs
show_logs() {
    log "Showing logs for services"
    
    docker compose -f "$COMPOSE_FILE" logs -f
}

# Access shell
access_shell() {
    log "Accessing shell for service: $SERVICE_NAME"
    
    docker compose -f "$COMPOSE_FILE" exec "$SERVICE_NAME" /bin/sh || error "Failed to access shell"
}

# Clean up
clean_up() {
    log "Cleaning up containers, images, and volumes"
    
    docker compose -f "$COMPOSE_FILE" down -v --rmi all || error "Failed to clean up"
    
    log "Cleanup completed"
}

# Show status
show_status() {
    log "Service status:"
    
    docker compose -f "$COMPOSE_FILE" ps
    
    echo ""
    info "Resource usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
}

# List services
list_services() {
    log "Listing services:"
    
    docker compose -f "$COMPOSE_FILE" ps
}

# Parse command line arguments
COMMAND=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--env)
            ENV_FILE="$2"
            shift 2
            ;;
        -f|--file)
            COMPOSE_FILE="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        build|up|down|start|stop|restart|logs|shell|clean|deploy|status|ps)
            COMMAND="$1"
            shift
            ;;
        *)
            error "Unknown option: $1. Use -h for help."
            ;;
    esac
done

# Main execution
main() {
    # Check Docker
    check_docker
    
    # Execute command
    case $COMMAND in
        build)
            build_image
            ;;
        up)
            start_services
            ;;
        down)
            down_services
            ;;
        start)
            check_env_file
            log "Starting services"
            docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" start
            ;;
        stop)
            stop_services
            ;;
        restart)
            check_env_file
            log "Restarting services"
            docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" restart
            ;;
        logs)
            show_logs
            ;;
        shell)
            access_shell
            ;;
        clean)
            clean_up
            ;;
        deploy)
            check_env_file
            log "Starting full deployment with environment: $ENV_FILE"
            build_image
            start_services
            info "Deployment completed successfully!"
            info "Application URL: http://localhost:3000"
            ;;
        status)
            show_status
            ;;
        ps)
            list_services
            ;;
        "")
            error "No command specified. Use -h for help."
            ;;
        *)
            error "Unknown command: $COMMAND. Use -h for help."
            ;;
    esac
}

# Run main function
main "$@"

