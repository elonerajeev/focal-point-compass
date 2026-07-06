FROM node:20-alpine AS builder
WORKDIR /app
COPY worker/package*.json ./
RUN npm ci
COPY worker/ .
COPY backend/prisma ./prisma
RUN npx prisma generate && npm run build
RUN npm prune --omit=dev

FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup --system app && adduser --system --ingroup app app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.env ./
COPY --from=builder /app/prisma ./prisma
USER app
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
