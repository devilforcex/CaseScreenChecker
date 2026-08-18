# Multi-Stage Production Dockerfile for CaseScreenChecker
# Optimized for Hostinger VPS & Cloud Run

FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests and lockfile
COPY package.json package-lock.json ./

# Install all dependencies (dev + prod) to build the frontend
RUN npm ci

# Copy source files
COPY . .

# Build Vite frontend (typechecks src/ then bundles)
RUN npm run build

# --- Production Runner Stage ---
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install only production dependencies (includes tsx + zod for running server.ts)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy built frontend assets, server entrypoint, and the source it imports
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/src ./src

EXPOSE 3000

# Run the TypeScript server via tsx (Node 20 cannot execute .ts directly)
CMD ["npx", "tsx", "server.ts"]
