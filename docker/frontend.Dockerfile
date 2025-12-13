# syntax=docker/dockerfile:1

FROM node:24-bullseye AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
COPY types/package.json types/package.json

RUN npm ci --workspaces --include-workspace-root --ignore-scripts

FROM deps AS builder
WORKDIR /app
COPY . .

ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}
ENV NODE_ENV=production

RUN npm run build:types
RUN npm run build:frontend

FROM nginx:1.27-alpine AS runner
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
