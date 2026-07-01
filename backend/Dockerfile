FROM node:20-alpine

# Set to production mode
ENV NODE_ENV=production

WORKDIR /app

# Copy dependency files first to utilize Docker layer caching
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy the rest of the application files
# Note: .dockerignore ensures host node_modules is ignored
COPY . .

# Change ownership to the non-root 'node' user
RUN chown -R node:node /app

# Run the app as a non-privileged user
USER node

EXPOSE 5000

CMD ["node", "server.js"]
