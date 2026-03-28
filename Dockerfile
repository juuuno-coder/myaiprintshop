# 1. Install dependencies only when needed
FROM oven/bun:latest AS deps
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install

# 2. Rebuild the source code only when needed
FROM oven/bun:latest AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN bun run build

# 3. Production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set correct permissions
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3300
ENV PORT 3300
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
