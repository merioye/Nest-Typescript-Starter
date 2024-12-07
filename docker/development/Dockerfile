FROM node:20.0.0-alpine

# Add non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy package files for better caching
COPY package*.json ./

# Install dependencies using npm ci for consistent builds
RUN npm ci && \
    npm cache clean --force && \
    chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Copy source code
COPY --chown=appuser:appgroup . .

EXPOSE 8000
CMD ["npm", "run", "start:dev"]