# syntax=docker/dockerfile:1

# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Cache dependency installation
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Build the application
COPY . .
RUN pnpm build

# ── Final stage ───────────────────────────────────────────────────────────────
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

CMD ["/docker-entrypoint.sh"]
