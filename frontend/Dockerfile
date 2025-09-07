# ---- Stage 1: Build ----
FROM node:22.19.0-alpine AS builder
WORKDIR /app
COPY package-lock.json .
COPY frontend/package.json .
RUN npm ci
COPY frontend/ .
RUN npm run build

# ---- Stage 2: Production ----
FROM node:22.19.0-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json .
COPY --from=builder /app/package-lock.json .
RUN npm ci --omit=dev
EXPOSE 3000
CMD ["npm", "start"]