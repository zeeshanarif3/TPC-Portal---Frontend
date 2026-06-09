# --- Stage 1: Build & Dependencies ---
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
# Installs everything (needed if you compile TypeScript or use build scripts)
RUN npm install

COPY . .

# --- Stage 2: Production Runner ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
# Installs ONLY production dependencies (ignores devDependencies)
RUN npm ci --omit=dev

# Copy application source code from the builder stage
COPY --from=builder /app .

EXPOSE 5000

CMD ["node", "server.js"]
