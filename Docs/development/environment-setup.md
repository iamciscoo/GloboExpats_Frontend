# Environment Configuration Guide

## Overview

Your Next.js frontend can work with any backend technology by simply changing environment variables. No code changes needed!

## Environment Files

### Development (.env.local)

```bash
# Local development with any backend
NEXT_PUBLIC_API_URL=http://localhost:8000/api
BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_ENV=development
```

### Staging (.env.staging)

```bash
# Staging environment
NEXT_PUBLIC_API_URL=https://api-staging.yourproject.com/api
BACKEND_URL=https://api-staging.yourproject.com
NEXT_PUBLIC_ENV=staging
```

### Production (.env.production)

```bash
# Production environment
NEXT_PUBLIC_API_URL=https://api.yourproject.com/api
BACKEND_URL=https://api.yourproject.com
NEXT_PUBLIC_ENV=production
```

## Backend Technology Examples

### Node.js + Express (Port 3001)

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
BACKEND_URL=http://localhost:3001
```

### Python + Django (Port 8000)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
BACKEND_URL=http://localhost:8000
```

### Python + FastAPI (Port 8000)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
BACKEND_URL=http://localhost:8000
```

### Java + Spring Boot (Port 8080)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api
BACKEND_URL=http://localhost:8080
```

### PHP + Laravel (Port 8000)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
BACKEND_URL=http://localhost:8000
```

### Go + Gin (Port 8080)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api
BACKEND_URL=http://localhost:8080
```

## Deployment Scenarios

### Scenario 1: Same Domain

```bash
# Frontend: https://yourapp.com
# Backend:  https://yourapp.com/api
NEXT_PUBLIC_API_URL=https://yourapp.com/api
BACKEND_URL=https://yourapp.com
```

### Scenario 2: Subdomain

```bash
# Frontend: https://app.yourproject.com
# Backend:  https://api.yourproject.com
NEXT_PUBLIC_API_URL=https://api.yourproject.com/api
BACKEND_URL=https://api.yourproject.com
```

### Scenario 3: Different Domains

```bash
# Frontend: https://yourfrontend.com
# Backend:  https://yourbackend.com
NEXT_PUBLIC_API_URL=https://yourbackend.com/api
BACKEND_URL=https://yourbackend.com
```

### Scenario 4: Cloud Services

```bash
# Frontend: Vercel
# Backend:  AWS/Google Cloud/Azure
NEXT_PUBLIC_API_URL=https://your-api-service.cloud.com/api
BACKEND_URL=https://your-api-service.cloud.com
```

## Team Workflow

### Development Phase

1. **Frontend Team**: Use mock data or local API endpoints
2. **Backend Team**: Develop APIs in their preferred technology
3. **Integration**: Change environment variables to connect

### Testing Phase

```bash
# Test with different backend implementations
npm run dev # Uses .env.local

# Test staging
NEXT_PUBLIC_API_URL=https://staging-api.com/api npm run dev

# Test production
NEXT_PUBLIC_API_URL=https://prod-api.com/api npm run build
```

## Quick Backend Switching

Create npm scripts for different backends:

```json
{
  "scripts": {
    "dev": "next dev",
    "dev:node": "NEXT_PUBLIC_API_URL=http://localhost:3001/api next dev",
    "dev:python": "NEXT_PUBLIC_API_URL=http://localhost:8000/api next dev",
    "dev:java": "NEXT_PUBLIC_API_URL=http://localhost:8080/api next dev",
    "dev:mock": "NEXT_PUBLIC_API_URL=http://localhost:3000/api next dev"
  }
}
```

## Benefits of This Approach

✅ **Technology Independence**: Backend team chooses their stack
✅ **Easy Testing**: Switch between backends instantly  
✅ **Flexible Deployment**: Deploy frontend and backend separately
✅ **Team Autonomy**: Teams work independently
✅ **Scalability**: Scale frontend and backend independently
✅ **Future-Proof**: Easy to migrate backend technology later

## Common Integration Patterns

### Pattern 1: API Gateway

```
Frontend → API Gateway → Multiple Backend Services
```

### Pattern 2: Direct API Calls

```
Frontend → Backend API → Database
```

### Pattern 3: Microservices

```
Frontend → Service A (User Management)
         → Service B (Products)
         → Service C (Orders)
```

The frontend code remains exactly the same in all patterns!
