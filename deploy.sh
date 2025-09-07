#!/bin/bash

# =============================================================================
# DEPLOYMENT SCRIPT - EXPAT MARKETPLACE FRONTEND
# =============================================================================
# Automated deployment script for containerized Next.js application
# Supports multiple environments and deployment strategies
# =============================================================================

set -e  # Exit on any error

# =============================================================================
# CONFIGURATION
# =============================================================================

# Default values
PROJECT_NAME="expat-marketplace-frontend"
IMAGE_NAME="expat-frontend"
CONTAINER_NAME="expat-frontend-container"
PORT="3000"
ENVIRONMENT="production"
BUILD_ARGS=""
NETWORK_NAME="expat-network"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# =============================================================================
# FUNCTIONS
# =============================================================================

print_banner() {
    echo -e "${BLUE}"
    echo "========================================================"
    echo "        EXPAT MARKETPLACE - DEPLOYMENT SCRIPT"
    echo "========================================================"
    echo -e "${NC}"
}

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -e, --env ENVIRONMENT     Set environment (development|staging|production) [default: production]"
    echo "  -p, --port PORT          Set port number [default: 3000]"
    echo "  -n, --name NAME          Set container name [default: expat-frontend-container]"
    echo "  -i, --image IMAGE        Set image name [default: expat-frontend]"
    echo "  -t, --tag TAG            Set image tag [default: latest]"
    echo "  --build-args ARGS        Additional build arguments"
    echo "  --no-cache               Build without cache"
    echo "  --pull                   Pull latest base images"
    echo "  --cleanup                Remove old containers and images"
    echo "  --logs                   Show container logs after deployment"
    echo "  --health-check           Perform health check after deployment"
    echo "  -h, --help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                                           # Deploy with default settings"
    echo "  $0 -e staging -p 3001                      # Deploy staging environment on port 3001"
    echo "  $0 --cleanup --no-cache                    # Clean deploy with fresh build"
    echo "  $0 -t v1.2.0 --health-check               # Deploy specific version with health check"
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker is not running. Please start Docker daemon."
        exit 1
    fi
    
    # Check if required files exist
    if [ ! -f "Dockerfile" ]; then
        log_error "Dockerfile not found in current directory."
        exit 1
    fi
    
    if [ ! -f "package.json" ]; then
        log_error "package.json not found in current directory."
        exit 1
    fi
    
    log_info "Prerequisites check passed."
}

cleanup_old_resources() {
    if [ "$CLEANUP" = true ]; then
        log_info "Cleaning up old resources..."
        
        # Stop and remove existing container
        if docker ps -a --format 'table {{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
            log_info "Stopping existing container: $CONTAINER_NAME"
            docker stop $CONTAINER_NAME || true
            docker rm $CONTAINER_NAME || true
        fi
        
        # Remove old images (keep latest 3)
        OLD_IMAGES=$(docker images $IMAGE_NAME --format "{{.ID}}" | tail -n +4)
        if [ ! -z "$OLD_IMAGES" ]; then
            log_info "Removing old images..."
            echo $OLD_IMAGES | xargs docker rmi || true
        fi
        
        # Clean up dangling images
        docker image prune -f
        
        log_info "Cleanup completed."
    fi
}

create_network() {
    # Create Docker network if it doesn't exist
    if ! docker network ls | grep -q $NETWORK_NAME; then
        log_info "Creating Docker network: $NETWORK_NAME"
        docker network create $NETWORK_NAME
    fi
}

build_image() {
    log_info "Building Docker image: $IMAGE_NAME:$TAG"
    
    BUILD_CMD="docker build"
    
    if [ "$NO_CACHE" = true ]; then
        BUILD_CMD="$BUILD_CMD --no-cache"
    fi
    
    if [ "$PULL_LATEST" = true ]; then
        BUILD_CMD="$BUILD_CMD --pull"
    fi
    
    if [ ! -z "$BUILD_ARGS" ]; then
        BUILD_CMD="$BUILD_CMD $BUILD_ARGS"
    fi
    
    BUILD_CMD="$BUILD_CMD -t $IMAGE_NAME:$TAG ."
    
    log_info "Executing: $BUILD_CMD"
    eval $BUILD_CMD
    
    log_info "Image built successfully: $IMAGE_NAME:$TAG"
}

deploy_container() {
    log_info "Deploying container: $CONTAINER_NAME"
    
    # Stop existing container if running
    if docker ps --format 'table {{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        log_info "Stopping existing container..."
        docker stop $CONTAINER_NAME
    fi
    
    # Remove existing container if exists
    if docker ps -a --format 'table {{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        log_info "Removing existing container..."
        docker rm $CONTAINER_NAME
    fi
    
    # Create and start new container
    docker run -d \
        --name $CONTAINER_NAME \
        --network $NETWORK_NAME \
        -p $PORT:3000 \
        -e NODE_ENV=$ENVIRONMENT \
        -e NEXT_TELEMETRY_DISABLED=1 \
        --restart unless-stopped \
        $IMAGE_NAME:$TAG
    
    log_info "Container deployed successfully: $CONTAINER_NAME"
    log_info "Application is running on port: $PORT"
}

health_check() {
    if [ "$HEALTH_CHECK" = true ]; then
        log_info "Performing health check..."
        
        # Wait for container to start
        sleep 5
        
        MAX_ATTEMPTS=30
        ATTEMPT=1
        
        while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
            if curl -f http://localhost:$PORT/api/health &> /dev/null; then
                log_info "Health check passed! Application is healthy."
                return 0
            fi
            
            log_warn "Health check attempt $ATTEMPT/$MAX_ATTEMPTS failed. Retrying in 2 seconds..."
            sleep 2
            ATTEMPT=$((ATTEMPT + 1))
        done
        
        log_error "Health check failed after $MAX_ATTEMPTS attempts."
        log_error "Please check container logs: docker logs $CONTAINER_NAME"
        return 1
    fi
}

show_logs() {
    if [ "$SHOW_LOGS" = true ]; then
        log_info "Showing container logs..."
        docker logs -f $CONTAINER_NAME
    fi
}

show_deployment_info() {
    echo ""
    log_info "Deployment completed successfully!"
    echo ""
    echo "Container Information:"
    echo "  Name: $CONTAINER_NAME"
    echo "  Image: $IMAGE_NAME:$TAG"
    echo "  Port: $PORT"
    echo "  Environment: $ENVIRONMENT"
    echo "  Network: $NETWORK_NAME"
    echo ""
    echo "Useful Commands:"
    echo "  View logs:        docker logs $CONTAINER_NAME"
    echo "  Follow logs:      docker logs -f $CONTAINER_NAME"
    echo "  Stop container:   docker stop $CONTAINER_NAME"
    echo "  Start container:  docker start $CONTAINER_NAME"
    echo "  Remove container: docker rm $CONTAINER_NAME"
    echo ""
    echo "Access your application at: http://localhost:$PORT"
}

# =============================================================================
# MAIN SCRIPT
# =============================================================================

# Default values
TAG="latest"
NO_CACHE=false
PULL_LATEST=false
CLEANUP=false
SHOW_LOGS=false
HEALTH_CHECK=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -p|--port)
            PORT="$2"
            shift 2
            ;;
        -n|--name)
            CONTAINER_NAME="$2"
            shift 2
            ;;
        -i|--image)
            IMAGE_NAME="$2"
            shift 2
            ;;
        -t|--tag)
            TAG="$2"
            shift 2
            ;;
        --build-args)
            BUILD_ARGS="$2"
            shift 2
            ;;
        --no-cache)
            NO_CACHE=true
            shift
            ;;
        --pull)
            PULL_LATEST=true
            shift
            ;;
        --cleanup)
            CLEANUP=true
            shift
            ;;
        --logs)
            SHOW_LOGS=true
            shift
            ;;
        --health-check)
            HEALTH_CHECK=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Main execution
print_banner

log_info "Starting deployment with configuration:"
log_info "  Environment: $ENVIRONMENT"
log_info "  Port: $PORT"
log_info "  Image: $IMAGE_NAME:$TAG"
log_info "  Container: $CONTAINER_NAME"

check_prerequisites
cleanup_old_resources
create_network
build_image
deploy_container

if ! health_check; then
    log_error "Deployment failed health check."
    exit 1
fi

show_deployment_info
show_logs

log_info "Deployment script completed successfully!"
