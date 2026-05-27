# Build stage
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

# Set dynamic API URL for build. Since nginx proxies /api and /socket.io, we can configure relative URLs!
# In Docker, we connect relative to current domain
ENV VITE_API_URL=/api
ENV VITE_SOCKET_URL=/

RUN npm run build

# Run stage (serve with Nginx)
FROM nginx:alpine

COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Custom nginx config to handle React Router routing and reverse proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
