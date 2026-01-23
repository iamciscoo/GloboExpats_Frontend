# =============================================================================
# DOCKERFILE - EXPAT MARKETPLACE FRONTEND
# =============================================================================
# Multi-stage Docker build for optimal production deployment
# This Dockerfile creates a standalone Next.js application ready for production

# =============================================================================
# STAGE 1: Dependencies Installation
# =============================================================================
FROM node:22-alpine AS deps

# Set working directory
WORKDIR /app

# Install system dependencies for native modules
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies with legacy peer deps to handle React 19 conflicts
RUN npm ci --legacy-peer-deps --only=production && npm cache clean --force

# =============================================================================
# STAGE 2: Build Application
# =============================================================================
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Accept build-time environment arguments from docker-compose
# IMPORTANT: NEXT_PUBLIC_API_URL should be empty - API client endpoints already include /api/v1/ path
# Next.js proxy will rewrite /api/v1/* requests to BACKEND_URL/api/v1/* server-side
ARG NEXT_PUBLIC_API_URL
ARG BACKEND_URL
ARG NEXT_PUBLIC_WS_URL
ARG NEXT_PUBLIC_CDN_URL
ARG NEXT_PUBLIC_ENVIRONMENT
ARG NEXT_PUBLIC_BACKEND_URL

# Expose them to the build (Next.js inlines NEXT_PUBLIC_*)
# NOTE:
# - NEXT_PUBLIC_API_URL should be empty - endpoints already contain /api/v1/ path
# - BACKEND_URL is used SERVER-SIDE by Next.js rewrites in next.config.mjs
# - Browser requests go to /api/v1/* (same origin), Next.js proxies to BACKEND_URL
# - When running BOTH frontend and backend as containers on the SAME Docker network,
#   use the backend container name + its internal port for BACKEND_URL.
#   Example build override:
#     docker build --build-arg BACKEND_URL=http://backend-container:8081 \
#                  -t expat-frontend .
# - For production, set BACKEND_URL to actual backend (e.g., https://api.globoexpats.com)
#   NEXT_PUBLIC_API_URL should always remain empty for proxy pattern
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
  BACKEND_URL=${BACKEND_URL} \
  NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL} \
  NEXT_PUBLIC_CDN_URL=${NEXT_PUBLIC_CDN_URL} \
  NEXT_PUBLIC_ENVIRONMENT=${NEXT_PUBLIC_ENVIRONMENT}

# Copy package files first for better layer caching
COPY package.json package-lock.json* ./

# Install all dependencies (including dev) for building
RUN npm ci --legacy-peer-deps

# Now copy the rest of the source code
COPY . .

# Build the application for production with standalone output
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# =============================================================================
# STAGE 3: Production Runtime
# =============================================================================
FROM node:22-alpine AS runner

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy built application from builder stage
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Set proper permissions
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
# EXPOSE 3000

# Re-declare build args for runtime (these get passed from docker-compose)
ARG NEXT_PUBLIC_API_URL
ARG BACKEND_URL
ARG NEXT_PUBLIC_WS_URL
ARG NEXT_PUBLIC_CDN_URL
ARG NEXT_PUBLIC_ENVIRONMENT
ARG NEXT_PUBLIC_BACKEND_URL

# Set environment variables
ENV NODE_ENV=production \
  PORT=3000 \
  HOSTNAME=0.0.0.0 \
  NEXT_TELEMETRY_DISABLED=1 \
  NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
  BACKEND_URL=${BACKEND_URL} \
  NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL} \
  NEXT_PUBLIC_CDN_URL=${NEXT_PUBLIC_CDN_URL} \
  NEXT_PUBLIC_ENVIRONMENT=${NEXT_PUBLIC_ENVIRONMENT} \
  NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}


# Start the application with dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]

# =============================================================================
# BUILD METADATA
# =============================================================================
LABEL maintainer="Expat Marketplace Team"
LABEL description="Expat Marketplace Frontend - Next.js Application"
LABEL version="1.0.0"
LABEL org.opencontainers.image.title="Expat Frontend"
LABEL org.opencontainers.image.description="Next.js frontend for Expat Marketplace"
LABEL org.opencontainers.image.vendor="Expat Marketplace"
LABEL org.opencontainers.image.licenses="MIT"
