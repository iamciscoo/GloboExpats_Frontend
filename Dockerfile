# =============================================================================
# DOCKERFILE - EXPAT MARKETPLACE FRONTEND (Production Mode)
# =============================================================================

# Stage 1: Dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package.json and lock files (optional copies won't break if missing)
COPY package.json ./
COPY package-lock.json ./

# Install dependencies (choose based on available lockfile)
RUN if [ -f pnpm-lock.yaml ]; then \
        pnpm install --frozen-lockfile; \
    elif [ -f yarn.lock ]; then \
        npm install -g yarn && yarn install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then \
        npm ci --legacy-peer-deps; \
    else \
        pnpm install; \
    fi

# =============================================================================
# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js app (normal production build)
RUN pnpm run build

# =============================================================================
# Stage 3: Production Runner
FROM node:18-alpine AS runner
WORKDIR /app

# Install curl for health checks and pnpm
RUN apk add --no-cache curl
RUN npm install -g pnpm

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy package.json and next.config.mjs for the start command
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/next.config.mjs ./next.config.mjs

# Copy built application and dependencies from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Ensure proper permissions
RUN chown -R nextjs:nodejs /app

# Expose port
EXPOSE 3000

# Switch to non-root user
USER nextjs

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the Next.js production server
CMD ["pnpm", "start"]
