FROM node:20.0.0-alpine as builder
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
RUN npm run build

FROM node:20.0.0-alpine as production
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ecosystem.config.json ./
RUN npm ci --ignore-scripts
COPY --from=builder /app/dist ./dist
EXPOSE 8000
CMD ["npm", "run", "start:prod"]