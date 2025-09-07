# Deployment Guide - Expat Marketplace Frontend

This guide provides comprehensive instructions for deploying the Expat Marketplace Frontend using Docker.

## Quick Start

### Prerequisites

- Docker (20.10+)
- Docker Compose (1.28+)
- Git
- 4GB+ available RAM
- 10GB+ available disk space

### 1. Basic Deployment

```bash
# Make deploy script executable (Linux/macOS)
chmod +x deploy.sh

# Deploy with default settings
./deploy.sh

# Or use Docker Compose
docker-compose up -d
```

### 2. Environment-Specific Deployment

```bash
# Development environment
./deploy.sh --env development --port 3001

# Staging environment
./deploy.sh --env staging --port 3002 --tag staging

# Production environment
./deploy.sh --env production --port 3000 --tag v1.0.0 --health-check
```

## Deployment Options

### Using Deploy Script

The `deploy.sh` script provides a comprehensive deployment solution with the following features:

#### Available Options

```bash
./deploy.sh [OPTIONS]

Options:
  -e, --env ENVIRONMENT     Environment (development|staging|production)
  -p, --port PORT          Port number (default: 3000)
  -n, --name NAME          Container name
  -i, --image IMAGE        Image name
  -t, --tag TAG            Image tag
  --build-args ARGS        Additional build arguments
  --no-cache               Build without cache
  --pull                   Pull latest base images
  --cleanup                Remove old containers and images
  --logs                   Show container logs after deployment
  --health-check           Perform health check after deployment
  -h, --help               Show help message
```

#### Examples

```bash
# Clean deployment with health check
./deploy.sh --cleanup --no-cache --health-check

# Staging deployment with custom port
./deploy.sh -e staging -p 3002 -t staging-v1.0.0

# Production deployment with monitoring
./deploy.sh -e production --health-check --logs
```

### Using Docker Compose

Docker Compose provides easier multi-service deployment:

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f frontend

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

#### Environment Variables

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
# Edit .env with your configuration
```

### Manual Docker Commands

For advanced users or CI/CD integration:

```bash
# Build image
docker build -t expat-frontend:latest .

# Run container
docker run -d \
  --name expat-frontend-container \
  -p 3000:3000 \
  -e NODE_ENV=production \
  expat-frontend:latest
```

## Configuration

### Environment Variables

| Variable              | Description                | Default                     |
| --------------------- | -------------------------- | --------------------------- |
| `NODE_ENV`            | Application environment    | `production`                |
| `PORT`                | Port number                | `3000`                      |
| `BACKEND_URL`         | Backend API URL (internal) | `http://backend:8000`       |
| `NEXT_PUBLIC_API_URL` | Public API URL             | `http://localhost:8000/api` |
| `NEXT_PUBLIC_WS_URL`  | WebSocket URL              | `ws://localhost:8000/ws`    |
| `NEXT_PUBLIC_CDN_URL` | CDN URL for assets         | ``                          |
| `ALLOWED_ORIGINS`     | CORS allowed origins       | `*`                         |

### Build Arguments

You can pass build arguments for customization:

```bash
./deploy.sh --build-args "--build-arg NODE_VERSION=18-alpine"
```

## Monitoring and Health Checks

### Health Check Endpoint

The application includes a health check endpoint at `/api/health`:

```bash
# Check application health
curl http://localhost:3000/api/health
```

Response:

```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "version": "1.0.0",
  "memory": {
    "used": 45,
    "total": 128
  }
}
```

### Container Logs

```bash
# View logs
docker logs expat-frontend-container

# Follow logs
docker logs -f expat-frontend-container

# View recent logs
docker logs --tail 100 expat-frontend-container
```

### Resource Monitoring

```bash
# Check container stats
docker stats expat-frontend-container

# Check resource usage
docker exec expat-frontend-container ps aux
```

## Scaling and Load Balancing

### Horizontal Scaling

Run multiple instances behind a load balancer:

```bash
# Start multiple instances
for i in {1..3}; do
  docker run -d \
    --name expat-frontend-$i \
    -p $((3000 + i)):3000 \
    expat-frontend:latest
done
```

### Using Docker Compose Scale

```yaml
# docker-compose.yml
services:
  frontend:
    # ... configuration
    deploy:
      replicas: 3
```

```bash
# Scale to 3 replicas
docker-compose up -d --scale frontend=3
```

## Troubleshooting

### Common Issues

#### Build Failures

```bash
# Clean build with no cache
./deploy.sh --cleanup --no-cache

# Check build logs
docker build --no-cache -t expat-frontend:latest . 2>&1 | tee build.log
```

#### Container Won't Start

```bash
# Check container logs
docker logs expat-frontend-container

# Inspect container configuration
docker inspect expat-frontend-container

# Check if port is in use
netstat -tulpn | grep :3000
```

#### Health Check Failures

```bash
# Manual health check
curl -f http://localhost:3000/api/health

# Check container internal network
docker exec expat-frontend-container curl -f http://localhost:3000/api/health

# Verify environment variables
docker exec expat-frontend-container env | grep NODE_ENV
```

#### Performance Issues

```bash
# Check resource usage
docker stats expat-frontend-container

# Analyze bundle size
ANALYZE=true npm run build

# Check memory leaks
docker exec expat-frontend-container cat /proc/meminfo
```

### Debug Mode

Run container in debug mode:

```bash
docker run -it \
  --name expat-frontend-debug \
  -p 3000:3000 \
  -e NODE_ENV=development \
  expat-frontend:latest \
  /bin/sh
```

## Production Recommendations

### Security

1. **Use specific image tags** instead of `latest`
2. **Set resource limits** to prevent container from consuming all resources
3. **Run as non-root user** (already configured in Dockerfile)
4. **Configure proper CORS** origins
5. **Use HTTPS** in production with proper SSL termination

### Performance

1. **Enable CDN** for static assets
2. **Configure caching** headers properly
3. **Use multi-stage builds** (already implemented)
4. **Optimize bundle size** regularly with bundle analyzer
5. **Monitor memory usage** and set appropriate limits

### Reliability

1. **Configure health checks** (already implemented)
2. **Set restart policies** to `unless-stopped`
3. **Use persistent volumes** for logs if needed
4. **Implement proper logging** strategy
5. **Monitor application metrics**

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy Frontend
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Production
        run: |
          chmod +x deploy.sh
          ./deploy.sh --env production --tag ${{ github.sha }} --health-check
```

### Docker Registry

```bash
# Tag for registry
docker tag expat-frontend:latest your-registry/expat-frontend:latest

# Push to registry
docker push your-registry/expat-frontend:latest

# Deploy from registry
docker run -d \
  --name expat-frontend-container \
  -p 3000:3000 \
  your-registry/expat-frontend:latest
```

## Support

For deployment issues:

1. Check the [troubleshooting section](#troubleshooting)
2. Review container logs
3. Verify environment configuration
4. Test health check endpoint
5. Check resource availability

For development questions, refer to the main project README.md.
