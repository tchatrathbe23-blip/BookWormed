# Backend Dockerfile
FROM node:20-alpine
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Ensure db file location is writable; allow mounting external volume
VOLUME ["/app/data"]

ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "server.js"]
