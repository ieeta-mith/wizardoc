# Production build for Next.js app
FROM node:20-alpine AS deps
ARG BUILD_NPM_TOKEN
WORKDIR /app
COPY package*.json ./

RUN test -n "$BUILD_NPM_TOKEN" \
    && printf "@bioinformatics-ua:registry=https://npm.pkg.github.com\n//npm.pkg.github.com/:_authToken=%s\n" "$BUILD_NPM_TOKEN" > .npmrc \
    && npm ci \
    && rm -f .npmrc

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "run", "start"]
