FROM node:20-alpine AS base

FROM base AS deps
ARG BUILD_NPM_TOKEN
# See https://github.com/nodejs/docker-node/tree/main#nodealpine for details.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager.
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN test -n "$BUILD_NPM_TOKEN" \
    && printf "@bioinformatics-ua:registry=https://npm.pkg.github.com\n//npm.pkg.github.com/:_authToken=%s\n" "$BUILD_NPM_TOKEN" > .npmrc \
    && if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
    else echo "Lockfile not found." && exit 1; \
    fi \
    && rm -f .npmrc

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable Next.js telemetry during image build.
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

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
