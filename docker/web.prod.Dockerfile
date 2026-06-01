FROM node:20-alpine AS base
WORKDIR /app

# Khôi phục module
FROM base AS builder
COPY package*.json ./
COPY web/package*.json ./web/
COPY shared/package*.json ./shared/
RUN npm config set fetch-retry-maxtimeout 600000 && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm ci --no-audit --no-fund

# Build source code
COPY . .
WORKDIR /app/web
RUN npx prisma generate
ENV NODE_OPTIONS="--max-old-space-size=1024"
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV JWT_SECRET="dummy_secret_for_build_step_only_123456"
ENV SKIP_ENV_VALIDATION="true"
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN npm run build

# Chạy app siêu nhẹ
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 3000
ENV HOSTNAME="0.0.0.0"

# Copy các file cần thiết từ builder
COPY --from=builder /app/web/public ./web/public
COPY --from=builder /app/web/.next/standalone ./
COPY --from=builder /app/web/.next/static ./web/.next/static
COPY --from=builder /app/web/prisma ./web/prisma

EXPOSE 3000

# Server Next.js tự động khởi chạy
CMD ["node", "web/server.js"]
