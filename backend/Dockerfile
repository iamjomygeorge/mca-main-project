FROM node:22.19.0-alpine

# Install wget for the healthcheck
RUN apk add --no-cache wget

WORKDIR /app

COPY package-lock.json .
COPY backend/package.json .
# To install dependencies directly from package-lock.json, deletes any existing node_modules folder, doesn't need to resolve dependency versions.
RUN npm ci --omit=dev
COPY backend/ .
EXPOSE 8080

CMD ["npm", "start"]