# =============================================================================
# DOCKERFILE - EXPAT MARKETPLACE FRONTEND
# =============================================================================
# Multi-stage build for optimized production deployment
# - Stage 1: Dependencies installation
# - Stage 2: Build the application  
# - Stage 3: Production runtime
# =============================================================================

# Stage 1: Dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package.json first
COPY package.json ./

# Copy lock files if they exist (handle different package managers)
COPY package-loc*.json ./
COPY pnpm-lock.yaml* ./
COPY yarn.lock* ./

# Install dependencies with fallback strategies
RUN if [ -f pnpm-lock.yaml ]; then \
        echo "Using pnpm..." && pnpm install --frozen-lockfile; \
    elif [ -f yarn.lock ]; then \
        echo "Using yarn..." && npm install -g yarn && yarn install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then \
        echo "Using npm with legacy peer deps..." && npm ci --legacy-peer-deps; \
    else \
        echo "No lock file found, using pnpm install..." && pnpm install; \
    fi

# =============================================================================
# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependencies from previous stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Set environment for build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN pnpm run build

# =============================================================================
# Stage 3: Production Runner
FROM node:18-alpine AS runner
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy public assets
COPY --from=builder /app/public ./public

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Expose port
EXPOSE 3000

# Set port environment variable
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Switch to non-root user
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
CMD ["node", "server.js"]
