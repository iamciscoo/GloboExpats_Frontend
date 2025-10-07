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

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Accept build-time overridable environment arguments (provide defaults for local builds)
ARG NEXT_PUBLIC_API_URL=/api/backend/v1
ARG BACKEND_URL=http://10.123.22.21:8081
ARG NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
ARG NEXT_PUBLIC_CDN_URL=
ARG NEXT_PUBLIC_ENVIRONMENT=production
ARG NEXT_PUBLIC_BACKEND_URL=https://dev.globoexpats.com

# Expose them to the build (Next.js inlines NEXT_PUBLIC_*)
# NOTE:
# - When running BOTH frontend and backend as containers on the SAME Docker network,
#   do NOT use 'localhost' here. Use the backend container name + its internal port.
#   Example build override:
#     docker build --build-arg BACKEND_URL=http://globalexpats:8080 \
#                  --build-arg NEXT_PUBLIC_API_URL=/api/backend \
#                  -t expat-frontend .
# - 'localhost' only works when the backend is running directly on the host (not another container).
# - Set NEXT_PUBLIC_API_URL to a relative path (like /api/backend) so browser clients hit the Next.js
#   server, letting the rewrite proxy the request to BACKEND_URL internally.
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
  BACKEND_URL=${BACKEND_URL} \
  NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL} \
  NEXT_PUBLIC_CDN_URL=${NEXT_PUBLIC_CDN_URL} \
  NEXT_PUBLIC_ENVIRONMENT=${NEXT_PUBLIC_ENVIRONMENT} \
  NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}

# Install all dependencies (including dev) for building
RUN npm ci --legacy-peer-deps

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
EXPOSE 3000

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
