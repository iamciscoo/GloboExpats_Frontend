# Dockerfile for Next.js App - Full Development-like Production

# 1. Base image
FROM node:20-alpine AS base
LABEL maintainer="Your Name <you@example.com>"

# Install pnpm globally
RUN npm i -g pnpm

# Set working directory
WORKDIR /app

# 2. Install all dependencies
FROM base AS dependencies
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --no-frozen-lockfile

# 3. Build stage
FROM base AS builder
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# 4. Final production image - KEEP EVERYTHING
FROM base AS production
WORKDIR /app

# Copy EVERYTHING from builder
COPY --from=builder /app/ ./

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user (optional but recommended)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set ownership (optional)
RUN chown -R nextjs:nodejs /app

# Switch to non-root user (optional)
USER nextjs

# Expose port
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]