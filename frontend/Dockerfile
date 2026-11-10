# ==========================================
# Stage 1: Build React Vite Application
# ==========================================
FROM node:18-alpine AS build

WORKDIR /app

# Copy dependency specifications
COPY package*.json ./

# Clean install dependencies
RUN npm ci

# Copy frontend source files
COPY . .

# Build production bundle
RUN npm run build

# ==========================================
# Stage 2: Serve Bundle via Nginx Web Server
# ==========================================
FROM nginx:alpine

# Remove default nginx HTML files
RUN rm -rf /usr/share/nginx/html/*

# Copy Vite build output from builder stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom reverse-proxy and SPA routing configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose web port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
