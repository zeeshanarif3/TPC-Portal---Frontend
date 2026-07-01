# --- Stage 1: Build the React App ---
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package*.json ./
RUN npm ci

# Copy source files and build
COPY . .
RUN npm run build

# --- Stage 2: Serve with Nginx ---
FROM nginx:1.25-alpine
WORKDIR /usr/share/nginx/html

# Clear default static files
RUN rm -rf ./*

# Copy built assets from Stage 1
COPY --from=builder /app/dist .

# Copy custom nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
