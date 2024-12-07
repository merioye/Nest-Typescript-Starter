FROM node:20.0.0-alpine as builder

# Create and use non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app

# Copy package files for better caching
COPY package*.json ./

# Install dependencies and build
RUN npm ci && \
    npm cache clean --force && \
    chown -R appuser:appgroup /app

USER appuser
COPY --chown=appuser:appgroup . .
RUN npm run build

FROM node:20.0.0-alpine as production
ENV NODE_ENV=production

# Create and use non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ecosystem.config.json ./
RUN npm ci --omit=dev --ignore-scripts && \
    npm cache clean --force && \
    chown -R appuser:appgroup /app

USER appuser

# Copy built files from builder
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist

EXPOSE 8000
CMD ["npm", "run", "start:prod"]