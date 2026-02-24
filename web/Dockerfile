FROM node:20-alpine AS base

ARG BUILD_NPM_TOKEN
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_KEYCLOAK_URL
ARG NEXT_PUBLIC_COMMUNITY_KEY
ARG NEXT_PUBLIC_STANDALONE_MODE

# Install dependencies only when needed
FROM base AS deps
# See https://github.com/nodejs/docker-node/tree/main#nodealpine for details.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager.
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* seed.sh ./
RUN BUILD_NPM_TOKEN=${BUILD_NPM_TOKEN} ./seed.sh

RUN \
    if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
    else echo "Lockfile not found." && exit 1; \
    fi


# Rebuild the source code only when needed
FROM base AS builder
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_KEYCLOAK_URL
ARG NEXT_PUBLIC_COMMUNITY_KEY
ARG NEXT_PUBLIC_STANDALONE_MODE
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_KEYCLOAK_URL=${NEXT_PUBLIC_KEYCLOAK_URL}
ENV NEXT_PUBLIC_COMMUNITY_KEY=${NEXT_PUBLIC_COMMUNITY_KEY}
ENV NEXT_PUBLIC_STANDALONE_MODE=${NEXT_PUBLIC_STANDALONE_MODE}

RUN npm run build

# If using npm comment out above and use below instead
# RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Ensure prerender cache path exists with runtime user permissions.
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Use Next.js standalone output for a smaller runtime image.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
